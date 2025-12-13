/* eslint-disable @typescript-eslint/no-explicit-any */
import { WorkspaceMember } from "@/domain/entities/WorkspaceMemberEntity";
import { IWorkspaceMemberRepository } from "@/domain/repositories/IWorkspaceMemberRepository";
import { Schema, model, models } from "mongoose";

const workspaceMemberSchema = new Schema(
  {
    workspace: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    role: {
      type: String,
      enum: ["owner", "admin", "member"],
      default: "member",
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

const WorkspaceMemberModel =
  models.WorkspaceMember || model("WorkspaceMember", workspaceMemberSchema, "workspace_members");

export class WorkspaceMemberRepository implements IWorkspaceMemberRepository {
  async create(workspaceMember: WorkspaceMember): Promise<WorkspaceMember> {
    const newWorkspaceMember = await WorkspaceMemberModel.create(workspaceMember);
    return newWorkspaceMember;
  }

  async find(): Promise<WorkspaceMember[]> {
    return await WorkspaceMemberModel.find();
  }

  async findByWorkspaceId(workspaceId: string): Promise<WorkspaceMember[]> {
    return await WorkspaceMemberModel.find({ workspace: workspaceId }).populate("user").populate("workspace");
  }

  async findById(id: string): Promise<WorkspaceMember | null> {
    return await WorkspaceMemberModel.findById(id);
  }

  async update(id: string, data: Partial<WorkspaceMember>): Promise<WorkspaceMember | null> {
    return await WorkspaceMemberModel.findByIdAndUpdate(id, data, { new: true });
  }

  async delete(id: string): Promise<boolean> {
    const result = await WorkspaceMemberModel.findByIdAndDelete(id);
    return result ? true : false;
  }
}
