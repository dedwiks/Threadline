import express from "express";
import { requireAuth } from "../auth/requireAuth.js";
import Contact from "../models/Contact.js";
import { geocode } from "../services/geocode.service.js";

const router = express.Router();

router.use(requireAuth);

router.get("/map/contacts", async (req, res) => {
  const { profession, company, tag, location } = req.query;
  const filter = {
    ownerUserId: req.user._id,
    "location.lat": { $ne: null },
    "location.lng": { $ne: null },
  };

  if (profession) filter.profession = { $in: profession.split(",").map((s) => s.trim()).filter(Boolean) };
  if (company) filter.company = new RegExp(company.trim(), "i");
  if (tag) filter.tags = { $in: tag.split(",").map((s) => s.trim()).filter(Boolean) };
  if (location) filter["location.text"] = new RegExp(location.trim(), "i");

  const contacts = await Contact.find(filter).select("name profession company location matchedUserId");
  res.json({ contacts });
});

router.post("/geocode", async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: "text is required" });
  const result = await geocode(text);
  res.json(result || { lat: null, lng: null, displayName: null });
});

export default router;
