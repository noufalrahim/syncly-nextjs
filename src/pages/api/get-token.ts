/* eslint-disable @typescript-eslint/no-explicit-any */

import type { NextApiRequest, NextApiResponse } from "next";
import { AuthController } from "@/controllers/AuthController";

const controller = new AuthController();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res
          .status(401)
          .json({ success: false, message: "Authorization token missing or invalid" });
      }

      const token = authHeader.split(" ")[1];
      const result = await controller.getUserFromToken(token);

      return res.status(result.success ? 200 : 401).json(result);
    } catch (error: any) {
      return res
        .status(500)
        .json({ success: false, message: error.message || "Internal Server Error" });
    }
  } else {
    return res.status(405).json({ message: "Method not allowed" });
  }
}
