import { Router } from "express";
import { db } from "../db/client.js";
import { campaigns, contacts } from "../db/schema.js";
import { asyncHandler } from "../utils/async-handler.js";
import { messageSchema, optionalTimingSchema } from "../utils/validation.js";
import { processCampaign } from "../services/campaign-service.js";
import { z } from "zod";

const router = Router();

const createCampaignSchema = z
  .object({
    message: messageSchema
  })
  .merge(optionalTimingSchema);

router.get(
  "/",
  asyncHandler(async (_req, res) => {
    const data = await db.select().from(campaigns);
    res.json({ data });
  })
);

router.post(
  "/send-now",
  asyncHandler(async (req, res) => {
    const payload = createCampaignSchema.parse(req.body);
    const contactList = await db.select().from(contacts);

    const [campaign] = await db
      .insert(campaigns)
      .values({
        message: payload.message,
        deviceId: payload.deviceId,
        totalContacts: contactList.length,
        status: "scheduled",
        durationMinutes: payload.durationMinutes,
        timeSlotStart: payload.timeSlot?.start,
        timeSlotEnd: payload.timeSlot?.end
      })
      .returning();

    await processCampaign(campaign.id);
    res.status(201).json({ message: "Campaign sent", data: campaign });
  })
);

router.post(
  "/schedule",
  asyncHandler(async (req, res) => {
    const payload = createCampaignSchema.parse(req.body);
    const [campaign] = await db
      .insert(campaigns)
      .values({
        message: payload.message,
        status: "scheduled",
        scheduledTime: payload.scheduledTime,
        durationMinutes: payload.durationMinutes,
        deviceId: payload.deviceId,
        timeSlotStart: payload.timeSlot?.start,
        timeSlotEnd: payload.timeSlot?.end
      })
      .returning();

    res.status(201).json({ message: "Campaign scheduled", data: campaign });
  })
);

export default router;
