import mongoose from "mongoose";

const WorkspaceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide a workspace name"],
    },
    ownerId: {
      type: String,
      required: true,
    },
    plan: {
      type: String,
      enum: ["free", "professional"],
      default: "professional",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Workspace || mongoose.model("Workspace", WorkspaceSchema);
