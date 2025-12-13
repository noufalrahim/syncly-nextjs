import { connectDB } from "@/infrastructure/db/connect";
import { WorkspaceMemberRepository } from "@/infrastructure/repositories/WorkspaceMemberRepository";
import { WorkspaceMember } from "@/domain/entities/WorkspaceMemberEntity";

export class WorkspaceMemberController {

  async createWorkspaceMember(data: WorkspaceMember) {
    try {
      await connectDB();
      const repo = new WorkspaceMemberRepository();
      const result = await repo.create(data);
      return { success: true, data: result, message: "WorkspaceMember created successfully" };
    } catch (error: any) {
      return { success: false, data: null, message: error.message || "Failed to create WorkspaceMember" };
    }
  }

  async getAllWorkspaceMembers() {
    try {
      await connectDB();
      const repo = new WorkspaceMemberRepository();
      const result = await repo.find();
      return { success: true, data: result, message: "WorkspaceMembers fetched successfully" };
    } catch (error: any) {
      return { success: false, data: null, message: error.message || "Failed to fetch WorkspaceMembers" };
    }
  }

  async getWorkspaceMembersByWorkspaceId(workspaceId: string) {
    try {
      await connectDB();
      const repo = new WorkspaceMemberRepository();
      const result = await repo.findByWorkspaceId(workspaceId);
      return { success: true, data: result, message: "WorkspaceMembers fetched successfully" };
    } catch (error: any) {
      return { success: false, data: null, message: error.message || "Failed to fetch WorkspaceMembers" };
    }
  }

  async getWorkspaceMemberById(id: string) {
    try {
      await connectDB();
      const repo = new WorkspaceMemberRepository();
      const result = await repo.findById(id);
      return { success: true, data: result, message: "WorkspaceMember fetched successfully" };
    } catch (error: any) {
      return { success: false, data: null, message: error.message || "Failed to fetch WorkspaceMember" };
    }
  }

  async updateWorkspaceMember(id: string, data: Partial<WorkspaceMember>) {
    try {
      await connectDB();
      const repo = new WorkspaceMemberRepository();
      const result = await repo.update(id, data);
      return { success: true, data: result, message: "WorkspaceMember updated successfully" };
    } catch (error: any) {
      return { success: false, data: null, message: error.message || "Failed to update WorkspaceMember" };
    }
  }

  async deleteWorkspaceMember(id: string) {
    try {
      await connectDB();
      const repo = new WorkspaceMemberRepository();
      const result = await repo.delete(id);
      return { success: true, data: result, message: "WorkspaceMember deleted successfully" };
    } catch (error: any) {
      return { success: false, data: null, message: error.message || "Failed to delete WorkspaceMember" };
    }
  }
}
