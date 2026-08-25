import express from "express";
import { requireAuth } from "../auth/requireAuth.js";
import { buildGraph } from "../services/graph.service.js";

const router = express.Router();

router.get("/", requireAuth, async (req, res) => {
  const { profession, company, tag, location } = req.query;
  const graph = await buildGraph(req.user, { profession, company, tag, location });
  res.json(graph);
});

export default router;
