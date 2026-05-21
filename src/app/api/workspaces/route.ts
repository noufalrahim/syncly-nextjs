import { NextResponse } from "next/server";
import connectToDatabase from "@/infrastructure/db/mongodb";
import Workspace from "@/infrastructure/models/Workspace";
import WorkspaceMember from "@/infrastructure/models/WorkspaceMember";
import { requireUser } from "@/infrastructure/auth/requireUser";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    await connectToDatabase();
    const me = await requireUser();
    const effectiveUserId = me.ok ? me.userId : userId;
    if (!effectiveUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const owned = await Workspace.find({ ownerId: effectiveUserId });
    if (owned.length) {
      await WorkspaceMember.bulkWrite(
        owned.map((w: any) => ({
          updateOne: {
            filter: { workspaceId: w._id.toString(), userId: effectiveUserId },
            update: { $set: { role: "admin" } },
            upsert: true,
          },
        }))
      );
    }
    const memberships = await WorkspaceMember.find({ userId: effectiveUserId });
    const memberWorkspaceIds = memberships.map((m: any) => m.workspaceId);
    const memberWorkspaces = memberWorkspaceIds.length
      ? await Workspace.find({ _id: { $in: memberWorkspaceIds } })
      : [];
    const byId = new Map<string, any>();
    for (const w of [...owned, ...memberWorkspaces]) byId.set(w._id.toString(), w);
    const workspaces = Array.from(byId.values());

    return NextResponse.json({ workspaces }, { status: 200 });
  } catch (error) {
    console.error("Fetch workspaces error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name, ownerId } = await request.json();

    const me = await requireUser();
    const effectiveOwnerId = me.ok ? me.userId : ownerId;

    if (!name || !effectiveOwnerId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await connectToDatabase();
    const workspace = await Workspace.create({ name, ownerId: effectiveOwnerId });
    await WorkspaceMember.updateOne(
      { workspaceId: workspace._id.toString(), userId: effectiveOwnerId },
      { $set: { role: "admin" } },
      { upsert: true }
    );

    return NextResponse.json({ workspace }, { status: 201 });
  } catch (error) {
    console.error("Create workspace error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
