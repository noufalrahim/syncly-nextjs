"use client"

import {
  BarChart3,
  Calendar as CalendarIcon,
  CheckSquare,
  FileText,
  FolderOpen,
  MessageSquare,
  Target,
} from "lucide-react"
import { cn } from "@/core/utils"
import { useDispatch, useWorkspace, useProjectChannels } from "@/presentation/state/workspace-store"
import type { ModuleId } from "@/domain/types"

const MODULES: { id: ModuleId; label: string; icon: React.ReactNode }[] = [
  { id: "tasks", label: "Tasks", icon: <CheckSquare className="h-4 w-4" /> },
  { id: "calendar", label: "Calendar", icon: <CalendarIcon className="h-4 w-4" /> },
  { id: "notes", label: "Notes", icon: <FileText className="h-4 w-4" /> },
  { id: "documents", label: "Documents", icon: <FolderOpen className="h-4 w-4" /> },
  { id: "goals", label: "Goals", icon: <Target className="h-4 w-4" /> },
  { id: "analytics", label: "Analytics", icon: <BarChart3 className="h-4 w-4" /> },
  { id: "chat", label: "Chat", icon: <MessageSquare className="h-4 w-4" /> },
]

export function ModuleNav() {
  const { module } = useWorkspace()
  const channels = useProjectChannels()
  const dispatch = useDispatch()

  const chatUnread = channels.reduce((sum, c) => sum + (c.unreadCount || 0), 0)

  return (
    <div
      className="flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 overflow-x-auto scrollbar-none [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      role="tablist"
      aria-label="Modules"
    >
      {MODULES.map((m) => {
        const active = m.id === module
        const showBadge = m.id === "chat" && chatUnread > 0
        return (
          <button
            key={m.id}
            role="tab"
            aria-selected={active}
            type="button"
            onClick={() => dispatch({ type: "SET_MODULE", module: m.id })}
            className={cn(
              "relative flex items-center gap-1.5 px-2.5 sm:px-3 py-2.5 sm:py-3 text-sm font-medium transition-colors whitespace-nowrap shrink-0 touch-manipulation",
              active
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {m.icon}
            <span className="hidden sm:inline">{m.label}</span>
            <span className="sr-only sm:hidden">{m.label}</span>
            {showBadge && (
              <span
                aria-label={`${chatUnread} unread messages`}
                className="ml-0.5 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-semibold tabular-nums"
              >
                {chatUnread > 99 ? "99+" : chatUnread}
              </span>
            )}
            <span
              className={cn(
                "absolute bottom-0 left-2 right-2 h-0.5 rounded-full transition-colors",
                active ? "bg-primary" : "bg-transparent",
              )}
            />
          </button>
        )
      })}
    </div>
  )
}
