"use client";

import * as React from "react";
import { Settings, Users, Sparkles, Plus, Trash2, Edit2, Bot } from "lucide-react";
import { cn } from "@/core/utils";
import { useDispatch, useWorkspace } from "@/presentation/state/workspace-store";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/presentation/components/ui/dialog";
import { Button } from "@/presentation/components/ui/button";
import { Input } from "@/presentation/components/ui/input";
import { Label } from "@/presentation/components/ui/label";
import { Textarea } from "@/presentation/components/ui/textarea";
import { UserAvatar } from "@/presentation/components/user-avatar";
import { toast } from "sonner";
import type { User } from "@/domain/types";

export function WorkspaceSettingsDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { workspaces, activeWorkspaceId, users } = useWorkspace();
  const dispatch = useDispatch();
  const activeWorkspace = workspaces.find((w) => w.id === activeWorkspaceId);

  const [activeTab, setActiveTab] = React.useState<"general" | "members" | "agents">("general");

  const [wsName, setWsName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [invites, setInvites] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);

  const [agentFormOpen, setAgentFormOpen] = React.useState(false);
  const [editingAgent, setEditingAgent] = React.useState<User | null>(null);
  const [agentName, setAgentName] = React.useState("");
  const [agentDesc, setAgentDesc] = React.useState("");
  const [agentPrompt, setAgentPrompt] = React.useState("");

  React.useEffect(() => {
    if (activeWorkspace) {
      setWsName(activeWorkspace.name);
    }
  }, [activeWorkspace]);

  const fetchInvites = React.useCallback(async () => {
    if (!activeWorkspaceId) return;
    try {
      const res = await fetch(`/api/workspaces/invitations?workspaceId=${activeWorkspaceId}`);
      if (res.ok) {
        const data = await res.json();
        setInvites(data.invites || []);
      }
    } catch (e) {
      console.error(e);
    }
  }, [activeWorkspaceId]);

  React.useEffect(() => {
    if (open && activeTab === "members") {
      fetchInvites();
    }
  }, [open, activeTab, fetchInvites]);

  if (!activeWorkspace) return null;

  const handleSaveWorkspaceName = async () => {
    if (!wsName.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/workspaces`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspaceId: activeWorkspaceId, name: wsName.trim() }),
      });
      if (res.ok) {
        toast.success("Workspace name updated successfully");
      } else {
        toast.error("Failed to update workspace name");
      }
    } catch (e) {
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/workspaces/invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId: activeWorkspaceId,
          email: email.trim(),
          role: "member",
        }),
      });
      if (res.ok) {
        toast.success("Invitation sent");
        setEmail("");
        fetchInvites();
      } else {
        const data = await res.json().catch(() => ({}));
        toast.error(data?.error || "Invitation failed");
      }
    } catch (e) {
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateAgent = () => {
    setEditingAgent(null);
    setAgentName("");
    setAgentDesc("");
    setAgentPrompt("");
    setAgentFormOpen(true);
  };

  const handleOpenEditAgent = (agent: User) => {
    setEditingAgent(agent);
    setAgentName(agent.name.replace(/^@/, ""));
    setAgentDesc(agent.email || "");
    setAgentPrompt(agent.prompt || "");
    setAgentFormOpen(true);
  };

  const handleSaveAgent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agentName.trim() || !agentPrompt.trim()) return;

    const cleanedName = agentName.toLowerCase().replace(/^@/, "").replace(/\s+/g, "-");
    const formattedName = `@${cleanedName}`;

    if (editingAgent) {
      (async () => {
        try {
          const res = await fetch(`/api/agents?agentId=${editingAgent.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: formattedName,
              email: agentDesc.trim() || undefined,
              prompt: agentPrompt.trim(),
              initials: cleanedName.slice(0, 2).toUpperCase(),
            }),
          });
          if (res.ok) {
            const data = await res.json();
            dispatch({
              type: "UPDATE_AGENT",
              agentId: editingAgent.id,
              patch: data.agent,
            });
            toast.success(`Agent ${formattedName} updated`);
          }
        } catch (error) {
          console.error("Update agent failed", error);
        }
      })();
    } else {
      const colors = [
        "bg-purple-600",
        "bg-indigo-600",
        "bg-pink-600",
        "bg-rose-600",
        "bg-violet-600",
      ];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      (async () => {
        try {
          const res = await fetch("/api/agents", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              workspaceId: activeWorkspace.id,
              name: formattedName,
              email: agentDesc.trim() || undefined,
              initials: cleanedName.slice(0, 2).toUpperCase(),
              color: randomColor,
              prompt: agentPrompt.trim(),
            }),
          });
          if (res.ok) {
            const data = await res.json();
            dispatch({ type: "ADD_AGENT", agent: data.agent });
            toast.success(`Agent ${formattedName} created`);
          }
        } catch (error) {
          console.error("Create agent failed", error);
        }
      })();
    }
    setAgentFormOpen(false);
  };

  const handleDeleteAgent = (agentId: string) => {
    (async () => {
      try {
        const res = await fetch(`/api/agents?agentId=${agentId}`, {
          method: "DELETE",
        });
        if (res.ok) {
          dispatch({ type: "DELETE_AGENT", agentId });
          toast.success("Agent removed from workspace");
        }
      } catch (error) {
        console.error("Delete agent failed", error);
      }
    })();
  };

  const workspaceBots = users.filter((u) => u.isBot);
  const workspaceHumans = users.filter((u) => !u.isBot);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[760px] h-[540px] flex flex-col p-0 overflow-hidden bg-card border-border">
        <DialogHeader className="px-6 py-4 border-b border-border">
          <DialogTitle className="text-lg">Workspace Management</DialogTitle>
          <DialogDescription>
            Configure settings, members, and AI Agents for {activeWorkspace.name}.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 flex min-h-0 divide-x divide-border">
          <aside className="w-48 shrink-0 bg-sidebar/20 p-3 space-y-1">
            <button
              onClick={() => setActiveTab("general")}
              className={cn(
                "w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors text-left",
                activeTab === "general"
                  ? "bg-accent text-foreground"
                  : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
              )}
            >
              <Settings className="h-4 w-4" />
              General
            </button>
            <button
              onClick={() => setActiveTab("members")}
              className={cn(
                "w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors text-left",
                activeTab === "members"
                  ? "bg-accent text-foreground"
                  : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
              )}
            >
              <Users className="h-4 w-4" />
              Members
            </button>
            <button
              onClick={() => setActiveTab("agents")}
              className={cn(
                "w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors text-left",
                activeTab === "agents"
                  ? "bg-accent text-foreground"
                  : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
              )}
            >
              <Sparkles className="h-4 w-4" />
              AI Agents
            </button>
          </aside>

          <main className="flex-1 overflow-y-auto p-6 min-w-0">
            {activeTab === "general" && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">General Settings</h3>
                  <div className="space-y-4 pt-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="ws-name">Workspace Name</Label>
                      <Input
                        id="ws-name"
                        value={wsName}
                        onChange={(e) => setWsName(e.target.value)}
                        placeholder="e.g. Acma Corp"
                      />
                    </div>
                    <Button onClick={handleSaveWorkspaceName} disabled={loading || !wsName.trim()}>
                      Save Name
                    </Button>
                  </div>
                </div>

                <div className="border-t border-border pt-4 space-y-1.5">
                  <Label>Billing Plan</Label>
                  <div className="text-sm text-foreground font-medium capitalize">
                    {activeWorkspace.plan || "Personal"} Plan
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Upgrade to Enterprise for advanced features.
                  </p>
                </div>
              </div>
            )}

            {activeTab === "members" && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Invite New Members</h3>
                  <form onSubmit={handleSendInvite} className="flex gap-2 pt-2">
                    <div className="flex-1">
                      <Input
                        placeholder="colleague@company.com"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="h-9"
                      />
                    </div>
                    <Button type="submit" size="sm" className="h-9" disabled={loading || !email.trim()}>
                      Invite
                    </Button>
                  </form>
                </div>

                <div className="border-t border-border pt-4">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Workspace Members ({workspaceHumans.length})</h4>
                  <div className="space-y-2.5 max-h-[160px] overflow-y-auto pr-1">
                    {workspaceHumans.map((u) => (
                      <div key={u.id} className="flex items-center gap-3 p-2 rounded-md border border-border bg-card/50">
                        <UserAvatar user={u} size="sm" />
                        <div className="flex-1 min-w-0">
                          <span className="block text-sm font-medium truncate">{u.name}</span>
                          {u.email && <span className="block text-xs text-muted-foreground truncate">{u.email}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {invites.length > 0 && (
                  <div className="border-t border-border pt-4">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Pending Invites ({invites.length})</h4>
                    <div className="space-y-2 max-h-[120px] overflow-y-auto pr-1">
                      {invites.map((inv) => (
                        <div key={inv.id} className="flex items-center justify-between p-2 rounded-md border border-border/80 bg-accent/20">
                          <div className="min-w-0">
                            <span className="block text-sm font-medium truncate">{inv.email}</span>
                          </div>
                          <span className="text-[10px] bg-accent/60 text-muted-foreground px-2 py-0.5 rounded-full font-medium">Pending</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "agents" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Workspace AI Agents</h3>
                  <Button size="sm" onClick={handleOpenCreateAgent} className="h-8 gap-1">
                    <Plus className="h-3.5 w-3.5" /> Add Agent
                  </Button>
                </div>

                <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1">
                  {workspaceBots.map((b) => (
                    <div key={b.id} className="flex items-start justify-between p-3 rounded-lg border border-border bg-card/65 hover:border-primary/20 transition-colors">
                      <div className="flex items-start gap-3 min-w-0">
                        <span className={cn("flex h-8 w-8 items-center justify-center rounded-md text-white shrink-0 shadow-sm", b.color)}>
                          <Bot className="h-4 w-4" />
                        </span>
                        <div className="min-w-0">
                          <span className="block text-sm font-semibold text-foreground">{b.name}</span>
                          {b.email && <span className="block text-xs text-muted-foreground mt-0.5 truncate">{b.email}</span>}
                          <div className="mt-1 text-[11px] text-muted-foreground truncate max-w-[280px]">
                            Prompt: {b.prompt}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-0.5 ml-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => handleOpenEditAgent(b)}>
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10" onClick={() => handleDeleteAgent(b.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {workspaceBots.length === 0 && (
                    <div className="text-center py-12 border border-dashed border-border rounded-lg">
                      <Bot className="h-8 w-8 text-muted-foreground/45 mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">No AI Agents configured.</p>
                      <p className="text-xs text-muted-foreground/60 mt-1">Agents help automate review and testing inside group chats.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </main>
        </div>
      </DialogContent>

      <Dialog open={agentFormOpen} onOpenChange={setAgentFormOpen}>
        <DialogContent className="sm:max-w-[440px] bg-card border-border">
          <form onSubmit={handleSaveAgent} className="space-y-4">
            <DialogHeader>
              <DialogTitle>{editingAgent ? "Edit AI Agent" : "Create AI Agent"}</DialogTitle>
              <DialogDescription>
                Configure system instructions and triggers for the bot.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-2">
              <div className="space-y-1.5">
                <Label htmlFor="agent-name">Agent Name</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-semibold">@</span>
                  <Input
                    id="agent-name"
                    placeholder="e.g. review-bot"
                    value={agentName}
                    onChange={(e) => setAgentName(e.target.value)}
                    required
                    className="pl-7"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="agent-desc">Description</Label>
                <Input
                  id="agent-desc"
                  placeholder="e.g. Code Review Assistant"
                  value={agentDesc}
                  onChange={(e) => setAgentDesc(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="agent-prompt">System Prompt / Instructions</Label>
                <Textarea
                  id="agent-prompt"
                  placeholder="Explain what the bot should do when mentioned..."
                  value={agentPrompt}
                  onChange={(e) => setAgentPrompt(e.target.value)}
                  rows={4}
                  required
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setAgentFormOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={!agentName.trim() || !agentPrompt.trim()}>
                Save Agent
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}
