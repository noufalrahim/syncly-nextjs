"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/core/utils"
import { STATUS_META, type Task } from "@/domain/types"
import { useDispatch, useProjectTasks, useWorkspace } from "@/presentation/state/workspace-store"
import { Skeleton } from "@/presentation/components/ui/skeleton"

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1)
}

function buildMonthGrid(viewDate: Date) {
  const first = startOfMonth(viewDate)
  const startDow = first.getDay()
  const start = new Date(first)
  start.setDate(start.getDate() - startDow)
  const cells: Date[] = []
  for (let i = 0; i < 42; i++) {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    cells.push(d)
  }
  return cells
}

export function TaskCalendarView() {
  const tasks = useProjectTasks()
  const { loading } = useWorkspace()
  const dispatch = useDispatch()
  const [viewDate, setViewDate] = React.useState(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
  })
  const [selectedDate, setSelectedDate] = React.useState<Date | null>(null)

  const today = React.useMemo(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
  }, [])

  const cells = React.useMemo(() => buildMonthGrid(viewDate), [viewDate])

  const tasksByDate = React.useMemo(() => {
    const map = new Map<string, Task[]>()
    for (const t of tasks) {
      const d = new Date(t.dueDate)
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
      const arr = map.get(key) ?? []
      arr.push(t)
      map.set(key, arr)
    }
    return map
  }, [tasks])

  function keyFor(d: Date) {
    return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
  }

  const selectedTasks = selectedDate
    ? tasksByDate.get(keyFor(selectedDate)) ?? []
    : []

  return (
    <div className="flex-1 flex overflow-hidden">
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h2 className="text-base font-semibold">
            {viewDate.toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            })}
          </h2>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => {
                const d = new Date(viewDate)
                d.setMonth(d.getMonth() - 1)
                setViewDate(d)
              }}
              className="h-7 w-7 inline-flex items-center justify-center rounded hover:bg-accent text-muted-foreground hover:text-foreground"
              aria-label="Previous month"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewDate(new Date(today))}
              className="px-2 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-accent rounded"
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => {
                const d = new Date(viewDate)
                d.setMonth(d.getMonth() + 1)
                setViewDate(d)
              }}
              className="h-7 w-7 inline-flex items-center justify-center rounded hover:bg-accent text-muted-foreground hover:text-foreground"
              aria-label="Next month"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 border-b border-border bg-muted/20 text-[11px] uppercase tracking-wider text-muted-foreground">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div key={d} className="px-2 py-2 text-center font-medium">
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 grid-rows-6 flex-1">
          {cells.map((d, i) => {
            const inMonth = d.getMonth() === viewDate.getMonth()
            const isToday = d.getTime() === today.getTime()
            const isSelected =
              selectedDate &&
              d.getTime() === selectedDate.getTime()
            const dayTasks = tasksByDate.get(keyFor(d)) ?? []
            return (
              <button
                type="button"
                key={i}
                onClick={() => setSelectedDate(new Date(d))}
                className={cn(
                  "border-r border-b border-border p-1.5 text-left flex flex-col gap-1 overflow-hidden hover:bg-accent/30 transition-colors min-h-[88px]",
                  !inMonth && "bg-muted/10",
                  isSelected && "bg-accent/40 ring-1 ring-inset ring-primary/40",
                )}
              >
                <span
                  className={cn(
                    "inline-flex items-center justify-center text-xs font-medium h-5 w-5 rounded-full",
                    isToday && "bg-primary text-primary-foreground",
                    !inMonth && "text-muted-foreground/60",
                  )}
                >
                  {d.getDate()}
                </span>
                <div className="flex-1 space-y-0.5 overflow-hidden">
                  {loading.tasks ? (
                    <>
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-4/5" />
                    </>
                  ) : (
                    <>
                      {dayTasks.slice(0, 3).map((t) => {
                        const meta = STATUS_META[t.status]
                        return (
                          <div
                            key={t.id}
                            className={cn(
                              "text-[10px] px-1.5 py-0.5 rounded truncate border",
                              meta.badge,
                            )}
                          >
                            {t.title}
                          </div>
                        )
                      })}
                      {dayTasks.length > 3 && (
                        <div className="text-[10px] text-muted-foreground px-1">
                          +{dayTasks.length - 3} more
                        </div>
                      )}
                    </>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {selectedDate && (
        <aside className="w-80 shrink-0 border-l border-border flex flex-col">
          <div className="px-4 py-3 border-b border-border">
            <h3 className="text-sm font-semibold">
              {selectedDate.toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </h3>
            <p className="text-xs text-muted-foreground">
              {selectedTasks.length} task{selectedTasks.length === 1 ? "" : "s"}
            </p>
          </div>
          <div className="flex-1 overflow-auto p-3 space-y-2">
            {selectedTasks.length === 0 ? (
              <p className="text-xs text-muted-foreground italic px-1 py-3">
                No tasks scheduled.
              </p>
            ) : (
              selectedTasks.map((t) => {
                const meta = STATUS_META[t.status]
                return (
                  <button
                    type="button"
                    key={t.id}
                    onClick={() =>
                      dispatch({ type: "SELECT_TASK", taskId: t.id })
                    }
                    className="w-full text-left bg-card border border-border rounded-md p-2.5 hover:border-border/80 transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className={cn("h-1.5 w-1.5 rounded-full", meta.dot)} />
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                        {meta.label}
                      </span>
                    </div>
                    <div className="text-sm font-medium">{t.title}</div>
                    {t.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                        {t.description}
                      </p>
                    )}
                  </button>
                )
              })
            )}
          </div>
        </aside>
      )}
    </div>
  )
}
