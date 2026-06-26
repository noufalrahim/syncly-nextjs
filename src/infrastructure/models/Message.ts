import mongoose from "mongoose";

const ReactionSchema = new mongoose.Schema({
  emoji: { type: String, required: true },
  userIds: { type: [String], default: [] },
}, { _id: false });

const MessageSchema = new mongoose.Schema(
  {
    workspaceId: {
      type: String,
      required: true,
      index: true,
    },
    channelId: {
      type: String,
      required: true,
      index: true,
    },
    authorId: {
      type: String,
      required: true,
    },
    body: {
      type: String,
      required: true,
    },
    parentId: {
      type: String,
      default: "",
    },
    reactions: {
      type: [ReactionSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Message || mongoose.model("Message", MessageSchema);
