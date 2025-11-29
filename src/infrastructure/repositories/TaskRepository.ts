/* eslint-disable @typescript-eslint/no-explicit-any */
import "@/infrastructure/repositories/StatusColumnRepository";
import { Task } from "@/domain/entities/TaskEntity";
import { ITaskRepository } from "@/domain/repositories/ITaskRepository";
import { EPriority } from "@/types";
import { Schema, model, models } from "mongoose";
import { StatusColumnModel } from "@/infrastructure/repositories/StatusColumnRepository";
import mongoose from "mongoose";

const taskSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: false,
    },
    column: {
      type: Schema.Types.ObjectId,
      ref: "StatusColumn",
      required: true,
    },
    project: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    workspace: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },
    priority: {
      type: String,
      enum: Object.values(EPriority),
      required: false,
    },
    dueDate: {
      type: String,
      required: false,
    },
    assignee: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    label: {
      type: Schema.Types.ObjectId,
      ref: "Label",
      required: false,
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

taskSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

const TaskModel =
  models.Task || model("Task", taskSchema);

export class TaskRepository implements ITaskRepository {
  async create(task: Task): Promise<Task> {
    const newTask = await TaskModel.create(task);
    return newTask;
  }

  async find(): Promise<Task[]> {
    return await TaskModel.find();
  }

  async findById(id: string): Promise<Task | null> {
    return await TaskModel.findById(id);
  }

async findByProjectId(projectId: string, groupByColumn?: boolean): Promise<any> {
  if (!groupByColumn) {
    return await TaskModel.find({ project: projectId })
      .populate("column")
      .lean();
  }

  const columns = await StatusColumnModel.aggregate([
    {
      $match: {
        project: new mongoose.Types.ObjectId(projectId),
      },
    },
    {
      $lookup: {
        from: "tasks",
        localField: "_id",
        foreignField: "column",
        as: "tasks",
      },
    },
    {
      $project: {
        id: { $toString: "$_id" },
        name: 1,
        tasks: {
          $map: {
            input: "$tasks",
            as: "t",
            in: {
              id: { $toString: "$$t._id" },
              title: "$$t.title",
              description: "$$t.description",
              column: { $toString: "$_id" },
              project: { $toString: "$$t.project" },
            },
          },
        },
      },
    },
  ]);

  return columns;
}
  async update(id: string, data: Partial<Task>): Promise<Task | null> {
    return await TaskModel.findByIdAndUpdate(id, data, { new: true });
  }

  async delete(id: string): Promise<boolean> {
    const result = await TaskModel.findByIdAndDelete(id);
    return result ? true : false;
  }
}
