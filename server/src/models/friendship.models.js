
import mongoose from "mongoose";

const friendshipSchema = new mongoose.Schema(
  {
    requester: {
      //the user who sent the friend request
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    recipient: {
      //the user who received the friend request
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "blocked"],
      default: "pending",
    },
    blockedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    prevStatus: {
      type: String,
      enum: ["pending", "accepted", "blocked","none"],
      default: "none",
    },
    pairKey: { type: String, unique: true, index: true },
  },
  { timeseries: true }
);

friendshipSchema.index({ requester: 1, recipient: 1 }, { unique: true });
friendshipSchema.index({ recipient: 1, status: 1 });
friendshipSchema.index({ requester: 1, status: 1 });

// always keep one record per pair (A_B == B_A)
friendshipSchema.pre("validate", function (next) {
  if (this.requester && this.recipient) {
    const a = this.requester.toString();
    const b = this.recipient.toString();
    this.pairKey = a < b ? `${a}_${b}` : `${b}_${a}`;
  }
  next();
});

export const Friendship = mongoose.model("Friendship", friendshipSchema);
