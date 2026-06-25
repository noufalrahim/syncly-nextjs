"use client"

import * as React from "react"
import { X, Send } from "lucide-react"
import { cn } from "@/core/utils"
import { useDispatch, useWorkspace } from "@/presentation/state/workspace-store"
import { UserAvatar } from "@/presentation/components/user-avatar"
import { renderInline } from "./message-list"
import type { ChatMessage, User } from "@/domain/types"

function getMentionQuery(text: string, selectionStart: number) {
  const textBeforeCursor = text.slice(0, selectionStart)
  const lastAtIdx = textBeforeCursor.lastIndexOf("@")
  if (lastAtIdx === -1) return null
  if (lastAtIdx > 0 && !/\s/.test(textBeforeCursor[lastAtIdx - 1])) {
    return null
  }
  const textAfterAt = textBeforeCursor.slice(lastAtIdx + 1)
  if (/\s/.test(textAfterAt)) {
    return null
  }
  return {
    query: textAfterAt,
    index: lastAtIdx,
  }
}

function renderHighlightedText(text: string, memberNames: string[]) {
  if (!text) return ""
  const displayText = text.endsWith("\n") ? text + " " : text
  if (memberNames.length === 0) return displayText

  const escapeRegExp = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const pattern = memberNames.map((name) => escapeRegExp(name)).join('|')
  const regex = new RegExp(`(@(?:${pattern}))`, 'g')

  const parts: React.ReactNode[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null
  let key = 0

  while ((match = regex.exec(displayText)) !== null) {
    if (match.index > lastIndex) {
      parts.push(displayText.slice(lastIndex, match.index))
    }
    const token = match[0]
    parts.push(
      <span
        key={key++}
        className="bg-primary/25 rounded py-0.5"
      >
        {token}
      </span>
    )
    lastIndex = match.index + token.length
  }
  if (lastIndex < displayText.length) {
    parts.push(displayText.slice(lastIndex))
  }
  return parts
}

export function ThreadSidebar({
  parentMessage,
  onClose,
}: {
  parentMessage: ChatMessage
  onClose: () => void
}) {
  const { messages, users, currentUserId, channels, activeTypingBotId } = useWorkspace()
  const dispatch = useDispatch()
  const channel = channels.find((c) => c.id === parentMessage.channelId)
  const [replyBody, setReplyBody] = React.useState("")
  const [mentionState, setMentionState] = React.useState<{ query: string; index: number } | null>(null)
  const [activeIndex, setActiveIndex] = React.useState(0)
  const listRef = React.useRef<HTMLDivElement>(null)
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)
  const overlayRef = React.useRef<HTMLDivElement>(null)

  const sortedMemberNames = React.useMemo(() => {
    if (!channel) return []
    return channel.memberIds
      .map((id) => users.find((u) => u.id === id))
      .filter((u): u is User => Boolean(u))
      .map((u) => u.name)
      .filter(Boolean)
      .sort((a, b) => b.length - a.length)
  }, [channel, users])

  React.useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    if (overlayRef.current) {
      overlayRef.current.scrollTop = el.scrollTop
    }
  }, [replyBody])

  const handleScroll = () => {
    if (textareaRef.current && overlayRef.current) {
      overlayRef.current.scrollTop = textareaRef.current.scrollTop
    }
  }

  const replies = React.useMemo(() => {
    return messages
      .filter((m) => m.parentId === parentMessage.id)
      .sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt))
  }, [messages, parentMessage.id])

  const typingBot = React.useMemo(() => {
    if (!activeTypingBotId) return null
    const bot = users.find((u) => u.id === activeTypingBotId)
    if (!bot || !channel?.memberIds.includes(bot.id)) return null
    const lastMsg = replies.length > 0 ? replies[replies.length - 1] : parentMessage
    if (lastMsg && lastMsg.body.includes(`@${bot.name}`)) {
      return bot
    }
    return null
  }, [activeTypingBotId, users, channel, replies, parentMessage])

  React.useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" })
  }, [replies.length, typingBot])

  const userMap = React.useMemo(
    () => Object.fromEntries(users.map((u) => [u.id, u])) as Record<string, User>,
    [users],
  )

  const parentAuthor = userMap[parentMessage.authorId]

  const handleSend = () => {
    const trimmed = replyBody.trim()
    if (!trimmed) return
    dispatch({
      type: "SEND_MESSAGE",
      channelId: parentMessage.channelId,
      body: trimmed,
      parentId: parentMessage.id,
    })
    setReplyBody("")
    setMentionState(null)
  }

  const filteredUsers = React.useMemo(() => {
    if (!mentionState || !channel) return []
    const q = mentionState.query.toLowerCase()
    const members = channel.memberIds.map((id) => users.find((u) => u.id === id)).filter((u): u is User => Boolean(u))
    return members.filter((u) => u.name.toLowerCase().includes(q))
  }, [users, mentionState, channel])

  React.useEffect(() => {
    setActiveIndex(0)
  }, [filteredUsers.length])

  const insertMention = (user: User) => {
    if (!mentionState) return
    const el = textareaRef.current
    if (!el) return
    const before = replyBody.slice(0, mentionState.index)
    const after = replyBody.slice(el.selectionStart)
    const mentionText = `@${user.name} `
    const newValue = before + mentionText + after
    setReplyBody(newValue)
    setMentionState(null)
    const newCursorPos = before.length + mentionText.length
    setTimeout(() => {
      el.focus()
      el.setSelectionRange(newCursorPos, newCursorPos)
    }, 0)
  }

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value
    setReplyBody(val)
    const pos = e.target.selectionStart
    setMentionState(getMentionQuery(val, pos))
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (mentionState && filteredUsers.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault()
        setActiveIndex((prev) => (prev + 1) % filteredUsers.length)
        return
      }
      if (e.key === "ArrowUp") {
        e.preventDefault()
        setActiveIndex((prev) => (prev - 1 + filteredUsers.length) % filteredUsers.length)
        return
      }
      if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault()
        insertMention(filteredUsers[activeIndex])
        return
      }
      if (e.key === "Escape") {
        e.preventDefault()
        setMentionState(null)
        return
      }
    }

    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <aside className="w-80 shrink-0 border-l border-border bg-sidebar/10 flex flex-col h-full">
      <div className="h-14 px-4 flex items-center justify-between border-b border-border bg-card/30 backdrop-blur-md">
        <div className="flex flex-col">
          <span className="text-sm font-semibold">Thread</span>
          <span className="text-[11px] text-muted-foreground">in reply to {parentAuthor?.name}</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="h-7 w-7 inline-flex items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          aria-label="Close thread"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div ref={listRef} className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        <div className="flex gap-3 pb-4 border-b border-border/40">
          <div className="w-9 shrink-0">
            <UserAvatar user={parentAuthor} size="lg" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2 mb-0.5">
              <span className="text-sm font-semibold">{parentAuthor?.name ?? "Unknown"}</span>
              <span className="text-[10px] text-muted-foreground">
                {new Date(parentMessage.createdAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
              </span>
            </div>
            <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap break-words">
              {renderInline(parentMessage.body, users)}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {replies.map((r) => {
            const author = userMap[r.authorId]
            return (
              <div key={r.id} className="flex gap-3">
                <div className="w-9 shrink-0">
                  <UserAvatar user={author} size="lg" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 mb-0.5">
                    <span className="text-sm font-semibold">{author?.name ?? "Unknown"}</span>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(r.createdAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                    </span>
                  </div>
                  <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap break-words">
                    {renderInline(r.body, users)}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
        {typingBot && (
          <div className="flex items-center gap-2 py-2 text-xs text-muted-foreground animate-pulse">
            <span className="flex gap-0.5 items-center">
              <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60 animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60 animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60 animate-bounce" style={{ animationDelay: "300ms" }} />
            </span>
            <span>🤖 <span className="font-semibold">{typingBot.name}</span> is typing...</span>
          </div>
        )}
      </div>

      <div className="p-3 border-t border-border bg-card/25 relative">
        {mentionState && filteredUsers.length > 0 && (
          <div className="absolute bottom-full left-3 mb-2 w-64 max-h-48 overflow-y-auto bg-popover border border-border rounded-md shadow-lg z-50 p-1 space-y-0.5">
            {filteredUsers.map((u, i) => (
              <button
                key={u.id}
                type="button"
                onClick={() => insertMention(u)}
                className={cn(
                  "w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm text-left transition-colors hover:bg-accent hover:text-foreground",
                  i === activeIndex ? "bg-accent text-foreground" : "text-foreground"
                )}
              >
                <UserAvatar user={u} size="xs" />
                <span className="truncate">{u.name}</span>
              </button>
            ))}
          </div>
        )}

        <div className="relative flex items-center bg-background border border-border rounded-lg focus-within:ring-1 focus-within:ring-ring">
          <div className="relative flex-1 min-w-0">
            <div
              ref={overlayRef}
              className="absolute inset-0 pointer-events-none select-none text-transparent px-3 py-2 text-sm whitespace-pre-wrap break-words overflow-hidden z-0"
            >
              {renderHighlightedText(replyBody, sortedMemberNames)}
            </div>
            <textarea
              ref={textareaRef}
              value={replyBody}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              onScroll={handleScroll}
              placeholder="Reply to thread…"
              className="block w-full px-3 py-2 bg-transparent text-sm resize-none focus:outline-none placeholder:text-muted-foreground/60 max-h-24 min-h-[38px] custom-scrollbar relative z-10"
              rows={1}
            />
          </div>
          <button
            type="button"
            onClick={handleSend}
            disabled={!replyBody.trim()}
            className="h-8 w-8 shrink-0 inline-flex items-center justify-center rounded-md text-muted-foreground hover:text-primary disabled:opacity-40 transition-colors mr-1"
            aria-label="Send reply"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  )
}
