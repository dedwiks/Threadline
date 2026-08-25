import express from "express";
import { requireAuth } from "../auth/requireAuth.js";
import ManualLink from "../models/ManualLink.js";
import Contact from "../models/Contact.js";

const router = express.Router();

router.use(requireAuth);

router.get("/", async (req, res) => {
  const links = await ManualLink.find({ ownerUserId: req.user._id });
  res.json({ links });
});

router.post("/", async (req, res) => {
  const { contactAId, contactBId, note } = req.body;

  if (!contactAId || !contactBId || contactAId === contactBId) {
    return res.status(400).json({ error: "Two different contacts are required" });
  }

  const [a, b] = [contactAId, contactBId].sort();

  const owned = await Contact.countDocuments({
    _id: { $in: [a, b] },
    ownerUserId: req.user._id,
  });
  if (owned !== 2) {
    return res.status(404).json({ error: "Contact not found" });
  }

  try {
    const link = await ManualLink.create({ ownerUserId: req.user._id, contactAId: a, contactBId: b, note });
    res.status(201).json({ link });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: "These contacts are already linked" });
    }
    throw err;
  }
});

router.delete("/:id", async (req, res) => {
  const link = await ManualLink.findOneAndDelete({ _id: req.params.id, ownerUserId: req.user._id });
  if (!link) return res.status(404).json({ error: "Link not found" });
  res.status(204).end();
});

export default router;
