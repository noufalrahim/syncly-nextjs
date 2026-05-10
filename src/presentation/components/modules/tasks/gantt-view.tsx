"use client"

import * as React from "react"
import { cn } from "@/core/utils"
import { STATUS_META } from "@/domain/types"
import { useDispatch, useProjectTasks } from "@/presentation/state/workspace-store"

const DAY_MS = 24 * 60 * 60 * 1000

export function GanttView() {
  const tasks = useProjectTasks()
  const dispatch = useDispatch()

  // Build a 30-day window centered around today
  const today = React.useMemo(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
  }, [])

  const { rangeStart, days } = React.useMemo(() => {
    const start = new Date(today)
    start.setDate(start.getDate() - 7)
    const total = 35
    const arr: Date[] = []
    for (let i = 0; i < total; i++) {
      const d = new Date(start)
      d.setDate(d.getDate() + i)
      arr.push(d)
    }
    return { rangeStart: start, days: arr }
  }, [today])

  const cellWidth = 36 // px

  const sorted = React.useMemo(
    () =>
      [...tasks].sort(
        (a, b) =>
          new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
      ),
    [tasks],
  )

  return (
    <div className="flex-1 overflow-auto">
      <div className="min-w-max">
        {/* Header: dates */}
        <div className="sticky top-0 z-10 bg-background border-b border-border flex">
          <div className="w-64 shrink-0 px-4 py-2 text-xs font-medium text-muted-foreground border-r border-border">
            Task
          </div>
          <div className="flex">
            {days.map((d, i) => {
              const isToday = d.getTime() === today.getTime()
              const isWeekend = d.getDay() === 0 || d.getDay() === 6
              return (
                <div
                  key={i}
                  style={{ width: cellWidth }}
                  className={cn(
                    "shrink-0 text-center py-1 text-[10px] border-r border-border/60",
                    isWeekend && "bg-muted/20",
                    isToday && "bg-primary/10 text-primary font-semibold",
                  )}
                >
                  <div className="text-muted-foreground">
                    {d.toLocaleDateString("en-US", { weekday: "narrow" })}
                  </div>
                  <div>{d.getDate()}</div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Rows */}
        <div>
          {sorted.map((t) => {
            const start = new Date(t.startDate)
            start.setHours(0, 0, 0, 0)
            const end = new Date(t.dueDate)
            end.setHours(0, 0, 0, 0)

            const offsetDays = Math.round(
              (start.getTime() - rangeStart.getTime()) / DAY_MS,
            )
            const durationDays = Math.max(
              1,
              Math.round((end.getTime() - start.getTime()) / DAY_MS) + 1,
            )

            const status = STATUS_META[t.status]
            const visible =
              offsetDays + durationDays > 0 && offsetDays < days.length

            return (
              <div
                key={t.id}
                onClick={() => dispatch({ type: "SELECT_TASK", taskId: t.id })}
                className="flex border-b border-border hover:bg-accent/20 cursor-pointer transition-colors"
              >
                <div className="w-64 shrink-0 px-4 py-2.5 text-sm border-r border-border truncate">
                  <div className="flex items-center gap-2">
                    <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", status.dot)} />
                    <span className="truncate">{t.title}</span>
                  </div>
                </div>
                <div
                  className="relative h-11"
                  style={{ width: days.length * cellWidth }}
                >
                  {/* Background grid */}
                  <div className="absolute inset-0 flex">
                    {days.map((d, i) => {
                      const isToday = d.getTime() === today.getTime()
                      const isWeekend = d.getDay() === 0 || d.getDay() === 6
                      return (
                        <div
                          key={i}
                          style={{ width: cellWidth }}
                          className={cn(
                            "shrink-0 border-r border-border/40",
                            isWeekend && "bg-muted/20",
                            isToday && "bg-primary/5",
                          )}
                        />
                      )
                    })}
                  </div>
                  {visible && (
                    <div
                      className={cn(
                        "absolute top-1/2 -translate-y-1/2 h-6 rounded-md border flex items-center px-2 text-[11px] font-medium truncate",
                        status.badge,
                      )}
                      style={{
                        left: Math.max(0, offsetDays) * cellWidth + 2,
                        width:
                          Math.min(
                            durationDays + Math.min(0, offsetDays),
                            days.length - Math.max(0, offsetDays),
                          ) *
                            cellWidth -
                          4,
                      }}
                      title={t.title}
                    >
                      {t.title}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
