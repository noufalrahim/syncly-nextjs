import mongoose from "mongoose";

let isConnected = false;

export async function connectDB() {
  if (isConnected) {
    console.log("MongoDB: Already connected");
    return;
  }

  try {
    const db = await mongoose.connect(
      process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017/salon_db",
    );
    isConnected = !!db.connections[0].readyState;

    if (isConnected) console.log("MongoDB: Connection successful");
    else console.log("MongoDB: Connection failed");
  } catch (error) {
    console.error("MongoDB Connection Error:", error);
    throw error;
  }
}
