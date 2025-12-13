import { WorkspaceMember } from "../entities/WorkspaceMemberEntity";

export interface IWorkspaceMemberRepository {
  create(workspaceMember: WorkspaceMember): Promise<WorkspaceMember>;
  find(): Promise<WorkspaceMember[]>;
  findById(id: string): Promise<WorkspaceMember | null>;
  update(id: string, data: Partial<WorkspaceMember>): Promise<WorkspaceMember | null>;
  delete(id: string): Promise<boolean>;
}
