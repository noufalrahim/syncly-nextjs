import { connectDB } from "@/infrastructure/db/connect";
import { DispatchRepository } from "@/infrastructure/repositories/DispatchRepository";

export class DispatchController {
  async sendEmailNotification() {
    try {
      await connectDB();
      const repo = new DispatchRepository();
      const result = await repo.sendEmailNotification('' , '', '');
      return { success: true, data: result, message: "Email notification sent successfully" };
    } catch (error: any) {
      return { success: false, data: null, message: error.message || "Failed to send Email notification" };
    }
  }
}
