"use client"

import * as React from "react"
import { Plus } from "lucide-react"
import { useDispatch, useWorkspace } from "@/presentation/state/workspace-store"
import { UserAvatar } from "@/presentation/components/user-avatar"
import { PresenceDot } from "./presence-dot"
import { Button } from "@/presentation/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/presentation/components/ui/dialog"
import type { PresenceStatus, User } from "@/domain/types"

const STATUS_LABELS: Record<PresenceStatus, string> = {
  online: "Online",
  away: "Away",
  dnd: "Do not disturb",
  offline: "Offline",
}

export function MemberList() {
  const { channels, activeChannelId, users, tasks, workspaces, activeWorkspaceId, currentUserId } = useWorkspace()
  const dispatch = useDispatch()
  const [addMemberOpen, setAddMemberOpen] = React.useState(false)

  const channel = channels.find((c) => c.id === activeChannelId)
  if (!channel) return null

  const activeWorkspace = workspaces.find((w) => w.id === activeWorkspaceId)
  const isAdmin = activeWorkspace?.ownerId === currentUserId
  const isCustomChannel =
    channel.type === "channel" && channel.name !== "general" && channel.name !== "random"

  const members = channel.memberIds
    .map((id) => users.find((u) => u.id === id))
    .filter((u): u is User => Boolean(u) && !u.isBot)

  const online: User[] = []
  const offline = members

  const activeTaskFor = (userId: string) => {
    const t = tasks.find(
      (t) => t.assigneeId === userId && t.status === "in-progress",
    )
    return t?.title
  }

  const nonMembers = users.filter((u) => !u.isBot && !channel.memberIds.includes(u.id))

  return (
    <aside className="w-60 shrink-0 border-l border-border bg-sidebar/40 flex flex-col">
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold">Members</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {members.length} {members.length === 1 ? "person" : "people"} •{" "}
            {online.length} online
          </p>
        </div>
        {isAdmin && isCustomChannel && (
          <button
            type="button"
            onClick={() => setAddMemberOpen(true)}
            className="p-1 hover:bg-accent rounded text-muted-foreground hover:text-foreground transition-colors"
            title="Add members to group"
          >
            <Plus className="h-4 w-4" />
          </button>
        )}
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

      <Dialog open={addMemberOpen} onOpenChange={setAddMemberOpen}>
        <DialogContent className="sm:max-w-[420px] bg-card border-border">
          <DialogHeader>
            <DialogTitle>Add Members to Group</DialogTitle>
            <DialogDescription>
              Select workspace members to add to #{channel.name}.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[300px] overflow-y-auto space-y-2 py-2">
            {nonMembers.map((u) => (
              <div key={u.id} className="flex items-center justify-between p-2 rounded-md hover:bg-accent/40">
                <div className="flex items-center gap-2.5 min-w-0">
                  <UserAvatar user={u} size="sm" />
                  <span className="text-sm font-medium truncate">{u.name}</span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    dispatch({ type: "ADD_CHANNEL_MEMBER", channelId: channel.id, userId: u.id })
                  }}
                >
                  Add
                </Button>
              </div>
            ))}
            {nonMembers.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                All workspace members are already in this channel.
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setAddMemberOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
