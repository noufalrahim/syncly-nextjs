import { NextApiRequest, NextApiResponse } from "next";
import { ProjectMemberController } from "@/controllers/ProjectMemberController";

const controller = new ProjectMemberController();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  if (method === "GET" && !req.query.id) {
    const route = req.query.type as string;

    if (route === "id") {
      const result = await controller.getProjectMemberById(req.query.id as string);
      return res.status(200).json(result);
    }

    const result = await controller.getAllProjectMembers();
    return res.status(200).json(result);
  }

  if (method === "POST") {
    const result = await controller.createProjectMember(req.body);
    return res.status(201).json(result);
  }

  if (method === "PATCH") {
    const result = await controller.updateProjectMember(req.query.id as string, req.body);
    return res.status(200).json(result);
  }

  if (method === "DELETE") {
    const result = await controller.deleteProjectMember(req.query.id as string);
    return res.status(200).json(result);
  }

  return res.status(405).json({ success: false, message: "Method Not Allowed" });
}
