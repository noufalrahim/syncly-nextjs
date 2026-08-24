import { Spinner } from "@/presentation/components/ui/spinner"
import { cn } from "@/core/utils"

export function LoadingOverlay({
  visible,
  className,
  label = "Loading",
}: {
  visible: boolean
  className?: string
  label?: string
}) {
  if (!visible) return null

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={label}
      className={cn(
        "absolute inset-0 z-50 flex items-center justify-center bg-background/40 backdrop-blur-lg pointer-events-auto",
        className,
      )}
    >
      <div className="flex flex-col items-center justify-center">
        <Spinner className="size-10 text-primary" />
      </div>
    </div>
  )
}
