import { TUser } from "./TUser";
import { TWorkspace } from "./TWorkspace";

export type TWorkspaceMember = {
    id?: string;
    workspace: TWorkspace;
    user: TUser;
    role: string;
};