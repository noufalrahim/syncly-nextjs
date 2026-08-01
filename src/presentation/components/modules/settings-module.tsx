"use client"

import * as React from "react"
import { useWorkspace, useDispatch } from "@/presentation/state/workspace-store"
import { Button } from "@/presentation/components/ui/button"
import { Input } from "@/presentation/components/ui/input"
import { useTheme } from "next-themes"
import { toast } from "sonner"
import { Check, Github, Laptop, Moon, Shield, Sun, User } from "lucide-react"

const ACCENTS = [
  { id: "orange", label: "Orange", swatch: "oklch(0.72 0.17 50)" },
  { id: "blue", label: "Blue", swatch: "oklch(0.68 0.16 245)" },
  { id: "violet", label: "Violet", swatch: "oklch(0.68 0.18 295)" },
  { id: "emerald", label: "Emerald", swatch: "oklch(0.72 0.15 160)" },
  { id: "rose", label: "Rose", swatch: "oklch(0.7 0.18 15)" },
  { id: "cyan", label: "Cyan", swatch: "oklch(0.75 0.12 210)" },
] as const

export function SettingsModule() {
  const { users, currentUserId, workspaces, activeWorkspaceId } = useWorkspace()
  const dispatch = useDispatch()
  const { theme, setTheme } = useTheme()
  const [activeTab, setActiveTab] = React.useState<"profile" | "workspace" | "integrations">("profile")

  const me = React.useMemo(() => {
    return users.find((u) => u.id === currentUserId)
  }, [users, currentUserId])

  const workspace = React.useMemo(() => {
    return workspaces.find((w) => w.id === activeWorkspaceId) || workspaces[0]
  }, [workspaces, activeWorkspaceId])

  const [name, setName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [accent, setAccent] = React.useState("orange")

  React.useEffect(() => {
    try {
      setAccent(localStorage.getItem("syncly-accent") || "orange")
    } catch {}
  }, [])

  const handleAccentChange = (newAccent: string) => {
    setAccent(newAccent)
    if (newAccent === "orange") {
      document.documentElement.removeAttribute("data-accent")
    } else {
      document.documentElement.setAttribute("data-accent", newAccent)
    }
    try {
      localStorage.setItem("syncly-accent", newAccent)
    } catch {}
    toast.success(`Accent color updated`)
  }

  React.useEffect(() => {
    if (me) {
      setName(me.name || "")
      setEmail(me.email || "")
    }
  }, [me])

  const handleSaveProfile = () => {
    if (!name.trim()) {
      toast.error("Name cannot be empty")
      return
    }
    if (me) {
      const updatedUser = { ...me, name }
      dispatch({
        type: "SET_USERS",
        users: users.map((u) => (u.id === me.id ? updatedUser : u)),
      })
      toast.success("Profile details updated successfully")
    }
  }

  const handleThemeChange = async (newTheme: string) => {
    setTheme(newTheme)
    try {
      const res = await fetch("/api/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme: newTheme }),
      })
      if (!res.ok) {
        throw new Error("Failed to save theme setting")
      }
      if (me) {
        dispatch({
          type: "SET_USERS",
          users: users.map((u) => (u.id === me.id ? { ...u, theme: newTheme } : u)),
        })
      }
      toast.success(`Theme updated to ${newTheme}`)
    } catch (e) {
      toast.error("Failed to update theme on server")
    }
  }

  return (
    <div className="flex-grow flex flex-col min-h-0 bg-background overflow-hidden">
      <div className="flex-shrink-0 px-8 py-5 border-b border-border/40">
        <h1 className="text-xl font-bold tracking-tight">Settings</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Manage your user profile and workspace configuration.</p>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-64 border-r border-border/40 bg-muted/10 p-4 space-y-1">
          <button
            onClick={() => setActiveTab("profile")}
            className={`w-full text-left px-3 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-2.5 cursor-pointer ${
              activeTab === "profile" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <User className="h-4 w-4" /> My Profile
          </button>
          <button
            onClick={() => setActiveTab("workspace")}
            className={`w-full text-left px-3 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-2.5 cursor-pointer ${
              activeTab === "workspace" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Shield className="h-4 w-4" /> Workspace Details
          </button>
          <button
            onClick={() => setActiveTab("integrations")}
            className={`w-full text-left px-3 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-2.5 cursor-pointer ${
              activeTab === "integrations" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Github className="h-4 w-4" /> Integrations
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 w-full">
          {activeTab === "profile" && (
            <div className="space-y-8">
              <div>
                <h2 className="text-lg font-semibold">Profile Settings</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Update your personal account credentials.</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className={`h-16 w-16 rounded-full flex items-center justify-center text-lg font-bold text-white uppercase ${me?.color || "bg-primary"}`}>
                    {me?.initials || name.slice(0, 2)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">{name || "User"}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{email || "No email"}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Full Name</label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your Name" className="h-10" />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Email Address</label>
                  <Input value={email} readOnly disabled className="h-10 opacity-70 cursor-not-allowed bg-muted/40" />
                </div>

                <div className="pt-2">
                  <Button onClick={handleSaveProfile} className="h-10 px-5 text-sm">Save Changes</Button>
                </div>
              </div>

              <div className="border-t border-border/80 pt-6 space-y-4">
                <div>
                  <h3 className="text-sm font-semibold">Appearance</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Customize the color mode and accent color of the application interface.</p>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => handleThemeChange("light")}
                    className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${
                      theme === "light" ? "bg-accent border-primary/20 text-foreground" : "bg-card border-border hover:border-border/85 text-muted-foreground"
                    }`}
                  >
                    <Sun className="h-5 w-5 text-amber-500" />
                    <span className="text-xs font-semibold">Light Mode</span>
                  </button>

                  <button
                    onClick={() => handleThemeChange("dark")}
                    className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${
                      theme === "dark" ? "bg-accent border-primary/20 text-foreground" : "bg-card border-border hover:border-border/85 text-muted-foreground"
                    }`}
                  >
                    <Moon className="h-5 w-5 text-indigo-400" />
                    <span className="text-xs font-semibold">Dark Mode</span>
                  </button>

                  <button
                    onClick={() => handleThemeChange("system")}
                    className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${
                      theme === "system" ? "bg-accent border-primary/20 text-foreground" : "bg-card border-border hover:border-border/85 text-muted-foreground"
                    }`}
                  >
                    <Laptop className="h-5 w-5 text-zinc-400" />
                    <span className="text-xs font-semibold">System Default</span>
                  </button>
                </div>

                <div className="pt-2 space-y-3">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Accent Color</label>
                  <div className="flex flex-wrap gap-3">
                    {ACCENTS.map((a) => (
                      <button
                        key={a.id}
                        onClick={() => handleAccentChange(a.id)}
                        className="flex flex-col items-center gap-1.5 cursor-pointer group"
                        aria-label={`Use ${a.label} accent color`}
                      >
                        <span
                          className={`h-9 w-9 rounded-full flex items-center justify-center transition-all ring-offset-2 ring-offset-background ${
                            accent === a.id ? "ring-2 ring-foreground/60" : "group-hover:ring-2 group-hover:ring-foreground/25"
                          }`}
                          style={{ backgroundColor: a.swatch }}
                        >
                          {accent === a.id && <Check className="h-4 w-4 text-white drop-shadow" />}
                        </span>
                        <span className={`text-[10px] font-medium ${accent === a.id ? "text-foreground" : "text-muted-foreground"}`}>
                          {a.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "workspace" && (
            <div className="space-y-8">
              <div>
                <h2 className="text-lg font-semibold">Workspace Settings</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Configure organization credentials and overview information.</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Workspace Name</label>
                  <Input value={workspace?.name || "My Workspace"} readOnly disabled className="h-10 opacity-70 cursor-not-allowed bg-muted/40" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Active Plan</label>
                    <div className="h-10 px-3 bg-muted/40 border border-border/80 rounded-md flex items-center text-xs font-semibold uppercase tracking-wider text-primary">
                      {workspace?.plan || "professional"}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Workspace Status</label>
                    <div className="h-10 px-3 bg-muted/40 border border-border/80 rounded-md flex items-center text-xs font-semibold text-emerald-500">
                      Active
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-border/80 pt-6 space-y-4">
                <div>
                  <h3 className="text-sm font-semibold">Workspace Directory</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">List of all teammates invited to this workspace environment.</p>
                </div>

                <div className="divide-y divide-border/60">
                  {users.filter(u => !u.isBot).map((u) => (
                    <div key={u.id} className="flex items-center justify-between py-3">
                      <div className="flex items-center gap-3">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold text-white uppercase ${u.color || "bg-primary"}`}>
                          {u.initials || u.name.slice(0, 2)}
                        </div>
                        <div>
                          <span className="text-sm font-semibold block">{u.name}</span>
                          <span className="text-[10px] text-muted-foreground block leading-none mt-0.5">{u.email || "No email"}</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-accent text-accent-foreground rounded-full">
                        {u.id === currentUserId ? "Owner" : "Member"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "integrations" && (
            <div className="space-y-8">
              <div>
                <h2 className="text-lg font-semibold">Integrations & Connections</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Connect external platforms to enable automations and smart indexing.</p>
              </div>

              <div className="bg-card border border-border rounded-xl p-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center">
                    <Github className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold flex items-center gap-2">
                      GitHub Integration
                      <span className="text-[9px] font-bold px-2 py-0.5 bg-emerald-500/10 text-emerald-500 rounded-full">Active</span>
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Synchronize issues, pull requests, and status changes instantly.</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="h-9 px-4 text-xs" disabled>
                  Manage
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
