"use client"

import * as React from "react"
import { ChannelSidebar } from "./channel-sidebar"
import { ChatHeader } from "./chat-header"
import { MessageInput } from "./message-input"
import { MessageList } from "./message-list"
import { MemberList } from "./member-list"
import { ThreadSidebar } from "./thread-sidebar"
import { useWorkspace } from "@/presentation/state/workspace-store"

export function ChatModule() {
  const { channels, activeChannelId } = useWorkspace()
  const channel = channels.find((c) => c.id === activeChannelId)
  const isDM = channel?.type === "dm"
  const [membersOpen, setMembersOpen] = React.useState(true)
  const [activeThreadMessage, setActiveThreadMessage] = React.useState<any>(null)

  React.useEffect(() => {
    setActiveThreadMessage(null)
  }, [activeChannelId])

  return (
    <div className="flex flex-1 min-h-0">
      <ChannelSidebar />
      <section className="flex-1 flex flex-col min-w-0 bg-background">
        {channel ? (
          <>
            <ChatHeader
              membersOpen={membersOpen && !isDM}
              onToggleMembers={() => setMembersOpen((v) => !v)}
            />
            <div className="flex-1 flex min-h-0 divide-x divide-border">
              <div className="flex-1 flex flex-col min-w-0 h-full">
                <MessageList onOpenThread={setActiveThreadMessage} />
                <MessageInput />
              </div>
              {activeThreadMessage && (
                <ThreadSidebar
                  parentMessage={activeThreadMessage}
                  onClose={() => setActiveThreadMessage(null)}
                />
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground">
            Loading channels…
          </div>
        )}
      </section>
      {channel && !isDM && membersOpen && <MemberList />}
    </div>
  )
}
