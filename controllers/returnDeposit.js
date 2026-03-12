// controllers/returnDeposit.js
"use server";

import { connectToDB } from "@/lib/connectDB";
import InternalDeposit from "@/models/InternalDeposit";
import ExternalDeposit from "@/models/ExternalDeposit";

export async function getDeposits(userId) {
  if (!userId) {
    return {
      success: false,
      deposits: { internal: [], external: [] },
      message: "User ID is required",
    };
  }

  try {
    await connectToDB();

    const [internalDeposits, externalDeposits] = await Promise.all([
      InternalDeposit.find({ userId }).sort({ createdAt: -1 }).lean(),
      ExternalDeposit.find({ userId }).sort({ createdAt: -1 }).lean(),
    ]);

    return {
      success: true,
      deposits: {
        internal: internalDeposits,
        external: externalDeposits,
      },
    };

  } catch (error) {
    console.error("[getDeposits] Fetch error:", error);

    return {
      success: false,
      deposits: { internal: [], external: [] },
      message: "Failed to fetch deposits",
    };
  }
}