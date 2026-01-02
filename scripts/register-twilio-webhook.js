#!/usr/bin/env node
/*
Register Twilio phone number SMS webhook to point to your public server URL.
Usage: node scripts/register-twilio-webhook.js https://your-public-url
Requires env: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER
*/

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const apiKey = process.env.TWILIO_API_KEY;
const apiSecret = process.env.TWILIO_API_SECRET;
const phoneNumber = process.env.TWILIO_PHONE_NUMBER;
const publicUrl = process.argv[2];

if (!accountSid || (!authToken && !(apiKey && apiSecret))) {
  console.error('Missing Twilio credentials in environment');
  process.exit(1);
}
if (!phoneNumber) {
  console.error('Missing TWILIO_PHONE_NUMBER in environment');
  process.exit(1);
}
if (!publicUrl) {
  console.error('Usage: node scripts/register-twilio-webhook.js https://your-public-url');
  process.exit(1);
}

const client = apiKey && apiSecret
  ? require('twilio')(apiKey, apiSecret, { accountSid })
  : require('twilio')(accountSid, authToken);

async function run() {
  try {
    const list = await client.incomingPhoneNumbers.list({ phoneNumber, limit: 20 });
    if (!list || list.length === 0) {
      console.error('No IncomingPhoneNumber found for', phoneNumber);
      process.exit(1);
    }
    const sid = list[0].sid;
    const smsUrl = `${publicUrl.replace(/\/$/, '')}/api/twilio/incoming`;
    const res = await client.incomingPhoneNumbers(sid).update({ smsUrl, smsMethod: 'POST' });
    console.log('Updated IncomingPhoneNumber', res.sid, 'smsUrl ->', smsUrl);
  } catch (err) {
    console.error('Failed to register webhook:', err.message || err);
    process.exit(1);
  }
}

run();
