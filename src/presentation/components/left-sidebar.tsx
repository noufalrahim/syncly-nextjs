"use client"

import * as React from "react"
import { Button } from "@/presentation/components/ui/button"
import {
  ChevronsUpDown,
  Home,
  Inbox,
  Plus,
  Search,
  Settings,
  Users,
  CheckSquare,
  MoreHorizontal
} from "lucide-react"
import { Skeleton } from "@/presentation/components/ui/skeleton"
import { cn } from "@/core/utils"
import { ProjectSettingsDialog } from "./project-settings-dialog"
import { WorkspaceSettingsDialog } from "./workspace-settings-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/presentation/components/ui/dropdown-menu"
import { AddProjectDialog } from "./add-project-dialog"
import { useRouter } from "next/navigation"
import { useDispatch, useWorkspace, useFilteredProjects } from "@/presentation/state/workspace-store"
import { UserAvatar } from "./user-avatar"
import { signOut } from "next-auth/react"

import { AddWorkspaceDialog } from "./add-workspace-dialog"

export function LeftSidebar() {
  const { 
    activeProjectId, 
    currentUserId, 
    users, 
    workspaces, 
    activeWorkspaceId,
    loading,
    module
  } = useWorkspace()
  const projects = useFilteredProjects()
  const dispatch = useDispatch()
  const router = useRouter()
  const [addProjectOpen, setAddProjectOpen] = React.useState(false)
  const [addWorkspaceOpen, setAddWorkspaceOpen] = React.useState(false)
  const [settingsProjectId, setSettingsProjectId] = React.useState<string | null>(null)
  const [settingsOpen, setSettingsOpen] = React.useState(false)
  const [workspaceSettingsOpen, setWorkspaceSettingsOpen] = React.useState(false)
  
  const me = users.find((u) => u.id === currentUserId)
  const activeWorkspace = workspaces.find((w) => w.id === activeWorkspaceId)
  const meEmail = me?.email

  const handleLogout = () => {
    signOut({ callbackUrl: "/auth/login" })
    router.push("/auth/login")
  }

  return (
    <aside className="hidden md:flex w-60 shrink-0 flex-col bg-sidebar border-r border-sidebar-border">
      {/* Workspace switcher */}
      <div className="flex items-center justify-between pr-2">
        <div className="flex-1 min-w-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="w-full flex items-center gap-2 px-3 py-3 m-2 mr-1 rounded-md hover:bg-sidebar-accent transition-colors text-left group min-w-0"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground font-semibold text-sm shrink-0">
                  {activeWorkspace?.name?.[0] || "S"}
                </span>
                <span className="flex-1 min-w-0">
                  {loading.workspaces ? (
                    <>
                      <Skeleton className="h-4 w-24 mb-1" />
                      <Skeleton className="h-3 w-16" />
                    </>
                  ) : (
                    <>
                      <span className="block text-sm font-semibold truncate group-hover:text-sidebar-accent-foreground">
                        {activeWorkspace?.name || "No Workspace"}
                      </span>
                      <span className="block text-[11px] text-muted-foreground truncate uppercase tracking-tight">
                        {activeWorkspace?.plan || "Personal"} Plan
                      </span>
                    </>
                  )}
                </span>
                <ChevronsUpDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56 ml-2">
              <DropdownMenuLabel>Workspaces</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {workspaces.map((ws) => (
                <DropdownMenuItem 
                  key={ws.id} 
                  onClick={() => dispatch({ type: "SELECT_WORKSPACE", workspaceId: ws.id })}
                  className="cursor-pointer"
                >
                  {ws.name}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer" onClick={() => setAddWorkspaceOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                <span>Add Workspace</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {activeWorkspace && (
          <button
            type="button"
            onClick={() => setWorkspaceSettingsOpen(true)}
            className="h-8 w-8 inline-flex items-center justify-center rounded-md text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors shrink-0"
            title="Workspace settings"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="px-2 pb-2">
        <SidebarSearch />
      </div>

      <nav className="px-2 space-y-0.5" aria-label="Primary">
        <SidebarItem
          icon={<Home className="h-4 w-4" />}
          label="Home"
          active={module === "home"}
          onClick={() => dispatch({ type: "SET_MODULE", module: "home" })}
        />
        <SidebarItem
          icon={<CheckSquare className="h-4 w-4" />}
          label="My Tasks"
          active={module === "my-tasks"}
          onClick={() => dispatch({ type: "SET_MODULE", module: "my-tasks" })}
        />
        <SidebarItem
          icon={<Inbox className="h-4 w-4" />}
          label="Inbox"
          active={module === "inbox"}
          onClick={() => dispatch({ type: "SET_MODULE", module: "inbox" })}
        />
        <SidebarItem
          icon={<Search className="h-4 w-4" />}
          label="Search"
          onClick={() => window.dispatchEvent(new CustomEvent("toggle-spotlight-search"))}
        />
        <SidebarItem
          icon={<Settings className="h-4 w-4" />}
          label="Settings"
          active={module === "settings"}
          onClick={() => dispatch({ type: "SET_MODULE", module: "settings" })}
          disabled={!activeWorkspaceId}
        />
      </nav>

      <div className="mt-5 px-3 flex items-center justify-between">
        <span className="text-[11px] uppercase tracking-wider font-medium text-muted-foreground">
          Projects
        </span>
        <button
          type="button"
          onClick={() => setAddProjectOpen(true)}
          disabled={!activeWorkspaceId}
          className="h-5 w-5 inline-flex items-center justify-center rounded hover:bg-sidebar-accent text-muted-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Add project"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>

      <nav
        className="px-2 mt-1 space-y-0.5 overflow-y-auto flex-1"
        aria-label="Projects"
      >
        {!activeWorkspaceId ? (
          <div className="px-3 py-4 text-center">
            <p className="text-xs text-muted-foreground leading-relaxed">
              Select or Add workspace to view projects
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2 h-7 text-[10px] w-full"
              onClick={() => setAddWorkspaceOpen(true)}
            >
              Add Workspace
            </Button>
          </div>
        ) : loading.projects ? (
          <div className="space-y-1.5 px-2 mt-1">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        ) : (
          <>
            <button
              type="button"
              onClick={() => {
                dispatch({ type: "SELECT_PROJECT", projectId: null })
                if (["home", "my-tasks", "inbox", "settings"].includes(module)) {
                  dispatch({ type: "SET_MODULE", module: "tasks" })
                }
              }}
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
                <div
                  key={p.id}
                  className={cn(
                    "group w-full flex items-center justify-between px-2 py-1.5 rounded-md text-sm transition-colors cursor-pointer",
                    active
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
                  )}
                  onClick={() => {
                    dispatch({ type: "SELECT_PROJECT", projectId: p.id })
                    if (["home", "my-tasks", "inbox", "settings"].includes(module)) {
                      dispatch({ type: "SET_MODULE", module: "tasks" })
                    }
                  }}
                >
                  <div className="flex items-center gap-2 overflow-hidden flex-1">
                    <span className="text-base leading-none w-4 text-center shrink-0" aria-hidden>
                      {p.emoji}
                    </span>
                    <span className="truncate">{p.name}</span>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button 
                        className="h-5 w-5 shrink-0 inline-flex items-center justify-center rounded-md text-muted-foreground hover:bg-black/10 dark:hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity outline-none"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontal className="h-3.5 w-3.5" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={(e) => {
                        e.stopPropagation();
                        setSettingsProjectId(p.id);
                      }}>
                        <Settings className="h-4 w-4 mr-2" />
                        Project Settings
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )
            })}
            {projects.length === 0 && (
              <p className="px-3 py-2 text-[11px] text-muted-foreground italic">No projects yet</p>
            )}
          </>
        )}
      </nav>

      {/* Current user footer */}
      <div className="border-t border-sidebar-border p-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-sidebar-accent transition-colors cursor-pointer group">
              <UserAvatar user={me} size="md" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate group-hover:text-sidebar-accent-foreground">
                  {me?.name || "Guest User"}
                </div>
                <div className="text-[11px] text-muted-foreground truncate">
                  {meEmail || "guest@syncly.com"}
                </div>
              </div>
              <ChevronsUpDown className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" side="right" className="w-56 mb-2">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer" onClick={() => dispatch({ type: "SET_MODULE", module: "settings" })}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Account Settings</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer" onClick={() => setAddWorkspaceOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              <span>Add Workspace</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive" onClick={handleLogout}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <AddProjectDialog
        open={addProjectOpen}
        onOpenChange={setAddProjectOpen}
      />
      <AddWorkspaceDialog
        open={addWorkspaceOpen}
        onOpenChange={setAddWorkspaceOpen}
      />
      <ProjectSettingsDialog
        open={settingsProjectId !== null}
        onOpenChange={(open) => !open && setSettingsProjectId(null)}
        projectId={settingsProjectId}
      />
      <WorkspaceSettingsDialog
        open={workspaceSettingsOpen}
        onOpenChange={setWorkspaceSettingsOpen}
      />
    </aside>
  )
}

function SidebarItem({
  icon,
  label,
  badge,
  active,
  onClick,
  disabled,
}: {
  icon: React.ReactNode
  label: string
  badge?: string
  active?: boolean
  onClick?: () => void
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors",
        active
          ? "bg-sidebar-accent text-sidebar-accent-foreground"
          : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
        disabled && "opacity-50 cursor-not-allowed",
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
  const handleClick = () => {
    window.dispatchEvent(new CustomEvent("toggle-spotlight-search"))
  }
  return (
    <div className="relative cursor-pointer" onClick={handleClick}>
      <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
      <input
        type="search"
        placeholder="Search…"
        readOnly
        className="w-full bg-sidebar-accent/50 border border-transparent focus:border-ring focus:bg-sidebar-accent text-sm rounded-md pl-8 pr-2 py-1.5 outline-none placeholder:text-muted-foreground transition-colors cursor-pointer"
      />
      <kbd className="hidden sm:inline-block absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground bg-sidebar px-1 rounded border border-sidebar-border pointer-events-none">
        ⌘K
      </kbd>
    </div>
  )
}
