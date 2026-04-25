import { cn } from "@/lib/utils"
import type { User } from "@/lib/types"

const SIZES = {
  xs: "h-5 w-5 text-[10px]",
  sm: "h-6 w-6 text-[10px]",
  md: "h-7 w-7 text-xs",
  lg: "h-9 w-9 text-sm",
}

export function UserAvatar({
  user,
  size = "sm",
  className,
}: {
  user?: User
  size?: keyof typeof SIZES
  className?: string
}) {
  if (!user) {
    return (
      <span
        className={cn(
          "inline-flex items-center justify-center rounded-full bg-muted text-muted-foreground border border-border",
          SIZES[size],
          className,
        )}
        aria-hidden
      >
        ?
      </span>
    )
  }
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full font-medium text-white shadow-sm",
        user.color,
        SIZES[size],
        className,
      )}
      aria-label={user.name}
      title={user.name}
    >
      {user.initials}
    </span>
  )
}

export function AvatarStack({
  users,
  max = 3,
  size = "sm",
}: {
  users: User[]
  max?: number
  size?: keyof typeof SIZES
}) {
  const visible = users.slice(0, max)
  const rest = users.length - visible.length
  return (
    <div className="flex -space-x-1.5">
      {visible.map((u) => (
        <UserAvatar
          key={u.id}
          user={u}
          size={size}
          className="ring-2 ring-background"
        />
      ))}
      {rest > 0 && (
        <span
          className={cn(
            "inline-flex items-center justify-center rounded-full bg-muted text-muted-foreground border border-border ring-2 ring-background text-[10px] font-medium",
            SIZES[size],
          )}
        >
          +{rest}
        </span>
      )}
    </div>
  )
}
