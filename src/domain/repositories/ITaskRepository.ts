import { Task } from "../entities"

export interface ITaskRepository {
  findAll(): Promise<Task[]>
  findById(id: string): Promise<Task | null>
  save(task: Task): Promise<Task>
  delete(id: string): Promise<void>
  findByProject(projectId: string): Promise<Task[]>
}
