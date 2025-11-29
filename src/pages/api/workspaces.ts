import type { NextApiRequest, NextApiResponse } from "next";
import { WorkspaceController } from "@/controllers/WorkspaceController";

const controller = new WorkspaceController();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  if (method === "GET") {
    const route = req.query.type as string;

    if (route === "id") {
      const result = await controller.getWorkspaceById(req.query.id as string);
      return res.status(200).json(result);
    }

    if (route === "user-id") {
      const result = await controller.getWorkspaceByUserId(req.query.userId as string);
      return res.status(200).json(result);
    }

    const result = await controller.getAllWorkspaces();
    return res.status(200).json(result);
  }

  if (method === "POST") {
    const result = await controller.createWorkspace(req.body);
    return res.status(201).json(result);
  }

  if (method === "PATCH") {
    const result = await controller.updateWorkspace(req.query.id as string, req.body);
    return res.status(200).json(result);
  }

  if (method === "DELETE") {
    const result = await controller.deleteWorkspace(req.query.id as string);
    return res.status(200).json(result);
  }

  return res.status(405).json({ success: false, message: "Method Not Allowed" });
}
