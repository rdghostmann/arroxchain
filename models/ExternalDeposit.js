import mongoose from "mongoose";

const ExternalDepositSchema = new mongoose.Schema(
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

    token: {
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

    txHash: {
      type: String,
      default: null,
    },

    confirmations: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ["pending", "confirmed", "failed"],
      default: "pending",
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },

    confirmedAt: {
      type: Date,
      default: null,
    },
  },
  { versionKey: false }
);

export default mongoose.models.ExternalDeposit ||
  mongoose.model("ExternalDeposit", ExternalDepositSchema);