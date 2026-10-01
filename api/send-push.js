// FIX — Web Push relay. Apps Script (Code.gs) cannot sign/encrypt Web Push messages
// itself, so it calls this tiny Vercel function instead, passing the target device's
// subscription + the notification content. This function does the actual signing (via
// VAPID keys) and sending, using the `web-push` library, then Google/Apple's push
// service delivers it straight to that device — even if the WTC Hub tab is closed or
// the phone is locked. That's what makes calling/alerts reliable instead of depending
// on a browser tab's polling timer staying alive.
//
// FILE LOCATION: save this as  api/send-push.js  in the project (the "api" folder sits
// next to "src", at the project root — same level as package.json). Vercel automatically
// turns anything in /api into a serverless function; no extra config needed.
const webpush = require('web-push');

webpush.setVapidDetails(
  'mailto:socialmedia@writetrackcreations.com',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

module.exports = async function handler(req, res) {
  // CORS — Apps Script's UrlFetchApp calls this server-to-server (not from a browser),
  // but this keeps the endpoint usable from anywhere without extra setup.
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'POST only' });

  try {
    let body = req.body;
    if (typeof body === 'string') body = JSON.parse(body);
    const { subscription, payload } = body || {};
    if (!subscription || !subscription.endpoint) {
      return res.status(400).json({ ok: false, error: 'Missing subscription' });
    }
    // Calls are sent with HIGH urgency — without this, Android's battery-saver ("doze")
    // can hold a push back for minutes, which is one cause of "sometimes it never rang".
    // A call push also expires after 60s (no point ringing a phone for a call that's over).
    const isCall = payload && payload.tag === 'wtc-call';
    await webpush.sendNotification(subscription, JSON.stringify(payload || {}), {
      urgency: isCall ? 'high' : 'normal',
      TTL: isCall ? 60 : 86400
    });
    return res.status(200).json({ ok: true });
  } catch (error) {
    // A 404/410 here just means that device's subscription expired (uninstalled the
    // app, cleared site data, etc.). statusCode is passed back so the backend can
    // delete that dead subscription and stop wasting time pushing to it.
    return res.status(200).json({
      ok: false,
      statusCode: (error && error.statusCode) || 0,
      error: String((error && error.message) || error)
    });
  }
};
