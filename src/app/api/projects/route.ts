import { NextResponse } from "next/server";
import connectToDatabase from "@/infrastructure/db/mongodb";
import Project from "@/infrastructure/models/Project";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get("workspaceId");

    if (!workspaceId) {
      return NextResponse.json({ error: "workspaceId is required" }, { status: 400 });
    }

    await connectToDatabase();
    const projects = await Project.find({ workspaceId });

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
