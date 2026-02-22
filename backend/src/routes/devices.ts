import { Router } from "express";
import { z } from "zod";
import { db } from "../db/client.js";
import { devices } from "../db/schema.js";
import { asyncHandler } from "../utils/async-handler.js";
import { e164Regex } from "../utils/validation.js";

const router = Router();

const createDeviceSchema = z.object({
  name: z.string().min(2),
  code: z.string().regex(/^\d+$/),
  phoneNumber: z.string().regex(e164Regex)
});

router.get(
  "/",
  asyncHandler(async (_req, res) => {
    const data = await db.select().from(devices);
    res.json({ data });
  })
);

router.post(
  "/",
  asyncHandler(async (req, res) => {
    const payload = createDeviceSchema.parse(req.body);
    const [created] = await db.insert(devices).values(payload).returning();
    res.status(201).json({ message: "Device registered", data: created });
  })
);

export default router;
