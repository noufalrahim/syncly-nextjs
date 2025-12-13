import { ProjectMember } from "../entities/ProjectMemberEntity";

export interface IProjectMemberRepository {
  create(projectMember: ProjectMember): Promise<ProjectMember>;
  find(): Promise<ProjectMember[]>;
  findById(id: string): Promise<ProjectMember | null>;
  update(id: string, data: Partial<ProjectMember>): Promise<ProjectMember | null>;
  delete(id: string): Promise<boolean>;
}
