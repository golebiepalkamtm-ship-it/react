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

  private normalizePhone(phone: string): string {
    // Usuwamy spacje, myślniki i inne znaki poza cyframi i plusem
    let normalized = phone.replace(/[^\d+]/g, "");
    // Jeśli nie ma plusa na początku, a zaczyna się od 48, dodajemy plus
    if (!normalized.startsWith("+") && normalized.startsWith("48")) {
      normalized = "+" + normalized;
    }
    return normalized;
  }

  async sendVerificationCode(phone: string): Promise<boolean> {
    const cleanPhone = this.normalizePhone(phone);

    if (!this.client || !this.serviceSid) {
      console.log(`[Mock SMS] Sending code to ${cleanPhone}`);
      return true;
    }

    try {
      console.log(`[SmsService] Sending code to: ${cleanPhone}`);
      const verification = await this.client.verify.v2
        .services(this.serviceSid)
        .verifications.create({ to: cleanPhone, channel: "sms" });
      return verification.status === "pending";
    } catch (error: any) {
      console.error("Error sending SMS:", error);
      throw new Error(`Błąd wysyłania SMS: ${error.message}`);
    }
  }

  async verifyCode(phone: string, code: string): Promise<boolean> {
    const cleanPhone = this.normalizePhone(phone);

    if (!this.client || !this.serviceSid) {
      console.log(`[Mock SMS] Verifying code ${code} for ${cleanPhone}`);
      return code === "000000" || code === "123456";
    }

    try {
      console.log(`[SmsService] Verifying code ${code} for: ${cleanPhone}`);
      const verificationCheck = await this.client.verify.v2
        .services(this.serviceSid)
        .verificationChecks.create({ to: cleanPhone, code });

      console.log(
        `[SmsService] Verification status: ${verificationCheck.status}`,
      );
      return verificationCheck.status === "approved";
    } catch (error: any) {
      console.error("Error verifying SMS code:", error);
      // Jeśli kod jest nieprawidłowy, Twilio rzuca błąd 404 lub 400.
      // Zamiast rzucać błędem (500 na froncie), zwracamy false.
      if (error.status === 404 || error.status === 400) {
        return false;
      }
      throw new Error(`Błąd weryfikacji Twilio: ${error.message}`);
    }
  }
}

export const smsService = SmsService.getInstance();
