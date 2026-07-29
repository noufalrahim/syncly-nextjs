"use client"

import * as React from "react"
import { ArrowRight, CheckCircle2, CircleDashed, FolderOpen } from "lucide-react"
import { useWorkspace, useDispatch } from "@/presentation/state/workspace-store"
import { cn } from "@/core/utils"
import { getHexColor } from "@/domain/label-colors"
import { Spinner } from "@/presentation/components/ui/spinner"
import { AvatarStack } from "@/presentation/components/user-avatar"
import type { User } from "@/domain/types"

export function AllProjectsView() {
  const { projects, tasks, users, loading } = useWorkspace()
  const dispatch = useDispatch()

  const isLoading = loading.projects || loading.tasks

  const projectStats = React.useMemo(() => {
    return projects.map((project) => {
      const projectTasks = tasks.filter((t) => t.projectId === project.id)
      const doneCount = projectTasks.filter((t) => t.status === "done").length
      const assigneeIds = [
        ...new Set(
          projectTasks
            .map((t) => t.assigneeId)
            .filter((id): id is string => Boolean(id)),
        ),
      ]
      const members = assigneeIds
        .map((id) => users.find((u) => u.id === id))
        .filter((u): u is User => Boolean(u))

      return {
        ...project,
        taskCount: projectTasks.length,
        doneCount,
        progress:
          projectTasks.length > 0
            ? Math.round((doneCount / projectTasks.length) * 100)
            : 0,
        members,
        recentTasks: projectTasks.slice(0, 3),
      }
    })
  }, [projects, tasks, users])

  return (
    <div className="flex-1 overflow-y-auto bg-background/50">
      <div className="w-full mx-auto p-8">
        <header className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight">All projects</h1>
          <p className="text-muted-foreground mt-1">
            Open a project to manage tasks, boards, and progress.
          </p>
        </header>

        {isLoading ? (
          <div className="flex min-h-[min(60vh,420px)] items-center justify-center">
            <Spinner className="size-8 text-muted-foreground" />
          </div>
        ) : projects.length === 0 ? (
          <div className="flex min-h-[min(60vh,420px)] flex-col items-center justify-center rounded-2xl border border-dashed border-border px-6 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted/60">
              <FolderOpen className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground">No projects yet</p>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Create your first project from the sidebar to start tracking work.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {projectStats.map((p) => {
              const accent = getHexColor(p.color)

              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => dispatch({ type: "SELECT_PROJECT", projectId: p.id })}
                  className={cn(
                    "group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card text-left",
                    "transition-all duration-200",
                    "hover:border-primary/30 hover:shadow-lg hover:shadow-black/10",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  )}
                >
                  <div
                    className="h-1 w-full shrink-0"
                    style={{ backgroundColor: accent }}
                    aria-hidden
                  />

                  <div className="flex flex-1 flex-col gap-5 p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <span
                          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-2xl"
                          style={{ backgroundColor: `${accent}22` }}
                          aria-hidden
                        >
                          {p.emoji}
                        </span>
                        <div className="min-w-0">
                          <h3 className="truncate text-base font-semibold tracking-tight transition-colors group-hover:text-primary">
                            {p.name}
                          </h3>
                          <p className="mt-0.5 text-xs text-muted-foreground tabular-nums">
                            {p.taskCount === 0
                              ? "No tasks yet"
                              : `${p.doneCount} of ${p.taskCount} done`}
                          </p>
                        </div>
                      </div>
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted/50 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                        <ArrowRight className="h-4 w-4" />
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium tabular-nums text-foreground">
                          {p.progress}%
                        </span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full transition-[width] duration-300"
                          style={{
                            width: `${p.progress}%`,
                            backgroundColor: accent,
                          }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1.5">
                          <CircleDashed className="h-3.5 w-3.5" />
                          <span className="tabular-nums">{p.taskCount}</span>
                          <span className="sr-only">tasks</span>
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span className="tabular-nums">{p.doneCount}</span>
                          <span className="sr-only">completed</span>
                        </span>
                      </div>

                      {p.members.length > 0 ? (
                        <AvatarStack users={p.members} max={4} size="xs" />
                      ) : (
                        <span className="text-[11px] text-muted-foreground">No assignees</span>
                      )}
                    </div>

                    {p.recentTasks.length > 0 && (
                      <div className="space-y-1.5 border-t border-border/60 pt-4">
                        <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                          Recent
                        </p>
                        <ul className="space-y-1">
                          {p.recentTasks.map((t) => (
                            <li
                              key={t.id}
                              className="flex items-center gap-2 text-xs text-muted-foreground"
                            >
                              <span
                                className={cn(
                                  "h-1.5 w-1.5 shrink-0 rounded-full",
                                  t.status === "done" ? "bg-emerald-500" : "bg-muted-foreground/50",
                                )}
                              />
                              <span className="truncate">{t.title}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
