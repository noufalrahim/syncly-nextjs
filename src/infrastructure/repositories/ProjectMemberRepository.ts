/* eslint-disable @typescript-eslint/no-explicit-any */
import { ProjectMember } from "@/domain/entities/ProjectMemberEntity";
import { IProjectMemberRepository } from "@/domain/repositories/IProjectMemberRepository";
import { Schema, model, models } from "mongoose";

const projectMemberSchema = new Schema(
  {
    project: {
      type: Schema.Types.ObjectId,
      ref: "Project",
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

const ProjectMemberModel =
  models.ProjectMember || model("ProjectMember", projectMemberSchema);

export class ProjectMemberRepository implements IProjectMemberRepository {
  async create(projectMember: ProjectMember): Promise<ProjectMember> {
    const newProjectMember = await ProjectMemberModel.create(projectMember);
    return newProjectMember;
  }

  async find(): Promise<ProjectMember[]> {
    return await ProjectMemberModel.find();
  }

  async findById(id: string): Promise<ProjectMember | null> {
    return await ProjectMemberModel.findById(id);
  }

  async update(id: string, data: Partial<ProjectMember>): Promise<ProjectMember | null> {
    return await ProjectMemberModel.findByIdAndUpdate(id, data, { new: true });
  }

  async delete(id: string): Promise<boolean> {
    const result = await ProjectMemberModel.findByIdAndDelete(id);
    return result ? true : false;
  }
}
