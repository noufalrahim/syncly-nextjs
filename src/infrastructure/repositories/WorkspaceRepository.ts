/* eslint-disable @typescript-eslint/no-explicit-any */
import { Workspace } from "@/domain/entities/WorkspaceEntity";
import { IWorkspaceRepository } from "@/domain/repositories/IWorkspaceRepository";
import { Schema, model, models } from "mongoose";

const workspaceSchema = new Schema(
  {
    name: String,
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

const WorkspaceModel =
  models.WorkspaceModel || model("Workspace", workspaceSchema);

export class WorkspaceRepository implements IWorkspaceRepository {
  async create(workspace: Workspace): Promise<Workspace> {
    const newWorkspace = await WorkspaceModel.create(workspace);
    return newWorkspace;
  }

  async find(): Promise<Workspace[]> {
    return await WorkspaceModel.find();
  }

  async findById(id: string): Promise<Workspace | null> {
    return await WorkspaceModel.findById(id);
  }

  async findByUserId(userId: string): Promise<Workspace[] | null> {
    return await WorkspaceModel.find({createdBy: userId});
  }

  async update(id: string, data: Partial<Workspace>): Promise<Workspace | null> {
    return await WorkspaceModel.findByIdAndUpdate(id, data, { new: true });
  }

  async delete(id: string): Promise<boolean> {
    const result = await WorkspaceModel.findByIdAndDelete(id);
    return result ? true : false;
  }
}
