import mongoose from "mongoose";

const InternalDepositSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    type: {
      type: String,
      default: "internal",
      enum: ["internal"],
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

    walletId: {
      type: String,
      required: true,
    },

    transactionPin: {
      type: String,
      default: null,
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
      default: null,
    },
  },
  { versionKey: false }
);

export default mongoose.models.InternalDeposit ||
  mongoose.model("InternalDeposit", InternalDepositSchema);