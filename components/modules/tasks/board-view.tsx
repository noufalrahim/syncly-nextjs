"use client"

import * as React from "react"
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core"
import { Plus } from "lucide-react"
import { useDispatch, useProjectTasks, useWorkspace } from "@/lib/workspace-store"
import type { Task, TaskStatus } from "@/lib/types"
import { BoardColumn } from "./board-column"
import { TaskCard } from "./task-card"

export function BoardView() {
  const tasks = useProjectTasks()
  const { columns, activeProjectId, projects } = useWorkspace()
  const dispatch = useDispatch()
  const [activeTask, setActiveTask] = React.useState<Task | null>(null)
  const [showAddColumn, setShowAddColumn] = React.useState(false)
  const [newColumnLabel, setNewColumnLabel] = React.useState("")

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  )

  const tasksByStatus = React.useMemo(() => {
    const map: Record<string, Task[]> = {}
    for (const col of columns) {
      if (col.status) {
        map[col.id] = tasks.filter((t) => t.status === col.status)
      } else {
        map[col.id] = []
      }
    }
    return map
  }, [tasks, columns])

  function handleDragStart(e: DragStartEvent) {
    const task = e.active.data.current?.task as Task | undefined
    if (task) setActiveTask(task)
  }

  function handleDragEnd(e: DragEndEvent) {
    setActiveTask(null)
    const { active, over } = e
    if (!over) return
    const status = over.data.current?.status as TaskStatus | undefined
    if (!status) return
    dispatch({ type: "MOVE_TASK", taskId: String(active.id), status })
  }

  function handleAddTask(status?: TaskStatus) {
    const project =
      projects.find((p) => p.id === activeProjectId) ?? projects[0]
    const now = new Date().toISOString()
    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + 7)
    const newTask: Task = {
      id: `t-${Date.now()}`,
      title: "New task",
      description: "",
      status: status ?? "backlog",
      priority: "medium",
      assigneeId: "u1",
      dueDate: dueDate.toISOString(),
      startDate: now,
      labels: [],
      projectId: project.id,
      comments: [],
      history: [
        {
          id: `h-${Date.now()}`,
          type: "created",
          message: "created this task",
          authorId: "u1",
          createdAt: now,
        },
      ],
      references: [],
      attachments: [],
      createdAt: now,
    }
    dispatch({ type: "ADD_TASK", task: newTask })
    dispatch({ type: "SELECT_TASK", taskId: newTask.id })
  }

  function handleAddColumn() {
    const label = newColumnLabel.trim()
    if (!label) return
    dispatch({ type: "ADD_COLUMN", label })
    setNewColumnLabel("")
    setShowAddColumn(false)
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        <div className="flex gap-4 p-4 h-full min-w-max">
          {columns.map((col) => (
            <BoardColumn
              key={col.id}
              id={col.id}
              status={col.status}
              label={col.label}
              tasks={tasksByStatus[col.id] ?? []}
              onAddTask={() => handleAddTask(col.status)}
            />
          ))}

          {/* Add column */}
          <div className="w-72 shrink-0 pt-7">
            {showAddColumn ? (
              <div className="bg-card border border-border rounded-lg p-2 space-y-2">
                <input
                  autoFocus
                  value={newColumnLabel}
                  onChange={(e) => setNewColumnLabel(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAddColumn()
                    if (e.key === "Escape") {
                      setShowAddColumn(false)
                      setNewColumnLabel("")
                    }
                  }}
                  placeholder="Column name"
                  className="w-full bg-muted/40 border border-border focus:border-ring text-sm rounded px-2 py-1.5 outline-none"
                />
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={handleAddColumn}
                    className="flex-1 px-2 py-1 text-xs font-medium bg-primary text-primary-foreground rounded hover:opacity-90"
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddColumn(false)
                      setNewColumnLabel("")
                    }}
                    className="px-2 py-1 text-xs text-muted-foreground hover:text-foreground"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowAddColumn(true)}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent/60 rounded-lg border border-dashed border-border transition-colors"
              >
                <Plus className="h-4 w-4" />
                New column
              </button>
            )}
          </div>
        </div>
      </div>

      <DragOverlay dropAnimation={null}>
        {activeTask ? <TaskCard task={activeTask} isOverlay /> : null}
      </DragOverlay>
    </DndContext>
  )
}
