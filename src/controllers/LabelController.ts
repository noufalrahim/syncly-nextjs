import { connectDB } from "@/infrastructure/db/connect";
import { LabelRepository } from "@/infrastructure/repositories/LabelRepository";
import { Label } from "@/domain/entities/LabelEntity";

export class LabelController {

  async createLabel(data: Label) {
    try {
      await connectDB();
      const repo = new LabelRepository();
      const result = await repo.create(data);
      return { success: true, data: result, message: "Label created successfully" };
    } catch (error: any) {
      return { success: false, data: null, message: error.message || "Failed to create Label" };
    }
  }

  async getAllLabels() {
    try {
      await connectDB();
      const repo = new LabelRepository();
      const result = await repo.find();
      return { success: true, data: result, message: "Labels fetched successfully" };
    } catch (error: any) {
      return { success: false, data: null, message: error.message || "Failed to fetch Labels" };
    }
  }

  async getLabelById(id: string) {
    try {
      await connectDB();
      const repo = new LabelRepository();
      const result = await repo.findById(id);
      return { success: true, data: result, message: "Label fetched successfully" };
    } catch (error: any) {
      return { success: false, data: null, message: error.message || "Failed to fetch Label" };
    }
  }

  async updateLabel(id: string, data: Partial<Label>) {
    try {
      await connectDB();
      const repo = new LabelRepository();
      const result = await repo.update(id, data);
      return { success: true, data: result, message: "Label updated successfully" };
    } catch (error: any) {
      return { success: false, data: null, message: error.message || "Failed to update Label" };
    }
  }

  async deleteLabel(id: string) {
    try {
      await connectDB();
      const repo = new LabelRepository();
      const result = await repo.delete(id);
      return { success: true, data: result, message: "Label deleted successfully" };
    } catch (error: any) {
      return { success: false, data: null, message: error.message || "Failed to delete Label" };
    }
  }
}
