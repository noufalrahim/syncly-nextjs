import * as React from "react"
import { ArrowLeft, Settings, Columns, Tags, Users, AlertTriangle, Trash2, Plus, Edit2, Loader2, GripVertical, Link, Github, Check } from "lucide-react"
import { cn } from "@/core/utils"
import { useDispatch, useWorkspace, useProjectColumns } from "@/presentation/state/workspace-store"
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogHeader,
  DialogFooter,
} from "@/presentation/components/ui/dialog"
import { Button } from "@/presentation/components/ui/button"
import { Input } from "@/presentation/components/ui/input"
import { Label } from "@/presentation/components/ui/label"
import { Checkbox } from "@/presentation/components/ui/checkbox"
import { UserAvatar } from "@/presentation/components/user-avatar"
import EmojiPicker, { Theme } from "emoji-picker-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/presentation/components/ui/popover"
import { useTheme } from "next-themes"
import { getHexColor } from "@/domain/label-colors"
import { toast } from "sonner"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

function SortableColumnItem({ 
  col, 
  onDelete,
  onEdit
}: { 
  col: any, 
  onDelete: (id: string) => void,
  onEdit: () => void 
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: col.id })

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 0,
    opacity: isDragging ? 0.5 : 1,
  }

  const hexColor = getHexColor(col.color)

  return (
    <div 
      ref={setNodeRef}
      style={style}
      className="flex items-center justify-between px-4 py-3 bg-card border border-border rounded-lg group hover:border-primary/30 transition-all duration-200"
    >
      <div className="flex items-center gap-4">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-muted-foreground/30 hover:text-muted-foreground transition-colors"
          type="button"
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <span 
          className="h-3 w-3 rounded-full shadow-sm ring-2 ring-background" 
          style={{ backgroundColor: hexColor }} 
        />
        <span className="text-sm font-semibold">{col.label}</span>
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
          onClick={onEdit}
        >
          <Settings className="h-4 w-4" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          onClick={() => onDelete(col.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

export function ProjectSettingsDialog({
  open,
  onOpenChange,
  projectId
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectId: string | null
}) {
  const { projects, users, tags, columns: allStoreColumns, currentUserId, workspaces } = useWorkspace()
  const { theme } = useTheme()
  const dispatch = useDispatch()
  const project = projects.find(p => p.id === projectId)

  const [activeTab, setActiveTab] = React.useState<"general" | "columns" | "tags" | "members" | "connections" | "danger">("general")

  const [projectName, setProjectName] = React.useState("")
  const [projectEmoji, setProjectEmoji] = React.useState("")
  const [githubRepo, setGithubRepo] = React.useState("")
  const [isConnecting, setIsConnecting] = React.useState(false)
  const [isAuthModalOpen, setIsAuthModalOpen] = React.useState(false)
  const [isConnected, setIsConnected] = React.useState(false)
  const [selectedRepo, setSelectedRepo] = React.useState("")
  const [isPickerOpen, setIsPickerOpen] = React.useState(false)
  const [deleteConfirm, setDeleteConfirm] = React.useState("")
  const [localColumns, setLocalColumns] = React.useState<any[]>([])
  const [isSaving, setIsSaving] = React.useState(false)
  const [isDeleting, setIsDeleting] = React.useState(false)

  // Members
  const [projectMembers, setProjectMembers] = React.useState<any[]>([])
  const [isMembersLoading, setIsMembersLoading] = React.useState(false)
  const [isAddMemberOpen, setIsAddMemberOpen] = React.useState(false)
  const [selectedMemberIds, setSelectedMemberIds] = React.useState<string[]>([])

  // Column Dialog states
  const [isColumnDialogOpen, setIsColumnDialogOpen] = React.useState(false)
  const [columnEditing, setColumnEditing] = React.useState<any | null>(null)
  const [columnLabelInput, setColumnLabelInput] = React.useState("")
  const [columnColorInput, setColumnColorInput] = React.useState("gray")

  // Tag Dialog states
  const [isTagDialogOpen, setIsTagDialogOpen] = React.useState(false)
  const [tagEditing, setTagEditing] = React.useState<any | null>(null)
  const [tagNameInput, setTagNameInput] = React.useState("")
  const [tagColorInput, setTagColorInput] = React.useState("blue")

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  React.useEffect(() => {
    if (project) {
      setProjectName(project.name)
      setProjectEmoji(project.emoji)
      setGithubRepo(project.githubRepo || "")
      setIsConnected(!!project.githubRepo)
      setSelectedRepo(project.githubRepo || "")
      
      // Fetch columns for this project
      fetch(`/api/columns?projectId=${project.id}`)
        .then(res => res.json())
        .then(data => {
          if (data.columns) {
            setLocalColumns(data.columns.map((c: any) => ({
              id: c._id,
              label: c.label,
              status: c.status,
              projectId: c.projectId,
              color: c.color || "gray",
            })))
          }
        })
    }
  }, [project])

  React.useEffect(() => {
    if (!project?.id) return
    setIsMembersLoading(true)
    fetch(`/api/projects/members?projectId=${project.id}`)
      .then(res => res.json())
      .then(data => setProjectMembers(data.members || []))
      .catch(() => setProjectMembers([]))
      .finally(() => setIsMembersLoading(false))
  }, [project?.id])

  const projectTags = tags.filter(t => t.projectId === project?.id)
  const workspaceOwnerId = workspaces.find((w: any) => String(w.id) === String(project?.workspaceId))?.ownerId as
    | string
    | undefined
  const projectMemberIds = React.useMemo(
    () => new Set(projectMembers.map((m) => String(m.userId))),
    [projectMembers]
  )
  const addableUsers = React.useMemo(
    () =>
      users.filter(
        (u) =>
          !u.isBot &&
          u.id !== currentUserId &&
          u.id !== workspaceOwnerId &&
          !projectMemberIds.has(String(u.id))
      ),
    [users, currentUserId, workspaceOwnerId, projectMemberIds]
  )
  const currentUserRole = projectMembers.find(m => String(m.userId) === String(currentUserId))?.role
  const isProjectAdmin = currentUserId === workspaceOwnerId || currentUserRole === "admin"

  if (!project) return null

  const handleSaveGeneral = async () => {
    if (!projectName.trim()) return
    setIsSaving(true)
    try {
      dispatch({ type: "UPDATE_PROJECT", projectId: project.id, patch: { name: projectName.trim(), emoji: projectEmoji } })
      await fetch("/api/projects", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: project.id, patch: { name: projectName.trim(), emoji: projectEmoji } })
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveConnections = async () => {
    setIsSaving(true)
    try {
      dispatch({ type: "UPDATE_PROJECT", projectId: project.id, patch: { githubRepo: githubRepo.trim() } })
      await fetch("/api/projects", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: project.id, patch: { githubRepo: githubRepo.trim() } })
      })
      toast.success("Connections saved successfully")
    } catch (err) {
      console.error(err)
      toast.error("Failed to save connections")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteProject = async () => {
    if (deleteConfirm !== project.name) return
    setIsDeleting(true)
    try {
      dispatch({ type: "DELETE_PROJECT", projectId: project.id })
      dispatch({ type: "SELECT_PROJECT", projectId: null })
      await fetch(`/api/projects?projectId=${project.id}`, { method: "DELETE" })
      onOpenChange(false)
    } finally {
      setIsDeleting(false)
    }
  }

  // Columns CRUD
  const handleDeleteColumn = async (colId: string) => {
    dispatch({ type: "DELETE_COLUMN", columnId: colId })
    setLocalColumns(prev => prev.filter(c => c.id !== colId))
    await fetch(`/api/columns?columnId=${colId}`, { method: "DELETE" })
  }

  const handleSaveColumn = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!columnLabelInput.trim()) return

    if (columnEditing) {
      // Edit column
      const updated = { label: columnLabelInput.trim(), color: columnColorInput }
      
      dispatch({ type: "UPDATE_COLUMN", columnId: columnEditing.id, patch: updated })
      setLocalColumns(prev => prev.map(c => c.id === columnEditing.id ? { ...c, ...updated } : c))
      
      await fetch("/api/columns", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          columnId: columnEditing.id,
          patch: updated
        })
      }).catch(err => console.error("Failed to edit column", err))
    } else {
      // Create column
      const res = await fetch("/api/columns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          label: columnLabelInput.trim(),
          color: columnColorInput,
          projectId: project.id,
          status: columnLabelInput.trim().toLowerCase().replace(/\s+/g, "-"),
          order: localColumns.length
        })
      })
      if (res.ok) {
        const data = await res.json()
        const newCol = {
          id: data.column._id,
          label: data.column.label,
          status: data.column.status,
          projectId: data.column.projectId,
          color: data.column.color
        }
        setLocalColumns(prev => [...prev, newCol])
        dispatch({ type: "SET_COLUMNS", columns: [...allStoreColumns, newCol] })
      }
    }
    setIsColumnDialogOpen(false)
  }

  const handleColumnDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = localColumns.findIndex(c => c.id === active.id)
    const newIndex = localColumns.findIndex(c => c.id === over.id)
    const newColumns = arrayMove(localColumns, oldIndex, newIndex)
    
    setLocalColumns(newColumns)

    // Update locally in store
    newColumns.forEach((col, idx) => {
      dispatch({ type: "UPDATE_COLUMN", columnId: col.id, patch: { order: idx } })
    })

    // Persist
    Promise.all(newColumns.map((col, idx) => 
      fetch("/api/columns", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          columnId: col.id,
          patch: { order: idx }
        })
      })
    )).catch(err => console.error("Failed to persist column reorder", err))
  }

  // Tags CRUD
  const handleDeleteTag = async (tagId: string) => {
    dispatch({ type: "DELETE_TAG", tagId })
    await fetch(`/api/tags?tagId=${tagId}`, { method: "DELETE" })
      .catch(err => console.error("Failed to delete tag", err))
  }

  const handleSaveTag = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!tagNameInput.trim()) return

    if (tagEditing) {
      // Edit tag
      const updated = { name: tagNameInput.trim(), color: tagColorInput }
      dispatch({ type: "UPDATE_TAG", tagId: tagEditing.id, patch: updated })
      
      await fetch("/api/tags", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tagId: tagEditing.id,
          patch: updated
        })
      }).catch(err => console.error("Failed to update tag", err))
    } else {
      // Create tag
      const res = await fetch("/api/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: tagNameInput.trim(),
          color: tagColorInput,
          workspaceId: project.workspaceId || project.id,
          projectId: project.id
        })
      })
      if (res.ok) {
        const data = await res.json()
        dispatch({
          type: "ADD_TAG",
          tag: {
            id: data.tag._id,
            name: data.tag.name,
            color: data.tag.color,
            projectId: data.tag.projectId,
            workspaceId: data.tag.workspaceId
          }
        })
      }
    }
    setIsTagDialogOpen(false)
  }

  const COLOR_PALETTE = ["gray", "red", "orange", "yellow", "green", "blue", "purple", "pink"]

  const TABS = [
    { id: "general", label: "General", icon: Settings },
    { id: "columns", label: "Columns", icon: Columns },
    { id: "tags", label: "Tags", icon: Tags },
    { id: "members", label: "Members", icon: Users },
    { id: "connections", label: "Connections", icon: Link },
    { id: "danger", label: "Danger", icon: AlertTriangle },
  ] as const

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[1400px] w-[95vw] h-[85vh] p-0 overflow-hidden bg-background border-border flex flex-col hide-close-button">
        <DialogTitle className="sr-only">Project Settings</DialogTitle>
        
        <div className="flex-shrink-0 px-6 py-4 border-b border-border/40">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => onOpenChange(false)}
              className="h-8 w-8 inline-flex items-center justify-center rounded-full hover:bg-muted transition-colors text-muted-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div>
              <h1 className="text-lg font-semibold leading-none flex items-center gap-2">
                <span>{project.emoji}</span> {project.name} Settings
              </h1>
              <p className="text-xs text-muted-foreground mt-1">Manage project configuration</p>
            </div>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar Tabs */}
          <div className="w-64 flex-shrink-0 border-r border-border/40 p-4 space-y-1">
            {TABS.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                    isActive 
                      ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                      : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-foreground",
                    tab.id === "danger" && isActive && "bg-destructive/10 text-destructive hover:bg-destructive/20"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              )
            })}
          </div>

          {/* Main Content Area */}
          <div className="flex-1 overflow-y-auto p-8 bg-muted/5">
            <div className="max-w-5xl mx-auto">
              
              {activeTab === "general" && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-xl font-semibold">General Settings</h2>
                    <p className="text-sm text-muted-foreground mt-1">Update your project basics and how it appears in the workspace.</p>
                  </div>
                  
                  <div className="space-y-6 bg-card border border-border rounded-xl p-6">
                    <div className="grid grid-cols-[120px_1fr] gap-8">
                      <div className="space-y-2">
                        <Label>Emoji</Label>
                        <Popover open={isPickerOpen} onOpenChange={setIsPickerOpen}>
                          <PopoverTrigger asChild>
                            <Button 
                              variant="outline" 
                              className="w-full text-2xl h-14 bg-background border-border/50 hover:border-primary/30 transition-all shadow-sm"
                            >
                              {projectEmoji || "🚀"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="p-0 border-none shadow-2xl" side="bottom" align="start">
                            <EmojiPicker
                              onEmojiClick={(emojiData) => {
                                setProjectEmoji(emojiData.emoji)
                                setIsPickerOpen(false)
                              }}
                              theme={theme === "dark" ? Theme.DARK : Theme.LIGHT}
                              lazyLoadEmojis={true}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      <div className="space-y-2">
                        <Label>Project Name</Label>
                        <Input 
                          value={projectName} 
                          onChange={(e) => setProjectName(e.target.value)} 
                          className="h-14 text-lg"
                        />
                      </div>
                    </div>
                    <div className="pt-2">
                      <Button onClick={handleSaveGeneral} size="lg" disabled={isSaving}>
                        {isSaving ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          "Save Changes"
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "columns" && (
                <div className="space-y-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-semibold">Workflow Columns</h2>
                      <p className="text-sm text-muted-foreground mt-1">Define the columns that represent your project's process.</p>
                    </div>
                    <Button 
                      variant="secondary" 
                      className="h-10 px-4"
                      onClick={() => {
                        setColumnEditing(null)
                        setColumnLabelInput("")
                        setColumnColorInput("gray")
                        setIsColumnDialogOpen(true)
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" /> Add Column
                    </Button>
                  </div>

                  <div className="bg-card border border-border rounded-xl p-6 space-y-6">
                    <div className="space-y-3">
                      {localColumns.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground text-sm italic">
                          No columns created yet. Click Add Column to start!
                        </div>
                      ) : (
                        <DndContext
                          sensors={sensors}
                          collisionDetection={closestCenter}
                          onDragEnd={handleColumnDragEnd}
                        >
                          <SortableContext
                            items={localColumns.map(c => c.id)}
                            strategy={verticalListSortingStrategy}
                          >
                            {localColumns.map(col => (
                              <SortableColumnItem 
                                key={col.id} 
                                col={col} 
                                onDelete={handleDeleteColumn}
                                onEdit={() => {
                                  setColumnEditing(col)
                                  setColumnLabelInput(col.label)
                                  setColumnColorInput(col.color)
                                  setIsColumnDialogOpen(true)
                                }}
                              />
                            ))}
                          </SortableContext>
                        </DndContext>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "tags" && (
                <div className="space-y-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-semibold">Task Tags</h2>
                      <p className="text-sm text-muted-foreground mt-1">Categorize your tasks with colorful, descriptive tags (scoped to this project).</p>
                    </div>
                    <Button 
                      variant="secondary" 
                      size="sm"
                      onClick={() => {
                        setTagEditing(null)
                        setTagNameInput("")
                        setTagColorInput("blue")
                        setIsTagDialogOpen(true)
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" /> New Tag
                    </Button>
                  </div>

                  <div className="bg-card border border-border rounded-xl p-6">
                    {projectTags.length === 0 ? (
                      <div className="text-center py-10 text-muted-foreground text-sm italic">
                        No tags found for this project. Create one to get started!
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-3">
                        {projectTags.map(t => {
                          const tagHex = getHexColor(t.color)
                          return (
                            <div 
                              key={t.id} 
                              className="flex items-center justify-between px-4 py-3 border border-border/60 rounded-lg group hover:bg-muted/30 transition-all duration-200"
                            >
                              <div className="flex items-center gap-3">
                                <span 
                                  className="h-2.5 w-2.5 rounded-full ring-2 ring-background shadow-sm" 
                                  style={{ backgroundColor: tagHex }}
                                />
                                <span className="text-sm font-semibold">{t.name}</span>
                              </div>
                              <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                  onClick={() => {
                                    setTagEditing(t)
                                    setTagNameInput(t.name)
                                    setTagColorInput(t.color)
                                    setIsTagDialogOpen(true)
                                  }}
                                >
                                  <Edit2 className="h-3.5 w-3.5" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                  onClick={() => handleDeleteTag(t.id)}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "members" && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-xl font-semibold">Team Members</h2>
                    <p className="text-sm text-muted-foreground mt-1">Manage who has access to this project and their permissions.</p>
                  </div>

                  <div className="bg-card border border-border rounded-xl overflow-hidden">
                    <div className="p-6 border-b border-border/40 bg-muted/20">
                      <div className="flex items-center justify-between gap-3">
                        <div className="text-sm text-muted-foreground">
                          Add members from your workspace/organisation list.
                        </div>
                        {isProjectAdmin && (
                          <Button className="px-6" onClick={() => setIsAddMemberOpen(true)}>
                            <Plus className="h-4 w-4 mr-2" /> Add Member
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="divide-y divide-border/40">
                      {isMembersLoading ? (
                        <div className="p-6 text-sm text-muted-foreground">Loading members…</div>
                      ) : projectMembers.length === 0 ? (
                        <div className="p-6 text-sm text-muted-foreground">No project members yet.</div>
                      ) : (
                        projectMembers.map((m) => {
                          const name = String(m.name || m.email || "User")
                          const initials = name
                            .split(" ")
                            .filter(Boolean)
                            .slice(0, 2)
                            .map((s: string) => s[0]?.toUpperCase())
                            .join("") || "U"
                          const avatarUser = { id: m.userId, name, initials, color: "bg-blue-500" }
                          return (
                            <div key={m.userId} className="flex items-center justify-between p-6 hover:bg-muted/10 transition-colors">
                              <div className="flex items-center gap-4">
                                <UserAvatar user={avatarUser as any} size="lg" />
                                <div>
                                  <div className="text-sm font-semibold">{name}</div>
                                  <div className="text-xs text-muted-foreground">{m.email}</div>
                                </div>
                              </div>
                              <div className="flex items-center gap-6">
                                <span className="text-xs font-bold capitalize tracking-wider px-2.5 py-1 bg-primary/10 text-primary rounded-full">
                                  {String(m.role || "member")}
                                </span>
                                {isProjectAdmin && (
                                  <button
                                    className="text-xs text-muted-foreground hover:text-destructive transition-colors"
                                    onClick={async () => {
                                      await fetch(`/api/projects/members?projectId=${project.id}&userId=${m.userId}`, { method: "DELETE" })
                                      const res = await fetch(`/api/projects/members?projectId=${project.id}`)
                                      const data = await res.json().catch(() => ({}))
                                      setProjectMembers(data.members || [])
                                    }}
                                  >
                                    Remove
                                  </button>
                                )}
                              </div>
                            </div>
                          )
                        })
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "connections" && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-xl font-semibold">Integrations & Connections</h2>
                    <p className="text-sm text-muted-foreground mt-1">Connect this project to external services like GitHub to enable rich features in chat.</p>
                  </div>
                  
                  <div className="space-y-6 bg-card border border-border rounded-xl p-6">
                    {!isConnected && !isConnecting && !isAuthModalOpen && (
                      <div className="flex items-center justify-between p-4 bg-muted/20 border border-border rounded-xl">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-lg bg-foreground/10 flex items-center justify-center">
                            <Github className="h-6 w-6" />
                          </div>
                          <div>
                            <h3 className="text-sm font-semibold">GitHub Integration</h3>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              Link pull requests and issues to get automated reports in chat.
                            </p>
                          </div>
                        </div>
                        <Button 
                          variant="outline" 
                          onClick={() => {
                            setIsConnecting(true)
                            setTimeout(() => {
                              setIsConnecting(false)
                              setIsAuthModalOpen(true)
                            }, 1500)
                          }}
                        >
                          Connect
                        </Button>
                      </div>
                    )}

                    {isConnecting && (
                      <div className="flex flex-col items-center justify-center py-10 space-y-4 border border-border rounded-xl bg-muted/5">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="text-sm text-muted-foreground animate-pulse">
                          Redirecting to GitHub for authorization...
                        </p>
                      </div>
                    )}

                    {isAuthModalOpen && (
                      <div className="border border-border/80 rounded-xl overflow-hidden bg-background max-w-xl mx-auto shadow-xl">
                        <div className="p-6 border-b border-border bg-muted/20 flex items-center gap-3">
                          <Github className="h-6 w-6" />
                          <h3 className="text-sm font-semibold">Authorize Syncly on GitHub</h3>
                        </div>
                        <div className="p-6 space-y-4">
                          <div className="flex items-center gap-4 text-xs text-muted-foreground p-3 bg-muted/30 border border-border rounded-lg">
                            <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                            <span>Grants read access to public/private repositories metadata, issues, and pull requests.</span>
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            Syncly will be authorized to access repositories on behalf of your GitHub account <strong>noufalrahim</strong>.
                          </p>
                          <div className="flex items-center gap-3 pt-2">
                            <Button 
                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium animate-pulse-once"
                              onClick={() => {
                                setIsAuthModalOpen(false)
                                setIsConnected(true)
                                setSelectedRepo("noufalrahim/syncly-nextjs")
                                toast.success("Successfully authenticated with GitHub")
                              }}
                            >
                              Authorize noufalrahim
                            </Button>
                            <Button 
                              variant="ghost"
                              onClick={() => {
                                setIsAuthModalOpen(false)
                              }}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}

                    {isConnected && (
                      <div className="space-y-6">
                        <div className="flex items-center justify-between p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
                          <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                              <Github className="h-6 w-6" />
                            </div>
                            <div>
                              <h3 className="text-sm font-semibold flex items-center gap-2">
                                GitHub <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-500/20 text-emerald-600 rounded-full">CONNECTED</span>
                              </h3>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                Connected as <strong>noufalrahim</strong>
                              </p>
                            </div>
                          </div>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={async () => {
                              setIsSaving(true)
                              try {
                                dispatch({ type: "UPDATE_PROJECT", projectId: project.id, patch: { githubRepo: "" } })
                                await fetch("/api/projects", {
                                  method: "PATCH",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({ projectId: project.id, patch: { githubRepo: "" } })
                                })
                                setIsConnected(false)
                                setGithubRepo("")
                                setSelectedRepo("")
                                toast.success("Disconnected GitHub integration")
                              } catch (e) {
                                toast.error("Failed to disconnect GitHub")
                              } finally {
                                setIsSaving(false)
                              }
                            }}
                          >
                            Disconnect
                          </Button>
                        </div>

                        <div className="space-y-3 bg-muted/10 p-6 rounded-xl border border-border">
                          <div className="space-y-1.5">
                            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Select Repository</Label>
                            <select
                              value={selectedRepo}
                              onChange={(e) => setSelectedRepo(e.target.value)}
                              className="w-full h-11 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring"
                            >
                              <option value="" disabled>-- Select repository --</option>
                              <option value="noufalrahim/syncly-nextjs">noufalrahim/syncly-nextjs (Recommended)</option>
                              <option value="google/antigravity">google/antigravity</option>
                              <option value="vercel/next.js">vercel/next.js</option>
                              <option value="facebook/react">facebook/react</option>
                              <option value="tailwindlabs/tailwindcss">tailwindlabs/tailwindcss</option>
                            </select>
                            <p className="text-[11px] text-muted-foreground mt-1">
                              Select a repository to allow users to fetch details and code review reports on `@PR-XXX` and `@Issue-XXX` mentions.
                            </p>
                          </div>

                          <div className="pt-2">
                            <Button 
                              disabled={!selectedRepo || isSaving}
                              onClick={async () => {
                                setIsSaving(true)
                                try {
                                  dispatch({ type: "UPDATE_PROJECT", projectId: project.id, patch: { githubRepo: selectedRepo } })
                                  await fetch("/api/projects", {
                                    method: "PATCH",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({ projectId: project.id, patch: { githubRepo: selectedRepo } })
                                  })
                                  setGithubRepo(selectedRepo)
                                  toast.success(`Repository connection saved: ${selectedRepo}`)
                                } catch (e) {
                                  toast.error("Failed to save repository selection")
                                } finally {
                                  setIsSaving(false)
                                }
                              }}
                            >
                              {isSaving ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Saving...
                                </>
                              ) : (
                                "Save Repository Connection"
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "danger" && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-xl font-semibold text-destructive">Danger Zone</h2>
                    <p className="text-sm text-muted-foreground mt-1">Actions here are permanent and cannot be reversed.</p>
                  </div>

                  <div className="space-y-6 border border-destructive/20 bg-destructive/5 rounded-xl p-8">
                    <div className="space-y-2">
                      <h3 className="text-base font-semibold text-destructive">Delete this project</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Once you delete a project, there is no going back. Please be certain.
                        This will remove all tasks, columns, and project-specific data.
                      </p>
                    </div>
                    
                    <div className="space-y-3 pt-2">
                      <Label className="text-xs uppercase tracking-widest text-muted-foreground/70">Type <span className="text-foreground font-bold">{project.name}</span> to confirm</Label>
                      <Input 
                        value={deleteConfirm}
                        onChange={(e) => setDeleteConfirm(e.target.value)}
                        placeholder={project.name}
                        className="max-w-md h-12 border-destructive/30 focus-visible:ring-destructive bg-background"
                      />
                    </div>
                    
                    <Button 
                      variant="destructive" 
                      size="lg"
                      disabled={deleteConfirm !== project.name || isDeleting}
                      onClick={handleDeleteProject}
                      className="w-full sm:w-auto px-10 shadow-lg shadow-destructive/20"
                    >
                      {isDeleting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Deleting...
                        </>
                      ) : (
                        <>
                          <Trash2 className="h-4 w-4 mr-2" /> Delete Permanently
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </DialogContent>

      {/* Add Members Dialog */}
      <Dialog open={isAddMemberOpen} onOpenChange={setIsAddMemberOpen}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>Add Members</DialogTitle>
            <DialogDescription>Select one or more users from your workspace/organisation.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="max-h-72 overflow-auto rounded-md border border-border p-2 space-y-1">
              {users.length === 0 ? (
                <div className="p-2 text-sm text-muted-foreground">No workspace users loaded.</div>
              ) : addableUsers.length === 0 ? (
                <div className="p-2 text-sm text-muted-foreground">Everyone is already in this project.</div>
              ) : (
                addableUsers.map((u) => {
                  const checked = selectedMemberIds.includes(u.id)
                  return (
                    <label key={u.id} className="flex items-center gap-3 px-2 py-2 rounded-md hover:bg-muted/40 cursor-pointer">
                      <Checkbox
                        checked={checked}
                        onCheckedChange={(next) => {
                          const isChecked = next === true
                          setSelectedMemberIds((prev) =>
                            isChecked ? [...prev, u.id] : prev.filter((id) => id !== u.id)
                          )
                        }}
                      />
                      <div className="text-sm font-medium">{u.name}</div>
                    </label>
                  )
                })
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => {
                setSelectedMemberIds([])
                setIsAddMemberOpen(false)
              }}
            >
              Cancel
            </Button>
            <Button
              disabled={!selectedMemberIds.length}
              onClick={async () => {
                await fetch("/api/projects/members", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ projectId: project.id, userIds: selectedMemberIds }),
                })
                const res = await fetch(`/api/projects/members?projectId=${project.id}`)
                const data = await res.json().catch(() => ({}))
                setProjectMembers(data.members || [])
                setSelectedMemberIds([])
                setIsAddMemberOpen(false)
              }}
            >
              Add Selected
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Column creation/editing Dialog */}
      <Dialog open={isColumnDialogOpen} onOpenChange={setIsColumnDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{columnEditing ? "Edit Column" : "Add New Column"}</DialogTitle>
            <DialogDescription>
              {columnEditing ? "Modify your column properties below." : "Add a new column stage to your workflow."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveColumn} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="col-name">Column Name</Label>
              <Input
                id="col-name"
                value={columnLabelInput}
                onChange={(e) => setColumnLabelInput(e.target.value)}
                placeholder="e.g. In Review, QA, Deployed"
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label>Column Color</Label>
              <div className="flex flex-wrap items-center gap-2">
                {COLOR_PALETTE.map((c) => {
                  const hex = getHexColor(c)
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColumnColorInput(c)}
                      className={cn(
                        "h-8 w-8 rounded-full flex items-center justify-center border-2 transition-all cursor-pointer shadow-sm",
                        columnColorInput === c ? "border-primary scale-110 shadow-md" : "border-transparent opacity-80 hover:opacity-100 hover:scale-105"
                      )}
                      style={{ backgroundColor: hex }}
                      aria-label={`Select ${c} color`}
                    />
                  )
                })}
                
                {/* Custom Color Picker */}
                <div className="relative h-8 w-8 rounded-full overflow-hidden border-2 cursor-pointer shadow-sm group hover:scale-105 transition-all flex items-center justify-center"
                     style={{ borderColor: columnColorInput.startsWith("#") ? "hsl(var(--primary))" : "transparent" }}>
                  <div 
                    className="absolute inset-0 h-full w-full flex items-center justify-center text-xs font-semibold text-white bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500"
                    style={columnColorInput.startsWith("#") ? { background: columnColorInput } : {}}
                  >
                    <Plus className="h-4 w-4 text-white drop-shadow" />
                  </div>
                  <input
                    type="color"
                    value={columnColorInput.startsWith("#") ? columnColorInput : "#3b82f6"}
                    onChange={(e) => setColumnColorInput(e.target.value)}
                    className="absolute inset-0 h-full w-full p-0 m-0 border-0 cursor-pointer opacity-0 z-10"
                  />
                </div>
              </div>
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsColumnDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={!columnLabelInput.trim()}>
                {columnEditing ? "Save Column" : "Add Column"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Tag creation/editing Dialog */}
      <Dialog open={isTagDialogOpen} onOpenChange={setIsTagDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{tagEditing ? "Edit Tag" : "Create New Tag"}</DialogTitle>
            <DialogDescription>
              {tagEditing ? "Update your tag name and styling." : "Add a custom tag scoped to this project."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveTag} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="tag-name">Tag Name</Label>
              <Input
                id="tag-name"
                value={tagNameInput}
                onChange={(e) => setTagNameInput(e.target.value)}
                placeholder="e.g. Backend, Refactor, Blocked"
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label>Tag Color</Label>
              <div className="flex flex-wrap items-center gap-2">
                {COLOR_PALETTE.map((c) => {
                  const hex = getHexColor(c)
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setTagColorInput(c)}
                      className={cn(
                        "h-8 w-8 rounded-full flex items-center justify-center border-2 transition-all cursor-pointer shadow-sm",
                        tagColorInput === c ? "border-primary scale-110 shadow-md" : "border-transparent opacity-80 hover:opacity-100 hover:scale-105"
                      )}
                      style={{ backgroundColor: hex }}
                      aria-label={`Select ${c} color`}
                    />
                  )
                })}
                
                {/* Custom Color Picker */}
                <div className="relative h-8 w-8 rounded-full overflow-hidden border-2 cursor-pointer shadow-sm group hover:scale-105 transition-all flex items-center justify-center"
                     style={{ borderColor: tagColorInput.startsWith("#") ? "hsl(var(--primary))" : "transparent" }}>
                  <div 
                    className="absolute inset-0 h-full w-full flex items-center justify-center text-xs font-semibold text-white bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500"
                    style={tagColorInput.startsWith("#") ? { background: tagColorInput } : {}}
                  >
                    <Plus className="h-4 w-4 text-white drop-shadow" />
                  </div>
                  <input
                    type="color"
                    value={tagColorInput.startsWith("#") ? tagColorInput : "#3b82f6"}
                    onChange={(e) => setTagColorInput(e.target.value)}
                    className="absolute inset-0 h-full w-full p-0 m-0 border-0 cursor-pointer opacity-0 z-10"
                  />
                </div>
              </div>
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsTagDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={!tagNameInput.trim()}>
                {tagEditing ? "Save Tag" : "Create Tag"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Dialog>
  )
}
