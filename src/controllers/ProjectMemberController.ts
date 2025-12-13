import { connectDB } from "@/infrastructure/db/connect";
import { ProjectMemberRepository } from "@/infrastructure/repositories/ProjectMemberRepository";
import { ProjectMember } from "@/domain/entities/ProjectMemberEntity";

export class ProjectMemberController {

  async createProjectMember(data: ProjectMember) {
    try {
      await connectDB();
      const repo = new ProjectMemberRepository();
      const result = await repo.create(data);
      return { success: true, data: result, message: "ProjectMember created successfully" };
    } catch (error: any) {
      return { success: false, data: null, message: error.message || "Failed to create ProjectMember" };
    }
  }

  async getAllProjectMembers() {
    try {
      await connectDB();
      const repo = new ProjectMemberRepository();
      const result = await repo.find();
      return { success: true, data: result, message: "ProjectMembers fetched successfully" };
    } catch (error: any) {
      return { success: false, data: null, message: error.message || "Failed to fetch ProjectMembers" };
    }
  }

  async getProjectMemberById(id: string) {
    try {
      await connectDB();
      const repo = new ProjectMemberRepository();
      const result = await repo.findById(id);
      return { success: true, data: result, message: "ProjectMember fetched successfully" };
    } catch (error: any) {
      return { success: false, data: null, message: error.message || "Failed to fetch ProjectMember" };
    }
  }

  async updateProjectMember(id: string, data: Partial<ProjectMember>) {
    try {
      await connectDB();
      const repo = new ProjectMemberRepository();
      const result = await repo.update(id, data);
      return { success: true, data: result, message: "ProjectMember updated successfully" };
    } catch (error: any) {
      return { success: false, data: null, message: error.message || "Failed to update ProjectMember" };
    }
  }

  async deleteProjectMember(id: string) {
    try {
      await connectDB();
      const repo = new ProjectMemberRepository();
      const result = await repo.delete(id);
      return { success: true, data: result, message: "ProjectMember deleted successfully" };
    } catch (error: any) {
      return { success: false, data: null, message: error.message || "Failed to delete ProjectMember" };
    }
  }
}
