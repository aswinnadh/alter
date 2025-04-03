import { Schema, model, models, Document, Types } from "mongoose";

export interface ITransaction extends Document {
  createdAt?: Date;
  stripeId: string;
  amount: number;
  plan?: string;
  credits?: number;
  buyer?: Types.ObjectId;
}

// Define the Mongoose Schema
const TransactionSchema = new Schema<ITransaction>({
  createdAt: {
    type: Date,
    default: Date.now,
  },
  stripeId: {
    type: String,
    required: true,
    unique: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  plan: {
    type: String,
  },
  credits: {
    type: Number,
  },
  buyer: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
});

// Create the Mongoose model
const Transaction = models?.Transaction || model<ITransaction>("Transaction", TransactionSchema);

export default Transaction;
