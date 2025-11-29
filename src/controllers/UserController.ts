import { UserRepository } from "@/infrastructure/repositories/UserRepository";
import { connectDB } from "@/infrastructure/db/connect";
import { User } from "@/domain/entities/UserEntity";

export class UserController {
  async createUser(data: User) {
    try {
      await connectDB();
      const repo = new UserRepository();
      const result = await repo.create(data);
      return { success: true, data: result, message: "User created successfully" };
    } catch (error: any) {
      return { success: false, data: null, message: error.message || "Failed to create user" };
    }
  }

  async getUsers() {
    try {
      await connectDB();
      const repo = new UserRepository();
      const users = await repo.findAll();
      return { success: true, data: users, message: "Users fetched successfully" };
    } catch (error: any) {
      return { success: false, data: null, message: error.message || "Failed to fetch users" };
    }
  }

  async getUserById(id: string) {
    try {
      await connectDB();
      const repo = new UserRepository();
      const user = await repo.findById(id);
      if (!user) return { success: false, data: null, message: "User not found" };
      return { success: true, data: user, message: "User fetched successfully" };
    } catch (error: any) {
      return { success: false, data: null, message: error.message || "Failed to fetch user" };
    }
  }

  async login(email: string, password: string) {
    try {
      await connectDB();
      const repo = new UserRepository();
      const user = await repo.findByEmailAndPassword(email, password);
      if (!user) return { success: false, data: null, message: "Invalid credentials" };
      return { success: true, data: user, message: "Login successful" };
    } catch (error: any) {
      return { success: false, data: null, message: error.message || "Failed to login" };
    }
  }

  async updateUser(data: { identifier: { key: string; value: string }; updates: any }) {
    try {
      await connectDB();
      const repo = new UserRepository();
      const updatedUser = await repo.update(data);
      if (!updatedUser) return { success: false, data: null, message: "User not found" };
      return { success: true, data: updatedUser, message: "User updated successfully" };
    } catch (error: any) {
      return { success: false, data: null, message: error.message || "Failed to update user" };
    }
  }

  async resetPassword(data: { email: string; password: string }) {
    try {
      await connectDB();
      const repo = new UserRepository();
      const user = await repo.resetPassword(data);
      return { success: true, data: user, message: "Password reset successfully" };
    } catch (error: any) {
      return { success: false, data: null, message: error.message || "Failed to reset password" };
    }
  }

  async forgotPassword(email: string) {
    try {
      await connectDB();
      const repo = new UserRepository();
      const result = await repo.forgotPassword(email);
      if (!result.userFound)
        return { success: false, data: null, message: "User not found" };
      return { success: true, data: result, message: "User found for password reset" };
    } catch (error: any) {
      return { success: false, data: null, message: error.message || "Failed to process forgot password" };
    }
  }

  async changePassword(data: { _id: string; currentPassword: string; newPassword: string }) {
    console.log("Data: ", data);
    try {
      await connectDB();
      const repo = new UserRepository();
      const user = await repo.changePassword(data);
      return { success: true, data: user, message: "Password changed successfully" };
    } catch (error: any) {
      return { success: false, data: null, message: error.message || "Failed to change password" };
    }
  }

  async isUserExists(email: string, phone: {
    countryCode: string;
    number: string;
  }) {
    try {
      await connectDB();
      const repo = new UserRepository();
      const exists = await repo.userExists(email, phone);
      return { success: true, data: exists, message: "User existence checked successfully" };
    } catch (error: any) {
      return { success: false, data: null, message: error.message || "Failed to check user existence" };
    }
  }
}
