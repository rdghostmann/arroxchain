// /controllers/returnWithdraws.js
"use server";

import { connectToDB } from "@/lib/connectDB";
import ExternalWithdraw from "@/models/ExternalWithdraw";
import InternalWithdraw from "@/models/InternalWithdraw";

export async function getWithdrawals() {
  try {
    await connectToDB();

    const [internalWithdrawals, externalWithdrawals] = await Promise.all([
      InternalWithdraw.find().sort({ createdAt: -1 }).lean(),
      ExternalWithdraw.find().sort({ createdAt: -1 }).lean(),
    ]);

    return {
      success: true,
      withdrawals: {
        internal: internalWithdrawals,
        external: externalWithdrawals,
      },
    };

  } catch (error) {
    console.error("Withdraw fetch error:", error);

    return {
      success: false,
      withdrawals: {
        internal: [],
        external: [],
      },
      message: "Failed to fetch withdrawals",
    };
  }
}