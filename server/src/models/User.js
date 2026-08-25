import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  username: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  googleId: { type: String, required: true, unique: true, index: true },
  avatarUrl: String,
  socialLinks: {
    linkedin: { type: String, trim: true, default: "" },
    instagram: { type: String, trim: true, default: "" },
    twitter: { type: String, trim: true, default: "" },
  },
  discoverable: { type: Boolean, default: true },
  onboarded: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("User", userSchema);
