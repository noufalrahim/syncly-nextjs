import { Suspense } from "react"
import AcceptInvitationPageClient from "./accept-page-client"

function AcceptInvitationFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="text-sm text-muted-foreground">Loading invitation…</div>
    </div>
  )
}

export default function AcceptInvitationPage() {
  return (
    <Suspense fallback={<AcceptInvitationFallback />}>
      <AcceptInvitationPageClient />
    </Suspense>
  )
}
