import { and, eq, gte, lte } from "drizzle-orm";
import { Router } from "express";
import { db } from "../db/client.js";
import { smsLogs } from "../db/schema.js";
import { asyncHandler } from "../utils/async-handler.js";

const router = Router();

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const { status, from, to } = req.query;
    const filters = and(
      status ? eq(smsLogs.status, String(status) as "pending" | "sent" | "failed" | "scheduled") : undefined,
      from ? gte(smsLogs.createdAt, String(from)) : undefined,
      to ? lte(smsLogs.createdAt, String(to)) : undefined
    );
    const data = await db.select().from(smsLogs).where(filters);
    res.json({ data });
  })
);

router.get(
  "/export.csv",
  asyncHandler(async (_req, res) => {
    const data = await db.select().from(smsLogs);
    const header = "id,toPhone,fromPhone,status,message,createdAt";
    const rows = data.map((row) => [row.id, row.toPhone, row.fromPhone ?? "", row.status, row.message, row.createdAt].join(","));
    res.setHeader("Content-Type", "text/csv");
    res.send([header, ...rows].join("\n"));
  })
);

export default router;
