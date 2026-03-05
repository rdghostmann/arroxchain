import mongoose from "mongoose";

const InternalWithdrawSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      default: "internal",
      enum: ["internal"],
      required: true,
    },
    asset: {
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
      match: /^ARR-\d{5,}$/,
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

export default mongoose.models.InternalWithdraw ||
  mongoose.model("InternalWithdraw", InternalWithdrawSchema);