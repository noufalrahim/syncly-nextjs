"use client"

import * as React from "react"
import { useWorkspace, useDispatch } from "@/presentation/state/workspace-store"
import { Button } from "@/presentation/components/ui/button"
import { CheckCircle2, Circle, Clock, FolderGit2 } from "lucide-react"
import { cn } from "@/core/utils"

export function MyTasksModule() {
  const { tasks, projects, currentUserId } = useWorkspace()
  const dispatch = useDispatch()

  const myTasks = React.useMemo(() => {
    return tasks.filter((t) => t.assigneeId === currentUserId)
  }, [tasks, currentUserId])

  const todoTasks = React.useMemo(() => {
    return myTasks.filter((t) => t.status === "backlog" || t.status === "on-hold")
  }, [myTasks])

  const inProgressTasks = React.useMemo(() => {
    return myTasks.filter((t) => t.status === "in-progress")
  }, [myTasks])

  const completedTasks = React.useMemo(() => {
    return myTasks.filter((t) => t.status === "done" || t.status === "cancelled")
  }, [myTasks])

  const getProjectInfo = (projId: string) => {
    const proj = projects.find((p) => p.id === projId)
    return proj ? { name: proj.name, emoji: proj.emoji } : { name: "General", emoji: "📁" }
  }

  return (
    <div className="flex-grow flex flex-col min-h-0 bg-background overflow-hidden">
      <div className="flex-shrink-0 px-8 py-5 border-b border-border/40">
        <h1 className="text-xl font-bold tracking-tight">My Tasks</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Manage all tasks assigned to you across all projects.</p>
      </div>

      <div className="flex-1 overflow-x-auto p-8 flex gap-6 min-h-0">
        <div className="w-80 shrink-0 flex flex-col min-h-0 bg-card/45 border border-border/80 rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">To Do ({todoTasks.length})</span>
          </div>
          <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
            {todoTasks.map((t) => {
              const proj = getProjectInfo(t.projectId)
              return (
                <div 
                  key={t.id} 
                  onClick={() => dispatch({ type: "SELECT_TASK", taskId: t.id })}
                  className="p-4 bg-background border border-border rounded-lg hover:border-primary/20 transition-colors cursor-pointer space-y-3"
                >
                  <div className="flex items-start gap-2.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        dispatch({ type: "UPDATE_TASK", taskId: t.id, patch: { status: "done" } })
                      }}
                      className="text-muted-foreground/30 hover:text-primary transition-colors cursor-pointer mt-0.5"
                    >
                      <Circle className="h-4 w-4" />
                    </button>
                    <span className="text-sm font-semibold leading-tight line-clamp-2">{t.title}</span>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground font-medium">
                      <span>{proj.emoji}</span>
                      <span className="truncate max-w-[100px]">{proj.name}</span>
                    </span>
                    <span className={cn(
                      "text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full",
                      t.priority === "high" ? "bg-red-500/10 text-red-400" : t.priority === "medium" ? "bg-amber-500/10 text-amber-400" : "bg-blue-500/10 text-blue-400"
                    )}>
                      {t.priority}
                    </span>
                  </div>
                </div>
              )
            })}
            {todoTasks.length === 0 && (
              <div className="text-center py-10 text-xs text-muted-foreground italic">No tasks in To Do</div>
            )}
          </div>
        </div>

        <div className="w-80 shrink-0 flex flex-col min-h-0 bg-card/45 border border-border/80 rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">In Progress ({inProgressTasks.length})</span>
          </div>
          <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
            {inProgressTasks.map((t) => {
              const proj = getProjectInfo(t.projectId)
              return (
                <div 
                  key={t.id} 
                  onClick={() => dispatch({ type: "SELECT_TASK", taskId: t.id })}
                  className="p-4 bg-background border border-border rounded-lg hover:border-primary/20 transition-colors cursor-pointer space-y-3"
                >
                  <div className="flex items-start gap-2.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        dispatch({ type: "UPDATE_TASK", taskId: t.id, patch: { status: "done" } })
                      }}
                      className="text-muted-foreground/30 hover:text-primary transition-colors cursor-pointer mt-0.5"
                    >
                      <Circle className="h-4 w-4" />
                    </button>
                    <span className="text-sm font-semibold leading-tight line-clamp-2">{t.title}</span>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground font-medium">
                      <span>{proj.emoji}</span>
                      <span className="truncate max-w-[100px]">{proj.name}</span>
                    </span>
                    <span className={cn(
                      "text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full",
                      t.priority === "high" ? "bg-red-500/10 text-red-400" : t.priority === "medium" ? "bg-amber-500/10 text-amber-400" : "bg-blue-500/10 text-blue-400"
                    )}>
                      {t.priority}
                    </span>
                  </div>
                </div>
              )
            })}
            {inProgressTasks.length === 0 && (
              <div className="text-center py-10 text-xs text-muted-foreground italic">No tasks in Progress</div>
            )}
          </div>
        </div>

        <div className="w-80 shrink-0 flex flex-col min-h-0 bg-card/45 border border-border/80 rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Completed ({completedTasks.length})</span>
          </div>
          <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
            {completedTasks.map((t) => {
              const proj = getProjectInfo(t.projectId)
              return (
                <div 
                  key={t.id} 
                  onClick={() => dispatch({ type: "SELECT_TASK", taskId: t.id })}
                  className="p-4 bg-background border border-border rounded-lg hover:border-primary/20 transition-colors cursor-pointer space-y-3 opacity-65"
                >
                  <div className="flex items-start gap-2.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        dispatch({ type: "UPDATE_TASK", taskId: t.id, patch: { status: "in-progress" } })
                      }}
                      className="text-emerald-500 hover:text-primary transition-colors cursor-pointer mt-0.5"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                    </button>
                    <span className="text-sm font-semibold leading-tight line-clamp-2 line-through text-muted-foreground">{t.title}</span>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground font-medium">
                      <span>{proj.emoji}</span>
                      <span className="truncate max-w-[100px]">{proj.name}</span>
                    </span>
                    <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 bg-accent text-accent-foreground rounded-full">
                      Done
                    </span>
                  </div>
                </div>
              )
            })}
            {completedTasks.length === 0 && (
              <div className="text-center py-10 text-xs text-muted-foreground italic">No completed tasks</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
