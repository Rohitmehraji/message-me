import { and, eq, isNull, lte, or } from "drizzle-orm";
import { db } from "../db/client.js";
import { campaigns, contacts, devices, smsLogs } from "../db/schema.js";
import { smsProvider } from "./sms-provider.js";

const inTimeSlot = (start?: string | null, end?: string | null): boolean => {
  if (!start || !end) return true;
  const now = new Date();
  const hhmm = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  return hhmm >= start && hhmm <= end;
};

const getPacingBatch = (remaining: number, durationMinutes?: number | null): number => {
  if (!durationMinutes || durationMinutes <= 1) return remaining;
  return Math.max(1, Math.ceil(remaining / durationMinutes));
};

export const processCampaign = async (campaignId: number) => {
  const campaign = (await db.select().from(campaigns).where(eq(campaigns.id, campaignId)).limit(1))[0];
  if (!campaign || !inTimeSlot(campaign.timeSlotStart, campaign.timeSlotEnd)) return;

  await db.update(campaigns).set({ status: "processing" }).where(eq(campaigns.id, campaign.id));

  const contactList = await db
    .select({ id: contacts.id, phoneNumber: contacts.phoneNumber, deviceId: contacts.deviceId })
    .from(contacts)
    .where(campaign.deviceId ? eq(contacts.deviceId, campaign.deviceId) : undefined);

  const alreadyProcessed = campaign.sentCount + campaign.failedCount;
  const remaining = Math.max(0, contactList.length - alreadyProcessed);
  const batchSize = getPacingBatch(remaining, campaign.durationMinutes);
  const targetContacts = contactList.slice(alreadyProcessed, alreadyProcessed + batchSize);

  let sent = campaign.sentCount;
  let failed = campaign.failedCount;

  for (const contact of targetContacts) {
    const deviceId = contact.deviceId ?? campaign.deviceId;
    const device = deviceId
      ? (await db.select().from(devices).where(eq(devices.id, deviceId)).limit(1))[0]
      : undefined;
    const result = await smsProvider.sendSms({ to: contact.phoneNumber, body: campaign.message, from: device?.phoneNumber });

    sent += result.success ? 1 : 0;
    failed += result.success ? 0 : 1;

    await db.insert(smsLogs).values({
      campaignId: campaign.id,
      contactId: contact.id,
      deviceId: device?.id,
      toPhone: contact.phoneNumber,
      fromPhone: result.fromPhone,
      message: campaign.message,
      status: result.success ? "sent" : "failed",
      providerMessageId: result.providerMessageId,
      errorMessage: result.error,
      sentAt: new Date().toISOString()
    });
  }

  const done = sent + failed >= contactList.length;
  await db
    .update(campaigns)
    .set({ status: done ? "completed" : "scheduled", sentCount: sent, failedCount: failed, totalContacts: contactList.length })
    .where(eq(campaigns.id, campaign.id));
};

export const pickRunnableCampaigns = async () => {
  const nowIso = new Date().toISOString();
  return db
    .select()
    .from(campaigns)
    .where(and(eq(campaigns.status, "scheduled"), or(isNull(campaigns.scheduledTime), lte(campaigns.scheduledTime, nowIso))));
};
