import { NextResponse } from "next/server";
import { getUsersWithAssets } from "@/controllers/getUsersandAssets";

export async function GET() {
  try {
    const users = await getUsersWithAssets();
    return NextResponse.json({ success: true, users });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}