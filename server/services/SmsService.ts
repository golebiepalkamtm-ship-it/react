import twilio from "twilio";
import { validatedEnv } from "../lib/env.js";
import logger from "../lib/logger.js";

export interface SMSService {
  sendVerificationCode(phone: string): Promise<boolean>;
  verifyCode(phone: string, code: string): Promise<boolean>;
  sendAuctionWonNotification(
    phone: string,
    auctionTitle: string,
    finalPrice: number,
    sellerInfo: { name: string; phone: string },
  ): Promise<boolean>;
  sendCustomSMS(phone: string, message: string): Promise<boolean>;
}

export class SmsService implements SMSService {
  private static instance: SmsService;
  private client: twilio.Twilio | null = null;
  private serviceSid: string;
  private isProduction: boolean;

  private constructor() {
    const accountSid = validatedEnv.TWILIO_ACCOUNT_SID;
    const authToken = validatedEnv.TWILIO_AUTH_TOKEN;
    this.serviceSid = validatedEnv.TWILIO_VERIFY_SERVICE_SID || "";
    this.isProduction = validatedEnv.NODE_ENV === "production";

    if (!accountSid || !authToken) {
      logger.warn(
        "⚠️ Twilio credentials missing. SMS verification will be mocked.",
      );
    } else {
      try {
        this.client = twilio(accountSid, authToken);
        logger.info("✅ Twilio client initialized successfully.");
      } catch (error) {
        logger.error("❌ Failed to initialize Twilio client:", error);
      }
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
    // Jeśli nie ma plusa na początku, a zaczyna się od 48 (Polska), dodajemy plus
    if (
      !normalized.startsWith("+") &&
      normalized.length === 11 &&
      normalized.startsWith("48")
    ) {
      normalized = "+" + normalized;
    } else if (!normalized.startsWith("+") && normalized.length === 9) {
      // Jeśli ma 9 cyfr, zakładamy że to polski numer bez kierunkowego
      normalized = "+48" + normalized;
    }
    return normalized;
  }

  async sendVerificationCode(phone: string): Promise<boolean> {
    const cleanPhone = this.normalizePhone(phone);

    // W trybie deweloperskim, jeśli brakuje kluczy, udajemy wysyłkę
    if (!this.client || !this.serviceSid) {
      if (this.isProduction) {
        logger.error(
          "❌ Twilio not configured in PRODUCTION. Cannot send SMS.",
        );
        return false;
      }
      logger.info(`[Mock SMS] Sending verification code to ${cleanPhone}`);
      return true;
    }

    try {
      logger.info(`[SmsService] Sending code to: ${cleanPhone}`);
      const verification = await this.client.verify.v2
        .services(this.serviceSid)
        .verifications.create({ to: cleanPhone, channel: "sms" });
      return verification.status === "pending";
    } catch (error: any) {
      logger.error("Error sending SMS via Twilio:", error);
      // W wersji "normalnej" nie rzucamy błędem blokującym, ale logujemy
      if (!this.isProduction) {
        logger.info("[Mock Fallback] Continuing despite Twilio error.");
        return true;
      }
      throw new Error(`Błąd wysyłania SMS: ${error.message}`);
    }
  }

  async verifyCode(phone: string, code: string): Promise<boolean> {
    const cleanPhone = this.normalizePhone(phone);

    // Bypass dla testów/developera
    if (!this.isProduction) {
      if (code === "000000" || code === "123456") {
        logger.info(`[Mock SMS] Verified code ${code} (Developer Bypass)`);
        return true;
      }
    }

    if (!this.client || !this.serviceSid) {
      if (this.isProduction) return false;
      return code === "000000" || code === "123456";
    }

    try {
      logger.info(`[SmsService] Verifying code for: ${cleanPhone}`);
      const verificationCheck = await this.client.verify.v2
        .services(this.serviceSid)
        .verificationChecks.create({ to: cleanPhone, code });

      logger.info(
        `[SmsService] Verification status for ${cleanPhone}: ${verificationCheck.status}`,
      );
      return verificationCheck.status === "approved";
    } catch (error: any) {
      logger.error("Error verifying SMS code:", error);
      if (error.status === 404 || error.status === 400) {
        return false;
      }
      if (!this.isProduction) return code === "123456";
      return false;
    }
  }

  async sendAuctionWonNotification(
    phone: string,
    auctionTitle: string,
    finalPrice: number,
    sellerInfo: { name: string; phone: string },
  ): Promise<boolean> {
    const message = `🎉 Gratulacje! Wygrałeś aukcję "${auctionTitle}" za ${finalPrice.toLocaleString("pl-PL")} zł. Sprzedający: ${sellerInfo.name}, tel: ${sellerInfo.phone}. Skontaktuj się w celu finalizacji.`;

    return this.sendCustomSMS(phone, message);
  }

  async sendCustomSMS(phone: string, message: string): Promise<boolean> {
    const cleanPhone = this.normalizePhone(phone);

    if (!this.client) {
      if (this.isProduction) {
        logger.error("❌ Twilio client missing in PRODUCTION.");
        return false;
      }
      logger.info(`[Mock SMS] Messaging ${cleanPhone}: ${message}`);
      return true;
    }

    try {
      await this.client.messages.create({
        body: message,
        from: validatedEnv.TWILIO_PHONE_NUMBER || "+48732071591",
        to: cleanPhone,
      });

      logger.info(
        `✅ SMS sent to ${cleanPhone}: ${message.substring(0, 50)}...`,
      );
      return true;
    } catch (error: any) {
      logger.error("Error sending custom SMS:", error.message);
      if (this.isProduction) return false;
      return true;
    }
  }
}

export const smsService = SmsService.getInstance();
