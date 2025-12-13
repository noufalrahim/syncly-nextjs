import type { NextApiRequest, NextApiResponse } from "next";
import { WorkspaceMemberController } from "@/controllers/WorkspaceMemberController";
import { UserController } from "@/controllers/UserController";

const controller = new WorkspaceMemberController();
const userController = new UserController();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { method } = req;

    if (method === "GET") {
        const type = req.query.type as string;

        if (type === "accept-invite") {

            const workspaceId = req.query.workspaceId as string;
            const email = req.query.email as string;
        const token = req.query.token as string;

            if (token !== "token@123") {
                return res.status(401).json({ success: false, message: "Invalid token" });
            }

            const user = await userController.getUserByEmail(email);

            if (!user || !user.success || !user.data?._id) {
                return res.redirect(302, "/error")
            }

            await controller.createWorkspaceMember({
                workspace: workspaceId,
                user: user.data._id,
                role: "member",
            });

            return res.redirect(302, "/");
        }
    }

    return res.status(405).json({ success: false, message: "Method Not Allowed" });
}
