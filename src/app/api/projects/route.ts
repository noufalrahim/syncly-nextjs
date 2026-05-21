import { NextResponse } from "next/server";
import connectToDatabase from "@/infrastructure/db/mongodb";
import Project from "@/infrastructure/models/Project";
import ProjectMember from "@/infrastructure/models/ProjectMember";
import Workspace from "@/infrastructure/models/Workspace";
import { requireUser } from "@/infrastructure/auth/requireUser";

export async function GET(request: Request) {
  try {
    const me = await requireUser();
    if (!me.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get("workspaceId");

    if (!workspaceId) {
      return NextResponse.json({ error: "workspaceId is required" }, { status: 400 });
    }

    await connectToDatabase();
    
    const workspace = await Workspace.findById(workspaceId);
    let projects = await Project.find({ workspaceId });

    if (workspace?.ownerId !== me.userId) {
      const memberships = await ProjectMember.find({ userId: me.userId });
      const memberProjectIds = memberships.map(m => String(m.projectId));
      projects = projects.filter(p => memberProjectIds.includes(String(p._id)));
    }

    return NextResponse.json({ projects }, { status: 200 });
  } catch (error) {
    console.error("Fetch projects error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name, emoji, color, workspaceId } = await request.json();

    if (!name || !workspaceId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await connectToDatabase();
    const project = await Project.create({ name, emoji, color, workspaceId });

    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    console.error("Create project error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { projectId, patch } = await request.json();

    if (!projectId) {
      return NextResponse.json({ error: "projectId is required" }, { status: 400 });
    }

    await connectToDatabase();
    const project = await Project.findByIdAndUpdate(projectId, patch, { new: true });

    return NextResponse.json({ project }, { status: 200 });
  } catch (error) {
    console.error("Update project error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");

    if (!projectId) {
      return NextResponse.json({ error: "projectId is required" }, { status: 400 });
    }

    await connectToDatabase();
    await Project.findByIdAndDelete(projectId);

    return NextResponse.json({ message: "Project deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Delete project error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
