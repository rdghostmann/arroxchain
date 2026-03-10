// app/api/saveWithdrawal/route.js

import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/connectDB";
import InternalWithdraw from "@/models/InternalWithdraw";
import ExternalWithdraw from "@/models/ExternalWithdraw";


export async function POST(req) {
  try {
    const withdrawalData = await req.json();

    // Log the incoming withdrawal data
    console.log("[saveWithdrawal] Received withdrawal data:", withdrawalData);

    await connectToDB();

    let savedWithdrawal;

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
      return NextResponse.json(
        { error: "Invalid withdrawal type" },
        { status: 400 }
      );
    }

    console.log("[saveWithdrawal] Saved withdrawal:", savedWithdrawal);

    return NextResponse.json(savedWithdrawal, { status: 201 });

  } catch (err) {
    console.error("[saveWithdrawal] Failed to save withdrawal:", err);
    return NextResponse.json(
      { error: "Could not save withdrawal. Please try again." },
      { status: 500 }
    );
  }
}