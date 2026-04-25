"use client"

import * as React from "react"
import { useDraggable } from "@dnd-kit/core"
import { CSS } from "@dnd-kit/utilities"
import { CalendarDays, MessageSquare, Paperclip, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { labelDotClass } from "@/lib/label-colors"
import { PRIORITY_META, STATUS_META, type Task } from "@/lib/types"
import { useDispatch, useUser, useWorkspace } from "@/lib/workspace-store"
import { UserAvatar } from "@/components/user-avatar"

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
  const { labels } = useWorkspace()
  const assignee = useUser(task.assigneeId)
  const taskLabels = labels.filter((l) => task.labels.includes(l.id))

  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: task.id,
      data: { task },
    })

  const style = transform
    ? { transform: CSS.Translate.toString(transform) }
    : undefined

  const status = STATUS_META[task.status]
  const priority = PRIORITY_META[task.priority]

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={(e) => {
        // ignore drag clicks
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
      <div className="relative flex items-start justify-between gap-2 z-10 pointer-events-none">
        <span
          className={cn(
            "inline-flex items-center gap-1.5 text-[10px] font-medium px-1.5 py-0.5 rounded border",
            status.badge,
          )}
        >
          <span className={cn("h-1.5 w-1.5 rounded-full", status.dot)} />
          {status.label}
        </span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            dispatch({ type: "DELETE_TASK", taskId: task.id })
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

      {taskLabels.length > 0 && (
        <div className="relative z-10 pointer-events-none flex flex-wrap gap-1">
          {taskLabels.map((l) => (
            <span
              key={l.id}
              className="inline-flex items-center gap-1 text-[10px] text-muted-foreground bg-muted/60 px-1.5 py-0.5 rounded"
            >
              <span className={cn("h-1.5 w-1.5 rounded-full", labelDotClass(l.color))} />
              {l.name}
            </span>
          ))}
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
