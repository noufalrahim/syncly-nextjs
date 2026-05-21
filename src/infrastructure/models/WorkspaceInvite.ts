import mongoose from "mongoose";

const WorkspaceInviteSchema = new mongoose.Schema(
  {
    workspaceId: { type: String, required: true, index: true },
    email: { type: String, required: true, index: true },
    role: {
      type: String,
      enum: ["member", "project_admin"],
      default: "member",
    },
    token: { type: String, required: true, unique: true, index: true },
    createdByUserId: { type: String, required: true },
    expiresAt: { type: Date, required: true, index: true },
    acceptedAt: { type: Date, default: null },
    acceptedByUserId: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.models.WorkspaceInvite ||
  mongoose.model("WorkspaceInvite", WorkspaceInviteSchema);

