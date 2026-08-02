"use client"

import * as React from "react"
import { 
  Plus, 
  Trash2, 
  Loader2, 
  Check, 
  CloudCheck,
  Bold, 
  Italic, 
  Underline as UnderlineIcon, 
  Strikethrough, 
  Code, 
  List, 
  ListOrdered, 
  CheckSquare, 
  Quote, 
  Terminal, 
  Heading1, 
  Heading2, 
  Heading3, 
  Sparkles,
  Link as LinkIcon,
  ChevronsUpDown,
  Search,
  FolderDot
} from "lucide-react"
import { cn } from "@/core/utils"
import { useDispatch, useWorkspace, useFilteredProjects } from "@/presentation/state/workspace-store"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/presentation/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/presentation/components/ui/dialog"
import { Button } from "@/presentation/components/ui/button"

// Tiptap Editor Imports
import { useEditor, EditorContent } from "@tiptap/react"
import { BubbleMenu } from "@tiptap/react/menus"
import StarterKit from "@tiptap/starter-kit"
import Placeholder from "@tiptap/extension-placeholder"
import Underline from "@tiptap/extension-underline"
import Link from "@tiptap/extension-link"
import TaskList from "@tiptap/extension-task-list"
import TaskItem from "@tiptap/extension-task-item"

function formatRelative(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  const diffH = Math.round((now.getTime() - d.getTime()) / 3_600_000)
  if (diffH < 1) return "just now"
  if (diffH < 24) return `${diffH}h ago`
  const diffD = Math.round(diffH / 24)
  if (diffD < 7) return `${diffD}d ago`
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

function getPlainTextFromHtml(html: string) {
  if (!html) return "No content"
  // Strip HTML tags for side panel preview
  const plainText = html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim()
  return plainText || "No content"
}

export function NotesModule() {
  const { notes, activeProjectId, activeWorkspaceId } = useWorkspace()
  const projects = useFilteredProjects()
  const dispatch = useDispatch()
  
  const [activeId, setActiveId] = React.useState<string | null>(null)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [isCreating, setIsCreating] = React.useState(false)

  // Filter notes based on active project and search query
  const filteredNotes = React.useMemo(() => {
    let result = notes
    if (activeProjectId) {
      result = result.filter((n) => n.projectId === activeProjectId)
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.body.toLowerCase().includes(q)
      )
    }
    return result
  }, [notes, activeProjectId, searchQuery])

  // Set default active note if none is selected or selection is outside this project
  React.useEffect(() => {
    const stillValid = activeId && filteredNotes.some((n) => n.id === activeId)
    if (filteredNotes.length > 0 && !stillValid) {
      setActiveId(filteredNotes[0].id)
    } else if (filteredNotes.length === 0) {
      setActiveId(null)
    }
  }, [filteredNotes, activeId])

  const note = notes.find((n) => n.id === activeId)

  const handleAddNote = async () => {
    if (!activeWorkspaceId) return
    
    // Choose project to associate: activeProjectId, or first project, or show warning if none
    let projId = activeProjectId
    if (!projId && projects.length > 0) {
      projId = projects[0].id
    }
    
    if (!projId) {
      alert("Please create a Project first in the sidebar before creating a Note!")
      return
    }

    setIsCreating(true)
    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Untitled note",
          body: "<p></p>",
          projectId: projId,
          workspaceId: activeWorkspaceId,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        const createdNote = {
          id: data.note._id,
          title: data.note.title,
          body: data.note.body,
          projectId: data.note.projectId,
          workspaceId: data.note.workspaceId,
          updatedAt: data.note.updatedAt || data.note.createdAt,
        }
        dispatch({ type: "ADD_NOTE", note: createdNote })
        setActiveId(createdNote.id)
      }
    } catch (e) {
      console.error("Failed to create note:", e)
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="flex-1 flex overflow-hidden bg-background">
      {/* Sidebar List */}
      <aside className="w-80 shrink-0 border-r border-border flex flex-col bg-card/10 backdrop-blur-sm">
        <div className="p-4 border-b border-border flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold tracking-wide uppercase text-muted-foreground/80">
              {activeProjectId ? "Project Notes" : "All Notes"}
            </h2>
            <button
              type="button"
              disabled={isCreating}
              onClick={handleAddNote}
              className="h-8 w-8 inline-flex items-center justify-center rounded-lg bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground transition-all duration-200"
              aria-label="New note"
            >
              {isCreating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
            </button>
          </div>
          
          {/* Search bar */}
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60" />
            <input
              type="search"
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-9 pr-4 bg-muted/40 border border-border/40 focus:border-primary/50 text-xs rounded-lg outline-none placeholder:text-muted-foreground/50 transition-colors"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filteredNotes.map((n) => {
            const isSelected = n.id === activeId
            const noteProject = projects.find((p) => p.id === n.projectId)
            
            return (
              <button
                type="button"
                key={n.id}
                onClick={() => setActiveId(n.id)}
                className={cn(
                  "w-full text-left p-3 rounded-xl border border-transparent transition-all duration-200 group relative",
                  isSelected
                    ? "bg-accent/60 border-border shadow-sm"
                    : "hover:bg-accent/30 text-muted-foreground hover:text-foreground"
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className={cn(
                    "text-sm font-semibold truncate flex-1",
                    isSelected ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
                  )}>
                    {n.title || "Untitled Note"}
                  </span>
                  <span className="text-[10px] text-muted-foreground/60 shrink-0 mt-0.5">
                    {formatRelative(n.updatedAt)}
                  </span>
                </div>
                
                <p className="text-xs text-muted-foreground/70 line-clamp-1 mt-1 leading-relaxed">
                  {getPlainTextFromHtml(n.body)}
                </p>

                {/* Associated Project Tag at bottom */}
                <div className="mt-2.5 flex items-center justify-between">
                  <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-muted/60 border border-border/40 text-[10px] text-muted-foreground font-medium max-w-[150px] truncate">
                    <span className="text-xs shrink-0">{noteProject?.emoji || "📝"}</span>
                    <span className="truncate">{noteProject?.name || "General"}</span>
                  </div>
                </div>
              </button>
            )
          })}

          {filteredNotes.length === 0 && (
            <div className="py-12 text-center flex flex-col items-center justify-center">
              <FolderDot className="h-10 w-10 text-muted-foreground/30 stroke-[1.5] mb-2" />
              <p className="text-xs text-muted-foreground italic">No notes found</p>
            </div>
          )}
        </div>
      </aside>

      {/* Note Editor Area */}
      <div className="flex-1 flex flex-col overflow-hidden bg-background">
        {note ? (
          <NoteEditor key={note.id} note={note} projects={projects} />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8">
            <Sparkles className="h-12 w-12 text-muted-foreground/20 stroke-[1.5] mb-3 animate-pulse" />
            <p className="text-sm font-medium">Select or create a note</p>
            <p className="text-xs text-muted-foreground/70 mt-1 max-w-xs text-center leading-relaxed">
              Organize your project objectives, documentation, and ideas in a rich, Notion-styled interface.
            </p>
            <button
              onClick={handleAddNote}
              className="mt-4 px-4 py-2 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/95 transition-all shadow-md shadow-primary/10 flex items-center gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" />
              Create your first note
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function EditorToolbar({ editor }: { editor: any }) {
  if (!editor) return null

  return (
    <div className="flex flex-wrap items-center gap-1 p-1 bg-muted/30 border-b border-border/60">
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={cn(
          "p-1.5 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors",
          editor.isActive("heading", { level: 1 }) && "bg-accent text-accent-foreground font-semibold"
        )}
        title="Heading 1"
      >
        <Heading1 className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={cn(
          "p-1.5 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors",
          editor.isActive("heading", { level: 2 }) && "bg-accent text-accent-foreground font-semibold"
        )}
        title="Heading 2"
      >
        <Heading2 className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={cn(
          "p-1.5 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors",
          editor.isActive("heading", { level: 3 }) && "bg-accent text-accent-foreground font-semibold"
        )}
        title="Heading 3"
      >
        <Heading3 className="h-4 w-4" />
      </button>
      
      <div className="w-[1px] h-4 bg-border/60 mx-1" />

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={cn(
          "p-1.5 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors",
          editor.isActive("bold") && "bg-accent text-accent-foreground font-semibold"
        )}
        title="Bold"
      >
        <Bold className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={cn(
          "p-1.5 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors",
          editor.isActive("italic") && "bg-accent text-accent-foreground font-semibold"
        )}
        title="Italic"
      >
        <Italic className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={cn(
          "p-1.5 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors",
          editor.isActive("underline") && "bg-accent text-accent-foreground font-semibold"
        )}
        title="Underline"
      >
        <UnderlineIcon className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={cn(
          "p-1.5 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors",
          editor.isActive("strike") && "bg-accent text-accent-foreground font-semibold"
        )}
        title="Strikethrough"
      >
        <Strikethrough className="h-4 w-4" />
      </button>

      <div className="w-[1px] h-4 bg-border/60 mx-1" />

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={cn(
          "p-1.5 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors",
          editor.isActive("bulletList") && "bg-accent text-accent-foreground font-semibold"
        )}
        title="Bullet List"
      >
        <List className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={cn(
          "p-1.5 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors",
          editor.isActive("orderedList") && "bg-accent text-accent-foreground font-semibold"
        )}
        title="Numbered List"
      >
        <ListOrdered className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleTaskList().run()}
        className={cn(
          "p-1.5 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors",
          editor.isActive("taskList") && "bg-accent text-accent-foreground font-semibold"
        )}
        title="Checklist"
      >
        <CheckSquare className="h-4 w-4" />
      </button>

      <div className="w-[1px] h-4 bg-border/60 mx-1" />

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={cn(
          "p-1.5 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors",
          editor.isActive("blockquote") && "bg-accent text-accent-foreground font-semibold"
        )}
        title="Blockquote"
      >
        <Quote className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        className={cn(
          "p-1.5 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors",
          editor.isActive("codeBlock") && "bg-accent text-accent-foreground font-semibold"
        )}
        title="Code Block"
      >
        <Terminal className="h-4 w-4" />
      </button>
    </div>
  )
}

interface NoteEditorProps {
  note: { id: string; title: string; body: string; updatedAt: string; projectId: string }
  projects: any[]
}

function NoteEditor({ note, projects }: NoteEditorProps) {
  const dispatch = useDispatch()
  const [title, setTitle] = React.useState(note.title)
  const [saveStatus, setSaveStatus] = React.useState<"saved" | "saving" | "idle">("idle")
  const [isDeleting, setIsDeleting] = React.useState(false)
  const saveTimeoutRef = React.useRef<NodeJS.Timeout | null>(null)

  // Associated Project
  const currentProject = projects.find((p) => p.id === note.projectId)

  // triggerSave with debounce
  const triggerSave = (updatedPatch: any) => {
    setSaveStatus("saving")
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await fetch("/api/notes", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            noteId: note.id,
            patch: updatedPatch,
          }),
        })

        if (res.ok) {
          dispatch({ type: "UPDATE_NOTE", noteId: note.id, patch: updatedPatch })
          setSaveStatus("saved")
          setTimeout(() => setSaveStatus("idle"), 1500)
        } else {
          setSaveStatus("idle")
        }
      } catch (e) {
        console.error("Auto-save failed:", e)
        setSaveStatus("idle")
      }
    }, 800)
  }

  // Tiptap Editor configuration
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Placeholder.configure({
        placeholder: "Start writing or press '/' for commands…",
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-primary underline cursor-pointer",
        },
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
    ],
    content: note.body,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      triggerSave({ body: html })
    },
  })

  // Cleanup timeout on unmount
  React.useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [])

  // Sync title input updates
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setTitle(val)
    triggerSave({ title: val.trim() || "Untitled Note" })
  }

  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)

  const handleDelete = async () => {
    if (isDeleting) return

    setIsDeleting(true)
    try {
      const res = await fetch(`/api/notes?noteId=${note.id}`, {
        method: "DELETE",
      })

      if (res.ok) {
        dispatch({ type: "DELETE_NOTE", noteId: note.id })
      }
    } catch (e) {
      console.error("Failed to delete note:", e)
    } finally {
      setIsDeleting(false)
      setDeleteDialogOpen(false)
    }
  }

  const handleSwitchProject = (newProjectId: string) => {
    triggerSave({ projectId: newProjectId })
  }

  return (
    <>
      {/* Top note header controls */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-border">
        {/* Project Selector Badge */}
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button 
                type="button" 
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary/80 border border-border/80 text-xs font-semibold text-foreground hover:bg-secondary transition-all cursor-pointer"
              >
                <span>{currentProject?.emoji || "📝"}</span>
                <span>{currentProject?.name || "General Project"}</span>
                <ChevronsUpDown className="h-3 w-3 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuLabel className="text-xs uppercase text-muted-foreground/80 tracking-wide font-bold">
                Move Note to Project
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {projects.map((p) => (
                <DropdownMenuItem
                  key={p.id}
                  onClick={() => handleSwitchProject(p.id)}
                  className="cursor-pointer flex items-center justify-between text-xs"
                >
                  <span className="flex items-center gap-2">
                    <span>{p.emoji}</span>
                    <span className="truncate">{p.name}</span>
                  </span>
                  {p.id === note.projectId && <Check className="h-3 w-3 text-primary shrink-0" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Sync indicator */}
          <div className="flex items-center gap-1.5 pl-3 border-l border-border/60 h-4 text-xs text-muted-foreground/60 select-none">
            {saveStatus === "saving" && (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                <span>Saving...</span>
              </>
            )}
            {saveStatus === "saved" && (
              <>
                <CloudCheck className="h-3.5 w-3.5 text-emerald-500" />
                <span className="text-emerald-500/80 font-medium">Saved</span>
              </>
            )}
            {saveStatus === "idle" && (
              <span>Saved {formatRelative(note.updatedAt)}</span>
            )}
          </div>
        </div>

        {/* Delete note button */}
        <button
          type="button"
          disabled={isDeleting}
          onClick={() => setDeleteDialogOpen(true)}
          className="h-8 w-8 inline-flex items-center justify-center rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 border border-transparent hover:border-destructive/20 transition-all duration-200"
          aria-label="Delete note"
        >
          {isDeleting ? (
            <Loader2 className="h-4 w-4 animate-spin text-destructive" />
          ) : (
            <Trash2 className="h-4.5 w-4.5" />
          )}
        </button>
      </div>

      {/* Editor toolbar */}
      <EditorToolbar editor={editor} />

      {/* Editor text canvas */}
      <div className="flex-1 overflow-y-auto px-12 py-8 max-w-4xl w-full mx-auto space-y-6">
        {/* Editable Title */}
        <input
          value={title}
          onChange={handleTitleChange}
          placeholder="Untitled Note"
          className="w-full bg-transparent text-4xl font-extrabold outline-none border-none placeholder:text-muted-foreground/40 text-foreground tracking-tight"
        />

        {/* Bubble Menu formatting panel */}
        {editor && (
          <BubbleMenu editor={editor} tippyOptions={{ duration: 150 }}>
            <div className="flex items-center gap-0.5 bg-popover/95 border border-border p-1 rounded-xl shadow-2xl backdrop-blur-md">
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={cn(
                  "p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors",
                  editor.isActive("bold") && "bg-accent text-foreground font-semibold"
                )}
                title="Bold"
              >
                <Bold className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={cn(
                  "p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors",
                  editor.isActive("italic") && "bg-accent text-foreground font-semibold"
                )}
                title="Italic"
              >
                <Italic className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                className={cn(
                  "p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors",
                  editor.isActive("underline") && "bg-accent text-foreground font-semibold"
                )}
                title="Underline"
              >
                <UnderlineIcon className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleStrike().run()}
                className={cn(
                  "p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors",
                  editor.isActive("strike") && "bg-accent text-foreground font-semibold"
                )}
                title="Strike"
              >
                <Strikethrough className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleCode().run()}
                className={cn(
                  "p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors",
                  editor.isActive("code") && "bg-accent text-foreground font-semibold"
                )}
                title="Code"
              >
                <Code className="h-3.5 w-3.5" />
              </button>
            </div>
          </BubbleMenu>
        )}

        {/* Editor Body Canvas */}
        <div className="prose prose-invert max-w-none min-h-[50vh] text-foreground/90 selection:bg-primary/25">
          <EditorContent editor={editor} />
        </div>
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Note</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this note? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
