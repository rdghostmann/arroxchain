import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import Notification from "@/models/Notification";
import { connectToDB } from "@/lib/connectDB";

export async function GET() {

  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ success: false }, { status: 401 });
  }

  await connectToDB();

  const notifications = await Notification
    .find({ userId: session.user.id })
    .sort({ createdAt: -1 })
    .limit(10);

  return NextResponse.json({
    success: true,
    notifications
  });

}