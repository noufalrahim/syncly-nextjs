"use client";

import { SessionProvider } from "next-auth/react";
import { WorkspaceProvider } from "@/presentation/state/workspace-store";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <WorkspaceProvider>{children}</WorkspaceProvider>
    </SessionProvider>
  );
}
