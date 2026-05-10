import { NextResponse } from "next/server";
import connectToDatabase from "@/infrastructure/db/mongodb";
import Task from "@/infrastructure/models/Task";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");
    const workspaceId = searchParams.get("workspaceId");

    await connectToDatabase();
    let query: any = {};
    if (projectId) query.projectId = projectId;
    if (workspaceId) query.workspaceId = workspaceId;

    const tasks = await Task.find(query);

    return NextResponse.json({ tasks }, { status: 200 });
  } catch (error) {
    console.error("Fetch tasks error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const taskData = await request.json();
    await connectToDatabase();
    const task = await Task.create(taskData);
    return NextResponse.json({ task }, { status: 201 });
  } catch (error) {
    console.error("Create task error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { taskId, patch } = await request.json();
    await connectToDatabase();
    const task = await Task.findByIdAndUpdate(taskId, patch, { new: true });
    return NextResponse.json({ task }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get("taskId");
    await connectToDatabase();
    await Task.findByIdAndDelete(taskId);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
