import mongoose from "mongoose";

const TagSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    color: { type: String, default: "blue" },
    projectId: { type: String, required: true },
    workspaceId: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.Tag || mongoose.model("Tag", TagSchema);
