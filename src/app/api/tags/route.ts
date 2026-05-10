import { NextResponse } from "next/server";
import connectToDatabase from "@/infrastructure/db/mongodb";
import Tag from "@/infrastructure/models/Tag";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");
    const workspaceId = searchParams.get("workspaceId");

    await connectToDatabase();
    let query: any = {};
    if (projectId) query.projectId = projectId;
    if (workspaceId) query.workspaceId = workspaceId;

    const tags = await Tag.find(query);

    return NextResponse.json({ tags }, { status: 200 });
  } catch (error) {
    console.error("Fetch tags error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const tagData = await request.json();
    await connectToDatabase();
    const tag = await Tag.create(tagData);
    return NextResponse.json({ tag }, { status: 201 });
  } catch (error) {
    console.error("Create tag error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
