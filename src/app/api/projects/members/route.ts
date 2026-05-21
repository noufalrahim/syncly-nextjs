import { NextResponse } from "next/server";
import connectToDatabase from "@/infrastructure/db/mongodb";
import { requireUser } from "@/infrastructure/auth/requireUser";
import Project from "@/infrastructure/models/Project";
import User from "@/infrastructure/models/User";
import Workspace from "@/infrastructure/models/Workspace";
import WorkspaceMember from "@/infrastructure/models/WorkspaceMember";
import ProjectMember from "@/infrastructure/models/ProjectMember";

async function canManageProjectMembers(params: { workspaceId: string; userId: string }) {
  const workspace = await Workspace.findById(params.workspaceId);
  if (workspace?.ownerId === params.userId) return true;
  const membership = await WorkspaceMember.findOne({
    workspaceId: params.workspaceId,
    userId: params.userId,
  });
  return membership?.role === "admin" || membership?.role === "project_admin";
}

export async function GET(request: Request) {
  const me = await requireUser();
  if (!me.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get("projectId");
  if (!projectId) return NextResponse.json({ error: "projectId is required" }, { status: 400 });

  await connectToDatabase();
  const project = await Project.findById(projectId);
  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

  const workspaceMembership = await WorkspaceMember.findOne({
    workspaceId: project.workspaceId,
    userId: me.userId,
  });
  const workspace = await Workspace.findById(project.workspaceId);
  if (!workspaceMembership && workspace?.ownerId !== me.userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Backfill: ensure workspace owner is always an admin member of every project in their workspace
  if (workspace?.ownerId) {
    await ProjectMember.updateOne(
      { projectId, userId: String(workspace.ownerId) },
      { $set: { role: "admin" } },
      { upsert: true }
    );
  }

  const members = await ProjectMember.find({ projectId });
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

export async function POST(request: Request) {
  const me = await requireUser();
  if (!me.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { projectId, userIds } = await request.json();
  if (!projectId || !Array.isArray(userIds) || !userIds.length) {
    return NextResponse.json({ error: "projectId and userIds are required" }, { status: 400 });
  }

  await connectToDatabase();
  const project = await Project.findById(projectId);
  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

  const canManage = await canManageProjectMembers({ workspaceId: project.workspaceId, userId: me.userId });
  if (!canManage) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const workspace = await Workspace.findById(project.workspaceId);
  const filteredUserIds = workspace?.ownerId
    ? userIds.map(String).filter((id: string) => id !== String(workspace.ownerId))
    : userIds.map(String);
  if (!filteredUserIds.length) {
    return NextResponse.json({ success: true }, { status: 200 });
  }

  const workspaceMembers = await WorkspaceMember.find({
    workspaceId: project.workspaceId,
    userId: { $in: filteredUserIds },
  });
  const allowed = new Set(workspaceMembers.map((m: any) => m.userId));
  const invalid = filteredUserIds.filter((id: string) => !allowed.has(id));
  if (invalid.length) {
    return NextResponse.json({ error: "All users must belong to the workspace" }, { status: 400 });
  }

  await Promise.all(
    filteredUserIds.map((userId: string) =>
      ProjectMember.updateOne(
        { projectId, userId: String(userId) },
        { $set: { role: "member" } },
        { upsert: true }
      )
    )
  );

  return NextResponse.json({ success: true }, { status: 200 });
}

export async function DELETE(request: Request) {
  const me = await requireUser();
  if (!me.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get("projectId");
  const userId = searchParams.get("userId");
  if (!projectId || !userId) {
    return NextResponse.json({ error: "projectId and userId are required" }, { status: 400 });
  }

  await connectToDatabase();
  const project = await Project.findById(projectId);
  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

  const canManage = await canManageProjectMembers({ workspaceId: project.workspaceId, userId: me.userId });
  if (!canManage) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await ProjectMember.deleteOne({ projectId, userId });
  return NextResponse.json({ success: true }, { status: 200 });
}
