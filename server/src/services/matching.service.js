import User from "../models/User.js";
import Contact from "../models/Contact.js";
import Notification from "../models/Notification.js";

async function notifyMatch(recipientUserId, contact) {
  const owner = await User.findById(contact.ownerUserId);
  await Notification.create({
    recipientUserId,
    type: "matched",
    message: `${owner?.name || "Someone"} added you as a contact`,
    relatedUserId: contact.ownerUserId,
    relatedContactId: contact._id,
  });
}

// Runs once after a new User is created. Retroactively links any existing,
// unmatched Contact records (owned by other users) that reference this
// person's email or LinkedIn.
export async function onUserSignup(newUser) {
  if (!newUser.discoverable) return;

  const orClauses = [{ email: newUser.email }];
  if (newUser.socialLinks?.linkedin) {
    orClauses.push({ linkedin: newUser.socialLinks.linkedin });
  }

  const contacts = await Contact.find({
    matchedUserId: null,
    ownerUserId: { $ne: newUser._id },
    $or: orClauses,
  });

  for (const contact of contacts) {
    contact.matchedUserId = newUser._id;
    await contact.save();
    await notifyMatch(newUser._id, contact);
  }
}

// Runs after a Contact is created or updated. Idempotent — self-corrects
// matchedUserId on every save, so an edited email/linkedin re-resolves.
export async function onContactUpsert(contact) {
  const orClauses = [];
  if (contact.email) orClauses.push({ email: contact.email });
  if (contact.linkedin) orClauses.push({ "socialLinks.linkedin": contact.linkedin });

  let candidate = null;
  if (orClauses.length > 0) {
    candidate = await User.findOne({
      discoverable: true,
      _id: { $ne: contact.ownerUserId },
      $or: orClauses,
    });
  }

  const newMatchedUserId = candidate ? candidate._id : null;
  const wasMatched = Boolean(contact.matchedUserId);
  const changed = String(contact.matchedUserId || "") !== String(newMatchedUserId || "");

  if (changed) {
    contact.matchedUserId = newMatchedUserId;
    await contact.save();
    if (!wasMatched && newMatchedUserId) {
      await notifyMatch(newMatchedUserId, contact);
    }
  }

  return contact;
}
