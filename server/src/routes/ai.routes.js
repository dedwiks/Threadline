import express from "express";
import { requireAuth } from "../auth/requireAuth.js";
import { probableDetails } from "../services/gemini.service.js";

const router = express.Router();

router.use(requireAuth);

router.post("/probable-details", async (req, res) => {
  const { name, company, profession } = req.body;
  if (!name) {
    return res.status(400).json({ error: "name is required" });
  }

  try {
    const result = await probableDetails({ name, company, profession });
    res.json(result);
  } catch (err) {
    console.error("AI probable-details failed:", err.message);
    res.status(502).json({ error: "AI suggestion request failed" });
  }
});

export default router;
