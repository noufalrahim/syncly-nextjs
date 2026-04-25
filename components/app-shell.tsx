"use client"

import { LeftSidebar } from "./left-sidebar"
import { ModuleNav } from "./module-nav"
import { TopHeader } from "./top-header"
import { AnalyticsModule } from "./modules/analytics-module"
import { CalendarModule } from "./modules/calendar-module"
import { DocumentsModule } from "./modules/documents-module"
import { GoalsModule } from "./modules/goals-module"
import { NotesModule } from "./modules/notes-module"
import { TasksModule } from "./modules/tasks"
import { TaskDetailsPanel } from "./modules/tasks/task-details-panel"
import { useWorkspace } from "@/lib/workspace-store"

export function AppShell() {
  const { module, selectedTaskId } = useWorkspace()

  return (
    <div className="flex h-screen w-screen bg-background text-foreground overflow-hidden">
      <LeftSidebar />

      <main className="flex-1 flex flex-col min-w-0">
        <TopHeader />
        <div className="border-b border-border">
          <ModuleNav />
        </div>

        {module === "tasks" && <TasksModule />}
        {module === "calendar" && <CalendarModule />}
        {module === "notes" && <NotesModule />}
        {module === "documents" && <DocumentsModule />}
        {module === "goals" && <GoalsModule />}
        {module === "analytics" && <AnalyticsModule />}
      </main>

      {selectedTaskId && <TaskDetailsPanel />}
    </div>
  )
}
