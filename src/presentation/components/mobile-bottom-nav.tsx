"use client"

import {
  CheckSquare,
  FolderKanban,
  Home,
  Inbox,
  Plus,
  Search,
} from "lucide-react"
import { cn } from "@/core/utils"
import { useDispatch, useWorkspace } from "@/presentation/state/workspace-store"

type MobileBottomNavProps = {
  onOpenProjects: () => void
  onCreate?: () => void
}

export function MobileBottomNav({ onOpenProjects, onCreate }: MobileBottomNavProps) {
  const { module } = useWorkspace()
  const dispatch = useDispatch()

  const isProjects =
    !["home", "my-tasks", "inbox", "settings"].includes(module)

  const items = [
    {
      id: "home",
      label: "Home",
      icon: Home,
      active: module === "home",
      onClick: () => dispatch({ type: "SET_MODULE", module: "home" }),
    },
    {
      id: "my-tasks",
      label: "My Tasks",
      icon: CheckSquare,
      active: module === "my-tasks",
      onClick: () => dispatch({ type: "SET_MODULE", module: "my-tasks" }),
    },
    {
      id: "create",
      label: "Create",
      icon: Plus,
      active: false,
      isFab: true,
      onClick: () => onCreate?.(),
    },
    {
      id: "inbox",
      label: "Inbox",
      icon: Inbox,
      active: module === "inbox",
      onClick: () => dispatch({ type: "SET_MODULE", module: "inbox" }),
    },
    {
      id: "projects",
      label: "Projects",
      icon: FolderKanban,
      active: isProjects,
      onClick: onOpenProjects,
    },
  ] as const

  return (
    <nav
      className="md:hidden fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur-lg pb-safe"
      aria-label="Mobile primary"
    >
      <div className="flex h-16 items-end justify-around px-1 pt-1.5 pb-1.5">
        {items.map((item) => {
          if ("isFab" in item && item.isFab) {
            return (
              <button
                key={item.id}
                type="button"
                onClick={item.onClick}
                className="-mt-4 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/25 active:scale-95 transition-transform"
                aria-label="Create"
              >
                <Plus className="h-5 w-5" strokeWidth={2.5} />
              </button>
            )
          }

          const Icon = item.icon
          return (
            <button
              key={item.id}
              type="button"
              onClick={item.onClick}
              className={cn(
                "flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 px-1 py-1 rounded-lg transition-colors",
                item.active
                  ? "text-primary"
                  : "text-muted-foreground active:text-foreground",
              )}
            >
              <Icon className={cn("h-5 w-5", item.active && "stroke-[2.25]")} />
              <span className="text-[10px] font-medium leading-none truncate max-w-full">
                {item.label}
              </span>
            </button>
          )
        })}
      </div>

      <button
        type="button"
        className="sr-only"
        onClick={() => window.dispatchEvent(new CustomEvent("toggle-spotlight-search"))}
      >
        <Search className="h-4 w-4" />
        Search
      </button>
    </nav>
  )
}
