"use client";

import { SettingsNav } from "@/presentation/components/settings/settings-nav";
import { LeftSidebar } from "@/presentation/components/left-sidebar";
import { TopHeader } from "@/presentation/components/top-header";

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen w-screen bg-background text-foreground overflow-hidden">
      <LeftSidebar />

      <main className="flex-1 flex flex-col min-w-0">
        <TopHeader />

        <div className="flex-1 overflow-auto">
          <div className="max-w-5xl mx-auto">
            <div className="px-6 pt-8">
              <h1 className="text-2xl font-semibold">Settings</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Manage your organisation settings.
              </p>
            </div>
            <SettingsNav />
            <div className="px-6 py-6">{children}</div>
          </div>
        </div>
      </main>
    </div>
  );
}
