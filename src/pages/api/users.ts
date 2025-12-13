// src/pages/api/users.ts

import type { NextApiRequest, NextApiResponse } from "next";
import { UserController } from "@/controllers/UserController";

const controller = new UserController();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const body = req.body;
    const param = req.query;
    if (param.type === "change_password") {
      const response = await controller.changePassword(body);
      return res.status(200).json(response);
    } else if (param.type === "user_exists") {
      const response = await controller.isUserExists(body.email, body.phoneNumber);
      return res.status(200).json(response);
    } else {
      const response = await controller.createUser(body);
      return res.status(200).json(response);
    }
  } else if (req.method === "GET") {
    const param = req.query;
    if (param.type === "get_many_by_email") {
      const response = await controller.getManyUsersByEmail(param.keyword as string);
      return res.status(200).json(response);
    }
    const users = await controller.getUsers();
    return res.status(200).json(users);
  } else {
    return res.status(405).json({ message: "Method not allowed" });
  }
}
