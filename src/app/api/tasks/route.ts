import { NextResponse } from "next/server";
import connectToDatabase from "@/infrastructure/db/mongodb";
import Task from "@/infrastructure/models/Task";
import WorkspaceMember from "@/infrastructure/models/WorkspaceMember";
import Workspace from "@/infrastructure/models/Workspace";
import User from "@/infrastructure/models/User";
import { requireUser } from "@/infrastructure/auth/requireUser";
import { sendTaskNotification } from "@/infrastructure/email/taskNotifications";

async function assertAssigneesInWorkspace(workspaceId: string, assigneeIds: string[]) {
  if (!assigneeIds.length) return;
  const members = await WorkspaceMember.find({ workspaceId, userId: { $in: assigneeIds } });
  const memberIds = new Set(members.map((m: any) => m.userId));
  const missing = assigneeIds.filter((id) => !memberIds.has(id));
  if (missing.length) throw new Error("ASSIGNEE_NOT_IN_WORKSPACE");
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");
    const workspaceId = searchParams.get("workspaceId");

    await connectToDatabase();
    let query: any = {};
    if (projectId) query.projectId = projectId;
    if (workspaceId) query.workspaceId = workspaceId;

    const tasks = await Task.find(query);

    return NextResponse.json({ tasks }, { status: 200 });
  } catch (error) {
    console.error("Fetch tasks error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const me = await requireUser();
    if (!me.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const taskData = await request.json();
    await connectToDatabase();

    const workspaceId = String(taskData.workspaceId || "");
    if (!workspaceId) {
      return NextResponse.json({ error: "workspaceId is required" }, { status: 400 });
    }

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) return NextResponse.json({ error: "Workspace not found" }, { status: 404 });

    const assigneeIds: string[] = Array.isArray(taskData.assigneeIds)
      ? taskData.assigneeIds.map(String)
      : taskData.assigneeId
        ? [String(taskData.assigneeId)]
        : [];
    await assertAssigneesInWorkspace(workspaceId, assigneeIds);

    const task = await Task.create({
      ...taskData,
      createdById: me.userId,
      assigneeIds,
      assigneeId: assigneeIds[0] || taskData.assigneeId,
    });

    const actor = await User.findById(me.userId);
    const recipients = Array.from(new Set([me.userId, ...assigneeIds]));
    await sendTaskNotification({
      action: "created",
      actorName: actor?.name,
      taskTitle: task.title,
      taskId: task._id.toString(),
      projectId: task.projectId,
      workspaceId,
      recipientUserIds: recipients,
    });

    return NextResponse.json({ task }, { status: 201 });
  } catch (error) {
    if ((error as any)?.message === "ASSIGNEE_NOT_IN_WORKSPACE") {
      return NextResponse.json({ error: "Assignee must be a workspace member" }, { status: 400 });
    }
    console.error("Create task error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const me = await requireUser();
    if (!me.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { taskId, patch } = await request.json();
    await connectToDatabase();
    const before = await Task.findById(taskId);
    if (!before) return NextResponse.json({ error: "Task not found" }, { status: 404 });

    const workspaceId = String(before.workspaceId || patch?.workspaceId || "");
    if (patch?.assigneeIds || patch?.assigneeId) {
      const assigneeIds: string[] = Array.isArray(patch.assigneeIds)
        ? patch.assigneeIds.map(String)
        : patch.assigneeId
          ? [String(patch.assigneeId)]
          : Array.isArray(before.assigneeIds)
            ? before.assigneeIds
            : before.assigneeId
              ? [before.assigneeId]
              : [];
      await assertAssigneesInWorkspace(workspaceId, assigneeIds);
      patch.assigneeIds = assigneeIds;
      patch.assigneeId = assigneeIds[0] || patch.assigneeId;
    }

    const task = await Task.findByIdAndUpdate(taskId, patch, { new: true });

    const assigneeIds: string[] = Array.isArray(task?.assigneeIds)
      ? task.assigneeIds
      : task?.assigneeId
        ? [task.assigneeId]
        : [];
    const recipients = Array.from(
      new Set([String(task?.createdById || before.createdById || ""), ...assigneeIds].filter(Boolean))
    );
    const actor = await User.findById(me.userId);
    await sendTaskNotification({
      action: "updated",
      actorName: actor?.name,
      taskTitle: task?.title || before.title,
      taskId: before._id.toString(),
      projectId: task?.projectId || before.projectId,
      workspaceId: task?.workspaceId || before.workspaceId,
      recipientUserIds: recipients,
    });

    return NextResponse.json({ task }, { status: 200 });
  } catch (error) {
    if ((error as any)?.message === "ASSIGNEE_NOT_IN_WORKSPACE") {
      return NextResponse.json({ error: "Assignee must be a workspace member" }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const me = await requireUser();
    if (!me.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get("taskId");
    await connectToDatabase();
    const before = taskId ? await Task.findById(taskId) : null;
    if (!before) return NextResponse.json({ error: "Task not found" }, { status: 404 });

    await Task.findByIdAndDelete(taskId);

    const assigneeIds: string[] = Array.isArray(before.assigneeIds)
      ? before.assigneeIds
      : before.assigneeId
        ? [before.assigneeId]
        : [];
    const recipients = Array.from(
      new Set([String(before.createdById || ""), ...assigneeIds].filter(Boolean))
    );
    const actor = await User.findById(me.userId);
    await sendTaskNotification({
      action: "deleted",
      actorName: actor?.name,
      taskTitle: before.title,
      taskId: before._id.toString(),
      projectId: before.projectId,
      workspaceId: before.workspaceId,
      recipientUserIds: recipients,
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
