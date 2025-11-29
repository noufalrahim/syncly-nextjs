import { connectDB } from "@/infrastructure/db/connect";
import { WorkspaceRepository } from "@/infrastructure/repositories/WorkspaceRepository";
import { Workspace } from "@/domain/entities/WorkspaceEntity";

export class WorkspaceController {

  async createWorkspace(data: Workspace) {
    try {
      await connectDB();
      const repo = new WorkspaceRepository();
      const result = await repo.create(data);
      return { success: true, data: result, message: "Workspace created successfully" };
    } catch (error: any) {
      return { success: false, data: null, message: error.message || "Failed to create Workspace" };
    }
  }

  async getAllWorkspaces() {
    try {
      await connectDB();
      const repo = new WorkspaceRepository();
      const result = await repo.find();
      return { success: true, data: result, message: "Workspaces fetched successfully" };
    } catch (error: any) {
      return { success: false, data: null, message: error.message || "Failed to fetch Workspaces" };
    }
  }

  async getWorkspaceById(id: string) {
    try {
      await connectDB();
      const repo = new WorkspaceRepository();
      const result = await repo.findById(id);
      return { success: true, data: result, message: "Workspace fetched successfully" };
    } catch (error: any) {
      return { success: false, data: null, message: error.message || "Failed to fetch Workspace" };
    }
  }

  async getWorkspaceByUserId(userId: string) {
    try {
      await connectDB();
      const repo = new WorkspaceRepository();
      const result = await repo.findByUserId(userId);
      return { success: true, data: result, message: "Workspace fetched successfully" };
    } catch (error: any) {
      return { success: false, data: null, message: error.message || "Failed to fetch Workspace" };
    }
  }

  async updateWorkspace(id: string, data: Partial<Workspace>) {
    try {
      await connectDB();
      const repo = new WorkspaceRepository();
      const result = await repo.update(id, data);
      return { success: true, data: result, message: "Workspace updated successfully" };
    } catch (error: any) {
      return { success: false, data: null, message: error.message || "Failed to update Workspace" };
    }
  }

  async deleteWorkspace(id: string) {
    try {
      await connectDB();
      const repo = new WorkspaceRepository();
      const result = await repo.delete(id);
      return { success: true, data: result, message: "Workspace deleted successfully" };
    } catch (error: any) {
      return { success: false, data: null, message: error.message || "Failed to delete Workspace" };
    }
  }
}
