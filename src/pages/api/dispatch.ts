import type { NextApiRequest, NextApiResponse } from "next";
import { DispatchController } from "@/controllers/DispatchController";

const controller = new DispatchController();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  if (method === "POST") {
    const result = await controller.sendEmailNotification();
    return res.status(201).json(result);
  }

  return res.status(405).json({ success: false, message: "Method Not Allowed" });
}
