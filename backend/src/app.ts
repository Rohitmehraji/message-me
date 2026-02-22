import cors from "cors";
import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { env } from "./config/env.js";
import contactsRouter from "./routes/contacts.js";
import campaignsRouter from "./routes/campaigns.js";
import dashboardRouter from "./routes/dashboard.js";
import devicesRouter from "./routes/devices.js";
import logsRouter from "./routes/logs.js";
import { errorHandler } from "./middleware/error-handler.js";
import { notFound } from "./middleware/not-found.js";

export const app = express();

app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGIN === "*" ? true : env.CORS_ORIGIN }));
app.use(rateLimit({ windowMs: 60_000, max: 180 }));
app.use(express.json({ limit: "2mb" }));

app.get("/health", (_req, res) => res.json({ ok: true }));
app.use("/api/contacts", contactsRouter);
app.use("/api/campaigns", campaignsRouter);
app.use("/api/devices", devicesRouter);
app.use("/api/logs", logsRouter);
app.use("/api/dashboard", dashboardRouter);

app.use(notFound);
app.use(errorHandler);
