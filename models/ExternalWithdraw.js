import mongoose from "mongoose";

const ExternalWithdrawSchema = new mongoose.Schema(
  {
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
    networkFee: {
      type: Number,
      required: true,
      min: 0,
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