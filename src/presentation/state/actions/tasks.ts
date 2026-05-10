"use server"

import { Task } from "@/domain/entities"
import { MockTaskRepository } from "@/infrastructure/repositories/MockTaskRepository"

const taskRepo = new MockTaskRepository()

export async function createTask(data: { title: string, project: string, workspace: string, column: string }) {
  const newTask = new Task(
    data.title,
    data.column,
    data.project,
    data.workspace
  )
  
  const savedTask = await taskRepo.save(newTask)
  return savedTask
}

export async function getTasksByProject(projectId: string) {
  return await taskRepo.findByProject(projectId)
}
