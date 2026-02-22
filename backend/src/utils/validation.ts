import { z } from "zod";

export const e164Regex = /^\+[1-9]\d{7,14}$/;

export const optionalTimingSchema = z.object({
  scheduledTime: z.string().datetime().optional(),
  durationMinutes: z.number().int().min(1).max(1440).optional(),
  timeSlot: z
    .object({
      start: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Use HH:mm"),
      end: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Use HH:mm")
    })
    .optional(),
  deviceId: z.number().int().positive().optional()
});

export const messageSchema = z
  .string()
  .trim()
  .min(1, "Message is required")
  .refine((value) => value.split(/\s+/).filter(Boolean).length <= 20, {
    message: "Message must be 20 words or fewer"
  });
