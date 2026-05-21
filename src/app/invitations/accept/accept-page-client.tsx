"use client";

import * as React from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { Button } from "@/presentation/components/ui/button";

export default function AcceptInvitationPageClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const [inviteEmail, setInviteEmail] = React.useState<string>("");
  const [workspaceName, setWorkspaceName] = React.useState<string>("");
  const [status, setStatus] = React.useState<"loading" | "need_auth" | "mismatch" | "error">("loading");
  const [error, setError] = React.useState<string>("");

  React.useEffect(() => {
    if (!token) return;
    (async () => {
      const metaRes = await fetch(`/api/workspaces/invitations/lookup?token=${token}`);
      const meta = await metaRes.json().catch(() => ({}));
      if (metaRes.ok) {
        setInviteEmail(String(meta.email || ""));
        setWorkspaceName(String(meta.workspaceName || ""));
      }

      const res = await fetch("/api/workspaces/invitations/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        toast.success("Invitation accepted");
        router.push("/");
      } else {
        const message = String(data?.error || "Please try again.");
        if (res.status === 401) {
          setStatus("need_auth");
          setError(message);
          return;
        }
        if (res.status === 403 && message.toLowerCase().includes("different email")) {
          setStatus("mismatch");
          setError(message);
          return;
        }
        setStatus("error");
        setError(message);
      }
    })();
  }, [token, router]);

  const next = token ? `/invitations/accept?token=${encodeURIComponent(token)}` : "/";

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      {status === "loading" && (
        <div className="text-sm text-muted-foreground">Accepting invitation…</div>
      )}

      {status !== "loading" && (
        <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 space-y-3">
          <div className="text-base font-semibold">Invitation required</div>
          <div className="text-sm text-muted-foreground">
            {workspaceName ? (
              <>You were invited to join <b>{workspaceName}</b>{inviteEmail ? <> as <b>{inviteEmail}</b>.</> : "."}</>
            ) : (
              <>You were invited to join a workspace.</>
            )}
          </div>
          {error && <div className="text-sm text-destructive">{error}</div>}

          <div className="pt-2 flex gap-2">
            <Button asChild variant="secondary" className="flex-1">
              <Link href={`/auth/login?email=${encodeURIComponent(inviteEmail)}&next=${encodeURIComponent(next)}`}>
                Log in
              </Link>
            </Button>
            <Button asChild className="flex-1">
              <Link href={`/auth/signup?email=${encodeURIComponent(inviteEmail)}&next=${encodeURIComponent(next)}`}>
                Create account
              </Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
