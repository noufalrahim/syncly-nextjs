import { NextResponse } from "next/server";
import crypto from "crypto";
import connectToDatabase from "@/infrastructure/db/mongodb";
import Workspace from "@/infrastructure/models/Workspace";
import WorkspaceMember from "@/infrastructure/models/WorkspaceMember";
import WorkspaceInvite from "@/infrastructure/models/WorkspaceInvite";
import { requireUser } from "@/infrastructure/auth/requireUser";
import { sendEmail } from "@/infrastructure/email/transporter";

function appUrl() {
  return process.env.NEXTAUTH_URL || process.env.APP_URL || "http://localhost:3000";
}

export async function POST(request: Request) {
  const me = await requireUser();
  if (!me.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { workspaceId, email, role } = await request.json();
  if (!workspaceId || !email) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  await connectToDatabase();
  const workspace = await Workspace.findById(workspaceId);
  if (!workspace) return NextResponse.json({ error: "Workspace not found" }, { status: 404 });

  const isOwner = workspace.ownerId === me.userId;
  const membership = await WorkspaceMember.findOne({ workspaceId, userId: me.userId });
  const isAdmin = membership?.role === "admin";
  if (!isOwner && !isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7);

  const invite = await WorkspaceInvite.create({
    workspaceId,
    email: String(email).toLowerCase(),
    role: role === "project_admin" ? "project_admin" : "member",
    token,
    expiresAt,
    createdByUserId: me.userId,
  });

  const acceptLink = `${appUrl()}/invitations/accept?token=${token}`;
  await sendEmail({
    to: invite.email,
    subject: `Invitation to join ${workspace.name}`,
    html: `
      <p>You have been invited to join <b>${workspace.name}</b>.</p>
      <p><a href="${acceptLink}">Accept invitation</a></p>
      <p>This link expires in 7 days.</p>
    `,
  });

  return NextResponse.json({ inviteId: invite._id.toString() }, { status: 201 });
}

export async function GET(request: Request) {
  const me = await requireUser();
  if (!me.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const workspaceId = searchParams.get("workspaceId");
  if (!workspaceId) {
    return NextResponse.json({ error: "workspaceId is required" }, { status: 400 });
  }

  await connectToDatabase();
  const workspace = await Workspace.findById(workspaceId);
  if (!workspace) return NextResponse.json({ error: "Workspace not found" }, { status: 404 });

  const isOwner = workspace.ownerId === me.userId;
  const membership = await WorkspaceMember.findOne({ workspaceId, userId: me.userId });
  const isAdmin = membership?.role === "admin";
  if (!isOwner && !isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const invites = await WorkspaceInvite.find({ workspaceId }).sort({ createdAt: -1 }).limit(50);
  const result = invites.map((i: any) => ({
    id: i._id.toString(),
    email: i.email,
    role: i.role,
    expiresAt: i.expiresAt,
    acceptedAt: i.acceptedAt,
  }));

  return NextResponse.json({ invites: result }, { status: 200 });
}
