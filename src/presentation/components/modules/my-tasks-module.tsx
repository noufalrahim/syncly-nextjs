"use client"

import * as React from "react"
import { useWorkspace, useDispatch } from "@/presentation/state/workspace-store"
import { Input } from "@/presentation/components/ui/input"
import { PRIORITY_META, STATUS_META, type Task, type TaskStatus } from "@/domain/types"
import { CheckCircle2, ChevronDown, ChevronRight, Circle, Inbox, Search } from "lucide-react"
import { cn } from "@/core/utils"

type Section = {
  id: string
  label: string
  statuses: TaskStatus[]
  reopenTo?: TaskStatus
}

const SECTIONS: Section[] = [
  { id: "todo", label: "To Do", statuses: ["backlog", "on-hold"] },
  { id: "in-progress", label: "In Progress", statuses: ["in-progress"] },
  { id: "completed", label: "Completed", statuses: ["done", "cancelled"], reopenTo: "in-progress" },
]

function formatDueDate(iso: string) {
  const due = new Date(iso)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const dueDay = new Date(due)
  dueDay.setHours(0, 0, 0, 0)
  const diffDays = Math.round((dueDay.getTime() - today.getTime()) / 86400000)
  if (diffDays === 0) return "Today"
  if (diffDays === 1) return "Tomorrow"
  if (diffDays === -1) return "Yesterday"
  return due.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    ...(due.getFullYear() !== today.getFullYear() ? { year: "numeric" } : {}),
  })
}

function isOverdue(t: Task) {
  if (t.status === "done" || t.status === "cancelled") return false
  const due = new Date(t.dueDate)
  due.setHours(23, 59, 59, 999)
  return due.getTime() < Date.now()
}

export function MyTasksModule() {
  const { tasks, projects, currentUserId } = useWorkspace()
  const dispatch = useDispatch()
  const [query, setQuery] = React.useState("")
  const [collapsed, setCollapsed] = React.useState<Record<string, boolean>>({})

  const myTasks = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    return tasks
      .filter((t) => t.assigneeId === currentUserId)
      .filter((t) => !q || t.title.toLowerCase().includes(q))
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
  }, [tasks, currentUserId, query])

  const openCount = myTasks.filter((t) => t.status !== "done" && t.status !== "cancelled").length
  const overdueCount = myTasks.filter(isOverdue).length

  const getProject = (projId: string) => {
    const proj = projects.find((p) => p.id === projId)
    return proj ? { name: proj.name, emoji: proj.emoji } : { name: "General", emoji: "📁" }
  }

  function setStatus(t: Task, status: TaskStatus) {
    dispatch({ type: "UPDATE_TASK", taskId: t.id, patch: { status } })
    fetch("/api/tasks", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ taskId: t.id, patch: { status } }),
    }).catch((err) => console.error("Failed to persist task status", err))
  }

  return (
    <div className="flex-grow flex flex-col min-h-0 bg-background overflow-hidden">
      <div className="flex-shrink-0 px-8 py-5 border-b border-border/40 flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold tracking-tight">My Tasks</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {openCount} open task{openCount === 1 ? "" : "s"}
            {overdueCount > 0 && (
              <span className="text-red-400"> · {overdueCount} overdue</span>
            )}
          </p>
        </div>
        <div className="relative w-64">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tasks..."
            className="h-8 pl-8 text-sm"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-8 py-6">
          {myTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                <Inbox className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium">
                {query ? "No tasks match your search" : "No tasks assigned to you"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {query ? "Try a different search term." : "Tasks assigned to you across all projects will show up here."}
              </p>
            </div>
          ) : (
            SECTIONS.map((section) => {
              const items = myTasks.filter((t) => section.statuses.includes(t.status))
              const isCollapsed = collapsed[section.id]
              const isCompletedSection = section.id === "completed"
              return (
                <section key={section.id} className="mb-6">
                  <button
                    type="button"
                    onClick={() => setCollapsed((c) => ({ ...c, [section.id]: !c[section.id] }))}
                    className="w-full flex items-center gap-2 px-1 py-2 text-sm font-semibold text-foreground hover:text-foreground rounded transition-colors"
                  >
                    {isCollapsed ? (
                      <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                    )}
                    <span>{section.label}</span>
                    <span className="text-xs font-normal text-muted-foreground">{items.length}</span>
                  </button>

                  {!isCollapsed && (
                    <ul className="border border-border rounded-lg overflow-hidden divide-y divide-border bg-card/30">
                      {items.length === 0 ? (
                        <li className="px-4 py-4 text-xs text-muted-foreground italic">
                          No tasks
                        </li>
                      ) : (
                        items.map((t) => {
                          const proj = getProject(t.projectId)
                          const priority = PRIORITY_META[t.priority] || PRIORITY_META.medium
                          const status = STATUS_META[t.status]
                          const overdue = isOverdue(t)
                          return (
                            <li
                              key={t.id}
                              onClick={() => dispatch({ type: "SELECT_TASK", taskId: t.id })}
                              className={cn(
                                "group flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-accent/40 transition-colors",
                                isCompletedSection && "opacity-60 hover:opacity-100",
                              )}
                            >
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setStatus(t, isCompletedSection ? (section.reopenTo ?? "in-progress") : "done")
                                }}
                                className={cn(
                                  "shrink-0 transition-colors cursor-pointer",
                                  isCompletedSection
                                    ? "text-emerald-500 hover:text-muted-foreground"
                                    : "text-muted-foreground/40 hover:text-emerald-500",
                                )}
                                aria-label={isCompletedSection ? "Reopen task" : "Mark as done"}
                              >
                                {isCompletedSection ? (
                                  <CheckCircle2 className="h-4.5 w-4.5" />
                                ) : (
                                  <Circle className="h-4.5 w-4.5" />
                                )}
                              </button>

                              <span
                                className={cn(
                                  "text-sm font-medium flex-1 truncate",
                                  isCompletedSection && "line-through text-muted-foreground",
                                )}
                              >
                                {t.title}
                              </span>

                              <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-muted-foreground shrink-0 max-w-[160px]">
                                <span>{proj.emoji}</span>
                                <span className="truncate">{proj.name}</span>
                              </span>

                              {!isCompletedSection && (
                                <span
                                  className={cn(
                                    "hidden md:inline-flex items-center text-[11px] font-medium px-1.5 py-0.5 rounded border shrink-0",
                                    priority.badge,
                                  )}
                                >
                                  {priority.label}
                                </span>
                              )}

                              <span
                                className={cn(
                                  "inline-flex items-center text-[11px] font-medium px-1.5 py-0.5 rounded border shrink-0",
                                  status.badge,
                                )}
                              >
                                {status.label}
                              </span>

                              <span
                                className={cn(
                                  "text-xs w-20 text-right shrink-0",
                                  overdue ? "text-red-400 font-medium" : "text-muted-foreground",
                                )}
                              >
                                {formatDueDate(t.dueDate)}
                              </span>
                            </li>
                          )
                        })
                      )}
                    </ul>
                  )}
                </section>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
