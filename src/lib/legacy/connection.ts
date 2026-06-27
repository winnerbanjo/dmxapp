import mongoose, { type Connection } from "mongoose";

const LEGACY_MONGO_URI = process.env.LEGACY_MONGO_URI;

interface LegacyMongooseCache {
  conn: Connection | null;
  promise: Promise<Connection | null> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var legacyMongoose: LegacyMongooseCache | undefined;
}

const cached: LegacyMongooseCache =
  global.legacyMongoose ?? { conn: null, promise: null };

if (!global.legacyMongoose) {
  global.legacyMongoose = cached;
}

export async function connectLegacyDB(): Promise<Connection | null> {
  if (cached.conn) return cached.conn;
  if (!LEGACY_MONGO_URI) return null;

  if (!cached.promise) {
    cached.promise = mongoose
      .createConnection(LEGACY_MONGO_URI, {
        serverSelectionTimeoutMS: 10_000,
        bufferCommands: false,
      })
      .asPromise();
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    cached.promise = null;
    throw error;
  }
}

