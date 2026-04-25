"use client"

import {
  FileArchive,
  FileImage,
  FileSpreadsheet,
  FileText,
  FileVideo,
  Upload,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { Document } from "@/lib/types"
import { useWorkspace } from "@/lib/workspace-store"
import { UserAvatar } from "@/components/user-avatar"

const ICONS: Record<Document["type"], React.ReactNode> = {
  pdf: <FileText className="h-5 w-5" />,
  doc: <FileText className="h-5 w-5" />,
  sheet: <FileSpreadsheet className="h-5 w-5" />,
  image: <FileImage className="h-5 w-5" />,
  video: <FileVideo className="h-5 w-5" />,
  zip: <FileArchive className="h-5 w-5" />,
}

const TYPE_BG: Record<Document["type"], string> = {
  pdf: "bg-red-500/10 text-red-400",
  doc: "bg-blue-500/10 text-blue-400",
  sheet: "bg-emerald-500/10 text-emerald-400",
  image: "bg-amber-500/10 text-amber-400",
  video: "bg-rose-500/10 text-rose-400",
  zip: "bg-zinc-500/10 text-zinc-300",
}

function formatRelative(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

export function DocumentsModule() {
  const { documents, users } = useWorkspace()

  return (
    <div className="flex-1 overflow-auto">
      <div className="px-6 py-4 flex items-center justify-between border-b border-border">
        <div>
          <h2 className="text-base font-semibold">All documents</h2>
          <p className="text-xs text-muted-foreground">
            {documents.length} files
          </p>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:opacity-90"
        >
          <Upload className="h-3.5 w-3.5" />
          Upload
        </button>
      </div>

      <div className="p-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        {documents.map((d) => {
          const owner = users.find((u) => u.id === d.ownerId)
          return (
            <div
              key={d.id}
              className="group bg-card border border-border rounded-lg p-3 hover:border-border/80 hover:shadow-lg hover:shadow-black/20 transition-all cursor-pointer"
            >
              <div
                className={cn(
                  "h-24 rounded-md flex items-center justify-center mb-3",
                  TYPE_BG[d.type],
                )}
              >
                {ICONS[d.type]}
              </div>
              <div className="text-sm font-medium truncate">{d.name}</div>
              <div className="flex items-center justify-between mt-1.5">
                <div className="text-xs text-muted-foreground">
                  {d.size} · {formatRelative(d.updatedAt)}
                </div>
                <UserAvatar user={owner} size="xs" />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
