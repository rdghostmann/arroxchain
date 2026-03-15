"use server";

import { connectToDB } from "@/lib/connectDB";
import User from "@/models/User";
import UserAsset from "@/models/UserAsset";
import Transaction from "@/models/Transaction";
import mongoose from "mongoose";

// ─────────────────────────────────────────────────────────────
// ACTION 1: Fetch all users with role "user" and their assets
// ─────────────────────────────────────────────────────────────
export async function getWalletUsers() {
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
}

// ─────────────────────────────────────────────────────────────
// ACTION 2: Update a user's assets (transactional)
// ─────────────────────────────────────────────────────────────
export async function updateUserAssets(userId, assets) {
  await connectToDB();

  if (!userId || !Array.isArray(assets)) {
    return { success: false, error: "Invalid userId or assets payload" };
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const user = await User.findById(userId).session(session);
    if (!user) throw new Error("User not found");

    const newAssetIds = [];

    for (const { coin, network, amount } of assets) {
      // Validate each asset entry
      if (!coin || !network || amount === undefined || amount === null) {
        throw new Error(`Invalid entry — coin: ${coin}, network: ${network}`);
      }

      const parsedAmount = parseFloat(amount);
      if (isNaN(parsedAmount) || parsedAmount < 0) {
        throw new Error(`Invalid amount for ${coin} (${network}): ${amount}`);
      }

      let asset = await UserAsset.findOne({
        user: new mongoose.Types.ObjectId(userId),
        coin,
        network,
      }).session(session);

      if (asset) {
        // Create a deposit transaction only if amount increased
        if (parsedAmount > asset.amount) {
          await Transaction.create(
            [{
              userId: user._id,
              type: "deposit",
              amount: parsedAmount - asset.amount,
              coin,
              network,
              status: "confirmed",
            }],
            { session }
          );
        }
        asset.amount = parsedAmount;
        await asset.save({ session });
      } else {
        // Brand new asset — create document + transaction
        const [newAsset] = await UserAsset.create(
          [{ user: user._id, coin, network, amount: parsedAmount }],
          { session }
        );
        await Transaction.create(
          [{
            userId: user._id,
            type: "deposit",
            amount: parsedAmount,
            coin,
            network,
            status: "confirmed",
          }],
          { session }
        );
        asset = newAsset;
      }

      newAssetIds.push(asset._id);
    }

    // Sync user.assets ref array atomically
    await User.findByIdAndUpdate(
      userId,
      { $set: { assets: newAssetIds } },
      { new: true, session }
    );

    await session.commitTransaction();

    // Read fresh data AFTER commit
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
    await session.abortTransaction();
    console.error("❌ updateUserAssets aborted:", error.message);
    return { success: false, error: error.message || "Transaction failed" };
  } finally {
    session.endSession();
  }
}