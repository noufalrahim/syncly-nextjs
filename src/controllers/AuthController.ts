/* eslint-disable @typescript-eslint/no-explicit-any */

import jwt from "jsonwebtoken";
import { connectDB } from "@/infrastructure/db/connect";
import { UserRepository } from "@/infrastructure/repositories/UserRepository";

const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";
const JWT_EXPIRES_IN = "7d";

export class AuthController {
  async signIn(email: string, password: string) {
    try {
      await connectDB();
      const repo = new UserRepository();
      const user = await repo.findByEmailAndPassword(email, password);

      if (!user) {
        return {
          success: false,
          data: null,
          message: "Invalid email or password",
        };
      }

      const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN,
      });

      return {
        success: true,
        data: { user, token },
        message: "User signed in successfully",
      };
    } catch (error: any) {
      console.error("Error signing in user:", error);
      return {
        success: false,
        data: null,
        message: error.message || "Failed to sign in user",
      };
    }
  }

  async getUserFromToken(token: string) {
    try {
      if (!token) {
        return {
          success: false,
          data: null,
          message: "Token is required",
        };
      }

      const decoded: any = jwt.verify(token, JWT_SECRET);
      await connectDB();

      const repo = new UserRepository();
      const user = await repo.findById(decoded.userId);

      if (!user) {
        return {
          success: false,
          data: null,
          message: "User not found",
        };
      }

      return {
        success: true,
        data: user,
        message: "User retrieved successfully",
      };
    } catch (error: any) {
      console.error("Error decoding token:", error);
      return {
        success: false,
        data: null,
        message: "Invalid or expired token",
      };
    }
  }
}
