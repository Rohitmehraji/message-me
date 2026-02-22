import twilio from "twilio";
import { env } from "../config/env.js";

export type SmsSendResult = {
  success: boolean;
  providerMessageId?: string;
  fromPhone?: string;
  error?: string;
};

export interface SmsProvider {
  sendSms(payload: { to: string; body: string; from?: string }): Promise<SmsSendResult>;
}

class MockProvider implements SmsProvider {
  async sendSms(payload: { to: string; body: string; from?: string }): Promise<SmsSendResult> {
    return {
      success: true,
      providerMessageId: `mock-${Date.now()}`,
      fromPhone: payload.from ?? "+10000000000"
    };
  }
}

class TwilioProvider implements SmsProvider {
  private client = twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN);

  async sendSms(payload: { to: string; body: string; from?: string }): Promise<SmsSendResult> {
    try {
      const message = await this.client.messages.create({
        to: payload.to,
        from: payload.from ?? env.TWILIO_FROM_NUMBER,
        body: payload.body
      });
      return { success: true, providerMessageId: message.sid, fromPhone: message.from };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Twilio send failed" };
    }
  }
}

export const smsProvider: SmsProvider = env.SMS_PROVIDER === "twilio" ? new TwilioProvider() : new MockProvider();
