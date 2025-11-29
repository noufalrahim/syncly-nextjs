import type { Task } from "../entities/TaskEntity";

export interface ITaskRepository {
  create(task: Task): Promise<Task>;
  find(): Promise<Task[]>;
  findById(id: string): Promise<Task | null>;
  update(id: string, data: Partial<Task>): Promise<Task | null>;
  delete(id: string): Promise<boolean>;
}
