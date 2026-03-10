// models/Notification.js
import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["deposit", "withdrawal", "transfer", "security", "system", "promotion"],
      default: "system",
    },
    status: {
      type: String,
      enum: ["unread", "read"],
      default: "unread",
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
      default: null,
    },
    link: {
      type: String,
      default: "",
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Mark a notification as read
NotificationSchema.methods.markAsRead = function () {
  this.isRead = true;
  this.status = "read";
  this.readAt = new Date();
  return this.save();
};

// Get all unread notifications for a user
NotificationSchema.statics.getUnreadByUser = function (userId) {
  return this.find({ user: userId, isRead: false }).sort({ createdAt: -1 });
};

// Mark all notifications as read for a user
NotificationSchema.statics.markAllReadByUser = function (userId) {
  return this.updateMany(
    { user: userId, isRead: false },
    { $set: { isRead: true, status: "read", readAt: new Date() } }
  );
};

const Notification =
  mongoose.models.Notification ||
  mongoose.model("Notification", NotificationSchema);

export default Notification;