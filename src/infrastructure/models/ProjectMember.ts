import mongoose from "mongoose";

const ProjectMemberSchema = new mongoose.Schema(
  {
    projectId: { type: String, required: true, index: true },
    userId: { type: String, required: true, index: true },
    role: {
      type: String,
      enum: ["admin", "member"],
      default: "member",
    },
  },
  { timestamps: true }
);

ProjectMemberSchema.index({ projectId: 1, userId: 1 }, { unique: true });

export default mongoose.models.ProjectMember ||
  mongoose.model("ProjectMember", ProjectMemberSchema);

