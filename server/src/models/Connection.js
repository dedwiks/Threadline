import mongoose from "mongoose";

const sharePermissionsSchema = new mongoose.Schema(
  {
    email: { type: Boolean, default: false },
    linkedin: { type: Boolean, default: false },
    instagram: { type: Boolean, default: false },
    twitter: { type: Boolean, default: false },
  },
  { _id: false },
);

const participantSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    response: { type: String, enum: ["pending", "accepted", "declined"], default: "pending" },
    respondedAt: Date,
    sharePermissions: { type: sharePermissionsSchema, default: () => ({}) },
  },
  { _id: false },
);

const connectionSchema = new mongoose.Schema({
  participants: {
    type: [participantSchema],
    validate: { validator: (v) => v.length === 2, message: "A connection needs exactly 2 participants" },
  },
  source: { type: String, enum: ["direct_request", "introduction"], required: true },
  initiatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  introducedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  note: { type: String, default: "" },
  status: { type: String, enum: ["pending", "accepted", "declined"], default: "pending" },
  createdAt: { type: Date, default: Date.now },
});

connectionSchema.index({ "participants.userId": 1 });

connectionSchema.methods.recomputeStatus = function recomputeStatus() {
  if (this.participants.some((p) => p.response === "declined")) {
    this.status = "declined";
  } else if (this.participants.every((p) => p.response === "accepted")) {
    this.status = "accepted";
  } else {
    this.status = "pending";
  }
  return this.status;
};

export default mongoose.model("Connection", connectionSchema);
