"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/core/utils"
import { STATUS_META, type Task } from "@/domain/types"
import { useDispatch, useProjectTasks, useWorkspace } from "@/presentation/state/workspace-store"
import { Skeleton } from "@/presentation/components/ui/skeleton"
import { useIsMobile } from "@/presentation/hooks/use-mobile"

type CalendarViewMode = "month" | "week" | "day"

const HOUR_HEIGHT = 56
const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const DAY_LABELS_SHORT = ["S", "M", "T", "W", "T", "F", "S"]

function startOfDay(d: Date) {
  const c = new Date(d)
  c.setHours(0, 0, 0, 0)
  return c
}

function addDays(d: Date, n: number) {
  const c = new Date(d)
  c.setDate(c.getDate() + n)
  return c
}

function startOfWeek(d: Date) {
  return addDays(startOfDay(d), -d.getDay())
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

function keyFor(d: Date) {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
}

function buildMonthGrid(viewDate: Date) {
  const first = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1)
  const start = addDays(first, -first.getDay())
  return Array.from({ length: 42 }, (_, i) => addDays(start, i))
}

function taskTime(t: Task) {
  return new Date(t.dueDate)
}

/** Tasks due at exactly midnight are treated as all-day. */
function isAllDay(t: Task) {
  const d = taskTime(t)
  return d.getHours() === 0 && d.getMinutes() === 0
}

function formatTime(d: Date) {
  const h = d.getHours() % 12 || 12
  const suffix = d.getHours() < 12 ? "AM" : "PM"
  return d.getMinutes() === 0 ? `${h} ${suffix}` : `${h}:${String(d.getMinutes()).padStart(2, "0")} ${suffix}`
}

function hourLabel(h: number) {
  if (h === 0) return ""
  const hh = h % 12 || 12
  return `${hh} ${h < 12 ? "AM" : "PM"}`
}

export function TaskCalendarView() {
  const tasks = useProjectTasks()
  const { loading } = useWorkspace()
  const dispatch = useDispatch()
  const isMobile = useIsMobile()
  const [view, setView] = React.useState<CalendarViewMode>("month")
  const [viewDate, setViewDate] = React.useState(() => startOfDay(new Date()))
  const [now, setNow] = React.useState(() => new Date())
  const scrollRef = React.useRef<HTMLDivElement>(null)

  const today = startOfDay(now)

  React.useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000)
    return () => clearInterval(id)
  }, [])

  // On narrow screens, prefer day over cramped week view.
  React.useEffect(() => {
    if (isMobile && view === "week") {
      setView("day")
    }
  }, [isMobile, view])

  React.useEffect(() => {
    if (view !== "month" && scrollRef.current) {
      scrollRef.current.scrollTop = 7.5 * HOUR_HEIGHT
    }
  }, [view])

  const tasksByDate = React.useMemo(() => {
    const map = new Map<string, Task[]>()
    for (const t of tasks) {
      const key = keyFor(taskTime(t))
      const arr = map.get(key) ?? []
      arr.push(t)
      map.set(key, arr)
    }
    for (const arr of map.values()) {
      arr.sort((a, b) => taskTime(a).getTime() - taskTime(b).getTime())
    }
    return map
  }, [tasks])

  function navigate(direction: -1 | 1) {
    if (view === "month") {
      setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + direction, 1))
    } else if (view === "week") {
      setViewDate((d) => addDays(d, direction * 7))
    } else {
      setViewDate((d) => addDays(d, direction))
    }
  }

  function openDay(d: Date) {
    setViewDate(startOfDay(d))
    setView("day")
  }

  const weekDays = React.useMemo(() => {
    if (view === "day") return [startOfDay(viewDate)]
    const start = startOfWeek(viewDate)
    return Array.from({ length: 7 }, (_, i) => addDays(start, i))
  }, [view, viewDate])

  const title = React.useMemo(() => {
    if (view === "day") {
      return viewDate.toLocaleDateString("en-US", {
        month: isMobile ? "short" : "long",
        day: "numeric",
        year: "numeric",
      })
    }
    if (view === "week") {
      const start = weekDays[0]
      const end = weekDays[weekDays.length - 1]
      if (start.getMonth() === end.getMonth()) {
        return start.toLocaleDateString("en-US", { month: "long", year: "numeric" })
      }
      const startLabel = start.toLocaleDateString("en-US", { month: "short" })
      const endLabel = end.toLocaleDateString("en-US", { month: "short", year: "numeric" })
      return `${startLabel} – ${endLabel}`
    }
    return viewDate.toLocaleDateString("en-US", {
      month: isMobile ? "short" : "long",
      year: "numeric",
    })
  }, [view, viewDate, weekDays, isMobile])

  function TaskChip({ task, showTime }: { task: Task; showTime?: boolean }) {
    const meta = STATUS_META[task.status]
    const time = taskTime(task)
    return (
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          dispatch({ type: "SELECT_TASK", taskId: task.id })
        }}
        className={cn(
          "w-full flex items-center gap-1 text-[11px] leading-4 px-1.5 py-0.5 rounded truncate border text-left hover:brightness-125 transition-[filter] cursor-pointer",
          meta.badge,
        )}
        title={task.title}
      >
        {showTime && !isAllDay(task) && (
          <span className="shrink-0 opacity-75">{formatTime(time)}</span>
        )}
        <span className="truncate font-medium">{task.title}</span>
      </button>
    )
  }

  const monthGrid = React.useMemo(() => buildMonthGrid(viewDate), [viewDate])
  const viewModes = (isMobile ? (["month", "day"] as const) : (["month", "week", "day"] as const))

  return (
    <div className="flex-1 flex flex-col overflow-hidden min-h-0">
      {/* Toolbar */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between px-3 sm:px-4 py-2.5 border-b border-border">
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
          <button
            type="button"
            onClick={() => setViewDate(startOfDay(new Date()))}
            className="h-8 px-2.5 sm:px-3.5 text-xs sm:text-sm font-medium border border-border rounded-full hover:bg-accent transition-colors cursor-pointer shrink-0"
          >
            Today
          </button>
          <div className="flex items-center">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="h-8 w-8 inline-flex items-center justify-center rounded-full hover:bg-accent text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              aria-label="Previous"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => navigate(1)}
              className="h-8 w-8 inline-flex items-center justify-center rounded-full hover:bg-accent text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              aria-label="Next"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <h2 className="text-sm sm:text-lg font-medium ml-0.5 truncate">{title}</h2>
        </div>

        <div className="flex items-center self-end sm:self-auto rounded-lg border border-border p-0.5 bg-muted/30">
          {viewModes.map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setView(v)}
              className={cn(
                "h-7 px-3 text-xs font-medium rounded-md capitalize transition-colors cursor-pointer",
                view === v
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {view === "month" ? (
        <>
          <div className="grid grid-cols-7 border-b border-border text-[10px] sm:text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            {(isMobile ? DAY_LABELS_SHORT : DAY_LABELS).map((d, i) => (
              <div key={`${d}-${i}`} className="px-0.5 sm:px-2 py-1.5 text-center">
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 grid-rows-6 flex-1 overflow-hidden min-h-0">
            {monthGrid.map((d, i) => {
              const inMonth = d.getMonth() === viewDate.getMonth()
              const isToday = isSameDay(d, today)
              const dayTasks = tasksByDate.get(keyFor(d)) ?? []
              const visible = isMobile ? [] : dayTasks.slice(0, 3)
              const overflow = isMobile
                ? dayTasks.length
                : dayTasks.length - visible.length
              const dots = isMobile ? dayTasks.slice(0, 3) : []

              return (
                <div
                  key={i}
                  onClick={() => openDay(d)}
                  className={cn(
                    "border-r border-b border-border p-0.5 sm:p-1 flex flex-col gap-0.5 overflow-hidden cursor-pointer hover:bg-accent/20 transition-colors min-w-0",
                    !inMonth && "bg-muted/10",
                  )}
                >
                  <div className="flex justify-center py-0.5">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        openDay(d)
                      }}
                      className={cn(
                        "inline-flex items-center justify-center text-[11px] sm:text-xs font-medium h-6 min-w-6 px-1 rounded-full hover:bg-accent transition-colors cursor-pointer",
                        isToday && "bg-primary text-primary-foreground hover:bg-primary/90",
                        !inMonth && !isToday && "text-muted-foreground/60",
                      )}
                    >
                      {!isMobile && d.getDate() === 1
                        ? `${d.toLocaleDateString("en-US", { month: "short" })} 1`
                        : d.getDate()}
                    </button>
                  </div>

                  {isMobile ? (
                    <div className="flex flex-1 items-start justify-center gap-0.5 pt-0.5">
                      {loading.tasks ? (
                        <Skeleton className="h-1.5 w-1.5 rounded-full" />
                      ) : (
                        dots.map((t) => (
                          <span
                            key={t.id}
                            className={cn(
                              "h-1.5 w-1.5 rounded-full shrink-0",
                              STATUS_META[t.status].dot ?? "bg-primary",
                            )}
                          />
                        ))
                      )}
                      {overflow > 3 && (
                        <span className="text-[9px] leading-none text-muted-foreground font-medium">
                          +{overflow - 3}
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="flex-1 space-y-0.5 overflow-hidden">
                      {loading.tasks ? (
                        <>
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-4/5" />
                        </>
                      ) : (
                        <>
                          {visible.map((t) => (
                            <TaskChip key={t.id} task={t} showTime />
                          ))}
                          {overflow > 0 && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                openDay(d)
                              }}
                              className="w-full text-left text-[11px] font-medium text-muted-foreground hover:text-foreground px-1.5 py-0.5 rounded hover:bg-accent transition-colors cursor-pointer"
                            >
                              +{overflow} more
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </>
      ) : (
        <>
          <div className="flex border-b border-border">
            <div className="w-12 sm:w-16 shrink-0" />
            {weekDays.map((d) => {
              const isToday = isSameDay(d, today)
              return (
                <div
                  key={keyFor(d)}
                  className="flex-1 flex flex-col items-center py-1.5 sm:py-2 border-l border-border min-w-0"
                >
                  <span
                    className={cn(
                      "text-[10px] sm:text-[11px] font-medium uppercase tracking-wider",
                      isToday ? "text-primary" : "text-muted-foreground",
                    )}
                  >
                    {(isMobile ? DAY_LABELS_SHORT : DAY_LABELS)[d.getDay()]}
                  </span>
                  <button
                    type="button"
                    onClick={() => openDay(d)}
                    className={cn(
                      "mt-0.5 h-8 w-8 sm:h-9 sm:w-9 inline-flex items-center justify-center rounded-full text-base sm:text-lg font-medium hover:bg-accent transition-colors cursor-pointer",
                      isToday && "bg-primary text-primary-foreground hover:bg-primary/90",
                    )}
                  >
                    {d.getDate()}
                  </button>
                </div>
              )
            })}
          </div>

          <div className="flex border-b border-border bg-muted/10">
            <div className="w-12 sm:w-16 shrink-0 py-1 pr-1 sm:pr-2 text-right text-[9px] sm:text-[10px] text-muted-foreground">
              all-day
            </div>
            {weekDays.map((d) => {
              const allDay = (tasksByDate.get(keyFor(d)) ?? []).filter(isAllDay)
              return (
                <div
                  key={keyFor(d)}
                  className="flex-1 border-l border-border p-1 space-y-0.5 min-h-7 min-w-0 overflow-hidden"
                >
                  {allDay.map((t) => (
                    <TaskChip key={t.id} task={t} />
                  ))}
                </div>
              )
            })}
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto min-h-0">
            <div className="flex relative" style={{ height: 24 * HOUR_HEIGHT }}>
              <div className="w-12 sm:w-16 shrink-0 relative">
                {Array.from({ length: 24 }, (_, h) => (
                  <span
                    key={h}
                    className="absolute right-1 sm:right-2 -translate-y-1/2 text-[9px] sm:text-[10px] text-muted-foreground"
                    style={{ top: h * HOUR_HEIGHT }}
                  >
                    {hourLabel(h)}
                  </span>
                ))}
              </div>

              {weekDays.map((d) => {
                const timed = (tasksByDate.get(keyFor(d)) ?? []).filter((t) => !isAllDay(t))
                const byHour = new Map<number, Task[]>()
                for (const t of timed) {
                  const h = taskTime(t).getHours()
                  const arr = byHour.get(h) ?? []
                  arr.push(t)
                  byHour.set(h, arr)
                }
                const isToday = isSameDay(d, today)
                const nowOffset = (now.getHours() + now.getMinutes() / 60) * HOUR_HEIGHT
                return (
                  <div key={keyFor(d)} className="flex-1 relative border-l border-border min-w-0">
                    {Array.from({ length: 24 }, (_, h) => (
                      <div
                        key={h}
                        className="absolute inset-x-0 border-t border-border/60"
                        style={{ top: h * HOUR_HEIGHT }}
                      />
                    ))}

                    {Array.from(byHour.entries()).flatMap(([hour, group]) =>
                      group.map((t, idx) => {
                        const time = taskTime(t)
                        const meta = STATUS_META[t.status]
                        const width = 100 / group.length
                        return (
                          <button
                            type="button"
                            key={t.id}
                            onClick={() => dispatch({ type: "SELECT_TASK", taskId: t.id })}
                            className={cn(
                              "absolute rounded-md border px-1.5 py-1 text-left overflow-hidden hover:brightness-125 transition-[filter] cursor-pointer z-10",
                              meta.badge,
                            )}
                            style={{
                              top: (hour + time.getMinutes() / 60) * HOUR_HEIGHT + 1,
                              height: HOUR_HEIGHT - 2,
                              left: `calc(${idx * width}% + 2px)`,
                              width: `calc(${width}% - 4px)`,
                            }}
                            title={t.title}
                          >
                            <span className="block text-[11px] font-semibold leading-tight truncate">
                              {t.title}
                            </span>
                            <span className="block text-[10px] opacity-75 leading-tight">
                              {formatTime(time)}
                            </span>
                          </button>
                        )
                      }),
                    )}

                    {isToday && (
                      <div
                        className="absolute inset-x-0 z-20 pointer-events-none"
                        style={{ top: nowOffset }}
                      >
                        <div className="relative border-t-2 border-red-500">
                          <span className="absolute -left-1 -top-[5px] h-2 w-2 rounded-full bg-red-500" />
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
