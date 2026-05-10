import mongoose from "mongoose";

const ColumnSchema = new mongoose.Schema(
  {
    label: { type: String, required: true },
    status: { type: String, default: "backlog" },
    projectId: { type: String, required: true },
    order: { type: Number, default: 0 },
    color: { type: String, default: "gray" },
  },
  { timestamps: true }
);

delete mongoose.models.Column;

export default mongoose.models.Column || mongoose.model("Column", ColumnSchema);
