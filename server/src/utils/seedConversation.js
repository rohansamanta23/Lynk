import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import { User } from "../models/user.models.js";
import { Friendship } from "../models/friendship.models.js";
import { Conversation } from "../models/conversation.models.js";
import { connectDB } from "../db/index.db.js";

dotenv.config();

const seedUsers = async () => {
  try {
    await connectDB();
    await User.deleteMany({});
    await Friendship.deleteMany({});
    await Conversation.deleteMany({});

    const users = [
      {
        name: "rohan",
        userId: "rohan45".toLowerCase(),
        email: "rohan@example.com".toLowerCase(),
        password: await bcrypt.hash("111111", 10),
      },
      {
        name: "shadow",
        userId: "shadow23".toLowerCase(),
        email: "shadow@example.com".toLowerCase(),
        password: await bcrypt.hash("111111", 10),
      },
      {
        name: "admin",
        userId: "admin07".toLowerCase(),
        email: "admin@example.com".toLowerCase(),
        password: await bcrypt.hash("111111", 10),
      },
      {
        name: "user",
        userId: "user99".toLowerCase(),
        email: "user@example.com".toLowerCase(),
        password: await bcrypt.hash("111111", 10),
      },
      {
        name: "dragon",
        userId: "dragon10".toLowerCase(),
        email: "dragon@example.com".toLowerCase(),
        password: await bcrypt.hash("111111", 10),
      },
      {
        name: "test",
        userId: "test12".toLowerCase(),
        email: "test@example.com".toLowerCase(),
        password: await bcrypt.hash("111111", 10),
      },
      {
        name: "anu",
        userId: "anu38".toLowerCase(),
        email: "anu@example.com".toLowerCase(),
        password: await bcrypt.hash("111111", 10),
      },
    ];

    await User.insertMany(users);
    const registeredUsers = await User.find({}).select(
      "-password -refreshToken"
    );
    console.log("Registered users:", registeredUsers);
    const friendship = await Friendship.create([
      {
        requester: registeredUsers[1]._id,
        recipient: registeredUsers[0]._id,
        status: "accepted",
      },
      {
        requester: registeredUsers[0]._id,
        recipient: registeredUsers[2]._id,
        status: "accepted",
      },
      {
        requester: registeredUsers[3]._id,
        recipient: registeredUsers[0]._id,
        status: "accepted",
      },
      {
        requester: registeredUsers[4]._id,
        recipient: registeredUsers[0]._id,
        status: "accepted",
      },
      {
        requester: registeredUsers[5]._id,
        recipient: registeredUsers[0]._id,
        status: "pending",
      },
      {
        requester: registeredUsers[6]._id,
        recipient: registeredUsers[0]._id,
        status: "blocked",
        blockedBy: registeredUsers[0]._id,
      },
    ]);
    console.log(
      "Friendship seeded successfully:",
      friendship.map((f) => ({ id: f._id, status: f.status }))
    );
    console.log(registeredUsers.map((u) => ({ id: u._id, name: u.name })));
  } catch (error) {
    console.error("Error seeding users:", error);
  } finally {
    mongoose.connection.close();
  }
};

seedUsers();
