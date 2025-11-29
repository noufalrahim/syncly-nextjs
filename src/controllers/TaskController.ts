import type { Task } from "@/domain/entities/TaskEntity";
import { connectDB } from "@/infrastructure/db/connect";
import { TaskRepository } from "@/infrastructure/repositories/TaskRepository";

export class TaskController {
  async createTask(data: Task) {
    try {
      await connectDB();
      const repo = new TaskRepository();
      const result = await repo.create(data);
      return { success: true, data: result, message: "Task created successfully" };
    } catch (error: any) {
      return { success: false, data: null, message: error.message || "Failed to create Task" };
    }
  }

  async getAllTasks() {
    try {
      await connectDB();
      const repo = new TaskRepository();
      const result = await repo.find();
      return { success: true, data: result, message: "Tasks fetched successfully" };
    } catch (error: any) {
      return { success: false, data: null, message: error.message || "Failed to fetch Tasks" };
    }
  }

  async getTaskById(id: string) {
    try {
      await connectDB();
      const repo = new TaskRepository();
      const result = await repo.findById(id);
      return { success: true, data: result, message: "Task fetched successfully" };
    } catch (error: any) {
      return { success: false, data: null, message: error.message || "Failed to fetch Task" };
    }
  }

  async getTasksByProjectId(projectId: string, groupByColumn?: boolean) {
    try {
      await connectDB();
      const repo = new TaskRepository();
      const result = await repo.findByProjectId(projectId, groupByColumn);
      return { success: true, data: result, message: "Tasks fetched successfully" };
    } catch (error: any) {
      return { success: false, data: null, message: error.message || "Failed to fetch Tasks" };
    }
  }

  async updateTask(data: {
    identifier: {
      key: string;
      value: string;
    };
    updates: Partial<Task>;
  }) {
    try {
      await connectDB();
      const repo = new TaskRepository();
      const result = await repo.update(data.identifier.value, data.updates);
      return { success: true, data: result, message: "Task updated successfully" };
    } catch (error: any) {
      return { success: false, data: null, message: error.message || "Failed to update Task" };
    }
  }

  async deleteTask(id: string) {
    try {
      await connectDB();
      const repo = new TaskRepository();
      const result = await repo.delete(id);
      return { success: true, data: result, message: "Task deleted successfully" };
    } catch (error: any) {
      return { success: false, data: null, message: error.message || "Failed to delete Task" };
    }
  }
}
