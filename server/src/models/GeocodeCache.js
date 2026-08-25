import mongoose from "mongoose";

const geocodeCacheSchema = new mongoose.Schema({
  queryText: { type: String, required: true, unique: true, index: true },
  lat: Number,
  lng: Number,
  resolvedDisplayName: String,
  fetchedAt: { type: Date, default: Date.now },
});

export default mongoose.model("GeocodeCache", geocodeCacheSchema);
