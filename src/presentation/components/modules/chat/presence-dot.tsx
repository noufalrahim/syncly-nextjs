import { cn } from "@/core/utils"
import type { PresenceStatus } from "@/domain/types"

const COLORS: Record<PresenceStatus, string> = {
  online: "bg-emerald-500",
  away: "bg-amber-500",
  dnd: "bg-red-500",
  offline: "bg-zinc-500",
}

export function PresenceDot({
  status,
  className,
  ringClass = "ring-card",
}: {
  status: PresenceStatus
  className?: string
  ringClass?: string
}) {
  return (
    <span
      aria-label={`${status} status`}
      className={cn(
        "block h-2.5 w-2.5 rounded-full ring-2",
        COLORS[status],
        ringClass,
        className,
      )}
    />
  )
}
