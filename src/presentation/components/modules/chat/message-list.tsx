"use client"

import * as React from "react"
import { Hash, MessageSquarePlus, Smile, MessageSquare } from "lucide-react"
import { cn } from "@/core/utils"
import { useDispatch, useWorkspace } from "@/presentation/state/workspace-store"
import { UserAvatar } from "@/presentation/components/user-avatar"
import type { ChatMessage, User } from "@/domain/types"

const QUICK_REACTIONS = ["👍", "🎉", "🔥", "😂", "🙌", "👀"]

export function MessageList({ onOpenThread }: { onOpenThread: (message: ChatMessage) => void }) {
  const { messages, activeChannelId, users, channels, currentUserId, activeTypingBotId } = useWorkspace()
  const dispatch = useDispatch()
  const scrollRef = React.useRef<HTMLDivElement>(null)
  const bottomRef = React.useRef<HTMLDivElement>(null)

  const channel = channels.find((c) => c.id === activeChannelId)

  const channelMessages = React.useMemo(
    () =>
      messages
        .filter((m) => m.channelId === activeChannelId && !m.parentId)
        .sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt)),
    [messages, activeChannelId],
  )

  const typingBot = React.useMemo(() => {
    if (!activeTypingBotId) return null
    const bot = users.find((u) => u.id === activeTypingBotId)
    if (!bot || !channel?.memberIds.includes(bot.id)) return null
    const lastMsg = channelMessages[channelMessages.length - 1]
    const prefix = bot.name.startsWith("@") ? "" : "@"
    if (lastMsg && !lastMsg.parentId && lastMsg.body.includes(`${prefix}${bot.name}`)) {
      return bot
    }
    return null
  }, [activeTypingBotId, users, channel, channelMessages])

  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" })
  }, [activeChannelId, channelMessages.length, typingBot])

  const userMap = React.useMemo(
    () => Object.fromEntries(users.map((u) => [u.id, u])) as Record<string, User>,
    [users],
  )

  // Group messages: same author within 5 minutes are visually grouped.
  const groups: { authorId: string; messages: ChatMessage[]; firstAt: string }[] = []
  for (const m of channelMessages) {
    const last = groups[groups.length - 1]
    if (
      last &&
      last.authorId === m.authorId &&
      +new Date(m.createdAt) - +new Date(last.messages[last.messages.length - 1].createdAt) <
        5 * 60 * 1000
    ) {
      last.messages.push(m)
    } else {
      groups.push({ authorId: m.authorId, messages: [m], firstAt: m.createdAt })
    }
  }

  // Insert date dividers between groups when the calendar day changes.
  const renderItems: React.ReactNode[] = []
  let lastDay = ""
  for (let i = 0; i < groups.length; i++) {
    const g = groups[i]
    const dayKey = new Date(g.firstAt).toDateString()
    if (dayKey !== lastDay) {
      renderItems.push(<DateDivider key={`d-${dayKey}`} iso={g.firstAt} />)
      lastDay = dayKey
    }
    const author = userMap[g.authorId]
    renderItems.push(
      <MessageGroup
        key={g.messages[0].id}
        author={author}
        messages={g.messages}
        currentUserId={currentUserId || ""}
        userMap={userMap}
        onReact={(messageId, emoji) => {
          (async () => {
            try {
              const res = await fetch("/api/messages", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ messageId, emoji }),
              });
              if (res.ok) {
                dispatch({ type: "TOGGLE_REACTION", messageId, emoji });
              }
            } catch (e) {
              console.error("Toggle reaction failed", e);
            }
          })();
        }}
        allMessages={messages}
        onOpenThread={onOpenThread}
      />,
    )
  }

  if (channelMessages.length === 0) {
    return (
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="h-full flex flex-col items-center justify-center gap-3 px-6 text-center">
          <div className="h-12 w-12 rounded-full bg-accent flex items-center justify-center">
            <MessageSquarePlus className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-base font-semibold">
            This is the start of {channel?.type === "dm" ? "your conversation" : `#${channel?.name}`}
          </h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            {channel?.description ??
              "Send a message to kick things off. Messages are visible to everyone in this channel."}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto">
      {/* Channel intro */}
      {channel && channel.type === "channel" && (
        <div className="px-6 pt-6 pb-4 border-b border-border/60">
          <div className="flex items-center gap-2 mb-2">
            <span className="h-9 w-9 rounded-lg bg-accent inline-flex items-center justify-center">
              <Hash className="h-5 w-5 text-muted-foreground" />
            </span>
            <h2 className="text-lg font-semibold">{channel.name}</h2>
          </div>
          <p className="text-sm text-muted-foreground max-w-2xl">
            Welcome to <span className="font-medium text-foreground">#{channel.name}</span>
            {channel.description ? `. ${channel.description}` : "."}
          </p>
        </div>
      )}

      <div className="py-2">
        {renderItems}
        {typingBot && (
          <div className="flex items-center gap-2 px-6 py-2 text-xs text-muted-foreground animate-pulse">
            <span className="flex gap-0.5 items-center">
              <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60 animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60 animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60 animate-bounce" style={{ animationDelay: "300ms" }} />
            </span>
            <span>🤖 <span className="font-semibold">{typingBot.name}</span> is typing...</span>
          </div>
        )}
      </div>
      <div ref={bottomRef} />
    </div>
  )
}

function DateDivider({ iso }: { iso: string }) {
  const d = new Date(iso)
  const today = new Date()
  const yesterday = new Date()
  yesterday.setDate(today.getDate() - 1)
  let label: string
  if (d.toDateString() === today.toDateString()) {
    label = "Today"
  } else if (d.toDateString() === yesterday.toDateString()) {
    label = "Yesterday"
  } else {
    label = d.toLocaleDateString(undefined, {
      weekday: "long",
      month: "long",
      day: "numeric",
    })
  }
  return (
    <div className="relative flex items-center my-3 px-6">
      <div className="flex-1 h-px bg-border" />
      <span className="px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <div className="flex-1 h-px bg-border" />
    </div>
  )
}

function MessageGroup({
  author,
  messages,
  currentUserId,
  userMap,
  onReact,
  allMessages,
  onOpenThread,
}: {
  author: User | undefined
  messages: ChatMessage[]
  currentUserId: string
  userMap: Record<string, User>
  onReact: (messageId: string, emoji: string) => void
  allMessages: ChatMessage[]
  onOpenThread: (message: ChatMessage) => void
}) {
  const [first, ...rest] = messages
  return (
    <div className="pt-2">
      <div className="group/msg relative px-6 py-0.5 hover:bg-accent/30 transition-colors">
        <div className="flex gap-3">
          <div className="w-9 shrink-0 pt-0.5">
            <UserAvatar user={author} size="lg" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2 mb-0.5">
              <span className="text-sm font-semibold">{author?.name ?? "Unknown"}</span>
              <span className="text-[11px] text-muted-foreground">
                {formatTime(first.createdAt)}
              </span>
            </div>
            <MessageBody
              message={first}
              currentUserId={currentUserId}
              userMap={userMap}
              onReact={onReact}
              allMessages={allMessages}
              onOpenThread={onOpenThread}
            />
          </div>
        </div>
      </div>
      {rest.map((m) => (
        <ContinuationMessage
          key={m.id}
          message={m}
          currentUserId={currentUserId}
          userMap={userMap}
          onReact={onReact}
          allMessages={allMessages}
          onOpenThread={onOpenThread}
        />
      ))}
    </div>
  )
}

function ContinuationMessage({
  message,
  currentUserId,
  userMap,
  onReact,
  allMessages,
  onOpenThread,
}: {
  message: ChatMessage
  currentUserId: string
  userMap: Record<string, User>
  onReact: (messageId: string, emoji: string) => void
  allMessages: ChatMessage[]
  onOpenThread: (message: ChatMessage) => void
}) {
  return (
    <div className="group/msg relative px-6 py-0.5 hover:bg-accent/30 transition-colors">
      <div className="flex gap-3">
        <div className="w-9 shrink-0 flex justify-center">
          <span className="text-[10px] text-muted-foreground opacity-0 group-hover/msg:opacity-100 tabular-nums pt-0.5">
            {formatTime(message.createdAt)}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <MessageBody
            message={message}
            currentUserId={currentUserId}
            userMap={userMap}
            onReact={onReact}
            allMessages={allMessages}
            onOpenThread={onOpenThread}
          />
        </div>
      </div>
    </div>
  )
}

function MessageBody({
  message,
  currentUserId,
  userMap,
  onReact,
  allMessages,
  onOpenThread,
}: {
  message: ChatMessage
  currentUserId: string
  userMap: Record<string, User>
  onReact: (messageId: string, emoji: string) => void
  allMessages: ChatMessage[]
  onOpenThread: (message: ChatMessage) => void
}) {
  const repliesCount = allMessages.filter((m) => m.parentId === message.id).length
  return (
    <div className="relative">
      <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap break-words">
        {renderInline(message.body, Object.values(userMap))}
        {message.edited && (
          <span className="ml-1 text-[10px] text-muted-foreground">(edited)</span>
        )}
      </p>
      {message.reactions.length > 0 && (
        <div className="mt-1 flex flex-wrap gap-1">
          {message.reactions.map((r) => {
            const mine = r.userIds.includes(currentUserId)
            const names = r.userIds
              .map((id) => userMap[id]?.name ?? "Someone")
              .slice(0, 3)
              .join(", ")
            return (
              <button
                key={r.emoji}
                type="button"
                onClick={() => onReact(message.id, r.emoji)}
                title={`${names}${r.userIds.length > 3 ? " and others" : ""} reacted with ${r.emoji}`}
                className={cn(
                  "inline-flex items-center gap-1 px-2 h-6 rounded-full text-xs border transition-colors",
                  mine
                    ? "bg-primary/15 border-primary/40 text-foreground"
                    : "bg-accent border-border text-muted-foreground hover:text-foreground hover:border-muted-foreground/40",
                )}
              >
                <span className="text-sm leading-none">{r.emoji}</span>
                <span className="tabular-nums font-medium">{r.userIds.length}</span>
              </button>
            )
          })}
        </div>
      )}
      {repliesCount > 0 && (
        <button
          type="button"
          onClick={() => onOpenThread(message)}
          className="mt-1.5 flex items-center gap-1.5 text-xs text-primary font-medium hover:underline px-2 py-0.5 rounded bg-primary/10 border border-primary/20 w-fit cursor-pointer"
        >
          💬 {repliesCount} {repliesCount === 1 ? "reply" : "replies"}
        </button>
      )}
      <ReactionToolbar message={message} onReact={onReact} onOpenThread={onOpenThread} />
    </div>
  )
}

function ReactionToolbar({
  message,
  onReact,
  onOpenThread,
}: {
  message: ChatMessage
  onReact: (messageId: string, emoji: string) => void
  onOpenThread: (message: ChatMessage) => void
}) {
  return (
    <div className="absolute -top-4 right-0 hidden group-hover/msg:flex items-center gap-0.5 rounded-md border border-border bg-popover shadow-md p-0.5 z-20">
      {QUICK_REACTIONS.map((e) => (
        <button
          key={e}
          type="button"
          onClick={() => onReact(message.id, e)}
          className="h-7 w-7 inline-flex items-center justify-center rounded text-base hover:bg-accent transition-colors"
          aria-label={`React with ${e}`}
        >
          {e}
        </button>
      ))}
      <span className="h-5 w-px bg-border mx-0.5" aria-hidden />
      <button
        type="button"
        onClick={() => onOpenThread(message)}
        className="h-7 w-7 inline-flex items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer"
        aria-label="Reply in thread"
        title="Reply in thread"
      >
        <MessageSquare className="h-4 w-4" />
      </button>
      <button
        type="button"
        className="h-7 w-7 inline-flex items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
        aria-label="More reactions"
      >
        <Smile className="h-4 w-4" />
      </button>
    </div>
  )
}

function formatTime(iso: string, withDate = false) {
  const d = new Date(iso)
  const time = d.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  })
  if (!withDate) return time
  return time
}

export function renderInline(text: string, users: User[] = []): React.ReactNode[] {
  const parts: React.ReactNode[] = []
  if (!text) return parts

  const escapeRegExp = (string: string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  }

  const sortedNames = [...users]
    .map((u) => u.name)
    .filter(Boolean)
    .sort((a, b) => b.length - a.length)

  let regex: RegExp
  if (sortedNames.length > 0) {
    const namesPattern = sortedNames.map((name) => {
      const escaped = escapeRegExp(name)
      return name.startsWith("@") ? escaped : `@${escaped}`
    }).join('|')
    regex = new RegExp(`(\\*\\*[^*]+\\*\\*|https?:\\/\\/[^\\s]+|${namesPattern})`, 'g')
  } else {
    regex = /(\*\*[^*]+\*\*|https?:\/\/[^\s]+)/g
  }

  let lastIndex = 0
  let match: RegExpExecArray | null
  let key = 0
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index))
    }
    const token = match[0]
    if (token.startsWith("**")) {
      parts.push(
        <strong key={`b-${key++}`} className="font-semibold">
          {token.slice(2, -2)}
        </strong>,
      )
    } else if (token.startsWith("http://") || token.startsWith("https://")) {
      parts.push(
        <a
          key={`l-${key++}`}
          href={token}
          target="_blank"
          rel="noreferrer"
          className="text-primary underline-offset-2 hover:underline break-all"
        >
          {token}
        </a>,
      )
    } else if (token.startsWith("@")) {
      parts.push(
        <span
          key={`m-${key++}`}
          className="inline-flex items-center px-1.5 py-0.5 rounded bg-primary/20 text-primary font-medium text-sm animate-pulse-once"
        >
          {token}
        </span>,
      )
    }
    lastIndex = match.index + token.length
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex))
  return parts
}
