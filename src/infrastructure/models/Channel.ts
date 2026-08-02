import mongoose from "mongoose";

const ChannelSchema = new mongoose.Schema(
  {
    workspaceId: {
      type: String,
      required: true,
      index: true,
    },
    projectId: {
      type: String,
      default: null,
      index: true,
    },
    type: {
      type: String,
      enum: ["channel", "dm"],
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    memberIds: {
      type: [String],
      default: [],
    },
    unreadCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

ChannelSchema.index({ workspaceId: 1, projectId: 1, type: 1 });

delete mongoose.models.Channel;

export default mongoose.models.Channel || mongoose.model("Channel", ChannelSchema);
