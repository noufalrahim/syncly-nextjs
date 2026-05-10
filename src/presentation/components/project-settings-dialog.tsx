import * as React from "react"
import { ArrowLeft, Settings, Columns, Tags, Users, AlertTriangle, Trash2, Plus, MoreHorizontal } from "lucide-react"
import { cn } from "@/core/utils"
import { useDispatch, useWorkspace, useProjectColumns } from "@/presentation/state/workspace-store"
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/presentation/components/ui/dialog"
import { Button } from "@/presentation/components/ui/button"
import { Input } from "@/presentation/components/ui/input"
import { Label } from "@/presentation/components/ui/label"
import { UserAvatar } from "@/presentation/components/user-avatar"
import type { Project } from "@/domain/types"
import EmojiPicker, { Theme } from "emoji-picker-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/presentation/components/ui/popover"
import { useTheme } from "next-themes"

export function ProjectSettingsDialog({
  open,
  onOpenChange,
  projectId
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectId: string | null
}) {
  const { projects, users, tags } = useWorkspace()
  const { theme } = useTheme()
  const dispatch = useDispatch()
  const project = projects.find(p => p.id === projectId)
  const columns = useProjectColumns()

  const [activeTab, setActiveTab] = React.useState<"general" | "columns" | "tags" | "members" | "danger">("general")

  const [projectName, setProjectName] = React.useState("")
  const [projectEmoji, setProjectEmoji] = React.useState("")
  const [isPickerOpen, setIsPickerOpen] = React.useState(false)
  const [deleteConfirm, setDeleteConfirm] = React.useState("")
  const [localColumns, setLocalColumns] = React.useState<any[]>([])

  React.useEffect(() => {
    if (project) {
      setProjectName(project.name)
      setProjectEmoji(project.emoji)
      
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

  if (!project) return null

  const handleSaveGeneral = async () => {
    if (!projectName.trim()) return
    dispatch({ type: "UPDATE_PROJECT", projectId: project.id, patch: { name: projectName.trim(), emoji: projectEmoji } })
    await fetch("/api/projects", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId: project.id, patch: { name: projectName.trim(), emoji: projectEmoji } })
    })
  }

  const handleDeleteProject = async () => {
    if (deleteConfirm !== project.name) return
    dispatch({ type: "DELETE_PROJECT", projectId: project.id })
    dispatch({ type: "SELECT_PROJECT", projectId: null })
    await fetch(`/api/projects?projectId=${project.id}`, { method: "DELETE" })
    onOpenChange(false)
  }

  const handleDeleteColumn = async (colId: string) => {
    dispatch({ type: "DELETE_COLUMN", columnId: colId })
    setLocalColumns(prev => prev.filter(c => c.id !== colId))
    await fetch(`/api/columns?columnId=${colId}`, { method: "DELETE" })
  }

  const TABS = [
    { id: "general", label: "General", icon: Settings },
    { id: "columns", label: "Columns", icon: Columns },
    { id: "tags", label: "Tags", icon: Tags },
    { id: "members", label: "Members", icon: Users },
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
                      <Button onClick={handleSaveGeneral} size="lg">Save Changes</Button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "columns" && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-xl font-semibold">Workflow Columns</h2>
                    <p className="text-sm text-muted-foreground mt-1">Define the columns that represent your project's process.</p>
                  </div>

                  <div className="bg-card border border-border rounded-xl p-6 space-y-6">
                    <div className="flex items-center gap-3">
                      <Input placeholder="Add a new column..." className="h-11" />
                      <Button variant="secondary" className="h-11 px-6"><Plus className="h-4 w-4 mr-2" /> Add Column</Button>
                    </div>

                    <div className="space-y-3">
                      {localColumns.map(col => (
                        <div key={col.id} className="flex items-center justify-between px-4 py-3 bg-muted/20 border border-border/50 rounded-lg group hover:border-primary/30 transition-colors">
                          <div className="flex items-center gap-4">
                            <MoreHorizontal className="h-4 w-4 text-muted-foreground/30 cursor-grab" />
                            <span className={cn("h-3 w-3 rounded-full shadow-sm")} style={{ backgroundColor: col.color === "gray" ? "#9ca3af" : col.color }} />
                            <span className="text-sm font-semibold">{col.label}</span>
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="icon" className="h-8 w-8"><Settings className="h-4 w-4" /></Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                              onClick={() => handleDeleteColumn(col.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "tags" && (
                <div className="space-y-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-semibold">Task Tags</h2>
                      <p className="text-sm text-muted-foreground mt-1">Categorize your tasks with colorful, descriptive tags.</p>
                    </div>
                    <Button variant="secondary" size="sm"><Plus className="h-4 w-4 mr-2" /> New Tag</Button>
                  </div>

                  <div className="bg-card border border-border rounded-xl p-6">
                    <div className="grid grid-cols-2 gap-3">
                      {tags.map(t => (
                        <div key={t.id} className="flex items-center justify-between px-4 py-3 border border-border/60 rounded-lg group hover:bg-muted/30 transition-colors">
                          <div className="flex items-center gap-3">
                            <span className={cn("h-2.5 w-2.5 rounded-full ring-2 ring-background shadow-sm", `bg-${t.color}-500`)} />
                            <span className="text-sm font-medium">{t.name}</span>
                          </div>
                          <button className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-all">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
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
                      <div className="flex items-center gap-3">
                        <div className="flex-1 px-4 py-2 bg-background border border-border rounded-md text-sm text-muted-foreground">Select workspace user</div>
                        <Button className="px-6">Invite Member</Button>
                      </div>
                    </div>

                    <div className="divide-y divide-border/40">
                      {/* Current user */}
                      <div className="flex items-center justify-between p-6 hover:bg-muted/10 transition-colors">
                        <div className="flex items-center gap-4">
                          <UserAvatar user={users[0]} size="lg" />
                          <div>
                            <div className="text-sm font-semibold">{users[0]?.name}</div>
                            <div className="text-xs text-muted-foreground">{users[0]?.email}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 bg-primary/10 text-primary rounded-full">Admin</span>
                          <button className="text-xs text-muted-foreground hover:text-destructive transition-colors">Remove</button>
                        </div>
                      </div>
                    </div>
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
                      disabled={deleteConfirm !== project.name}
                      onClick={handleDeleteProject}
                      className="w-full sm:w-auto px-10 shadow-lg shadow-destructive/20"
                    >
                      <Trash2 className="h-4 w-4 mr-2" /> Delete Permanently
                    </Button>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
