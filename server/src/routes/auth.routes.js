import express from "express";
import { getGoogleConsentUrl, exchangeCodeForProfile } from "../auth/google.js";
import { signToken } from "../auth/jwt.js";
import { requireAuth } from "../auth/requireAuth.js";
import { generateUniqueUsername, isUsernameAvailable } from "../auth/username.js";
import { CLIENT_URL } from "../config.js";
import User from "../models/User.js";

const router = express.Router();

router.get("/google", (req, res) => {
  res.redirect(getGoogleConsentUrl());
});

router.get("/google/callback", async (req, res) => {
  try {
    const { code } = req.query;
    if (!code) {
      return res.redirect(`${CLIENT_URL}/login?error=missing_code`);
    }

    const profile = await exchangeCodeForProfile(code);

    let user = await User.findOne({ googleId: profile.googleId });
    if (!user) {
      const username = await generateUniqueUsername(profile.email.split("@")[0]);
      user = await User.create({
        email: profile.email,
        username,
        name: profile.name,
        googleId: profile.googleId,
        avatarUrl: profile.avatarUrl,
      });
    }

    const token = signToken(user._id.toString());
    res.redirect(`${CLIENT_URL}/auth/callback?token=${token}`);
  } catch (err) {
    console.error("Google OAuth callback failed:", err);
    res.redirect(`${CLIENT_URL}/login?error=auth_failed`);
  }
});

router.get("/me", requireAuth, (req, res) => {
  res.json({ user: req.user });
});

router.get("/username-available", requireAuth, async (req, res) => {
  const { u } = req.query;
  if (!u) {
    return res.status(400).json({ error: "Missing username query param" });
  }
  const available = await isUsernameAvailable(u.toLowerCase(), req.user._id);
  res.json({ available });
});

router.patch("/me", requireAuth, async (req, res) => {
  const { username, discoverable, socialLinks, onboarded } = req.body;

  if (username !== undefined) {
    const normalized = username.toLowerCase().trim();
    const available = await isUsernameAvailable(normalized, req.user._id);
    if (!available) {
      return res.status(409).json({ error: "Username is taken" });
    }
    req.user.username = normalized;
  }

  if (discoverable !== undefined) req.user.discoverable = Boolean(discoverable);
  if (onboarded !== undefined) req.user.onboarded = Boolean(onboarded);

  if (socialLinks !== undefined) {
    req.user.socialLinks = {
      linkedin: socialLinks.linkedin ?? req.user.socialLinks.linkedin,
      instagram: socialLinks.instagram ?? req.user.socialLinks.instagram,
      twitter: socialLinks.twitter ?? req.user.socialLinks.twitter,
    };
  }

  await req.user.save();
  res.json({ user: req.user });
});

export default router;
