"use client"

import * as React from "react"
import { AtSign, Paperclip, Plus, Send, Smile } from "lucide-react"
import { useDispatch, useWorkspace } from "@/lib/workspace-store"

export function MessageInput() {
  const { channels, activeChannelId, users, currentUserId } = useWorkspace()
  const dispatch = useDispatch()
  const [value, setValue] = React.useState("")
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)

  // Reset draft when switching channels
  React.useEffect(() => {
    setValue("")
    textareaRef.current?.focus()
  }, [activeChannelId])

  // Auto-resize
  React.useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = "auto"
    el.style.height = `${Math.min(el.scrollHeight, 180)}px`
  }, [value])

  const channel = channels.find((c) => c.id === activeChannelId)
  if (!channel) return null

  const placeholder =
    channel.type === "channel"
      ? `Message #${channel.name}`
      : `Message ${
          users.find(
            (u) =>
              u.id ===
              (channel.memberIds.find((id) => id !== currentUserId) ?? channel.memberIds[0]),
          )?.name ?? channel.name
        }`

  const send = () => {
    if (!value.trim()) return
    dispatch({ type: "SEND_MESSAGE", channelId: activeChannelId, body: value })
    setValue("")
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  const canSend = value.trim().length > 0

  return (
    <div className="px-4 pt-1 pb-4 bg-background">
      <div className="rounded-lg border border-border bg-card focus-within:border-muted-foreground/30 transition-colors">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          rows={1}
          className="block w-full resize-none bg-transparent px-3 pt-3 pb-1 text-sm placeholder:text-muted-foreground focus:outline-none max-h-[180px]"
        />
        <div className="flex items-center justify-between px-2 py-1.5">
          <div className="flex items-center gap-0.5">
            <ToolBtn label="Attach file">
              <Paperclip className="h-4 w-4" />
            </ToolBtn>
            <ToolBtn label="Insert emoji">
              <Smile className="h-4 w-4" />
            </ToolBtn>
            <ToolBtn label="Mention someone">
              <AtSign className="h-4 w-4" />
            </ToolBtn>
            <ToolBtn label="More">
              <Plus className="h-4 w-4" />
            </ToolBtn>
          </div>
          <button
            type="button"
            onClick={send}
            disabled={!canSend}
            aria-label="Send message"
            className="h-8 w-8 inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground disabled:bg-accent disabled:text-muted-foreground transition-colors"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
      <p className="mt-1.5 text-[11px] text-muted-foreground px-1">
        <kbd className="font-mono">Enter</kbd> to send,{" "}
        <kbd className="font-mono">Shift + Enter</kbd> for a new line.
      </p>
    </div>
  )
}

function ToolBtn({
  children,
  label,
}: {
  children: React.ReactNode
  label: string
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className="h-8 w-8 inline-flex items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
    >
      {children}
    </button>
  )
}
