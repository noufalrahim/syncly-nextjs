import User from "@/infrastructure/models/User";
import { sendEmail } from "@/infrastructure/email/transporter";

export async function sendTaskNotification(params: {
  action: "created" | "updated" | "deleted";
  actorName?: string;
  taskTitle: string;
  taskId: string;
  projectId?: string;
  workspaceId?: string;
  recipientUserIds: string[];
}) {
  try {
    const users = await User.find({ _id: { $in: params.recipientUserIds } });
    const emails = Array.from(
      new Set(users.map((u: any) => String(u.email).toLowerCase()).filter(Boolean))
    );
    if (!emails.length) return;

    const actor = params.actorName ? ` by ${params.actorName}` : "";
    const subject = `Task ${params.action}: ${params.taskTitle}`;
    const html = `
      <p><b>${params.taskTitle}</b> was ${params.action}${actor}.</p>
      <p>Task ID: ${params.taskId}</p>
      ${params.projectId ? `<p>Project ID: ${params.projectId}</p>` : ""}
      ${params.workspaceId ? `<p>Workspace ID: ${params.workspaceId}</p>` : ""}
    `;

    await sendEmail({ to: emails, subject, html });
  } catch (error) {
    console.error("Task notification error:", error);
  }
}

