import jwt from "jsonwebtoken";
import { SESSION_SECRET } from "../config.js";

export function signToken(userId) {
  return jwt.sign({ userId }, SESSION_SECRET, { expiresIn: "30d" });
}

export function verifyToken(token) {
  return jwt.verify(token, SESSION_SECRET);
}
