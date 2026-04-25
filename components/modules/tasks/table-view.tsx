"use client"

import { cn } from "@/lib/utils"
import { labelDotClass } from "@/lib/label-colors"
import { PRIORITY_META, STATUS_META } from "@/lib/types"
import { useDispatch, useProjectTasks, useWorkspace } from "@/lib/workspace-store"
import { UserAvatar } from "@/components/user-avatar"

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })
}

export function TableView() {
  const tasks = useProjectTasks()
  const { users, labels, projects } = useWorkspace()
  const dispatch = useDispatch()

  return (
    <div className="flex-1 overflow-auto p-4">
      <div className="rounded-lg border border-border overflow-hidden bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/30 text-muted-foreground text-xs uppercase tracking-wide">
            <tr>
              <th className="text-left font-medium px-4 py-2.5">Task</th>
              <th className="text-left font-medium px-3 py-2.5">Status</th>
              <th className="text-left font-medium px-3 py-2.5">Priority</th>
              <th className="text-left font-medium px-3 py-2.5">Assignee</th>
              <th className="text-left font-medium px-3 py-2.5">Project</th>
              <th className="text-left font-medium px-3 py-2.5">Labels</th>
              <th className="text-left font-medium px-3 py-2.5">Due</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((t) => {
              const status = STATUS_META[t.status]
              const priority = PRIORITY_META[t.priority]
              const assignee = users.find((u) => u.id === t.assigneeId)
              const project = projects.find((p) => p.id === t.projectId)
              const taskLabels = labels.filter((l) => t.labels.includes(l.id))
              return (
                <tr
                  key={t.id}
                  onClick={() => dispatch({ type: "SELECT_TASK", taskId: t.id })}
                  className="border-t border-border hover:bg-accent/30 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-2.5 font-medium max-w-md">
                    <div className="truncate">{t.title}</div>
                  </td>
                  <td className="px-3 py-2.5">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 text-[11px] font-medium px-1.5 py-0.5 rounded border",
                        status.badge,
                      )}
                    >
                      <span className={cn("h-1.5 w-1.5 rounded-full", status.dot)} />
                      {status.label}
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    <span
                      className={cn(
                        "inline-flex items-center text-[11px] font-medium px-1.5 py-0.5 rounded border",
                        priority.badge,
                      )}
                    >
                      {priority.label}
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <UserAvatar user={assignee} size="xs" />
                      <span className="text-muted-foreground truncate">
                        {assignee?.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-muted-foreground">
                    {project ? `${project.emoji} ${project.name}` : "—"}
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex flex-wrap gap-1">
                      {taskLabels.slice(0, 2).map((l) => (
                        <span
                          key={l.id}
                          className="inline-flex items-center gap-1 text-[10px] text-muted-foreground bg-muted/60 px-1.5 py-0.5 rounded"
                        >
                          <span
                            className={cn("h-1.5 w-1.5 rounded-full", labelDotClass(l.color))}
                          />
                          {l.name}
                        </span>
                      ))}
                      {taskLabels.length > 2 && (
                        <span className="text-[10px] text-muted-foreground">
                          +{taskLabels.length - 2}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-muted-foreground whitespace-nowrap">
                    {formatDate(t.dueDate)}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
