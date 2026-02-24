import { Router } from "express";
import multer from "multer";
import { z } from "zod";
import * as XLSX from "xlsx";
import { db } from "../db/client.js";
import { contacts } from "../db/schema.js";
import { asyncHandler } from "../utils/async-handler.js";
import { normalizePhone } from "../utils/phone.js";
import { e164Regex } from "../utils/validation.js";
import { eq } from "drizzle-orm";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

const contactSchema = z.object({
  name: z.string().optional(),
  phoneNumber: z.string().regex(e164Regex),
  deviceId: z.number().int().positive().optional()
});

router.get(
  "/",
  asyncHandler(async (_req, res) => {
    const data = await db.select().from(contacts);
    res.json({ data });
  })
);

router.post(
  "/",
  asyncHandler(async (req, res) => {
    const payload = contactSchema.parse(req.body);
    const [created] = await db.insert(contacts).values(payload).returning();
    res.status(201).json({ message: "Contact added", data: created });
  })
);

router.post(
  "/bulk-upload",
  upload.single("file"),
  asyncHandler(async (req, res) => {
    if (!req.file) return res.status(400).json({ message: "File is required" });

    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json<Record<string, string | number>>(sheet, { defval: "" });

    let inserted = 0;
    let skipped = 0;

    for (const row of rows) {
      const rawPhone = String(row.phoneNumber ?? row.phone ?? row.mobile ?? "");
      const normalized = normalizePhone(rawPhone);
      if (!normalized) {
        skipped += 1;
        continue;
      }
      const existing = (await db.select().from(contacts).where(eq(contacts.phoneNumber, normalized)).limit(1))[0];
      if (existing) {
        skipped += 1;
        continue;
      }
      await db.insert(contacts).values({
        name: String(row.name ?? "").trim() || null,
        phoneNumber: normalized,
        deviceId: row.deviceId ? Number(row.deviceId) : null
      });
      inserted += 1;
    }

    res.json({ message: "Upload complete", inserted, skipped, totalRows: rows.length });
  })
);

export default router;
