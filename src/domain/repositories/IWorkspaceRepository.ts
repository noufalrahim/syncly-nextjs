import type { Workspace } from "../entities/WorkspaceEntity";

export interface IWorkspaceRepository {
  create(workspace: Workspace): Promise<Workspace>;
  find(): Promise<Workspace[]>;
  findById(id: string): Promise<Workspace | null>;
  findByUserId(userId: string): Promise<Workspace[] | null>;
  update(id: string, data: Partial<Workspace>): Promise<Workspace | null>;
  delete(id: string): Promise<boolean>;
}
