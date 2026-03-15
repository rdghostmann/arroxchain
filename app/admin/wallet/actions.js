"use server";

import { connectToDB } from "@/lib/connectDB";
import User from "@/models/User";
import UserAsset from "@/models/UserAsset";
import mongoose from "mongoose";

// ─────────────────────────────────────────────────────────────
// ACTION 1: Fetch all role:"user" accounts with their assets
// ─────────────────────────────────────────────────────────────
export async function getWalletUsers() {
  try {
    await connectToDB();

    const users = await User.find({ role: "user" })
      .populate({ path: "assets", model: "UserAsset" })
      .lean();

    return users.map((user) => ({
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
  } catch (error) {
    console.error("❌ getWalletUsers failed:", error.message);
    return [];
  }
}

// ─────────────────────────────────────────────────────────────
// ACTION 2: Update a user's assets
// ─────────────────────────────────────────────────────────────
export async function updateUserAssets(userId, assets) {
  try {
    await connectToDB();

    if (!userId || !Array.isArray(assets)) {
      return { success: false, error: "Invalid userId or assets payload" };
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return { success: false, error: "Invalid userId format" };
    }

    const user = await User.findById(userId);
    if (!user) return { success: false, error: "User not found" };

    const newAssetIds = [];

    for (const { coin, network, amount } of assets) {
      if (!coin || !network || amount === undefined || amount === null) {
        return { success: false, error: `Invalid entry — coin: ${coin}, network: ${network}` };
      }

      const parsedAmount = parseFloat(amount);
      if (isNaN(parsedAmount) || parsedAmount < 0) {
        return { success: false, error: `Invalid amount for ${coin} (${network}): ${amount}` };
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

    // Return fresh data
    const updatedUser = await User.findById(userId)
      .populate({ path: "assets", model: "UserAsset" })
      .lean();

    return {
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
    };
  } catch (error) {
    console.error("❌ updateUserAssets failed:", error.message);
    return { success: false, error: error.message || "Update failed" };
  }
}