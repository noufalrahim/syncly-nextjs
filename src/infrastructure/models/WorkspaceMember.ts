import mongoose from "mongoose";

const WorkspaceMemberSchema = new mongoose.Schema(
  {
    workspaceId: { type: String, required: true, index: true },
    userId: { type: String, required: true, index: true },
    role: {
      type: String,
      enum: ["admin", "member", "project_admin"],
      default: "member",
    },
  },
  { timestamps: true }
);

WorkspaceMemberSchema.index({ workspaceId: 1, userId: 1 }, { unique: true });

export default mongoose.models.WorkspaceMember ||
  mongoose.model("WorkspaceMember", WorkspaceMemberSchema);

