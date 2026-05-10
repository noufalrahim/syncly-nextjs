import { AppShell } from "@/presentation/components/app-shell"
import { WorkspaceProvider } from "@/presentation/state/workspace-store"

export default function Page() {
  return (
    <WorkspaceProvider>
      <AppShell />
    </WorkspaceProvider>
  )
}
