import mongoose from "mongoose";

const ProjectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    emoji: { type: String, required: true },
    color: { type: String, default: "blue" },
    workspaceId: { type: String, required: true },
    githubRepo: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.Project || mongoose.model("Project", ProjectSchema);
