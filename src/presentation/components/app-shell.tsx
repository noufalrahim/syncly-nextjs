"use client"

import { LeftSidebar } from "./left-sidebar"
import { ModuleNav } from "./module-nav"
import { TopHeader } from "./top-header"
import { AnalyticsModule } from "./modules/analytics-module"
import { CalendarModule } from "./modules/calendar-module"
import { ChatModule } from "./modules/chat/chat-module"
import { DocumentsModule } from "./modules/documents-module"
import { GoalsModule } from "./modules/goals-module"
import { NotesModule } from "./modules/notes-module"
import { TasksModule } from "./modules/tasks"
import { TaskDetailsPanel } from "./modules/tasks/task-details-panel"
import { useWorkspace } from "@/presentation/state/workspace-store"

import { HomeModule } from "./modules/home-module"
import { MyTasksModule } from "./modules/my-tasks-module"
import { InboxModule } from "./modules/inbox-module"
import { SettingsModule } from "./modules/settings-module"
import { SpotlightSearch } from "./spotlight-search"

export function AppShell() {
  const { module, selectedTaskId } = useWorkspace()
  const isGlobalModule = ["home", "my-tasks", "inbox", "settings"].includes(module)

  return (
    <div className="flex h-screen w-screen bg-background text-foreground overflow-hidden">
      <LeftSidebar />

      <main className="flex-1 flex flex-col min-w-0">
        <TopHeader />
        {!isGlobalModule && (
          <div className="border-b border-border">
            <ModuleNav />
          </div>
        )}

        {module === "tasks" && <TasksModule />}
        {module === "calendar" && <CalendarModule />}
        {module === "notes" && <NotesModule />}
        {module === "documents" && <DocumentsModule />}
        {module === "goals" && <GoalsModule />}
        {module === "analytics" && <AnalyticsModule />}
        {module === "chat" && <ChatModule />}

        {module === "home" && <HomeModule />}
        {module === "my-tasks" && <MyTasksModule />}
        {module === "inbox" && <InboxModule />}
        {module === "settings" && <SettingsModule />}
      </main>

      {selectedTaskId && <TaskDetailsPanel />}
      <SpotlightSearch />
    </div>
  )
}

