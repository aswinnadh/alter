import mongoose, { Mongoose } from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI; // Ensure this is correctly set

interface MongooseConnection {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
}

// Correctly type global caching without using `var` or `any`
const globalCache: { mongoose?: MongooseConnection } = globalThis as unknown as {
  mongoose?: MongooseConnection;
};

// Ensure `cached` is properly assigned and re-assigned
const cached: MongooseConnection = globalCache.mongoose ?? { conn: null, promise: null };

if (!globalCache.mongoose) {
  globalCache.mongoose = cached;
}

export const connectToDatabase = async (): Promise<Mongoose> => {
  if (cached.conn) return cached.conn;

  if (!MONGODB_URI) throw new Error("Missing MONGODB_URI");

  cached.promise ??= mongoose.connect(MONGODB_URI, {
    dbName: "imaginify",
    bufferCommands: false,
  });

  cached.conn = await cached.promise;

  return cached.conn;
};
