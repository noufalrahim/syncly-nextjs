"use client"

import {
  BarChart3,
  Calendar as CalendarIcon,
  CheckSquare,
  FileText,
  FolderOpen,
  Target,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useDispatch, useWorkspace } from "@/lib/workspace-store"
import type { ModuleId } from "@/lib/types"

const MODULES: { id: ModuleId; label: string; icon: React.ReactNode }[] = [
  { id: "tasks", label: "Tasks", icon: <CheckSquare className="h-4 w-4" /> },
  { id: "calendar", label: "Calendar", icon: <CalendarIcon className="h-4 w-4" /> },
  { id: "notes", label: "Notes", icon: <FileText className="h-4 w-4" /> },
  { id: "documents", label: "Documents", icon: <FolderOpen className="h-4 w-4" /> },
  { id: "goals", label: "Goals", icon: <Target className="h-4 w-4" /> },
  { id: "analytics", label: "Analytics", icon: <BarChart3 className="h-4 w-4" /> },
]

export function ModuleNav() {
  const { module } = useWorkspace()
  const dispatch = useDispatch()

  return (
    <div
      className="flex items-center gap-1 px-2 overflow-x-auto"
      role="tablist"
      aria-label="Modules"
    >
      {MODULES.map((m) => {
        const active = m.id === module
        return (
          <button
            key={m.id}
            role="tab"
            aria-selected={active}
            type="button"
            onClick={() => dispatch({ type: "SET_MODULE", module: m.id })}
            className={cn(
              "relative flex items-center gap-1.5 px-3 py-3 text-sm font-medium transition-colors whitespace-nowrap",
              active
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {m.icon}
            {m.label}
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
