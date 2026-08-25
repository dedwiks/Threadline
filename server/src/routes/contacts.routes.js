import express from "express";
import { requireAuth } from "../auth/requireAuth.js";
import Contact from "../models/Contact.js";
import ManualLink from "../models/ManualLink.js";
import { onContactUpsert } from "../services/matching.service.js";
import { geocode } from "../services/geocode.service.js";

const router = express.Router();

router.use(requireAuth);

const EDITABLE_FIELDS = [
  "name",
  "email",
  "phone",
  "linkedin",
  "instagram",
  "twitter",
  "profession",
  "company",
  "tags",
  "howWeMet",
  "metDate",
  "notes",
];

function applyFields(contact, body) {
  for (const field of EDITABLE_FIELDS) {
    if (body[field] !== undefined) contact[field] = body[field];
  }
  if (body.location?.text !== undefined) {
    contact.location = contact.location || {};
    contact.location.text = body.location.text;
  }
}

async function applyGeocode(contact) {
  if (!contact.location?.text) return;
  const geo = await geocode(contact.location.text);
  contact.location.lat = geo?.lat ?? null;
  contact.location.lng = geo?.lng ?? null;
}

router.get("/", async (req, res) => {
  const { q, tag } = req.query;
  const filter = { ownerUserId: req.user._id };

  if (tag) filter.tags = tag;
  if (q) {
    const regex = new RegExp(q, "i");
    filter.$or = [{ name: regex }, { company: regex }, { profession: regex }];
  }

  const contacts = await Contact.find(filter).sort({ name: 1 });
  res.json({ contacts });
});

router.get("/:id", async (req, res) => {
  const contact = await Contact.findOne({ _id: req.params.id, ownerUserId: req.user._id });
  if (!contact) return res.status(404).json({ error: "Contact not found" });
  res.json({ contact });
});

router.post("/", async (req, res) => {
  if (!req.body.name) {
    return res.status(400).json({ error: "Name is required" });
  }

  const contact = new Contact({ ownerUserId: req.user._id });
  applyFields(contact, req.body);
  await applyGeocode(contact);
  await contact.save();
  await onContactUpsert(contact);

  res.status(201).json({ contact });
});

router.put("/:id", async (req, res) => {
  const contact = await Contact.findOne({ _id: req.params.id, ownerUserId: req.user._id });
  if (!contact) return res.status(404).json({ error: "Contact not found" });

  const previousLocationText = contact.location?.text;
  applyFields(contact, req.body);
  if (contact.location?.text !== previousLocationText) {
    await applyGeocode(contact);
  }
  contact.updatedAt = new Date();
  await contact.save();
  await onContactUpsert(contact);

  res.json({ contact });
});

router.delete("/:id", async (req, res) => {
  const contact = await Contact.findOneAndDelete({ _id: req.params.id, ownerUserId: req.user._id });
  if (!contact) return res.status(404).json({ error: "Contact not found" });

  await ManualLink.deleteMany({
    ownerUserId: req.user._id,
    $or: [{ contactAId: contact._id }, { contactBId: contact._id }],
  });

  res.status(204).end();
});

export default router;
