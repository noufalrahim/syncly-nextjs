"use client"

import * as React from "react"
import { AtSign, Paperclip, Plus, Send, Smile } from "lucide-react"
import { useDispatch, useWorkspace } from "@/presentation/state/workspace-store"
import { cn } from "@/core/utils"
import { UserAvatar } from "@/presentation/components/user-avatar"
import type { User } from "@/domain/types"

const MOCK_GITHUB_ITEMS = [
  { id: "pr-134", name: "PR-134", description: "Implement Google Auth", type: "pr" },
  { id: "pr-135", name: "PR-135", description: "Fix memory leak in chat", type: "pr" },
  { id: "pr-136", name: "PR-136", description: "Upgrade Next.js to v15", type: "pr" },
  { id: "issue-42", name: "Issue-42", description: "Sidebar collapse button buggy on mobile", type: "issue" },
  { id: "issue-99", name: "Issue-99", description: "Billing modal doesn't open", type: "issue" },
  { id: "issue-101", name: "Issue-101", description: "Notification emails are failing", type: "issue" },
]

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

function renderHighlightedText(text: string, memberNames: string[], isGithubConnected = false) {
  if (!text) return ""
  const displayText = text.endsWith("\n") ? text + " " : text

  const escapeRegExp = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const patterns: string[] = []

  if (memberNames.length > 0) {
    const namesPattern = memberNames.map((name) => {
      const escaped = escapeRegExp(name)
      return name.startsWith("@") ? escaped : `@${escaped}`
    }).join('|')
    patterns.push(namesPattern)
  }

  if (isGithubConnected) {
    patterns.push("@(?:PR|Issue|pr|issue)-\\d+")
  }

  if (patterns.length === 0) return displayText

  const regex = new RegExp(`(${patterns.join('|')})`, 'g')

  const parts: React.ReactNode[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null
  let key = 0

  while ((match = regex.exec(displayText)) !== null) {
    if (match.index > lastIndex) {
      parts.push(displayText.slice(lastIndex, match.index))
    }
    const token = match[0]
    const isPrOrIssue = isGithubConnected && /^@(PR|Issue|pr|issue)-\d+$/i.test(token)
    if (isPrOrIssue) {
      const isPr = /pr/i.test(token)
      parts.push(
        <span
          key={key++}
          className={isPr 
            ? "bg-purple-500/25 rounded py-0.5 border border-purple-500/10 text-transparent" 
            : "bg-emerald-500/25 rounded py-0.5 border border-emerald-500/10 text-transparent"
          }
        >
          {token}
        </span>
      )
    } else {
      parts.push(
        <span
          key={key++}
          className="bg-primary/25 rounded py-0.5 text-transparent"
        >
          {token}
        </span>
      )
    }
    lastIndex = match.index + token.length
  }
  if (lastIndex < displayText.length) {
    parts.push(displayText.slice(lastIndex))
  }
  return parts
}

export function MessageInput() {
  const { channels, activeChannelId, users, currentUserId, activeWorkspaceId, projects, activeProjectId } = useWorkspace()
  const activeProject = projects.find((p) => p.id === activeProjectId)
  const isGithubConnected = !!activeProject?.githubRepo
  const dispatch = useDispatch()
  const [value, setValue] = React.useState("")
  const [mentionState, setMentionState] = React.useState<{ query: string; index: number } | null>(null)
  const [activeIndex, setActiveIndex] = React.useState(0)
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)
  const overlayRef = React.useRef<HTMLDivElement>(null)

  const channel = channels.find((c) => c.id === activeChannelId)

  React.useEffect(() => {
    setValue("")
    setMentionState(null)
    textareaRef.current?.focus()
  }, [activeChannelId])

  React.useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = "auto"
    el.style.height = `${Math.min(el.scrollHeight, 180)}px`
    if (overlayRef.current) {
      overlayRef.current.scrollTop = el.scrollTop
    }
  }, [value])

  const handleScroll = () => {
    if (textareaRef.current && overlayRef.current) {
      overlayRef.current.scrollTop = textareaRef.current.scrollTop
    }
  }

  const sortedMemberNames = React.useMemo(() => {
    if (!channel) return []
    const memberNames = channel.memberIds
      .map((id) => users.find((u) => u.id === id))
      .filter((u): u is User => Boolean(u) && !u.isBot)
      .map((u) => u.name)
    const helperNames = users.filter((u) => u.isBot).map((u) => u.name)
    return [...memberNames, ...helperNames]
      .filter(Boolean)
      .sort((a, b) => b.length - a.length)
  }, [channel, users])

  const filteredMentionItems = React.useMemo(() => {
    if (!mentionState || !channel) return []
    const q = mentionState.query.toLowerCase()
    const members = channel.memberIds
      .map((id) => users.find((u) => u.id === id))
      .filter((u): u is User => Boolean(u) && !u.isBot)
      .filter((u) => u.name.toLowerCase().includes(q))
      .map((u) => ({ id: u.id, name: u.name, type: "user" as const, avatar: u }))

    // Workspace bots are helpers — mentionable everywhere, not channel members.
    const helpers = users
      .filter((u) => u.isBot && u.name.toLowerCase().includes(q))
      .map((u) => ({ id: u.id, name: u.name, type: "helper" as const, avatar: u }))

    const githubItems = isGithubConnected
      ? MOCK_GITHUB_ITEMS
          .filter((item) => item.name.toLowerCase().includes(q) || item.description.toLowerCase().includes(q))
          .map((item) => ({ id: item.id, name: item.name, type: item.type, description: item.description }))
      : []

    return [...members, ...helpers, ...githubItems]
  }, [users, mentionState, channel, isGithubConnected])

  React.useEffect(() => {
    setActiveIndex(0)
  }, [filteredMentionItems.length])

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
    const currentVal = value
    setValue("")
    setMentionState(null);

    (async () => {
      try {
        const res = await fetch("/api/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            workspaceId: activeWorkspaceId,
            channelId: activeChannelId,
            authorId: currentUserId || "",
            body: currentVal,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          dispatch({
            type: "SEND_MESSAGE",
            channelId: data.message.channelId,
            body: data.message.body,
            authorId: data.message.authorId,
            id: data.message.id,
            createdAt: data.message.createdAt,
          });
        }
      } catch (error) {
        console.error("Send message failed", error);
      }
    })();
  }

  const insertMention = (item: any) => {
    if (!mentionState) return
    const el = textareaRef.current
    if (!el) return
    const before = value.slice(0, mentionState.index)
    const after = value.slice(el.selectionStart)
    const mentionText = `${item.name.startsWith("@") ? "" : "@"}${item.name} `
    const newValue = before + mentionText + after
    setValue(newValue)
    setMentionState(null)
    const newCursorPos = before.length + mentionText.length
    setTimeout(() => {
      el.focus()
      el.setSelectionRange(newCursorPos, newCursorPos)
    }, 0)
  }

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value
    setValue(val)
    const pos = e.target.selectionStart
    setMentionState(getMentionQuery(val, pos))
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (mentionState && filteredMentionItems.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault()
        setActiveIndex((prev) => (prev + 1) % filteredMentionItems.length)
        return
      }
      if (e.key === "ArrowUp") {
        e.preventDefault()
        setActiveIndex((prev) => (prev - 1 + filteredMentionItems.length) % filteredMentionItems.length)
        return
      }
      if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault()
        insertMention(filteredMentionItems[activeIndex])
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
      send()
    }
  }

  const handleMentionClick = () => {
    const el = textareaRef.current
    if (!el) return
    const pos = el.selectionStart
    const before = value.slice(0, pos)
    const after = value.slice(pos)
    const newValue = before + "@" + after
    setValue(newValue)
    setMentionState({ query: "", index: pos })
    setTimeout(() => {
      el.focus()
      const newPos = pos + 1
      el.setSelectionRange(newPos, newPos)
    }, 0)
  }

  const canSend = value.trim().length > 0

  return (
    <div className="px-4 pt-1 pb-4 bg-background relative">
      {mentionState && filteredMentionItems.length > 0 && (
        <div className="absolute bottom-full left-4 mb-2 w-72 max-h-48 overflow-y-auto bg-popover border border-border rounded-md shadow-lg z-50 p-1 space-y-0.5">
          {filteredMentionItems.map((item, i) => (
            <button
              key={item.id}
              type="button"
              onClick={() => insertMention(item)}
              className={cn(
                "w-full flex items-center justify-between px-2 py-1.5 rounded text-sm text-left transition-colors hover:bg-accent hover:text-foreground",
                i === activeIndex ? "bg-accent text-foreground" : "text-foreground"
              )}
            >
              <div className="flex items-center gap-2 min-w-0">
                {item.type === "user" || item.type === "helper" ? (
                  <>
                    <UserAvatar user={(item as { avatar: User }).avatar} size="xs" />
                    <span className="truncate">{item.name}</span>
                  </>
                ) : (
                  <>
                    <span className={cn(
                      "px-1.5 py-0.5 rounded text-[10px] font-semibold",
                      item.type === "pr" ? "bg-purple-500/10 text-purple-400" : "bg-emerald-500/10 text-emerald-400"
                    )}>
                      {item.type === "pr" ? "PR" : "ISSUE"}
                    </span>
                    <span className="font-medium">{item.name}</span>
                  </>
                )}
              </div>
              {"description" in item && item.description && (
                <span className="text-[11px] text-muted-foreground truncate max-w-[120px] ml-2">
                  {item.description}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      <div className="rounded-lg border border-border bg-card focus-within:border-muted-foreground/30 transition-colors relative">
        <div
          ref={overlayRef}
          className="absolute inset-0 pointer-events-none select-none text-transparent px-3 pt-3 pb-1 text-sm whitespace-pre-wrap break-words overflow-hidden z-0"
        >
          {renderHighlightedText(value, sortedMemberNames, isGithubConnected)}
        </div>
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onKeyDown={onKeyDown}
          onScroll={handleScroll}
          placeholder={placeholder}
          rows={1}
          className="block w-full resize-none bg-transparent px-3 pt-3 pb-1 text-sm placeholder:text-muted-foreground focus:outline-none max-h-[180px] relative z-10"
        />
        <div className="flex items-center justify-between px-2 py-1.5">
          <div className="flex items-center gap-0.5">
            <ToolBtn label="Attach file">
              <Paperclip className="h-4 w-4" />
            </ToolBtn>
            <ToolBtn label="Insert emoji">
              <Smile className="h-4 w-4" />
            </ToolBtn>
            <ToolBtn label="Mention someone" onClick={handleMentionClick}>
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
  onClick,
}: {
  children: React.ReactNode
  label: string
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="h-8 w-8 inline-flex items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
    >
      {children}
    </button>
  )
}
