import mongoose from "mongoose";

const manualLinkSchema = new mongoose.Schema({
  ownerUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  contactAId: { type: mongoose.Schema.Types.ObjectId, ref: "Contact", required: true },
  contactBId: { type: mongoose.Schema.Types.ObjectId, ref: "Contact", required: true },
  note: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
});

manualLinkSchema.index({ ownerUserId: 1, contactAId: 1, contactBId: 1 }, { unique: true });

export default mongoose.model("ManualLink", manualLinkSchema);
