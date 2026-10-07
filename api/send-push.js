// FILE LOCATION: api/send-push.js  (the "api" folder sits next to "src", at the project root)
//
// Web Push relay. Apps Script (Code.gs) can't sign/encrypt Web Push messages itself, so it
// calls this Vercel function with the target device's subscription + the message, and this
// function signs it with the VAPID keys and hands it to Google/Apple's push service, which
// delivers it to the phone even if the app is closed or the screen is locked.
//
// FIX — this project's package.json has "type": "module", so Vercel runs every .js file as
// an ES module. The previous version used require()/module.exports (CommonJS), which
// crashes instantly in that mode with "500 FUNCTION_INVOCATION_FAILED" — meaning no push
// was ever delivered. This version uses import/export, which is what "type": "module" needs.
//
// Health check: open https://wtc-task-hub.vercel.app/api/send-push in a browser.
//   {"ok":true,"relay":"alive","keysConfigured":true}  → everything is set up correctly.
//   keysConfigured:false → the VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY env vars are missing.
import webpush from 'web-push';

const keysConfigured = () => Boolean(process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-store');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'GET') {
    return res.status(200).json({ ok: true, relay: 'alive', keysConfigured: keysConfigured() });
  }
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'POST only' });

  if (!keysConfigured()) {
    return res.status(200).json({ ok: false, statusCode: 0, error: 'VAPID keys are not set in Vercel environment variables' });
  }

  try {
    let body = req.body;
    if (typeof body === 'string') body = JSON.parse(body || '{}');
    const { subscription, payload } = body || {};
    if (!subscription || !subscription.endpoint) {
      return res.status(400).json({ ok: false, error: 'Missing subscription' });
    }

    webpush.setVapidDetails(
      'mailto:socialmedia@writetrackcreations.com',
      process.env.VAPID_PUBLIC_KEY,
      process.env.VAPID_PRIVATE_KEY
    );

    // Calls go out with HIGH urgency (otherwise Android battery-saver can delay them for
    // minutes) and expire after 60s; everything else is normal urgency, kept for a day.
    const isCall = payload && payload.tag === 'wtc-call';
    await webpush.sendNotification(subscription, JSON.stringify(payload || {}), {
      urgency: isCall ? 'high' : 'normal',
      TTL: isCall ? 60 : 86400
    });
    return res.status(200).json({ ok: true });
  } catch (error) {
    // 404/410 = that device's subscription is gone (app uninstalled, data cleared). The
    // status code is passed back so the backend can delete that dead subscription.
    return res.status(200).json({
      ok: false,
      statusCode: (error && error.statusCode) || 0,
      error: String((error && error.message) || error)
    });
  }
}
