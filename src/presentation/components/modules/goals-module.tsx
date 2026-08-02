"use client"

import * as React from "react"
import { CheckCircle2, Plus, Trash2, Edit3, Loader2 } from "lucide-react"
import { cn } from "@/core/utils"
import type { Goal } from "@/domain/types"
import { useDispatch, useWorkspace, useProjectGoals } from "@/presentation/state/workspace-store"
import { UserAvatar } from "@/presentation/components/user-avatar"
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
import { Textarea } from "@/presentation/components/ui/textarea"

const STATUS_META: Record<
  Goal["status"],
  { label: string; badge: string; bar: string; dot: string }
> = {
  "on-track": {
    label: "On Track",
    badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    bar: "bg-emerald-500",
    dot: "bg-emerald-500",
  },
  "at-risk": {
    label: "At Risk",
    badge: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    bar: "bg-amber-500",
    dot: "bg-amber-500",
  },
  "off-track": {
    label: "Off Track",
    badge: "bg-red-500/10 text-red-400 border-red-500/20",
    bar: "bg-red-500",
    dot: "bg-red-500",
  },
  completed: {
    label: "Completed",
    badge: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    bar: "bg-blue-500",
    dot: "bg-blue-500",
  },
}

function formatDate(iso: string) {
  if (!iso) return ""
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export function GoalsModule() {
  const { users, activeWorkspaceId, activeProjectId, currentUserId } = useWorkspace()
  const goals = useProjectGoals()
  const dispatch = useDispatch()

  const [createOpen, setCreateOpen] = React.useState(false)
  const [editOpen, setEditOpen] = React.useState(false)
  const [selectedGoal, setSelectedGoal] = React.useState<Goal | null>(null)

  const [title, setTitle] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [dueDate, setDueDate] = React.useState("")
  const [ownerId, setOwnerId] = React.useState("")

  const [editTitle, setEditTitle] = React.useState("")
  const [editDescription, setEditDescription] = React.useState("")
  const [editDueDate, setEditDueDate] = React.useState("")
  const [editOwnerId, setEditOwnerId] = React.useState("")
  const [editProgress, setEditProgress] = React.useState(0)
  const [editStatus, setEditStatus] = React.useState<Goal["status"]>("on-track")

  const [deleteOpen, setDeleteOpen] = React.useState(false)

  const [isSubmitting, setIsSubmitting] = React.useState(false)

  React.useEffect(() => {
    if (currentUserId && users.length > 0) {
      setOwnerId(currentUserId)
    }
  }, [currentUserId, users])

  // Clear edit selection when switching projects
  React.useEffect(() => {
    setSelectedGoal(null)
    setEditOpen(false)
    setDeleteOpen(false)
  }, [activeProjectId])

  const completed = goals.filter((g) => g.status === "completed").length
  const onTrack = goals.filter((g) => g.status === "on-track").length
  const atRisk = goals.filter(
    (g) => g.status === "at-risk" || g.status === "off-track",
  ).length

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !dueDate || !ownerId || !activeWorkspaceId || !activeProjectId || isSubmitting) return

    setIsSubmitting(true)
    try {
      const res = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          dueDate,
          ownerId,
          workspaceId: activeWorkspaceId,
          projectId: activeProjectId,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        dispatch({
          type: "ADD_GOAL",
          goal: {
            id: data.goal._id,
            title: data.goal.title,
            description: data.goal.description,
            progress: data.goal.progress,
            status: data.goal.status,
            dueDate: data.goal.dueDate,
            ownerId: data.goal.ownerId,
            workspaceId: data.goal.workspaceId,
            projectId: data.goal.projectId,
          },
        })
        setTitle("")
        setDescription("")
        setDueDate("")
        setCreateOpen(false)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditOpen = (g: Goal) => {
    setSelectedGoal(g)
    setEditTitle(g.title)
    setEditDescription(g.description)
    setEditDueDate(g.dueDate ? g.dueDate.slice(0, 10) : "")
    setEditOwnerId(g.ownerId)
    setEditProgress(g.progress)
    setEditStatus(g.status)
    setEditOpen(true)
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedGoal || !editTitle.trim() || !editDueDate || !editOwnerId || isSubmitting) return

    setIsSubmitting(true)
    try {
      const patch = {
        title: editTitle.trim(),
        description: editDescription.trim(),
        dueDate: editDueDate,
        ownerId: editOwnerId,
        progress: editProgress,
        status: editStatus,
      }

      const res = await fetch("/api/goals", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goalId: selectedGoal.id,
          patch,
        }),
      })

      if (res.ok) {
        dispatch({
          type: "UPDATE_GOAL",
          goalId: selectedGoal.id,
          patch,
        })
        setEditOpen(false)
        setSelectedGoal(null)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedGoal || isSubmitting) return

    setIsSubmitting(true)
    try {
      const res = await fetch(`/api/goals?goalId=${selectedGoal.id}`, {
        method: "DELETE",
      })

      if (res.ok) {
        dispatch({ type: "DELETE_GOAL", goalId: selectedGoal.id })
        setDeleteOpen(false)
        setEditOpen(false)
        setSelectedGoal(null)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex-1 overflow-auto">
      <div className="px-6 py-4 flex items-center justify-between border-b border-border bg-card/30 backdrop-blur-md">
        <div>
          <h2 className="text-base font-semibold">Quarterly goals</h2>
          <p className="text-xs text-muted-foreground">
            Track progress against company OKRs
          </p>
        </div>
        <Button
          onClick={() => setCreateOpen(true)}
          size="sm"
          className="gap-1.5 h-9 bg-primary hover:opacity-90 shadow-lg shadow-primary/20"
        >
          <Plus className="h-3.5 w-3.5" />
          New goal
        </Button>
      </div>

      <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-3">
        <Stat label="On track" value={onTrack} dotClass="bg-emerald-500" />
        <Stat label="At risk" value={atRisk} dotClass="bg-amber-500" />
        <Stat label="Completed" value={completed} dotClass="bg-blue-500" />
      </div>

      <div className="px-6 pb-8 space-y-3">
        {goals.map((g) => {
          const meta = STATUS_META[g.status]
          const owner = users.find((u) => u.id === g.ownerId)
          return (
            <div
              key={g.id}
              onClick={() => handleEditOpen(g)}
              className="bg-card border border-border rounded-xl p-4 hover:border-primary/40 hover:shadow-lg transition-all duration-200 cursor-pointer"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-0.5 rounded-full border",
                        meta.badge,
                      )}
                    >
                      {g.status === "completed" ? (
                        <CheckCircle2 className="h-3 w-3" />
                      ) : (
                        <span className={cn("h-1.5 w-1.5 rounded-full", meta.dot)} />
                      )}
                      {meta.label}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Due {formatDate(g.dueDate)}
                    </span>
                  </div>
                  <h3 className="text-base font-semibold">{g.title}</h3>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {g.description}
                  </p>
                </div>
                <UserAvatar user={owner} size="md" />
              </div>

              <div className="flex items-center gap-3 mt-3">
                <div className="flex-1 h-1.5 bg-muted/50 rounded-full overflow-hidden">
                  <div
                    className={cn("h-full rounded-full transition-all duration-300", meta.bar)}
                    style={{ width: `${g.progress}%` }}
                  />
                </div>
                <span className="text-sm font-semibold tabular-nums w-10 text-right text-foreground/80">
                  {g.progress}%
                </span>
              </div>
            </div>
          )
        })}
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleCreate}>
            <DialogHeader>
              <DialogTitle>New Goal</DialogTitle>
              <DialogDescription className="sr-only">Create a new company goal</DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="goal-title" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Goal Title</Label>
                <Input
                  id="goal-title"
                  placeholder="e.g. Launch Syncly v2.0"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="goal-desc" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Description</Label>
                <Textarea
                  id="goal-desc"
                  placeholder="What does success look like?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="goal-date" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Target Date</Label>
                  <Input
                    id="goal-date"
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="goal-owner" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Owner</Label>
                  <select
                    id="goal-owner"
                    value={ownerId}
                    onChange={(e) => setOwnerId(e.target.value)}
                    className="w-full h-10 px-3 border border-border rounded-lg bg-background text-sm outline-none"
                    required
                  >
                    <option value="">Select owner</option>
                    {users.filter((u) => !u.isBot).map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setCreateOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Goal"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <form onSubmit={handleUpdate}>
            <DialogHeader>
              <DialogTitle>Edit Goal</DialogTitle>
              <DialogDescription className="sr-only">View and modify goal metrics</DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="edit-title" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Goal Title</Label>
                <Input
                  id="edit-title"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-desc" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Description</Label>
                <Textarea
                  id="edit-desc"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="edit-status" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</Label>
                  <select
                    id="edit-status"
                    value={editStatus}
                    onChange={(e) => {
                      const st = e.target.value as Goal["status"]
                      setEditStatus(st)
                      if (st === "completed") setEditProgress(100)
                    }}
                    className="w-full h-10 px-3 border border-border rounded-lg bg-background text-sm outline-none"
                    required
                  >
                    <option value="on-track">On Track</option>
                    <option value="at-risk">At Risk</option>
                    <option value="off-track">Off Track</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="edit-owner" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Owner</Label>
                  <select
                    id="edit-owner"
                    value={editOwnerId}
                    onChange={(e) => setEditOwnerId(e.target.value)}
                    className="w-full h-10 px-3 border border-border rounded-lg bg-background text-sm outline-none"
                    required
                  >
                    {users.filter((u) => !u.isBot).map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="edit-progress" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Progress ({editProgress}%)</Label>
                </div>
                <input
                  id="edit-progress"
                  type="range"
                  min="0"
                  max="100"
                  value={editProgress}
                  onChange={(e) => {
                    const prg = parseInt(e.target.value, 10)
                    setEditProgress(prg)
                    if (prg === 100) setEditStatus("completed")
                    else if (editStatus === "completed") setEditStatus("on-track")
                  }}
                  className="w-full bg-muted accent-primary h-1.5 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit-date" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Target Date</Label>
                <Input
                  id="edit-date"
                  type="date"
                  value={editDueDate}
                  onChange={(e) => setEditDueDate(e.target.value)}
                  required
                />
              </div>
            </div>
            <DialogFooter className="flex items-center justify-between w-full sm:justify-between gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setDeleteOpen(true)}
                className="text-destructive hover:bg-destructive/10 hover:text-destructive gap-1.5"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
              <div className="flex items-center gap-2">
                <Button type="button" variant="ghost" onClick={() => setEditOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Delete Goal</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <span className="font-semibold text-foreground">"{selectedGoal?.title}"</span>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : null}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function Stat({
  label,
  value,
  dotClass,
}: {
  label: string
  value: number
  dotClass: string
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-4 shadow-sm hover:shadow transition-shadow">
      <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        <span className={cn("h-2.5 w-2.5 rounded-full", dotClass)} />
        {label}
      </div>
      <div className="text-2xl font-bold mt-1 tabular-nums text-foreground">{value}</div>
    </div>
  )
}
