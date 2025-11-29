import { NextApiRequest, NextApiResponse } from "next";
import { LabelController } from "@/controllers/LabelController";

const controller = new LabelController();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  if (method === "GET" && !req.query.id) {
    const route = req.query.type as string;

    if (route === "id") {
      const result = await controller.getLabelById(req.query.id as string);
      return res.status(200).json(result);
    }

    const result = await controller.getAllLabels();
    return res.status(200).json(result);
  }

  if (method === "POST") {
    const result = await controller.createLabel(req.body);
    return res.status(201).json(result);
  }

  if (method === "PUT") {
    const result = await controller.updateLabel(req.query.id as string, req.body);
    return res.status(200).json(result);
  }

  if (method === "DELETE") {
    const result = await controller.deleteLabel(req.query.id as string);
    return res.status(200).json(result);
  }

  return res.status(405).json({ success: false, message: "Method Not Allowed" });
}
