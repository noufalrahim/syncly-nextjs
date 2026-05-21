import { Suspense } from "react"
import SignupPageClient from "./signup-page-client"

function SignupPageFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-[440px] space-y-8">
        <div className="rounded-2xl border border-border bg-card p-8">
          <div className="space-y-2 text-center mb-8">
            <div className="h-7 w-48 mx-auto rounded bg-muted animate-pulse" />
            <div className="h-4 w-56 mx-auto rounded bg-muted/70 animate-pulse" />
          </div>
          <div className="space-y-3">
            <div className="h-11 rounded-md bg-muted/60 animate-pulse" />
            <div className="h-11 rounded-md bg-muted/60 animate-pulse" />
            <div className="grid grid-cols-2 gap-4">
              <div className="h-11 rounded-md bg-muted/60 animate-pulse" />
              <div className="h-11 rounded-md bg-muted/60 animate-pulse" />
            </div>
            <div className="h-11 rounded-md bg-muted/60 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default function SignupPage() {
  return (
    <Suspense fallback={<SignupPageFallback />}>
      <SignupPageClient />
    </Suspense>
  )
}
