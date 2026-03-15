// controllers/updateUserAssets.js
"use server"
import { connectToDB } from "@/lib/connectDB";
import User from "@/models/User";
import UserAsset from "@/models/UserAsset";
import Transaction from "@/models/Transaction";
import mongoose from "mongoose";

export async function updateUserAssets(userId, assets) {
  await connectToDB();

  if (!Array.isArray(assets)) {
    throw new Error("Invalid assets data");
  }

  // ✅ Do NOT populate here — we only need the raw user document
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  const newAssetIds = [];

  for (const { coin, network, amount } of assets) {
    if (!coin || !network || amount === undefined || amount === null) continue;

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount < 0) continue;

    // ✅ Use new mongoose.Types.ObjectId(userId) to ensure correct type match
    let asset = await UserAsset.findOne({
      user: new mongoose.Types.ObjectId(userId),
      coin,
      network,
    });

    if (asset) {
      if (parsedAmount > asset.amount) {
        const addedAmount = parsedAmount - asset.amount;
        await Transaction.create({
          userId: user._id,
          type: "deposit",
          amount: addedAmount,
          coin,
          network,
          status: "confirmed",
        });
      }

      asset.amount = parsedAmount;
      await asset.save(); // ✅ Persist updated amount
    } else {
      // ✅ Create new UserAsset document
      asset = await UserAsset.create({
        user: user._id,
        coin,
        network,
        amount: parsedAmount,
      });

      await Transaction.create({
        userId: user._id,
        type: "deposit",
        amount: parsedAmount,
        coin,
        network,
        status: "confirmed",
      });
    }

    newAssetIds.push(asset._id);
  }

  // ✅ Use $set with the plain ObjectId array — avoid Mongoose populated-doc confusion
  await User.findByIdAndUpdate(
    userId,
    { $set: { assets: newAssetIds } },
    { new: true }
  );

  // ✅ Fetch fresh data for the response
  const updatedUser = await User.findById(userId).populate("assets").lean();

  return {
    id: updatedUser._id.toString(),
    name: updatedUser.username,
    email: updatedUser.email,
    assets: updatedUser.assets.map((a) => ({
      coin: a.coin,
      network: a.network,
      amount: a.amount,
    })),
  };
}