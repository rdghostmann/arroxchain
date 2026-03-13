// app/api/admin/customers/route.js

import { NextResponse } from "next/server";
import { getAllcustomer } from "@/controllers/getAllcustomer";

export async function GET() {
  try {
    const users = await getAllcustomer();
    return NextResponse.json({ customers: users });
  } catch (err) {
    console.error("[GET /api/admin/customers] Error:", err);
    return NextResponse.json(
      { customers: [], error: "Failed to fetch customers" },
      { status: 500 }
    );
  }
}