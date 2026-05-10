"use client"

import * as React from "react"
import { ChevronDown, ChevronRight } from "lucide-react"
import { cn } from "@/core/utils"
import { PRIORITY_META, STATUS_META, type TaskStatus } from "@/domain/types"
import { useDispatch, useProjectTasks, useWorkspace } from "@/presentation/state/workspace-store"
import { UserAvatar } from "@/presentation/components/user-avatar"

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })
}

const ORDER: TaskStatus[] = ["in-progress", "backlog", "on-hold", "done", "cancelled"]

export function ListView() {
  const tasks = useProjectTasks()
  const { users } = useWorkspace()
  const dispatch = useDispatch()
  const [collapsed, setCollapsed] = React.useState<Record<string, boolean>>({})

  const grouped = React.useMemo(() => {
    const g: Record<TaskStatus, typeof tasks> = {
      cancelled: [],
      "on-hold": [],
      backlog: [],
      "in-progress": [],
      done: [],
    }
    for (const t of tasks) g[t.status].push(t)
    return g
  }, [tasks])

  return (
    <div className="flex-1 overflow-auto">
      <div className="px-4 py-2">
        {ORDER.map((status) => {
          const items = grouped[status]
          const meta = STATUS_META[status]
          const isCollapsed = collapsed[status]
          return (
            <section key={status} className="mb-1">
              <button
                type="button"
                onClick={() =>
                  setCollapsed((c) => ({ ...c, [status]: !c[status] }))
                }
                className="w-full flex items-center gap-2 px-2 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground rounded transition-colors"
              >
                {isCollapsed ? (
                  <ChevronRight className="h-3.5 w-3.5" />
                ) : (
                  <ChevronDown className="h-3.5 w-3.5" />
                )}
                <span className={cn("h-2 w-2 rounded-full", meta.dot)} />
                <span className="text-foreground">{meta.label}</span>
                <span className="text-xs font-normal text-muted-foreground">
                  {items.length}
                </span>
              </button>
              {!isCollapsed && (
                <ul className="border-t border-border">
                  {items.map((t) => {
                    const assignee = users.find((u) => u.id === t.assigneeId)
                    const priority = PRIORITY_META[t.priority]
                    return (
                      <li
                        key={t.id}
                        onClick={() =>
                          dispatch({ type: "SELECT_TASK", taskId: t.id })
                        }
                        className="flex items-center gap-3 px-2 py-2 hover:bg-accent/40 cursor-pointer border-b border-border last:border-b-0 transition-colors"
                      >
                        <span className={cn("h-1.5 w-1.5 rounded-full", meta.dot)} />
                        <span className="text-sm flex-1 truncate">{t.title}</span>
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
        })}
      </div>
    </div>
  )
}
