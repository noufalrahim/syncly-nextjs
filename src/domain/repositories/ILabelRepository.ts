import type { Label } from "../entities/LabelEntity";

export interface ILabelRepository {
  create(label: Label): Promise<Label>;
  find(): Promise<Label[]>;
  findById(id: string): Promise<Label | null>;
  update(id: string, data: Partial<Label>): Promise<Label | null>;
  delete(id: string): Promise<boolean>;
}
