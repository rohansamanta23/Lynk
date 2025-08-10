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
      required: true,
    },
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
  },

  { timestamps: true }
);

conversationSchema.methods.addParticipant = async function (userId, adminId) {
  if (!this.isGroup) return null;
  const participant = await mongoose
    .model("User")
    .findOne({ userId: userId })
    .select("_id");
  const admin = await mongoose
    .model("User")
    .findOne({ userId: adminId })
    .select("_id");
  if (!participant) {
    throw new Error("User not found");
  }
  if (!admin) {
    throw new Error("Admin not found");
  }
  if (!this.admin.equals(admin._id)) {
    throw new Error("Only admin can add participants");
  }
  this.participants.addToSet(participant._id);
  await this.save();
  return this;
};

conversationSchema.methods.removeParticipant = async function (
  targetUserId,
  requesterUserId
) {
  if (!this.isGroup) return null;
  const targetUser = await mongoose
    .model("User")
    .findOne({ userId: targetUserId })
    .select("_id");
  const requesterUser = await mongoose
    .model("User")
    .findOne({ userId: requesterUserId })
    .select("_id");
  if (!targetUser) throw new Error("User not found");
  if (!requesterUser) throw new Error("Requester not found");
  const isAdmin = this.admin.equals(requesterUser._id);
  const isSelf = targetUser._id.equals(requesterUser._id);
  if (!isAdmin && !isSelf) {
    throw new Error(
      "Only admin or the user themselves can remove a participant"
    );
  }
  this.participants = this.participants.filter(
    (id) => id.toString() !== targetUser._id.toString()
  );
  if (isAdmin && isSelf) {
    if (this.participants.length > 0) {
      this.admin = this.participants[0]; // Set the first participant as the new admin
    } else {
      this.admin = null; // If the admin is removed, set admin to null
      await this.remove();
      return null; // Conversation deleted if no participants left
    }
  }
  await this.save();
  return this;
};

conversationSchema.methods.updateGroupName = async function (
  newGroupName,
  requesterUserId
) {
  if (!this.isGroup) return null;
  const requesterUser = await mongoose
    .model("User")
    .findOne({ userId: requesterUserId })
    .select("_id");
  if (!requesterUser) {
    throw new Error("Requester not found");
  }
  if (!this.admin.equals(requesterUser._id)) {
    throw new Error("Only admin can update group name");
  }
  this.groupName = newGroupName;
  await this.save();
  return this;
};

export const Conversation = mongoose.model("Conversation", conversationSchema);
