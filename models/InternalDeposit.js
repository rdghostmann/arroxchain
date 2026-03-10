import mongoose from "mongoose";

const InternalDepositSchema = new mongoose.Schema(
  {
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
      min: 0,
    },

    senderWalletID: {
      type: String,
      required: true,
      match: /^ARR-\d{6}$/,
    },

    receiverWalletAddress: {
      type: String,
      required: true,
    },

    transactionPin: {
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
      default: null,
    },
  },
  { versionKey: false }
);

export default mongoose.models.InternalDeposit ||
  mongoose.model("InternalDeposit", InternalDepositSchema);