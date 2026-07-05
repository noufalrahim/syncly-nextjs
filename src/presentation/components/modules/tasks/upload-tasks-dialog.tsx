"use client"

import * as React from "react"
import { Upload, Download, X } from "lucide-react"
import * as xlsx from "xlsx"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/presentation/components/ui/dialog"
import { useDispatch, useWorkspace, useProjectColumns } from "@/presentation/state/workspace-store"

const TEMPLATE_HEADERS = [
  "Title",
  "Description",
  "Priority",
  "Column Name",
  "Labels",
  "Assignees",
  "Due Date",
]

export function UploadTasksDialog() {
  const [open, setOpen] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  
  const { activeProjectId, activeWorkspaceId, projects, users, tags } = useWorkspace()
  const columns = useProjectColumns()
  const dispatch = useDispatch()
  
  const project = projects.find(p => p.id === activeProjectId)

  function handleDownloadTemplate() {
    const ws = xlsx.utils.aoa_to_sheet([TEMPLATE_HEADERS])
    const wb = xlsx.utils.book_new()
    xlsx.utils.book_append_sheet(wb, ws, "Tasks Template")
    xlsx.writeFile(wb, "tasks-upload-template.xlsx")
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !activeProjectId || !activeWorkspaceId || !project) return

    setLoading(true)
    try {
      const buffer = await file.arrayBuffer()
      const wb = xlsx.read(buffer, { type: "array" })
      const wsname = wb.SheetNames[0]
      const ws = wb.Sheets[wsname]
      const data: Record<string, any>[] = xlsx.utils.sheet_to_json(ws)

      if (data.length === 0) {
        toast.error("File is empty")
        return
      }

      let createdCount = 0
      
      // We do this sequentially to allow dependency creation to happen one by one
      for (const row of data) {
        const title = String(row["Title"] || "").trim()
        if (!title) continue
        
        const description = String(row["Description"] || "").trim()
        const priorityRaw = String(row["Priority"] || "medium").trim().toLowerCase()
        const priority = ["low", "medium", "high"].includes(priorityRaw) ? priorityRaw : "medium"
        
        const columnName = String(row["Column Name"] || "").trim()
        const labelsRaw = String(row["Labels"] || "").trim()
        const assigneesRaw = String(row["Assignees"] || "").trim()
        const dueDateRaw = String(row["Due Date"] || "").trim()

        // Handle Column
        let columnId = ""
        let status = "backlog"
        if (columnName) {
          const existingCol = columns.find(c => c.label.toLowerCase() === columnName.toLowerCase())
          if (existingCol) {
            columnId = existingCol.id
            status = existingCol.status || "backlog"
          } else {
            // Create column
            const res = await fetch("/api/columns", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                label: columnName,
                status: "backlog",
                projectId: activeProjectId,
                order: columns.length, // approximation
              }),
            })
            if (res.ok) {
              const saved = await res.json()
              columnId = saved.column._id
              dispatch({ 
                type: "ADD_COLUMN", 
                label: saved.column.label,
                id: saved.column._id
              })
            }
          }
        }
        
        // Handle Labels
        const labelNames = labelsRaw.split(",").map(s => s.trim()).filter(Boolean)
        const finalLabels: string[] = []
        for (const lname of labelNames) {
          const existingTag = tags.find(t => t.name.toLowerCase() === lname.toLowerCase() && t.projectId === activeProjectId)
          if (existingTag) {
            finalLabels.push(existingTag.name)
          } else {
            const res = await fetch("/api/tags", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                name: lname,
                color: "gray",
                projectId: activeProjectId,
                workspaceId: activeWorkspaceId
              }),
            })
            if (res.ok) {
              const saved = await res.json()
              finalLabels.push(saved.tag.name)
              dispatch({ type: "ADD_TAG", tag: { ...saved.tag, id: saved.tag._id } })
            }
          }
        }

        // Handle Assignees
        const assigneeNames = assigneesRaw.split(",").map(s => s.trim()).filter(Boolean)
        const assigneeIds: string[] = []
        for (const aname of assigneeNames) {
          const u = users.find(u => u.name.toLowerCase() === aname.toLowerCase() || u.email?.toLowerCase() === aname.toLowerCase())
          if (u) assigneeIds.push(u.id)
        }

        // Handle Due Date
        let dueDateStr = ""
        if (dueDateRaw) {
          const parsed = new Date(dueDateRaw)
          if (!isNaN(parsed.getTime())) {
            dueDateStr = parsed.toISOString()
          }
        }

        // Create Task
        const taskData = {
          title,
          description,
          status,
          priority,
          assigneeIds,
          assigneeId: assigneeIds[0] || "",
          dueDate: dueDateStr,
          startDate: new Date().toISOString(),
          labels: finalLabels,
          projectId: activeProjectId,
          columnId: columnId || undefined,
          workspaceId: activeWorkspaceId,
          order: 0,
          comments: [],
          history: [
            {
              type: "created",
              message: "created this task via upload",
              authorId: users[0]?.id || "", // placeholder for current user
              createdAt: new Date().toISOString(),
            },
          ],
          references: [],
          attachments: [],
        }

        const taskRes = await fetch("/api/tasks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(taskData),
        })

        if (taskRes.ok) {
          const savedTask = await taskRes.json()
          dispatch({ type: "ADD_TASK", task: { ...savedTask.task, id: savedTask.task._id } })
          createdCount++
        }
      }

      toast.success(`Successfully uploaded ${createdCount} tasks`)
      setOpen(false)
    } catch (error) {
      console.error("Upload error:", error)
      toast.error("Failed to process file")
    } finally {
      setLoading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors text-muted-foreground hover:text-foreground hover:bg-accent/60"
        >
          <Upload className="h-3.5 w-3.5" />
          Upload Tasks
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Upload Tasks</DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <p className="text-sm text-muted-foreground">
            You can upload multiple tasks at once using a CSV or XLSX file. 
            Download the template to see the required format.
          </p>
          
          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={handleDownloadTemplate}
              className="flex items-center justify-center gap-2 w-full py-2 px-4 border border-border rounded-md text-sm font-medium hover:bg-accent hover:text-foreground transition-colors"
            >
              <Download className="h-4 w-4" />
              Download Template
            </button>

            <div className="relative">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv, .xlsx"
                onChange={handleFileUpload}
                disabled={loading}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
              />
              <button
                type="button"
                disabled={loading}
                className="flex items-center justify-center gap-2 w-full py-2 px-4 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
                    Uploading...
                  </span>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    Upload File
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
