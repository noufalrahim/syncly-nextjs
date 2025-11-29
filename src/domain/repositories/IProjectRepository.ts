import type { Project } from "../entities/ProjectEntity";

export interface IProjectRepository {
  create(project: Project): Promise<Project>;
  find(): Promise<Project[]>;
  findById(id: string): Promise<Project | null>;
  update(id: string, data: Partial<Project>): Promise<Project | null>;
  delete(id: string): Promise<boolean>;
}
