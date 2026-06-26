"use client"

import * as React from "react"
import { useWorkspace, useDispatch } from "@/presentation/state/workspace-store"
import { Dialog, DialogContent, DialogTitle } from "@/presentation/components/ui/dialog"
import { Search, FolderKanban, CheckSquare, MessageSquare, FileText, User } from "lucide-react"

export function SpotlightSearch() {
  const { projects, tasks, channels, users, notes, currentUserId } = useWorkspace()
  const dispatch = useDispatch()
  const [isOpen, setIsOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const [selectedIndex, setSelectedIndex] = React.useState(0)
  const inputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setIsOpen((prev) => !prev)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  React.useEffect(() => {
    const handleToggleEvent = () => {
      setIsOpen((prev) => !prev)
    }
    window.addEventListener("toggle-spotlight-search", handleToggleEvent)
    return () => window.removeEventListener("toggle-spotlight-search", handleToggleEvent)
  }, [])

  React.useEffect(() => {
    if (isOpen) {
      setQuery("")
      setSelectedIndex(0)
      setTimeout(() => {
        inputRef.current?.focus()
      }, 50)
    }
  }, [isOpen])

  const filteredItems = React.useMemo(() => {
    const q = query.toLowerCase().trim()
    const matches: {
      id: string
      type: "project" | "task" | "channel" | "note" | "member"
      title: string
      subtitle?: string
      emoji?: string
      handler: () => void
    }[] = []

    const matchingProjects = projects.filter((p) => p.name.toLowerCase().includes(q))
    matchingProjects.slice(0, 5).forEach((p) => {
      matches.push({
        id: `p-${p.id}`,
        type: "project",
        title: p.name,
        emoji: p.emoji,
        handler: () => {
          dispatch({ type: "SELECT_PROJECT", projectId: p.id })
          dispatch({ type: "SET_MODULE", module: "tasks" })
        },
      })
    })

    const matchingTasks = tasks.filter(
      (t) => t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q)
    )
    matchingTasks.slice(0, 5).forEach((t) => {
      const proj = projects.find((p) => p.id === t.projectId)
      matches.push({
        id: `t-${t.id}`,
        type: "task",
        title: t.title,
        subtitle: proj ? `${proj.emoji} ${proj.name}` : "General",
        handler: () => {
          dispatch({ type: "SELECT_PROJECT", projectId: t.projectId })
          dispatch({ type: "SELECT_TASK", taskId: t.id })
          dispatch({ type: "SET_MODULE", module: "tasks" })
        },
      })
    })

    const matchingChannels = channels.filter(
      (c) => c.type === "channel" && c.name.toLowerCase().includes(q)
    )
    matchingChannels.slice(0, 5).forEach((c) => {
      matches.push({
        id: `c-${c.id}`,
        type: "channel",
        title: `#${c.name}`,
        subtitle: c.description,
        handler: () => {
          dispatch({ type: "SELECT_CHANNEL", channelId: c.id })
          dispatch({ type: "SET_MODULE", module: "chat" })
        },
      })
    })

    const matchingNotes = notes.filter(
      (n) => n.title.toLowerCase().includes(q) || n.body.toLowerCase().includes(q)
    )
    matchingNotes.slice(0, 5).forEach((n) => {
      const proj = projects.find((p) => p.id === n.projectId)
      matches.push({
        id: `n-${n.id}`,
        type: "note",
        title: n.title,
        subtitle: proj ? `${proj.emoji} ${proj.name}` : "General",
        handler: () => {
          dispatch({ type: "SELECT_PROJECT", projectId: n.projectId })
          dispatch({ type: "SET_MODULE", module: "notes" })
        },
      })
    })

    const matchingUsers = users.filter(
      (u) => !u.isBot && u.id !== currentUserId && u.name.toLowerCase().includes(q)
    )
    matchingUsers.slice(0, 5).forEach((u) => {
      matches.push({
        id: `u-${u.id}`,
        type: "member",
        title: u.name,
        subtitle: u.email,
        handler: () => {
          dispatch({ type: "SELECT_CHANNEL", channelId: `dm-${u.id}` })
          dispatch({ type: "SET_MODULE", module: "chat" })
        },
      })
    })

    return matches
  }, [query, projects, tasks, channels, notes, users, currentUserId, dispatch])

  React.useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredItems.length))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % Math.max(1, filteredItems.length))
    } else if (e.key === "Enter") {
      e.preventDefault()
      if (filteredItems[selectedIndex]) {
        filteredItems[selectedIndex].handler()
        setIsOpen(false)
      }
    } else if (e.key === "Escape") {
      setIsOpen(false)
    }
  }

  const getItemIcon = (type: string, emoji?: string) => {
    if (emoji) return <span className="text-sm">{emoji}</span>
    switch (type) {
      case "project":
        return <FolderKanban className="h-4.5 w-4.5 text-blue-400" />
      case "task":
        return <CheckSquare className="h-4.5 w-4.5 text-amber-400" />
      case "channel":
        return <MessageSquare className="h-4.5 w-4.5 text-purple-400" />
      case "note":
        return <FileText className="h-4.5 w-4.5 text-emerald-400" />
      case "member":
        return <User className="h-4.5 w-4.5 text-zinc-400" />
      default:
        return <Search className="h-4.5 w-4.5 text-zinc-400" />
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent showCloseButton={false} className="p-0 overflow-hidden max-w-xl border-border bg-card shadow-2xl">
        <DialogTitle className="sr-only">Spotlight Search</DialogTitle>
        <div className="flex items-center gap-3 px-4 border-b border-border/60 h-14 bg-muted/10">
          <Search className="h-5 w-5 text-muted-foreground/60 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search projects, tasks, channels, or notes..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent border-0 outline-none text-sm placeholder:text-muted-foreground/50 h-full text-foreground"
          />
          <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-0.5 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground/70">
            <span>ESC</span>
          </kbd>
        </div>

        <div className="max-h-[360px] overflow-y-auto p-2 space-y-1">
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center text-xs text-muted-foreground">
              No results found for "{query}". Try looking for different tags or names.
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const isSelected = idx === selectedIndex
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    item.handler()
                    setIsOpen(false)
                  }}
                  className={`flex items-center gap-3.5 px-3 py-2.5 rounded-lg cursor-pointer transition-all ${
                    isSelected ? "bg-accent text-accent-foreground" : "hover:bg-muted/40 text-foreground"
                  }`}
                >
                  <div className={`h-8 w-8 rounded-md flex items-center justify-center shrink-0 ${
                    isSelected ? "bg-background/25" : "bg-muted"
                  }`}>
                    {getItemIcon(item.type, item.emoji)}
                  </div>
                  <div className="flex-grow min-w-0">
                    <span className="block text-xs font-semibold leading-tight">{item.title}</span>
                    {item.subtitle && (
                      <span className="block text-[10px] text-muted-foreground truncate mt-0.5">{item.subtitle}</span>
                    )}
                  </div>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/50 opacity-0 group-hover:opacity-100 shrink-0">
                    {item.type}
                  </span>
                </div>
              )
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
