import { Suspense } from "react"
import LoginPageClient from "./login-page-client"

function LoginPageFallback() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background p-4">
      <div className="w-full max-w-[440px] space-y-8">
        <div className="rounded-2xl border border-border bg-card p-8">
          <div className="space-y-2 text-center mb-8">
            <div className="h-7 w-36 mx-auto rounded bg-muted animate-pulse" />
            <div className="h-4 w-52 mx-auto rounded bg-muted/70 animate-pulse" />
          </div>
          <div className="space-y-3">
            <div className="h-11 rounded-md bg-muted/60 animate-pulse" />
            <div className="h-11 rounded-md bg-muted/60 animate-pulse" />
            <div className="h-11 rounded-md bg-muted/60 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginPageFallback />}>
      <LoginPageClient />
    </Suspense>
  )
}
