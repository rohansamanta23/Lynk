import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import { faker } from "@faker-js/faker";
import { User } from "../models/user.models.js";
import { connectDB } from "../db/index.db.js";

dotenv.config();

const seedUsers = async () => {
  try {
    await connectDB();
    // await User.deleteMany({});
    const users = [];
    const rawPassword = "111111";
    for (let i = 0; i < 40; i++) {
        let email, userId,name;
        do {
          name = faker.person.fullName();
          userId = faker.internet.userName({ firstName: name }).toLowerCase();
          email = faker.internet.email({ firstName: name }).toLowerCase();
        } while (users.some(user => user.email === email || user.userId === userId));
      const password = await bcrypt.hash(rawPassword, 10);
      users.push({ name, userId, email, password });
    }

    await User.insertMany(users);
    console.log("Users seeded successfully");
  } catch (error) {
    console.error("Error seeding users:", error);
  } finally {
    mongoose.connection.close();
  }
};

seedUsers();