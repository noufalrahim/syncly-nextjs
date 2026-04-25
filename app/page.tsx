import { AppShell } from "@/components/app-shell"
import { WorkspaceProvider } from "@/lib/workspace-store"

export default function Page() {
  return (
    <WorkspaceProvider>
      <AppShell />
    </WorkspaceProvider>
  )
}
