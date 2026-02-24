import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().default("./message-me.sqlite"),
  SMS_PROVIDER: z.enum(["mock", "twilio"]).default("mock"),
  TWILIO_ACCOUNT_SID: z.string().optional(),
  TWILIO_AUTH_TOKEN: z.string().optional(),
  TWILIO_FROM_NUMBER: z.string().optional(),
  CORS_ORIGIN: z.string().default("*")
});

export const env = envSchema.parse(process.env);
