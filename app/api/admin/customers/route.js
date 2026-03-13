// app/api/admin/customers/route.js

import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/connectDB";
import User from "@/models/User";

export async function GET() {
  try {
    await connectToDB();

    const users = await User.find({})
      .populate({ path: "wallets", model: "Wallet" })
      .populate({ path: "assets", model: "UserAsset" })
      .lean();

    const customers = users.map((user) => ({
      id: user._id.toString(),
      userID: user.userID,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone ?? "N/A",
      country: user.country ?? "",
      state: user.state ?? "",
      zipCode: user.zipCode ?? "",
      role: user.role,
      status: user.status,
      isActive: user.status === "active",
      walletID: user.walletID,
      kycStatus: user.kycStatus ?? "pending",
      balance: user.balance,
      joinDate: user.createdAt?.toISOString().split("T")[0] ?? "",
      lastLogin: user.lastLogin
        ? new Date(user.lastLogin).toISOString().split("T")[0]
        : "N/A",
      accountType: user.accountType,
      avatar: user.avatar ?? "/placeholder.svg",
      wallets: Array.isArray(user.wallets)
        ? user.wallets.map((wallet) => ({
            id: wallet._id?.toString(),
            walletAddress: wallet.walletAddress,
            network: wallet.network,
            createdAt: wallet.createdAt,
          }))
        : [],
      assets: Array.isArray(user.assets)
        ? user.assets.map((asset) => ({
            id: asset._id?.toString(),
            coin: asset.coin,
            network: asset.network,
            amount: asset.amount,
            createdAt: asset.createdAt,
          }))
        : [],
    }));

    return NextResponse.json({ customers });
  } catch (err) {
    console.error("[GET /api/admin/customers] Error:", err);
    return NextResponse.json(
      { customers: [], error: "Failed to fetch customers" },
      { status: 500 }
    );
  }
}