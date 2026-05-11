"use client"

import * as React from "react"
import type {
  ChatChannel,
  ChatMessage,
  Tag,
  ModuleId,
  Note,
  Project,
  Task,
  TaskStatus,
  TaskView,
  User,
  HistoryEntry,
  Comment,
  Reference,
  Document as Doc
} from "@/domain/types"

type ColumnDef = { id: string; status?: TaskStatus; label: string; projectId: string; color?: string }

type State = {
  users: User[]
  currentUserId: string | null
  projects: Project[]
  activeProjectId: string | null
  tags: Tag[]
  tasks: Task[]
  notes: Note[]
  goals: any[] // Simplified for now
  documents: Doc[]
  module: ModuleId
  taskView: TaskView
  selectedTaskId: string | null
  columns: ColumnDef[]
  workspaces: Workspace[]
  activeWorkspaceId: string | null
  activeChannelId: string | null
  loading: {
    workspaces: boolean
    projects: boolean
    tasks: boolean
    columns: boolean
    tags: boolean
  }
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
  | { type: "ADD_COLUMN"; label: string; id?: string }
  | { type: "UPDATE_COLUMN"; columnId: string; patch: Partial<ColumnDef> }
  | { type: "DELETE_COLUMN"; columnId: string }
  | { type: "ADD_COMMENT"; taskId: string; body: string }
  | { type: "ADD_REFERENCE"; taskId: string; ref: Omit<Reference, "id"> }
  | { type: "ADD_NOTE" }
  | { type: "DELETE_NOTE"; noteId: string }
  | { type: "UPDATE_NOTE"; noteId: string; patch: Partial<Note> }
  | { type: "SELECT_CHANNEL"; channelId: string }
  | { type: "SEND_MESSAGE"; channelId: string; body: string }
  | { type: "TOGGLE_REACTION"; messageId: string; emoji: string }
  | { type: "SET_USERS"; users: User[] }
  | { type: "SET_CURRENT_USER"; user: User | null }
  | { type: "ADD_PROJECT"; project: Project }
  | { type: "ADD_WORKSPACE"; workspace: Workspace }
  | { type: "SELECT_WORKSPACE"; workspaceId: string | null }
  | { type: "SET_WORKSPACES"; workspaces: Workspace[] }
  | { type: "SET_PROJECTS"; projects: Project[] }
  | { type: "SET_TASKS"; tasks: Task[] }
  | { type: "SET_COLUMNS"; columns: ColumnDef[] }
  | { type: "SET_TAGS"; tags: Tag[] }
  | { type: "ADD_TAG"; tag: Tag }
  | { type: "SET_LOADING"; key: keyof State["loading"]; value: boolean }


const initialState: State = {
  users: [],
  currentUserId: null,
  projects: [],
  activeProjectId: null,
  tags: [],
  tasks: [],
  notes: [],
  goals: [],
  documents: [],
  module: "tasks",
  taskView: "board",
  selectedTaskId: null,
  columns: [],
  channels: [],
  messages: [],
  activeChannelId: null,
  workspaces: [],
  activeWorkspaceId: null,
  loading: {
    workspaces: false,
    projects: false,
    tasks: false,
    columns: false,
    tags: false,
  }
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
            authorId: state.currentUserId || "",
            createdAt: new Date().toISOString(),
          }
          return { ...t, status: action.status, history: [...(t.history || []), entry] }
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
      if (!state.activeProjectId) return state
      return {
        ...state,
        columns: [
          ...state.columns,
          { 
            id: action.id || `col-${Date.now()}`, 
            label: action.label, 
            status: "backlog",
            projectId: state.activeProjectId,
            color: "gray"
          },
        ],
      }
    }
    case "UPDATE_COLUMN": {
      return {
        ...state,
        columns: state.columns.map((c) =>
          c.id === action.columnId ? { ...c, ...action.patch } : c,
        ),
      }
    }
    case "DELETE_COLUMN": {
      return {
        ...state,
        columns: state.columns.filter((c) => c.id !== action.columnId),
      }
    }
    case "ADD_COMMENT": {
      const newComment: Comment = {
        id: `c-${Date.now()}`,
        authorId: state.currentUserId || "",
        body: action.body,
        createdAt: new Date().toISOString(),
      }
      return {
        ...state,
        tasks: state.tasks.map((t) =>
          t.id === action.taskId
            ? { ...t, comments: [...(t.comments || []), newComment] }
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
            ? { ...t, references: [...(t.references || []), ref] }
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
        authorId: state.currentUserId || "",
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
                { emoji: action.emoji, userIds: [state.currentUserId || ""] },
              ],
            }
          }
          const has = existing.userIds.includes(state.currentUserId || "")
          const nextUserIds = has
            ? existing.userIds.filter((id) => id !== state.currentUserId)
            : [...existing.userIds, state.currentUserId || ""]
          const nextReactions = nextUserIds.length
            ? m.reactions.map((r) =>
                r.emoji === action.emoji ? { ...r, userIds: nextUserIds } : r,
              )
            : m.reactions.filter((r) => r.emoji !== action.emoji)
          return { ...m, reactions: nextReactions }
        }),
      }
    }
    case "SET_USERS":
      return { ...state, users: action.users }
    case "SET_CURRENT_USER":
      return { ...state, currentUserId: action.user?.id || null, users: action.user ? [action.user] : [] }
    case "ADD_PROJECT":
      return { ...state, projects: [...state.projects, action.project] }
    case "ADD_WORKSPACE":
      return { 
        ...state, 
        workspaces: [...state.workspaces, action.workspace],
        activeWorkspaceId: state.activeWorkspaceId || action.workspace.id 
      }
    case "SELECT_WORKSPACE":
      return { ...state, activeWorkspaceId: action.workspaceId }
    case "SET_WORKSPACES":
      return { 
        ...state, 
        workspaces: action.workspaces,
        activeWorkspaceId: state.activeWorkspaceId || action.workspaces[0]?.id || null
      }
    case "SET_PROJECTS":
      return { ...state, projects: action.projects }
    case "SET_TASKS":
      return { ...state, tasks: action.tasks }
    case "SET_COLUMNS":
      return { ...state, columns: action.columns }
    case "SET_TAGS":
      return { ...state, tags: action.tags }
    case "ADD_TAG":
      return { ...state, tags: [...state.tags, action.tag] }
    case "SET_LOADING":
      return {
        ...state,
        loading: { ...state.loading, [action.key]: action.value }
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

  React.useEffect(() => {
    const saved = localStorage.getItem("syncly_user");
    if (saved) {
      try {
        const user = JSON.parse(saved);
        dispatch({ type: "SET_CURRENT_USER", user });
      } catch (e) {
        console.error("Failed to parse saved user", e);
      }
    }
  }, []);

  React.useEffect(() => {
    if (!state.currentUserId) return;

    const fetchWorkspaces = async () => {
      dispatch({ type: "SET_LOADING", key: "workspaces", value: true });
      try {
        const res = await fetch(`/api/workspaces?userId=${state.currentUserId}`);
        if (res.ok) {
          const data = await res.json();
          const mapped = data.workspaces.map((ws: any) => ({
            id: ws._id,
            name: ws.name,
            ownerId: ws.ownerId,
            plan: ws.plan,
          }));
          dispatch({ type: "SET_WORKSPACES", workspaces: mapped });
        }
      } catch (e) {
        console.error("Failed to fetch workspaces", e);
      } finally {
        dispatch({ type: "SET_LOADING", key: "workspaces", value: false });
      }
    };

    fetchWorkspaces();
  }, [state.currentUserId]);

  React.useEffect(() => {
    if (!state.activeWorkspaceId) {
      dispatch({ type: "SET_PROJECTS", projects: [] });
      return;
    }

    const fetchProjects = async () => {
      dispatch({ type: "SET_LOADING", key: "projects", value: true });
      try {
        const res = await fetch(`/api/projects?workspaceId=${state.activeWorkspaceId}`);
        if (res.ok) {
          const data = await res.json();
          const mapped = data.projects.map((p: any) => ({
            id: p._id,
            name: p.name,
            emoji: p.emoji,
            color: p.color,
            workspaceId: p.workspaceId,
          }));
          dispatch({ type: "SET_PROJECTS", projects: mapped });
        }
      } catch (e) {
        console.error("Failed to fetch projects", e);
      } finally {
        dispatch({ type: "SET_LOADING", key: "projects", value: false });
      }
    };

    fetchProjects();
  }, [state.activeWorkspaceId]);

  React.useEffect(() => {
    const fetchAllTasks = async () => {
      if (!state.activeWorkspaceId) return;
      dispatch({ type: "SET_LOADING", key: "tasks", value: true });
      try {
        const res = await fetch(`/api/tasks?workspaceId=${state.activeWorkspaceId}`);
        if (res.ok) {
          const data = await res.json();
          const mapped = data.tasks.map((t: any) => ({
            ...t,
            id: t._id,
          }));
          dispatch({ type: "SET_TASKS", tasks: mapped });
        }
      } catch (e) {
        console.error("Failed to fetch all tasks", e);
      } finally {
        dispatch({ type: "SET_LOADING", key: "tasks", value: false });
      }
    };
    fetchAllTasks();
  }, [state.activeWorkspaceId]);

  React.useEffect(() => {
    if (!state.activeProjectId) {
      dispatch({ type: "SET_COLUMNS", columns: [] });
      return;
    }

    const fetchColumns = async () => {
      dispatch({ type: "SET_LOADING", key: "columns", value: true });
      try {
        const res = await fetch(`/api/columns?projectId=${state.activeProjectId}`);
        if (res.ok) {
          const data = await res.json();
          const mapped = data.columns.map((c: any) => ({
            id: c._id,
            label: c.label,
            status: c.status,
            projectId: c.projectId,
            color: c.color,
          }));
          dispatch({ type: "SET_COLUMNS", columns: mapped });
        }
      } catch (e) {
        console.error("Failed to fetch columns", e);
      } finally {
        dispatch({ type: "SET_LOADING", key: "columns", value: false });
      }
    };

    fetchColumns();
  }, [state.activeProjectId]);

  React.useEffect(() => {
    if (!state.activeWorkspaceId) return;

    const fetchTags = async () => {
      dispatch({ type: "SET_LOADING", key: "tags", value: true });
      try {
        const res = await fetch(`/api/tags?workspaceId=${state.activeWorkspaceId}`);
        if (res.ok) {
          const data = await res.json();
          const mapped = data.tags.map((t: any) => ({
            id: t._id,
            name: t.name,
            color: t.color,
          }));
          dispatch({ type: "SET_TAGS", tags: mapped });
        }
      } catch (e) {
        console.error("Failed to fetch tags", e);
      } finally {
        dispatch({ type: "SET_LOADING", key: "tags", value: false });
      }
    };

    fetchTags();
  }, [state.activeWorkspaceId]);

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

export function useFilteredProjects() {
  const { projects, activeWorkspaceId } = useWorkspace()
  return React.useMemo(() => {
    return projects.filter((p) => p.workspaceId === activeWorkspaceId)
  }, [projects, activeWorkspaceId])
}

export function useProjectColumns() {
  const { columns, activeProjectId } = useWorkspace()
  return React.useMemo(() => {
    if (!activeProjectId) return []
    return columns.filter((c) => c.projectId === activeProjectId)
  }, [columns, activeProjectId])
}
