import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    attachments: [
      {
        type: String,
      },
    ],
    messageType: {
      type: String,
      enum: ["text", "image", "video", "file"],
      default: "text",
    },
    readBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);
messageSchema.index({ conversation: 1, createdAt: -1 });

export const Message = mongoose.model("Message", messageSchema);
