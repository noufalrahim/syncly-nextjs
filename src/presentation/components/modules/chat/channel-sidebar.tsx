"use client"

import * as React from "react"
import { ChevronDown, Hash, Plus, Search } from "lucide-react"
import { cn } from "@/core/utils"
import { useDispatch, useWorkspace } from "@/presentation/state/workspace-store"
import { UserAvatar } from "@/presentation/components/user-avatar"
import { PresenceDot } from "./presence-dot"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/presentation/components/ui/dialog"
import { Button } from "@/presentation/components/ui/button"
import { Input } from "@/presentation/components/ui/input"
import { Label } from "@/presentation/components/ui/label"
import { Textarea } from "@/presentation/components/ui/textarea"

export function ChannelSidebar() {
  const { channels, activeChannelId, users, currentUserId, workspaces, activeWorkspaceId } = useWorkspace()
  const dispatch = useDispatch()
  const [query, setQuery] = React.useState("")
  const [createOpen, setCreateOpen] = React.useState(false)
  const [chanName, setChanName] = React.useState("")
  const [chanDesc, setChanDesc] = React.useState("")

  const activeWorkspace = workspaces.find((w) => w.id === activeWorkspaceId)
  const isAdmin = activeWorkspace?.ownerId === currentUserId

  const channelList = channels.filter((c) => c.type === "channel")
  const dmList = channels.filter((c) => c.type === "dm")

  const matches = (name: string) =>
    !query || name.toLowerCase().includes(query.toLowerCase())

  const filteredChannels = channelList.filter((c) => matches(c.name))
  const filteredDMs = dmList.filter((c) => matches(c.name))

  const me = users.find((u) => u.id === currentUserId)
  const myStatus = "online"

  return (
    <aside className="w-60 shrink-0 border-r border-border bg-sidebar/60 flex flex-col">
      {/* Workspace header */}
      <div className="h-14 px-4 flex items-center justify-between border-b border-border">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-sm font-semibold truncate">Atlas Workspace</span>
        </div>
        <ChevronDown className="h-4 w-4 text-muted-foreground" />
      </div>

      {/* Search */}
      <div className="px-3 py-3">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search conversations"
            className="w-full pl-8 pr-2 py-1.5 text-sm rounded-md bg-background border border-border focus:outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-3">
        {/* Channels */}
        <SectionHeader
          label="Channels"
          showAdd={isAdmin}
          onAdd={() => setCreateOpen(true)}
        />
        <ul className="mt-1 mb-3 space-y-0.5">
          {filteredChannels.map((c) => {
            const active = c.id === activeChannelId
            const unread = c.unreadCount > 0
            return (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => dispatch({ type: "SELECT_CHANNEL", channelId: c.id })}
                  className={cn(
                    "w-full flex items-center gap-2 pl-2 pr-2 py-1.5 rounded-md text-sm transition-colors",
                    active
                      ? "bg-accent text-foreground"
                      : unread
                        ? "text-foreground hover:bg-accent/60"
                        : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
                  )}
                >
                  <Hash className="h-4 w-4 shrink-0 opacity-70" />
                  <span className={cn("truncate", unread && !active && "font-semibold")}>
                    {c.name}
                  </span>
                  {unread && (
                    <span className="ml-auto inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-semibold">
                      {c.unreadCount}
                    </span>
                  )}
                </button>
              </li>
            )
          })}
          {filteredChannels.length === 0 && (
            <li className="px-2 py-1 text-xs text-muted-foreground">No channels</li>
          )}
        </ul>

        {/* DMs */}
        <SectionHeader label="Direct Messages" />
        <ul className="mt-1 space-y-0.5">
          {filteredDMs.map((c) => {
            const otherId = c.memberIds.find((id) => id !== currentUserId) ?? c.memberIds[0]
            const other = users.find((u) => u.id === otherId)
            if (!other) return null
            const active = c.id === activeChannelId
            const unread = c.unreadCount > 0
            const status = "offline"
            return (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => dispatch({ type: "SELECT_CHANNEL", channelId: c.id })}
                  className={cn(
                    "w-full flex items-center gap-2 pl-2 pr-2 py-1.5 rounded-md text-sm transition-colors",
                    active
                      ? "bg-accent text-foreground"
                      : unread
                        ? "text-foreground hover:bg-accent/60"
                        : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
                  )}
                >
                  <span className="relative shrink-0">
                    <UserAvatar user={other} size="xs" />
                    <PresenceDot
                      status={status}
                      className="absolute -bottom-0.5 -right-0.5 h-2 w-2"
                      ringClass="ring-sidebar"
                    />
                  </span>
                  <span className={cn("truncate", unread && !active && "font-semibold")}>
                    {other.name}
                  </span>
                  {unread && (
                    <span className="ml-auto inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-semibold">
                      {c.unreadCount}
                    </span>
                  )}
                </button>
              </li>
            )
          })}
          {filteredDMs.length === 0 && (
            <li className="px-2 py-1 text-xs text-muted-foreground">No conversations</li>
          )}
        </ul>
      </div>

      {/* Current user footer */}
      <div className="border-t border-border px-3 py-2.5 flex items-center gap-2">
        <span className="relative shrink-0">
          {me && <UserAvatar user={me} size="sm" />}
          <PresenceDot
            status={myStatus}
            className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5"
            ringClass="ring-sidebar"
          />
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-medium truncate">{me?.name}</div>
          <div className="text-xs text-muted-foreground capitalize">{myStatus}</div>
        </div>
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-[425px] bg-card border-border">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              if (!chanName.trim()) return
              (async () => {
                try {
                  const res = await fetch("/api/channels", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      workspaceId: activeWorkspaceId,
                      type: "channel",
                      name: chanName.trim(),
                      description: chanDesc.trim(),
                      memberIds: currentUserId ? [currentUserId] : [],
                    }),
                  });
                  if (res.ok) {
                    const data = await res.json();
                    dispatch({
                      type: "CREATE_CHANNEL",
                      name: data.channel.name,
                      description: data.channel.description,
                      id: data.channel.id,
                      memberIds: data.channel.memberIds,
                    });
                  }
                } catch (error) {
                  console.error("Create channel failed", error);
                }
              })();
              setChanName("")
              setChanDesc("")
              setCreateOpen(false)
            }}
            className="space-y-4"
          >
            <DialogHeader>
              <DialogTitle>Create Group Channel</DialogTitle>
              <DialogDescription>Create a new channel for team discussions.</DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-2">
              <div className="space-y-1">
                <Label htmlFor="channel-name" className="text-xs uppercase font-semibold text-muted-foreground">Channel Name</Label>
                <Input
                  id="channel-name"
                  placeholder="e.g. design-assets"
                  value={chanName}
                  onChange={(e) => setChanName(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="channel-desc" className="text-xs uppercase font-semibold text-muted-foreground">Description</Label>
                <Textarea
                  id="channel-desc"
                  placeholder="What is this channel about?"
                  value={chanDesc}
                  onChange={(e) => setChanDesc(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setCreateOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={!chanName.trim()}>
                Create
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </aside>
  )
}

function SectionHeader({
  label,
  showAdd = false,
  onAdd,
}: {
  label: string
  showAdd?: boolean
  onAdd?: () => void
}) {
  return (
    <div className="group flex items-center justify-between px-2 pt-2 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
      <span>{label}</span>
      {showAdd && (
        <button
          type="button"
          onClick={onAdd}
          className="opacity-0 group-hover:opacity-100 hover:text-foreground transition-opacity"
          aria-label={`Add ${label}`}
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  )
}
