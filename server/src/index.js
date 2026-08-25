import "dotenv/config";
import cors from "cors";
import express from "express";
import { connectDB } from "./db.js";
import { PORT, CORS_ORIGIN } from "./config.js";

const app = express();

app.use("/api", cors({ origin: CORS_ORIGIN }), express.json());

app.get("/api/health", (req, res) => res.json({ ok: true }));

app.use("/api", (err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Threadline server listening on port ${PORT}`);
  });
});
