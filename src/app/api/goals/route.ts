import { NextResponse } from "next/server";
import connectToDatabase from "@/infrastructure/db/mongodb";
import Goal from "@/infrastructure/models/Goal";
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
    const goals = await Goal.find({ workspaceId });

    return NextResponse.json({ goals }, { status: 200 });
  } catch (error) {
    console.error("Fetch goals error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const me = await requireUser();
    if (!me.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { title, description, dueDate, workspaceId, ownerId } = await request.json();

    if (!title || !dueDate || !workspaceId || !ownerId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await connectToDatabase();
    const goal = await Goal.create({
      title,
      description: description || "",
      dueDate,
      workspaceId,
      ownerId,
      progress: 0,
      status: "on-track",
    });

    return NextResponse.json({ goal }, { status: 201 });
  } catch (error) {
    console.error("Create goal error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const me = await requireUser();
    if (!me.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { goalId, patch } = await request.json();

    if (!goalId || !patch) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await connectToDatabase();
    const goal = await Goal.findByIdAndUpdate(goalId, patch, { new: true });

    return NextResponse.json({ goal }, { status: 200 });
  } catch (error) {
    console.error("Update goal error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const me = await requireUser();
    if (!me.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const goalId = searchParams.get("goalId");

    if (!goalId) {
      return NextResponse.json({ error: "goalId is required" }, { status: 400 });
    }

    await connectToDatabase();
    await Goal.findByIdAndDelete(goalId);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Delete goal error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
