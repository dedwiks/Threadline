import User from "../models/User.js";

function slugify(input) {
  const slug = input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "user";
}

export async function generateUniqueUsername(seed) {
  const base = slugify(seed);
  let candidate = base;
  let suffix = 1;

  while (await User.exists({ username: candidate })) {
    suffix += 1;
    candidate = `${base}${suffix}`;
  }

  return candidate;
}

export async function isUsernameAvailable(username, excludeUserId) {
  if (!/^[a-z0-9-]{3,30}$/.test(username)) return false;
  const existing = await User.findOne({ username });
  if (!existing) return true;
  return String(existing._id) === String(excludeUserId);
}
