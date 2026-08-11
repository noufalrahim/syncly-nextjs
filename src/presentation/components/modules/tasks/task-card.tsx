"use client"

import * as React from "react"
import { toast } from "sonner"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { CalendarDays, MessageSquare, Paperclip, Trash2 } from "lucide-react"
import { cn } from "@/core/utils"
import { labelDotClass, getHexColor } from "@/domain/label-colors"
import { PRIORITY_META, STATUS_META, type Task } from "@/domain/types"
import { useDispatch, useUser, useWorkspace } from "@/presentation/state/workspace-store"
import { UserAvatar } from "@/presentation/components/user-avatar"
import { Skeleton } from "@/presentation/components/ui/skeleton"

function formatShortDate(iso: string) {
  const d = new Date(iso)
  const day = d.getDate()
  const suffix =
    day % 10 === 1 && day !== 11
      ? "st"
      : day % 10 === 2 && day !== 12
        ? "nd"
        : day % 10 === 3 && day !== 13
          ? "rd"
          : "th"
  const month = d.toLocaleString("en-US", { month: "short" })
  return `${day}${suffix} ${month}`
}

export function TaskCard({
  task,
  isOverlay = false,
}: {
  task: Task
  isOverlay?: boolean
}) {
  const dispatch = useDispatch()
  const { tags, columns } = useWorkspace()
  const assignee = useUser(task.assigneeId)
  const taskTags = tags?.filter((t) => task.labels.includes(t.id)) || []
  const column = columns.find(c => c.id === task.columnId)
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: { type: "task", task },
  })

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  }

  const priority = PRIORITY_META[task.priority] || PRIORITY_META.medium

  const columnColor = column?.color || "gray"
  const columnHex = getHexColor(columnColor)

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={(e) => {
        if (isDragging) return
        dispatch({ type: "SELECT_TASK", taskId: task.id })
        e.stopPropagation()
      }}
      className={cn(
        "group relative bg-card border border-border rounded-lg p-3 space-y-2.5 cursor-pointer transition-all",
        "hover:border-border/80 hover:shadow-lg hover:shadow-black/20",
        isDragging && "opacity-40",
        isOverlay && "rotate-2 shadow-2xl shadow-black/40 border-primary/40 cursor-grabbing",
      )}
    >
      {/* Drag handle area: header */}
      <div
        {...attributes}
        {...listeners}
        className="absolute inset-0 z-0"
        aria-label={`Drag ${task.title}`}
      />
      <div className="relative flex items-start justify-between gap-2 z-10">
        {column ? (
          <span
            className="inline-flex items-center gap-1.5 text-[10px] font-semibold px-1.5 py-0.5 rounded border shadow-sm"
            style={{
              backgroundColor: `${columnHex}15`,
              borderColor: `${columnHex}30`,
              color: columnHex,
            }}
          >
            <span 
              className="h-1.5 w-1.5 rounded-full shadow-sm" 
              style={{ backgroundColor: columnHex }}
            />
            {column.label}
          </span>
        ) : (
          <div />
        )}
        <button
          type="button"
          onClick={async (e) => {
            e.stopPropagation()
            dispatch({ type: "DELETE_TASK", taskId: task.id })
            try {
              const res = await fetch(`/api/tasks?taskId=${task.id}`, { method: "DELETE" })
              if (res.ok) {
                toast.success("Task deleted successfully")
              } else {
                toast.error("Failed to delete task")
              }
            } catch (err) {
              console.error("Failed to delete task", err)
              toast.error("Failed to delete task")
            }
          }}
          className="pointer-events-auto opacity-0 group-hover:opacity-100 h-6 w-6 inline-flex items-center justify-center rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
          aria-label="Delete task"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="relative z-10 pointer-events-none">
        <h3 className="text-sm font-medium leading-snug text-pretty">
          {task.title}
        </h3>
        {task.description && (
          <p className="mt-1 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {task.description}
          </p>
        )}
      </div>

      {taskTags.length > 0 && (
        <div className="relative z-10 pointer-events-none flex flex-wrap gap-1">
          {taskTags.map((t) => {
            const tagHex = getHexColor(t.color)
            return (
              <span
                key={t.id}
                className="inline-flex items-center gap-1.5 text-[10px] font-semibold px-1.5 py-0.5 rounded border shadow-sm"
                style={{
                  backgroundColor: `${tagHex}15`,
                  borderColor: `${tagHex}30`,
                  color: tagHex,
                }}
              >
                <span 
                  className="h-1.5 w-1.5 rounded-full shadow-sm" 
                  style={{ backgroundColor: tagHex }}
                />
                {t.name}
              </span>
            )
          })}
        </div>
      )}

      <div className="relative z-10 pointer-events-none flex items-center justify-between pt-1">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <UserAvatar user={assignee} size="xs" />
          <span className="inline-flex items-center gap-1">
            <CalendarDays className="h-3 w-3" />
            {formatShortDate(task.dueDate)}
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {task.comments.length > 0 && (
            <span className="inline-flex items-center gap-0.5">
              <MessageSquare className="h-3 w-3" />
              {task.comments.length}
            </span>
          )}
          {task.attachments.length > 0 && (
            <span className="inline-flex items-center gap-0.5">
              <Paperclip className="h-3 w-3" />
              {task.attachments.length}
            </span>
          )}
          <span
            className={cn(
              "inline-flex items-center gap-0.5 text-[10px] font-medium px-1.5 py-0.5 rounded border",
              priority.badge,
            )}
            title={`${priority.label} priority`}
          >
            <span className="flex items-end gap-0.5 h-2.5">
              {[1, 2, 3].map((i) => (
                <span
                  key={i}
                  className={cn(
                    "w-0.5 rounded-sm",
                    i === 1 ? "h-1" : i === 2 ? "h-1.5" : "h-2.5",
                    i <= priority.bars ? "bg-current" : "bg-current/20",
                  )}
                />
              ))}
            </span>
            {priority.label}
          </span>
        </div>
      </div>
    </div>
  )
}

export function TaskCardSkeleton() {
  return (
    <div className="bg-card border border-border rounded-lg p-3 space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-4" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-5 rounded-full" />
          <Skeleton className="h-3 w-12" />
        </div>
        <Skeleton className="h-4 w-16" />
      </div>
    </div>
  )
}
