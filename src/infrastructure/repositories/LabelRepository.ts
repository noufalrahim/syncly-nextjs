/* eslint-disable @typescript-eslint/no-explicit-any */
import { Label } from "@/domain/entities/LabelEntity";
import { ILabelRepository } from "@/domain/repositories/ILabelRepository";
import { Schema, model, models } from "mongoose";

const labelSchema = new Schema(
  {},
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

const LabelModel =
  models.Label || model("Label", labelSchema);

export class LabelRepository implements ILabelRepository {
  async create(label: Label): Promise<Label> {
    const newLabel = await LabelModel.create(label);
    return newLabel;
  }

  async find(): Promise<Label[]> {
    return await LabelModel.find();
  }

  async findById(id: string): Promise<Label | null> {
    return await LabelModel.findById(id);
  }

  async update(id: string, data: Partial<Label>): Promise<Label | null> {
    return await LabelModel.findByIdAndUpdate(id, data, { new: true });
  }

  async delete(id: string): Promise<boolean> {
    const result = await LabelModel.findByIdAndDelete(id);
    return result ? true : false;
  }
}
