import { connectDB } from "@/infrastructure/db/connect";
import { ProjectRepository } from "@/infrastructure/repositories/ProjectRepository";
import { Project } from "@/domain/entities/ProjectEntity";

export class ProjectController {

  async createProject(data: Project) {
    try {
      await connectDB();
      const repo = new ProjectRepository();
      const result = await repo.create(data);
      return { success: true, data: result, message: "Project created successfully" };
    } catch (error: any) {
      return { success: false, data: null, message: error.message || "Failed to create Project" };
    }
  }

  async getAllProjects() {
    try {
      await connectDB();
      const repo = new ProjectRepository();
      const result = await repo.find();
      return { success: true, data: result, message: "Projects fetched successfully" };
    } catch (error: any) {
      return { success: false, data: null, message: error.message || "Failed to fetch Projects" };
    }
  }

  async getProjectById(id: string) {
    try {
      await connectDB();
      const repo = new ProjectRepository();
      const result = await repo.findById(id);
      return { success: true, data: result, message: "Project fetched successfully" };
    } catch (error: any) {
      return { success: false, data: null, message: error.message || "Failed to fetch Project" };
    }
  }

   async getProjectByWorkspaceId(wrkspcId: string) {
      try {
        await connectDB();
        const repo = new ProjectRepository();
        const result = await repo.findByWorkspaceId(wrkspcId);
        return { success: true, data: result, message: "Project fetched successfully" };
      } catch (error: any) {
        return { success: false, data: null, message: error.message || "Failed to fetch Project" };
      }
    }
  

  async updateProject(id: string, data: Partial<Project>) {
    try {
      await connectDB();
      const repo = new ProjectRepository();
      const result = await repo.update(id, data);
      return { success: true, data: result, message: "Project updated successfully" };
    } catch (error: any) {
      return { success: false, data: null, message: error.message || "Failed to update Project" };
    }
  }

  async deleteProject(id: string) {
    try {
      await connectDB();
      const repo = new ProjectRepository();
      const result = await repo.delete(id);
      return { success: true, data: result, message: "Project deleted successfully" };
    } catch (error: any) {
      return { success: false, data: null, message: error.message || "Failed to delete Project" };
    }
  }
}
