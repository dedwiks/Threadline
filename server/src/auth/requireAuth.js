import { verifyToken } from "./jwt.js";
import User from "../models/User.js";

export async function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  try {
    const { userId } = verifyToken(token);
    const user = await User.findById(userId);
    if (!user) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ error: "Not authenticated" });
  }
}
