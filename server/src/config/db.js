import mongoose from "mongoose";
import dns from "node:dns";

// Use Google DNS for MongoDB Atlas SRV lookup
dns.setServers(["8.8.8.8", "8.8.4.4"]);

export async function connectDB() {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is missing");
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI);

    console.log(`MongoDB connected: ${mongoose.connection.host}`);
  } catch (error) {
    console.error("MongoDB Connection Failed:", error.message);
    throw error;
  }
}
