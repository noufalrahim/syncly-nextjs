import mongoose from "mongoose";

const GoalSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: "" },
    progress: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["on-track", "at-risk", "off-track", "completed"],
      default: "on-track",
    },
    dueDate: { type: String, required: true },
    ownerId: { type: String, required: true },
    workspaceId: { type: String, required: true },
    projectId: { type: String, required: true, index: true },
  },
  { timestamps: true }
);

delete mongoose.models.Goal;

export default mongoose.models.Goal || mongoose.model("Goal", GoalSchema);
