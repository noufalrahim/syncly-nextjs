import mongoose from "mongoose";

const ChannelSchema = new mongoose.Schema(
  {
    workspaceId: {
      type: String,
      required: true,
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

export default mongoose.models.Channel || mongoose.model("Channel", ChannelSchema);
