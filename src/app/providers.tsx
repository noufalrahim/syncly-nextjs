"use client";

import { SessionProvider } from "next-auth/react";
import { WorkspaceProvider } from "@/presentation/state/workspace-store";
import { ThemeProvider } from "@/presentation/components/theme-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        <WorkspaceProvider>{children}</WorkspaceProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}

