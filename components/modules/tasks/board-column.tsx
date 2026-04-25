"use client"

import * as React from "react"
import { useDroppable } from "@dnd-kit/core"
import { MoreHorizontal, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { STATUS_META, type Task, type TaskStatus } from "@/lib/types"
import { TaskCard } from "./task-card"

export function BoardColumn({
  id,
  status,
  label,
  tasks,
  onAddTask,
}: {
  id: string
  status?: TaskStatus
  label: string
  tasks: Task[]
  onAddTask: () => void
}) {
  const { setNodeRef, isOver } = useDroppable({
    id,
    data: { status, columnId: id },
  })

  const meta = status ? STATUS_META[status] : null

  return (
    <div className="flex flex-col w-72 shrink-0">
      <div className="flex items-center justify-between px-2 mb-2">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "h-2 w-2 rounded-full",
              meta ? meta.dot : "bg-primary",
            )}
          />
          <h2 className="text-sm font-semibold">{label}</h2>
          <span className="text-xs text-muted-foreground bg-muted/60 px-1.5 py-0.5 rounded">
            {tasks.length}
          </span>
        </div>
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={onAddTask}
            className="h-6 w-6 inline-flex items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            aria-label={`Add task to ${label}`}
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            className="h-6 w-6 inline-flex items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            aria-label={`Column options`}
          >
            <MoreHorizontal className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div
        ref={setNodeRef}
        className={cn(
          "flex-1 min-h-[200px] rounded-lg p-1.5 space-y-2 transition-colors border border-transparent",
          isOver && "bg-accent/40 border-dashed border-primary/40",
        )}
      >
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
        <button
          type="button"
          onClick={onAddTask}
          className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-accent/60 rounded-md border border-dashed border-border/60 hover:border-border transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          Add task
        </button>
      </div>
    </div>
  )
}
