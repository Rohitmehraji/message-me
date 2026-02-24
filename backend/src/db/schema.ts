import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const devices = sqliteTable("devices", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  code: text("code").notNull().unique(),
  phoneNumber: text("phone_number").notNull(),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: text("created_at").notNull().default("CURRENT_TIMESTAMP")
});

export const contacts = sqliteTable("contacts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name"),
  phoneNumber: text("phone_number").notNull().unique(),
  deviceId: integer("device_id").references(() => devices.id),
  createdAt: text("created_at").notNull().default("CURRENT_TIMESTAMP")
});

export const campaigns = sqliteTable("campaigns", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  message: text("message").notNull(),
  status: text("status", { enum: ["pending", "scheduled", "processing", "completed", "failed"] })
    .notNull()
    .default("pending"),
  scheduledTime: text("scheduled_time"),
  deviceId: integer("device_id").references(() => devices.id),
  durationMinutes: integer("duration_minutes"),
  timeSlotStart: text("time_slot_start"),
  timeSlotEnd: text("time_slot_end"),
  totalContacts: integer("total_contacts").notNull().default(0),
  sentCount: integer("sent_count").notNull().default(0),
  failedCount: integer("failed_count").notNull().default(0),
  createdAt: text("created_at").notNull().default("CURRENT_TIMESTAMP")
});

export const smsLogs = sqliteTable("sms_logs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  campaignId: integer("campaign_id").references(() => campaigns.id),
  contactId: integer("contact_id").references(() => contacts.id),
  deviceId: integer("device_id").references(() => devices.id),
  toPhone: text("to_phone").notNull(),
  fromPhone: text("from_phone"),
  message: text("message").notNull(),
  status: text("status", { enum: ["pending", "sent", "failed", "scheduled"] }).notNull().default("pending"),
  errorMessage: text("error_message"),
  providerMessageId: text("provider_message_id"),
  createdAt: text("created_at").notNull().default("CURRENT_TIMESTAMP"),
  sentAt: text("sent_at")
});
