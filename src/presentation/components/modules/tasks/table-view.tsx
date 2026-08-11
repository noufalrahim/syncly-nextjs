"use client"

import { cn } from "@/core/utils"
import { toast } from "sonner"
import { labelDotClass, getHexColor } from "@/domain/label-colors"
import { PRIORITY_META, STATUS_META, type TaskPriority } from "@/domain/types"
import { useDispatch, useProjectTasks, useProjectColumns, useWorkspace } from "@/presentation/state/workspace-store"
import { UserAvatar } from "@/presentation/components/user-avatar"
import { Skeleton } from "@/presentation/components/ui/skeleton"

import { useState } from "react"
import { GripVertical, Edit2, Trash2 } from "lucide-react"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

function formatDate(iso: string) {
  if (!iso) return "—"
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })
}

const DEFAULT_COLUMNS = [
  { id: "task", label: "Task" },
  { id: "status", label: "Status" },
  { id: "priority", label: "Priority" },
  { id: "assignee", label: "Assignee" },
  { id: "project", label: "Project" },
  { id: "tags", label: "Tags" },
  { id: "due", label: "Due" },
]

function SortableHeader({ id, label }: { id: string; label: string }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 0,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <th
      ref={setNodeRef}
      style={style}
      className="text-left font-medium px-3 py-2.5 first:pl-4 group relative"
    >
      <div className="flex items-center gap-2">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-muted-foreground/30 hover:text-muted-foreground transition-colors"
        >
          <GripVertical size={14} />
        </button>
        {label}
      </div>
    </th>
  )
}

export function TableView() {
  const tasks = useProjectTasks()
  const projectColumns = useProjectColumns()
  const { users, tags, projects, loading } = useWorkspace()
  const dispatch = useDispatch()

  const [columnOrder, setColumnOrder] = useState(DEFAULT_COLUMNS.map(c => c.id))

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event

    if (over && active.id !== over.id) {
      setColumnOrder((items) => {
        const oldIndex = items.indexOf(active.id as string)
        const newIndex = items.indexOf(over.id as string)
        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }

  const renderCell = (t: any, columnId: string) => {
    const status = projectColumns.find(c => c.id === t.columnId)
    const priority = PRIORITY_META[t.priority as TaskPriority] || PRIORITY_META.medium
    const assignee = users.find((u) => u.id === t.assigneeId)
    const project = projects.find((p) => p.id === t.projectId)
    const taskTags = tags.filter((l) => t.labels.includes(l.id))

    const cellClass = "px-3 py-2.5 first:pl-4"

    switch (columnId) {
      case "task":
        return (
          <td key={columnId} className={cn(cellClass, "font-medium max-w-md")}>
            <div className="truncate">{t.title}</div>
          </td>
        )
      case "status":
        return (
          <td key={columnId} className={cellClass}>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
              {status?.label || "Unassigned"}
            </span>
          </td>
        )
      case "priority":
        return (
          <td key={columnId} className={cellClass}>
            <span
              className={cn(
                "inline-flex items-center text-[11px] font-medium px-1.5 py-0.5 rounded border",
                priority.badge,
              )}
            >
              {priority.label}
            </span>
          </td>
        )
      case "assignee":
        return (
          <td key={columnId} className={cellClass}>
            <div className="flex items-center gap-2">
              <UserAvatar user={assignee} size="xs" />
              <span className="text-muted-foreground truncate">
                {assignee?.name || "Unassigned"}
              </span>
            </div>
          </td>
        )
      case "project":
        return (
          <td key={columnId} className={cn(cellClass, "text-muted-foreground")}>
            {project ? `${project.emoji} ${project.name}` : "—"}
          </td>
        )
      case "tags":
        return (
          <td key={columnId} className={cellClass}>
            <div className="flex flex-wrap gap-1">
              {taskTags.slice(0, 2).map((l) => {
                const tagHex = getHexColor(l.color)
                return (
                  <span
                    key={l.id}
                    className="inline-flex items-center gap-1.5 text-[10px] font-semibold px-1.5 py-0.5 rounded border shadow-sm"
                    style={{
                      backgroundColor: `${tagHex}15`,
                      borderColor: `${tagHex}30`,
                      color: tagHex,
                    }}
                  >
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ backgroundColor: tagHex }}
                    />
                    {l.name}
                  </span>
                )
              })}
              {taskTags.length > 2 && (
                <span className="text-[10px] text-muted-foreground font-semibold">
                  +{taskTags.length - 2}
                </span>
              )}
            </div>
          </td>
        )
      case "due":
        return (
          <td key={columnId} className={cn(cellClass, "text-muted-foreground whitespace-nowrap")}>
            {formatDate(t.dueDate)}
          </td>
        )
      default:
        return <td key={columnId} className={cellClass}>—</td>
    }
  }

  return (
    <div className="flex-1 overflow-auto p-4">
      <div className="rounded-lg border border-border overflow-hidden bg-card">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <table className="w-full text-sm">
             <thead className="bg-muted/30 text-muted-foreground text-xs uppercase tracking-wide">
              <tr>
                <SortableContext
                  items={columnOrder}
                  strategy={horizontalListSortingStrategy}
                >
                  {columnOrder.map((id) => (
                    <SortableHeader
                      key={id}
                      id={id}
                      label={DEFAULT_COLUMNS.find((c) => c.id === id)?.label || ""}
                    />
                  ))}
                </SortableContext>
                <th className="text-right font-medium px-4 py-2.5 w-24 pr-6">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading.tasks ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-t border-border">
                    {columnOrder.map((colId) => (
                      <td key={colId} className="px-3 py-3 first:pl-4">
                        <Skeleton className="h-4 w-full" />
                      </td>
                    ))}
                    <td className="px-4 py-3 pr-6">
                      <Skeleton className="h-4 w-12 ml-auto" />
                    </td>
                  </tr>
                ))
              ) : (
                tasks.map((t) => (
                  <tr
                    key={t.id}
                    onClick={() => dispatch({ type: "SELECT_TASK", taskId: t.id })}
                    className="group border-t border-border hover:bg-accent/30 cursor-pointer transition-colors"
                  >
                    {columnOrder.map((colId) => renderCell(t, colId))}
                    <td className="px-4 py-2.5 text-right w-24 pr-6">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            dispatch({ type: "SELECT_TASK", taskId: t.id })
                          }}
                          className="h-7 w-7 inline-flex items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                          aria-label="Edit task"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={async (e) => {
                            e.stopPropagation()
                            dispatch({ type: "DELETE_TASK", taskId: t.id })
                            try {
                              const res = await fetch(`/api/tasks?taskId=${t.id}`, { method: "DELETE" })
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
                          className="h-7 w-7 inline-flex items-center justify-center rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                          aria-label="Delete task"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </DndContext>
      </div>
    </div>
  )
}
