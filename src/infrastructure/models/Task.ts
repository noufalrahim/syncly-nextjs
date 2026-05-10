import mongoose from "mongoose";

const TaskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: "" },
    status: { type: String, default: "backlog" },
    priority: { type: String, default: "medium" },
    assigneeId: { type: String, default: "u1" },
    dueDate: { type: String },
    startDate: { type: String },
    labels: [{ type: String }],
    projectId: { type: String, required: true },
    columnId: { type: String },
    workspaceId: { type: String },
    order: { type: Number, default: 0 },
    comments: [
      {
        body: String,
        authorId: String,
        parentId: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
    history: [
      {
        type: { type: String },
        message: String,
        authorId: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
    references: [
      {
        title: String,
        url: String,
      },
    ],
    attachments: [
      {
        name: String,
        size: String,
        type: { type: String },
      },
    ],
  },
  { timestamps: true }
);

// Clear the cache to ensure the new schema is used during hot-reloads
delete mongoose.models.Task;

export default mongoose.models.Task || mongoose.model("Task", TaskSchema);
