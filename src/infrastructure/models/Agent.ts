import mongoose from "mongoose";

const AgentSchema = new mongoose.Schema(
  {
    workspaceId: {
      type: String,
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      default: "",
    },
    initials: {
      type: String,
      required: true,
    },
    color: {
      type: String,
      required: true,
    },
    isBot: {
      type: Boolean,
      default: true,
    },
    prompt: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Agent || mongoose.model("Agent", AgentSchema);
