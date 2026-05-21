import { NextResponse } from "next/server";
import connectToDatabase from "@/infrastructure/db/mongodb";
import Workspace from "@/infrastructure/models/Workspace";
import WorkspaceMember from "@/infrastructure/models/WorkspaceMember";
import User from "@/infrastructure/models/User";
import { requireUser } from "@/infrastructure/auth/requireUser";

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
  if (!isOwner && !membership) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Backfill: ensure workspace owner always appears as an admin member
  await WorkspaceMember.updateOne(
    { workspaceId, userId: workspace.ownerId },
    { $set: { role: "admin" } },
    { upsert: true }
  );

  const members = await WorkspaceMember.find({ workspaceId });
  const userIds = members.map((m: any) => m.userId);
  const users = await User.find({ _id: { $in: userIds } });
  const userById = new Map(users.map((u: any) => [u._id.toString(), u]));

  const result = members
    .map((m: any) => {
      const u = userById.get(m.userId);
      return u
        ? {
            userId: u._id.toString(),
            name: u.name,
            email: u.email,
            image: u.image,
            role: m.role,
          }
        : null;
    })
    .filter(Boolean);

  return NextResponse.json({ members: result }, { status: 200 });
}
