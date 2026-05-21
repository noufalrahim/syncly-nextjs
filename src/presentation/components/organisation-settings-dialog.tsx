"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/presentation/components/ui/dialog";
import { Button } from "@/presentation/components/ui/button";
import { Input } from "@/presentation/components/ui/input";
import { Label } from "@/presentation/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/presentation/components/ui/select";
import { toast } from "sonner";

export function OrganisationSettingsDialog(props: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId: string | null;
  workspaceName: string;
}) {
  const [email, setEmail] = React.useState("");
  const [role, setRole] = React.useState<"member" | "project_admin">("member");
  const [invites, setInvites] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);

  const refresh = React.useCallback(async () => {
    if (!props.workspaceId) return;
    const res = await fetch(`/api/workspaces/invitations?workspaceId=${props.workspaceId}`);
    const data = await res.json().catch(() => ({}));
    if (res.ok) setInvites(data.invites || []);
  }, [props.workspaceId]);

  React.useEffect(() => {
    if (!props.open) return;
    refresh().catch(() => {});
  }, [props.open, refresh]);

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent className="sm:max-w-[620px]">
        <DialogHeader>
          <DialogTitle>Organisation Settings</DialogTitle>
          <DialogDescription>
            Invite users to join <b>{props.workspaceName}</b>. Only workspace admins can invite.
          </DialogDescription>
        </DialogHeader>

        <form
          className="space-y-4 py-2"
          onSubmit={async (e) => {
            e.preventDefault();
            if (!props.workspaceId) return;
            setLoading(true);
            try {
              const res = await fetch("/api/workspaces/invitations", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  workspaceId: props.workspaceId,
                  email,
                  role,
                }),
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
          <div className="space-y-2">
            <Label>Email</Label>
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              type="email"
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Role</Label>
            <Select value={role} onValueChange={(v: any) => setRole(v)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="member">Member</SelectItem>
                <SelectItem value="project_admin">Project Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={!props.workspaceId || loading}>
              Send Invite
            </Button>
          </DialogFooter>
        </form>

        <div className="mt-4 border-t border-border pt-4">
          <div className="text-sm font-semibold mb-2">Invitations</div>
          {invites.length === 0 ? (
            <div className="text-sm text-muted-foreground">No invitations yet.</div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-auto">
              {invites.map((i) => (
                <div key={i.id} className="flex items-center justify-between rounded-md border border-border p-3">
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">{i.email}</div>
                    <div className="text-xs text-muted-foreground">
                      {i.acceptedAt ? "Accepted" : "Pending"} • {i.role}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

