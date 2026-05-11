"use client"

import * as React from "react"
import { Users, Layout, CheckSquare, ArrowRight } from "lucide-react"
import { useWorkspace, useDispatch } from "@/presentation/state/workspace-store"
import { cn } from "@/core/utils"
import { Skeleton } from "@/presentation/components/ui/skeleton"

export function AllProjectsView() {
  const { projects, tasks, users, loading } = useWorkspace()
  const dispatch = useDispatch()

  const projectStats = React.useMemo(() => {
    return projects.map((project) => {
      const projectTasks = tasks.filter((t) => t.projectId === project.id)
      const uniqueStatuses = new Set(projectTasks.map((t) => t.status))
      const uniqueAssignees = new Set(projectTasks.map((t) => t.assigneeId))
      
      return {
        ...project,
        taskCount: projectTasks.length,
        columnCount: uniqueStatuses.size,
        userCount: uniqueAssignees.size,
        recentTasks: projectTasks.slice(0, 3)
      }
    })
  }, [projects, tasks])

  return (
    <div className="flex-1 overflow-y-auto bg-background/50">
      <div className="w-full mx-auto p-8">
        <header className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight">Project Overview</h1>
          <p className="text-muted-foreground">Monitor progress across all your active projects.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading.projects ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-card border border-border rounded-2xl p-6 space-y-6">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-lg" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-5 w-2/3" />
                    <Skeleton className="h-3 w-1/3" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
                <div className="space-y-2 pt-2">
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-full" />
                </div>
              </div>
            ))
          ) : (
            projectStats.map((p) => (
              <div 
                key={p.id}
                onClick={() => dispatch({ type: "SELECT_PROJECT", projectId: p.id })}
                className="group relative bg-card border border-border rounded-2xl p-6 hover:border-primary/20 transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">{p.emoji}</span>
                    <div className="min-w-0">
                      <h3 className="font-bold text-lg truncate group-hover:text-primary transition-colors">{p.name}</h3>
                      <p className="text-[11px] text-muted-foreground uppercase tracking-widest font-medium">Project</p>
                    </div>
                  </div>
                  <div className="h-8 w-8 rounded-full bg-muted/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowRight className="h-4 w-4 text-primary" />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  <StatItem 
                    icon={<CheckSquare className="h-3.5 w-3.5" />} 
                    value={p.taskCount} 
                    label="Tasks" 
                  />
                  <StatItem 
                    icon={<Layout className="h-3.5 w-3.5" />} 
                    value={p.columnCount} 
                    label="Columns" 
                  />
                  <StatItem 
                    icon={<Users className="h-3.5 w-3.5" />} 
                    value={p.userCount} 
                    label="Members" 
                  />
                </div>

                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Recent Activity</p>
                  {p.recentTasks.length > 0 ? (
                    p.recentTasks.map(t => (
                      <div key={t.id} className="text-xs py-1 px-2 rounded bg-muted/30 text-muted-foreground truncate">
                        {t.title}
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-muted-foreground italic">No tasks yet</p>
                  )}
                </div>
              </div>
            ))
          )}

          {projects.length === 0 && (
            <div className="col-span-full py-20 text-center border-2 border-dashed border-border rounded-3xl">
              <p className="text-muted-foreground">No projects found. Create your first project to get started.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function StatItem({ icon, value, label }: { icon: React.ReactNode, value: number, label: string }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1.5 text-muted-foreground">
        {icon}
        <span className="text-[10px] font-medium uppercase tracking-tight">{label}</span>
      </div>
      <p className="text-xl font-bold tabular-nums">{value}</p>
    </div>
  )
}
