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
  Workspace,
  Document as Doc
} from "@/domain/types"

type ColumnDef = { 
  id: string; 
  status?: TaskStatus; 
  label: string; 
  projectId: string; 
  color?: string;
  order: number;
}

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
  channels: ChatChannel[]
  messages: ChatMessage[]
  activeTypingBotId: string | null
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
  | { type: "ADD_NOTE"; note: Note }
  | { type: "DELETE_NOTE"; noteId: string }
  | { type: "UPDATE_NOTE"; noteId: string; patch: Partial<Note> }
  | { type: "SET_NOTES"; notes: Note[] }
  | { type: "SELECT_CHANNEL"; channelId: string }
  | { type: "CREATE_CHANNEL"; name: string; description?: string; id?: string; memberIds?: string[] }
  | { type: "ADD_CHANNEL_MEMBER"; channelId: string; userId: string }
  | { type: "SEND_MESSAGE"; channelId: string; body: string; parentId?: string; authorId?: string; id?: string; createdAt?: string }
  | { type: "ADD_AGENT"; agent: User }
  | { type: "UPDATE_AGENT"; agentId: string; patch: Partial<User> }
  | { type: "DELETE_AGENT"; agentId: string }
  | { type: "SET_TYPING_BOT"; botId: string | null }
  | { type: "TOGGLE_REACTION"; messageId: string; emoji: string }
  | { type: "SET_USERS"; users: User[] }
  | { type: "SET_CURRENT_USER"; user: User | null }
  | { type: "ADD_PROJECT"; project: Project }
  | { type: "UPDATE_PROJECT"; projectId: string; patch: Partial<Project> }
  | { type: "DELETE_PROJECT"; projectId: string }
  | { type: "ADD_WORKSPACE"; workspace: Workspace }
  | { type: "SELECT_WORKSPACE"; workspaceId: string | null }
  | { type: "SET_WORKSPACES"; workspaces: Workspace[] }
  | { type: "SET_PROJECTS"; projects: Project[] }
  | { type: "SET_TASKS"; tasks: Task[] }
  | { type: "SET_COLUMNS"; columns: ColumnDef[] }
  | { type: "SET_TAGS"; tags: Tag[] }
  | { type: "ADD_TAG"; tag: Tag }
  | { type: "UPDATE_TAG"; tagId: string; patch: Partial<Tag> }
  | { type: "DELETE_TAG"; tagId: string }
  | { type: "SET_LOADING"; key: keyof State["loading"]; value: boolean }
  | { type: "SET_DOCUMENTS"; documents: Doc[] }
  | { type: "ADD_DOCUMENT"; document: Doc }
  | { type: "DELETE_DOCUMENT"; documentId: string }
  | { type: "SET_GOALS"; goals: any[] }
  | { type: "ADD_GOAL"; goal: any }
  | { type: "UPDATE_GOAL"; goalId: string; patch: any }
  | { type: "DELETE_GOAL"; goalId: string }
  | { type: "SET_MESSAGES"; messages: ChatMessage[] }
  | { type: "SET_CUSTOM_CHANNELS"; channels: ChatChannel[] }


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
  activeTypingBotId: null,
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
            color: "gray",
            order: state.columns.length
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
      return { ...state, notes: [action.note, ...state.notes] }
    }
    case "SET_NOTES": {
      return { ...state, notes: action.notes }
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
    case "CREATE_CHANNEL": {
      const newChan = {
        id: action.id || `c-${Date.now()}`,
        type: "channel" as const,
        name: action.name,
        description: action.description || "",
        memberIds: action.memberIds || (state.currentUserId ? [state.currentUserId] : []),
        unreadCount: 0,
      }
      return {
        ...state,
        channels: [...state.channels, newChan],
        activeChannelId: newChan.id,
      }
    }
    case "SET_CUSTOM_CHANNELS": {
      const baseChannels = state.channels.filter(
        (c) => c.id === "c-general" || c.id === "c-random" || c.id.startsWith("dm-")
      )
      return {
        ...state,
        channels: [...baseChannels, ...action.channels]
      }
    }
    case "ADD_CHANNEL_MEMBER": {
      return {
        ...state,
        channels: state.channels.map((c) =>
          c.id === action.channelId
            ? { ...c, memberIds: [...c.memberIds, action.userId] }
            : c
        ),
      }
    }
    case "SEND_MESSAGE": {
      const trimmed = action.body.trim()
      if (!trimmed) return state
      const msg: ChatMessage = {
        id: action.id || `m-${Date.now()}`,
        channelId: action.channelId,
        authorId: action.authorId || state.currentUserId || "",
        body: trimmed,
        createdAt: action.createdAt || new Date().toISOString(),
        reactions: [],
        parentId: action.parentId,
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
    case "ADD_AGENT": {
      return {
        ...state,
        users: [...state.users, action.agent],
      }
    }
    case "UPDATE_AGENT": {
      return {
        ...state,
        users: state.users.map((u) =>
          u.id === action.agentId ? { ...u, ...action.patch } : u
        ),
      }
    }
    case "DELETE_AGENT": {
      return {
        ...state,
        users: state.users.filter((u) => u.id !== action.agentId),
        channels: state.channels.map((c) => ({
          ...c,
          memberIds: c.memberIds.filter((id) => id !== action.agentId),
        })),
      }
    }
    case "SET_TYPING_BOT": {
      return {
        ...state,
        activeTypingBotId: action.botId,
      }
    }
    case "SET_MESSAGES": {
      return { ...state, messages: action.messages }
    }
    case "SET_USERS": {
      let workspaceAgents: User[] = []
      if (typeof window !== "undefined" && state.activeWorkspaceId) {
        const saved = localStorage.getItem(`syncly_agents_${state.activeWorkspaceId}`)
        if (saved) {
          try {
            workspaceAgents = JSON.parse(saved)
          } catch (e) {
            console.error("Failed to parse saved agents", e)
          }
        }
      }
      const combinedUsers = [...action.users, ...workspaceAgents]

      const defaultChannels = [
        {
          id: "c-general",
          type: "channel" as const,
          name: "general",
          description: "Company-wide announcements and work-based matters",
          memberIds: combinedUsers.map((u) => u.id),
          unreadCount: 0,
        },
        {
          id: "c-random",
          type: "channel" as const,
          name: "random",
          description: "Non-work talk and banter",
          memberIds: combinedUsers.map((u) => u.id),
          unreadCount: 0,
        },
      ]

      const dmChannels = combinedUsers
        .filter((u) => u.id !== state.currentUserId && !u.isBot)
        .map((u) => ({
          id: `dm-${u.id}`,
          type: "dm" as const,
          name: u.name,
          memberIds: [state.currentUserId || "", u.id],
          unreadCount: 0,
        }))

      let userCreatedChannels = state.channels.filter(
        (c) => c.type === "channel" && c.id !== "c-general" && c.id !== "c-random"
      )
      if (userCreatedChannels.length === 0 && typeof window !== "undefined" && state.activeWorkspaceId) {
        const saved = localStorage.getItem(`syncly_channels_${state.activeWorkspaceId}`)
        if (saved) {
          try {
            userCreatedChannels = JSON.parse(saved)
          } catch (e) {
            console.error("Failed to parse saved channels", e)
          }
        }
      }

      const allChannels = [...defaultChannels, ...userCreatedChannels, ...dmChannels]

      return {
        ...state,
        users: combinedUsers,
        channels: allChannels,
        activeChannelId: state.activeChannelId || "c-general",
      }
    }
    case "SET_CURRENT_USER":
      return { ...state, currentUserId: action.user?.id || null, users: action.user ? [action.user] : [] }
    case "ADD_PROJECT":
      return { ...state, projects: [...state.projects, action.project] }
    case "UPDATE_PROJECT":
      return {
        ...state,
        projects: state.projects.map((p) =>
          p.id === action.projectId ? { ...p, ...action.patch } : p
        ),
      }
    case "DELETE_PROJECT": {
      const nextProjects = state.projects.filter((p) => p.id !== action.projectId)
      const nextActiveId = state.activeProjectId === action.projectId ? (nextProjects[0]?.id || null) : state.activeProjectId
      return {
        ...state,
        projects: nextProjects,
        activeProjectId: nextActiveId,
      }
    }
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
    case "UPDATE_TAG":
      return {
        ...state,
        tags: state.tags.map((t) =>
          t.id === action.tagId ? { ...t, ...action.patch } : t,
        ),
      }
    case "DELETE_TAG":
      return {
        ...state,
        tags: state.tags.filter((t) => t.id !== action.tagId),
      }
    case "SET_DOCUMENTS":
      return { ...state, documents: action.documents }
    case "ADD_DOCUMENT":
      return { ...state, documents: [action.document, ...state.documents] }
    case "DELETE_DOCUMENT": {
      const idsToDelete = new Set([action.documentId])
      let sizeBefore: number
      do {
        sizeBefore = idsToDelete.size
        for (const doc of state.documents) {
          if (doc.parentId && idsToDelete.has(doc.parentId)) {
            idsToDelete.add(doc.id)
          }
        }
      } while (idsToDelete.size > sizeBefore)
      return {
        ...state,
        documents: state.documents.filter((d) => !idsToDelete.has(d.id)),
      }
    }
    case "SET_GOALS":
      return { ...state, goals: action.goals }
    case "ADD_GOAL":
      return { ...state, goals: [action.goal, ...state.goals] }
    case "UPDATE_GOAL":
      return {
        ...state,
        goals: state.goals.map((g) => g.id === action.goalId ? { ...g, ...action.patch } : g)
      }
    case "DELETE_GOAL":
      return { ...state, goals: state.goals.filter((g) => g.id !== action.goalId) }
    case "SET_LOADING":
      return {
        ...state,
        loading: { ...state.loading, [action.key]: action.value }
      }
    default:
      return state

  }
}

function getBotResponse(botName: string, botPrompt: string, userMessage: string): string {
  const msg = userMessage.toLowerCase()
  const prompt = botPrompt.toLowerCase()

  if (botName.includes("review") || prompt.includes("review") || prompt.includes("code")) {
    if (msg.includes("code") || msg.includes("function") || msg.includes("review") || msg.includes("merge")) {
      return `### Code Review Report (by ${botName})
I have analyzed the submitted changes:
- **Style & Consistency:** Clean and follows formatting standards.
- **Complexity:** O(1) space complexity is optimal here.
- **Potential Bugs:** No race conditions or memory leaks detected.
- **Recommendation:** Approve and merge! ✅`
    }
    return `Hello! I am ${botName}, your automated code reviewer. Please paste some code or describe the PR, and I will check it against my system instructions: *"${botPrompt}"*.`
  }

  if (botName.includes("test") || prompt.includes("test") || prompt.includes("qa")) {
    if (msg.includes("run") || msg.includes("test") || msg.includes("deploy") || msg.includes("build")) {
      return `### Automated Test Suite Run (by ${botName})
- **Unit Tests:** 24/24 passed (100% code coverage)
- **Integration Tests:** 8/8 passed
- **Performance:** Load testing completed in 1.4s (within SLAs)
- **Status:** **PASSED** 🟢`
    }
    return `Hi! I am ${botName}, your testing assistant. I can run unit tests or integration simulations. Let me know when to start!`
  }

  if (botName.includes("support") || prompt.includes("help") || prompt.includes("customer")) {
    return `Thank you for reaching out! As ${botName}, I've processed your query based on my prompt. Here is my support suggestion:\n- Please verify workspace permissions.\n- Let me know if you need escalation to a human engineer.`
  }

  return `[Agent Response]
Hello! I am **${botName}**. I have read your message: "${userMessage}"
I am responding based on my system instructions:
> *"${botPrompt}"*`
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
    const normalizeUser = (raw: any) => {
      if (!raw) return null;
      const name = String(raw.name || raw.email || "User");
      const email = raw.email ? String(raw.email) : undefined;
      const initials = name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((s: string) => s[0]?.toUpperCase())
        .join("");
      return {
        id: String(raw.id),
        name,
        email,
        initials: initials || "U",
        color: "bg-blue-500",
        theme: raw.theme || "dark",
        token: raw.token || "",
      };
    };

    const cleanLocalStorage = () => {
      if (typeof window !== "undefined") {
        localStorage.removeItem("syncly_user");
        localStorage.removeItem("theme");
        localStorage.removeItem("token");
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && (key.startsWith("syncly_agents_") || key.startsWith("syncly_channels_") || key.startsWith("syncly_messages_"))) {
            localStorage.removeItem(key);
            i--;
          }
        }
      }
    };

    const handleRedirect = () => {
      if (typeof window !== "undefined") {
        const path = window.location.pathname;
        if (!path.startsWith("/auth") && !path.startsWith("/invitations")) {
          window.location.href = "/auth/login";
        }
      }
    };

    (async () => {
      try {
        cleanLocalStorage();
        const res = await fetch("/api/me");
        if (!res.ok) {
          handleRedirect();
          return;
        }
        const data = await res.json();
        if (!data?.user || !data.user.token) {
          handleRedirect();
          return;
        }
        const user = normalizeUser(data.user);
        dispatch({ type: "SET_CURRENT_USER", user });
      } catch (e) {
        console.error("Failed to fetch current user", e);
        handleRedirect();
      }
    })();
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
      dispatch({ type: "SET_USERS", users: [] });
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
    if (state.currentUserId) {
      const user = state.users.find((u) => u.id === state.currentUserId);
      if (user?.theme) {
        if (user.theme === "dark") {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      }
    }
  }, [state.currentUserId, state.users]);

  React.useEffect(() => {
    if (!state.activeWorkspaceId) {
      dispatch({ type: "SET_USERS", users: [] });
      return;
    }
    (async () => {
      try {
        const [membersRes, agentsRes] = await Promise.all([
          fetch(`/api/workspaces/members?workspaceId=${state.activeWorkspaceId}`),
          fetch(`/api/agents?workspaceId=${state.activeWorkspaceId}`)
        ]);

        let humanUsers: any[] = [];
        if (membersRes.ok) {
          const data = await membersRes.json();
          const palette = ["bg-blue-500", "bg-emerald-500", "bg-violet-500", "bg-amber-500", "bg-rose-500"];
          humanUsers = (data.members || []).map((m: any, idx: number) => {
            const name = String(m.name || m.email || "User");
            const email = m.email ? String(m.email) : undefined;
            const initials = name
              .split(" ")
              .filter(Boolean)
              .slice(0, 2)
              .map((s: string) => s[0]?.toUpperCase())
              .join("");
            return {
              id: m.userId,
              name,
              email,
              initials: initials || "U",
              color: palette[idx % palette.length],
            };
          });
        }

        let agentUsers: any[] = [];
        if (agentsRes.ok) {
          const data = await agentsRes.json();
          agentUsers = data.agents || [];
        }

        dispatch({ type: "SET_USERS", users: [...humanUsers, ...agentUsers] });
      } catch (e) {
        console.error("Failed to fetch workspace users", e);
      }
    })();
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
            order: c.order || 0,
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
            projectId: t.projectId,
            workspaceId: t.workspaceId,
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

  React.useEffect(() => {
    if (!state.activeWorkspaceId) {
      dispatch({ type: "SET_NOTES", notes: [] });
      return;
    }

    const fetchNotes = async () => {
      try {
        const res = await fetch(`/api/notes?workspaceId=${state.activeWorkspaceId}`);
        if (res.ok) {
          const data = await res.json();
          const mapped = data.notes.map((n: any) => ({
            id: n._id,
            title: n.title,
            body: n.body,
            projectId: n.projectId,
            workspaceId: n.workspaceId,
            updatedAt: n.updatedAt || n.createdAt || new Date().toISOString(),
          }));
          dispatch({ type: "SET_NOTES", notes: mapped });
        }
      } catch (e) {
        console.error("Failed to fetch notes", e);
      }
    };

    fetchNotes();
  }, [state.activeWorkspaceId]);

  React.useEffect(() => {
    if (!state.activeWorkspaceId) {
      dispatch({ type: "SET_DOCUMENTS", documents: [] });
      return;
    }

    const fetchDocuments = async () => {
      try {
        const res = await fetch(`/api/documents?workspaceId=${state.activeWorkspaceId}`);
        if (res.ok) {
          const data = await res.json();
          const mapped = data.documents.map((d: any) => ({
            id: d._id,
            name: d.name,
            type: d.type,
            size: d.size,
            parentId: d.parentId,
            workspaceId: d.workspaceId,
            ownerId: d.ownerId,
            updatedAt: d.updatedAt || d.createdAt || new Date().toISOString(),
          }));
          dispatch({ type: "SET_DOCUMENTS", documents: mapped });
        }
      } catch (e) {
        console.error("Failed to fetch documents", e);
      }
    };

    fetchDocuments();
  }, [state.activeWorkspaceId]);

  React.useEffect(() => {
    if (!state.activeWorkspaceId) {
      dispatch({ type: "SET_GOALS", goals: [] });
      return;
    }

    const fetchGoals = async () => {
      try {
        const res = await fetch(`/api/goals?workspaceId=${state.activeWorkspaceId}`);
        if (res.ok) {
          const data = await res.json();
          const mapped = data.goals.map((g: any) => ({
            id: g._id,
            title: g.title,
            description: g.description,
            progress: g.progress,
            status: g.status,
            dueDate: g.dueDate,
            ownerId: g.ownerId,
            workspaceId: g.workspaceId,
          }));
          dispatch({ type: "SET_GOALS", goals: mapped });
        }
      } catch (e) {
        console.error("Failed to fetch goals", e);
      }
    };

    fetchGoals();
  }, [state.activeWorkspaceId]);

  React.useEffect(() => {
    if (!state.activeWorkspaceId) {
      dispatch({ type: "SET_CUSTOM_CHANNELS", channels: [] })
      return
    }
    (async () => {
      try {
        const res = await fetch(`/api/channels?workspaceId=${state.activeWorkspaceId}`)
        if (res.ok) {
          const data = await res.json()
          dispatch({ type: "SET_CUSTOM_CHANNELS", channels: data.channels })
        }
      } catch (e) {
        console.error("Failed to fetch channels", e)
      }
    })()
  }, [state.activeWorkspaceId])

  React.useEffect(() => {
    if (!state.activeWorkspaceId) {
      dispatch({ type: "SET_MESSAGES", messages: [] })
      return
    }
    (async () => {
      try {
        const res = await fetch(`/api/messages?workspaceId=${state.activeWorkspaceId}`)
        if (res.ok) {
          const data = await res.json()
          dispatch({ type: "SET_MESSAGES", messages: data.messages })
        }
      } catch (e) {
        console.error("Failed to fetch messages", e)
      }
    })()
  }, [state.activeWorkspaceId])

  React.useEffect(() => {
    if (state.messages.length === 0) return
    const lastMsg = state.messages[state.messages.length - 1]
    const author = state.users.find((u) => u.id === lastMsg.authorId)
    if (author?.isBot) return

    const mentionedBots = state.users.filter((u) => {
      if (!u.isBot) return false
      const prefix = u.name.startsWith("@") ? "" : "@"
      return lastMsg.body.includes(`${prefix}${u.name}`)
    })
    if (mentionedBots.length === 0) return

    const channel = state.channels.find((c) => c.id === lastMsg.channelId)
    if (!channel) return

    const botToTrigger = mentionedBots.find((bot) => channel.memberIds.includes(bot.id))
    if (!botToTrigger) return

    dispatch({ type: "SET_TYPING_BOT", botId: botToTrigger.id })
    const timeout = setTimeout(() => {
      const responseBody = getBotResponse(botToTrigger.name, botToTrigger.prompt || "", lastMsg.body);
      (async () => {
        try {
          const res = await fetch("/api/messages", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              workspaceId: state.activeWorkspaceId,
              channelId: lastMsg.channelId,
              authorId: botToTrigger.id,
              body: responseBody,
              parentId: lastMsg.parentId,
            }),
          });
          if (res.ok) {
            const data = await res.json();
            dispatch({
              type: "SEND_MESSAGE",
              channelId: data.message.channelId,
              body: data.message.body,
              parentId: data.message.parentId,
              authorId: data.message.authorId,
              id: data.message.id,
              createdAt: data.message.createdAt,
            });
          }
        } catch (e) {
          console.error("Bot response failed", e);
        } finally {
          dispatch({ type: "SET_TYPING_BOT", botId: null })
        }
      })();
    }, 1500)

    return () => clearTimeout(timeout)
  }, [state.messages, state.users, state.channels, state.activeWorkspaceId])

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
    return columns
      .filter((c) => c.projectId === activeProjectId)
      .sort((a, b) => a.order - b.order)
  }, [columns, activeProjectId])
}
