import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    isGroup: {
      type: Boolean,
      default: false,
    },
    groupName: {
      type: String,
      trim: true,
    },
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
    pairKey: {
      type: String,
      unique: true,
      sparse: true,
    },
  },

  { timestamps: true }
);
conversationSchema.index({ participants: 1, createdAt: -1 });
conversationSchema.index({ isGroup: 1, participants: 1 });

export const Conversation = mongoose.model("Conversation", conversationSchema);
