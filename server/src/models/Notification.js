import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  recipientUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  type: { type: String, required: true },
  message: { type: String, required: true },
  relatedUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  relatedContactId: { type: mongoose.Schema.Types.ObjectId, ref: "Contact" },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Notification", notificationSchema);
