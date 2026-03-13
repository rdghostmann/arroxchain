import Notification from "@/models/Notification";
import { connectToDB } from "@/lib/connectDB";

export async function createNotification({
    userId,
    title,
    message,
    type,
    link
}) {

    await connectToDB();

    return Notification.create({
        userId,
        title,
        message,
        type,
        link
    });

}