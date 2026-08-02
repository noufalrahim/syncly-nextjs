import { NextResponse } from "next/server";
import connectToDatabase from "@/infrastructure/db/mongodb";
import Channel from "@/infrastructure/models/Channel";
import Project from "@/infrastructure/models/Project";
import WorkspaceMember from "@/infrastructure/models/WorkspaceMember";
import { requireUser } from "@/infrastructure/auth/requireUser";

function mapChannel(c: any) {
  return {
    id: c._id.toString(),
    type: c.type,
    name: c.name,
    description: c.description,
    memberIds: c.memberIds,
    unreadCount: c.unreadCount,
    projectId: c.projectId || null,
  };
}

const DEFAULT_CHANNELS = [
  {
    name: "general",
    description: "Project announcements and work-based matters",
  },
  {
    name: "random",
    description: "Non-work talk and banter",
  },
];

export async function GET(request: Request) {
  try {
    const me = await requireUser();
    if (!me.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get("workspaceId");
    const projectId = searchParams.get("projectId");
    if (!workspaceId) return NextResponse.json({ error: "Missing workspaceId" }, { status: 400 });

    await connectToDatabase();

    // One-time: attach orphan workspace channels to the oldest project
    const projects = await Project.find({ workspaceId }).sort({ createdAt: 1 }).limit(1);
    const firstProjectId = projects[0]?._id?.toString();
    if (firstProjectId) {
      await Channel.updateMany(
        {
          workspaceId,
          type: "channel",
          $or: [{ projectId: null }, { projectId: { $exists: false } }, { projectId: "" }],
        },
        { $set: { projectId: firstProjectId } }
      );
    }

    if (projectId) {
      const members = await WorkspaceMember.find({ workspaceId });
      const memberIds = members.map((m: any) => String(m.userId));
      if (!memberIds.includes(me.userId)) memberIds.push(me.userId);

      for (const def of DEFAULT_CHANNELS) {
        const existing = await Channel.findOne({
          workspaceId,
          projectId,
          type: "channel",
          name: def.name,
        });
        if (!existing) {
          await Channel.create({
            workspaceId,
            projectId,
            type: "channel",
            name: def.name,
            description: def.description,
            memberIds,
            unreadCount: 0,
          });
        } else {
          // Keep default channels' membership in sync with workspace humans
          await Channel.updateOne(
            { _id: existing._id },
            { $set: { memberIds } }
          );
        }
      }
    }

    const query: Record<string, unknown> = { workspaceId };
    if (projectId) {
      query.$or = [
        { type: "dm" },
        { type: "channel", projectId },
      ];
    }

    const channels = await Channel.find(query);
    return NextResponse.json({ channels: channels.map(mapChannel) }, { status: 200 });
  } catch (error) {
    console.error("Fetch channels error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const me = await requireUser();
    if (!me.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { workspaceId, type, name, description, memberIds, projectId } = await request.json();
    if (!workspaceId || !name || !type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    if (type === "channel" && !projectId) {
      return NextResponse.json({ error: "projectId is required for channels" }, { status: 400 });
    }

    await connectToDatabase();
    const channel = await Channel.create({
      workspaceId,
      projectId: type === "channel" ? projectId : null,
      type,
      name,
      description: description || "",
      memberIds: memberIds || [],
      unreadCount: 0,
    });

    return NextResponse.json({ channel: mapChannel(channel) }, { status: 201 });
  } catch (error) {
    console.error("Create channel error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
