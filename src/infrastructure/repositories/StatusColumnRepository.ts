/* eslint-disable @typescript-eslint/no-explicit-any */
import { StatusColumn } from "@/domain/entities/StatusColumnEntity";
import { IStatusColumnRepository } from "@/domain/repositories/IStatusColumnRepository";
import { Schema, model, models } from "mongoose";

const statuscolumnSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  project: {
    type: Schema.Types.ObjectId,
    ref: "Project",
    required: true,
  }
},{ timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

statuscolumnSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

export const StatusColumnModel =
  models.StatusColumn || model("StatusColumn", statuscolumnSchema, "status_columns");

export class StatusColumnRepository implements IStatusColumnRepository {
  async create(statuscolumn: StatusColumn): Promise<StatusColumn> {
    const newStatusColumn = await StatusColumnModel.create(statuscolumn);
    return newStatusColumn;
  }

  async find(): Promise<StatusColumn[]> {
    return await StatusColumnModel.find();
  }

  async findById(id: string): Promise<StatusColumn | null> {
    return await StatusColumnModel.findById(id);
  }

  async findByProjectId(projectId: string): Promise<StatusColumn[] | null> {
    return await StatusColumnModel.find({ project: projectId });
  }

  async update(id: string, data: Partial<StatusColumn>): Promise<StatusColumn | null> {
    return await StatusColumnModel.findByIdAndUpdate(id, data, { new: true });
  }

  async delete(id: string): Promise<boolean> {
    const result = await StatusColumnModel.findByIdAndDelete(id);
    return result ? true : false;
  }
}
