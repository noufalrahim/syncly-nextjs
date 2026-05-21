import { NextResponse } from "next/server";
import connectToDatabase from "@/infrastructure/db/mongodb";
import WorkspaceInvite from "@/infrastructure/models/WorkspaceInvite";
import Workspace from "@/infrastructure/models/Workspace";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");
  if (!token) return NextResponse.json({ error: "Missing token" }, { status: 400 });

  await connectToDatabase();
  const invite = await WorkspaceInvite.findOne({ token });
  if (!invite) return NextResponse.json({ error: "Invalid token" }, { status: 400 });

  const workspace = await Workspace.findById(invite.workspaceId);
  return NextResponse.json(
    {
      email: invite.email,
      workspaceId: invite.workspaceId,
      workspaceName: workspace?.name || "Workspace",
      acceptedAt: invite.acceptedAt,
      expiresAt: invite.expiresAt,
    },
    { status: 200 }
  );
}

