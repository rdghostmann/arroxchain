// app/api/admin/customers/route.js

import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/connectDB";
import User from "@/models/User";

export async function GET() {
  try {
    await connectToDB();

    // Fetch all users regardless of status so the admin can see
    // every account including suspended/inactive ones.
    // Deleted users are excluded — they are soft-deleted and
    // should not appear in the management UI at all.
    const users = await User.find({ status: { $ne: "deleted" } })
      .populate({ path: "wallets", model: "Wallet" })
      .populate({ path: "assets", model: "UserAsset" })
      .sort({ createdAt: -1 }) // newest first
      .lean();

    const customers = users.map((user) => ({
      id: user._id.toString(),
      userID: user.userID ?? "",
      username: user.username ?? "",
      firstName: user.firstName ?? "",
      lastName: user.lastName ?? "",
      email: user.email ?? "",
      phone: user.phone || "N/A",
      country: user.country ?? "",
      state: user.state ?? "",
      zipCode: user.zipCode ?? "",
      role: user.role ?? "user",
      status: user.status ?? "inactive",
      isActive: user.status === "active",
      walletID: user.walletID ?? "",
      kycStatus: user.kycStatus ?? "pending",
      balance: user.balance ?? 0,
      accountType: user.accountType ?? "personal",
      avatar: user.avatar || "/placeholder.svg",
      joinDate: user.createdAt
        ? new Date(user.createdAt).toISOString().split("T")[0]
        : "",
      lastLogin: user.lastLogin
        ? new Date(user.lastLogin).toISOString().split("T")[0]
        : "N/A",
      wallets: Array.isArray(user.wallets)
        ? user.wallets.map((wallet) => ({
            id: wallet._id?.toString() ?? "",
            walletAddress: wallet.walletAddress ?? "",
            network: wallet.network ?? "",
            createdAt: wallet.createdAt ?? null,
          }))
        : [],
      assets: Array.isArray(user.assets)
        ? user.assets.map((asset) => ({
            id: asset._id?.toString() ?? "",
            coin: asset.coin ?? "",
            network: asset.network ?? "",
            amount: asset.amount ?? 0,
            createdAt: asset.createdAt ?? null,
          }))
        : [],
    }));

    return NextResponse.json({ customers, total: customers.length });
  } catch (err) {
    console.error("[GET /api/admin/customers] Error:", err);
    return NextResponse.json(
      { customers: [], total: 0, error: "Failed to fetch customers" },
      { status: 500 }
    );
  }
}