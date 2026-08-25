import mongoose from "mongoose";

const contactSchema = new mongoose.Schema({
  ownerUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  name: { type: String, required: true, trim: true },
  email: { type: String, lowercase: true, trim: true, default: "" },
  phone: { type: String, trim: true, default: "" },
  linkedin: { type: String, trim: true, default: "" },
  instagram: { type: String, trim: true, default: "" },
  twitter: { type: String, trim: true, default: "" },
  profession: { type: String, trim: true, default: "" },
  company: { type: String, trim: true, default: "" },
  location: {
    text: { type: String, trim: true, default: "" },
    lat: Number,
    lng: Number,
  },
  tags: [{ type: String, trim: true }],
  howWeMet: { type: String, default: "" },
  metDate: Date,
  notes: { type: String, default: "" },
  matchedUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null, index: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

contactSchema.index({ ownerUserId: 1, email: 1 });
contactSchema.index({ ownerUserId: 1, linkedin: 1 });

export default mongoose.model("Contact", contactSchema);
