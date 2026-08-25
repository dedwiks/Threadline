import express from "express";
import { requireAuth } from "../auth/requireAuth.js";
import Notification from "../models/Notification.js";

const router = express.Router();

router.use(requireAuth);

router.get("/", async (req, res) => {
  const notifications = await Notification.find({ recipientUserId: req.user._id }).sort({ read: 1, createdAt: -1 });
  res.json({ notifications });
});

router.patch("/:id/read", async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, recipientUserId: req.user._id },
    { read: true },
    { new: true },
  );
  if (!notification) return res.status(404).json({ error: "Notification not found" });
  res.json({ notification });
});

export default router;
