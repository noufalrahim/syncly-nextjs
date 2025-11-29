/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/api/sign-in.ts
import { AuthController } from "@/controllers/AuthController";
import { NextApiRequest, NextApiResponse } from "next";

const controller = new AuthController();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    try {
      const { email, password } = req.body;
      const result = await controller.signIn(email, password);
      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  } else {
    return res.status(405).json({ message: "Method not allowed" });
  }
}
