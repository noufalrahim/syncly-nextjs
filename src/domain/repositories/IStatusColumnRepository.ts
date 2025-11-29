import type { StatusColumn } from "../entities/StatusColumnEntity";

export interface IStatusColumnRepository {
  create(statuscolumn: StatusColumn): Promise<StatusColumn>;
  find(): Promise<StatusColumn[]>;
  findById(id: string): Promise<StatusColumn | null>;
  update(id: string, data: Partial<StatusColumn>): Promise<StatusColumn | null>;
  delete(id: string): Promise<boolean>;
}
