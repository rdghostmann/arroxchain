// controllers/saveWithdrawals.js
"use server";


import { connectToDB } from "@/lib/connectDB";
import ExternalWithdraw from "@/models/ExternalWithdraw";
import InternalWithdraw from "@/models/InternalWithdraw";

export async function saveWithdrawal(withdrawalData) {
  await connectToDB();

  let savedWithdrawal;

  try {
    if (withdrawalData.type === "internal") {
      savedWithdrawal = await InternalWithdraw.create({
        asset: withdrawalData.asset,
        amount: withdrawalData.amount,
        walletId: withdrawalData.walletId,
        externalWalletAddress: withdrawalData.externalWalletAddress || null,
        status: "pending",
      });
    } else if (withdrawalData.type === "external") {
      savedWithdrawal = await ExternalWithdraw.create({
        asset: withdrawalData.asset,
        network: withdrawalData.network,
        amount: withdrawalData.amount,
        walletAddress: withdrawalData.walletAddress,
        networkFee: withdrawalData.networkFee,
        status: "pending",
      });
    } else {
      throw new Error("Invalid withdrawal type");
    }

    return savedWithdrawal;
  } catch (err) {
    console.error("Failed to save withdrawal:", err);
    throw new Error("Could not save withdrawal. Please try again.");
  }
}