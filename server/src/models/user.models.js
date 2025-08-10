import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    userId: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      index: true,
      lowercase: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    password: {
      type: String,
      required: true,
      trim: true,
    },

    refreshToken: {
      type: String,
    },
    status: {
      type: String,
      enum: ["online", "offline"],
      default: "online",
    },
    friends: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    friendRequestsSent: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    friendRequestsReceived: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },

  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.setOnline = function () {
  this.status = "online";
  return this.save();
};

userSchema.methods.setOffline = function () {
  this.status = "offline";
  return this.save();
};

userSchema.methods.sendFriendRequest = async function (receiverId) {
  const receiver = await mongoose
    .model("User")
    .findOne({ userId: receiverId })
    .select("_id");
  if (!receiver) {
    throw new ApiError(404, "User not found");
  }
  if (this.userId === receiver.userId) {
    throw new ApiError(400, "You cannot send a friend request to yourself");
  }
  this.friendRequestsSent.addToSet(receiver._id);
  receiver.friendRequestsReceived.addToSet(this._id);
  await receiver.save();
  await this.save();
  return this;
};

userSchema.methods.acceptFriendRequest = async function (friendId) {
  const sender = await mongoose
    .model("User")
    .findOne({ userId: friendId })
    .select("_id");
  if (!sender) {
    throw new ApiError(404, "User not found");
  }
  this.friendRequestsReceived = this.friendRequestsReceived.filter(
    (id) => id.toString() !== sender._id.toString()
  );
  sender.friendRequestsSent = sender.friendRequestsSent.filter(
    (id) => id.toString() !== this._id.toString()
  );
  this.friends.addToSet(sender._id);
  sender.friends.addToSet(this._id);
  await this.save();
  await sender.save();
  return this;
};

userSchema.methods.cancelFriendRequest = async function (receiverId) {
  const receiver = await mongoose
    .model("User")
    .findOne({ userId: receiverId })
    .select("_id");
  if (!receiver) {
    throw new ApiError(404, "User not found");
  }
  this.friendRequestsSent = this.friendRequestsSent.filter(
    (id) => id.toString() !== receiver._id.toString()
  );
  receiver.friendRequestsReceived = receiver.friendRequestsReceived.filter(
    (id) => id.toString() !== this._id.toString()
  );
  await this.save();
  await receiver.save();
  return this;
};

userSchema.methods.removeFriend = async function (friendId) {
  const friend = await mongoose
    .model("User")
    .findOne({ userId: friendId })
    .select("_id");
  if (!friend) {
    throw new ApiError(404, "Friend not found");
  }
  this.friends = this.friends.filter(
    (id) => id.toString() !== friend._id.toString()
  );
  friend.friends = friend.friends.filter(
    (id) => id.toString() !== this._id.toString()
  );
  await friend.save();
  await this.save();
  return this;
};

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      id: this._id,
      userId: this.userId,
      email: this.email,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

export const User = mongoose.model("User", userSchema);
