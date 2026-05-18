import { NextResponse } from "next/server";
import connectToDatabase from "@/infrastructure/db/mongodb";
import Note from "@/infrastructure/models/Note";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get("workspaceId");
    const projectId = searchParams.get("projectId");

    await connectToDatabase();

    let query: any = {};
    if (projectId) {
      query.projectId = projectId;
    } else if (workspaceId) {
      query.workspaceId = workspaceId;
    } else {
      return NextResponse.json({ error: "workspaceId or projectId is required" }, { status: 400 });
    }

    const notes = await Note.find(query).sort({ updatedAt: -1 });

    return NextResponse.json({ notes }, { status: 200 });
  } catch (error) {
    console.error("Fetch notes error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { title, body, projectId, workspaceId } = await request.json();

    if (!projectId || !workspaceId) {
      return NextResponse.json({ error: "Missing required fields: projectId and workspaceId are required" }, { status: 400 });
    }

    await connectToDatabase();
    const note = await Note.create({
      title: title || "Untitled note",
      body: body || "",
      projectId,
      workspaceId,
    });

    return NextResponse.json({ note }, { status: 201 });
  } catch (error) {
    console.error("Create note error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { noteId, patch } = await request.json();

    if (!noteId) {
      return NextResponse.json({ error: "noteId is required" }, { status: 400 });
    }

    await connectToDatabase();
    const note = await Note.findByIdAndUpdate(noteId, patch, { new: true });

    if (!note) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    return NextResponse.json({ note }, { status: 200 });
  } catch (error) {
    console.error("Update note error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const noteId = searchParams.get("noteId");

    if (!noteId) {
      return NextResponse.json({ error: "noteId is required" }, { status: 400 });
    }

    await connectToDatabase();
    const note = await Note.findByIdAndDelete(noteId);

    if (!note) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Note deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Delete note error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
