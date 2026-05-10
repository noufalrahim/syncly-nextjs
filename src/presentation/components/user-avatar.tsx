import { cn } from "@/core/utils"
import type { User } from "@/domain/types"

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
  user?: User | any
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

  // Calculate initials from name if not provided
  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/)
    if (parts.length === 0) return "?"
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase()
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }

  const initials = user.initials || getInitials(user.name || "User")

  if (user.avatarUrl) {
    return (
      <img
        src={user.avatarUrl}
        alt={user.name}
        className={cn(
          "inline-flex items-center justify-center rounded-full object-cover border border-border/50",
          SIZES[size],
          className,
        )}
      />
    )
  }

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full font-medium text-white shadow-sm ring-1 ring-white/10",
        user.color || "bg-slate-500",
        SIZES[size],
        className,
      )}
      aria-label={user.name}
      title={user.name}
    >
      {initials}
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
