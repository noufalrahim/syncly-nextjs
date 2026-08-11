"use client"

import * as React from "react"
import { ChevronDown, ChevronRight, Edit2, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/core/utils"
import { PRIORITY_META, STATUS_META, type TaskStatus } from "@/domain/types"
import { useDispatch, useProjectTasks, useProjectColumns, useWorkspace } from "@/presentation/state/workspace-store"
import { UserAvatar } from "@/presentation/components/user-avatar"
import { Skeleton } from "@/presentation/components/ui/skeleton"
import { getHexColor } from "@/domain/label-colors"

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })
}

export function ListView() {
  const tasks = useProjectTasks()
  const { users, loading } = useWorkspace()
  const projectColumns = useProjectColumns()
  const dispatch = useDispatch()
  const [collapsed, setCollapsed] = React.useState<Record<string, boolean>>({})

  return (
    <div className="flex-1 overflow-auto">
      <div className="px-4 py-2">
        {loading.tasks ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="mb-6 space-y-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-32" />
              </div>
              <div className="space-y-1">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          ))
        ) : (
          projectColumns.map((col) => {
            const items = tasks.filter((t) => t.columnId === col.id)
            const isCollapsed = collapsed[col.id]
            return (
              <section key={col.id} className="mb-1">
                <button
                  type="button"
                  onClick={() =>
                    setCollapsed((c) => ({ ...c, [col.id]: !c[col.id] }))
                  }
                  className="w-full flex items-center gap-2 px-2 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground rounded transition-colors"
                >
                  {isCollapsed ? (
                    <ChevronRight className="h-3.5 w-3.5" />
                  ) : (
                    <ChevronDown className="h-3.5 w-3.5" />
                  )}
                  <span className="h-2 w-2 rounded-full shadow-sm" style={{ backgroundColor: getHexColor(col.color) }} />
                  <span className="text-foreground">{col.label}</span>
                  <span className="text-xs font-normal text-muted-foreground">
                    {items.length}
                  </span>
                </button>
                {!isCollapsed && (
                  <ul className="border-t border-border">
                    {items.map((t) => {
                      const assignee = users.find((u) => u.id === t.assigneeId)
                      const priority = PRIORITY_META[t.priority] || PRIORITY_META.medium
                      return (
                        <li
                          key={t.id}
                          onClick={() =>
                            dispatch({ type: "SELECT_TASK", taskId: t.id })
                          }
                          className="group flex items-center gap-3 px-3 py-2.5 hover:bg-accent/40 cursor-pointer border-b border-border last:border-b-0 transition-colors"
                        >
                          <span className="h-1.5 w-1.5 rounded-full shadow-sm" style={{ backgroundColor: getHexColor(col.color) }} />
                          <span className="text-sm font-medium flex-1 truncate">{t.title}</span>
                          <span
                            className={cn(
                              "inline-flex items-center text-[11px] font-medium px-1.5 py-0.5 rounded border",
                              priority.badge,
                            )}
                          >
                            {priority.label}
                          </span>
                          <span className="text-xs text-muted-foreground w-20 text-right">
                            {formatDate(t.dueDate)}
                          </span>
                          <UserAvatar user={assignee} size="xs" />
                          
                          {/* Hover Actions */}
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                dispatch({ type: "SELECT_TASK", taskId: t.id })
                              }}
                              className="h-7 w-7 inline-flex items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                              aria-label="Edit task"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={async (e) => {
                                e.stopPropagation()
                                dispatch({ type: "DELETE_TASK", taskId: t.id })
                                try {
                                  const res = await fetch(`/api/tasks?taskId=${t.id}`, { method: "DELETE" })
                                  if (res.ok) {
                                    toast.success("Task deleted successfully")
                                  } else {
                                    toast.error("Failed to delete task")
                                  }
                                } catch (err) {
                                  console.error("Failed to delete task", err)
                                  toast.error("Failed to delete task")
                                }
                              }}
                              className="h-7 w-7 inline-flex items-center justify-center rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                              aria-label="Delete task"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </li>
                      )
                    })}
                    {items.length === 0 && (
                      <li className="px-2 py-3 text-xs text-muted-foreground italic">
                        No tasks
                      </li>
                    )}
                  </ul>
                )}
              </section>
            )
          })
        )}
      </div>
    </div>
  )
}
