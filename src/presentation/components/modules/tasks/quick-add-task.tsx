"use client"

import * as React from "react"
import { Calendar as CalendarIcon, User as UserIcon, Flag, Tag as TagIcon, CornerDownLeft, X, ChevronDown } from "lucide-react"
import { Button } from "@/presentation/components/ui/button"
import { Input } from "@/presentation/components/ui/input"
import { cn } from "@/core/utils"
import { useWorkspace } from "@/presentation/state/workspace-store"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/presentation/components/ui/dropdown-menu"
import { UserAvatar } from "@/presentation/components/user-avatar"
import { PRIORITY_META } from "@/domain/types"

interface QuickAddTaskProps {
  onSave: (data: { 
    title: string; 
    assigneeId?: string; 
    dueDate?: string; 
    priority?: string;
    labels?: string[];
  }) => void
  onCancel: () => void
}

export function QuickAddTask({ onSave, onCancel }: QuickAddTaskProps) {
  const [title, setTitle] = React.useState("")
  const [assigneeId, setAssigneeId] = React.useState<string | undefined>()
  const [dueDate, setDueDate] = React.useState<string | undefined>()
  const [priority, setPriority] = React.useState<string>("medium")
  const [selectedTags, setSelectedTags] = React.useState<string[]>([])
  
  const { users, tags, activeProjectId } = useWorkspace()
  const projectTags = tags.filter(t => t.projectId === activeProjectId)
  const inputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleSave = () => {
    if (title.trim()) {
      onSave({ 
        title: title.trim(),
        assigneeId,
        dueDate,
        priority,
        labels: selectedTags
      })
      setTitle("")
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSave()
    }
    if (e.key === "Escape") {
      onCancel()
    }
  }

  const assignee = users.find(u => u.id === assigneeId)

  // Import getHexColor dynamically or since we imported cn let's import getHexColor at top or import it inline.
  // Actually, let's use the absolute import at top or import it inline.
  const { getHexColor } = require("@/domain/label-colors");

  return (
    <div className="bg-card border border-primary/30 rounded-xl p-3 shadow-lg animate-in fade-in zoom-in-95 duration-200 ring-1 ring-primary/20">
      <div className="flex items-start gap-2 mb-3">
        <Input
          ref={inputRef}
          placeholder="Task Name..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          className="h-auto py-1 px-0 bg-transparent border-none focus-visible:ring-0 text-sm font-medium placeholder:text-muted-foreground/50"
        />
        <Button 
          size="sm" 
          onClick={handleSave}
          className="h-7 px-2 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 gap-1.5"
        >
          Save
          <CornerDownLeft className="h-3 w-3" />
        </Button>
      </div>

      <div className="space-y-1">
        {/* Assignee */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="w-full flex items-center justify-between px-2 py-1.5 rounded-md text-[13px] text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors group">
              <div className="flex items-center gap-2.5">
                <UserIcon className="h-4 w-4 text-muted-foreground/60 group-hover:text-primary transition-colors" />
                {assignee ? (
                  <div className="flex items-center gap-2">
                    <UserAvatar user={assignee} size="xs" />
                    <span>{assignee.name}</span>
                  </div>
                ) : "Add assignee"}
              </div>
              <ChevronDown className="h-3 w-3 opacity-50" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuLabel>Assign to...</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {users.map(user => (
              <DropdownMenuItem key={user.id} onClick={() => setAssigneeId(user.id)}>
                <UserAvatar user={user} size="xs" className="mr-2" />
                {user.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Priority */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="w-full flex items-center justify-between px-2 py-1.5 rounded-md text-[13px] text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors group">
              <div className="flex items-center gap-2.5">
                <Flag className={cn("h-4 w-4 text-muted-foreground/60 group-hover:text-primary transition-colors", 
                  priority === "high" && "text-red-500",
                  priority === "medium" && "text-amber-500",
                  priority === "low" && "text-blue-500"
                )} />
                <span className="capitalize">{priority} priority</span>
              </div>
              <ChevronDown className="h-3 w-3 opacity-50" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {Object.entries(PRIORITY_META).map(([key, meta]) => (
              <DropdownMenuItem key={key} onClick={() => setPriority(key)}>
                <Flag className={cn("h-4 w-4 mr-2", 
                  key === "high" ? "text-red-500" : key === "medium" ? "text-amber-500" : "text-blue-500"
                )} />
                {meta.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Tags */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="w-full flex items-center justify-between px-2 py-1.5 rounded-md text-[13px] text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors group">
              <div className="flex items-center gap-2.5">
                <TagIcon className="h-4 w-4 text-muted-foreground/60 group-hover:text-primary transition-colors" />
                {selectedTags.length > 0 ? `${selectedTags.length} tags selected` : "Add tags"}
              </div>
              <ChevronDown className="h-3 w-3 opacity-50" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            {projectTags.map(tag => (
              <DropdownMenuItem 
                key={tag.id} 
                onClick={() => {
                  setSelectedTags(prev => 
                    prev.includes(tag.id) ? prev.filter(id => id !== tag.id) : [...prev, tag.id]
                  )
                }}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full shadow-sm" style={{ backgroundColor: getHexColor(tag.color) }} />
                  {tag.name}
                </div>
                {selectedTags.includes(tag.id) && <div className="h-1.5 w-1.5 rounded-full bg-primary" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <button className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md text-[13px] text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors group">
          <CalendarIcon className="h-4 w-4 text-muted-foreground/60 group-hover:text-primary transition-colors" />
          Add dates
        </button>
      </div>

      <button 
        onClick={onCancel}
        className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-muted border border-border flex items-center justify-center text-muted-foreground hover:text-foreground shadow-sm transition-colors"
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  )
}
