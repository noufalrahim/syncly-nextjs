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
import { Popover, PopoverContent, PopoverTrigger } from "@/presentation/components/ui/popover"
import { useDispatch, useWorkspace } from "@/presentation/state/workspace-store"
import EmojiPicker, { Theme } from "emoji-picker-react"
import { Plus, Loader2 } from "lucide-react"
import { useTheme } from "next-themes"

interface AddProjectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const EMOJIS = [
  "🚀", "📁", "📈", "🎨", "🔧", "📱", "🏠", "🌟", "📚", "⚡️",
  "🎯", "🔥", "🌈", "💎", "🧩", "🍔", "🌍", "💡", "🎬", "🎤"
]

export function AddProjectDialog({ open, onOpenChange }: AddProjectDialogProps) {
  const [name, setName] = React.useState("")
  const [emoji, setEmoji] = React.useState(EMOJIS[0])
  const [isMainPickerOpen, setIsMainPickerOpen] = React.useState(false)
  const [isPlusPickerOpen, setIsPlusPickerOpen] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)
  const { activeWorkspaceId } = useWorkspace()
  const { theme } = useTheme()
  const dispatch = useDispatch()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !activeWorkspaceId) return

    setIsLoading(true)
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          emoji,
          color: "blue",
          workspaceId: activeWorkspaceId,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        dispatch({
          type: "ADD_PROJECT",
          project: {
            id: data.project._id,
            name: data.project.name,
            emoji: data.project.emoji,
            color: data.project.color,
            workspaceId: data.project.workspaceId,
          },
        });
        setName("")
        setEmoji(EMOJIS[0])
        onOpenChange(false)
      }
    } catch (error) {
      console.error("Create project error:", error);
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden border-none shadow-2xl">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-xl font-bold">New Project</DialogTitle>
          <DialogDescription className="sr-only">Create a new project by entering a name and selecting an emoji.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="p-6 pt-4 space-y-6">
          <div className="flex items-center gap-4">
            <div className="relative group">
              <Popover open={isMainPickerOpen} onOpenChange={setIsMainPickerOpen}>
                <PopoverTrigger asChild>
                  <button 
                    type="button"
                    className="h-16 w-16 flex items-center justify-center rounded-2xl bg-muted/50 border-2 border-dashed border-border group-hover:border-primary/50 transition-colors text-3xl hover:bg-muted/80"
                  >
                    {emoji}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="p-0 border-none shadow-2xl z-[100]" side="right" align="start">
                  <EmojiPicker
                    onEmojiClick={(emojiData) => {
                      setEmoji(emojiData.emoji)
                      setIsMainPickerOpen(false)
                    }}
                    theme={theme === "dark" ? Theme.DARK : Theme.LIGHT}
                    lazyLoadEmojis={true}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="flex-1 space-y-2">
              <Label htmlFor="name" className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Project Name</Label>
              <Input
                id="name"
                placeholder="e.g. Design System"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
                className="h-11 bg-background/50 border-border/50 focus:border-primary/50 transition-colors text-lg"
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Choose an Icon</Label>
            <div className="grid grid-cols-5 gap-2 max-h-[160px] overflow-y-auto p-1 scrollbar-hide">
              {EMOJIS.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setEmoji(e)}
                  className={`h-12 w-12 flex items-center justify-center rounded-xl text-xl transition-all duration-200 ${
                    emoji === e
                      ? "bg-primary text-primary-foreground scale-110 shadow-lg shadow-primary/25"
                      : "bg-muted/30 hover:bg-muted/60 text-muted-foreground hover:scale-105"
                  }`}
                >
                  {e}
                </button>
              ))}
              <Popover open={isPlusPickerOpen} onOpenChange={setIsPlusPickerOpen}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="h-12 w-12 flex items-center justify-center rounded-xl bg-muted/30 hover:bg-muted/60 text-muted-foreground hover:scale-105 transition-all duration-200 border-2 border-dashed border-border hover:border-primary/50"
                  >
                    <Plus className="h-5 w-5" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="p-0 border-none shadow-2xl z-[100]" side="bottom" align="center">
                  <EmojiPicker
                    onEmojiClick={(emojiData) => {
                      setEmoji(emojiData.emoji)
                      setIsPlusPickerOpen(false)
                    }}
                    theme={theme === "dark" ? Theme.DARK : Theme.LIGHT}
                    lazyLoadEmojis={true}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!name.trim() || isLoading} className="h-11 px-8 font-semibold shadow-lg shadow-primary/20">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Project"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
