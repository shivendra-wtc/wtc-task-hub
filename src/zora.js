// ============================================================
// Zora — WTC Hub's assistant (runs fully inside the app, no paid service).
//   1. Task assignment: understands a typed or spoken sentence such as
//      "Naman ko Rudra reel edit karna hai, high priority, Thursday tak, AG Insta"
//      and fills the New Task form. A person always reviews and presses Create.
//   2. Questions: answers rules / policies / "my day" questions from the built-in
//      knowledge below plus notes added by HR, PC or Shivendra ("Teach Zora").
// ============================================================

const WEEKDAYS = [
  ['sunday', 'sun', 'ravivar', 'itwar', 'itvaar', 'raviwar'],
  ['monday', 'mon', 'somvar', 'somwar', 'somvaar'],
  ['tuesday', 'tue', 'tues', 'mangalvar', 'mangalwar', 'mangal'],
  ['wednesday', 'wed', 'budhvar', 'budhwar', 'budh'],
  ['thursday', 'thu', 'thur', 'thurs', 'guruvar', 'guruwar', 'brihaspativar', 'veervar', 'virvar'],
  ['friday', 'fri', 'shukravar', 'shukrawar', 'shukra'],
  ['saturday', 'sat', 'shanivar', 'shaniwar', 'shani']
];
const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

export function normalizeText(s) {
  return ' ' + String(s || '')
    .toLowerCase()
    .replace(/[’'`]/g, '')
    .replace(/[^a-z0-9:/\u0900-\u097f]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim() + ' ';
}

const dKey = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

function levenshtein(a, b) {
  if (a === b) return 0;
  const m = a.length, n = b.length;
  if (!m) return n;
  if (!n) return m;
  let prev = Array.from({ length: n + 1 }, (_, i) => i);
  for (let i = 1; i <= m; i++) {
    const cur = [i];
    for (let j = 1; j <= n; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    prev = cur;
  }
  return prev[n];
}

// Removes the first whole-phrase match of `re` from the padded text and returns the match.
function take(state, re) {
  const m = state.text.match(re);
  if (!m) return null;
  state.text = state.text.slice(0, m.index) + ' ' + state.text.slice(m.index + m[0].length);
  state.text = state.text.replace(/\s+/g, ' ');
  if (!state.text.startsWith(' ')) state.text = ' ' + state.text;
  if (!state.text.endsWith(' ')) state.text += ' ';
  return m;
}

function channelAliases(name) {
  const base = normalizeText(name).trim().replace(/\bthe\b/g, '').replace(/\s+/g, ' ').trim();
  const out = new Set([base]);
  const swaps = [
    [/\binsta\b/, ['instagram', 'ig', 'insta']],
    [/\byt\b/, ['youtube', 'yt', 'you tube']],
    [/\bfb\b/, ['facebook', 'fb']],
    [/\bfact tree\b/, ['fact tree', 'facttree', 'tft']],
    [/\b7cs\b/, ['7cs', '7c', 'seven cs', '7 cs']]
  ];
  let changed = true;
  let guard = 0;
  while (changed && guard++ < 4) {
    changed = false;
    for (const a of Array.from(out)) {
      for (const [re, alts] of swaps) {
        if (re.test(a)) {
          for (const alt of alts) {
            const v = a.replace(re, alt);
            if (!out.has(v)) { out.add(v); changed = true; }
          }
        }
      }
    }
  }
  return Array.from(out).filter(a => a.length >= 2);
}

// Is this sentence a request to create a task? (only used for PC / Shivendra / HR)
export function looksLikeTaskCommand(text, team) {
  const t = normalizeText(text);
  if (/\b(assign|give|create|add|new task|allot|de do|dedo|dena|sauNpo|saunpo)\b/.test(t)) return true;
  if (/^ (task|kaam) /.test(t)) return true;
  const hasName = (team || []).some(m => {
    const first = normalizeText(m.displayName || m.name).trim().split(' ')[0];
    return first.length >= 3 && t.includes(' ' + first + ' ');
  });
  const isQuestion = /\?|^ (what|when|how|why|who|kya|kab|kaise|kyu|kitne|kitna|can|is|are|do|does) /.test(' ' + String(text || '').toLowerCase().trim() + ' ');
  const everyone = /\b(sabko|sab ko|everyone|whole team|poori team)\b/.test(t);
  return (hasName || everyone) && !isQuestion && /\b(ko|for|to|edit|post|reel|video|thumbnail|design|script|caption|upload|banana|bana|karna|kar|karo|schedule|send|bhejna|bhej|likhna|likh|call|prepare|make|write|check|review|update|finish|complete)\b/.test(t);
}

// Turns a sentence into task fields. Never invents anything: unknown parts are left
// empty and listed in `missing`, so the form shows them as still to fill.
export function parseTaskCommand(text, { team = [], channels = [], today = new Date(), me = '' } = {}) {
  const state = { text: normalizeText(text) };
  const result = { assignees: [], taskDetails: '', priority: 'Medium', priorityHeard: false, targetDate: '', dateHeard: '', channels: [], category: '', missing: [] };

  // --- priority
  if (take(state, /\b(high|urgent|important|jaldi|asap|zaruri|zaroori|top) (priority )?/)) { result.priority = 'High'; result.priorityHeard = true; }
  else if (take(state, /\b(low|no rush|baad mein|aaram se|kam) priority\b|\blow\b/)) { result.priority = 'Low'; result.priorityHeard = true; }
  else if (take(state, /\b(medium|normal) (priority )?/)) { result.priority = 'Medium'; result.priorityHeard = true; }
  take(state, /\bpriority\b/);

  // --- date
  const base = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 12);
  const plus = (n) => { const d = new Date(base); d.setDate(d.getDate() + n); return d; };
  let date = null;
  let m;
  if ((m = take(state, /\b(day after tomorrow|parso|parson) /))) { date = plus(2); result.dateHeard = m[1]; }
  else if ((m = take(state, /\b(tomorrow|tmrw|kal) /))) { date = plus(1); result.dateHeard = m[1]; }
  else if ((m = take(state, /\b(today|aaj|aj|tonight|eod|end of day) /))) { date = plus(0); result.dateHeard = m[1]; }
  else if ((m = take(state, /\b(in|within|agle) (\d{1,2}) (days?|din) (mein|me|main)? ?/))) { date = plus(Number(m[2])); result.dateHeard = m[0].trim(); }
  else if ((m = take(state, /\bnext week\b|\bagle hafte\b|\bagle week\b/))) {
    const d = plus(1); while (d.getDay() !== 1) d.setDate(d.getDate() + 1); date = d; result.dateHeard = m[0].trim();
  }
  else if ((m = take(state, /\b(end of (the )?month|month end|mahine ke end)\b/))) { date = new Date(base.getFullYear(), base.getMonth() + 1, 0, 12); result.dateHeard = m[0].trim(); }
  else if ((m = take(state, /\b(end of (the )?week|week end|weekend)\b/))) { const d = new Date(base); while (d.getDay() !== 6) d.setDate(d.getDate() + 1); date = d; result.dateHeard = m[0].trim(); }
  if (!date) {
    // 25 nov / 25th november / nov 25 / 25/11
    const monRe = '(' + MONTHS.join('|') + ')[a-z]*';
    if ((m = take(state, new RegExp('\\b(\\d{1,2})(st|nd|rd|th)? (of )?' + monRe + '\\b')))) {
      date = new Date(base.getFullYear(), MONTHS.indexOf(m[4]), Number(m[1]), 12); result.dateHeard = m[0].trim();
    } else if ((m = take(state, new RegExp('\\b' + monRe + ' (\\d{1,2})(st|nd|rd|th)?\\b')))) {
      date = new Date(base.getFullYear(), MONTHS.indexOf(m[1]), Number(m[2]), 12); result.dateHeard = m[0].trim();
    } else if ((m = take(state, /\b(\d{1,2})\/(\d{1,2})(\/\d{2,4})?\b/))) {
      date = new Date(base.getFullYear(), Number(m[2]) - 1, Number(m[1]), 12); result.dateHeard = m[0].trim();
    } else if ((m = take(state, /\b(\d{1,2})(st|nd|rd|th) /))) {
      date = new Date(base.getFullYear(), base.getMonth(), Number(m[1]), 12);
      if (date < base) date = new Date(base.getFullYear(), base.getMonth() + 1, Number(m[1]), 12);
      result.dateHeard = m[0].trim();
    }
    if (date && date < base && result.dateHeard && !/\d{4}/.test(result.dateHeard)) date.setFullYear(date.getFullYear() + 1);
  }
  if (!date) {
    for (let i = 0; i < 7 && !date; i++) {
      for (const w of WEEKDAYS[i]) {
        if ((m = take(state, new RegExp('\\b(this |next |agle |is )?' + w + '\\b')))) {
          let diff = (i - base.getDay() + 7) % 7;
          if (diff === 0) diff = 7;
          date = plus(diff);
          result.dateHeard = m[0].trim();
          break;
        }
      }
    }
  }
  if (date && !isNaN(date.getTime())) result.targetDate = dKey(date);

  // --- channels (longest names first, so "AG Shorts YT" wins over "AG YT")
  const chanList = [];
  channels.forEach(ch => channelAliases(ch).forEach(a => chanList.push({ ch, a })));
  chanList.sort((x, y) => y.a.length - x.a.length);
  for (const { ch, a } of chanList) {
    if (result.channels.includes(ch)) continue;
    const re = new RegExp('\\b' + a.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/ /g, '\\s+') + '\\b');
    if (re.test(state.text)) { take(state, re); result.channels.push(ch); }
  }

  // --- people (exact first name, full name, then close spellings)
  const people = team.map(p => {
    const full = normalizeText(p.displayName || p.name).trim();
    const first = full.split(' ')[0];
    return { p, full, first, short: normalizeText(p.avatar || '').trim() };
  });
  if ((m = take(state, /\b(me|myself|mujhe|mere liye|khud) /)) && me) result.assignees.push(me);
  for (const x of people.slice().sort((a, b) => b.full.length - a.full.length)) {
    const name = x.p.name;
    if (result.assignees.includes(name)) continue;
    const reFull = new RegExp('\\b' + x.full.replace(/ /g, '\\s+') + '\\b');
    const reFirst = new RegExp('\\b' + x.first + '(ji)?\\b');
    if (x.full.length >= 3 && reFull.test(state.text)) { take(state, reFull); result.assignees.push(name); continue; }
    if (x.first.length >= 3 && reFirst.test(state.text)) { take(state, reFirst); result.assignees.push(name); continue; }
    if (x.first.length <= 2 && new RegExp('\\b' + x.first + '\\b').test(state.text) && /\b(ko|for|to)\b/.test(state.text)) {
      take(state, new RegExp('\\b' + x.first + '\\b')); result.assignees.push(name);
    }
  }
  if (result.assignees.length === 0) {
    // close spellings, e.g. "priyanka" heard as "priyanca", "naman" as "namman"
    const words = state.text.trim().split(' ');
    for (const w of words) {
      if (w.length < 4) continue;
      const hit = people.find(x => x.first.length >= 4 && levenshtein(w, x.first) <= (x.first.length >= 7 ? 2 : 1));
      if (hit && !result.assignees.includes(hit.p.name)) {
        take(state, new RegExp('\\b' + w + '\\b'));
        result.assignees.push(hit.p.name);
      }
    }
  }
  if (/\b(everyone|everybody|sabko|sab ko|all team|whole team|poori team)\b/.test(state.text)) {
    take(state, /\b(everyone|everybody|sabko|sab ko|all team|whole team|poori team)\b/);
    team.filter(p => !p.isAdmin && String(p.name).length > 2).forEach(p => { if (!result.assignees.includes(p.name)) result.assignees.push(p.name); });
  }

  // --- whatever is left is the task itself
  let rest = state.text
    .replace(/\b(hey |hi |ok |okay )?zora\b/g, ' ')
    .replace(/\b(please|plz|pls|kindly)\b/g, ' ')
    .replace(/\b(deadline|due date|due|target date|by date)\b/g, ' ')
    .replace(/\bchannel\b/g, ' ')
    .replace(/\s+/g, ' ').trim();
  const lead = /^(assign|give|create|add|allot|new|a|an|the|task|kaam|to|for|ko|ki|ka|ke|ek|and|,)\b\s*/;
  const trail = /\s*\b(ko|to|for|by|on|till|until|tak|se|before|and|ka|ki|ke|liye|ke liye|karna hai|karna|karni hai|kar do|kardo|karo|kar dena|de do|dedo|dena|hai|hain|chahiye|task|assign|is|be|done|wala|wali)$/;
  let guard = 0;
  while (guard++ < 12) {
    const before = rest;
    rest = rest.replace(lead, '').replace(trail, '').trim();
    if (rest === before) break;
  }
  rest = rest.replace(/\s+\b(ko|ke liye)\b\s+/g, ' ').replace(/\s{2,}/g, ' ').trim();
  result.taskDetails = rest ? rest.charAt(0).toUpperCase() + rest.slice(1) : '';

  // --- category guess (only fills the form; can be changed)
  const all = normalizeText(text);
  if (/\b(reel|video|edit|post|thumbnail|caption|story|shorts?|carousel|upload|instagram|youtube|insta|yt|fb|design|script)\b/.test(all)) result.category = 'Social Media';
  else if (/\b(call|phone)\b/.test(all)) result.category = 'Calls';
  else if (/\b(meeting|meet)\b/.test(all)) result.category = 'Meeting';
  else if (/\b(mail|email)\b/.test(all)) result.category = 'Mails';
  else if (/\b(bank|payment|invoice)\b/.test(all)) result.category = 'Banking';

  if (!result.assignees.length) result.missing.push('person');
  if (!result.taskDetails) result.missing.push('task');
  if (!result.targetDate) result.missing.push('date');
  return result;
}

// ------------------------------------------------------------
// Questions
// ------------------------------------------------------------
// Things Zora never discusses: how the app is built / where data lives / which tools,
// and requests to change someone's access. Answered with one polite line.
const PRIVATE_TOPICS = /\b(source ?code|coding|github|vercel|apps? ?script|google sheets?|spreadsheet|database|backend|server|api|tech stack|programming|developer|kisne banaya|kisne banai|who (made|created|built|developed) (this|you|the app|wtc hub)|how (was|is|were) (this|it|you|the app|wtc hub) (made|built|created|developed)|kaise bana|kaise banaya|which ai|kaunsa ai|chatgpt|gpt|openai|claude|gemini|anthropic|llm|ai model|hack|password|login details|admin access|make me admin|admin bana|give me access|grant access|access de do|change (my )?access|change (my )?permissions?)\b/;

const STOP = new Set(('a an the is are am was were be to of for in on at by and or with my me i you your what when how why who which can do does did should will would kya kab kaise kyu kyun kitne kitna kitni hai hain ho mera meri mere mujhe ko ka ki ke se me mein main tell please plz about batao bataiye bolo zora hey hi hello').split(' '));

function tokens(s) {
  return normalizeText(s).trim().split(' ').filter(w => w && !STOP.has(w)).map(w => w.replace(/(ing|es|s)$/, ''));
}

// Built-in knowledge. `a` is plain text, or a function(ctx) for answers about "my" data.
export const BUILTIN_KNOWLEDGE = [
  { id: 'shift', k: 'shift timing office time sign in signin start time flexible kitne baje aana office aana join time 9 10 working hours hours', q: 'What are the office timings?',
    a: 'Our shift is flexible: sign in any time between 9:00 and 10:14 AM. You sign out 9 h 15 min after your 15-minute slot — before 9:00 → 6:00 PM, 9:00–9:14 → 6:15 PM, 9:15–9:29 → 6:30 PM, 9:30–9:44 → 6:45 PM, 9:45–9:59 → 7:00 PM, 10:00–10:14 → 7:15 PM. Lunch is 30 minutes; the rest is working time.' },
  { id: 'signout', k: 'sign out signout when go home kab jaana out time my sign out kitne baje jaana ghar', q: 'When can I sign out today?', a: (c) => c.mySignOut() },
  { id: 'late', k: 'late cut quarter half day 10:15 11 after late aana der quarter day deduction', q: 'What happens if I come late?',
    a: 'Sign in by 10:14 AM for a full day. Signing in 10:15–11:00 AM cuts ¼ day, after 11:00 AM cuts ½ day — in both cases sign-out is 7:15 PM.' },
  { id: 'lunch', k: 'lunch break khana food 1 2 pm 30 minutes lunch time lunch rule', q: 'What are the lunch rules?', a: (c) => c.lunchAnswer() },
  { id: 'nolunch', k: 'forgot lunch lunch not marked deducted bhool gaya lunch mark', q: 'What if I forget to mark lunch?',
    a: 'If no lunch is marked by 2:00 PM, 1:00–1:30 PM is counted as lunch automatically and it adds a strike. Lunch can only be started between 1:00 and 2:00 PM, once a day.' },
  { id: 'forgotsignout', k: 'forgot sign out bhool gaya signout missed auto closed night', q: 'What if I forget to sign out?',
    a: 'A forgotten sign-out is closed automatically at night at your sign-out time and counts as a strike. If you actually stayed later, open My record → Request correction and add the time you left; HR can approve it.' },
  { id: 'early', k: 'early leave jaldi jaana before time left early early sign out', q: 'Can I leave before my sign-out time?',
    a: 'Leaving before your sign-out time counts as an early sign-out (1 strike). If you need to leave early, inform HR/your manager — they can mark a Half Day or leave so no strike is added.' },
  { id: 'strikes', k: 'strike strikes penalty deduction half day salary cut discipline rule 3 strikes', q: 'How do strikes work?',
    a: 'Each of these is 1 strike: long lunch (over 35 min), lunch not marked, forgot to sign out, left before sign-out time. Every 3 strikes in a month = ½ day deduction. Late arrival is a direct ¼ or ½ day cut. HR can excuse a strike if you request a correction with a genuine reason.' },
  { id: 'mystrikes', k: 'my strikes my record kitne strike mera record my deduction', q: 'How many strikes do I have?', a: (c) => c.myStrikes() },
  { id: 'correction', k: 'correction wrong flag excuse request mistake galat appeal', q: 'How do I correct a wrong flag?',
    a: 'Tap “My record” on your attendance card → Request correction on that flag → write the reason (and actual time if you forgot to sign out) → Send to HR. You’ll get a notification when it is approved or rejected.' },
  { id: 'sunday', k: 'sunday week off weekly off ravivar holiday extra day', q: 'Is Sunday off?',
    a: 'Sunday is the weekly off — no one needs to sign in. If you do come and work on a Sunday or a holiday, just sign in: it is counted as an extra working day.' },
  { id: 'saturday', k: 'saturday off shanivar saturday leave one saturday month', q: 'Can I take a Saturday off?', a: (c) => c.saturdayAnswer() },
  { id: 'leave', k: 'leave chutti casual sick paid unpaid half day wfh work from home apply leave how to take leave', q: 'How do I take leave?',
    a: 'Tell HR (Pari) or your manager in advance. HR marks your leave in the app — Casual, Sick, Paid, Unpaid, Half Day, Work From Home, Official Duty or Comp Off. On a leave day you get no attendance flags. Your monthly Saturday off you can book yourself from your attendance card.' },
  { id: 'holiday', k: 'holiday next holiday chutti festival upcoming holiday list', q: 'When is the next holiday?', a: (c) => c.nextHoliday() },
  { id: 'mytasks', k: 'my tasks pending task kaam kitne task delayed today due mera kaam', q: 'What are my pending tasks?', a: (c) => c.myTasks() },
  { id: 'remind', k: 'remind reminder nudge follow up task reminder button', q: 'How do I remind someone about a task?',
    a: 'Open the task you assigned and press “Remind”. The person gets a sound, a notification and a “Reminded” mark on the card. You can remind the same task once every 10 minutes.' },
  { id: 'targets', k: 'target targets goal monthly target set target progress', q: 'How do targets work?', a: (c) => c.myTargets() },
  { id: 'calendar', k: 'content calendar post schedule publish published link live link entry', q: 'How do I use the Content Calendar?',
    a: 'Open “Content” at the top. Tap a day to add an entry, tap an entry to edit it. Add the Final link and, after posting, the Live post link. When an entry is marked Published, its linked task is completed automatically. Solid blocks are long videos, light blocks are Reels/Shorts; 🔗 shows a link is added.' },
  { id: 'call', k: 'call calling ring incoming call summon cabin', q: 'How do calls work?',
    a: 'When PC or Shivendra calls you, the app rings full-screen with sound. Tap “Coming” or “Busy”. Keep notifications allowed for WTC Hub so calls reach you even when the app is minimised or your phone is locked.' },
  { id: 'notif', k: 'notification notifications alert sound not coming bell clear', q: 'Notifications are not coming — what should I do?',
    a: 'Allow notifications for WTC Hub (click the 🔒 next to the address or the app’s ⋮ → App info → Notifications → Allow) and keep the app installed and open in the background. Click a notification to open it — it clears automatically; “Clear all” empties the list.' },
  { id: 'assignhelp', k: 'assign task voice mic how to assign create task zora assign', q: 'How do I assign a task with Zora?',
    a: (c) => c.canAssign
      ? 'Tap the 🎤 mic (or type) and say who, what, when — e.g. “Naman, Rudra reel edit, high priority, Thursday, AG Insta”. I fill the task form; check it and press Create Task.'
      : 'Task assignment through Zora is available to PC, Shivendra and HR. You can still create tasks from “New Task” at the top.' }
];

// Finds the best answer. `extra` = notes added by HR/PC/Shivendra: [{ q, a, k }]
export function findAnswer(question, extra = []) {
  const t = normalizeText(question);
  if (PRIVATE_TOPICS.test(t)) return { id: 'private', private: true };
  const qt = tokens(question);
  if (!qt.length) return null;
  const all = [
    ...extra.map((e, i) => ({ id: 'note_' + i, k: (e.k || '') + ' ' + e.q, q: e.q, a: e.a, note: true })),
    ...BUILTIN_KNOWLEDGE
  ];
  let best = null;
  for (const item of all) {
    const kt = new Set(tokens(item.k + ' ' + item.q));
    let score = 0;
    qt.forEach(w => {
      if (kt.has(w)) score += w.length >= 5 ? 2 : 1.4;
      else if (w.length >= 5 && Array.from(kt).some(k => k.length >= 5 && (k.startsWith(w.slice(0, 5)) || levenshtein(k, w) <= 1))) score += 1;
    });
    // short questions shouldn't be drowned by long ones
    score = score / Math.sqrt(Math.max(1, qt.length));
    if (/\b(my|mera|meri|mere|mujhe|i|me)\b/.test(t) && /^(signout|mystrikes|mytasks|saturday|targets)$/.test(item.id)) score += 0.35;
    if (item.note) score += 0.2; // the company's own notes win a tie
    if (!best || score > best.score) best = { item, score };
  }
  if (!best || best.score < 0.95) return null;
  return { id: best.item.id, item: best.item };
}
