import mongoose from "mongoose";

const NoteSchema = new mongoose.Schema(
  {
    title: { type: String, default: "Untitled note" },
    body: { type: String, default: "" },
    projectId: { type: String, required: true },
    workspaceId: { type: String, required: true },
  },
  { timestamps: true }
);

// Clear the cache to ensure the new schema is used during hot-reloads
delete mongoose.models.Note;

export default mongoose.models.Note || mongoose.model("Note", NoteSchema);
