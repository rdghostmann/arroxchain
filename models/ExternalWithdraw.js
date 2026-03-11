// models/ExternalWithdraw.js
import mongoose from "mongoose";

const ExternalWithdrawSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    type: {
      type: String,
      default: "external",
      enum: ["external"],
      required: true,
    },

    asset: {
      type: String,
      required: true,
    },

    network: {
      type: String,
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 1,
    },

    walletAddress: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },

    completedAt: {
      type: Date,
    },
  },
  { versionKey: false }
);

export default mongoose.models.ExternalWithdraw ||
  mongoose.model("ExternalWithdraw", ExternalWithdrawSchema);