import type { NextApiRequest, NextApiResponse } from "next";
import { ProjectController } from "@/controllers/ProjectController";

const controller = new ProjectController();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  if (method === "GET") {
    const route = req.query.type as string;

    if (route === "id") {
      const result = await controller.getProjectById(req.query.id as string);
      return res.status(200).json(result);
    }

    if (route === "workspace-id") {
      const result = await controller.getProjectByWorkspaceId(req.query.workspaceId as string);
      return res.status(200).json(result);
    }

    const result = await controller.getAllProjects();
    return res.status(200).json(result);
  }

  if (method === "POST") {
    const result = await controller.createProject(req.body);
    return res.status(201).json(result);
  }

  if (method === "PATCH") {
    const result = await controller.updateProject(req.query.id as string, req.body);
    return res.status(200).json(result);
  }

  if (method === "DELETE") {
    const result = await controller.deleteProject(req.query.id as string);
    return res.status(200).json(result);
  }

  return res.status(405).json({ success: false, message: "Method Not Allowed" });
}
