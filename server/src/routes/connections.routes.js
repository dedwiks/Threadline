import express from "express";
import { requireAuth } from "../auth/requireAuth.js";
import Connection from "../models/Connection.js";
import Contact from "../models/Contact.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";

const router = express.Router();

router.use(requireAuth);

const SHARE_FIELDS = ["email", "linkedin", "instagram", "twitter"];

function sanitizePermissions(input = {}) {
  const clean = {};
  for (const field of SHARE_FIELDS) clean[field] = Boolean(input[field]);
  return clean;
}

async function usersKnowOfEachOther(userAId, userBId) {
  const count = await Contact.countDocuments({
    $or: [
      { ownerUserId: userAId, matchedUserId: userBId },
      { ownerUserId: userBId, matchedUserId: userAId },
    ],
  });
  return count > 0;
}

// p.userId may be a raw ObjectId or, if the query used .populate(), a populated
// User subdocument — normalize to a comparable id string either way.
function participantUserId(p) {
  return String(p.userId?._id ?? p.userId);
}

function findParticipant(connection, userId) {
  return connection.participants.find((p) => participantUserId(p) === String(userId));
}

function otherParticipant(connection, userId) {
  return connection.participants.find((p) => participantUserId(p) !== String(userId));
}

router.post("/request", async (req, res) => {
  const { toUserId, note, sharePermissions } = req.body;

  if (!toUserId || String(toUserId) === String(req.user._id)) {
    return res.status(400).json({ error: "A valid, different toUserId is required" });
  }

  const target = await User.findById(toUserId);
  if (!target) return res.status(404).json({ error: "User not found" });

  const known = await usersKnowOfEachOther(req.user._id, toUserId);
  if (!known) {
    return res.status(400).json({ error: "You can only request a connection with someone you already have as a matched contact" });
  }

  const existing = await Connection.findOne({
    "participants.userId": { $all: [req.user._id, toUserId] },
    status: { $in: ["pending", "accepted"] },
  });
  if (existing) return res.status(409).json({ error: "A connection already exists with this user", connection: existing });

  const connection = await Connection.create({
    participants: [
      { userId: req.user._id, response: "accepted", respondedAt: new Date(), sharePermissions: sanitizePermissions(sharePermissions) },
      { userId: toUserId, response: "pending" },
    ],
    source: "direct_request",
    initiatedBy: req.user._id,
    note: note || "",
    status: "pending",
  });

  await Notification.create({
    recipientUserId: toUserId,
    type: "connection_request",
    message: `${req.user.name} sent you a connection request`,
    relatedUserId: req.user._id,
    relatedConnectionId: connection._id,
  });

  res.status(201).json({ connection });
});

router.post("/introduce", async (req, res) => {
  const { contactAId, contactBId, note } = req.body;

  if (!contactAId || !contactBId || contactAId === contactBId) {
    return res.status(400).json({ error: "Two different contacts are required" });
  }

  const [contactA, contactB] = await Promise.all([
    Contact.findOne({ _id: contactAId, ownerUserId: req.user._id }),
    Contact.findOne({ _id: contactBId, ownerUserId: req.user._id }),
  ]);
  if (!contactA || !contactB) return res.status(404).json({ error: "Contact not found" });
  if (!contactA.matchedUserId || !contactB.matchedUserId) {
    return res.status(400).json({ error: "Both contacts must be matched to a Threadline account to introduce them" });
  }
  if (String(contactA.matchedUserId) === String(contactB.matchedUserId)) {
    return res.status(400).json({ error: "These contacts are the same person" });
  }

  const userAId = contactA.matchedUserId;
  const userBId = contactB.matchedUserId;

  const existing = await Connection.findOne({
    "participants.userId": { $all: [userAId, userBId] },
    status: { $in: ["pending", "accepted"] },
  });
  if (existing) return res.status(409).json({ error: "A connection already exists between these two people", connection: existing });

  const connection = await Connection.create({
    participants: [
      { userId: userAId, response: "pending" },
      { userId: userBId, response: "pending" },
    ],
    source: "introduction",
    introducedBy: req.user._id,
    note: note || "",
    status: "pending",
  });

  const [userA, userB] = await Promise.all([User.findById(userAId), User.findById(userBId)]);
  await Notification.create([
    {
      recipientUserId: userAId,
      type: "introduction_request",
      message: `${req.user.name} wants to introduce you to ${userB?.name || "someone"}`,
      relatedUserId: req.user._id,
      relatedConnectionId: connection._id,
    },
    {
      recipientUserId: userBId,
      type: "introduction_request",
      message: `${req.user.name} wants to introduce you to ${userA?.name || "someone"}`,
      relatedUserId: req.user._id,
      relatedConnectionId: connection._id,
    },
  ]);

  res.status(201).json({ connection });
});

router.get("/", async (req, res) => {
  const connections = await Connection.find({ "participants.userId": req.user._id })
    .sort({ createdAt: -1 })
    .populate("participants.userId", "name avatarUrl");

  const shaped = connections.map((c) => {
    const mine = findParticipant(c, req.user._id);
    const other = otherParticipant(c, req.user._id);
    return {
      _id: c._id,
      source: c.source,
      note: c.note,
      status: c.status,
      createdAt: c.createdAt,
      myResponse: mine.response,
      needsMyResponse: mine.response === "pending",
      other: other.userId, // populated {_id, name, avatarUrl}
    };
  });

  res.json({ connections: shaped });
});

router.get("/with/:userId", async (req, res) => {
  const { userId } = req.params;

  const connection = await Connection.findOne({
    "participants.userId": { $all: [req.user._id, userId] },
  }).sort({ createdAt: -1 });

  if (!connection) {
    return res.json({ connection: null, otherUser: null, sharedByOther: null });
  }

  const other = otherParticipant(connection, req.user._id);
  const otherUser = await User.findById(other.userId).select("name avatarUrl");

  let sharedByOther = null;
  if (connection.status === "accepted") {
    const fullOtherUser = await User.findById(other.userId);
    sharedByOther = {};
    if (other.sharePermissions.email) sharedByOther.email = fullOtherUser.email;
    if (other.sharePermissions.linkedin) sharedByOther.linkedin = fullOtherUser.socialLinks.linkedin;
    if (other.sharePermissions.instagram) sharedByOther.instagram = fullOtherUser.socialLinks.instagram;
    if (other.sharePermissions.twitter) sharedByOther.twitter = fullOtherUser.socialLinks.twitter;
  }

  res.json({
    connection: {
      _id: connection._id,
      source: connection.source,
      note: connection.note,
      status: connection.status,
      myResponse: findParticipant(connection, req.user._id).response,
      mySharePermissions: findParticipant(connection, req.user._id).sharePermissions,
    },
    otherUser,
    sharedByOther,
  });
});

router.patch("/:id/respond", async (req, res) => {
  const { response, sharePermissions } = req.body;
  if (!["accepted", "declined"].includes(response)) {
    return res.status(400).json({ error: "response must be 'accepted' or 'declined'" });
  }

  const connection = await Connection.findById(req.params.id);
  if (!connection) return res.status(404).json({ error: "Connection not found" });

  const mine = findParticipant(connection, req.user._id);
  if (!mine) return res.status(403).json({ error: "Not a participant in this connection" });
  if (mine.response !== "pending") return res.status(409).json({ error: "You've already responded to this connection" });

  mine.response = response;
  mine.respondedAt = new Date();
  if (response === "accepted") mine.sharePermissions = sanitizePermissions(sharePermissions);

  connection.recomputeStatus();
  await connection.save();

  const other = otherParticipant(connection, req.user._id);
  const message =
    response === "declined"
      ? `${req.user.name} declined your connection request`
      : connection.status === "accepted"
        ? `${req.user.name} accepted — you're now connected`
        : `${req.user.name} accepted the introduction — waiting on you`;

  await Notification.create({
    recipientUserId: other.userId,
    type: response === "declined" ? "connection_declined" : "connection_accepted",
    message,
    relatedUserId: req.user._id,
    relatedConnectionId: connection._id,
  });

  res.json({ connection });
});

router.patch("/:id/permissions", async (req, res) => {
  const connection = await Connection.findById(req.params.id);
  if (!connection) return res.status(404).json({ error: "Connection not found" });

  const mine = findParticipant(connection, req.user._id);
  if (!mine) return res.status(403).json({ error: "Not a participant in this connection" });
  if (mine.response !== "accepted") return res.status(409).json({ error: "You must accept the connection before managing sharing" });

  mine.sharePermissions = sanitizePermissions(req.body.sharePermissions);
  await connection.save();

  res.json({ connection });
});

export default router;
