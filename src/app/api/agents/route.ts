import { NextResponse } from "next/server";
import connectToDatabase from "@/infrastructure/db/mongodb";
import Agent from "@/infrastructure/models/Agent";
import { requireUser } from "@/infrastructure/auth/requireUser";

export async function GET(request: Request) {
  try {
    const me = await requireUser();
    if (!me.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get("workspaceId");
    if (!workspaceId) return NextResponse.json({ error: "Missing workspaceId" }, { status: 400 });

    await connectToDatabase();
    const agents = await Agent.find({ workspaceId });
    const mapped = agents.map((a: any) => ({
      id: a._id.toString(),
      name: a.name,
      email: a.email,
      initials: a.initials,
      color: a.color,
      isBot: a.isBot,
      prompt: a.prompt,
    }));

    return NextResponse.json({ agents: mapped }, { status: 200 });
  } catch (error) {
    console.error("Fetch agents error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const me = await requireUser();
    if (!me.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { workspaceId, name, email, initials, color, prompt } = await request.json();
    if (!workspaceId || !name) return NextResponse.json({ error: "Missing required fields" }, { status: 400 });

    await connectToDatabase();
    const agent = await Agent.create({
      workspaceId,
      name,
      email: email || "",
      initials: initials || "A",
      color: color || "bg-purple-600",
      prompt: prompt || "",
      isBot: true,
    });

    return NextResponse.json({
      agent: {
        id: agent._id.toString(),
        name: agent.name,
        email: agent.email,
        initials: agent.initials,
        color: agent.color,
        isBot: agent.isBot,
        prompt: agent.prompt,
      }
    }, { status: 201 });
  } catch (error) {
    console.error("Create agent error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const me = await requireUser();
    if (!me.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get("agentId");
    if (!agentId) return NextResponse.json({ error: "Missing agentId" }, { status: 400 });

    const patch = await request.json();
    await connectToDatabase();

    const agent = await Agent.findByIdAndUpdate(
      agentId,
      { $set: patch },
      { new: true }
    );

    if (!agent) return NextResponse.json({ error: "Agent not found" }, { status: 404 });

    return NextResponse.json({
      agent: {
        id: agent._id.toString(),
        name: agent.name,
        email: agent.email,
        initials: agent.initials,
        color: agent.color,
        isBot: agent.isBot,
        prompt: agent.prompt,
      }
    }, { status: 200 });
  } catch (error) {
    console.error("Update agent error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const me = await requireUser();
    if (!me.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get("agentId");
    if (!agentId) return NextResponse.json({ error: "Missing agentId" }, { status: 400 });

    await connectToDatabase();
    await Agent.findByIdAndDelete(agentId);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Delete agent error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
