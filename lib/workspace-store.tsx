"use client"

import * as React from "react"
import {
  CHAT_CHANNELS,
  CHAT_MESSAGES,
  CURRENT_USER_ID,
  DOCUMENTS,
  GOALS,
  LABELS,
  NOTES,
  PROJECTS,
  TASKS,
  USERS,
} from "./mock-data"
import type {
  ChatChannel,
  ChatMessage,
  Comment,
  Document as Doc,
  Goal,
  HistoryEntry,
  Label,
  ModuleId,
  Note,
  Project,
  Reference,
  Task,
  TaskStatus,
  TaskView,
  User,
} from "./types"

type ColumnDef = { id: string; status?: TaskStatus; label: string }

type State = {
  users: User[]
  currentUserId: string
  projects: Project[]
  activeProjectId: string | null
  labels: Label[]
  tasks: Task[]
  notes: Note[]
  goals: Goal[]
  documents: Doc[]
  module: ModuleId
  taskView: TaskView
  selectedTaskId: string | null
  // Board columns include the standard 5 plus any user-added ones
  columns: ColumnDef[]
  channels: ChatChannel[]
  messages: ChatMessage[]
  activeChannelId: string
}

type Action =
  | { type: "SET_MODULE"; module: ModuleId }
  | { type: "SET_TASK_VIEW"; view: TaskView }
  | { type: "SELECT_PROJECT"; projectId: string | null }
  | { type: "SELECT_TASK"; taskId: string | null }
  | { type: "MOVE_TASK"; taskId: string; status: TaskStatus }
  | { type: "UPDATE_TASK"; taskId: string; patch: Partial<Task> }
  | { type: "ADD_TASK"; task: Task }
  | { type: "DELETE_TASK"; taskId: string }
  | { type: "ADD_COLUMN"; label: string }
  | { type: "ADD_COMMENT"; taskId: string; body: string }
  | { type: "ADD_REFERENCE"; taskId: string; ref: Omit<Reference, "id"> }
  | { type: "ADD_NOTE" }
  | { type: "DELETE_NOTE"; noteId: string }
  | { type: "UPDATE_NOTE"; noteId: string; patch: Partial<Note> }
  | { type: "SELECT_CHANNEL"; channelId: string }
  | { type: "SEND_MESSAGE"; channelId: string; body: string }
  | { type: "TOGGLE_REACTION"; messageId: string; emoji: string }

const initialState: State = {
  users: USERS,
  currentUserId: CURRENT_USER_ID,
  projects: PROJECTS,
  activeProjectId: null,
  labels: LABELS,
  tasks: TASKS,
  notes: NOTES,
  goals: GOALS,
  documents: DOCUMENTS,
  module: "tasks",
  taskView: "board",
  selectedTaskId: null,
  columns: [
    { id: "col-cancelled", status: "cancelled", label: "Cancelled" },
    { id: "col-on-hold", status: "on-hold", label: "On Hold" },
    { id: "col-backlog", status: "backlog", label: "Backlog" },
    { id: "col-in-progress", status: "in-progress", label: "In Progress" },
    { id: "col-done", status: "done", label: "Done" },
  ],
  channels: CHAT_CHANNELS,
  messages: CHAT_MESSAGES,
  activeChannelId: "ch-general",
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_MODULE":
      return { ...state, module: action.module }
    case "SET_TASK_VIEW":
      return { ...state, taskView: action.view }
    case "SELECT_PROJECT":
      return { ...state, activeProjectId: action.projectId }
    case "SELECT_TASK":
      return { ...state, selectedTaskId: action.taskId }
    case "MOVE_TASK": {
      return {
        ...state,
        tasks: state.tasks.map((t) => {
          if (t.id !== action.taskId) return t
          if (t.status === action.status) return t
          const entry: HistoryEntry = {
            id: `h-${Date.now()}`,
            type: "moved",
            message: `moved to ${labelForStatus(action.status)}`,
            authorId: state.currentUserId,
            createdAt: new Date().toISOString(),
          }
          return { ...t, status: action.status, history: [...t.history, entry] }
        }),
      }
    }
    case "UPDATE_TASK": {
      return {
        ...state,
        tasks: state.tasks.map((t) =>
          t.id === action.taskId ? { ...t, ...action.patch } : t,
        ),
      }
    }
    case "ADD_TASK": {
      return { ...state, tasks: [action.task, ...state.tasks] }
    }
    case "DELETE_TASK": {
      return {
        ...state,
        tasks: state.tasks.filter((t) => t.id !== action.taskId),
        selectedTaskId:
          state.selectedTaskId === action.taskId ? null : state.selectedTaskId,
      }
    }
    case "ADD_COLUMN": {
      return {
        ...state,
        columns: [
          ...state.columns,
          { id: `col-${Date.now()}`, label: action.label },
        ],
      }
    }
    case "ADD_COMMENT": {
      const newComment: Comment = {
        id: `c-${Date.now()}`,
        authorId: state.currentUserId,
        body: action.body,
        createdAt: new Date().toISOString(),
      }
      return {
        ...state,
        tasks: state.tasks.map((t) =>
          t.id === action.taskId
            ? { ...t, comments: [...t.comments, newComment] }
            : t,
        ),
      }
    }
    case "ADD_REFERENCE": {
      const ref: Reference = { id: `r-${Date.now()}`, ...action.ref }
      return {
        ...state,
        tasks: state.tasks.map((t) =>
          t.id === action.taskId
            ? { ...t, references: [...t.references, ref] }
            : t,
        ),
      }
    }
    case "ADD_NOTE": {
      const note: Note = {
        id: `n-${Date.now()}`,
        title: "Untitled note",
        body: "",
        updatedAt: new Date().toISOString(),
      }
      return { ...state, notes: [note, ...state.notes] }
    }
    case "DELETE_NOTE":
      return { ...state, notes: state.notes.filter((n) => n.id !== action.noteId) }
    case "UPDATE_NOTE": {
      return {
        ...state,
        notes: state.notes.map((n) =>
          n.id === action.noteId
            ? { ...n, ...action.patch, updatedAt: new Date().toISOString() }
            : n,
        ),
      }
    }
    case "SELECT_CHANNEL": {
      return {
        ...state,
        activeChannelId: action.channelId,
        // mark as read
        channels: state.channels.map((c) =>
          c.id === action.channelId ? { ...c, unreadCount: 0 } : c,
        ),
      }
    }
    case "SEND_MESSAGE": {
      const trimmed = action.body.trim()
      if (!trimmed) return state
      const msg: ChatMessage = {
        id: `m-${Date.now()}`,
        channelId: action.channelId,
        authorId: state.currentUserId,
        body: trimmed,
        createdAt: new Date().toISOString(),
        reactions: [],
      }
      return { ...state, messages: [...state.messages, msg] }
    }
    case "TOGGLE_REACTION": {
      return {
        ...state,
        messages: state.messages.map((m) => {
          if (m.id !== action.messageId) return m
          const existing = m.reactions.find((r) => r.emoji === action.emoji)
          if (!existing) {
            return {
              ...m,
              reactions: [
                ...m.reactions,
                { emoji: action.emoji, userIds: [state.currentUserId] },
              ],
            }
          }
          const has = existing.userIds.includes(state.currentUserId)
          const nextUserIds = has
            ? existing.userIds.filter((id) => id !== state.currentUserId)
            : [...existing.userIds, state.currentUserId]
          const nextReactions = nextUserIds.length
            ? m.reactions.map((r) =>
                r.emoji === action.emoji ? { ...r, userIds: nextUserIds } : r,
              )
            : m.reactions.filter((r) => r.emoji !== action.emoji)
          return { ...m, reactions: nextReactions }
        }),
      }
    }
    default:
      return state
  }
}

function labelForStatus(s: TaskStatus) {
  const map: Record<TaskStatus, string> = {
    cancelled: "Cancelled",
    "on-hold": "On Hold",
    backlog: "Backlog",
    "in-progress": "In Progress",
    done: "Done",
  }
  return map[s]
}

const StateCtx = React.createContext<State | null>(null)
const DispatchCtx = React.createContext<React.Dispatch<Action> | null>(null)

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = React.useReducer(reducer, initialState)
  return (
    <StateCtx.Provider value={state}>
      <DispatchCtx.Provider value={dispatch}>{children}</DispatchCtx.Provider>
    </StateCtx.Provider>
  )
}

export function useWorkspace() {
  const s = React.useContext(StateCtx)
  if (!s) throw new Error("useWorkspace must be used within WorkspaceProvider")
  return s
}

export function useDispatch() {
  const d = React.useContext(DispatchCtx)
  if (!d) throw new Error("useDispatch must be used within WorkspaceProvider")
  return d
}

export function useUser(id: string | undefined) {
  const { users } = useWorkspace()
  return React.useMemo(
    () => users.find((u) => u.id === id),
    [users, id],
  )
}

export function useProjectTasks() {
  const { tasks, activeProjectId } = useWorkspace()
  return React.useMemo(() => {
    if (!activeProjectId) return tasks
    return tasks.filter((t) => t.projectId === activeProjectId)
  }, [tasks, activeProjectId])
}
