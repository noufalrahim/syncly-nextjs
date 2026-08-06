"use client"

import * as React from "react"
import { SettingsNav } from "@/presentation/components/settings/settings-nav"
import { LeftSidebar } from "@/presentation/components/left-sidebar"
import { TopHeader } from "@/presentation/components/top-header"
import { MobileBottomNav } from "@/presentation/components/mobile-bottom-nav"

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const [mobileNavOpen, setMobileNavOpen] = React.useState(false)

  return (
    <div className="flex h-screen w-full max-w-[100vw] bg-background text-foreground overflow-hidden">
      <LeftSidebar
        mobileOpen={mobileNavOpen}
        onMobileOpenChange={setMobileNavOpen}
      />

      <main className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0">
        <TopHeader onOpenMenu={() => setMobileNavOpen(true)} />

        <div className="flex-1 overflow-auto">
          <div className="max-w-5xl mx-auto px-4 sm:px-0">
            <div className="px-2 sm:px-6 pt-6 sm:pt-8">
              <h1 className="text-xl sm:text-2xl font-semibold">Settings</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Manage your organisation settings.
              </p>
            </div>
            <SettingsNav />
            <div className="px-2 sm:px-6 py-6">{children}</div>
          </div>
        </div>
      </main>

      <MobileBottomNav onOpenProjects={() => setMobileNavOpen(true)} />
    </div>
  )
}
