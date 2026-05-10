"use client"

import * as React from "react"
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
import { useDispatch, useWorkspace } from "@/presentation/state/workspace-store"

interface AddWorkspaceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddWorkspaceDialog({ open, onOpenChange }: AddWorkspaceDialogProps) {
  const [name, setName] = React.useState("")
  const { currentUserId } = useWorkspace()
  const dispatch = useDispatch()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !currentUserId) return

    try {
      const res = await fetch("/api/workspaces", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          ownerId: currentUserId,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        dispatch({
          type: "ADD_WORKSPACE",
          workspace: {
            id: data.workspace._id,
            name: data.workspace.name,
            ownerId: data.workspace.ownerId,
            plan: data.workspace.plan,
          },
        });
        setName("")
        onOpenChange(false)
      } else {
        console.error("Failed to create workspace");
      }
    } catch (error) {
      console.error("Create workspace error:", error);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Workspace</DialogTitle>
          <DialogDescription className="sr-only">Enter a name for your new workspace to get started.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="ws-name">Workspace Name</Label>
            <Input
              id="ws-name"
              placeholder="e.g. Acme Corp"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>
          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!name.trim()}>
              Create Workspace
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
