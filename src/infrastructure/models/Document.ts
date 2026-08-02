import mongoose from "mongoose";

const DocumentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    type: {
      type: String,
      enum: ["pdf", "doc", "sheet", "image", "video", "zip", "folder"],
      required: true,
    },
    size: { type: String, default: "" },
    parentId: { type: String, default: null },
    workspaceId: { type: String, required: true },
    projectId: { type: String, required: true, index: true },
    ownerId: { type: String, required: true },
  },
  { timestamps: true }
);

delete mongoose.models.Document;

export default mongoose.models.Document || mongoose.model("Document", DocumentSchema);
