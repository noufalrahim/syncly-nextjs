import { Task } from "../../entities"
import { ITaskRepository } from "../../repositories/ITaskRepository"

export class GetTasksByProjectUseCase {
  constructor(private taskRepository: ITaskRepository) {}

  async execute(projectId: string): Promise<Task[]> {
    return await this.taskRepository.findByProject(projectId)
  }
}
