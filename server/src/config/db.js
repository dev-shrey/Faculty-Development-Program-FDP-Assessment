import mongoose from "mongoose";

export async function connectDB() {
  const uri = process.env.MONGODB_URI?.trim();

  if (!uri) {
    throw new Error("MONGODB_URI is not configured");
  }
  if (!/^mongodb(?:\+srv)?:\/\//i.test(uri)) {
    throw new Error('MONGODB_URI must start with "mongodb://" or "mongodb+srv://"');
  }

  await mongoose.connect(uri);

  console.log("MongoDB connected successfully");
}
