#!/usr/bin/env node
// Simple helper to trigger Twilio Verify SMS from the CLI.
// Usage: node sendVerify.js +48123456789

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const apiKey = process.env.TWILIO_API_KEY;
const apiSecret = process.env.TWILIO_API_SECRET;
const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID; // e.g. VA...
const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID; // e.g. MG...
const fromNumber = process.env.TWILIO_PHONE_NUMBER; // fallback sender number

if (!accountSid || (!authToken && !(apiKey && apiSecret))) {
  console.error('Missing Twilio credentials in environment.');
  process.exit(1);
}

if (!verifyServiceSid) {
  console.error('Missing TWILIO_VERIFY_SERVICE_SID in environment. Create a Verify service in Twilio and set TWILIO_VERIFY_SERVICE_SID.');
  process.exit(1);
}

const to = process.argv[2];
if (!to) {
  console.error('Usage: node sendVerify.js +48XXXXXXXX');
  process.exit(1);
}

const client = apiKey && apiSecret
  ? require('twilio')(apiKey, apiSecret, { accountSid })
  : require('twilio')(accountSid, authToken);

(async () => {
  try {
    // If your Verify service is not configured with a Messaging Service, Twilio may require
    // a Messaging Service SID or a `from` phone number. Prefer messagingServiceSid if available.
    if (!messagingServiceSid && !fromNumber) {
      console.error('Twilio Messaging Service SID or TWILIO_PHONE_NUMBER is required to send SMS from Verify.');
      console.error('Either set TWILIO_MESSAGING_SERVICE_SID or TWILIO_PHONE_NUMBER in your env.');
      console.error('To create a Messaging Service: Console > Messaging > Services > Create Service, then add your phone number.');
      process.exit(1);
    }

    const params = { to, channel: 'sms' };
    // Some Verify configurations require specifying messagingServiceSid; add if present.
    if (messagingServiceSid) params.messagingServiceSid = messagingServiceSid;
    // If messagingServiceSid not set but a phone number is available, Verify can sometimes use `from`.
    if (!messagingServiceSid && fromNumber) params.from = fromNumber;

    const verification = await client.verify.v2.services(verifyServiceSid).verifications.create(params);
    console.log('Verification created:', verification.sid);
  } catch (err) {
    console.error('Error creating verification:', err.message || err);
    process.exit(1);
  }
})();
