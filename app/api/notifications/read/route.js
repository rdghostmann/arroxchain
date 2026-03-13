import { NextResponse } from "next/server";
import Notification from "@/models/Notification";
import { connectToDB } from "@/lib/connectDB";

export async function POST(req) {

  const { id } = await req.json();

  await connectToDB();

  await Notification.findByIdAndUpdate(id, {
    isRead: true
  });

  return NextResponse.json({ success: true });

}