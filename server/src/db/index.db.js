import mongoose from "mongoose";

const connectDB = async () => {
  console.log("Connecting to MongoDB...");
  try {
    console.log("MongoDB URI:", process.env.MONGODB_URI);
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URI}/Lynk`
    );
    console.log(
      "MongoDB connected successfully:",
      connectionInstance.connection.host
    );
    // await User.deleteMany({});
    // await Friendship.deleteMany({});
  } catch (error) {
    console.log("Error connecting to MongoDB:", error);
    process.exit(1); // Exit the process with failure
  }
};
export { connectDB };