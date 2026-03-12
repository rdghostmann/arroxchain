// controllers/returnStock.js
"use server";

import { connectToDB } from "@/lib/connectDB";
import UserStock from "@/models/UserStock";

export async function getStocks(userId) {
  if (!userId) {
    return {
      success: false,
      stocks: [],
      message: "User ID is required",
    };
  }

  try {
    await connectToDB();

    const stocks = await UserStock.find({ user: userId })
      .sort({ createdAt: -1 })
      .lean();

    return {
      success: true,
      stocks,
    };

  } catch (error) {
    console.error("[getStocks] Fetch error:", error);

    return {
      success: false,
      stocks: [],
      message: "Failed to fetch stocks",
    };
  }
}