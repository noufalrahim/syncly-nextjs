"use client"

import * as React from "react"
import { useWorkspace, useDispatch } from "@/presentation/state/workspace-store"
import { Button } from "@/presentation/components/ui/button"
import { Bell, Check, CheckCheck, FolderGit2, MessageSquare, Trash2, UserPlus, FileText } from "lucide-react"

type Notification = {
  id: string
  title: string
  description: string
  time: string
  type: "github" | "task" | "comment" | "member" | "system"
  read: boolean
  archived: boolean
  targetTaskId?: string
}

export function InboxModule() {
  const { tasks, projects, currentUserId } = useWorkspace()
  const dispatch = useDispatch()
  const [filter, setFilter] = React.useState<"all" | "unread" | "archived">("all")

  const myTasks = React.useMemo(() => {
    return tasks.filter((t) => t.assigneeId === currentUserId)
  }, [tasks, currentUserId])

  const initialNotifications: Notification[] = React.useMemo(() => {
    const list: Notification[] = [
      {
        id: "notif-1",
        title: "PR #234 Merged",
        description: "Pull request 'feat: integrations-setup' merged into main branch.",
        time: "10m ago",
        type: "github",
        read: false,
        archived: false,
      },
      {
        id: "notif-2",
        title: "Comment from @review-bot",
        description: "Checked your PR status. Code looks clean, ready for integration tests.",
        time: "45m ago",
        type: "comment",
        read: false,
        archived: false,
      },
      {
        id: "notif-3",
        title: "New member joined",
        description: "Sarah Jenkins has joined the noufalrahim/syncly-nextjs workspace.",
        time: "2h ago",
        type: "member",
        read: true,
        archived: false,
      },
    ]

    if (myTasks.length > 0) {
      list.unshift({
        id: "notif-0",
        title: "Task Assigned to You",
        description: `You have been assigned to: ${myTasks[0].title}`,
        time: "2m ago",
        type: "task",
        read: false,
        archived: false,
        targetTaskId: myTasks[0].id,
      })
    } else if (tasks.length > 0) {
      list.unshift({
        id: "notif-0",
        title: "New Task Created",
        description: `A new workspace task was created: ${tasks[0].title}`,
        time: "5m ago",
        type: "task",
        read: false,
        archived: false,
        targetTaskId: tasks[0].id,
      })
    }

    return list
  }, [tasks, myTasks])

  const [notifications, setNotifications] = React.useState<Notification[]>([])

  React.useEffect(() => {
    setNotifications(initialNotifications)
  }, [initialNotifications])

  const filteredNotifications = React.useMemo(() => {
    return notifications.filter((n) => {
      if (filter === "unread") return !n.read && !n.archived
      if (filter === "archived") return n.archived
      return !n.archived
    })
  }, [notifications, filter])

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    )
  }

  const toggleArchive = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, archived: !n.archived } : n))
    )
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const clearAll = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, archived: true })))
  }

  const handleNotificationClick = (n: Notification) => {
    markAsRead(n.id)
    if (n.targetTaskId) {
      dispatch({ type: "SELECT_TASK", taskId: n.targetTaskId })
      const taskObj = tasks.find((t) => t.id === n.targetTaskId)
      if (taskObj) {
        dispatch({ type: "SELECT_PROJECT", projectId: taskObj.projectId })
        dispatch({ type: "SET_MODULE", module: "tasks" })
      }
    }
  }

  const getIcon = (type: Notification["type"]) => {
    switch (type) {
      case "github":
        return <FolderGit2 className="h-4.5 w-4.5 text-blue-400" />
      case "task":
        return <FileText className="h-4.5 w-4.5 text-amber-400" />
      case "comment":
        return <MessageSquare className="h-4.5 w-4.5 text-purple-400" />
      case "member":
        return <UserPlus className="h-4.5 w-4.5 text-emerald-400" />
      default:
        return <Bell className="h-4.5 w-4.5 text-zinc-400" />
    }
  }

  return (
    <div className="flex-grow flex flex-col min-h-0 bg-background overflow-hidden">
      <div className="flex-shrink-0 px-8 py-5 border-b border-border/40 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Inbox</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Stay updated with activity and assignments.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={markAllAsRead} className="h-8 text-xs">
            <CheckCheck className="h-3.5 w-3.5 mr-1.5" /> Mark all read
          </Button>
          <Button variant="outline" size="sm" onClick={clearAll} className="h-8 text-xs text-destructive hover:text-destructive">
            <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Clear all
          </Button>
        </div>
      </div>

      <div className="flex-shrink-0 px-8 py-3 border-b border-border/20 bg-muted/20 flex gap-2">
        <button
          onClick={() => setFilter("all")}
          className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
            filter === "all" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilter("unread")}
          className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
            filter === "unread" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Unread
        </button>
        <button
          onClick={() => setFilter("archived")}
          className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
            filter === "archived" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Archived
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-8 space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="h-12 w-12 bg-muted/40 rounded-full flex items-center justify-center text-muted-foreground mb-4">
              <Bell className="h-6 w-6" />
            </div>
            <p className="text-sm font-semibold">Your inbox is clear</p>
            <p className="text-xs text-muted-foreground mt-1">No notifications matching the active filter.</p>
          </div>
        ) : (
          filteredNotifications.map((n) => (
            <div
              key={n.id}
              onClick={() => handleNotificationClick(n)}
              className={`p-4 rounded-xl border transition-all flex items-start gap-4 cursor-pointer group ${
                n.read
                  ? "bg-card/40 border-border/50 hover:border-border"
                  : "bg-card border-border/80 hover:border-primary/20 shadow-sm"
              }`}
            >
              <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${
                n.read ? "bg-muted/50" : "bg-accent"
              }`}>
                {getIcon(n.type)}
              </div>
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm leading-none">{n.title}</span>
                    {!n.read && (
                      <span className="h-1.5 w-1.5 bg-primary rounded-full" />
                    )}
                  </div>
                  <span className="text-[10px] text-muted-foreground whitespace-nowrap">{n.time}</span>
                </div>
                <p className="text-xs text-muted-foreground leading-normal">{n.description}</p>
              </div>
              <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                {!n.read && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      markAsRead(n.id)
                    }}
                    className="p-1.5 hover:bg-accent rounded-md text-muted-foreground hover:text-foreground"
                  >
                    <Check className="h-3.5 w-3.5" />
                  </button>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleArchive(n.id)
                  }}
                  className="p-1.5 hover:bg-accent rounded-md text-muted-foreground hover:text-foreground"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
