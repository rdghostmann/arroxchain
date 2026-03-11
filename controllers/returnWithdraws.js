// controllers/returnWithdraws.js
"use server";

import { connectToDB } from "@/lib/connectDB";
import ExternalWithdraw from "@/models/ExternalWithdraw";
import InternalWithdraw from "@/models/InternalWithdraw";

export async function getWithdrawals(userId) {
  if (!userId) {
    return {
      success: false,
      withdrawals: { internal: [], external: [] },
      message: "User ID is required",
    };
  }

  try {
    await connectToDB();

    const [internalWithdrawals, externalWithdrawals] = await Promise.all([
      InternalWithdraw.find({ user: userId }).sort({ createdAt: -1 }).lean(),
      ExternalWithdraw.find({ user: userId }).sort({ createdAt: -1 }).lean(),
    ]);

    return {
      success: true,
      withdrawals: {
        internal: internalWithdrawals,
        external: externalWithdrawals,
      },
    };

  } catch (error) {
    console.error("[getWithdrawals] Fetch error:", error);
    return {
      success: false,
      withdrawals: { internal: [], external: [] },
      message: "Failed to fetch withdrawals",
    };
  }
}