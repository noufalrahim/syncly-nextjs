import { NextResponse } from "next/server";
import connectToDatabase from "@/infrastructure/db/mongodb";
import Column from "@/infrastructure/models/Column";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");

    if (!projectId) {
      return NextResponse.json({ error: "projectId is required" }, { status: 400 });
    }

    await connectToDatabase();
    const columns = await Column.find({ projectId }).sort({ order: 1 });

    return NextResponse.json({ columns }, { status: 200 });
  } catch (error) {
    console.error("Fetch columns error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { label, status, projectId, order, color } = await request.json();

    if (!label || !projectId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await connectToDatabase();
    const column = await Column.create({ label, status, projectId, order, color });

    return NextResponse.json({ column }, { status: 201 });
  } catch (error) {
    console.error("Create column error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { columnId, patch } = await request.json();
    await connectToDatabase();
    const column = await Column.findByIdAndUpdate(columnId, patch, { new: true });
    return NextResponse.json({ column }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const columnId = searchParams.get("columnId");
    await connectToDatabase();
    await Column.findByIdAndDelete(columnId);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
