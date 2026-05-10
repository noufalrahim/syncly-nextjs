import { NextResponse } from "next/server";
import connectToDatabase from "@/infrastructure/db/mongodb";
import Workspace from "@/infrastructure/models/Workspace";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "UserId is required" }, { status: 400 });
    }

    await connectToDatabase();
    const workspaces = await Workspace.find({ ownerId: userId });

    return NextResponse.json({ workspaces }, { status: 200 });
  } catch (error) {
    console.error("Fetch workspaces error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name, ownerId } = await request.json();

    if (!name || !ownerId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await connectToDatabase();
    const workspace = await Workspace.create({ name, ownerId });

    return NextResponse.json({ workspace }, { status: 201 });
  } catch (error) {
    console.error("Create workspace error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
