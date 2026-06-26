"use client"

import * as React from "react"
import { useWorkspace, useDispatch } from "@/presentation/state/workspace-store"
import { Button } from "@/presentation/components/ui/button"
import { CheckCircle2, Circle, Clock, Flame, FolderGit2, Plus, Users2 } from "lucide-react"

export function HomeModule() {
  const { projects, tasks, users, currentUserId } = useWorkspace()
  const dispatch = useDispatch()
  const me = users.find((u) => u.id === currentUserId)

  const activeProjectsCount = projects.length
  const myTasks = tasks.filter((t) => t.assigneeId === currentUserId)
  const myPendingTasks = myTasks.filter((t) => t.status !== "done" && t.status !== "cancelled")
  const completedTasksCount = myTasks.filter((t) => t.status === "done").length

  const todayPriorities = React.useMemo(() => {
    return myPendingTasks.slice(0, 4)
  }, [myPendingTasks])

  return (
    <div className="flex-grow overflow-y-auto bg-background p-8">
      <div className="w-full mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back, {me?.name || "User"}! 🚀</h1>
          <p className="text-muted-foreground mt-1.5">Here is an overview of what is happening in your workspace today.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-card border border-border p-5 rounded-xl flex items-center gap-4">
            <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
              <FolderGit2 className="h-5 w-5" />
            </div>
            <div>
              <span className="block text-xs font-medium text-muted-foreground uppercase tracking-wider">Projects</span>
              <span className="block text-2xl font-bold mt-0.5">{activeProjectsCount}</span>
            </div>
          </div>

          <div className="bg-card border border-border p-5 rounded-xl flex items-center gap-4">
            <div className="h-10 w-10 bg-amber-500/10 rounded-lg flex items-center justify-center text-amber-500">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <span className="block text-xs font-medium text-muted-foreground uppercase tracking-wider">Pending Tasks</span>
              <span className="block text-2xl font-bold mt-0.5">{myPendingTasks.length}</span>
            </div>
          </div>

          <div className="bg-card border border-border p-5 rounded-xl flex items-center gap-4">
            <div className="h-10 w-10 bg-emerald-500/10 rounded-lg flex items-center justify-center text-emerald-500">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <span className="block text-xs font-medium text-muted-foreground uppercase tracking-wider">Completed Tasks</span>
              <span className="block text-2xl font-bold mt-0.5">{completedTasksCount}</span>
            </div>
          </div>

          <div className="bg-card border border-border p-5 rounded-xl flex items-center gap-4">
            <div className="h-10 w-10 bg-indigo-500/10 rounded-lg flex items-center justify-center text-indigo-500">
              <Users2 className="h-5 w-5" />
            </div>
            <div>
              <span className="block text-xs font-medium text-muted-foreground uppercase tracking-wider">Team Members</span>
              <span className="block text-2xl font-bold mt-0.5">{users.filter((u) => !u.isBot).length}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-card border border-border rounded-xl p-6 space-y-4">
            <div>
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Flame className="h-4.5 w-4.5 text-amber-500" />
                Today's Priorities
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">Tasks assigned to you that need immediate attention.</p>
            </div>

            <div className="divide-y divide-border/60">
              {todayPriorities.length === 0 ? (
                <div className="py-12 text-center text-sm text-muted-foreground italic">
                  All caught up! No pending tasks assigned to you.
                </div>
              ) : (
                todayPriorities.map((task) => (
                  <div key={task.id} className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => dispatch({ type: "UPDATE_TASK", taskId: task.id, patch: { status: "done" } })}
                        className="text-muted-foreground/45 hover:text-primary transition-colors cursor-pointer"
                      >
                        <Circle className="h-4.5 w-4.5" />
                      </button>
                      <div>
                        <span className="text-sm font-semibold block">{task.title}</span>
                        <span className="text-xs text-muted-foreground mt-0.5 block truncate max-w-md">
                          {task.description || "No description provided."}
                        </span>
                      </div>
                    </div>
                    <span className="text-[11px] font-medium px-2 py-0.5 bg-accent text-accent-foreground rounded-full capitalize">
                      {task.priority}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-6 space-y-4">
            <div>
              <h2 className="text-lg font-semibold">Quick Actions</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Automate and customize your workspace setup.</p>
            </div>

            <div className="flex flex-col gap-2.5">
              <Button 
                onClick={() => dispatch({ type: "SET_MODULE", module: "tasks" })} 
                className="w-full justify-start h-11"
              >
                <Plus className="h-4 w-4 mr-2" /> Create New Task
              </Button>
              <Button 
                variant="secondary"
                onClick={() => dispatch({ type: "SET_MODULE", module: "settings" })}
                className="w-full justify-start h-11"
              >
                <Users2 className="h-4 w-4 mr-2" /> Manage Preferences
              </Button>
            </div>

            <div className="pt-4 border-t border-border/80">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Workspace Activity</h3>
              <div className="space-y-3">
                <div className="text-xs flex flex-col gap-0.5">
                  <span className="font-medium text-foreground">GitHub repo connected</span>
                  <span className="text-muted-foreground">Connected to noufalrahim/syncly-nextjs</span>
                </div>
                <div className="text-xs flex flex-col gap-0.5">
                  <span className="font-medium text-foreground">Review Bot deployed</span>
                  <span className="text-muted-foreground">@review-bot deployed on chat channels</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
