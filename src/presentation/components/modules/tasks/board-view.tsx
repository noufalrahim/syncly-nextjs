"use client"

import * as React from "react"
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core"
import { arrayMove } from "@dnd-kit/sortable"
import { Plus } from "lucide-react"
import { useDispatch, useProjectTasks, useProjectColumns, useWorkspace } from "@/presentation/state/workspace-store"
import type { Task, TaskStatus } from "@/domain/types"
import { BoardColumn, BoardColumnSkeleton } from "./board-column"
import { TaskCard } from "./task-card"

export function BoardView() {
  const tasks = useProjectTasks()
  const columns = useProjectColumns()
  const { activeProjectId, projects, loading } = useWorkspace()
  const dispatch = useDispatch()
  const [activeTask, setActiveTask] = React.useState<Task | null>(null)
  const [showAddColumn, setShowAddColumn] = React.useState(false)
  const [newColumnLabel, setNewColumnLabel] = React.useState("")

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  )

  // Sort tasks by order before grouping
  const sortedTasks = React.useMemo(() => {
    return [...tasks].sort((a, b) => (a.order || 0) - (b.order || 0))
  }, [tasks])

  const tasksByColumn = React.useMemo(() => {
    const map: Record<string, Task[]> = {}
    for (const col of columns) {
      map[col.id] = sortedTasks.filter((t) => String(t.columnId) === String(col.id))
    }
    return map
  }, [sortedTasks, columns])

  function handleDragStart(e: DragStartEvent) {
    const task = e.active.data.current?.task as Task | undefined
    if (task) setActiveTask(task)
  }

  async function handleDragEnd(e: DragEndEvent) {
    setActiveTask(null)
    const { active, over } = e
    if (!over) return

    const activeTaskId = String(active.id)
    const overId = String(over.id)

    // Find the task and column
    const activeTaskObj = tasks.find(t => t.id === activeTaskId)
    if (!activeTaskObj) return

    // 1. Dropped over a column directly
    let targetColumnId = over.data.current?.columnId as string | undefined
    let targetIndex = -1

    // 2. Dropped over another task
    if (!targetColumnId && over.data.current?.task) {
      const overTask = over.data.current.task as Task
      targetColumnId = overTask.columnId
      const columnTasks = tasksByColumn[targetColumnId!] || []
      targetIndex = columnTasks.findIndex(t => t.id === overTask.id)
    }

    if (!targetColumnId) return

    const col = columns.find(c => c.id === targetColumnId)
    const newStatus = col?.status || "backlog"

    const columnTasks = [...(tasksByColumn[targetColumnId] || [])]
    const activeIndex = columnTasks.findIndex(t => t.id === activeTaskId)

    let updatedTasks = [...columnTasks]

    if (activeIndex !== -1) {
      // Reordering in same column
      if (targetIndex !== -1) {
        updatedTasks = arrayMove(columnTasks, activeIndex, targetIndex)
      }
    } else {
      // Moving to different column
      if (targetIndex !== -1) {
        updatedTasks.splice(targetIndex, 0, activeTaskObj)
      } else {
        updatedTasks.push(activeTaskObj)
      }
    }

    // Update orders for ALL tasks in the target column
    const patches = updatedTasks.map((t, idx) => ({
      taskId: t.id,
      patch: { 
        columnId: targetColumnId, 
        status: newStatus,
        order: idx 
      }
    }))

    // Apply locally
    patches.forEach(p => dispatch({ type: "UPDATE_TASK", taskId: p.taskId, patch: p.patch }))

    // Persist all changes
    Promise.all(patches.map(p => 
      fetch("/api/tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(p)
      })
    )).catch(err => console.error("Failed to persist task reorder", err))
  }

  async function handleAddTask(columnId: string, status?: TaskStatus, data?: { 
    title: string;
    assigneeId?: string;
    dueDate?: string;
    priority?: string;
    labels?: string[];
  }) {
    const project =
      projects.find((p) => p.id === activeProjectId) ?? projects[0]
    
    if (!project) {
      console.warn("Cannot add task: No project found");
      return;
    }

    const now = new Date().toISOString()
    const defaultDueDate = new Date()
    defaultDueDate.setDate(defaultDueDate.getDate() + 7)
    
    const taskData = {
      title: data?.title ?? "New task",
      description: "",
      status: status ?? "backlog",
      priority: data?.priority ?? "medium",
      assigneeId: data?.assigneeId ?? "u1",
      dueDate: data?.dueDate ?? defaultDueDate.toISOString(),
      startDate: now,
      labels: data?.labels ?? [],
      projectId: project.id,
      columnId: columnId,
      workspaceId: project.workspaceId,
      order: tasksByColumn[columnId]?.length || 0,
      comments: [],
      history: [
        {
          type: "created",
          message: "created this task",
          authorId: "u1",
          createdAt: now,
        },
      ],
      references: [],
      attachments: [],
    }

    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(taskData),
      });

      if (res.ok) {
        const saved = await res.json();
        dispatch({ type: "ADD_TASK", task: { ...saved.task, id: saved.task._id } });
        if (!data) {
          dispatch({ type: "SELECT_TASK", taskId: saved.task._id });
        }
      }
    } catch (error) {
      console.error("Create task error:", error);
    }
  }

  async function handleAddColumn() {
    const label = newColumnLabel.trim()
    if (!label || !activeProjectId) return

    try {
      const res = await fetch("/api/columns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          label,
          status: "backlog",
          projectId: activeProjectId,
          order: columns.length,
        }),
      });

      if (res.ok) {
        const saved = await res.json();
        dispatch({ 
          type: "ADD_COLUMN", 
          label: saved.column.label,
          id: saved.column._id
        });
      }
    } catch (error) {
      console.error("Create column error:", error);
    }

    setNewColumnLabel("")
    setShowAddColumn(false)
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        collisionDetection={closestCorners}
      >
        <div className="flex-1 overflow-x-auto overflow-y-hidden">
          <div className="flex gap-4 p-4 h-full min-w-max">
            {loading.tasks ? (
              <>
                <BoardColumnSkeleton />
                <BoardColumnSkeleton />
                <BoardColumnSkeleton />
                <BoardColumnSkeleton />
              </>
            ) : (
              columns.map((col) => (
                <BoardColumn
                  key={col.id}
                  id={col.id}
                  status={col.status}
                  label={col.label}
                  color={col.color}
                  tasks={tasksByColumn[col.id] ?? []}
                  onAddTask={(data) => handleAddTask(col.id, col.status, data)}
                />
              ))
            )}

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
    </div>
  )
}
