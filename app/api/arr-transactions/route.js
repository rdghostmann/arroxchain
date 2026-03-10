// api/arr-transactions/route.js

import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/connectDB";
import Deposit from "@/models/Deposit";
import ExternalWithdraw from "@/models/ExternalWithdraw";
import InternalWithdraw from "@/models/InternalWithdraw";

export async function GET() {
  try {
    await connectToDB();

    const deposits = await Deposit.find({})
      .sort({ createdAt: -1 })
      .lean();

    const externalWithdrawals = await ExternalWithdraw.find({})
      .sort({ createdAt: -1 })
      .lean();

    const internalWithdrawals = await InternalWithdraw.find({})
      .sort({ createdAt: -1 })
      .lean();

    /* Normalize withdrawals so UI receives same structure */
    const withdrawals = [
      ...externalWithdrawals.map((w) => ({
        _id: w._id,
        amount: w.amount,
        coin: w.asset,
        transactionId: w.walletAddress,
        status: w.status,
        createdAt: w.createdAt,
        type: "external",
      })),
      ...internalWithdrawals.map((w) => ({
        _id: w._id,
        amount: w.amount,
        coin: w.asset,
        transactionId: w.walletId,
        status: w.status,
        createdAt: w.createdAt,
        type: "internal",
      })),
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return NextResponse.json({
      success: true,
      deposits: deposits.map((d) => ({
        _id: d._id,
        amount: d.amount,
        coin: d.asset,
        transactionId: d.transactionHash,
        status: d.status,
        createdAt: d.createdAt,
      })),
      withdrawals,
    });

  } catch (error) {
    console.error("Transactions API error:", error);

    return NextResponse.json(
      { success: false, error: "Failed to fetch transactions" },
      { status: 500 }
    );
  }
}