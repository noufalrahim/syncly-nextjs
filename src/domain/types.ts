export type TaskStatus =
  | "cancelled"
  | "on-hold"
  | "backlog"
  | "in-progress"
  | "done"

export type TaskPriority = "low" | "medium" | "high"

export type User = {
  id: string
  name: string
  initials: string
  color: string // tailwind bg class
}

export type Tag = {
  id: string
  name: string
  color: string // tailwind class fragment, e.g. "blue"
}

export type Comment = {
  id: string
  authorId: string
  body: string
  createdAt: string // ISO
  parentId?: string // For replies
}

export type HistoryEntry = {
  id: string
  type: "created" | "priority" | "assignee" | "status" | "moved"
  message: string
  authorId: string
  createdAt: string // ISO
}

export type Reference = {
  id: string
  title: string
  url: string
}

export type Attachment = {
  id: string
  name: string
  size: string
  type: string
}

export type Task = {
  id: string
  title: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  assigneeId: string
  dueDate: string // ISO
  startDate: string // ISO (for gantt)
  labels: string[] // label ids
  dependencyId?: string
  projectId: string
  columnId?: string
  comments: Comment[]
  history: HistoryEntry[]
  references: Reference[]
  attachments: Attachment[]
  createdAt: string
  order: number
}

export type Project = {
  id: string
  name: string
  color: string
  emoji: string
  workspaceId: string
}

export type Note = {
  id: string
  title: string
  body: string
  updatedAt: string
}

export type Goal = {
  id: string
  title: string
  description: string
  progress: number // 0-100
  status: "on-track" | "at-risk" | "off-track" | "completed"
  dueDate: string
  ownerId: string
}

export type Document = {
  id: string
  name: string
  type: "pdf" | "doc" | "sheet" | "image" | "video" | "zip"
  size: string
  updatedAt: string
  ownerId: string
}

export type Workspace = {
  id: string
  name: string
  ownerId: string
  plan: "professional" | "free"
}

export type ModuleId =
  | "tasks"
  | "calendar"
  | "notes"
  | "documents"
  | "goals"
  | "analytics"
  | "chat"

export type PresenceStatus = "online" | "away" | "dnd" | "offline"

export type ChatChannelType = "channel" | "dm"

export type ChatChannel = {
  id: string
  type: ChatChannelType
  name: string // for DMs this is the other user's name (for search), but we still render via memberIds
  description?: string
  memberIds: string[]
  unreadCount: number
}

export type ChatReaction = {
  emoji: string
  userIds: string[]
}

export type ChatMessage = {
  id: string
  channelId: string
  authorId: string
  body: string
  createdAt: string // ISO
  reactions: ChatReaction[]
  edited?: boolean
}

export type TaskView = "board" | "table" | "list" | "gantt" | "calendar"

export const STATUS_META: Record<
  TaskStatus,
  { label: string; dot: string; badge: string; ring: string; order: number }
> = {
  cancelled: {
    label: "Cancelled",
    dot: "bg-red-500",
    badge: "bg-red-500/10 text-red-400 border-red-500/20",
    ring: "ring-red-500/30",
    order: 0,
  },
  "on-hold": {
    label: "On Hold",
    dot: "bg-amber-500",
    badge: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    ring: "ring-amber-500/30",
    order: 1,
  },
  backlog: {
    label: "Backlog",
    dot: "bg-zinc-500",
    badge: "bg-zinc-500/10 text-zinc-300 border-zinc-500/20",
    ring: "ring-zinc-500/30",
    order: 2,
  },
  "in-progress": {
    label: "In Progress",
    dot: "bg-blue-500",
    badge: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    ring: "ring-blue-500/30",
    order: 3,
  },
  done: {
    label: "Done",
    dot: "bg-emerald-500",
    badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    ring: "ring-emerald-500/30",
    order: 4,
  },
}

export const PRIORITY_META: Record<
  TaskPriority,
  { label: string; badge: string; bars: number }
> = {
  low: {
    label: "Low",
    badge: "bg-zinc-500/10 text-zinc-300 border-zinc-500/20",
    bars: 1,
  },
  medium: {
    label: "Medium",
    badge: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    bars: 2,
  },
  high: {
    label: "High",
    badge: "bg-red-500/10 text-red-400 border-red-500/20",
    bars: 3,
  },
}
