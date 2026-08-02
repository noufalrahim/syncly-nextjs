"use client"

import * as React from "react"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { ArrowDown, ArrowUp } from "lucide-react"
import { cn } from "@/core/utils"
import { STATUS_META } from "@/domain/types"
import { useWorkspace, useProjectTasks, useProjectColumns } from "@/presentation/state/workspace-store"
import { Skeleton } from "@/presentation/components/ui/skeleton"
import { getHexColor } from "@/domain/label-colors"

export function AnalyticsModule() {
  const tasks = useProjectTasks()
  const projectColumns = useProjectColumns()
  const { users, loading } = useWorkspace()

  const stats = React.useMemo(() => {
    const total = tasks.length
    const done = tasks.filter((t) => t.status === "done").length
    const inProgress = tasks.filter((t) => t.status === "in-progress").length
    const overdue = tasks.filter(
      (t) =>
        t.status !== "done" &&
        t.status !== "cancelled" &&
        new Date(t.dueDate) < new Date(),
    ).length
    return { total, done, inProgress, overdue }
  }, [tasks])

  const completionData = React.useMemo(() => {
    const days: { day: string; completed: number; created: number }[] = []
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    for (let i = 13; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)

      const created = tasks.filter((t) => {
        const c = new Date(t.createdAt)
        return (
          c.getFullYear() === d.getFullYear() &&
          c.getMonth() === d.getMonth() &&
          c.getDate() === d.getDate()
        )
      }).length

      const completed = tasks.filter((t) => {
        if (t.status !== "done") return false
        const doneEntry = t.history?.find((h) => h.type === "status" && h.message.includes("Done"))
        const compDate = doneEntry ? new Date(doneEntry.createdAt) : new Date(t.createdAt)
        return (
          compDate.getFullYear() === d.getFullYear() &&
          compDate.getMonth() === d.getMonth() &&
          compDate.getDate() === d.getDate()
        )
      }).length

      days.push({
        day: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        completed,
        created,
      })
    }
    return days
  }, [tasks])

  const statusData = React.useMemo(() => {
    if (projectColumns.length > 0) {
      return projectColumns.map((col) => ({
        name: col.label,
        value: tasks.filter((t) => t.columnId === col.id).length,
        key: col.id,
        color: col.color,
        status: col.status || "backlog",
      }))
    }
    return (
      Object.entries(STATUS_META) as [
        keyof typeof STATUS_META,
        (typeof STATUS_META)[keyof typeof STATUS_META],
      ][]
    ).map(([id, meta]) => ({
      name: meta.label,
      value: tasks.filter((t) => t.status === id).length,
      key: id,
      color: undefined,
      status: id,
    }))
  }, [tasks, projectColumns])

  const STATUS_COLORS: Record<string, string> = {
    cancelled: "var(--color-chart-5)",
    "on-hold": "var(--color-chart-4)",
    backlog: "var(--color-chart-5)",
    "in-progress": "var(--color-chart-2)",
    done: "var(--color-chart-3)",
  }

  const productivityData = React.useMemo(() => {
    return users
      .filter((u) => !u.isBot)
      .map((u) => ({
        name: u.initials,
        fullName: u.name,
        tasks: tasks.filter((t) => t.assigneeId === u.id).length,
        done: tasks.filter((t) => t.assigneeId === u.id && t.status === "done").length,
      }))
  }, [users, tasks])

  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        {loading.tasks ? (
          <>
            <KpiCardSkeleton />
            <KpiCardSkeleton />
            <KpiCardSkeleton />
            <KpiCardSkeleton />
          </>
        ) : (
          <>
            <KpiCard
              label="Total tasks"
              value={stats.total}
              delta={stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0}
              positive
            />
            <KpiCard
              label="Completed"
              value={stats.done}
              delta={stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0}
              positive
            />
            <KpiCard
              label="In progress"
              value={stats.inProgress}
              delta={stats.total > 0 ? Math.round((stats.inProgress / stats.total) * 100) : 0}
            />
            <KpiCard
              label="Overdue"
              value={stats.overdue}
              delta={stats.total > 0 ? Math.round((stats.overdue / stats.total) * 100) : 0}
              positive
              inverse
            />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <ChartCard
          title="Completion trend"
          subtitle="Created vs. completed (14 days)"
          className="lg:col-span-2"
        >
          {loading.tasks ? (
            <Skeleton className="h-[260px] w-full" />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart
                data={completionData}
                margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="completed" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-chart-1)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="var(--color-chart-1)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="created" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-chart-2)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="var(--color-chart-2)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="day"
                  stroke="var(--color-muted-foreground)"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="var(--color-muted-foreground)"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip content={<DarkTooltip />} />
                <Area
                  type="monotone"
                  dataKey="completed"
                  stroke="var(--color-chart-1)"
                  strokeWidth={2}
                  fill="url(#completed)"
                />
                <Area
                  type="monotone"
                  dataKey="created"
                  stroke="var(--color-chart-2)"
                  strokeWidth={2}
                  fill="url(#created)"
                />
                <Legend
                  wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }}
                  iconType="circle"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Status distribution" subtitle="Across all projects">
          {loading.tasks ? (
            <Skeleton className="h-[260px] w-full" />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={statusData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={50}
                  outerRadius={85}
                  paddingAngle={2}
                  stroke="var(--color-background)"
                  strokeWidth={2}
                >
                  {statusData.map((entry) => {
                    const fill = entry.color
                      ? getHexColor(entry.color)
                      : (STATUS_COLORS[entry.status] ?? "var(--color-chart-5)")
                    return <Cell key={entry.key} fill={fill} />
                  })}
                </Pie>
                <Tooltip content={<DarkTooltip />} />
                <Legend
                  wrapperStyle={{ fontSize: "11px" }}
                  iconType="circle"
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard
          title="Workload by teammate"
          subtitle="Total vs. completed"
          className="lg:col-span-3"
        >
          {loading.tasks ? (
            <Skeleton className="h-[240px] w-full" />
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart
                data={productivityData}
                margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
              >
                <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="name"
                  stroke="var(--color-muted-foreground)"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="var(--color-muted-foreground)"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip content={<DarkTooltip />} />
                <Bar
                  dataKey="tasks"
                  fill="var(--color-chart-2)"
                  radius={[4, 4, 0, 0]}
                  name="Total"
                />
                <Bar
                  dataKey="done"
                  fill="var(--color-chart-1)"
                  radius={[4, 4, 0, 0]}
                  name="Done"
                />
                <Legend
                  wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }}
                  iconType="circle"
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>
    </div>
  )
}

function KpiCard({
  label,
  value,
  delta,
  positive,
  inverse,
}: {
  label: string
  value: number
  delta: number
  positive?: boolean
  inverse?: boolean
}) {
  const isUp = delta >= 0
  const good = inverse ? !isUp : isUp
  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="flex items-baseline justify-between mt-1">
        <div className="text-2xl font-semibold tabular-nums">{value}</div>
        <div
          className={cn(
            "inline-flex items-center gap-0.5 text-xs font-medium",
            good ? "text-emerald-400" : "text-red-400",
          )}
        >
          {isUp ? (
            <ArrowUp className="h-3 w-3" />
          ) : (
            <ArrowDown className="h-3 w-3" />
          )}
          {Math.abs(delta)}%
        </div>
      </div>
    </div>
  )
}

function KpiCardSkeleton() {
  return (
    <div className="bg-card border border-border rounded-lg p-4 space-y-3">
      <Skeleton className="h-3 w-1/2" />
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-4 w-12" />
      </div>
    </div>
  )
}

function ChartCard({
  title,
  subtitle,
  children,
  className,
}: {
  title: string
  subtitle?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "bg-card border border-border rounded-lg p-4 flex flex-col",
        className,
      )}
    >
      <div className="mb-2">
        <h3 className="text-sm font-semibold">{title}</h3>
        {subtitle && (
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        )}
      </div>
      <div className="flex-1 min-h-0">{children}</div>
    </div>
  )
}

function DarkTooltip(props: any) {
  if (!props.active || !props.payload) return null
  return (
    <div className="bg-popover border border-border rounded-md shadow-xl px-2.5 py-1.5 text-xs">
      {props.label && (
        <div className="font-medium mb-0.5">{props.label}</div>
      )}
      {props.payload.map((entry: any) => (
        <div
          key={entry.dataKey}
          className="flex items-center gap-1.5 text-muted-foreground"
        >
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="capitalize">{entry.name ?? entry.dataKey}</span>
          <span className="text-foreground font-medium tabular-nums">
            {entry.value}
          </span>
        </div>
      ))}
    </div>
  )
}
