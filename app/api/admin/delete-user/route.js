import { connectToDB } from "@/lib/connectDB";
import User from "@/models/User";

export async function POST(req) {
  try {
    const { userId } = await req.json();
    if (!userId) {
      return new Response(JSON.stringify({ success: false, message: "User ID required" }), { status: 400 });
    }
    await connectToDB();
    const user = await User.findById(userId);
    if (!user) {
      return new Response(JSON.stringify({ success: false, message: "User not found" }), { status: 404 });
    }

    // Guard: prevent deleting a superAdmin
    if (user.role === "admin") {
      return NextResponse.json(
        { success: false, message: "Cannot delete a superAdmin account" },
        { status: 403 }
      );
    }

    user.status = "deleted";
    await user.save();
    
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    console.error("Delete user error:", err);
    return new Response(JSON.stringify({ success: false, message: "Server error" }), { status: 500 });
  }
}
