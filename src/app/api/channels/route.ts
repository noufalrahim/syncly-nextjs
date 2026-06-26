import { NextResponse } from "next/server";
import connectToDatabase from "@/infrastructure/db/mongodb";
import Channel from "@/infrastructure/models/Channel";
import { requireUser } from "@/infrastructure/auth/requireUser";

export async function GET(request: Request) {
  try {
    const me = await requireUser();
    if (!me.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get("workspaceId");
    if (!workspaceId) return NextResponse.json({ error: "Missing workspaceId" }, { status: 400 });

    await connectToDatabase();
    const channels = await Channel.find({ workspaceId });
    const mapped = channels.map((c: any) => ({
      id: c._id.toString(),
      type: c.type,
      name: c.name,
      description: c.description,
      memberIds: c.memberIds,
      unreadCount: c.unreadCount,
    }));

    return NextResponse.json({ channels: mapped }, { status: 200 });
  } catch (error) {
    console.error("Fetch channels error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const me = await requireUser();
    if (!me.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { workspaceId, type, name, description, memberIds } = await request.json();
    if (!workspaceId || !name || !type) return NextResponse.json({ error: "Missing required fields" }, { status: 400 });

    await connectToDatabase();
    const channel = await Channel.create({
      workspaceId,
      type,
      name,
      description: description || "",
      memberIds: memberIds || [],
      unreadCount: 0,
    });

    return NextResponse.json({
      channel: {
        id: channel._id.toString(),
        type: channel.type,
        name: channel.name,
        description: channel.description,
        memberIds: channel.memberIds,
        unreadCount: channel.unreadCount,
      }
    }, { status: 201 });
  } catch (error) {
    console.error("Create channel error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
