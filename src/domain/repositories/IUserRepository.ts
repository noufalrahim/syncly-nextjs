import type { User } from "../entities/UserEntity";

export interface IUserRepository {
  create(user: User): Promise<User>;
  findAll(): Promise<User[]>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  update(data: {
    identifier: {
      key: string;
      value: string;
    };
    updates: Partial<User>;
  }): Promise<User | null>;
  resetPassword(data: { email: string; password: string }): Promise<User>;
  forgotPassword(email: string): Promise<{
    userFound: boolean;
  }>;
  changePassword(data: {
    _id: string;
    currentPassword: string;
    newPassword: string;
  }): Promise<User>;
  userExists(email: string, phone: { countryCode: string; number: string }): Promise<boolean>;
}
