import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/connectDB";
import User from "@/models/User";

export async function POST(req) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User ID is required" },
        { status: 400 }
      );
    }

    await connectToDB();

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Guard: prevent deleting a superAdmin
    if (user.role === "superadmin") {
    // if (user.role === "superAdmin") {
      return NextResponse.json(
        { success: false, message: "Cannot delete a superAdmin account" },
        { status: 403 }
      );
    }

    user.status = "deleted";
    await user.save();

    return NextResponse.json({ success: true, message: "User marked as deleted" });
  } catch (error) {
    console.error("API delete-user error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}