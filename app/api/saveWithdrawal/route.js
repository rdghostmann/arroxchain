// app/api/saveWithdrawal/route.js

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import InternalWithdraw from "@/models/InternalWithdraw";
import ExternalWithdraw from "@/models/ExternalWithdraw";
import { authOptions } from "@/auth";
import { connectToDB } from "@/lib/connectDB";

export async function POST(req) {
  try {
    // ── 1. Auth guard ──────────────────────────────────────
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // ── 2. Parse body ──────────────────────────────────────
    const withdrawalData = await req.json();

    console.log("[saveWithdrawal] userId:", userId);
    console.log("[saveWithdrawal] Received withdrawal data:", withdrawalData);

    // ── 3. DB ──────────────────────────────────────────────
    await connectToDB();

    let savedWithdrawal;

    if (withdrawalData.type === "internal") {
      savedWithdrawal = await InternalWithdraw.create({
        userId,                                                   // ← was missing
        asset: withdrawalData.asset,
        amount: withdrawalData.amount,
        walletId: withdrawalData.walletId,
        externalWalletAddress: withdrawalData.externalWalletAddress || null,
        status: "pending",
      });

    } else if (withdrawalData.type === "external") {
      savedWithdrawal = await ExternalWithdraw.create({
        userId,                                                   // ← was missing
        asset: withdrawalData.asset,
        network: withdrawalData.network,
        amount: withdrawalData.amount,
        walletAddress: withdrawalData.walletAddress,
        networkFee: withdrawalData.networkFee ?? 0,
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

    // Surface Mongoose validation errors clearly in dev
    const message =
      err.name === "ValidationError"
        ? Object.values(err.errors).map((e) => e.message).join(", ")
        : "Could not save withdrawal. Please try again.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}