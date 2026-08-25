import Contact from "../models/Contact.js";
import ManualLink from "../models/ManualLink.js";

function buildContactFilter(ownerUserId, { profession, company, tag, location } = {}) {
  const filter = { ownerUserId };

  if (profession) {
    filter.profession = { $in: profession.split(",").map((s) => s.trim()).filter(Boolean) };
  }
  if (company) {
    filter.company = new RegExp(company.trim(), "i");
  }
  if (tag) {
    filter.tags = { $in: tag.split(",").map((s) => s.trim()).filter(Boolean) };
  }
  if (location) {
    filter["location.text"] = new RegExp(location.trim(), "i");
  }

  return filter;
}

export async function buildGraph(currentUser, filters) {
  const contacts = await Contact.find(buildContactFilter(currentUser._id, filters));
  const contactIds = contacts.map((c) => c._id);

  const nodes = [{ id: "self", type: "user", label: currentUser.name }];
  for (const contact of contacts) {
    nodes.push({
      id: String(contact._id),
      type: "contact",
      label: contact.name,
      matched: Boolean(contact.matchedUserId),
    });
  }

  const edges = contacts.map((contact) => ({
    source: "self",
    target: String(contact._id),
    type: "own",
  }));

  const manualLinks = await ManualLink.find({
    ownerUserId: currentUser._id,
    contactAId: { $in: contactIds },
    contactBId: { $in: contactIds },
  });

  for (const link of manualLinks) {
    edges.push({
      source: String(link.contactAId),
      target: String(link.contactBId),
      type: "manual",
      note: link.note,
    });
  }

  edges.push(...(await autoMutualEdges(contacts)));

  return { nodes, edges };
}

// Two of the current user's contacts get an "auto-mutual" edge when both are
// matched to real Threadline accounts AND those two accounts each have the
// other as a contact too (confirmed from both sides, not just one).
async function autoMutualEdges(contacts) {
  const matchedContacts = contacts.filter((c) => c.matchedUserId);
  if (matchedContacts.length < 2) return [];

  const matchedUserIds = matchedContacts.map((c) => c.matchedUserId);

  const crossContacts = await Contact.find({
    ownerUserId: { $in: matchedUserIds },
    matchedUserId: { $in: matchedUserIds },
  }).select("ownerUserId matchedUserId");

  const edgeMap = new Map(); // fromUserId -> Set<toUserId>
  for (const c of crossContacts) {
    const from = String(c.ownerUserId);
    if (!edgeMap.has(from)) edgeMap.set(from, new Set());
    edgeMap.get(from).add(String(c.matchedUserId));
  }

  const edges = [];
  for (let i = 0; i < matchedContacts.length; i++) {
    for (let j = i + 1; j < matchedContacts.length; j++) {
      const a = matchedContacts[i];
      const b = matchedContacts[j];
      const aUser = String(a.matchedUserId);
      const bUser = String(b.matchedUserId);
      if (aUser === bUser) continue;

      const mutual = edgeMap.get(aUser)?.has(bUser) && edgeMap.get(bUser)?.has(aUser);
      if (mutual) {
        edges.push({ source: String(a._id), target: String(b._id), type: "auto-mutual" });
      }
    }
  }

  return edges;
}
