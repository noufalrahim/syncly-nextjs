"use client"

import { useWorkspace } from "@/presentation/state/workspace-store"
import { UserAvatar } from "@/presentation/components/user-avatar"
import { PresenceDot } from "./presence-dot"
import type { PresenceStatus, User } from "@/domain/types"

const STATUS_LABELS: Record<PresenceStatus, string> = {
  online: "Online",
  away: "Away",
  dnd: "Do not disturb",
  offline: "Offline",
}

export function MemberList() {
  const { channels, activeChannelId, users, tasks } = useWorkspace()
  const channel = channels.find((c) => c.id === activeChannelId)
  if (!channel) return null

  const members = channel.memberIds
    .map((id) => users.find((u) => u.id === id))
    .filter((u): u is User => Boolean(u))

  // For now, everyone is offline in the clean environment. 
  // In a real app, this would come from a presence service/store.
  const online: User[] = []
  const offline = members

  // Find each member's currently active task as a flavor detail.
  const activeTaskFor = (userId: string) => {
    const t = tasks.find(
      (t) => t.assigneeId === userId && t.status === "in-progress",
    )
    return t?.title
  }

  return (
    <aside className="w-60 shrink-0 border-l border-border bg-sidebar/40 flex flex-col">
      <div className="px-4 py-3 border-b border-border">
        <h3 className="text-sm font-semibold">Members</h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          {members.length} {members.length === 1 ? "person" : "people"} •{" "}
          {online.length} online
        </p>
      </div>

      <div className="flex-1 overflow-y-auto py-2">
        {online.length > 0 && (
          <Section
            label={`Online — ${online.length}`}
            members={online}
            activeTaskFor={activeTaskFor}
          />
        )}
        {offline.length > 0 && (
          <Section
            label={`Offline — ${offline.length}`}
            members={offline}
            activeTaskFor={activeTaskFor}
            dimmed
          />
        )}
      </div>
    </aside>
  )
}

function Section({
  label,
  members,
  activeTaskFor,
  dimmed,
}: {
  label: string
  members: User[]
  activeTaskFor: (id: string) => string | undefined
  dimmed?: boolean
}) {
  return (
    <div className="mb-3">
      <div className="px-4 pt-1 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <ul>
        {members.map((m) => {
          const status: PresenceStatus = "offline"
          const task = activeTaskFor(m.id)
          return (
            <li key={m.id}>
              <button
                type="button"
                className={`w-full flex items-center gap-2.5 px-3 py-1.5 hover:bg-accent transition-colors text-left ${
                  dimmed ? "opacity-60 hover:opacity-100" : ""
                }`}
              >
                <span className="relative shrink-0">
                  <UserAvatar user={m} size="md" />
                  <PresenceDot
                    status={status}
                    className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5"
                    ringClass="ring-sidebar"
                  />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium truncate">{m.name}</span>
                  <span className="block text-[11px] text-muted-foreground truncate">
                    {task ? task : STATUS_LABELS[status]}
                  </span>
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
