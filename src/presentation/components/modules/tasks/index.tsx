"use client"

import {
  Calendar as CalendarIcon,
  GanttChart,
  LayoutGrid,
  List as ListIcon,
  Table as TableIcon,
} from "lucide-react"
import { cn } from "@/core/utils"
import type { TaskView } from "@/domain/types"
import { useDispatch, useWorkspace } from "@/presentation/state/workspace-store"
import { BoardView } from "./board-view"
import { TableView } from "./table-view"
import { ListView } from "./list-view"
import { GanttView } from "./gantt-view"
import { TaskCalendarView } from "./calendar-view"

const VIEWS: { id: TaskView; label: string; icon: React.ReactNode }[] = [
  { id: "board", label: "Board", icon: <LayoutGrid className="h-3.5 w-3.5" /> },
  { id: "table", label: "Table", icon: <TableIcon className="h-3.5 w-3.5" /> },
  { id: "list", label: "List", icon: <ListIcon className="h-3.5 w-3.5" /> },
  { id: "gantt", label: "Gantt", icon: <GanttChart className="h-3.5 w-3.5" /> },
  {
    id: "calendar",
    label: "Calendar",
    icon: <CalendarIcon className="h-3.5 w-3.5" />,
  },
]

import { AllProjectsView } from "./all-projects-view"

export function TasksModule() {
  const { taskView, activeProjectId } = useWorkspace()
  const dispatch = useDispatch()

  if (activeProjectId === null) {
    return <AllProjectsView />
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex items-center gap-1 px-3 py-2 border-b border-border">
        {VIEWS.map((v) => {
          const active = v.id === taskView
          return (
            <button
              key={v.id}
              type="button"
              onClick={() =>
                dispatch({ type: "SET_TASK_VIEW", view: v.id })
              }
              className={cn(
                "inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors",
                active
                  ? "bg-accent text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/60",
              )}
            >
              {v.icon}
              {v.label}
            </button>
          )
        })}
      </div>

      {taskView === "board" && <BoardView />}
      {taskView === "table" && <TableView />}
      {taskView === "list" && <ListView />}
      {taskView === "gantt" && <GanttView />}
      {taskView === "calendar" && <TaskCalendarView />}
    </div>
  )
}
