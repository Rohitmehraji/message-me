import { Router } from "express";
import { db } from "../db/client.js";
import { smsLogs } from "../db/schema.js";
import { asyncHandler } from "../utils/async-handler.js";

const router = Router();

router.get(
  "/stats",
  asyncHandler(async (_req, res) => {
    const logs = await db.select().from(smsLogs);
    const summary = {
      totalSms: logs.length,
      sent: logs.filter((log) => log.status === "sent").length,
      failed: logs.filter((log) => log.status === "failed").length,
      pending: logs.filter((log) => log.status === "pending").length,
      scheduled: logs.filter((log) => log.status === "scheduled").length
    };

    res.json({ data: summary });
  })
);

export default router;
