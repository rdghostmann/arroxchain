import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { connectToDB } from "@/lib/connectDB";
import User from "@/models/User";
import UserAsset from "@/models/UserAsset";
import mongoose from "mongoose";

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "admin" && session.user.role !== "superAdmin") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await connectToDB();

    const { userId, assets } = await request.json();

    if (!userId || !Array.isArray(assets)) {
      return NextResponse.json(
        { success: false, error: "Invalid userId or assets payload" },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json(
        { success: false, error: "Invalid userId format" },
        { status: 400 }
      );
    }

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    const newAssetIds = [];

    for (const { coin, network, amount } of assets) {
      if (!coin || !network || amount === undefined || amount === null) {
        return NextResponse.json(
          { success: false, error: `Invalid entry — coin: ${coin}, network: ${network}` },
          { status: 400 }
        );
      }

      const parsedAmount = parseFloat(amount);
      if (isNaN(parsedAmount) || parsedAmount < 0) {
        return NextResponse.json(
          { success: false, error: `Invalid amount for ${coin} (${network}): ${amount}` },
          { status: 400 }
        );
      }

      let asset = await UserAsset.findOne({
        user: new mongoose.Types.ObjectId(userId),
        coin,
        network,
      });

      if (asset) {
        asset = await UserAsset.findByIdAndUpdate(
          asset._id,
          { $set: { amount: parsedAmount } },
          { new: true }
        );
      } else {
        asset = await UserAsset.create({
          user: user._id,
          coin,
          network,
          amount: parsedAmount,
        });
      }

      newAssetIds.push(asset._id);
    }

    // Sync user.assets ref array
    await User.findByIdAndUpdate(
      userId,
      { $set: { assets: newAssetIds } },
      { new: true }
    );

    // Return fresh populated user
    const updatedUser = await User.findById(userId)
      .populate({ path: "assets", model: "UserAsset" })
      .lean();

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser._id.toString(),
        name: updatedUser.username || updatedUser.email?.split("@")[0] || "Unknown",
        email: updatedUser.email ?? "",
        avatar: updatedUser.avatar ?? "",
        assets: updatedUser.assets.map((a) => ({
          id: a._id?.toString(),
          coin: a.coin,
          network: a.network,
          amount: a.amount,
        })),
        lastActive: updatedUser.lastLogin
          ? new Date(updatedUser.lastLogin).toISOString().slice(0, 10)
          : "",
      },
    });
  } catch (error) {
    console.error("❌ POST /api/admin/wallet/update-assets:", error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}