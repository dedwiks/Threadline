import "dotenv/config";
import cors from "cors";
import express from "express";
import { connectDB, requireDB } from "./db.js";
import { PORT, CORS_ORIGIN } from "./config.js";
import { errorHandler } from "./middleware/errorHandler.js";
import authRouter from "./routes/auth.routes.js";
import contactsRouter from "./routes/contacts.routes.js";
import linksRouter from "./routes/links.routes.js";
import graphRouter from "./routes/graph.routes.js";
import notificationsRouter from "./routes/notifications.routes.js";
import mapRouter from "./routes/map.routes.js";
import aiRouter from "./routes/ai.routes.js";

const app = express();

app.use("/api", cors({ origin: CORS_ORIGIN }), express.json());

app.get("/api/health", (req, res) => res.json({ ok: true }));

app.use("/api/auth", requireDB, authRouter);
app.use("/api/contacts", requireDB, contactsRouter);
app.use("/api/links", requireDB, linksRouter);
app.use("/api/graph", requireDB, graphRouter);
app.use("/api/notifications", requireDB, notificationsRouter);
app.use("/api", requireDB, mapRouter);
app.use("/api/ai", aiRouter);

app.use("/api", errorHandler);

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Threadline server listening on port ${PORT}`);
  });
});
