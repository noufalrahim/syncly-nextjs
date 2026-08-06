"use client"

import { Bell, Filter, Menu, Plus, Search, SlidersHorizontal } from "lucide-react"
import { useWorkspace } from "@/presentation/state/workspace-store"
import { AvatarStack } from "./user-avatar"

type TopHeaderProps = {
  onOpenMenu?: () => void
}

export function TopHeader({ onOpenMenu }: TopHeaderProps) {
  const { activeProjectId, projects, users, module } = useWorkspace()
  const project = projects.find((p) => p.id === activeProjectId)

  const titleMap: Record<string, string> = {
    tasks: "Tasks",
    calendar: "Calendar",
    notes: "Notes",
    documents: "Documents",
    goals: "Goals",
    analytics: "Analytics",
    chat: "Chat",
    home: "Home",
    "my-tasks": "My Tasks",
    inbox: "Inbox",
    settings: "Settings",
  }

  const isGlobalModule = ["home", "my-tasks", "inbox", "settings"].includes(module)

  return (
    <header className="h-12 md:h-14 shrink-0 border-b border-border bg-background flex items-center px-3 md:px-4 gap-2 md:gap-3">
      <button
        type="button"
        onClick={onOpenMenu}
        className="md:hidden h-9 w-9 inline-flex items-center justify-center rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors shrink-0"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="flex items-center gap-2 min-w-0 flex-1">
        {isGlobalModule ? (
          <span className="text-sm font-semibold truncate">{titleMap[module]}</span>
        ) : project ? (
          <>
            <span className="text-base" aria-hidden>
              {project.emoji}
            </span>
            <span className="text-sm font-semibold truncate">{project.name}</span>
            <span className="hidden sm:inline text-muted-foreground/60">/</span>
            <span className="hidden sm:inline text-sm text-muted-foreground truncate">
              {titleMap[module]}
            </span>
          </>
        ) : (
          <>
            <span className="text-sm font-semibold truncate">All projects</span>
            <span className="hidden sm:inline text-muted-foreground/60">/</span>
            <span className="hidden sm:inline text-sm text-muted-foreground truncate">
              {titleMap[module]}
            </span>
          </>
        )}
      </div>

      <div className="flex items-center gap-1 md:gap-1.5">
        <button
          type="button"
          onClick={() =>
            window.dispatchEvent(new CustomEvent("toggle-spotlight-search"))
          }
          className="md:hidden h-9 w-9 inline-flex items-center justify-center rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Search"
        >
          <Search className="h-4 w-4" />
        </button>
        <button
          type="button"
          className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors"
        >
          <Filter className="h-3.5 w-3.5" />
          Filter
        </button>
        <button
          type="button"
          className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors"
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          View
        </button>
        <div className="hidden md:block h-5 w-px bg-border mx-1" />
        <div className="hidden sm:block">
          <AvatarStack users={users.slice(0, 4)} size="md" />
        </div>
        <button
          type="button"
          className="h-9 w-9 md:h-8 md:w-8 inline-flex items-center justify-center rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
        </button>
        <button
          type="button"
          className="hidden sm:inline-flex ml-1 items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity"
        >
          <Plus className="h-3.5 w-3.5" />
          New
        </button>
      </div>
    </header>
  )
}
