"use client";

import * as React from "react";
import { useWorkspace } from "@/presentation/state/workspace-store";
import { Button } from "@/presentation/components/ui/button";
import { Input } from "@/presentation/components/ui/input";
import { Label } from "@/presentation/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/presentation/components/ui/select";
import { toast } from "sonner";

export default function MembersSettingsPage() {
  const { activeWorkspaceId, workspaces } = useWorkspace();
  const activeWorkspace = workspaces.find((w) => w.id === activeWorkspaceId);

  const [email, setEmail] = React.useState("");
  const [role, setRole] = React.useState<"member" | "project_admin">("member");
  const [invites, setInvites] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);

  const refresh = React.useCallback(async () => {
    if (!activeWorkspaceId) return;
    const res = await fetch(`/api/workspaces/invitations?workspaceId=${activeWorkspaceId}`);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setInvites([]);
      return;
    }
    setInvites(data.invites || []);
  }, [activeWorkspaceId]);

  React.useEffect(() => {
    refresh().catch(() => {});
  }, [refresh]);

  if (!activeWorkspaceId) {
    return <div className="text-sm text-muted-foreground">Select a workspace to manage members.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Invite Members</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Invite users to join <b>{activeWorkspace?.name || "Workspace"}</b>. Only organisation admins can invite.
          </p>
        </div>

        <form
          className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end"
          onSubmit={async (e) => {
            e.preventDefault();
            setLoading(true);
            try {
              const res = await fetch("/api/workspaces/invitations", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ workspaceId: activeWorkspaceId, email, role }),
              });
              const data = await res.json().catch(() => ({}));
              if (!res.ok) {
                toast.error("Invite failed", { description: data?.error || "Not allowed" });
                return;
              }
              toast.success("Invitation sent");
              setEmail("");
              await refresh();
            } finally {
              setLoading(false);
            }
          }}
        >
          <div className="md:col-span-3 space-y-2">
            <Label>Email</Label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required placeholder="name@company.com" />
          </div>
          <div className="md:col-span-1 space-y-2">
            <Label>Role</Label>
            <Select value={role} onValueChange={(v: any) => setRole(v)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="member">Member</SelectItem>
                <SelectItem value="project_admin">Project Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-1">
            <Button type="submit" className="w-full" disabled={loading}>
              Send Invite
            </Button>
          </div>
        </form>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold">Invitations</h3>
          <Button variant="secondary" size="sm" onClick={() => refresh()}>
            Refresh
          </Button>
        </div>

        <div className="mt-4 space-y-2">
          {invites.length === 0 ? (
            <div className="text-sm text-muted-foreground">No invitations yet.</div>
          ) : (
            invites.map((i) => (
              <div key={i.id} className="flex items-center justify-between rounded-md border border-border p-3">
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">{i.email}</div>
                  <div className="text-xs text-muted-foreground">
                    {i.acceptedAt ? "Accepted" : "Pending"} • {i.role}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

