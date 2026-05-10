"use client"

import { CheckCircle2, Plus } from "lucide-react"
import { cn } from "@/core/utils"
import type { Goal } from "@/domain/types"
import { useWorkspace } from "@/presentation/state/workspace-store"
import { UserAvatar } from "@/presentation/components/user-avatar"

const STATUS_META: Record<
  Goal["status"],
  { label: string; badge: string; bar: string; dot: string }
> = {
  "on-track": {
    label: "On Track",
    badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    bar: "bg-emerald-500",
    dot: "bg-emerald-500",
  },
  "at-risk": {
    label: "At Risk",
    badge: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    bar: "bg-amber-500",
    dot: "bg-amber-500",
  },
  "off-track": {
    label: "Off Track",
    badge: "bg-red-500/10 text-red-400 border-red-500/20",
    bar: "bg-red-500",
    dot: "bg-red-500",
  },
  completed: {
    label: "Completed",
    badge: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    bar: "bg-blue-500",
    dot: "bg-blue-500",
  },
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export function GoalsModule() {
  const { goals, users } = useWorkspace()
  const completed = goals.filter((g) => g.status === "completed").length
  const onTrack = goals.filter((g) => g.status === "on-track").length
  const atRisk = goals.filter(
    (g) => g.status === "at-risk" || g.status === "off-track",
  ).length

  return (
    <div className="flex-1 overflow-auto">
      <div className="px-6 py-4 flex items-center justify-between border-b border-border">
        <div>
          <h2 className="text-base font-semibold">Quarterly goals</h2>
          <p className="text-xs text-muted-foreground">
            Track progress against company OKRs
          </p>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:opacity-90"
        >
          <Plus className="h-3.5 w-3.5" />
          New goal
        </button>
      </div>

      <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-3 max-w-5xl">
        <Stat label="On track" value={onTrack} dotClass="bg-emerald-500" />
        <Stat label="At risk" value={atRisk} dotClass="bg-amber-500" />
        <Stat label="Completed" value={completed} dotClass="bg-blue-500" />
      </div>

      <div className="px-6 pb-8 space-y-3 max-w-5xl">
        {goals.map((g) => {
          const meta = STATUS_META[g.status]
          const owner = users.find((u) => u.id === g.ownerId)
          return (
            <div
              key={g.id}
              className="bg-card border border-border rounded-lg p-4 hover:border-border/80 transition-colors"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 text-[11px] font-medium px-1.5 py-0.5 rounded border",
                        meta.badge,
                      )}
                    >
                      {g.status === "completed" ? (
                        <CheckCircle2 className="h-3 w-3" />
                      ) : (
                        <span className={cn("h-1.5 w-1.5 rounded-full", meta.dot)} />
                      )}
                      {meta.label}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Due {formatDate(g.dueDate)}
                    </span>
                  </div>
                  <h3 className="text-base font-semibold">{g.title}</h3>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {g.description}
                  </p>
                </div>
                <UserAvatar user={owner} size="md" />
              </div>

              <div className="flex items-center gap-3 mt-3">
                <div className="flex-1 h-1.5 bg-muted/50 rounded-full overflow-hidden">
                  <div
                    className={cn("h-full rounded-full transition-all", meta.bar)}
                    style={{ width: `${g.progress}%` }}
                  />
                </div>
                <span className="text-sm font-medium tabular-nums w-10 text-right">
                  {g.progress}%
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function Stat({
  label,
  value,
  dotClass,
}: {
  label: string
  value: number
  dotClass: string
}) {
  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span className={cn("h-2 w-2 rounded-full", dotClass)} />
        {label}
      </div>
      <div className="text-2xl font-semibold mt-1 tabular-nums">{value}</div>
    </div>
  )
}
