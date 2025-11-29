/* eslint-disable @typescript-eslint/no-explicit-any */
import { Project } from "@/domain/entities/ProjectEntity";
import { IProjectRepository } from "@/domain/repositories/IProjectRepository";
import { Schema, model, models } from "mongoose";

const projectSchema = new Schema(
  {
    name: String,
    workspace: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    emoji: String,
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

const ProjectModel =
  models.Project || model("Project", projectSchema);

export class ProjectRepository implements IProjectRepository {
  async create(project: Project): Promise<Project> {
    const newProject = await ProjectModel.create(project);
    return newProject;
  }

  async find(): Promise<Project[]> {
    return await ProjectModel.find();
  }

  async findById(id: string): Promise<Project | null> {
    return await ProjectModel.findById(id);
  }

  async findByWorkspaceId(wrkspcId: string): Promise<Project[] | null> {
    return await ProjectModel.find({ workspace: wrkspcId });
  }

  async update(id: string, data: Partial<Project>): Promise<Project | null> {
    return await ProjectModel.findByIdAndUpdate(id, data, { new: true });
  }

  async delete(id: string): Promise<boolean> {
    const result = await ProjectModel.findByIdAndDelete(id);
    return result ? true : false;
  }
}
