import { NextResponse } from "next/server";
import connectToDatabase from "@/infrastructure/db/mongodb";
import Message from "@/infrastructure/models/Message";
import { requireUser } from "@/infrastructure/auth/requireUser";

export async function GET(request: Request) {
  try {
    const me = await requireUser();
    if (!me.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get("workspaceId");
    if (!workspaceId) return NextResponse.json({ error: "Missing workspaceId" }, { status: 400 });

    await connectToDatabase();
    const messages = await Message.find({ workspaceId });
    const mapped = messages.map((m: any) => ({
      id: m._id.toString(),
      channelId: m.channelId,
      authorId: m.authorId,
      body: m.body,
      createdAt: m.createdAt.toISOString(),
      parentId: m.parentId || undefined,
      reactions: m.reactions || [],
    }));

    return NextResponse.json({ messages: mapped }, { status: 200 });
  } catch (error) {
    console.error("Fetch messages error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const me = await requireUser();
    if (!me.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { workspaceId, channelId, authorId, body, parentId } = await request.json();
    if (!workspaceId || !channelId || !authorId || !body) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await connectToDatabase();
    const message = await Message.create({
      workspaceId,
      channelId,
      authorId,
      body,
      parentId: parentId || "",
      reactions: [],
    });

    return NextResponse.json({
      message: {
        id: message._id.toString(),
        channelId: message.channelId,
        authorId: message.authorId,
        body: message.body,
        createdAt: message.createdAt.toISOString(),
        parentId: message.parentId || undefined,
        reactions: message.reactions,
      }
    }, { status: 201 });
  } catch (error) {
    console.error("Create message error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const me = await requireUser();
    if (!me.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { messageId, emoji } = await request.json();
    if (!messageId || !emoji) return NextResponse.json({ error: "Missing required fields" }, { status: 400 });

    await connectToDatabase();
    const message = await Message.findById(messageId);
    if (!message) return NextResponse.json({ error: "Message not found" }, { status: 404 });

    const userId = me.userId;
    const reactions = message.reactions || [];
    const existingIdx = reactions.findIndex((r: any) => r.emoji === emoji);

    if (existingIdx === -1) {
      reactions.push({ emoji, userIds: [userId] });
    } else {
      const existing = reactions[existingIdx];
      if (existing.userIds.includes(userId)) {
        existing.userIds = existing.userIds.filter((id: string) => id !== userId);
        if (existing.userIds.length === 0) {
          reactions.splice(existingIdx, 1);
        }
      } else {
        existing.userIds.push(userId);
      }
    }

    message.reactions = reactions;
    await message.save();

    return NextResponse.json({
      message: {
        id: message._id.toString(),
        channelId: message.channelId,
        authorId: message.authorId,
        body: message.body,
        createdAt: message.createdAt.toISOString(),
        parentId: message.parentId || undefined,
        reactions: message.reactions,
      }
    }, { status: 200 });
  } catch (error) {
    console.error("Toggle reaction error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
