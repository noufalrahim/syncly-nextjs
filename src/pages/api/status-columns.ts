import { NextApiRequest, NextApiResponse } from "next";
import { StatusColumnController } from "@/controllers/StatusColumnController";

const controller = new StatusColumnController();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  if (method === "GET") {
    const route = req.query.type as string;

    if (route === "id") {
      const result = await controller.getStatusColumnById(req.query.id as string);
      return res.status(200).json(result);
    }

    if (route === "project-id") {
      const result = await controller.getStatusColumnByProjectId(req.query.projectId as string);
      return res.status(200).json(result);
    }

    const result = await controller.getAllStatusColumns();
    return res.status(200).json(result);
  }

  if (method === "POST") {
    const result = await controller.createStatusColumn(req.body);
    return res.status(201).json(result);
  }

  if (method === "PUT") {
    const result = await controller.updateStatusColumn(req.query.id as string, req.body);
    return res.status(200).json(result);
  }

  if (method === "DELETE") {
    const result = await controller.deleteStatusColumn(req.query.id as string);
    return res.status(200).json(result);
  }

  return res.status(405).json({ success: false, message: "Method Not Allowed" });
}
