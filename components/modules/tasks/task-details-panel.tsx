"use client"

import * as React from "react"
import {
  AlignLeft,
  Bold,
  Calendar as CalendarIcon,
  ChevronDown,
  Clock,
  Code,
  Italic,
  Link as LinkIcon,
  List,
  MessageSquare,
  Paperclip,
  Plus,
  Send,
  Tag,
  Trash2,
  Underline,
  Upload,
  User as UserIcon,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { labelDotClass } from "@/lib/label-colors"
import {
  PRIORITY_META,
  STATUS_META,
  type Label as LabelT,
  type Task,
  type TaskPriority,
  type TaskStatus,
} from "@/lib/types"
import { useDispatch, useWorkspace } from "@/lib/workspace-store"
import { UserAvatar } from "@/components/user-avatar"

const STATUSES: TaskStatus[] = [
  "backlog",
  "in-progress",
  "on-hold",
  "done",
  "cancelled",
]
const PRIORITIES: TaskPriority[] = ["low", "medium", "high"]

function formatRelative(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffMin = Math.round(diffMs / 60000)
  if (diffMin < 1) return "just now"
  if (diffMin < 60) return `${diffMin}m ago`
  const diffH = Math.round(diffMin / 60)
  if (diffH < 24) return `${diffH}h ago`
  const diffD = Math.round(diffH / 24)
  if (diffD < 7) return `${diffD}d ago`
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

export function TaskDetailsPanel() {
  const { selectedTaskId, tasks } = useWorkspace()
  const dispatch = useDispatch()
  const task = tasks.find((t) => t.id === selectedTaskId)

  if (!task) return null

  return (
    <>
      <button
        type="button"
        aria-label="Close task details"
        onClick={() => dispatch({ type: "SELECT_TASK", taskId: null })}
        className="lg:hidden fixed inset-0 bg-black/40 z-30"
      />
      <aside
        className={cn(
          "fixed lg:static right-0 top-0 bottom-0 w-full sm:w-[460px] z-40",
          "bg-background border-l border-border flex flex-col",
          "animate-in slide-in-from-right duration-200",
        )}
      >
        <PanelBody key={task.id} task={task} />
      </aside>
    </>
  )
}

function PanelBody({ task }: { task: Task }) {
  const { users, labels, projects, tasks } = useWorkspace()
  const dispatch = useDispatch()
  const status = STATUS_META[task.status]
  const project = projects.find((p) => p.id === task.projectId)

  const [title, setTitle] = React.useState(task.title)
  const [description, setDescription] = React.useState(task.description)
  const [comment, setComment] = React.useState("")
  const [refTitle, setRefTitle] = React.useState("")
  const [refUrl, setRefUrl] = React.useState("")

  function patch(p: Partial<Task>) {
    dispatch({ type: "UPDATE_TASK", taskId: task.id, patch: p })
  }

  function toggleLabel(id: string) {
    const has = task.labels.includes(id)
    patch({
      labels: has
        ? task.labels.filter((x) => x !== id)
        : [...task.labels, id],
    })
  }

  function submitComment() {
    const body = comment.trim()
    if (!body) return
    dispatch({ type: "ADD_COMMENT", taskId: task.id, body })
    setComment("")
  }

  function submitReference() {
    if (!refTitle.trim() || !refUrl.trim()) return
    dispatch({
      type: "ADD_REFERENCE",
      taskId: task.id,
      ref: { title: refTitle.trim(), url: refUrl.trim() },
    })
    setRefTitle("")
    setRefUrl("")
  }

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2 text-xs text-muted-foreground min-w-0">
          {project && (
            <span className="inline-flex items-center gap-1 truncate">
              <span aria-hidden>{project.emoji}</span>
              <span className="truncate">{project.name}</span>
            </span>
          )}
          <span>·</span>
          <span className="font-mono">{task.id.toUpperCase()}</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => dispatch({ type: "DELETE_TASK", taskId: task.id })}
            className="h-7 w-7 inline-flex items-center justify-center rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            aria-label="Delete task"
          >
            <Trash2 className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => dispatch({ type: "SELECT_TASK", taskId: null })}
            className="h-7 w-7 inline-flex items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            aria-label="Close panel"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-5 py-4 space-y-5">
          {/* Title */}
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={() => patch({ title: title.trim() || "Untitled" })}
            className="w-full bg-transparent text-xl font-semibold outline-none focus:ring-0 placeholder:text-muted-foreground"
            placeholder="Task title"
          />

          {/* Properties */}
          <div className="grid grid-cols-[110px_1fr] gap-y-2.5 gap-x-3 text-sm">
            <PropLabel
              icon={<span className={cn("h-2 w-2 rounded-full", status.dot)} />}
            >
              Status
            </PropLabel>
            <Select
              value={task.status}
              onChange={(v) => patch({ status: v as TaskStatus })}
              options={STATUSES.map((s) => ({
                value: s,
                label: STATUS_META[s].label,
                dot: STATUS_META[s].dot,
              }))}
            />

            <PropLabel icon={<UserIcon className="h-3.5 w-3.5" />}>
              Assignee
            </PropLabel>
            <Select
              value={task.assigneeId}
              onChange={(v) => patch({ assigneeId: v })}
              options={users.map((u) => ({
                value: u.id,
                label: u.name,
                user: u,
              }))}
            />

            <PropLabel icon={<Clock className="h-3.5 w-3.5" />}>
              Priority
            </PropLabel>
            <Select
              value={task.priority}
              onChange={(v) => patch({ priority: v as TaskPriority })}
              options={PRIORITIES.map((p) => ({
                value: p,
                label: PRIORITY_META[p].label,
              }))}
            />

            <PropLabel icon={<CalendarIcon className="h-3.5 w-3.5" />}>
              Due date
            </PropLabel>
            <input
              type="date"
              value={task.dueDate.slice(0, 10)}
              onChange={(e) => {
                const d = new Date(e.target.value)
                d.setHours(9, 0, 0, 0)
                patch({ dueDate: d.toISOString() })
              }}
              className="bg-muted/40 border border-border focus:border-ring rounded px-2 py-1 text-sm outline-none w-fit cursor-pointer"
            />

            <PropLabel icon={<LinkIcon className="h-3.5 w-3.5" />}>
              Dependency
            </PropLabel>
            <Select
              value={task.dependencyId ?? ""}
              onChange={(v) =>
                patch({ dependencyId: v === "" ? undefined : v })
              }
              placeholder="No dependency"
              options={[
                { value: "", label: "No dependency" },
                ...tasks
                  .filter((t) => t.id !== task.id)
                  .map((t) => ({ value: t.id, label: t.title })),
              ]}
            />

            <PropLabel icon={<Tag className="h-3.5 w-3.5" />}>
              Labels
            </PropLabel>
            <LabelPicker
              selected={task.labels}
              onToggle={toggleLabel}
              allLabels={labels}
            />
          </div>

          <Divider />

          {/* Description */}
          <Section
            icon={<AlignLeft className="h-3.5 w-3.5" />}
            title="Description"
          >
            <RichTextEditor
              value={description}
              onChange={setDescription}
              onBlur={() => patch({ description })}
            />
          </Section>

          <Divider />

          {/* Attachments */}
          <Section
            icon={<Paperclip className="h-3.5 w-3.5" />}
            title="Attachments"
            count={task.attachments.length}
          >
            {task.attachments.length > 0 && (
              <ul className="space-y-1.5 mb-2">
                {task.attachments.map((a) => (
                  <li
                    key={a.id}
                    className="flex items-center gap-2 text-sm bg-muted/30 border border-border rounded-md px-2.5 py-1.5"
                  >
                    <Paperclip className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="truncate flex-1">{a.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {a.size}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            <button
              type="button"
              className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-accent/60 rounded-md border border-dashed border-border transition-colors"
            >
              <Upload className="h-3.5 w-3.5" />
              Upload files
            </button>
          </Section>

          <Divider />

          {/* References */}
          <Section
            icon={<LinkIcon className="h-3.5 w-3.5" />}
            title="References"
            count={task.references.length}
          >
            {task.references.length > 0 && (
              <ul className="space-y-1.5 mb-2">
                {task.references.map((r) => (
                  <li
                    key={r.id}
                    className="flex items-center gap-2 text-sm bg-muted/30 border border-border rounded-md px-2.5 py-1.5"
                  >
                    <LinkIcon className="h-3.5 w-3.5 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm truncate">{r.title}</div>
                      <div className="text-xs text-muted-foreground truncate">
                        {r.url}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <div className="grid grid-cols-[1fr_1.4fr_auto] gap-1.5">
              <input
                value={refTitle}
                onChange={(e) => setRefTitle(e.target.value)}
                placeholder="Title"
                className="bg-muted/40 border border-border focus:border-ring rounded px-2 py-1.5 text-sm outline-none"
              />
              <input
                value={refUrl}
                onChange={(e) => setRefUrl(e.target.value)}
                placeholder="https://"
                className="bg-muted/40 border border-border focus:border-ring rounded px-2 py-1.5 text-sm outline-none"
              />
              <button
                type="button"
                onClick={submitReference}
                className="px-2.5 py-1.5 text-sm font-medium bg-primary text-primary-foreground rounded hover:opacity-90"
              >
                Add
              </button>
            </div>
          </Section>

          <Divider />

          {/* Comments */}
          <Section
            icon={<MessageSquare className="h-3.5 w-3.5" />}
            title="Comments"
            count={task.comments.length}
          >
            <ul className="space-y-3 mb-3">
              {task.comments.map((c) => {
                const author = users.find((u) => u.id === c.authorId)
                return (
                  <li key={c.id} className="flex items-start gap-2.5">
                    <UserAvatar user={author} size="md" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2">
                        <span className="text-sm font-medium">
                          {author?.name}
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          {formatRelative(c.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-foreground/90 leading-relaxed mt-0.5">
                        {c.body}
                      </p>
                    </div>
                  </li>
                )
              })}
              {task.comments.length === 0 && (
                <li className="text-xs text-muted-foreground italic">
                  No comments yet.
                </li>
              )}
            </ul>
            <div className="flex items-start gap-2">
              <UserAvatar user={users.find((u) => u.id === "u1")} size="md" />
              <div className="flex-1 bg-muted/30 border border-border focus-within:border-ring rounded-md">
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Add a comment…"
                  rows={2}
                  className="w-full bg-transparent text-sm px-3 py-2 outline-none resize-none placeholder:text-muted-foreground"
                />
                <div className="flex items-center justify-end px-2 pb-2">
                  <button
                    type="button"
                    onClick={submitComment}
                    disabled={!comment.trim()}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-primary text-primary-foreground rounded hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Send className="h-3 w-3" />
                    Send
                  </button>
                </div>
              </div>
            </div>
          </Section>

          <Divider />

          {/* History */}
          <Section icon={<Clock className="h-3.5 w-3.5" />} title="History">
            <ol className="relative pl-4 space-y-3 before:content-[''] before:absolute before:left-1 before:top-1.5 before:bottom-1.5 before:w-px before:bg-border">
              {task.history.map((h) => {
                const author = users.find((u) => u.id === h.authorId)
                return (
                  <li key={h.id} className="relative">
                    <span className="absolute -left-[11px] top-1.5 h-2 w-2 rounded-full bg-primary" />
                    <div className="text-xs">
                      <span className="font-medium">{author?.name}</span>{" "}
                      <span className="text-muted-foreground">{h.message}</span>
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      {formatRelative(h.createdAt)}
                    </div>
                  </li>
                )
              })}
            </ol>
          </Section>
        </div>
      </div>
    </>
  )
}

function PropLabel({
  children,
  icon,
}: {
  children: React.ReactNode
  icon?: React.ReactNode
}) {
  return (
    <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-1.5">
      {icon}
      {children}
    </div>
  )
}

function Divider() {
  return <div className="border-t border-border" />
}

function Section({
  icon,
  title,
  count,
  children,
}: {
  icon?: React.ReactNode
  title: string
  count?: number
  children: React.ReactNode
}) {
  return (
    <section>
      <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-2">
        {icon}
        <span className="uppercase tracking-wider">{title}</span>
        {count !== undefined && count > 0 && (
          <span className="text-muted-foreground/70">{count}</span>
        )}
      </div>
      {children}
    </section>
  )
}

type SelectOption = {
  value: string
  label: string
  dot?: string
  user?: { id: string; name: string; initials: string; color: string }
}

function Select({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string
  onChange: (v: string) => void
  options: SelectOption[]
  placeholder?: string
}) {
  const [open, setOpen] = React.useState(false)
  const ref = React.useRef<HTMLDivElement>(null)
  const selected = options.find((o) => o.value === value)

  React.useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [open])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-2 bg-muted/40 hover:bg-muted/60 border border-border rounded px-2 py-1 text-sm transition-colors"
      >
        <span className="flex items-center gap-2 truncate">
          {selected?.dot && (
            <span className={cn("h-1.5 w-1.5 rounded-full", selected.dot)} />
          )}
          {selected?.user && <UserAvatar user={selected.user} size="xs" />}
          <span className="truncate">
            {selected?.label ?? placeholder ?? "Select"}
          </span>
        </span>
        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
      </button>
      {open && (
        <div className="absolute left-0 right-0 top-full mt-1 z-50 bg-popover border border-border rounded-md shadow-xl max-h-64 overflow-auto py-1">
          {options.map((o) => (
            <button
              type="button"
              key={o.value || "_empty"}
              onClick={() => {
                onChange(o.value)
                setOpen(false)
              }}
              className={cn(
                "w-full flex items-center gap-2 px-2 py-1.5 text-sm text-left hover:bg-accent transition-colors",
                o.value === value && "bg-accent",
              )}
            >
              {o.dot && (
                <span className={cn("h-1.5 w-1.5 rounded-full", o.dot)} />
              )}
              {o.user && <UserAvatar user={o.user} size="xs" />}
              <span className="truncate">{o.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function LabelPicker({
  selected,
  onToggle,
  allLabels,
}: {
  selected: string[]
  onToggle: (id: string) => void
  allLabels: LabelT[]
}) {
  const [open, setOpen] = React.useState(false)
  const ref = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [open])

  const selectedLabels = allLabels.filter((l) => selected.includes(l.id))

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-1.5 flex-wrap bg-muted/40 hover:bg-muted/60 border border-border rounded px-2 py-1 text-sm min-h-[28px] transition-colors"
      >
        {selectedLabels.length === 0 ? (
          <span className="text-muted-foreground inline-flex items-center gap-1">
            <Plus className="h-3 w-3" />
            Add labels
          </span>
        ) : (
          selectedLabels.map((l) => (
            <span
              key={l.id}
              className="inline-flex items-center gap-1 text-[11px] bg-muted/80 px-1.5 py-0.5 rounded"
            >
              <span className={cn("h-1.5 w-1.5 rounded-full", labelDotClass(l.color))} />
              {l.name}
            </span>
          ))
        )}
      </button>
      {open && (
        <div className="absolute left-0 right-0 top-full mt-1 z-50 bg-popover border border-border rounded-md shadow-xl py-1">
          {allLabels.map((l) => {
            const checked = selected.includes(l.id)
            return (
              <button
                type="button"
                key={l.id}
                onClick={() => onToggle(l.id)}
                className="w-full flex items-center gap-2 px-2 py-1.5 text-sm hover:bg-accent transition-colors"
              >
                <span
                  className={cn(
                    "h-3.5 w-3.5 rounded border flex items-center justify-center",
                    checked
                      ? "bg-primary border-primary"
                      : "border-border bg-muted/40",
                  )}
                >
                  {checked && (
                    <svg
                      viewBox="0 0 16 16"
                      className="h-2.5 w-2.5 text-primary-foreground"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                    >
                      <path d="M3 8l3 3 7-7" />
                    </svg>
                  )}
                </span>
                <span className={cn("h-1.5 w-1.5 rounded-full", labelDotClass(l.color))} />
                <span>{l.name}</span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

function RichTextEditor({
  value,
  onChange,
  onBlur,
}: {
  value: string
  onChange: (v: string) => void
  onBlur: () => void
}) {
  return (
    <div className="border border-border rounded-md bg-muted/20 focus-within:border-ring transition-colors">
      <div className="flex items-center gap-0.5 px-1.5 py-1 border-b border-border">
        <ToolbarBtn label="Bold">
          <Bold className="h-3.5 w-3.5" />
        </ToolbarBtn>
        <ToolbarBtn label="Italic">
          <Italic className="h-3.5 w-3.5" />
        </ToolbarBtn>
        <ToolbarBtn label="Underline">
          <Underline className="h-3.5 w-3.5" />
        </ToolbarBtn>
        <span className="h-4 w-px bg-border mx-1" />
        <ToolbarBtn label="List">
          <List className="h-3.5 w-3.5" />
        </ToolbarBtn>
        <ToolbarBtn label="Code">
          <Code className="h-3.5 w-3.5" />
        </ToolbarBtn>
        <ToolbarBtn label="Link">
          <LinkIcon className="h-3.5 w-3.5" />
        </ToolbarBtn>
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        rows={4}
        placeholder="Add a description…"
        className="w-full bg-transparent text-sm px-3 py-2 outline-none resize-y min-h-[80px] placeholder:text-muted-foreground leading-relaxed"
      />
    </div>
  )
}

function ToolbarBtn({
  children,
  label,
}: {
  children: React.ReactNode
  label: string
}) {
  return (
    <button
      type="button"
      aria-label={label}
      className="h-6 w-6 inline-flex items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
    >
      {children}
    </button>
  )
}
