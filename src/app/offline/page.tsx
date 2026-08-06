export default function OfflinePage() {
  return (
    <main className="min-h-dvh flex flex-col items-center justify-center gap-3 px-6 text-center bg-background text-foreground">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground text-2xl font-bold">
        S
      </div>
      <h1 className="text-xl font-semibold tracking-tight">You&apos;re offline</h1>
      <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
        Syncly needs a connection for live workspace data. Reconnect and try again.
      </p>
      <a
        href="/"
        className="mt-2 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
      >
        Retry
      </a>
    </main>
  )
}
