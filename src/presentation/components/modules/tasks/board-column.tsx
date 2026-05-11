"use client"

import * as React from "react"
import { useDroppable } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { Plus, Trash2, MoreHorizontal, Edit2 } from "lucide-react"
import { cn } from "@/core/utils"
import { type Task, type TaskStatus } from "@/domain/types"
import { TaskCard, TaskCardSkeleton } from "./task-card"
import { QuickAddTask } from "./quick-add-task"
import { useDispatch } from "@/presentation/state/workspace-store"
import { Skeleton } from "@/presentation/components/ui/skeleton"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/presentation/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/presentation/components/ui/dialog"
import { Button } from "@/presentation/components/ui/button"
import { Input } from "@/presentation/components/ui/input"
import { Label } from "@/presentation/components/ui/label"

const COLUMN_COLORS = [
  { id: "gray", hex: "bg-gray-400" },
  { id: "red", hex: "bg-red-500" },
  { id: "orange", hex: "bg-orange-500" },
  { id: "yellow", hex: "bg-yellow-500" },
  { id: "green", hex: "bg-emerald-500" },
  { id: "blue", hex: "bg-blue-500" },
  { id: "purple", hex: "bg-purple-500" },
  { id: "pink", hex: "bg-pink-500" },
]

export function BoardColumn({
  id,
  status,
  label,
  color = "gray",
  tasks,
  onAddTask,
}: {
  id: string
  status?: TaskStatus
  label: string
  color?: string
  tasks: Task[]
  onAddTask: (data?: { 
    title: string;
    assigneeId?: string;
    dueDate?: string;
    priority?: string;
    labels?: string[];
  }) => void
}) {
  const [isAdding, setIsAdding] = React.useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false)
  const [editName, setEditName] = React.useState(label)
  const [editColor, setEditColor] = React.useState(color)
  const dispatch = useDispatch()
  
  const { setNodeRef, isOver } = useDroppable({
    id,
    data: { status, columnId: id },
  })

  const getDotColor = (c: string) => {
    return COLUMN_COLORS.find((col) => col.id === c)?.hex || "bg-gray-400"
  }

  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = editName.trim()
    if (!trimmed) return
    
    dispatch({ type: "UPDATE_COLUMN", columnId: id, patch: { label: trimmed, color: editColor } })
    
    await fetch("/api/columns", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        columnId: id,
        patch: { label: trimmed, color: editColor }
      })
    }).catch(err => console.error("Failed to persist column update", err))
    
    setIsEditDialogOpen(false)
  }

  const handleDelete = async () => {
    dispatch({ type: "DELETE_COLUMN", columnId: id })
    await fetch(`/api/columns?columnId=${id}`, {
      method: "DELETE"
    }).catch(err => console.error("Failed to delete column", err))
  }

  return (
    <>
      <div className="flex flex-col w-72 shrink-0 group/column">
        <div className="flex items-center justify-between px-2 mb-2 h-8">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <span className={cn("h-2 w-2 rounded-full shrink-0", getDotColor(color))} />
            <h2 className="text-sm font-semibold truncate hover:text-primary transition-colors cursor-default">
              {label}
            </h2>
            <span className="text-xs text-muted-foreground bg-muted/60 px-1.5 py-0.5 rounded shrink-0">
              {tasks.length}
            </span>
          </div>
          <div className="flex items-center gap-0.5 ml-2 opacity-0 group-hover/column:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={() => setIsAdding(true)}
              className="h-7 w-7 inline-flex items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              aria-label={`Add task to ${label}`}
            >
              <Plus className="h-4 w-4" />
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="h-7 w-7 inline-flex items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-accent transition-colors outline-none"
                  aria-label="Column options"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem onClick={() => {
                  setEditName(label)
                  setEditColor(color)
                  setIsEditDialogOpen(true)
                }}>
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit column
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDelete} className="text-destructive focus:text-destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete column
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div
          ref={setNodeRef}
          className={cn(
            "flex-1 overflow-y-auto min-h-[200px] rounded-lg p-1.5 space-y-2 transition-colors border border-transparent custom-scrollbar",
            isOver && "bg-accent/40 border-dashed border-primary/40",
          )}
        >
          <SortableContext 
            items={tasks.map(t => t.id)} 
            strategy={verticalListSortingStrategy}
          >
            {tasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </SortableContext>
          
          {isAdding ? (
            <div className="relative pt-1">
              <QuickAddTask 
                onSave={(data) => {
                  onAddTask(data)
                  setIsAdding(false)
                }} 
                onCancel={() => setIsAdding(false)} 
              />
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsAdding(true)}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-accent/60 rounded-md border border-dashed border-border/60 hover:border-border transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              Add task
            </button>
          )}
        </div>
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Column</DialogTitle>
            <DialogDescription className="sr-only">Change the name and color of this column.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSave} className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="col-name">Column Name</Label>
              <Input
                id="col-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label>Column Color</Label>
              <div className="flex flex-wrap gap-2">
                {COLUMN_COLORS.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setEditColor(c.id)}
                    className={cn(
                      "h-8 w-8 rounded-full flex items-center justify-center border-2 transition-all",
                      c.hex,
                      editColor === c.id ? "border-primary scale-110 shadow-lg" : "border-transparent opacity-80 hover:opacity-100 hover:scale-105"
                    )}
                    aria-label={`Select ${c.id} color`}
                  />
                ))}
              </div>
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={!editName.trim()}>
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}

export function BoardColumnSkeleton() {
  return (
    <div className="flex flex-col w-72 shrink-0">
      <div className="flex items-center justify-between px-2 mb-2 h-8">
        <div className="flex items-center gap-2">
          <Skeleton className="h-2 w-2 rounded-full" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-6" />
        </div>
      </div>
      <div className="flex-1 rounded-lg p-1.5 space-y-2 border border-transparent">
        <TaskCardSkeleton />
        <TaskCardSkeleton />
        <TaskCardSkeleton />
      </div>
    </div>
  )
}
