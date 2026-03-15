// app/api/admin/update-assets/route.js
import { NextResponse } from "next/server";
import { updateUserAssets } from "@/controllers/updateUserAssets";

export async function POST(request) {
  try {
    const { userId, assets } = await request.json();

    if (!userId || !Array.isArray(assets)) {
      return NextResponse.json(
        { success: false, error: "Missing or invalid userId or assets" },
        { status: 400 }
      );
    }

    const updatedUser = await updateUserAssets(userId, assets);

    // ✅ Flat, unambiguous response — no nested { success, data: { success } }
    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error("❌ /api/admin/update-assets error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Unknown server error" },
      { status: 500 }
    );
  }
}