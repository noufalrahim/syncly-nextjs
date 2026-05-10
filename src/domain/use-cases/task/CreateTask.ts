import { Task } from "../../entities"
import { ITaskRepository } from "../../repositories/ITaskRepository"

export class CreateTaskUseCase {
  constructor(private taskRepository: ITaskRepository) {}

  async execute(title: string, column: string, project: string, workspace: string): Promise<Task> {
    const task = new Task(title, column, project, workspace)
    return await this.taskRepository.save(task)
  }
}
