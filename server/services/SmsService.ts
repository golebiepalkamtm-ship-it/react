import twilio from "twilio";

export class SmsService {
  private static instance: SmsService;
  private client: twilio.Twilio;
  private serviceSid: string;

  private constructor() {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    this.serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID || "";

    if (!accountSid || !authToken) {
      console.warn(
        "⚠️ Twilio credentials missing. SMS verification will be mocked.",
      );
      this.client = null as any;
    } else {
      this.client = twilio(accountSid, authToken);
    }
  }

  public static getInstance(): SmsService {
    if (!SmsService.instance) {
      SmsService.instance = new SmsService();
    }
    return SmsService.instance;
  }

  async sendVerificationCode(phone: string): Promise<boolean> {
    if (!this.client || !this.serviceSid) {
      console.log(`[Mock SMS] Sending code to ${phone}`);
      return true;
    }

    try {
      const verification = await this.client.verify.v2
        .services(this.serviceSid)
        .verifications.create({ to: phone, channel: "sms" });
      return verification.status === "pending";
    } catch (error) {
      console.error("Error sending SMS:", error);
      throw error;
    }
  }

  async verifyCode(phone: string, code: string): Promise<boolean> {
    if (!this.client || !this.serviceSid) {
      console.log(`[Mock SMS] Verifying code ${code} for ${phone}`);
      return code === "000000" || code === "123456";
    }

    try {
      const verificationCheck = await this.client.verify.v2
        .services(this.serviceSid)
        .verificationChecks.create({ to: phone, code });
      return verificationCheck.status === "approved";
    } catch (error) {
      console.error("Error verifying SMS code:", error);
      throw error;
    }
  }
}

export const smsService = SmsService.getInstance();
