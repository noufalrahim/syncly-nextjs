"use client"

import * as React from "react"
import { Plus, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useDispatch, useWorkspace } from "@/lib/workspace-store"

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

export function NotesModule() {
  const { notes } = useWorkspace()
  const dispatch = useDispatch()
  const [activeId, setActiveId] = React.useState<string | null>(
    notes[0]?.id ?? null,
  )

  React.useEffect(() => {
    if (!notes.find((n) => n.id === activeId)) {
      setActiveId(notes[0]?.id ?? null)
    }
  }, [notes, activeId])

  const note = notes.find((n) => n.id === activeId)

  return (
    <div className="flex-1 flex overflow-hidden">
      <aside className="w-72 shrink-0 border-r border-border flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h2 className="text-sm font-semibold">Notes</h2>
          <button
            type="button"
            onClick={() => dispatch({ type: "ADD_NOTE" })}
            className="h-7 w-7 inline-flex items-center justify-center rounded hover:bg-accent text-muted-foreground hover:text-foreground"
            aria-label="New note"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 overflow-auto">
          {notes.map((n) => (
            <button
              type="button"
              key={n.id}
              onClick={() => setActiveId(n.id)}
              className={cn(
                "w-full text-left px-4 py-3 border-b border-border hover:bg-accent/40 transition-colors",
                n.id === activeId && "bg-accent/60",
              )}
            >
              <div className="text-sm font-medium truncate">{n.title}</div>
              <div className="flex items-center justify-between mt-0.5 gap-2">
                <p className="text-xs text-muted-foreground line-clamp-1 flex-1">
                  {n.body || "No content"}
                </p>
                <span className="text-[10px] text-muted-foreground shrink-0">
                  {formatRelative(n.updatedAt)}
                </span>
              </div>
            </button>
          ))}
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        {note ? (
          <NoteEditor key={note.id} note={note} />
        ) : (
          <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground">
            Select or create a note
          </div>
        )}
      </div>
    </div>
  )
}

function NoteEditor({
  note,
}: {
  note: { id: string; title: string; body: string; updatedAt: string }
}) {
  const dispatch = useDispatch()
  const [title, setTitle] = React.useState(note.title)
  const [body, setBody] = React.useState(note.body)

  function save(patch: { title?: string; body?: string }) {
    dispatch({ type: "UPDATE_NOTE", noteId: note.id, patch })
  }

  return (
    <>
      <div className="flex items-center justify-between px-6 py-3 border-b border-border">
        <div className="text-xs text-muted-foreground">
          Updated {formatRelative(note.updatedAt)}
        </div>
        <button
          type="button"
          onClick={() => dispatch({ type: "DELETE_NOTE", noteId: note.id })}
          className="h-7 w-7 inline-flex items-center justify-center rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
          aria-label="Delete note"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
      <div className="flex-1 overflow-auto px-6 py-6 max-w-3xl w-full mx-auto">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={() => save({ title: title.trim() || "Untitled" })}
          placeholder="Untitled note"
          className="w-full bg-transparent text-3xl font-semibold outline-none placeholder:text-muted-foreground/60 mb-4"
        />
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onBlur={() => save({ body })}
          placeholder="Start writing…"
          className="w-full bg-transparent text-sm leading-relaxed outline-none resize-none min-h-[60vh] placeholder:text-muted-foreground/60"
        />
      </div>
    </>
  )
}
