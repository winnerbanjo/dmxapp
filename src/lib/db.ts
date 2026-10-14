/**
 * DMX Logistics – Mongoose connection singleton.
 * Connects to MongoDB Atlas using MONGODB_URI.
 */
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    "Please define MONGO_URI or MONGODB_URI in your environment. Example: mongodb+srv://user:pass@cluster.mongodb.net/dmx"
  );
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

let cached: MongooseCache = { conn: null, promise: null };

export async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    if (!MONGODB_URI) throw new Error("MONGODB_URI is required");
    cached.promise = mongoose.connect(MONGODB_URI, {
      dbName: process.env.MONGODB_DB ?? "dmx",
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}
