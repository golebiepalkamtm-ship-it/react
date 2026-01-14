import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const apiKey = process.env.TWILIO_API_KEY;
const apiSecret = process.env.TWILIO_API_SECRET;
const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

// Development mode - allow missing credentials
if (!accountSid || (!authToken && (!apiKey || !apiSecret))) {
  console.warn('Twilio credentials not found - SMS functionality disabled');
}

let client: any = null;
try {
  if (accountSid && authToken && accountSid.startsWith('AC')) {
    client = twilio(accountSid, authToken);
  } else if (accountSid && apiKey && apiSecret && accountSid.startsWith('AC')) {
    // Authenticate using API Key & Secret
    client = twilio(apiKey, apiSecret, { accountSid: accountSid });
  } else if (accountSid || authToken || apiKey) {
    console.warn('Invalid Twilio credentials provided. Need Account SID + (Auth Token OR API Key/Secret)');
  }
} catch (error) {
  console.warn('Failed to initialize Twilio client:', error);
}

export interface SMSService {
  sendVerificationCode(phone: string): Promise<boolean>;
  verifyCode(phone: string, code: string): Promise<boolean>;
  sendAuctionWonNotification(phone: string, auctionTitle: string, finalPrice: number, sellerInfo: { name: string; phone: string }): Promise<boolean>;
  sendCustomSMS(phone: string, message: string): Promise<boolean>;
}

class TwilioSMSService implements SMSService {
  async sendVerificationCode(phone: string): Promise<boolean> {
    if (!client || !verifyServiceSid) {
      console.warn('SMS service not available - verification code not sent');
      return false;
    }

    try {
      await client.verify.v2.services(verifyServiceSid).verifications.create({
        to: phone,
        channel: 'sms'
      });
      console.log(`Verification code sent to ${phone}`);
      return true;
    } catch (error: any) {
      console.error('Error sending verification code:', error.message);
      throw error;
    }
  }

  async verifyCode(phone: string, code: string): Promise<boolean> {
    if (!client || !verifyServiceSid) {
      console.warn('SMS service not available - code verification failed');
      return false;
    }

    try {
      const verification = await client.verify.v2.services(verifyServiceSid).verificationChecks.create({
        to: phone,
        code: code
      });
      
      console.log(`Code verification for ${phone}: ${verification.status}`);
      return verification.status === 'approved';
    } catch (error: any) {
      console.error('Error verifying code:', error.message);
      throw error;
    }
  }

  async sendAuctionWonNotification(phone: string, auctionTitle: string, finalPrice: number, sellerInfo: { name: string; phone: string }): Promise<boolean> {
    const message = `🎉 Gratulacje! Wygrałeś aukcję "${auctionTitle}" za ${finalPrice.toLocaleString('pl-PL')} zł. Sprzedający: ${sellerInfo.name}, tel: ${sellerInfo.phone}. Skontaktuj się w celu finalizacji.`;

    return this.sendCustomSMS(phone, message);
  }

  async sendCustomSMS(phone: string, message: string): Promise<boolean> {
    if (!client) {
      console.warn('SMS service not available - message not sent');
      return false;
    }

    try {
      await client.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER || '+15017122661', // Twilio phone number
        to: phone
      });
      
      console.log(`SMS sent to ${phone}: ${message.substring(0, 50)}...`);
      return true;
    } catch (error: any) {
      console.error('Error sending SMS:', error.message);
      throw error;
    }
  }
}

// Export real Twilio service - no mock fallback
export const smsService: SMSService = new TwilioSMSService();
