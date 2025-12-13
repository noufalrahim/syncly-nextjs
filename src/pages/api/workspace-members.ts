import { NextApiRequest, NextApiResponse } from "next";
import { WorkspaceMemberController } from "@/controllers/WorkspaceMemberController";

const controller = new WorkspaceMemberController();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  if (method === "GET" && !req.query.id) {
    const route = req.query.type as string;

    if (route === "id") {
      const result = await controller.getWorkspaceMemberById(req.query.id as string);
      return res.status(200).json(result);
    }

    if (route === "workspace-id") {
      const result = await controller.getWorkspaceMembersByWorkspaceId(req.query.workspaceId as string);
      return res.status(200).json(result);
    }

    const result = await controller.getAllWorkspaceMembers();
    return res.status(200).json(result);
  }

  if (method === "POST") {
    const result = await controller.createWorkspaceMember(req.body);
    return res.status(201).json(result);
  }

  if (method === "PATCH") {
    const result = await controller.updateWorkspaceMember(req.query.id as string, req.body);
    return res.status(200).json(result);
  }

  if (method === "DELETE") {
    const result = await controller.deleteWorkspaceMember(req.query.id as string);
    return res.status(200).json(result);
  }

  return res.status(405).json({ success: false, message: "Method Not Allowed" });
}
