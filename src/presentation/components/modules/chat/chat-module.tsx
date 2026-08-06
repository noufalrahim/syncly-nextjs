"use client"

import * as React from "react"
import { ChannelSidebar } from "./channel-sidebar"
import { ChatHeader } from "./chat-header"
import { MessageInput } from "./message-input"
import { MessageList } from "./message-list"
import { MemberList } from "./member-list"
import { ThreadSidebar } from "./thread-sidebar"
import { useWorkspace } from "@/presentation/state/workspace-store"
import { useIsMobile } from "@/presentation/hooks/use-mobile"
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "@/presentation/components/ui/sheet"

export function ChatModule() {
  const { channels, activeChannelId } = useWorkspace()
  const channel = channels.find((c) => c.id === activeChannelId)
  const isDM = channel?.type === "dm"
  const isMobile = useIsMobile()
  const [membersOpen, setMembersOpen] = React.useState(false)
  const [activeThreadMessage, setActiveThreadMessage] = React.useState<any>(null)
  const [mobileShowChat, setMobileShowChat] = React.useState(false)

  React.useEffect(() => {
    setActiveThreadMessage(null)
  }, [activeChannelId])

  React.useEffect(() => {
    if (!isMobile) {
      setMobileShowChat(false)
      setMembersOpen(true)
    } else {
      setMembersOpen(false)
    }
  }, [isMobile])

  React.useEffect(() => {
    if (isMobile && activeChannelId) {
      setMobileShowChat(true)
    }
  }, [activeChannelId, isMobile])

  const showSidebar = !isMobile || !mobileShowChat
  const showChat = !isMobile || mobileShowChat

  return (
    <div className="flex flex-1 min-h-0">
      <div className={cnSidebar(showSidebar)}>
        <ChannelSidebar />
      </div>

      <section
        className={cn(
          "flex-1 flex flex-col min-w-0 bg-background",
          !showChat && "hidden",
        )}
      >
        {channel ? (
          <>
            <ChatHeader
              membersOpen={membersOpen && !isDM}
              onToggleMembers={() => setMembersOpen((v) => !v)}
              onBack={
                isMobile
                  ? () => setMobileShowChat(false)
                  : undefined
              }
            />
            <div className="flex-1 flex min-h-0 divide-x divide-border">
              <div className="flex-1 flex flex-col min-w-0 h-full">
                <MessageList onOpenThread={setActiveThreadMessage} />
                <MessageInput />
              </div>
              {activeThreadMessage && !isMobile && (
                <ThreadSidebar
                  parentMessage={activeThreadMessage}
                  onClose={() => setActiveThreadMessage(null)}
                />
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground px-4 text-center">
            {isMobile ? "Select a conversation" : "Loading channels…"}
          </div>
        )}
      </section>

      {channel && !isDM && membersOpen && !isMobile && <MemberList />}

      {channel && !isDM && isMobile && (
        <Sheet open={membersOpen} onOpenChange={setMembersOpen}>
          <SheetContent side="right" className="w-full max-w-[18rem] sm:max-w-[18rem] p-0 gap-0">
            <SheetTitle className="sr-only">Members</SheetTitle>
            <MemberList />
          </SheetContent>
        </Sheet>
      )}

      {activeThreadMessage && isMobile && (
        <Sheet
          open={!!activeThreadMessage}
          onOpenChange={(open) => !open && setActiveThreadMessage(null)}
        >
          <SheetContent side="bottom" className="h-[85vh] p-0 gap-0 rounded-t-2xl">
            <SheetTitle className="sr-only">Thread</SheetTitle>
            <ThreadSidebar
              parentMessage={activeThreadMessage}
              onClose={() => setActiveThreadMessage(null)}
            />
          </SheetContent>
        </Sheet>
      )}
    </div>
  )
}

function cn(...parts: Array<string | false | undefined>) {
  return parts.filter(Boolean).join(" ")
}

function cnSidebar(show: boolean) {
  return cn(
    "shrink-0 flex-col h-full",
    show ? "flex w-full md:w-60" : "hidden md:flex md:w-60",
  )
}
