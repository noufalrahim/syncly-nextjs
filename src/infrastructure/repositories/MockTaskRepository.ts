import { Task } from "@/domain/entities"
import { ITaskRepository } from "@/domain/repositories/ITaskRepository"

// Mock implementation for demonstration
export class MockTaskRepository implements ITaskRepository {
  private tasks: Task[] = []

  async findAll(): Promise<Task[]> {
    return this.tasks
  }

  async findById(id: string): Promise<Task | null> {
    return this.tasks.find(t => t._id === id) || null
  }

  async save(task: Task): Promise<Task> {
    if (!task._id) {
      task._id = Math.random().toString(36).substring(7)
      this.tasks.push(task)
    } else {
      const index = this.tasks.findIndex(t => t._id === task._id)
      if (index !== -1) {
        this.tasks[index] = task
      }
    }
    return task
  }

  async delete(id: string): Promise<void> {
    this.tasks = this.tasks.filter(t => t._id !== id)
  }

  async findByProject(projectId: string): Promise<Task[]> {
    return this.tasks.filter(t => t.project === projectId)
  }
}
