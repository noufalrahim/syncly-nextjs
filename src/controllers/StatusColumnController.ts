import type { StatusColumn } from "@/domain/entities/StatusColumnEntity";
import { connectDB } from "@/infrastructure/db/connect";
import { StatusColumnRepository } from "@/infrastructure/repositories/StatusColumnRepository";

export class StatusColumnController {
  async createStatusColumn(data: StatusColumn) {
    try {
      await connectDB();
      const repo = new StatusColumnRepository();
      const result = await repo.create(data);
      return { success: true, data: result, message: "StatusColumn created successfully" };
    } catch (error: any) {
      return {
        success: false,
        data: null,
        message: error.message || "Failed to create StatusColumn",
      };
    }
  }

  async getAllStatusColumns() {
    try {
      await connectDB();
      const repo = new StatusColumnRepository();
      const result = await repo.find();
      return { success: true, data: result, message: "StatusColumns fetched successfully" };
    } catch (error: any) {
      return {
        success: false,
        data: null,
        message: error.message || "Failed to fetch StatusColumns",
      };
    }
  }

  async getStatusColumnById(id: string) {
    try {
      await connectDB();
      const repo = new StatusColumnRepository();
      const result = await repo.findById(id);
      return { success: true, data: result, message: "StatusColumn fetched successfully" };
    } catch (error: any) {
      return {
        success: false,
        data: null,
        message: error.message || "Failed to fetch StatusColumn",
      };
    }
  }

  async getStatusColumnByProjectId(projectId: string) {
    console.log("Project od: ", projectId);
    try {
      await connectDB();
      const repo = new StatusColumnRepository();
      const result = await repo.findByProjectId(projectId);
      return { success: true, data: result, message: "Workspace fetched successfully" };
    } catch (error: any) {
      return { success: false, data: null, message: error.message || "Failed to fetch Workspace" };
    }
  }

  async updateStatusColumn(id: string, data: Partial<StatusColumn>) {
    try {
      await connectDB();
      const repo = new StatusColumnRepository();
      const result = await repo.update(id, data);
      return { success: true, data: result, message: "StatusColumn updated successfully" };
    } catch (error: any) {
      return {
        success: false,
        data: null,
        message: error.message || "Failed to update StatusColumn",
      };
    }
  }

  async deleteStatusColumn(id: string) {
    try {
      await connectDB();
      const repo = new StatusColumnRepository();
      const result = await repo.delete(id);
      return { success: true, data: result, message: "StatusColumn deleted successfully" };
    } catch (error: any) {
      return {
        success: false,
        data: null,
        message: error.message || "Failed to delete StatusColumn",
      };
    }
  }
}
