"use client"

import * as React from "react"
import {
  FileArchive,
  FileImage,
  FileSpreadsheet,
  FileText,
  FileVideo,
  Upload,
  Folder,
  FolderPlus,
  FilePlus,
  ChevronRight,
  Trash2,
  Loader2,
  FolderOpen
} from "lucide-react"
import { cn } from "@/core/utils"
import type { Document } from "@/domain/types"
import { useDispatch, useWorkspace, useProjectDocuments } from "@/presentation/state/workspace-store"
import { UserAvatar } from "@/presentation/components/user-avatar"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/presentation/components/ui/dialog"
import { Button } from "@/presentation/components/ui/button"
import { Input } from "@/presentation/components/ui/input"
import { Label } from "@/presentation/components/ui/label"

const ICONS: Record<string, React.ReactNode> = {
  folder: <Folder className="h-5 w-5" />,
  pdf: <FileText className="h-5 w-5" />,
  doc: <FileText className="h-5 w-5" />,
  sheet: <FileSpreadsheet className="h-5 w-5" />,
  image: <FileImage className="h-5 w-5" />,
  video: <FileVideo className="h-5 w-5" />,
  zip: <FileArchive className="h-5 w-5" />,
}

const TYPE_BG: Record<string, string> = {
  folder: "bg-blue-500/10 text-blue-400",
  pdf: "bg-red-500/10 text-red-400",
  doc: "bg-indigo-500/10 text-indigo-400",
  sheet: "bg-emerald-500/10 text-emerald-400",
  image: "bg-amber-500/10 text-amber-400",
  video: "bg-rose-500/10 text-rose-400",
  zip: "bg-zinc-500/10 text-zinc-300",
}

function formatRelative(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

export function DocumentsModule() {
  const { users, activeWorkspaceId, activeProjectId } = useWorkspace()
  const documents = useProjectDocuments()
  const dispatch = useDispatch()

  const [currentFolderId, setCurrentFolderId] = React.useState<string | null>(null)
  
  const [newFolderOpen, setNewFolderOpen] = React.useState(false)
  const [newFolderName, setNewFolderName] = React.useState("")

  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const [previewFile, setPreviewFile] = React.useState<Document | null>(null)

  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
  const [documentToDelete, setDocumentToDelete] = React.useState<Document | null>(null)

  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [isDeleting, setIsDeleting] = React.useState(false)

  // Reset folder navigation when switching projects
  React.useEffect(() => {
    setCurrentFolderId(null)
    setPreviewFile(null)
  }, [activeProjectId])

  const sortedItems = React.useMemo(() => {
    const items = documents.filter((d) => (d.parentId || null) === currentFolderId)
    return [...items].sort((a, b) => {
      if (a.type === "folder" && b.type !== "folder") return -1
      if (a.type !== "folder" && b.type === "folder") return 1
      return a.name.localeCompare(b.name)
    })
  }, [documents, currentFolderId])

  const breadcrumbs = React.useMemo(() => {
    const crumbs: { id: string | null; name: string }[] = [{ id: null, name: "Drive" }]
    let currentId = currentFolderId
    const path: { id: string | null; name: string }[] = []
    while (currentId) {
      const folder = documents.find((d) => d.id === currentId)
      if (!folder) break
      path.unshift({ id: folder.id, name: folder.name })
      currentId = folder.parentId || null
    }
    return [...crumbs, ...path]
  }, [documents, currentFolderId])

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newFolderName.trim() || !activeWorkspaceId || !activeProjectId || isSubmitting) return

    setIsSubmitting(true)
    try {
      const res = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newFolderName.trim(),
          type: "folder",
          parentId: currentFolderId,
          workspaceId: activeWorkspaceId,
          projectId: activeProjectId,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        dispatch({
          type: "ADD_DOCUMENT",
          document: {
            id: data.document._id,
            name: data.document.name,
            type: data.document.type,
            size: data.document.size,
            parentId: data.document.parentId,
            workspaceId: data.document.workspaceId,
            projectId: data.document.projectId,
            ownerId: data.document.ownerId,
            updatedAt: data.document.updatedAt || data.document.createdAt,
          },
        })
        setNewFolderName("")
        setNewFolderOpen(false)
      }
    } catch (error) {
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }
  const handleDownload = (doc: Document) => {
    const element = document.createElement("a")
    const file = new Blob(["Mock file contents of " + doc.name], { type: "text/plain" })
    element.href = URL.createObjectURL(file)
    element.download = doc.name
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !activeWorkspaceId || !activeProjectId || isSubmitting) return

    setIsSubmitting(true)
    let sizeStr = "0 KB"
    if (file.size > 1024 * 1024) {
      sizeStr = `${(file.size / (1024 * 1024)).toFixed(1)} MB`
    } else {
      sizeStr = `${(file.size / 1024).toFixed(0)} KB`
    }

    const ext = file.name.split(".").pop()?.toLowerCase() || ""
    let type = "doc"
    if (ext === "pdf") {
      type = "pdf"
    } else if (["doc", "docx", "txt", "rtf"].includes(ext)) {
      type = "doc"
    } else if (["xls", "xlsx", "csv"].includes(ext)) {
      type = "sheet"
    } else if (["jpg", "jpeg", "png", "gif", "svg", "webp"].includes(ext)) {
      type = "image"
    } else if (["mp4", "mov", "avi", "mkv"].includes(ext)) {
      type = "video"
    } else if (["zip", "tar", "gz", "rar"].includes(ext)) {
      type = "zip"
    }

    try {
      const res = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: file.name,
          type,
          parentId: currentFolderId,
          workspaceId: activeWorkspaceId,
          projectId: activeProjectId,
          size: sizeStr,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        dispatch({
          type: "ADD_DOCUMENT",
          document: {
            id: data.document._id,
            name: data.document.name,
            type: data.document.type,
            size: data.document.size,
            parentId: data.document.parentId,
            workspaceId: data.document.workspaceId,
            projectId: data.document.projectId,
            ownerId: data.document.ownerId,
            updatedAt: data.document.updatedAt || data.document.createdAt,
          },
        })
      }
    } catch (error) {
      console.error(error)
    } finally {
      setIsSubmitting(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleDelete = async () => {
    if (!documentToDelete || isDeleting) return

    setIsDeleting(true)
    try {
      const res = await fetch(`/api/documents?documentId=${documentToDelete.id}`, {
        method: "DELETE",
      })

      if (res.ok) {
        dispatch({ type: "DELETE_DOCUMENT", documentId: documentToDelete.id })
        setDeleteDialogOpen(false)
        setDocumentToDelete(null)
      }
    } catch (error) {
      console.error(error)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="flex-1 overflow-auto bg-background flex flex-col">
      <div className="px-6 py-4 flex items-center justify-between border-b border-border bg-card/30 backdrop-blur-md">
        <div>
          <h2 className="text-base font-semibold">Drive</h2>
          <p className="text-xs text-muted-foreground">
            Manage your assets, files, and folders
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setNewFolderOpen(true)}
            variant="outline"
            size="sm"
            className="gap-1.5 h-9"
          >
            <FolderPlus className="h-4 w-4" />
            New Folder
          </Button>
          <Button
            onClick={() => fileInputRef.current?.click()}
            size="sm"
            className="gap-1.5 h-9 bg-primary hover:opacity-90 shadow-lg shadow-primary/20"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            New File
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
      </div>

      <div className="px-6 py-3 border-b border-border bg-muted/20 flex items-center gap-1 text-sm text-muted-foreground">
        {breadcrumbs.map((crumb, idx) => (
          <React.Fragment key={crumb.id || "root"}>
            {idx > 0 && <ChevronRight className="h-3.5 w-3.5 opacity-60" />}
            <button
              onClick={() => setCurrentFolderId(crumb.id)}
              className={cn(
                "hover:text-foreground hover:underline transition-colors font-medium",
                idx === breadcrumbs.length - 1 && "text-foreground font-bold pointer-events-none"
              )}
            >
              {crumb.name}
            </button>
          </React.Fragment>
        ))}
      </div>

      <div className="p-6 flex-1">
        {sortedItems.length === 0 ? (
          <div className="h-[40vh] flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl p-8 max-w-2xl mx-auto text-center mt-6">
            <div className="h-12 w-12 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground mb-4">
              <FolderOpen className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-semibold text-foreground">Empty Folder</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-xs">
              No files or subfolders found inside this directory. Create one to get started.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {sortedItems.map((d) => {
              const owner = users.find((u) => u.id === d.ownerId)
              return (
                <div
                  key={d.id}
                  onClick={() => {
                    if (d.type === "folder") {
                      setCurrentFolderId(d.id)
                    } else {
                      setPreviewFile(d)
                    }
                  }}
                  className="group bg-card border border-border rounded-xl p-3 hover:border-primary/40 hover:shadow-lg hover:shadow-black/10 transition-all duration-200 cursor-pointer relative"
                >
                  <div
                    className={cn(
                      "h-28 rounded-lg flex items-center justify-center mb-3 transition-colors",
                      TYPE_BG[d.type]
                    )}
                  >
                    {ICONS[d.type] || <FileText className="h-5 w-5" />}
                  </div>
                  <div className="text-sm font-semibold truncate pr-6">{d.name}</div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="text-[11px] text-muted-foreground">
                      {d.type === "folder" ? "Folder" : d.size} · {formatRelative(d.updatedAt)}
                    </div>
                    <UserAvatar user={owner} size="xs" />
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setDocumentToDelete(d)
                      setDeleteDialogOpen(true)
                    }}
                    className="absolute top-2 right-2 h-7 w-7 rounded-lg bg-card/80 border border-border flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all shadow-sm"
                    aria-label="Delete document"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <Dialog open={newFolderOpen} onOpenChange={setNewFolderOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <form onSubmit={handleCreateFolder}>
            <DialogHeader>
              <DialogTitle>New Folder</DialogTitle>
              <DialogDescription className="sr-only">Enter folder name</DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-2">
              <Label htmlFor="folder-name" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Folder Name</Label>
              <Input
                id="folder-name"
                placeholder="e.g. Design assets"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                autoFocus
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setNewFolderOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={!newFolderName.trim() || isSubmitting}>
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>



      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete {documentToDelete?.type === "folder" ? "Folder" : "File"}</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <span className="font-semibold text-foreground">"{documentToDelete?.name}"</span>? 
              {documentToDelete?.type === "folder" && " All files and subfolders inside it will be permanently deleted as well."} This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : null}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!previewFile} onOpenChange={(open) => !open && setPreviewFile(null)}>
        <DialogContent className="sm:max-w-[650px] p-0 overflow-hidden bg-card border-border">
          {previewFile && (
            <div className="flex flex-col h-[520px]">
              <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/20">
                <div className="min-w-0 flex-1">
                  <DialogTitle className="text-base font-semibold truncate">{previewFile.name}</DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                    {previewFile.type.toUpperCase()} · {previewFile.size}
                  </DialogDescription>
                </div>
                <Button
                  onClick={() => handleDownload(previewFile)}
                  size="sm"
                  className="ml-4 gap-1.5 h-8 bg-primary hover:opacity-90 shadow-md shadow-primary/10"
                >
                  <Upload className="h-3.5 w-3.5 rotate-180" />
                  Download
                </Button>
              </div>

              <div className="flex-1 min-h-0 bg-background flex items-center justify-center p-6 overflow-y-auto">
                {previewFile.type === "image" && (
                  <div className="flex flex-col items-center justify-center w-full h-full rounded-lg border border-border/40 bg-accent/10 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/20 opacity-50" />
                    <div className="z-10 flex flex-col items-center justify-center text-center p-8">
                      <div className="h-16 w-16 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-4 border border-amber-500/20 shadow-lg shadow-amber-500/5">
                        <FileImage className="h-8 w-8" />
                      </div>
                      <div className="text-sm font-semibold text-foreground mb-1">{previewFile.name}</div>
                      <div className="text-xs text-muted-foreground mb-4">Resolution: 1920 × 1080 pixels</div>
                      <div className="h-32 w-64 bg-card/60 border border-border/60 rounded-lg flex items-center justify-center text-xs text-muted-foreground shadow-sm">
                        [ Image Render Placeholder ]
                      </div>
                    </div>
                  </div>
                )}

                {previewFile.type === "pdf" && (
                  <div className="flex flex-col w-full h-full rounded-lg border border-border bg-card overflow-hidden">
                    <div className="bg-muted/40 border-b border-border px-3 py-2 flex items-center justify-between text-xs text-muted-foreground">
                      <span>Document Viewer</span>
                      <span>Page 1 of 3</span>
                    </div>
                    <div className="flex-1 p-6 space-y-4 font-serif text-sm leading-relaxed text-foreground overflow-y-auto select-none opacity-80">
                      <div className="h-6 bg-muted/60 rounded w-3/4 mb-6" />
                      <p>This is a structured PDF file preview representing the specification document for the current project. Key goals, operational constraints, and architectural boundaries are defined herein for implementation.</p>
                      <p>Mongoose schemas are created as defined in design briefs. The workspace state store integrates the collections and endpoints in a decoupled, testable layer utilizing React context dispatch actions.</p>
                    </div>
                  </div>
                )}

                {previewFile.type === "sheet" && (
                  <div className="flex flex-col w-full h-full rounded-lg border border-border bg-card overflow-hidden">
                    <div className="bg-muted/40 border-b border-border px-3 py-2 flex items-center justify-between text-xs text-muted-foreground font-mono">
                      <span>Sheet1</span>
                      <span>15 rows × 6 columns</span>
                    </div>
                    <div className="flex-1 overflow-auto">
                      <table className="w-full text-xs text-left border-collapse">
                        <thead>
                          <tr className="bg-muted/20 border-b border-border text-muted-foreground font-medium">
                            <th className="p-2 border-r border-border w-8 text-center bg-muted/10"></th>
                            <th className="p-2 border-r border-border">A</th>
                            <th className="p-2 border-r border-border">B</th>
                            <th className="p-2 border-r border-border">C</th>
                            <th className="p-2 border-r border-border">D</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[1, 2, 3, 4, 5, 6].map((row) => (
                            <tr key={row} className="border-b border-border hover:bg-accent/10">
                              <td className="p-2 border-r border-border text-center bg-muted/10 font-mono text-muted-foreground">{row}</td>
                              <td className="p-2 border-r border-border font-medium">Item_{row}</td>
                              <td className="p-2 border-r border-border text-emerald-500 font-medium">${(row * 125.5).toFixed(2)}</td>
                              <td className="p-2 border-r border-border text-muted-foreground">Active</td>
                              <td className="p-2 border-r border-border text-muted-foreground">Oriental Corp</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {previewFile.type === "doc" && (
                  <div className="flex flex-col w-full h-full rounded-lg border border-border bg-card overflow-hidden">
                    <div className="bg-muted/40 border-b border-border px-4 py-2 flex items-center justify-between text-xs text-muted-foreground">
                      <span>Word Document</span>
                      <span>Word count: 184 words</span>
                    </div>
                    <div className="flex-1 p-6 text-sm leading-relaxed text-foreground overflow-y-auto space-y-3">
                      <h3 className="text-base font-bold mb-2">Project Brief & Guidelines</h3>
                      <p>We are pair programming with the team to solve critical codebase changes. Ensure all code modules compile clean. Do not add comments or documentation updates that contaminate clean code guidelines.</p>
                      <p>File system storage is simulated inside the MongoDB backend with complete breadcrumbs path navigation. Let folders delete recursively for consistency.</p>
                    </div>
                  </div>
                )}

                {previewFile.type === "video" && (
                  <div className="flex flex-col w-full h-full rounded-lg border border-border bg-black overflow-hidden relative group justify-center items-center">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-4 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      <div className="flex items-center justify-between text-xs text-white">
                        <span>0:00 / 0:45</span>
                        <span>1080p HD</span>
                      </div>
                      <div className="w-full bg-white/20 h-1 rounded-full mt-2 overflow-hidden">
                        <div className="bg-primary w-1/4 h-full" />
                      </div>
                    </div>
                    <div className="flex flex-col items-center justify-center text-center p-8 z-0">
                      <div className="h-14 w-14 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-3 border border-primary/20">
                        <FileVideo className="h-6 w-6" />
                      </div>
                      <span className="text-xs text-muted-foreground">[ Media Video Player Preview ]</span>
                    </div>
                  </div>
                )}

                {previewFile.type === "zip" && (
                  <div className="flex flex-col items-center justify-center text-center p-8 max-w-sm">
                    <div className="h-16 w-16 rounded-2xl bg-zinc-500/10 text-zinc-400 flex items-center justify-center mb-4 border border-zinc-500/20 shadow-md">
                      <FileArchive className="h-8 w-8" />
                    </div>
                    <h4 className="text-sm font-semibold text-foreground mb-1">{previewFile.name}</h4>
                    <p className="text-xs text-muted-foreground mb-6">
                      Preview is not available for compressed zip files. Please download the file to inspect its contents.
                    </p>
                    <Button onClick={() => handleDownload(previewFile)} className="gap-1.5 px-6">
                      <Upload className="h-4 w-4 rotate-180" />
                      Download Archive
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
