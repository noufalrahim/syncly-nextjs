import { NextResponse } from "next/server";
import connectToDatabase from "@/infrastructure/db/mongodb";
import User from "@/infrastructure/models/User";
import WorkspaceInvite from "@/infrastructure/models/WorkspaceInvite";
import WorkspaceMember from "@/infrastructure/models/WorkspaceMember";
import { requireUser } from "@/infrastructure/auth/requireUser";

export async function POST(request: Request) {
  const me = await requireUser();
  if (!me.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { token } = await request.json();
  if (!token) return NextResponse.json({ error: "Missing token" }, { status: 400 });

  await connectToDatabase();
  const invite = await WorkspaceInvite.findOne({ token });
  if (!invite) return NextResponse.json({ error: "Invalid token" }, { status: 400 });
  if (invite.acceptedAt) return NextResponse.json({ error: "Invite already used" }, { status: 400 });
  if (invite.expiresAt.getTime() < Date.now()) return NextResponse.json({ error: "Invite expired" }, { status: 400 });

  const user = await User.findById(me.userId);
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
  if (user.email.toLowerCase() !== String(invite.email).toLowerCase()) {
    return NextResponse.json({ error: "This invite is for a different email" }, { status: 403 });
  }

  await WorkspaceMember.updateOne(
    { workspaceId: invite.workspaceId, userId: me.userId },
    { $set: { role: invite.role } },
    { upsert: true }
  );

  invite.acceptedAt = new Date();
  invite.acceptedByUserId = me.userId;
  await invite.save();

  return NextResponse.json({ success: true, workspaceId: invite.workspaceId }, { status: 200 });
}

