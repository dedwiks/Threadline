import "dotenv/config";
import cors from "cors";
import express from "express";
import { connectDB, requireDB } from "./db.js";
import { PORT, CORS_ORIGIN } from "./config.js";
import { errorHandler } from "./middleware/errorHandler.js";
import authRouter from "./routes/auth.routes.js";
import contactsRouter from "./routes/contacts.routes.js";

const app = express();

app.use("/api", cors({ origin: CORS_ORIGIN }), express.json());

app.get("/api/health", (req, res) => res.json({ ok: true }));

app.use("/api/auth", requireDB, authRouter);
app.use("/api/contacts", requireDB, contactsRouter);

app.use("/api", errorHandler);

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Threadline server listening on port ${PORT}`);
  });
});
