// controllers/getUsersandAssests.js
import User from "@/models/User"
import { connectToDB } from "@/lib/connectDB"

export async function getUsersWithAssets(search = "") {
  await connectToDB()
  const query = search
    ? {
      $or: [
        { username: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ],
    }
    : {}

  const users = await User.find(query)
    .populate("assets")
    .lean()

  return users.map(user => ({
    id: user._id.toString(),
    name: user.username || user.email?.split("@")[0] || "Unknown",
    email: user.email,
    avatar: user.avatar,
    // ✅ Fix — return full asset objects as array
    assets: Array.isArray(user.assets)
      ? user.assets.map((asset) => ({
        id: asset._id?.toString(),
        coin: asset.coin,
        network: asset.network,
        amount: asset.amount,
      }))
      : [],
    lastActive: user.lastLogin ? user.lastLogin.toISOString().slice(0, 10) : "",
  }))
}
