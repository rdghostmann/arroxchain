// app/api/admin/get-customers/route.js
import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/connectDB";
import User from "@/models/User";

export async function GET() {
    try {
        await connectToDB();

        const users = await User.find({})
            .select("-password") // exclude password field
            .sort({ createdAt: -1 })
            .lean();

        // Normalize _id to id for frontend use
        const normalized = users.map(({ _id, ...rest }) => ({
            id: _id.toString(),
            ...rest,
            isActive: rest.status === "active", // ← derive it here
        }));

        return NextResponse.json({ success: true, users: normalized });
    } catch (error) {
        console.error("Failed to fetch users:", error.message);
        return NextResponse.json(
            { success: false, message: error.message || "Failed to fetch users" },
            { status: 500 }
        );
    }
}