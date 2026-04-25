"use client"

import * as React from "react"
import {
  ChevronsUpDown,
  Home,
  Inbox,
  Plus,
  Search,
  Settings,
  CheckSquare,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useDispatch, useWorkspace } from "@/lib/workspace-store"
import { UserAvatar } from "./user-avatar"

export function LeftSidebar() {
  const { projects, activeProjectId, currentUserId, users } = useWorkspace()
  const dispatch = useDispatch()
  const me = users.find((u) => u.id === currentUserId)

  return (
    <aside className="hidden md:flex w-60 shrink-0 flex-col bg-sidebar border-r border-sidebar-border">
      {/* Workspace switcher */}
      <button
        type="button"
        className="flex items-center gap-2 px-3 py-3 m-2 rounded-md hover:bg-sidebar-accent transition-colors text-left"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground font-semibold text-sm">
          O
        </span>
        <span className="flex-1 min-w-0">
          <span className="block text-sm font-semibold truncate">
            OrientalCorp
          </span>
          <span className="block text-[11px] text-muted-foreground truncate">
            Workspace · Pro
          </span>
        </span>
        <ChevronsUpDown className="h-3.5 w-3.5 text-muted-foreground" />
      </button>

      <div className="px-2 pb-2">
        <SidebarSearch />
      </div>

      <nav className="px-2 space-y-0.5" aria-label="Primary">
        <SidebarItem icon={<Home className="h-4 w-4" />} label="Home" />
        <SidebarItem
          icon={<CheckSquare className="h-4 w-4" />}
          label="My Tasks"
          badge="8"
        />
        <SidebarItem
          icon={<Inbox className="h-4 w-4" />}
          label="Inbox"
          badge="3"
        />
        <SidebarItem icon={<Search className="h-4 w-4" />} label="Search" />
        <SidebarItem icon={<Settings className="h-4 w-4" />} label="Settings" />
      </nav>

      <div className="mt-5 px-3 flex items-center justify-between">
        <span className="text-[11px] uppercase tracking-wider font-medium text-muted-foreground">
          Projects
        </span>
        <button
          type="button"
          className="h-5 w-5 inline-flex items-center justify-center rounded hover:bg-sidebar-accent text-muted-foreground"
          aria-label="Add project"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>

      <nav
        className="px-2 mt-1 space-y-0.5 overflow-y-auto flex-1"
        aria-label="Projects"
      >
        <button
          type="button"
          onClick={() => dispatch({ type: "SELECT_PROJECT", projectId: null })}
          className={cn(
            "w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors",
            activeProjectId === null
              ? "bg-sidebar-accent text-sidebar-accent-foreground"
              : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
          )}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
          <span className="truncate">All projects</span>
        </button>
        {projects.map((p) => {
          const active = activeProjectId === p.id
          return (
            <button
              type="button"
              key={p.id}
              onClick={() =>
                dispatch({ type: "SELECT_PROJECT", projectId: p.id })
              }
              className={cn(
                "w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
              )}
            >
              <span className="text-base leading-none w-4 text-center" aria-hidden>
                {p.emoji}
              </span>
              <span className="truncate flex-1 text-left">{p.name}</span>
            </button>
          )
        })}
      </nav>

      {/* Current user footer */}
      <div className="border-t border-sidebar-border p-2">
        <div className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-sidebar-accent transition-colors cursor-pointer">
          <UserAvatar user={me} size="md" />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate">{me?.name}</div>
            <div className="text-[11px] text-muted-foreground truncate">
              maya@orientalcorp.com
            </div>
          </div>
          <ChevronsUpDown className="h-3.5 w-3.5 text-muted-foreground" />
        </div>
      </div>
    </aside>
  )
}

function SidebarItem({
  icon,
  label,
  badge,
  active,
}: {
  icon: React.ReactNode
  label: string
  badge?: string
  active?: boolean
}) {
  return (
    <button
      type="button"
      className={cn(
        "w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors",
        active
          ? "bg-sidebar-accent text-sidebar-accent-foreground"
          : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
      )}
    >
      <span className="text-muted-foreground">{icon}</span>
      <span className="flex-1 text-left truncate">{label}</span>
      {badge && (
        <span className="text-[10px] font-medium text-muted-foreground bg-sidebar-accent px-1.5 py-0.5 rounded">
          {badge}
        </span>
      )}
    </button>
  )
}

function SidebarSearch() {
  return (
    <div className="relative">
      <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
      <input
        type="search"
        placeholder="Search…"
        className="w-full bg-sidebar-accent/50 border border-transparent focus:border-ring focus:bg-sidebar-accent text-sm rounded-md pl-8 pr-2 py-1.5 outline-none placeholder:text-muted-foreground transition-colors"
      />
      <kbd className="hidden sm:inline-block absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground bg-sidebar px-1 rounded border border-sidebar-border">
        ⌘K
      </kbd>
    </div>
  )
}
