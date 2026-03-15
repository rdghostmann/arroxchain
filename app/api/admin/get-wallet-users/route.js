import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { connectToDB } from "@/lib/connectDB";
import User from "@/models/User";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "admin" && session.user.role !== "superAdmin") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await connectToDB();

    const users = await User.find({ role: "user" })
      .populate({ path: "assets", model: "UserAsset" })
      .lean();

    const mapped = users.map((user) => ({
      id: user._id.toString(),
      name: user.username || user.email?.split("@")[0] || "Unknown",
      email: user.email ?? "",
      avatar: user.avatar ?? "",
      assets: Array.isArray(user.assets)
        ? user.assets.map((asset) => ({
            id: asset._id?.toString(),
            coin: asset.coin,
            network: asset.network,
            amount: asset.amount,
          }))
        : [],
      lastActive: user.lastLogin
        ? new Date(user.lastLogin).toISOString().slice(0, 10)
        : "",
    }));

    return NextResponse.json({ success: true, users: mapped });
  } catch (error) {
    console.error("❌ GET /api/admin/wallet/users:", error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}