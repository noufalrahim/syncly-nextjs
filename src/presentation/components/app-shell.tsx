"use client"

import * as React from "react"
import { LeftSidebar } from "./left-sidebar"
import { ModuleNav } from "./module-nav"
import { TopHeader } from "./top-header"
import { MobileBottomNav } from "./mobile-bottom-nav"
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
import { LoadingOverlay } from "./ui/loading-overlay"

export function AppShell() {
  const { module, selectedTaskId, loading } = useWorkspace()
  const isGlobalModule = ["home", "my-tasks", "inbox", "settings"].includes(module)
  const [mobileNavOpen, setMobileNavOpen] = React.useState(false)
  const isContentLoading = loading.workspaces || loading.projects || loading.tasks

  return (
    <div className="relative flex h-screen w-full max-w-[100vw] bg-background text-foreground overflow-hidden">
      <LeftSidebar
        mobileOpen={mobileNavOpen}
        onMobileOpenChange={setMobileNavOpen}
      />

      <main className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0">
        <TopHeader onOpenMenu={() => setMobileNavOpen(true)} />
        {!isGlobalModule && (
          <div className="border-b border-border">
            <ModuleNav />
          </div>
        )}

        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
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
        </div>
      </main>

      <MobileBottomNav
        onOpenProjects={() => setMobileNavOpen(true)}
        onCreate={() =>
          window.dispatchEvent(new CustomEvent("toggle-spotlight-search"))
        }
      />

      <LoadingOverlay visible={isContentLoading} />

      {selectedTaskId && <TaskDetailsPanel />}
      <SpotlightSearch />
    </div>
  )
}
