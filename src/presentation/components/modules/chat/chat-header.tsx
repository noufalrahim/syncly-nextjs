"use client"

import { Bell, Hash, Pin, Search, Users } from "lucide-react"
import { useWorkspace } from "@/presentation/state/workspace-store"
import { UserAvatar } from "@/presentation/components/user-avatar"
import { PresenceDot } from "./presence-dot"

export function ChatHeader({
  onToggleMembers,
  membersOpen,
}: {
  onToggleMembers: () => void
  membersOpen: boolean
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
    <header className="h-14 shrink-0 flex items-center justify-between gap-3 px-4 border-b border-border bg-background">
      <div className="flex items-center gap-2 min-w-0">
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
                <span className="h-4 w-px bg-border mx-1" aria-hidden />
                <p className="text-xs text-muted-foreground truncate">
                  {channel.description}
                </p>
              </>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-1">
        <IconBtn label="Pinned messages">
          <Pin className="h-4 w-4" />
        </IconBtn>
        <IconBtn label="Notifications">
          <Bell className="h-4 w-4" />
        </IconBtn>
        <IconBtn label="Search in channel">
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
}: {
  children: React.ReactNode
  label: string
  onClick?: () => void
  active?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`h-8 w-8 inline-flex items-center justify-center rounded-md transition-colors ${
        active
          ? "bg-accent text-foreground"
          : "text-muted-foreground hover:bg-accent hover:text-foreground"
      }`}
    >
      {children}
    </button>
  )
}
