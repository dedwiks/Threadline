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

  return { nodes, edges };
}
