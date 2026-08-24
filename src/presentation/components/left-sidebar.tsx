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
  CheckSquare,
  MoreHorizontal,
  Check,
  LogOut,
  Layers,
} from "lucide-react"
import { Skeleton } from "@/presentation/components/ui/skeleton"
import { cn } from "@/core/utils"
import { SynclyLogo } from "./syncly-logo"
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
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "@/presentation/components/ui/sheet"

type LeftSidebarProps = {
  mobileOpen?: boolean
  onMobileOpenChange?: (open: boolean) => void
}

export function LeftSidebar({ mobileOpen, onMobileOpenChange }: LeftSidebarProps) {
  return (
    <>
      <aside className="hidden md:flex h-full w-64 shrink-0 flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
        <SidebarBody />
      </aside>

      <Sheet open={mobileOpen} onOpenChange={onMobileOpenChange}>
        <SheetContent
          side="left"
          className="md:hidden w-[min(100%,20rem)] max-w-[20rem] p-0 gap-0 bg-sidebar border-sidebar-border"
        >
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <div className="flex h-full flex-col">
            <SidebarBody onNavigate={() => onMobileOpenChange?.(false)} />
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}

function SidebarBody({ onNavigate }: { onNavigate?: () => void }) {
  const {
    activeProjectId,
    currentUserId,
    users,
    workspaces,
    activeWorkspaceId,
    loading,
    module,
  } = useWorkspace()
  const projects = useFilteredProjects()
  const dispatch = useDispatch()
  const router = useRouter()
  const [addProjectOpen, setAddProjectOpen] = React.useState(false)
  const [addWorkspaceOpen, setAddWorkspaceOpen] = React.useState(false)
  const [settingsProjectId, setSettingsProjectId] = React.useState<string | null>(null)
  const [workspaceSettingsOpen, setWorkspaceSettingsOpen] = React.useState(false)

  const me = users.find((u) => u.id === currentUserId)
  const activeWorkspace = workspaces.find((w) => w.id === activeWorkspaceId)
  const meEmail = me?.email

  const handleLogout = () => {
    signOut({ callbackUrl: "/auth/login" })
    router.push("/auth/login")
  }

  const go = (fn: () => void) => {
    fn()
    onNavigate?.()
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="p-3 pb-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="w-full flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-left outline-none transition-colors hover:bg-sidebar-accent focus-visible:ring-2 focus-visible:ring-sidebar-ring"
            >
              <SynclyLogo size={28} className="shrink-0 [&_svg]:hover:scale-100" />
              <span className="flex-1 min-w-0">
                {loading.workspaces ? (
                  <>
                    <Skeleton className="h-4 w-28 mb-1" />
                    <Skeleton className="h-3 w-16" />
                  </>
                ) : (
                  <>
                    <span className="block text-[13px] font-semibold tracking-tight truncate">
                      {activeWorkspace?.name || "No workspace"}
                    </span>
                    <span className="block text-[11px] text-muted-foreground truncate">
                      {activeWorkspace?.plan || "Personal"} plan
                    </span>
                  </>
                )}
              </span>
              <ChevronsUpDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-60">
            <DropdownMenuLabel>Workspaces</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {workspaces.map((ws) => (
              <DropdownMenuItem
                key={ws.id}
                onClick={() =>
                  go(() =>
                    dispatch({ type: "SELECT_WORKSPACE", workspaceId: ws.id }),
                  )
                }
                className="cursor-pointer"
              >
                <span className="flex-1 truncate">{ws.name}</span>
                {ws.id === activeWorkspaceId && (
                  <Check className="h-4 w-4 text-primary" />
                )}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            {activeWorkspace && (
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => setWorkspaceSettingsOpen(true)}
              >
                <Settings className="h-4 w-4" />
                <span>Workspace settings</span>
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => setAddWorkspaceOpen(true)}
            >
              <Plus className="h-4 w-4" />
              <span>Add workspace</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="px-3 pb-3">
        <SidebarSearch />
      </div>

      <nav className="px-2.5 space-y-0.5" aria-label="Primary">
        <SidebarItem
          icon={<Home className="h-4 w-4" />}
          label="Home"
          active={module === "home"}
          onClick={() => go(() => dispatch({ type: "SET_MODULE", module: "home" }))}
        />
        <SidebarItem
          icon={<CheckSquare className="h-4 w-4" />}
          label="My Tasks"
          active={module === "my-tasks"}
          onClick={() =>
            go(() => dispatch({ type: "SET_MODULE", module: "my-tasks" }))
          }
        />
        <SidebarItem
          icon={<Inbox className="h-4 w-4" />}
          label="Inbox"
          active={module === "inbox"}
          onClick={() => go(() => dispatch({ type: "SET_MODULE", module: "inbox" }))}
        />
        <SidebarItem
          icon={<Settings className="h-4 w-4" />}
          label="Settings"
          active={module === "settings"}
          onClick={() =>
            go(() => dispatch({ type: "SET_MODULE", module: "settings" }))
          }
          disabled={!activeWorkspaceId}
        />
      </nav>

      <div className="mx-3 mt-4 mb-2 h-px bg-sidebar-border" />

      <div className="px-4 mb-1.5 flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground/80">
          Projects
        </span>
        <button
          type="button"
          onClick={() => setAddProjectOpen(true)}
          disabled={!activeWorkspaceId}
          className="h-6 w-6 inline-flex items-center justify-center rounded-md text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Add project"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>

      <nav
        className="px-2.5 space-y-0.5 overflow-y-auto flex-1 min-h-0 pb-2"
        aria-label="Projects"
      >
        {!activeWorkspaceId ? (
          <div className="mx-1 mt-1 rounded-lg border border-dashed border-sidebar-border px-3 py-4 text-center">
            <p className="text-xs text-muted-foreground leading-relaxed">
              Select or add a workspace to view projects
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3 h-7 text-xs w-full"
              onClick={() => setAddWorkspaceOpen(true)}
            >
              Add workspace
            </Button>
          </div>
        ) : loading.projects ? (
          <div className="space-y-1.5 px-1 mt-1">
            <Skeleton className="h-8 w-full rounded-md" />
            <Skeleton className="h-8 w-full rounded-md" />
            <Skeleton className="h-8 w-full rounded-md" />
          </div>
        ) : (
          <>
            <button
              type="button"
              onClick={() =>
                go(() => {
                  dispatch({ type: "SELECT_PROJECT", projectId: null })
                  if (["home", "my-tasks", "inbox", "settings"].includes(module)) {
                    dispatch({ type: "SET_MODULE", module: "tasks" })
                  }
                })
              }
              className={cn(
                "w-full flex items-center gap-2.5 h-8 px-2 rounded-md text-[13px] transition-colors",
                activeProjectId === null && !["home", "my-tasks", "inbox", "settings"].includes(module)
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/70 hover:text-sidebar-foreground",
              )}
            >
              <Layers className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="truncate">All projects</span>
            </button>
            {projects.map((p) => {
              const active = activeProjectId === p.id
              return (
                <div
                  key={p.id}
                  className={cn(
                    "group w-full flex items-center gap-1 h-8 pl-2 pr-1 rounded-md text-[13px] transition-colors cursor-pointer",
                    active
                      ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent/70 hover:text-sidebar-foreground",
                  )}
                  onClick={() =>
                    go(() => {
                      dispatch({ type: "SELECT_PROJECT", projectId: p.id })
                      if (["home", "my-tasks", "inbox", "settings"].includes(module)) {
                        dispatch({ type: "SET_MODULE", module: "tasks" })
                      }
                    })
                  }
                >
                  <div className="flex items-center gap-2.5 overflow-hidden flex-1 min-w-0">
                    <span
                      className="flex h-5 w-5 items-center justify-center rounded text-[13px] leading-none shrink-0 bg-sidebar-accent/80"
                      aria-hidden
                    >
                      {p.emoji}
                    </span>
                    <span className="truncate">{p.name}</span>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        className="h-6 w-6 shrink-0 inline-flex items-center justify-center rounded-md text-muted-foreground hover:bg-black/10 dark:hover:bg-white/10 opacity-100 md:opacity-0 md:group-hover:opacity-100 md:focus-visible:opacity-100 transition-opacity outline-none"
                        onClick={(e) => e.stopPropagation()}
                        aria-label={`${p.name} options`}
                      >
                        <MoreHorizontal className="h-3.5 w-3.5" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation()
                          setSettingsProjectId(p.id)
                        }}
                      >
                        <Settings className="h-4 w-4" />
                        Project settings
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )
            })}
            {projects.length === 0 && (
              <p className="px-2 py-2 text-xs text-muted-foreground">
                No projects yet
              </p>
            )}
          </>
        )}
      </nav>

      <div className="mt-auto border-t border-sidebar-border p-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="w-full flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-left outline-none transition-colors hover:bg-sidebar-accent focus-visible:ring-2 focus-visible:ring-sidebar-ring"
            >
              <UserAvatar user={me} size="md" />
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-medium truncate">
                  {me?.name || "Guest User"}
                </div>
                <div className="text-[11px] text-muted-foreground truncate">
                  {meEmail || "guest@syncly.com"}
                </div>
              </div>
              <ChevronsUpDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" side="top" className="w-56 mb-1">
            <DropdownMenuLabel>My account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() =>
                go(() => dispatch({ type: "SET_MODULE", module: "settings" }))
              }
            >
              <Settings className="h-4 w-4" />
              <span>Account settings</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => setAddWorkspaceOpen(true)}
            >
              <Plus className="h-4 w-4" />
              <span>Add workspace</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              className="cursor-pointer"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <AddProjectDialog open={addProjectOpen} onOpenChange={setAddProjectOpen} />
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
    </div>
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
        "w-full flex items-center gap-2.5 h-8 px-2 rounded-md text-[13px] transition-colors",
        active
          ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
          : "text-sidebar-foreground/70 hover:bg-sidebar-accent/70 hover:text-sidebar-foreground",
        disabled && "opacity-50 cursor-not-allowed",
      )}
    >
      <span className={cn("shrink-0", active ? "text-primary" : "text-muted-foreground")}>
        {icon}
      </span>
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
    <button
      type="button"
      onClick={handleClick}
      className="relative flex w-full items-center gap-2 rounded-lg border border-sidebar-border bg-sidebar-accent/40 px-2.5 h-8 text-[13px] text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
    >
      <Search className="h-3.5 w-3.5 shrink-0" />
      <span className="flex-1 text-left truncate">Search</span>
      <kbd className="hidden sm:inline-flex h-5 items-center rounded border border-sidebar-border bg-sidebar px-1.5 font-sans text-[10px] font-medium text-muted-foreground">
        ⌘K
      </kbd>
    </button>
  )
}
