/* eslint-disable @typescript-eslint/no-explicit-any */

import { model, models, Schema } from "mongoose";
import type { User } from "@/domain/entities/UserEntity";
import type { IUserRepository } from "@/domain/repositories/IUserRepository";

const userSchema = new Schema(
  {
    name: String,
    email: String,
    password: String,
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

const UserModel = models.User || model("User", userSchema);

export class UserRepository implements IUserRepository {
  async create(user: User): Promise<User> {
    const newUser = await UserModel.create({
      name: user.name,
      email: user.email,
      password: user.password,
    });
    return newUser;
  }

  async findAll(): Promise<User[]> {
    return await UserModel.find({});
  }

  async findById(id: string): Promise<User | null> {
    return await UserModel.findById(id);
  }

  async findByEmailAndPassword(email: string, password: string): Promise<User | null> {
    return await UserModel.findOne({ email, password });
  }

  async update(data: {
    identifier: {
      key: string;
      value: string;
    };
    updates: Partial<User>;
  }): Promise<User | null> {
    try {
      const { identifier, updates } = data;
      const updatedUser = await UserModel.findOneAndUpdate(
        { [identifier.key]: identifier.value },
        { $set: updates },
        { new: true },
      ).lean();

      return updatedUser as unknown as User;
    } catch (error: any) {
      console.error("Error updating appointment:", error);
      throw new Error(error.message || "Failed to update appointment");
    }
  }
  async resetPassword(data: { email: string; password: string }): Promise<User> {
    try {
      const { email, password } = data;
      const updatedUser = await UserModel.findOneAndUpdate(
        { email },
        { $set: { password } },
        { new: true },
      ).lean();

      if (!updatedUser) throw new Error("User not found");

      return updatedUser as unknown as User;
    } catch (error: any) {
      console.error("Error resetting password:", error);
      throw new Error(error.message || "Failed to reset password");
    }
  }

  async forgotPassword(email: string): Promise<{
    userFound: boolean;
  }> {
    try {
      const user = await UserModel.findOne({ email }).lean();
      if (!user)
        return {
          userFound: false,
        };
      return {
        userFound: true,
      };
    } catch (error: any) {
      console.error("Error fetching user for forgot password:", error);
      throw new Error(error.message || "Failed to fetch user for forgot password");
    }
  }

  async changePassword(data: {
    _id: string;
    newPassword: string;
    currentPassword: string;
  }): Promise<User> {
    try {
      const { _id, currentPassword, newPassword } = data;
      console.log("Id: ", _id);
      const user = await UserModel.findById(_id);

      if (!user) throw new Error("User not found");
      if (user.password !== currentPassword) throw new Error("Incorrect current password");

      user.password = newPassword;
      await user.save();

      return user.toObject() as User;
    } catch (error: any) {
      console.error("Error changing password:", error);
      throw new Error(error.message || "Failed to change password");
    }
  }

  async userExists(
    email: string,
    phone: {
      countryCode: string;
      number: string;
    },
  ): Promise<boolean> {
    try {
      const user = await UserModel.findOne({
        $or: [{ email }, { phone: phone }],
      }).lean();

      return !!user;
    } catch (error: any) {
      console.error("Error checking if user exists:", error);
      throw new Error(error.message || "Failed to check if user exists");
    }
  }
}
