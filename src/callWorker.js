// WTC Hub — incoming-call watcher (runs in a Web Worker).
// Why a worker: browsers slow down timers on a page that is hidden, minimised or behind
// other windows (down to once a minute), which is exactly when a call needs to get
// through. Timers inside a worker are not slowed down that way, so this keeps checking
// every couple of seconds no matter what the window is doing. The page itself does the
// ringing when this reports a call.
let cfg = null;
let timer = null;
let inFlight = false;

function schedule(ms) {
  clearTimeout(timer);
  if (!cfg) return;
  timer = setTimeout(tick, ms === undefined ? cfg.interval : ms);
}

async function tick() {
  if (!cfg) return;
  if (inFlight) { schedule(); return; }
  inFlight = true;
  const controller = new AbortController();
  const abort = setTimeout(() => controller.abort(), 8000);
  try {
    const url = cfg.api + '?action=getIncomingCalls&userName=' + encodeURIComponent(cfg.userName) + '&_=' + Date.now();
    const res = await fetch(url, { signal: controller.signal, cache: 'no-store' });
    const data = await res.json();
    if (data && data.status === 'ok') self.postMessage({ type: 'calls', calls: data.calls || [] });
  } catch (e) {
    // network hiccup — try again on the next tick
  } finally {
    clearTimeout(abort);
    inFlight = false;
    schedule();
  }
}

self.onmessage = (event) => {
  const msg = event.data || {};
  if (msg.type === 'start') {
    cfg = { api: msg.api, userName: msg.userName, interval: msg.interval || 2500 };
    schedule(300);
  } else if (msg.type === 'interval' && cfg) {
    cfg.interval = msg.interval;
  } else if (msg.type === 'now' && cfg) {
    schedule(0);
  } else if (msg.type === 'stop') {
    cfg = null;
    clearTimeout(timer);
  }
};
