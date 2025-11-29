import type { NextApiRequest, NextApiResponse } from "next";
import { TaskController } from "@/controllers/TaskController";

const controller = new TaskController();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  if (method === "GET") {
    const route = req.query.type as string;
    console.log(route);
    if (route === "id") {
      const result = await controller.getTaskById(req.query.id as string);
      return res.status(200).json(result);
    }

    if (route === "project-id") {
      const result = await controller.getTasksByProjectId(
        req.query.projectId as string,
        req.query.groupByColumn as unknown as boolean,
      );
      return res.status(200).json(result);
    }

    const result = await controller.getAllTasks();
    return res.status(200).json(result);
  }

  if (method === "POST") {
    const result = await controller.createTask(req.body);
    return res.status(201).json(result);
  }

  if (method === "PUT") {
    const result = await controller.updateTask(req.query.id as string, req.body);
    return res.status(200).json(result);
  }

  if (method === "DELETE") {
    const result = await controller.deleteTask(req.query.id as string);
    return res.status(200).json(result);
  }

  return res.status(405).json({ success: false, message: "Method Not Allowed" });
}
