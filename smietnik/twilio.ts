import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const apiKey = process.env.TWILIO_API_KEY;
const apiSecret = process.env.TWILIO_API_SECRET;

let twilioClient: twilio.Twilio | null = null;

if (apiKey && apiSecret && accountSid) {
  twilioClient = twilio(apiKey, apiSecret, { accountSid });
} else if (accountSid && authToken) {
  twilioClient = twilio(accountSid, authToken);
} else {
  console.warn('Missing Twilio environment variables - Twilio features will be disabled');
}

export { twilioClient };
