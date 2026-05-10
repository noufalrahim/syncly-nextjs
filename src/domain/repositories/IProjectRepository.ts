import { Project } from "../entities"

export interface IProjectRepository {
  findAll(): Promise<Project[]>
  findById(id: string): Promise<Project | null>
  save(project: Project): Promise<Project>
  delete(id: string): Promise<void>
}
