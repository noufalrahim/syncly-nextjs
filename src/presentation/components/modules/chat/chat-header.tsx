"use client"

import { ArrowLeft, Bell, Hash, Pin, Search, Users } from "lucide-react"
import { useWorkspace } from "@/presentation/state/workspace-store"
import { UserAvatar } from "@/presentation/components/user-avatar"
import { PresenceDot } from "./presence-dot"

export function ChatHeader({
  onToggleMembers,
  membersOpen,
  onBack,
}: {
  onToggleMembers: () => void
  membersOpen: boolean
  onBack?: () => void
}) {
  const { channels, activeChannelId, users, currentUserId } = useWorkspace()
  const channel = channels.find((c) => c.id === activeChannelId)
  if (!channel) return null

  const isDM = channel.type === "dm"
  const otherUser = isDM
    ? users.find(
        (u) =>
          u.id === (channel.memberIds.find((id) => id !== currentUserId) ?? channel.memberIds[0]),
      )
    : undefined

  const presenceStatus = "offline"

  return (
    <header className="h-12 md:h-14 shrink-0 flex items-center justify-between gap-2 md:gap-3 px-2 md:px-4 border-b border-border bg-background">
      <div className="flex items-center gap-1.5 md:gap-2 min-w-0">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="md:hidden h-9 w-9 inline-flex items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground shrink-0"
            aria-label="Back to conversations"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        )}
        {isDM && otherUser ? (
          <div className="flex items-center gap-2 min-w-0">
            <span className="relative shrink-0">
              <UserAvatar user={otherUser} size="md" />
              <PresenceDot
                status={presenceStatus}
                className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5"
                ringClass="ring-background"
              />
            </span>
            <div className="min-w-0">
              <div className="text-sm font-semibold truncate">{otherUser.name}</div>
              <div className="text-xs text-muted-foreground capitalize">
                {presenceStatus}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 min-w-0">
            <Hash className="h-5 w-5 text-muted-foreground shrink-0" />
            <h2 className="text-sm font-semibold truncate">{channel.name}</h2>
            {channel.description && (
              <>
                <span className="hidden sm:block h-4 w-px bg-border mx-1" aria-hidden />
                <p className="hidden sm:block text-xs text-muted-foreground truncate">
                  {channel.description}
                </p>
              </>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-0.5 md:gap-1">
        <IconBtn label="Pinned messages" className="hidden sm:inline-flex">
          <Pin className="h-4 w-4" />
        </IconBtn>
        <IconBtn label="Notifications" className="hidden sm:inline-flex">
          <Bell className="h-4 w-4" />
        </IconBtn>
        <IconBtn label="Search in channel" className="hidden sm:inline-flex">
          <Search className="h-4 w-4" />
        </IconBtn>
        {!isDM && (
          <IconBtn
            label={membersOpen ? "Hide members" : "Show members"}
            onClick={onToggleMembers}
            active={membersOpen}
          >
            <Users className="h-4 w-4" />
          </IconBtn>
        )}
      </div>
    </header>
  )
}

function IconBtn({
  children,
  label,
  onClick,
  active,
  className = "",
}: {
  children: React.ReactNode
  label: string
  onClick?: () => void
  active?: boolean
  className?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`h-9 w-9 md:h-8 md:w-8 inline-flex items-center justify-center rounded-md transition-colors ${
        active
          ? "bg-accent text-foreground"
          : "text-muted-foreground hover:bg-accent hover:text-foreground"
      } ${className}`}
    >
      {children}
    </button>
  )
}
