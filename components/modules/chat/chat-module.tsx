"use client"

import * as React from "react"
import { ChannelSidebar } from "./channel-sidebar"
import { ChatHeader } from "./chat-header"
import { MessageInput } from "./message-input"
import { MessageList } from "./message-list"
import { MemberList } from "./member-list"
import { useWorkspace } from "@/lib/workspace-store"

export function ChatModule() {
  const { channels, activeChannelId } = useWorkspace()
  const channel = channels.find((c) => c.id === activeChannelId)
  // Member list is only meaningful for channels (DMs are 1:1).
  const isDM = channel?.type === "dm"
  const [membersOpen, setMembersOpen] = React.useState(true)

  return (
    <div className="flex flex-1 min-h-0">
      <ChannelSidebar />
      <section className="flex-1 flex flex-col min-w-0 bg-background">
        <ChatHeader
          membersOpen={membersOpen && !isDM}
          onToggleMembers={() => setMembersOpen((v) => !v)}
        />
        <MessageList />
        <MessageInput />
      </section>
      {!isDM && membersOpen && <MemberList />}
    </div>
  )
}
