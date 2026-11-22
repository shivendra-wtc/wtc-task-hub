import { useState, useEffect, useRef, useMemo } from 'react'
import { SiInstagram, SiYoutube, SiFacebook, SiSpotify, SiX, SiThreads, SiPinterest } from 'react-icons/si'
import { FaLinkedin } from 'react-icons/fa'
import {
  FiBell, FiX, FiCheckCircle, FiCalendar, FiEdit2, FiTrash2, FiClipboard, FiSun, FiUsers, FiRepeat,
  FiPhone, FiMessageSquare, FiRefreshCw, FiPlus, FiShield, FiSettings, FiBellOff, FiClock, FiAlertTriangle, FiTarget, FiDownload
} from 'react-icons/fi'
import { LuBellRing as FiBellRing } from 'react-icons/lu'
import './App.css'

const API_URL = "https://script.google.com/macros/s/AKfycbxhrBrgG4x5U6v7YzYYbREaptULHIKprzL5ZAdCUySbdQBrqTkib2mEdujKYensAhkR-A/exec";

// FIX — Web Push public key (VAPID). Safe to be public — it's how the browser verifies
// push messages actually came from our server, the private half never leaves Vercel.
const VAPID_PUBLIC_KEY = "BG_mSITAFS-wOeqyvmRXwHXgMdt4C5WS9lFtFJc32J7mOppmSdhSLCmASbHp1Jv6ASv9CE3TLil54KE78BXwNAA";

// Converts the VAPID key from base64url text into the raw byte array the Push API needs.
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) outputArray[i] = rawData.charCodeAt(i);
  return outputArray;
}

const QUOTES = {
  // v14 — fresh set of daily lines (one per day of the month, per role). Written for
  // WTC; no famous-person attributions, so nothing can be misquoted.
  manager: [
    "Clear priorities make a calm team.",
    "Plan the week on Monday, protect it till Saturday.",
    "A good brief saves three rounds of edits.",
    "Feedback early is kindness; feedback late is rework.",
    "Your team moves at the speed of your decisions.",
    "Celebrate the finished, not just the started.",
    "One clear owner beats five helpful hands.",
    "Deadlines are promises — keep fewer, keep all.",
    "Numbers tell you what happened; people tell you why.",
    "Remove one blocker today and the whole week runs faster.",
    "Consistency builds the page; spikes only decorate it.",
    "Ask 'what's stuck?' before 'what's done?'.",
    "A calm voice in a busy room is leadership.",
    "Delegate the task, keep the standard.",
    "Every post is a promise to the audience. Keep it.",
    "Good systems make good days ordinary.",
    "Review the work, not the worker — then thank the worker.",
    "If everything is urgent, nothing is planned.",
    "Small daily wins compound into big monthly numbers.",
    "Set the bar, show the way, then step aside.",
    "Today's check-in prevents tomorrow's fire.",
    "Trust is built on time — yours and theirs.",
    "Teach once properly; it saves teaching ten times.",
    "Measure what matters: reach, retention, results.",
    "The best plans leave room for the best ideas.",
    "A team that knows the goal needs less supervision.",
    "Recognise effort in public, correct in private.",
    "Fewer meetings, sharper decisions.",
    "Quality is decided before the first frame is cut.",
    "Lead the calendar or the calendar leads you.",
    "End the day knowing tomorrow's first task."
  ],
  ceo: [
    "Build the brand people trust before they need it.",
    "Stories travel further than ads.",
    "The vision is long; the execution is daily.",
    "Every great channel was once a small, consistent one.",
    "Invest in people — they invest in the work.",
    "Bold ideas need careful execution.",
    "Culture is what the team does when no one is watching.",
    "Grow the audience, but deepen the connection.",
    "A good company makes good work easy.",
    "Decide with data, lead with values.",
    "Today's discipline is tomorrow's reputation.",
    "Protect the mission, adapt the method.",
    "Great content is a long-term asset.",
    "Hire for attitude, train for the craft.",
    "Speed matters; direction matters more.",
    "Make the next milestone visible to everyone.",
    "The audience rewards honesty and consistency.",
    "Simple systems scale; complicated ones break.",
    "Lead with clarity and the team leads with confidence.",
    "Every idea deserves a test, not a debate.",
    "Our stories carry our culture — tell them well.",
    "Profit follows trust.",
    "Raise the standard one notch every month.",
    "Celebrate the team that builds the wins.",
    "Focus is choosing what not to do.",
    "A strong team outlasts a strong trend.",
    "The work speaks; let it speak clearly.",
    "Learn fast, fix fast, move forward.",
    "Big goals, small daily steps.",
    "Make today count for the five-year plan.",
    "Lead by example — the rest follows."
  ],
  social_media: [
    "Hook in the first second, value till the last.",
    "Post for the viewer, not the algorithm.",
    "Consistency is the cheapest growth hack.",
    "One great reel beats five rushed ones.",
    "Read the comments — your next idea is in there.",
    "A clear caption is a second hook.",
    "Save-worthy beats scroll-worthy.",
    "Every story has a better first line. Find it.",
    "Check the time, the tag and the link before you post.",
    "Trends fade; trust stays.",
    "Plan the content, then let the content surprise you.",
    "Shares grow pages; saves grow loyalty.",
    "Make it easy to understand in silence — add captions.",
    "Thumbnail and title are a promise. Keep it.",
    "Ask one question per post and listen to the answers.",
    "Data shows what works; curiosity shows what's next.",
    "Batch your work, protect your creativity.",
    "Good content today is reach next month.",
    "Be first with value, not just first with news.",
    "Engage for ten minutes after you post.",
    "Repurpose smart: one idea, many formats.",
    "A calendar filled ahead is a mind at peace.",
    "Retention is the real view count.",
    "Write like you speak to one viewer.",
    "Small accounts grow on care; big ones stay on it.",
    "Test the hook, keep the story.",
    "Facts checked, faith respected, story told.",
    "Every scroll is a chance — earn the stop.",
    "Reply like a person, not a page.",
    "Finish today's post before chasing tomorrow's idea.",
    "Clarity beats cleverness every time."
  ],
  video_editor: [
    "Cut the boring parts — the audience will thank you.",
    "The first three seconds decide the next thirty.",
    "Sound sells the scene.",
    "Rhythm is felt before it's noticed.",
    "Every cut should have a reason.",
    "Colour sets the mood before the story starts.",
    "Subtitles are part of the design, not an afterthought.",
    "Leave a little silence — it lets the moment land.",
    "Export once, check twice.",
    "A clean timeline is a fast timeline.",
    "Name your files today, find them tomorrow.",
    "Match the pace to the story, not the trend.",
    "B-roll should explain, not just decorate.",
    "Good editing is invisible; great editing is unforgettable.",
    "Watch it once on a phone before you call it done.",
    "Keep the loudest moment for the end.",
    "Transitions serve the story, not the editor.",
    "Back up the project before you save the day.",
    "Trim one more second. Then check again.",
    "The final link is done only when it's uploaded and shared.",
    "Light, sound, story — in that order of checks.",
    "A vertical frame needs a vertical idea.",
    "Templates save time; taste saves the video.",
    "Every frame is a chance to hold attention.",
    "Feedback is free direction — use it.",
    "Slow down to cut faster tomorrow.",
    "Make the thumbnail moment inside the video.",
    "Music sets the heartbeat of the edit.",
    "Deliver on time, polish every time.",
    "Your craft improves one project at a time.",
    "When in doubt, cut it out."
  ],
  pr: [
    "Relationships open doors that pitches can't.",
    "Say it simply, say it truthfully.",
    "A good story finds its own audience.",
    "Follow up politely; follow through always.",
    "Reputation is built in years and protected every day.",
    "Know the journalist before you send the pitch.",
    "Every mention starts with one honest email.",
    "Prepare the answer before the question is asked.",
    "Credibility is the best press release.",
    "Turn every event into a story worth sharing.",
    "Be useful to media and media will be useful to you.",
    "Timing turns news into headlines.",
    "Keep the message short enough to repeat.",
    "Listen to the audience before you speak to it.",
    "A thank-you note keeps a contact warm.",
    "Facts first, flair second.",
    "Partnerships grow when both sides win.",
    "Your network is your quiet advantage.",
    "Respond fast, respond calm.",
    "Pitch the angle, not just the product.",
    "Small coverage builds big credibility.",
    "Protect the brand voice in every word.",
    "Clarity wins attention in a crowded inbox.",
    "Make every collaboration easy to say yes to.",
    "Good PR tells the truth beautifully.",
    "Track every pitch — patterns show the way.",
    "Plan the launch, then plan the follow-up.",
    "Media remembers who was reliable.",
    "Stories about people move people.",
    "Be the source others trust to call.",
    "Today's contact can be tomorrow's feature."
  ],
  hr: [
    "Great teams are hired, grown and cared for.",
    "Fair rules, applied kindly, build trust.",
    "Discipline is support with structure.",
    "Listen first; policies come second.",
    "A smooth first week makes a loyal year.",
    "Recognition costs little and returns a lot.",
    "Clear expectations prevent most problems.",
    "Every record kept today saves a dispute tomorrow.",
    "Wellbeing is productivity's foundation.",
    "Hire slowly, welcome warmly.",
    "Feedback is a habit, not an annual event.",
    "Be consistent — fairness is consistency.",
    "People stay where they grow.",
    "Solve the root, not just the complaint.",
    "Culture lives in small daily actions.",
    "Attendance is respect for the team's time.",
    "Confidentiality is the core of trust.",
    "Train the skill, celebrate the will.",
    "A calm conversation fixes more than a strict memo.",
    "Document fairly, decide fairly.",
    "Every leave marked on time keeps salaries right.",
    "Support the person, uphold the policy.",
    "Good onboarding is the best retention plan.",
    "Notice the quiet performers.",
    "Clarity in rules, warmth in delivery.",
    "Check in before people check out.",
    "Growth plans keep good people growing here.",
    "The best policy is one everyone understands.",
    "Prevention beats correction.",
    "Every voice in the team deserves to be heard.",
    "A happy team is a productive team."
  ]
};

// Fallback roster used only until the live TeamConfig sheet responds (or if it's ever unreachable).
// Once getTeam() succeeds, this is fully replaced by live data — see loadTeam().
const DEFAULT_TEAM = [
  { id: 'pcwtc45', name: 'PC', displayName: 'PC', role: 'CEO', avatar: 'PC', quoteType: 'ceo', isAdmin: true, active: true },
  { id: 'shivendrawtc77', name: 'Shivendra Singh', displayName: 'Shivendra Singh', role: 'Sr. Social Media Manager', avatar: 'SS', quoteType: 'manager', isAdmin: true, active: true },
  { id: 'deeksha', name: 'Deeksha', displayName: 'Deeksha', role: 'Content Writer', avatar: 'DJ', quoteType: 'social_media', active: true },
  { id: 'nidhi', name: 'Nidhi', displayName: 'Nidhi', role: 'MFG', avatar: 'NV', quoteType: 'social_media', active: true },
  { id: 'muskan', name: 'Muskan', displayName: 'Muskan', role: 'Devastram', avatar: 'MC', quoteType: 'social_media', active: true },
  { id: 'sanjeevani', name: 'Sanjeevani', displayName: 'Sanjeevani', role: 'PR Manager', avatar: 'SJ', quoteType: 'pr', active: true },
  { id: 'pari', name: 'Pari', displayName: 'Pari', role: 'HR', avatar: 'PA', quoteType: 'hr', isHR: true, active: true },
  { id: 'charu', name: 'Charu', displayName: 'Charu', role: 'Social Media Exec & Design', avatar: 'CN', quoteType: 'social_media', active: true },
  { id: 'naman', name: 'Naman', displayName: 'Naman', role: 'Video Editor', avatar: 'NJ', quoteType: 'video_editor', active: true },
  { id: 'jagdish', name: 'Jagdish', displayName: 'Jagdish', role: 'Team Member', avatar: 'JS', quoteType: 'social_media', active: true }
  // Saraswati, Khushi, Karan and Samanta removed permanently — they left the
  // organization. The backend's getTeam() also hides them automatically (see
  // DEPARTED_MEMBER_IDS_ in Code.gs), so no manual step is needed.
];
const DEPARTED_MEMBER_IDS = ['saraswati', 'khushi', 'karan', 'samanta'];

// Turns whatever was typed into a safe, openable web address: adds https:// when missing
// (people often paste "drive.google.com/…"), and refuses anything that isn't http/https.
function toOpenableUrl(raw) {
  const v = String(raw || '').trim();
  if (!v) return '';
  const withScheme = /^[a-z][a-z0-9+.-]*:/i.test(v) ? v : 'https://' + v;
  try {
    const u = new URL(withScheme);
    return (u.protocol === 'https:' || u.protocol === 'http:') ? u.href : '';
  } catch (e) { return ''; }
}

// Link input with an "Open ↗" button. target="_blank" opens the link in a separate
// browser tab (in the installed desktop/phone app it opens in the normal browser), so the
// app itself stays exactly where it was. noopener/noreferrer keep the opened page from
// controlling or reading the app's tab.
function LinkField({ value, onChange, placeholder }) {
  const href = toOpenableUrl(value);
  return (
    <div className="link-field">
      <input type="text" value={value} onChange={onChange} placeholder={placeholder} />
      {href ? (
        <a className="link-open-btn" href={href} target="_blank" rel="noopener noreferrer" title={href}>Open ↗</a>
      ) : (
        <span className="link-open-btn disabled" aria-hidden="true">Open ↗</span>
      )}
    </div>
  );
}

// Every link field on a content entry, in the order people work through them.
const CONTENT_LINK_FIELDS = [
  { key: 'rawLink', label: 'Raw', icon: '🎞️' },
  { key: 'draftLink', label: 'Draft', icon: '✂️' },
  { key: 'finalLink', label: 'Final Edit', icon: '🎬' },
  { key: 'thumbnailLink', label: 'Thumbnail', icon: '🖼️' },
  { key: 'designLink', label: 'Design', icon: '🎨' },
  { key: 'liveLink', label: 'Live post', icon: '📢' }
];

// FIX — reusable multi-select checklist dropdown, replacing the old single-select native
// <select> filters. Lets people check multiple options at once (e.g. "Not Started" AND
// "In Progress" simultaneously) instead of being limited to one value.
// ============================================================
// v13 — PLATFORMS. Each channel name is matched to its platform (by the words in its
// name: "Insta", "YT", "Spotify"…) so it gets the platform's own icon and colour
// everywhere — task cards, the content calendar, filters. New channels added from
// "Manage Channels" pick this up automatically.
// ============================================================
const PLATFORMS = {
  instagram: { label: 'Instagram', Icon: SiInstagram, color: '#E1306C', bg: 'linear-gradient(45deg,#F58529,#DD2A7B 50%,#8134AF)' },
  youtube: { label: 'YouTube', Icon: SiYoutube, color: '#FF0000', bg: '#FF0000' },
  facebook: { label: 'Facebook', Icon: SiFacebook, color: '#1877F2', bg: '#1877F2' },
  spotify: { label: 'Spotify', Icon: SiSpotify, color: '#1DB954', bg: '#1DB954' },
  linkedin: { label: 'LinkedIn', Icon: FaLinkedin, color: '#0A66C2', bg: '#0A66C2' },
  x: { label: 'X (Twitter)', Icon: SiX, color: '#111111', bg: '#111111' },
  threads: { label: 'Threads', Icon: SiThreads, color: '#111111', bg: '#111111' },
  pinterest: { label: 'Pinterest', Icon: SiPinterest, color: '#E60023', bg: '#E60023' },
  other: { label: 'Other', Icon: null, color: '#64748b', bg: '#64748b' }
};
// On the team for tasks, but not tracked for attendance.
const NO_ATTENDANCE_IDS = ['jagdish'];

// Platform chosen per channel in Manage Channels (overrides the automatic guess).
let PLATFORM_OVERRIDES = {};
function setPlatformOverrides(map) { PLATFORM_OVERRIDES = map || {}; }
function platformOf(channel, automaticOnly) {
  const forced = automaticOnly ? '' : PLATFORM_OVERRIDES[String(channel || '').trim()];
  if (forced && PLATFORMS[forced]) return forced;
  const c = String(channel || '').toLowerCase();
  if (/insta|\big\b|reel/.test(c)) return 'instagram';
  if (/\byt\b|youtube|shorts/.test(c)) return 'youtube';
  if (/facebook|\bfb\b/.test(c)) return 'facebook';
  if (/spotify|podcast/.test(c)) return 'spotify';
  if (/linkedin/.test(c)) return 'linkedin';
  if (/twitter|\bx\b/.test(c)) return 'x';
  if (/threads/.test(c)) return 'threads';
  if (/pinterest/.test(c)) return 'pinterest';
  return 'other';
}
// Channel name without the platform word ("AG Insta" → "AG").
function channelShortName(channel) {
  const short = String(channel || '').replace(/\b(insta(gram)?|yt|youtube|spotify|linkedin|twitter|facebook|fb)\b/ig, '').replace(/\s{2,}/g, ' ').trim();
  return short || String(channel || '');
}
function PlatformIcon({ channel, size = 14 }) {
  const p = PLATFORMS[platformOf(channel)];
  if (!p.Icon) return <span className="pf-dot" style={{ width: size, height: size }}></span>;
  return <p.Icon size={size} aria-label={p.label} />;
}
function ChannelBadge({ channel }) {
  const key = platformOf(channel);
  const p = PLATFORMS[key];
  return (
    <span className={`badge-channel pf-${key}`} title={`${channel} · ${p.label}`}>
      <span className="pf-icon" style={{ background: p.bg }}><PlatformIcon channel={channel} size={10} /></span>
      {channelShortName(channel)}
    </span>
  );
}
// Format of a piece of content. The stored value never changes (old entries keep
// working); only the label adapts to the platform — a vertical video is a "Reel" on
// Instagram/Facebook and a "Short" on YouTube.
const CONTENT_FORMATS = [
  { value: 'Short (Vertical)', icon: '⚡', color: '#f59e0b', label: (pf) => pf === 'youtube' ? 'Short' : pf === 'instagram' || pf === 'facebook' ? 'Reel' : 'Short video' },
  { value: 'Long Format Video', icon: '🎬', color: '#3b82f6', label: () => 'Long video' },
  { value: 'Carousel', icon: '🖼️', color: '#8b5cf6', label: () => 'Carousel' },
  { value: 'Static Post', icon: '🖌️', color: '#14b8a6', label: () => 'Post' },
  { value: 'Story', icon: '⭕', color: '#f43f5e', label: () => 'Story' },
  { value: 'Community Post', icon: '💬', color: '#ec4899', label: () => 'Community post' },
  { value: 'Live Stream', icon: '🔴', color: '#ef4444', label: () => 'Live' },
  { value: 'Podcast Episode', icon: '🎙️', color: '#22c55e', label: () => 'Podcast' }
];
// Block colour of a calendar entry = platform + format, so a YouTube long video, a
// YouTube Short, an Instagram Reel, a Carousel, a Facebook post… each look different.
const BLOCK_COLORS = {
  instagram: { 'Short (Vertical)': '#D6249F', 'Carousel': '#7C3AED', 'Static Post': '#0D9488', 'Story': '#EAB308', 'Live Stream': '#BE185D', default: '#D6249F' },
  youtube: { 'Long Format Video': '#E53935', 'Short (Vertical)': '#F97316', 'Community Post': '#B45309', 'Live Stream': '#B91C1C', default: '#E53935' },
  facebook: { 'Short (Vertical)': '#0EA5E9', 'Long Format Video': '#1D4ED8', 'Story': '#6366F1', default: '#2563EB' },
  spotify: { default: '#16A34A' },
  linkedin: { default: '#0A66C2' },
  x: { default: '#475569' },
  threads: { default: '#64748B' },
  pinterest: { default: '#E60023' },
  other: { default: '#64748b' }
};
// The "Live post link" field exists from 22 Nov 2026 — older entries aren't counted as missing it.
const LIVE_LINK_SINCE = '2026-11-22';
// "19:30" → "7:30 PM"
function fmtClock12(hhmm) {
  const m = String(hhmm || '').match(/^(\d{1,2}):(\d{2})/);
  if (!m) return hhmm || '';
  const h = Number(m[1]);
  return `${((h + 11) % 12) + 1}:${m[2]} ${h >= 12 ? 'PM' : 'AM'}`;
}

// 12-hour time picker (hour · minute · AM/PM) that stores "HH:mm" (24 h) like before,
// so nothing saved in the sheet changes format.
function TimePicker12({ value, onChange, minuteStep = 5 }) {
  const m = String(value || '').match(/^(\d{1,2}):(\d{2})/);
  const h24 = m ? Number(m[1]) : null;
  const min = m ? m[2] : '';
  const h12 = h24 === null ? '' : String(((h24 + 11) % 12) + 1);
  const ap = h24 === null ? 'PM' : (h24 >= 12 ? 'PM' : 'AM');
  const emit = (hh, mm, a) => {
    if (!hh) { onChange(''); return; }
    let H = Number(hh) % 12;
    if (a === 'PM') H += 12;
    onChange(`${String(H).padStart(2, '0')}:${mm || '00'}`);
  };
  const mins = [];
  for (let i = 0; i < 60; i += minuteStep) mins.push(String(i).padStart(2, '0'));
  if (min && !mins.includes(min)) mins.push(min);
  return (
    <div className="tp12">
      <select value={h12} onChange={(e) => emit(e.target.value, min, ap)} aria-label="Hour">
        <option value="">--</option>
        {[12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(h => <option key={h} value={String(h)}>{h}</option>)}
      </select>
      <span>:</span>
      <select value={min} onChange={(e) => emit(h12 || '12', e.target.value, ap)} aria-label="Minutes">
        <option value="">--</option>
        {mins.sort().map(x => <option key={x} value={x}>{x}</option>)}
      </select>
      <select value={ap} onChange={(e) => emit(h12 || '12', min, e.target.value)} aria-label="AM or PM">
        <option value="AM">AM</option>
        <option value="PM">PM</option>
      </select>
      {value && <button type="button" className="tp12-clear" onClick={() => onChange('')} title="Clear time">✕</button>}
    </div>
  );
}

function blockColor(contentType, channel) {
  const set = BLOCK_COLORS[platformOf(channel)] || BLOCK_COLORS.other;
  return set[contentType] || set.default;
}
// QC — the title names a different platform than the channel it is booked on
// (e.g. title "AG YT" booked on "AG Insta").
function platformMismatch(entry) {
  const t = ' ' + String(entry.title || '').toLowerCase() + ' ';
  const pf = platformOf(entry.channels);
  const says = /\b(yt|youtube|shorts?)\b/.test(t) ? 'youtube'
    : /\b(ig|insta|instagram|reels?)\b/.test(t) ? 'instagram'
    : /\b(fb|facebook)\b/.test(t) ? 'facebook'
    : /\b(spotify|podcast)\b/.test(t) ? 'spotify' : '';
  if (!says || pf === 'other') return '';
  if (says === pf) return '';
  if (says === 'instagram' && pf === 'facebook' && /reel/.test(t)) return '';
  return `Title says ${PLATFORMS[says].label} but it is booked on ${entry.channels} (${PLATFORMS[pf].label})`;
}

function formatInfo(contentType, channel) {
  const f = CONTENT_FORMATS.find(x => x.value === contentType) || { value: contentType || 'Other', icon: '📄', color: '#64748b', label: () => contentType || 'Other' };
  return { ...f, text: f.label(platformOf(channel)) };
}

function MultiSelectFilter({ label, options, selected, onChange }) {
  const [open, setOpen] = useState(false);
  const toggleOption = (opt) => {
    if (selected.includes(opt)) onChange(selected.filter(o => o !== opt));
    else onChange([...selected, opt]);
  };
  const displayLabel = selected.length === 0
    ? `All ${label}`
    : selected.length === 1
      ? selected[0]
      : `${selected.length} ${label} selected`;
  return (
    <div className="multiselect-wrap">
      <button className={`multiselect-btn ${selected.length > 0 ? 'has-selection' : ''}`} onClick={() => setOpen(!open)} type="button">
        {displayLabel} <span className="multiselect-caret">{open ? '▴' : '▾'}</span>
      </button>
      {open && (
        <div className="multiselect-dropdown" onMouseLeave={() => setOpen(false)}>
          {selected.length > 0 && (
            <button className="multiselect-clear" onClick={() => onChange([])} type="button">Clear all</button>
          )}
          {options.map(opt => (
            <label key={opt} className="multiselect-option">
              <input type="checkbox" checked={selected.includes(opt)} onChange={() => toggleOption(opt)} />
              {opt}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

function App() {
  const channels = [
    'AG Insta', 'AG YT', 'The Fact-Tree YT', 'The Fact-Tree Insta',
    'AG.books Insta',
    "The 7c's YT", "The 7c's Insta", 'Spotify', 'LinkedIn', 'Twitter',
    'MFG Insta', 'Devastram Insta', 'Other'
  ];

  // FIX — Content Calendar channel groups. Each group gets its own calendar tab.
  // Poorvaj renamed to MFG; HisTree removed entirely per management request.
  // This is now only the fallback default — the real, editable list lives in the
  // ContentChannels sheet and loads into contentChannelGroups state below, so
  // PC/Shivendra/Pari can add or remove groups/channels from the app itself.
  const DEFAULT_CONTENT_CHANNEL_GROUPS = {
    "Akshat Gupta": ['AG Insta', 'AG YT', 'AG.books Insta', 'Spotify', 'LinkedIn', 'Twitter'],
    "The Fact-Tree": ['The Fact-Tree YT', 'The Fact-Tree Insta'],
    "The 7C's": ["The 7c's YT", "The 7c's Insta"],
    "MFG": ['MFG Insta'],
    "Devastram": ['Devastram Insta'],
    "WTC Other": ['Other']
  };
  // FIX — Notion-style split status tracking: Editing Status (internal progress) and
  // Video Status (public state) are now independent, each shown as its own colored badge.
  const EDITING_STATUSES = [
    { value: 'Not Started', color: '#94a3b8', icon: '⚪' },
    { value: 'To Edit', color: '#f59e0b', icon: '🟡' },
    { value: 'In Review', color: '#3b82f6', icon: '🔵' },
    { value: 'Approved', color: '#10b981', icon: '🟢' }
  ];
  const VIDEO_STATUSES = [
    { value: 'Not Started', color: '#94a3b8', icon: '⚪' },
    { value: 'Scheduled in YT Studio', color: '#ec4899', icon: '⏰' },
    { value: 'Published', color: '#10b981', icon: '✅' }
  ];

  const categories = [
    'Social Media', 'Banking', 'Software/Automation', 'Mails',
    'Special Tasks', 'General', 'Legal', 'Staff',
    'Business', 'Other', 'Calls', 'Meeting', 'Shri Mandir'
  ];

  // FIX — real fix for the slow/blocking dashboard loading screens. Previously, every
  // single page load waited on a live network round-trip for team data, THEN another for
  // task data, showing two sequential full-screen loading gates — however fast the API
  // responded, that's still at least two round-trips before anything useful appeared, and
  // on a slow/contended API call that stretched into 10-40+ seconds. This caches the last
  // successful response in the browser's localStorage: on every load after the first ever
  // visit, the dashboard renders INSTANTLY from cache (stale data, but visible immediately),
  // while a fresh request quietly runs in the background and updates the screen the moment
  // it lands — no blocking screen, no waiting. The very first visit on a given browser still
  // needs one real network round-trip (unavoidable — there's nothing to show yet), but every
  // visit after that is instant.
  const cacheGet = (key) => {
    try {
      const raw = localStorage.getItem('wtc_cache_' + key);
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  };
  const cacheSet = (key, value) => {
    try { localStorage.setItem('wtc_cache_' + key, JSON.stringify(value)); } catch (e) {}
  };

  // ---- FIX #13: team is now live state, loaded from the backend TeamConfig sheet ----
  // Departed members are also stripped from any team list cached on this device from an
  // earlier visit, so they vanish instantly instead of after the first background reload.
  const [team, setTeam] = useState(() => {
    const cached = cacheGet('team');
    return cached ? cached.filter(m => !DEPARTED_MEMBER_IDS.includes(String(m.id).toLowerCase())) : DEFAULT_TEAM;
  });
  // FIX — if we already have a cached team list, treat it as "loaded" immediately so the
  // dashboard renders right away instead of showing the loading screen — loadTeam() still
  // runs in the background to fetch and apply anything that's actually changed.
  const [teamLoaded, setTeamLoaded] = useState(() => !!cacheGet('team'));

  const extraAssignees = ['AG', 'BG'];
  const activeTeam = team.filter(t => t.active !== false);
  const allAssignees = [...activeTeam.map(t => t.name), ...extraAssignees];

  const getAvatarForName = (name) => {
    const member = team.find(t => t.name === name);
    if (member) return member.avatar;
    if (name === 'AG') return 'AG';
    if (name === 'BG') return 'BG';
    return name.substring(0, 2).toUpperCase();
  };

  const PWA_USER_KEY = 'wtc_pwa_user_slug';

  // FIX — PWA support. The installed app always opens the same start_url with no
  // ?user= param (that's how PWAs work — one shared install link for everyone). So
  // this now also checks localStorage: once someone has done the one-time private
  // setup (entered their own link once), their slug is remembered on that device
  // forever, and every future launch goes straight to their dashboard automatically.
  const getUserFromURL = () => {
    const params = new URLSearchParams(window.location.search);
    const user = params.get('user');
    if (user) return user.toLowerCase();
    try {
      const saved = localStorage.getItem(PWA_USER_KEY);
      if (saved) return saved;
    } catch (e) {}
    return null;
  };

  const isRunningStandalone = () => {
    try {
      return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
    } catch (e) { return false; }
  };

  const extractSlugFromInput = (input) => {
    const trimmed = input.trim();
    try {
      const url = new URL(trimmed);
      const param = url.searchParams.get('user');
      if (param) return param.toLowerCase();
    } catch (e) {
      // not a full URL — fall through and treat as a bare slug
    }
    return trimmed.replace(/^\?user=/i, '').toLowerCase();
  };

  const getDayOfYear = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    return Math.floor((now - start) / (1000 * 60 * 60 * 24));
  };

  const getTimeBasedGreeting = (name) => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return `Good Morning, ${name}`;
    if (hour >= 12 && hour < 17) return `Good Afternoon, ${name}`;
    if (hour >= 17 && hour < 21) return `Good Evening, ${name}`;
    return `Working Late, ${name}`;
  };

  const getTodayQuote = (userId) => {
    const day = getDayOfYear();
    const member = team.find(t => t.id === userId);
    if (member) {
      const list = QUOTES[member.quoteType] || QUOTES.social_media;
      return list[day % list.length];
    }
    return "";
  };

  const getFormattedDate = () => {
    const now = new Date();
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return `${days[now.getDay()]}, ${months[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`;
  };

  const [tasks, setTasks] = useState(() => cacheGet('tasks') || []);
  const [archivedTasks, setArchivedTasks] = useState([]);
  const [inbox, setInbox] = useState([]);
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(() => !cacheGet('tasks'));
  // FIX — safety net: if the very first (no-cache) load takes too long, stop showing an
  // infinite spinner and offer a manual retry instead. Only ever relevant on a true
  // first-ever visit on a browser (every visit after that loads instantly from cache).
  const [loadTimedOut, setLoadTimedOut] = useState(false);
  const [currentUser, setCurrentUser] = useState(getUserFromURL());
  const [pwaSetupInput, setPwaSetupInput] = useState('');
  const [pwaSetupError, setPwaSetupError] = useState('');

  // FIX — one-time private setup: saves the slug to this device only, never shown to
  // or shared with anyone else. No visible list of names/links — purely a private
  // text box, matching the "keep it private" requirement.
  const handlePwaSetupSubmit = () => {
    const slug = extractSlugFromInput(pwaSetupInput);
    if (!slug) {
      setPwaSetupError('Please enter your personal dashboard link.');
      return;
    }
    try { localStorage.setItem(PWA_USER_KEY, slug); } catch (e) {}
    setPwaSetupError('');
    setCurrentUser(slug);
  };

  const handleUseDifferentLink = () => {
    try { localStorage.removeItem(PWA_USER_KEY); } catch (e) {}
    setCurrentUser(null);
    setPwaSetupInput('');
  };

  const [managerView, setManagerView] = useState('all');
  const [filterStatus, setFilterStatus] = useState([]);
  const [filterChannel, setFilterChannel] = useState([]);
  const [filterCategory, setFilterCategory] = useState([]);
  const [filterTaskType, setFilterTaskType] = useState([]);
  const [showNewTaskForm, setShowNewTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null); // FIX #6
  const [saving, setSaving] = useState(false);
  const [attendance, setAttendance] = useState([]);
  const [myStatus, setMyStatus] = useState('Not Signed In');
  const [attendanceSwitching, setAttendanceSwitching] = useState(false);
  // Optimistic local copy of the current user's own event log. The server round-trip
  // for an attendance update takes ~1-1.5s; without this, the timer would keep counting
  // under the OLD status for that entire window after you click a button, which felt
  // laggy/unsmooth. We append the new event to this local log the instant you click,
  // then reconcile with the server's authoritative log once it arrives.
  const [myLiveLog, setMyLiveLog] = useState('');
  const myLiveLogSynced = useRef(false);
  // Tracks the timestamp (ms) of the newest event we currently trust, whether that
  // came from an optimistic click or a confirmed server read. A server response is
  // only ever applied if it's caught up to (or past) this point — this is what stops
  // the timer from snapping backward when a background poll reads the sheet before
  // Apps Script has finished writing the most recent click.
  const myLiveLogTimeRef = useRef(0);

  const getLastEventTime = (log) => {
    if (!log) return 0;
    const parts = log.split('||EVT||');
    const last = parts[parts.length - 1];
    const timeStr = last.split('|SEP|')[1];
    if (!timeStr) return 0;
    const t = new Date(timeStr.trim());
    return isNaN(t.getTime()) ? 0 : t.getTime();
  };

  // Call this instead of setMyStatus+setMyLiveLog directly whenever data arrives from
  // the server, so a stale/racy read can never undo a more recent optimistic update.
  const applyServerAttendance = (myRecord) => {
    if (!myRecord) return;
    const serverTime = getLastEventTime(myRecord.log);
    if (serverTime >= myLiveLogTimeRef.current) {
      myLiveLogTimeRef.current = serverTime;
      setMyStatus(myRecord.status);
      setMyLiveLog(myRecord.log || '');
    }
    // else: server hasn't caught up to our latest click yet — keep showing the
    // optimistic local state as-is; the next poll (15s later) will catch up.
  };
  const [showAttendance, setShowAttendance] = useState(false);
  const [showMonthlyAttendance, setShowMonthlyAttendance] = useState(false);
  const [monthlyAttendanceDays, setMonthlyAttendanceDays] = useState([]);
  const [monthlyLoading, setMonthlyLoading] = useState(false);
  const now_ = new Date();
  const [monthlyYear, setMonthlyYear] = useState(now_.getFullYear());
  const [monthlyMonth, setMonthlyMonth] = useState(now_.getMonth() + 1); // 1-12
  const [taskViewMode, setTaskViewMode] = useState('all');
  const [taskBucket, setTaskBucket] = useState('all'); // all | delayed | today | upcoming | hold | done | reminded
  const [remindBusyId, setRemindBusyId] = useState(null);
  const [highlightTaskId, setHighlightTaskId] = useState(null); // NEW — task-navigation from a clicked notification
  const [showInbox, setShowInbox] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showArchive, setShowArchive] = useState(false);
  const [showTeamManager, setShowTeamManager] = useState(false); // FIX #13
  // ---- Notice Board + Holiday Calendar (now separate modals) ----
  const [showNoticeBoard, setShowNoticeBoard] = useState(false);
  const [showHolidayCalendar, setShowHolidayCalendar] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  // ---- Content Calendar ----
  const [showContentCalendar, setShowContentCalendar] = useState(false);
  // Starts from the copy saved on this device last time, so the calendar is never empty
  // on open — fresh data then loads silently in the background (see loadContentCalendar).
  const [contentEntries, setContentEntries] = useState(() => {
    try {
      const raw = localStorage.getItem('wtc_cache_content_entries');
      const parsed = raw ? JSON.parse(raw) : null;
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) { return []; }
  });
  const [contentSyncState, setContentSyncState] = useState('idle'); // idle | syncing | live | offline
  const [contentGroupTab, setContentGroupTab] = useState('Akshat Gupta');
  const now2_ = new Date();
  const [contentCalYear, setContentCalYear] = useState(now2_.getFullYear());
  const [contentCalMonth, setContentCalMonth] = useState(now2_.getMonth()); // 0-11
  const [editingContentEntry, setEditingContentEntry] = useState(null); // null = closed, {} = new, {...} = editing
  const [contentForm, setContentForm] = useState({
    channels: '', contentType: 'Long Format Video', title: '', date: '', time: '',
    assignedTo: [], editingStatus: 'Not Started', videoStatus: 'Not Started', priority: 'Medium',
    finalLink: '', thumbnailLink: '', designLink: '', rawLink: '', draftLink: '', liveLink: '', description: '', notes: ''
  });
  const [contentSaving, setContentSaving] = useState(false);
  // ---- Content Calendar: dynamic channel groups (PC/Shivendra/Pari can edit these
  // from the app now, instead of them being hardcoded — starts from the same defaults
  // that used to be hardcoded, so nothing changes until someone actually edits it) ----
  const [contentChannelGroups, setContentChannelGroups] = useState(DEFAULT_CONTENT_CHANNEL_GROUPS);
  // Channels to pick on a task = every content-calendar channel (incl. new ones such as
  // Facebook) + the older fixed list, without duplicates, "Other" last.
  const allChannelOptions = Array.from(new Set([...Object.values(contentChannelGroups).flat(), ...channels.filter(c => c !== 'Other'), 'Other']));
  const [showManageChannels, setShowManageChannels] = useState(false);
  const [newChannelGroup, setNewChannelGroup] = useState('');
  const [newChannelName, setNewChannelName] = useState('');
  const [newChannelPlatform, setNewChannelPlatform] = useState('');
  const [channelPlatforms, setChannelPlatforms] = useState(() => {
    try { const m = JSON.parse(localStorage.getItem('wtc_cache_channel_platforms') || '{}'); setPlatformOverrides(m); return m; } catch (e) { return {}; }
  });
  const [ccPlatformFilter, setCcPlatformFilter] = useState('all');
  const [ccSearch, setCcSearch] = useState('');
  const [ccView, setCcView] = useState(() => { try { return localStorage.getItem('wtc_cc_view') || 'month'; } catch (e) { return 'month'; } });
  useEffect(() => { try { localStorage.setItem('wtc_cc_view', ccView); } catch (e) {} }, [ccView]);
  // Which day (within the currently open group/month) is expanded to show every entry —
  // the month cell itself only shows a few compact chips, Notion-style.
  const [expandedContentDay, setExpandedContentDay] = useState(null);
  const [notices, setNotices] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [showManageHolidays, setShowManageHolidays] = useState(false);
  const [newHolidayDate, setNewHolidayDate] = useState('');
  const [newHolidayName, setNewHolidayName] = useState('');
  const [holidaySaving, setHolidaySaving] = useState(false);
  const [newNoticeTitle, setNewNoticeTitle] = useState('');
  const [newNoticeMessage, setNewNoticeMessage] = useState('');
  const [newNoticePinned, setNewNoticePinned] = useState(false);
  const [noticeSaving, setNoticeSaving] = useState(false);
  const [manualRefreshing, setManualRefreshing] = useState(false);
  const [showOlderRoutine, setShowOlderRoutine] = useState(false);
  // ---- Team Meet ----
  const [meetings, setMeetings] = useState([]);
  const [showMeetings, setShowMeetings] = useState(false);
  // ---- My Recurring Tasks manager ----
  const [showMyRoutines, setShowMyRoutines] = useState(false);
  const [routineScope, setRoutineScope] = useState('mine'); // 'mine' | 'all' (admins only)
  const [routineEndDraft, setRoutineEndDraft] = useState({}); // taskId -> end date being edited
  const [routineBusyId, setRoutineBusyId] = useState(null);
  const [showNewMeetingForm, setShowNewMeetingForm] = useState(false);
  const [meetingSaving, setMeetingSaving] = useState(false);
  const [meetingAssignees, setMeetingAssignees] = useState([]);
  const [newMeeting, setNewMeeting] = useState({
    title: '', purpose: '', type: 'Team Meet', meetingDate: '', meetingTime: '', frequency: 'Daily'
  });
  const [activeMeetingAlarm, setActiveMeetingAlarm] = useState(null); // the meeting currently alarming
  const meetingAlarmFiredRef = useRef(new Set()); // "meetingId" strings already alarmed, this session
  const [selectedAssignees, setSelectedAssignees] = useState([]);
  const [selectedChannels, setSelectedChannels] = useState([]);
  const [notifQueue, setNotifQueue] = useState([]); // FIX #7/#10 — queue instead of single popup
  const [notifPermission, setNotifPermission] = useState(
    typeof Notification !== 'undefined' ? Notification.permission : 'unsupported'
  );
  const [, setTick] = useState(0);
  const [chatWith, setChatWith] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [newTask, setNewTask] = useState({
    taskDetails: '',
    remarks: '',
    priority: 'Medium',
    targetDate: '',
    taskType: 'General',
    category: '',
    frequency: 'Daily',
    startDate: '',
    endDate: '',
    // FIX — routine reminder window (Weekly/Monthly Routine tasks only)
    reminderMode: 'date',   // 'date' | 'band'
    reminderDaysBefore: 3,
    bandStart: '',
    bandEnd: ''
  });

  // Tracks which inbox IDs we've already alerted on, per-browser, so the popup/sound/
  // desktop notification never fires twice and never gets skipped on first load. FIX #7.
  const seenInboxIds = useRef(new Set());
  // FIX — permanent client-side dismissal ledger. markInboxRead is a fire-and-forget
  // no-cors POST (Apps Script POST responses aren't readable), so there's no way to know
  // exactly when the write lands on the server. Without this, a background poll firing
  // before that write completes would read the OLD "unread" row and blindly overwrite
  // local state with it — making a just-cleared notification pop back into the list.
  // Any ID in this set is filtered out of every inbox render from now on, regardless of
  // what the server says, until the page is reloaded.
  const dismissedInboxIds = useRef(new Set());
  const seenChatIds = useRef(new Set());
  const firstInboxLoad = useRef(true);
  const firstChatLoad = useRef(true);

  const currentUserInfo = team.find(t => t.id === currentUser);
  const isAdmin = currentUserInfo?.isAdmin || false;
  const isHR = currentUserInfo?.isHR || false;
  const needsPwaSetup = teamLoaded && !currentUser;
  const isInvalidUser = teamLoaded && !!currentUser && !currentUserInfo;
  const displayName = currentUserInfo?.displayName || '';
  const greeting = displayName ? getTimeBasedGreeting(String(displayName).split(' ')[0]) : '';
  const todayQuote = currentUser ? getTodayQuote(currentUser) : '';
  const formattedDate = getFormattedDate();
  // Only PC and Shivendra ever see the Team Management panel — checked by fixed login id, not by role text.
  // NEW — HR (Pari) can now also add/remove/edit team members, not just PC/Shivendra.
  const canManageTeam = currentUser === 'pcwtc45' || currentUser === 'shivendrawtc77' || currentUser === 'pari';
  // FIX — Routine task creation extended to specific non-admins per request, in addition
  // to the usual admins. Everyone else still only creates General tasks.
  const CAN_CREATE_ROUTINE = ['pcwtc45', 'shivendrawtc77', 'sanjeevani', 'muskan', 'nidhi', 'pari'];
  const canCreateRoutine = CAN_CREATE_ROUTINE.includes(currentUser);
  // Only PC and Shivendra can summon people to their cabin / call an immediate meeting —
  // but either of them can call the OTHER one too, since both hold this permission.
  const canCall = currentUser === 'pcwtc45' || currentUser === 'shivendrawtc77';
  const isAppAdmin = currentUser === 'pcwtc45' || currentUser === 'shivendrawtc77';
  const canManageAttendance = currentUser === 'pcwtc45' || currentUser === 'shivendrawtc77' || currentUser === 'pari';

  // ---- App settings (v13): who can open the Content Calendar ----
  // Default when nobody has changed it yet: everyone except video editors (as it is today).
  const [appSettings, setAppSettings] = useState(() => cacheGet('settings') || {});
  const [showCcAccess, setShowCcAccess] = useState(false);
  const [ccAccessDraft, setCcAccessDraft] = useState([]);
  const defaultContentAccess = (m) => !!m && !/editor/i.test(String(m.role || '')) && m.quoteType !== 'video_editor';
  const contentAccessList = Array.isArray(appSettings.contentCalendarAccess) ? appSettings.contentCalendarAccess : null;
  const hasContentAccess = (m) => !!m && (m.id === 'pcwtc45' || m.id === 'shivendrawtc77' ||
    (contentAccessList ? contentAccessList.includes(m.id) : defaultContentAccess(m)));
  const canSeeContentCalendar = hasContentAccess(currentUserInfo);

  const statusColors = {
    'Not Started': '#64748b',
    'In Progress': '#d97706',
    'Completed': '#059669',
    'On Hold': '#7c3aed',
    'Delayed': '#dc2626'
  };

  // FIX #4 — Tea Break removed. Only Working / Lunch / Meeting / Signed Out remain.
  const attendanceColors = {
    'Working': '#059669',
    'Lunch Break': '#dc2626',
    'Meeting': '#7c3aed',
    'Signed Out': '#64748b',
    'Not Signed In': '#94a3b8'
  };
  // FIX — Meeting now counts toward Working hours (only Lunch Break is a real break).
  const BREAK_STATUSES = ['Lunch Break'];
  const WORK_STATUSES = ['Working', 'Meeting'];

  // FIX — live presence dot: true if this person is currently signed in and actively
  // working (or in a meeting, which counts as working per the attendance fix). Used on
  // avatars in task cards, Quick Switch, and chat so you can see who's actually around.
  const isPresent = (name) => {
    const member = team.find(t => t.name === name);
    if (!member) return false;
    const record = attendance.find(a => a.userId === member.id);
    return !!record && WORK_STATUSES.includes(record.status);
  };

  // FIX — louder and more noticeable: volume maxed out (was 0.5) and a quick double-beep
  // instead of a single short beep, so it actually cuts through when someone's not looking.
  const playNotifSound = () => {
    try {
      const beep = () => {
        const audio = new Audio('data:audio/wav;base64,UklGRlwFAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YTgFAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGnt/yv2wiBTGH0PLTgjMGHm7A7+OZURE');
        audio.volume = 1.0;
        audio.play().catch(e => {});
      };
      beep();
      setTimeout(beep, 220);
    } catch(e) {}
  };

  // FIX #9 — Desktop/browser notification (foreground or backgrounded tab, same browser session).
  // Note: this cannot wake a fully closed browser — that would need a push server (service worker +
  // VAPID keys) which is a bigger infra addition. This covers "tab open but not focused / minimized".
  const fireDesktopNotification = (title, body) => {
    if (typeof Notification === 'undefined') return;
    if (Notification.permission === 'granted') {
      try {
        const n = new Notification(title, { body, icon: '/wtc-logo.png' });
        n.onclick = () => { window.focus(); n.close(); };
      } catch (e) {}
    }
  };

  // ============================================================
  // PUSH REGISTRATION (what lets a call reach a phone that's locked / app closed).
  // FIX — this used to fail silently. It now records exactly what happened on THIS device
  // (myPushState), shown in the 📡 Call Alerts panel and the "turn on call alerts" banner,
  // so a device that can't receive calls says why instead of just never ringing:
  //   registered | not-allowed (never asked) | blocked (denied in browser settings)
  //   | unsupported (e.g. iPhone outside the home-screen app) | error (+ the reason)
  // ============================================================
  const [myPushState, setMyPushState] = useState({ status: 'unknown', detail: '' });
  const [pushBannerDismissed, setPushBannerDismissed] = useState(false);

  const describeDevice = () => {
    try {
      const ua = navigator.userAgent || '';
      const os = /iPhone|iPad|iPod/.test(ua) ? 'iPhone' : /Android/.test(ua) ? 'Android phone'
        : /Windows/.test(ua) ? 'Windows PC' : /Mac OS X/.test(ua) ? 'Mac' : 'Device';
      const browser = /Edg\//.test(ua) ? 'Edge' : /OPR\//.test(ua) ? 'Opera' : /Chrome\//.test(ua) ? 'Chrome'
        : /Firefox\//.test(ua) ? 'Firefox' : /Safari\//.test(ua) ? 'Safari' : 'browser';
      const app = isRunningStandalone() ? 'installed app' : browser;
      return `${os} · ${app}`;
    } catch (e) { return 'Device'; }
  };

  const subscribeToPush = async (userName) => {
    if (!userName) return;
    if (typeof Notification === 'undefined' || !('serviceWorker' in navigator) || !('PushManager' in window)) {
      setMyPushState({ status: 'unsupported', detail: /iPhone|iPad/.test(navigator.userAgent || '')
        ? 'On iPhone, call alerts only work in the app added to the Home Screen (Safari → Share → Add to Home Screen).'
        : 'This browser does not support call alerts.' });
      return;
    }
    if (Notification.permission === 'denied') {
      setMyPushState({ status: 'blocked', detail: 'Notifications are blocked for this site in the browser settings.' });
      return;
    }
    if (Notification.permission !== 'granted') {
      setMyPushState({ status: 'not-allowed', detail: 'Notifications have not been allowed on this device yet.' });
      return;
    }
    try {
      // navigator.serviceWorker.ready never resolves if the service worker failed to
      // start, which used to hang here forever with no message. Give it 10 seconds.
      const registration = await Promise.race([
        navigator.serviceWorker.ready,
        new Promise((_, reject) => setTimeout(() => reject(new Error('The app’s background service did not start. Close and reopen the app.')), 10000))
      ]);
      let subscription = await registration.pushManager.getSubscription();
      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
        });
      }
      await fetch(API_URL, {
        method: 'POST', mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({ action: 'savePushSubscription', userName, subscription: subscription.toJSON(), device: describeDevice() })
      });
      setMyPushState({ status: 'registered', detail: describeDevice() });
    } catch (e) {
      setMyPushState({ status: 'error', detail: String((e && e.message) || e) });
    }
  };

  const requestNotifPermission = () => {
    if (typeof Notification === 'undefined') return;
    Notification.requestPermission().then(perm => {
      setNotifPermission(perm);
      subscribeToPush(currentUserInfo?.name);
    });
  };

  // Covers the case where permission was already granted in an earlier session — no
  // button click to hook into, so subscribe as soon as we know who's logged in.
  // Re-registers on every app open (keeps LastSeen fresh) and whenever the permission
  // changes — e.g. someone allows notifications from the browser's own settings.
  useEffect(() => {
    if (currentUserInfo?.name) subscribeToPush(currentUserInfo.name);
  }, [currentUserInfo?.name, notifPermission]);


  // NEW — pushNotif now optionally carries an onClick handler, so the toast itself is
  // clickable and navigates (to the task, or to the right chat conversation), not just
  // the Inbox panel entry after you open the bell. taskId is stored too so we can log/debug.
  const pushNotif = (message, onClick) => {
    const notifId = Date.now() + Math.random();
    setNotifQueue(q => [...q, { id: notifId, message, onClick }]);
    setTimeout(() => {
      setNotifQueue(q => q.filter(n => n.id !== notifId));
    }, 5000); // FIX #10 — flashes in, auto-dismisses on its own
  };

  // ============================================================
  // CALLS — "Come to My Cabin" / "Immediate Meeting" summon alerts
  // ============================================================
  const [showCallCompose, setShowCallCompose] = useState(false);
  const [callRecipients, setCallRecipients] = useState([]);
  const [incomingCall, setIncomingCall] = useState(null); // { callId, from, type }
  const [outgoingCall, setOutgoingCall] = useState(null); // { callId, type, recipients: [{to,response}] }
  const seenCallIds = useRef(new Set());
  const ringAudioCtxRef = useRef(null);
  const ringIntervalRef = useRef(null);
  const incomingCallTimeoutRef = useRef(null);

  // FIX — precise root cause of "sound sometimes doesn't play, sometimes does, and never
  // on phone": every sound in this app (ring, ding, lunch alarm, meeting alarm, success
  // chime) is generated in JavaScript, and browsers refuse to play ANY JS-generated audio
  // until the page itself has had at least one direct tap/click/keypress since it loaded —
  // this is a hard browser autoplay-protection rule, not a bug, and it's stricter on phones
  // than desktop. A push notification can wake the app and show a system alert, but it is
  // NOT a "tap" in the browser's eyes, so audio can stay silently blocked even though the
  // notification itself came through correctly — which is exactly what was being seen.
  // getRingCtx_() is the single place every sound function now gets its AudioContext from,
  // and it always tries to un-suspend it first, and the listener below unlocks it (and a
  // matching silent unlock for the plain <audio> ding) on the very first tap anywhere in
  // the app, so by the time a real call/alarm needs to play, audio has already been
  // unlocked instead of hoping a race condition works out.
  const audioUnlockedRef = useRef(false);
  const getRingCtx_ = () => {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    if (!ringAudioCtxRef.current) ringAudioCtxRef.current = new Ctx();
    const ctx = ringAudioCtxRef.current;
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    return ctx;
  };
  useEffect(() => {
    const unlockAudio = () => {
      if (audioUnlockedRef.current) return;
      try {
        const ctx = getRingCtx_();
        if (ctx && ctx.state === 'suspended') ctx.resume().catch(() => {});
        // Also unlocks plain <audio> playback (used by the task/inbox ding) — iOS Safari
        // in particular only counts a play() call made directly inside the gesture
        // handler itself, not one that merely happens sometime after a gesture.
        const silent = new Audio('data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=');
        silent.volume = 0;
        silent.play().catch(() => {});
        audioUnlockedRef.current = true;
      } catch (e) {}
    };
    document.addEventListener('pointerdown', unlockAudio, { passive: true });
    document.addEventListener('keydown', unlockAudio);
    return () => {
      document.removeEventListener('pointerdown', unlockAudio);
      document.removeEventListener('keydown', unlockAudio);
    };
  }, []);

  // Changed again per request — chosen as "Marimba Cascade": a warm triangle-wave tone
  // with a fast attack and natural decay (like a struck wooden bar), playing a
  // descending 3-note pattern (C6 → A5 → F5). Deliberately a different waveform/timbre
  // and rhythm from every other sound in the app (ding, lunch chirp, meeting bell), per
  // the request to keep every sound distinct.
  // Ringtone "Marimba Cascade" (C6 → A5 → F5, triangle wave, struck-bar decay).
  // v13: the whole minute of ringing is scheduled on the audio clock in one go, so it keeps
  // ringing even while the browser slows down timers of a hidden/minimised window.
  const ringGainRef = useRef(null);
  const scheduleRingPattern_ = (ctx, out, at) => {
    const note = (freq, start, duration) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.001, at + start);
      gain.gain.exponentialRampToValueAtTime(0.55, at + start + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.001, at + start + duration);
      osc.connect(gain);
      gain.connect(out);
      osc.start(at + start);
      osc.stop(at + start + duration + 0.03);
    };
    note(1046.5, 0, 0.32);
    note(880, 0.16, 0.32);
    note(698.46, 0.32, 0.4);
  };

  const startRinging = () => {
    stopRinging();
    try {
      const ctx = getRingCtx_();
      if (!ctx) return;
      const master = ctx.createGain();
      master.gain.value = 1;
      master.connect(ctx.destination);
      ringGainRef.current = master;
      const t0 = ctx.currentTime + 0.05;
      for (let i = 0; i < 46; i++) scheduleRingPattern_(ctx, master, t0 + i * 1.3); // ~60s
    } catch (e) {}
  };

  const stopRinging = () => {
    if (ringGainRef.current) {
      try { ringGainRef.current.gain.value = 0; ringGainRef.current.disconnect(); } catch (e) {}
      ringGainRef.current = null;
    }
    if (ringIntervalRef.current) { clearInterval(ringIntervalRef.current); ringIntervalRef.current = null; }
    if (incomingCallTimeoutRef.current) { clearTimeout(incomingCallTimeoutRef.current); incomingCallTimeoutRef.current = null; }
  };

  // TASK REMINDER sound — a "knock-knock" woodblock (two short low square-wave knocks,
  // twice). Different from the call ring, the notification ding and the meeting bell.
  const playReminderTone = () => {
    try {
      const ctx = getRingCtx_();
      if (!ctx) return;
      const knock = (start, freq) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();
        osc.type = 'square';
        osc.frequency.value = freq;
        filter.type = 'lowpass';
        filter.frequency.value = 1400;
        gain.gain.setValueAtTime(0.001, ctx.currentTime + start);
        gain.gain.exponentialRampToValueAtTime(0.5, ctx.currentTime + start + 0.005);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + 0.11);
        osc.connect(filter); filter.connect(gain); gain.connect(ctx.destination);
        osc.start(ctx.currentTime + start);
        osc.stop(ctx.currentTime + start + 0.13);
      };
      knock(0, 520); knock(0.16, 470); knock(0.55, 520); knock(0.71, 470);
    } catch (e) {}
  };

  // Gentle two-note "lunch over" nudge, used by the lunch countdown (not an alarm).
  const playLunchNudge = () => {
    try {
      const ctx = getRingCtx_();
      if (!ctx) return;
      [[784, 0], [587.33, 0.22]].forEach(([freq, start]) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.001, ctx.currentTime + start);
        gain.gain.exponentialRampToValueAtTime(0.4, ctx.currentTime + start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + 0.35);
        osc.connect(gain); gain.connect(ctx.destination);
        osc.start(ctx.currentTime + start);
        osc.stop(ctx.currentTime + start + 0.4);
      });
    } catch (e) {}
  };

  const meetingAlarmIntervalRef = useRef(null);
  const meetingAlarmTimeoutRef = useRef(null);

  // ============================================================
  // TEAM MEET — schedule a meeting (Routine/General/Team Meet/Other), assign anyone,
  // pick a date+time. Everyone assigned (and the creator) gets a distinct alarm exactly
  // 5 minutes before the meeting time — same reliability pattern as the lunch alarm and
  // the call ring: a periodic check plus a visibility-change listener so a backgrounded
  // tab still catches it the moment it's reopened.
  // ============================================================
  const loadMeetings = async () => {
    try {
      const response = await fetch(API_URL + '?action=getMeetings');
      const data = await response.json();
      if (data.status === 'ok') setMeetings(data.meetings);
    } catch (error) {}
  };

  const loadMeetingsBackground = async () => {
    try {
      const response = await fetch(API_URL + '?action=getMeetings');
      const data = await response.json();
      if (data.status === 'ok') setMeetings(data.meetings);
    } catch (error) {}
  };

  const openMeetings = () => {
    setShowMeetings(true);
    loadMeetings();
  };

  const toggleMeetingAssignee = (name) => {
    setMeetingAssignees(prev => prev.includes(name) ? prev.filter(a => a !== name) : [...prev, name]);
  };

  const handleAddMeeting = () => {
    if (!newMeeting.title || !newMeeting.meetingDate || !newMeeting.meetingTime || meetingAssignees.length === 0) {
      alert('Please fill Title, Date, Time and select at least one person!');
      return;
    }
    setMeetingSaving(true);
    const meetingData = {
      ...newMeeting,
      assignedTo: meetingAssignees.join(', '),
      createdBy: currentUserInfo.name
    };
    fetch(API_URL, {
      method: 'POST', mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ action: 'addMeeting', meeting: meetingData })
    });
    setNewMeeting({ title: '', purpose: '', type: 'Team Meet', meetingDate: '', meetingTime: '', frequency: 'Daily' });
    setMeetingAssignees([]);
    setShowNewMeetingForm(false);
    setMeetingSaving(false);
    setTimeout(() => loadMeetingsBackground(), 1500);
  };

  const handleDeleteMeeting = (meeting) => {
    const canDelete = isAdmin || meeting.createdBy === currentUserInfo?.name;
    if (!canDelete) return;
    if (!window.confirm(`Delete "${meeting.title}"?`)) return;
    setMeetings(meetings.filter(m => m.id !== meeting.id));
    fetch(API_URL, {
      method: 'POST', mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ action: 'deleteMeeting', meetingId: meeting.id })
    });
  };

  // Distinct alarm sound — an alternating two-note bell (880Hz / 660Hz sine "ding-dong"),
  // deliberately different from the lunch alarm's rising triangle chirp, the call ring's
  // two-tone burst, and the plain notification ding, so it's instantly recognizable.
  const playMeetingAlarmTone = () => {
    try {
      const ctx = getRingCtx_();
      if (!ctx) return;
      const playBell = (start, freq) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
        gain.gain.setValueAtTime(0.001, ctx.currentTime + start);
        gain.gain.exponentialRampToValueAtTime(0.5, ctx.currentTime + start + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + start);
        osc.stop(ctx.currentTime + start + 0.42);
      };
      playBell(0, 880);
      playBell(0.42, 660);
    } catch (e) {}
  };

  const startMeetingAlarmSound = () => {
    playMeetingAlarmTone();
    if (meetingAlarmIntervalRef.current) clearInterval(meetingAlarmIntervalRef.current);
    meetingAlarmIntervalRef.current = setInterval(playMeetingAlarmTone, 1200);
  };

  const dismissMeetingAlarm = () => {
    if (meetingAlarmIntervalRef.current) { clearInterval(meetingAlarmIntervalRef.current); meetingAlarmIntervalRef.current = null; }
    if (meetingAlarmTimeoutRef.current) { clearTimeout(meetingAlarmTimeoutRef.current); meetingAlarmTimeoutRef.current = null; }
    setActiveMeetingAlarm(null);
  };

  useEffect(() => {
    if (!currentUser || !currentUserInfo) return;

    // NEW — Routine meetings recur (Daily/Weekly/Monthly, same as Routine tasks);
    // General/Team Meet/Other meetings are one-time, for their exact date only.
    const checkMeetingAlarms = () => {
      const now = new Date();
      const todayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      meetings.forEach(m => {
        if (activeMeetingAlarm) return; // one at a time
        const involved = String(m.assignedTo).split(',').map(a => a.trim()).includes(currentUserInfo.name)
          || m.createdBy === currentUserInfo.name;
        if (!involved) return;
        if (!m.meetingDate || !m.meetingTime) return;

        const isRoutine = m.type === 'Routine';
        const originalDate = new Date(m.meetingDate + 'T00:00:00');
        let occursToday = false;
        if (!isRoutine) {
          occursToday = m.meetingDate === todayKey; // one-time: exact day only
        } else if (now >= originalDate) {
          if (m.frequency === 'Weekly') occursToday = originalDate.getDay() === now.getDay();
          else if (m.frequency === 'Monthly') occursToday = originalDate.getDate() === now.getDate();
          else occursToday = true; // Daily (default for Routine)
        }
        if (!occursToday) return;

        const fireKey = `${m.id}|${todayKey}`; // lets a recurring meeting alarm again on its next occurrence
        if (meetingAlarmFiredRef.current.has(fireKey)) return;

        const meetingDateTime = new Date(`${todayKey}T${m.meetingTime}:00`);
        const msUntil = meetingDateTime - now;
        // NEW — reminder now fires 5 minutes before (was 1 minute), per request. Window
        // is wide (5:10 before through 30s after) so a throttled/backgrounded tab still
        // catches it the moment it's reopened, instead of silently missing the exact tick.
        if (msUntil <= 310000 && msUntil > -30000) {
          meetingAlarmFiredRef.current.add(fireKey);
          setActiveMeetingAlarm(m);
          startMeetingAlarmSound();
          fireDesktopNotification('🤝 Meeting starting in 5 minutes', `${m.title} at ${fmtClock12(m.meetingTime)}`);
          meetingAlarmTimeoutRef.current = setTimeout(dismissMeetingAlarm, 30000);
        }
      });
    };

    const interval = setInterval(checkMeetingAlarms, 15000);
    const handleVisible = () => {
      if (document.visibilityState === 'visible') checkMeetingAlarms();
    };
    document.addEventListener('visibilitychange', handleVisible);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisible);
    };
  }, [currentUser, currentUserInfo, meetings, activeMeetingAlarm]);

  useEffect(() => {
    if (currentUser) loadMeetings();
  }, [currentUser]);

  // ============================================================
  // CALLS v13 — rebuilt. How a call reaches someone (first one to arrive wins; the same
  // call never rings twice):
  //   1. WATCHER — a background worker checks every 2–3 s, EVEN WHEN THE WINDOW IS
  //      MINIMISED OR BEHIND OTHER WINDOWS (the old check only ran while the app was on
  //      screen, which is why calls stopped getting through from 1 Oct).
  //   2. PUSH — wakes a phone/laptop where the app is closed; an open app rings from it.
  //   3. RETURN — checks again the moment the app comes back to the front.
  // While ringing: full-screen card + ringtone + vibration + flashing tab title + a system
  // notification that stays until answered. If the same person answers on another device,
  // this one stops ringing by itself. Unanswered after 60 s → "Missed".
  // ============================================================
  const incomingCallRef = useRef(null);
  useEffect(() => { incomingCallRef.current = incomingCall; }, [incomingCall]);
  const currentUserNameRef = useRef(null);
  useEffect(() => { currentUserNameRef.current = currentUserInfo?.name || null; }, [currentUserInfo?.name]);
  const titleFlashRef = useRef(null);
  const ringStatusPollRef = useRef(null);

  const getSwRegistration_ = async () => {
    try {
      if (!('serviceWorker' in navigator)) return null;
      return await Promise.race([navigator.serviceWorker.ready, new Promise(r => setTimeout(() => r(null), 3000))]);
    } catch (e) { return null; }
  };

  const showCallSystemNotification_ = async (call) => {
    try {
      if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return;
      const reg = await getSwRegistration_();
      const title = `📞 ${call.from} is calling you`;
      const options = {
        body: `${call.type || 'Call'} — tap to answer`, tag: 'wtc-call-' + call.callId, renotify: true,
        requireInteraction: true, icon: '/icon-192.png', badge: '/icon-192.png',
        vibrate: [400, 150, 400, 150, 400],
        data: { url: '/', push: { data: { kind: 'call', callId: call.callId, from: call.from, type: call.type, timestamp: call.timestamp, to: currentUserNameRef.current } } },
        actions: [{ action: 'accept', title: '✓ Coming' }, { action: 'decline', title: '✕ Busy' }]
      };
      if (reg && reg.showNotification) await reg.showNotification(title, options);
      else new Notification(title, { body: options.body, tag: options.tag, requireInteraction: true });
    } catch (e) {}
  };

  const closeCallSystemNotification_ = async (callId) => {
    try {
      const reg = await getSwRegistration_();
      if (!reg || !reg.getNotifications) return;
      const list = await reg.getNotifications({ tag: 'wtc-call-' + callId });
      list.forEach(n => n.close());
    } catch (e) {}
  };

  const startTitleFlash_ = (from) => {
    if (titleFlashRef.current) clearInterval(titleFlashRef.current);
    const original = 'WTC Hub';
    let on = false;
    titleFlashRef.current = setInterval(() => {
      on = !on;
      document.title = on ? `📞 ${from} is calling…` : original;
    }, 900);
  };
  const stopTitleFlash_ = () => {
    if (titleFlashRef.current) { clearInterval(titleFlashRef.current); titleFlashRef.current = null; }
    document.title = 'WTC Hub';
  };

  const endRingingUi_ = (callId) => {
    stopRinging();
    stopTitleFlash_();
    try { if (navigator.vibrate) navigator.vibrate(0); } catch (e) {}
    if (ringStatusPollRef.current) { clearInterval(ringStatusPollRef.current); ringStatusPollRef.current = null; }
    if (callId) closeCallSystemNotification_(callId);
    incomingCallRef.current = null;
    setIncomingCall(null);
  };

  const ringIncomingCall = (call) => {
    if (!call || !call.callId) return;
    if (incomingCallRef.current) return; // already ringing — don't interrupt it
    if (seenCallIds.current.has(call.callId)) return;
    const ageSecs = call.timestamp ? (Date.now() - new Date(call.timestamp).getTime()) / 1000 : 0;
    if (ageSecs > 120) return; // stale (e.g. a late push for a call that is over)
    seenCallIds.current.add(call.callId);
    const fresh = { callId: call.callId, from: call.from, type: call.type, timestamp: call.timestamp };
    incomingCallRef.current = fresh;
    setIncomingCall(fresh);
    startRinging();
    startTitleFlash_(fresh.from);
    try { if (navigator.vibrate) navigator.vibrate([400, 150, 400, 150, 400, 150, 400]); } catch (e) {}
    if (document.visibilityState !== 'visible' || !document.hasFocus()) showCallSystemNotification_(fresh);

    // Answered on another device (or by the caller cancelling)? Stop ringing here too.
    if (ringStatusPollRef.current) clearInterval(ringStatusPollRef.current);
    ringStatusPollRef.current = setInterval(async () => {
      try {
        const res = await fetch(API_URL + '?action=getCallStatus&callId=' + encodeURIComponent(fresh.callId));
        const data = await res.json();
        const me = (data.recipients || []).find(r => r.to === currentUserNameRef.current);
        if (me && me.response && me.response !== 'Ringing' && incomingCallRef.current?.callId === fresh.callId) {
          endRingingUi_(fresh.callId);
        }
      } catch (e) {}
    }, 3000);

    if (incomingCallTimeoutRef.current) clearTimeout(incomingCallTimeoutRef.current);
    incomingCallTimeoutRef.current = setTimeout(() => {
      respondToIncomingCall(fresh.callId, 'Missed');
    }, 60000);
  };

  const respondToIncomingCall = (callId, response) => {
    fetch(API_URL, {
      method: 'POST', mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ action: 'respondToCall', callId, userName: currentUserNameRef.current || currentUserInfo?.name, response })
    }).catch(() => {});
    endRingingUi_(callId);
    if (response === 'Missed') pushNotif('📞 You missed a call — it is saved in your notifications.');
  };

  // The watcher worker (falls back to a plain timer on very old browsers).
  const callWorkerRef = useRef(null);
  const myStatusRef = useRef('Not Signed In');
  useEffect(() => { myStatusRef.current = myStatus; }, [myStatus]);
  const callAdminRef = useRef(false);
  useEffect(() => { callAdminRef.current = !!isAdmin; }, [isAdmin]);
  const handleCallsFromServer_ = (calls) => {
    if (!Array.isArray(calls) || calls.length === 0 || incomingCallRef.current) return;
    const fresh = calls.find(c => !seenCallIds.current.has(c.callId));
    if (fresh) ringIncomingCall(fresh);
  };
  const handleCallsRef = useRef(null);
  handleCallsRef.current = handleCallsFromServer_;

  const checkIncomingCalls = () => {
    if (callWorkerRef.current) { callWorkerRef.current.postMessage({ type: 'now' }); return; }
    const myName = currentUserNameRef.current;
    if (!myName) return;
    fetch(API_URL + '?action=getIncomingCalls&userName=' + encodeURIComponent(myName))
      .then(r => r.json()).then(d => { if (d.status === 'ok' && handleCallsRef.current) handleCallsRef.current(d.calls); })
      .catch(() => {});
  };

  useEffect(() => {
    const myName = currentUserInfo?.name;
    if (!myName) return;
    // 2 s on screen, 3 s in the background; people who are signed out (not in office)
    // are checked every 6 s to keep the backend light. Push still reaches them instantly.
    const intervalFor = () => {
      const away = !callAdminRef.current && (myStatusRef.current === 'Signed Out' || myStatusRef.current === 'Not Signed In');
      if (away) return 6000;
      return document.visibilityState === 'visible' ? 2000 : 3000;
    };
    let worker = null;
    let fallbackTimer = null;
    try {
      worker = new Worker(new URL('./callWorker.js', import.meta.url), { type: 'module' });
      worker.onmessage = (e) => {
        if (e.data && e.data.type === 'calls' && handleCallsRef.current) handleCallsRef.current(e.data.calls);
      };
      worker.postMessage({ type: 'start', api: API_URL, userName: myName, interval: intervalFor() });
      callWorkerRef.current = worker;
    } catch (e) {
      worker = null;
      fallbackTimer = setInterval(checkIncomingCalls, 2500);
    }
    const onVis = () => { if (worker) worker.postMessage({ type: 'interval', interval: intervalFor() }); };
    document.addEventListener('visibilitychange', onVis);
    const retune = setInterval(onVis, 30000);
    return () => {
      document.removeEventListener('visibilitychange', onVis);
      clearInterval(retune);
      if (worker) { worker.postMessage({ type: 'stop' }); worker.terminate(); }
      if (fallbackTimer) clearInterval(fallbackTimer);
      callWorkerRef.current = null;
    };
  }, [currentUserInfo?.name]);

  const openCallCompose = () => {
    setCallRecipients([]);
    setShowCallCompose(true);
  };

  const toggleCallRecipient = (name) => {
    setCallRecipients(prev => prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]);
  };

  // The caller's screen appears instantly with its own call ID; the request goes out in
  // the background and is retried (the server ignores a repeat of the same call ID).
  const sendCall = async (callType) => {
    if (callRecipients.length === 0) { alert('Select at least one person to call!'); return; }
    const recipients = [...callRecipients];
    const callId = 'call_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);
    setShowCallCompose(false);
    setOutgoingCall({ callId, callType, startedAt: Date.now(), recipients: recipients.map(r => ({ to: r, response: 'Ringing' })) });

    const url = API_URL + '?action=startCall&from=' + encodeURIComponent(currentUserInfo.name) +
      '&to=' + encodeURIComponent(recipients.join(',')) + '&callType=' + encodeURIComponent(callType) +
      '&callId=' + encodeURIComponent(callId);
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const controller = new AbortController();
        const t = setTimeout(() => controller.abort(), 15000);
        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(t);
        const data = await response.json();
        if (data.status === 'ok') return;
      } catch (error) {}
      await new Promise(r => setTimeout(r, 800 * (attempt + 1)));
    }
    setOutgoingCall(prev => prev && prev.callId === callId
      ? { ...prev, recipients: prev.recipients.map(r => ({ ...r, response: 'Failed' })) }
      : prev);
  };

  // Caller's live status — every 1.5s while the tracker is open.
  useEffect(() => {
    if (outgoingCall?.callId) {
      let cancelled = false;
      const poll = async () => {
        try {
          const response = await fetch(API_URL + '?action=getCallStatus&callId=' + encodeURIComponent(outgoingCall.callId));
          const data = await response.json();
          if (!cancelled && data.status === 'ok' && Array.isArray(data.recipients) && data.recipients.length > 0) {
            setOutgoingCall(prev => prev && prev.callId === outgoingCall.callId ? { ...prev, recipients: data.recipients } : prev);
          }
        } catch (error) {}
      };
      const first = setTimeout(poll, 800);
      const interval = setInterval(poll, 1500);
      return () => { cancelled = true; clearTimeout(first); clearInterval(interval); };
    }
  }, [outgoingCall?.callId]);

  // FIX — EXPERT FIX for unreliable/late/missed calls. The root cause: browsers heavily
  // throttle JS timers in BACKGROUND tabs (sometimes to once a minute or less), so the 3s
  // interval above only ever really applies while someone is actively looking at this tab.
  // Rather than fight that (impossible to reliably win), this catches the exact moment
  // someone switches BACK to the tab — via the Page Visibility API, which fires reliably
  // regardless of throttling — and checks immediately right then, instead of waiting for
  // the next (possibly very delayed) interval tick. Combined with widening the server-side
  // detection window (see Code.gs getIncomingCalls), this means: if you were away, the
  // instant you look back at this tab, any pending call/notification appears immediately.
  useEffect(() => {
    if (!currentUser) return;
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // FIX — the tab coming back to foreground (e.g. tapping a push notification) is
        // exactly when a suspended AudioContext needs to be woken up, so any ring/alarm
        // that's supposed to be playing actually starts making sound right away instead
        // of sitting silently "on" until some other interaction happens to resume it.
        if (ringAudioCtxRef.current && ringAudioCtxRef.current.state === 'suspended') {
          ringAudioCtxRef.current.resume().catch(() => {});
        }
        checkIncomingCalls();
        loadTasksBackground();
        loadInboxBackground();
        loadChatsBackground();
        loadAttendanceBackground();
        loadMeetingsBackground();
        if (showNoticeBoard) loadNotices();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [currentUser, incomingCall, currentUserInfo?.name, showNoticeBoard]);

  useEffect(() => {
    return () => stopRinging();
  }, []);

  useEffect(() => {
    loadTeam();
    loadContentChannels();
    loadHolidays();
    loadSettings();
  }, []);

  useEffect(() => {
    if (currentUser) {
      loadTasks();
      loadAttendance();
      loadInbox();
      loadChats();
    }
  }, [currentUser]);

  // FIX — same stale-closure issue as the call-polling effect above: currentUserInfo?.name
  // must be in the dependency array, or this interval can get permanently stuck running
  // with an undefined currentUserInfo if team data resolves after this effect's first run.
  useEffect(() => {
    if (currentUser) {
      const interval = setInterval(() => {
        loadTasksBackground();
        loadAttendanceBackground();
        loadInboxBackground();
        loadChatsBackground();
        loadMeetingsBackground();
        // Re-reads the browser's actual permission state (not just our cached copy) —
        // if it was ever silently revoked/reset outside the app, the header icon
        // will reflect that within 15s instead of staying stuck showing "granted".
        if (typeof Notification !== 'undefined' && Notification.permission !== notifPermission) {
          setNotifPermission(Notification.permission);
        }
      }, 15000);
      return () => clearInterval(interval);
    }
  }, [currentUser, notifPermission, currentUserInfo?.name]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTick(t => t + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (currentUser && !isAdmin) setTaskViewMode('assigned');
  }, [currentUser, isAdmin]);

  const loadSettings = async () => {
    try {
      const response = await fetch(API_URL + '?action=getSettings');
      const data = await response.json();
      if (data.status === 'ok' && data.settings) { setAppSettings(data.settings); cacheSet('settings', data.settings); }
    } catch (e) {}
  };

  const openCcAccess = () => {
    setCcAccessDraft(activeTeam.filter(m => hasContentAccess(m)).map(m => m.id));
    setShowCcAccess(true);
  };

  const saveCcAccess = () => {
    const list = Array.from(new Set([...ccAccessDraft, 'pcwtc45', 'shivendrawtc77']));
    setAppSettings(prev => { const next = { ...prev, contentCalendarAccess: list }; cacheSet('settings', next); return next; });
    fetch(API_URL, {
      method: 'POST', mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ action: 'saveSetting', key: 'contentCalendarAccess', value: list, userId: currentUser })
    }).catch(() => {});
    setShowCcAccess(false);
    pushNotif('🔐 Content Calendar access saved.');
  };

  const loadTeam = async () => {
    try {
      const response = await fetch(API_URL + '?action=getTeam');
      const data = await response.json();
      if (data.status === 'ok' && data.team.length > 0) {
        // SAFETY NET: a sheet edit (bad row, accidental delete, mid-edit save) should
        // never be able to lock everyone out with the "invalid user" screen. Any core
        // account present in DEFAULT_TEAM but missing from the live sheet gets silently
        // restored here, so admins can always get back in to fix the sheet properly.
        const liveIds = new Set(data.team.map(m => m.id));
        const missingDefaults = DEFAULT_TEAM.filter(m => !liveIds.has(m.id));
        const merged = [...data.team, ...missingDefaults]
          .filter(m => !DEPARTED_MEMBER_IDS.includes(String(m.id).toLowerCase()));
        setTeam(merged);
        cacheSet('team', merged); // FIX — powers instant load on the next visit
      }
    } catch (error) {
    } finally {
      setTeamLoaded(true);
    }
  };

  const loadTasks = async () => {
    // FIX — no longer forces the blocking loading screen back on here. The initial
    // `loading` state already correctly reflects whether cached tasks exist; forcing it
    // true on every call would re-show the spinner even when we have cached data to
    // display immediately, defeating the whole point of caching.
    setLoadTimedOut(false);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000); // hard 20s cap
    try {
      const response = await fetch(API_URL + '?action=getTasks', { signal: controller.signal });
      const data = await response.json();
      if (data.status === 'ok') {
        setTasks(data.tasks);
        cacheSet('tasks', data.tasks); // FIX — powers instant load on the next visit
      }
    } catch (error) {
      // FIX — if the backend genuinely hasn't responded within 20s (likely the old,
      // pre-optimization Apps Script deployment still being live), stop spinning forever
      // and show a retry option instead of a dead screen.
      if (!cacheGet('tasks')) setLoadTimedOut(true);
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
    }
  };

  const loadTasksBackground = async () => {
    try {
      const response = await fetch(API_URL + '?action=getTasks');
      const data = await response.json();
      if (data.status === 'ok') {
        setTasks(data.tasks);
        cacheSet('tasks', data.tasks);
      }
    } catch (error) {}
  };

  const loadArchive = async () => {
    try {
      const response = await fetch(API_URL + '?action=getArchive');
      const data = await response.json();
      if (data.status === 'ok') setArchivedTasks(data.tasks);
    } catch (error) {}
  };

  // One place that knows how every kind of notification looks (icon, title, toast text).
  const describeInboxItem = (item) => {
    switch (item.type) {
      case 'new_routine': return { icon: '🔄', title: `Routine task from ${item.from}`, toast: `🔄 Routine task from ${item.from}: ${item.title}` };
      case 'task_completed': return { icon: '✅', title: `${item.from} completed a task`, toast: `✅ ${item.from} completed: ${item.title}` };
      case 'new_meeting': return { icon: '🤝', title: `Meeting from ${item.from}`, toast: `🤝 ${item.from} scheduled: ${item.title}` };
      case 'task_reminder': return { icon: '⏰', title: `${item.from} is reminding you`, toast: `⏰ ${item.from} reminded you: ${item.title}` };
      case 'missed_call': return { icon: '📞', title: `Missed call from ${item.from}`, toast: `📞 Missed call from ${item.from}` };
      case 'correction': return { icon: '📝', title: `${item.from} asked for an attendance correction`, toast: `📝 Correction request from ${item.from}` };
      case 'attendance': return { icon: '🕘', title: 'Attendance update', toast: `🕘 ${item.title}` };
      case 'new_target': return { icon: '🎯', title: `${item.from} set you a target`, toast: `🎯 New target from ${item.from}: ${item.title}` };
      case 'target_achieved': return { icon: '🏆', title: `${item.from} achieved a target`, toast: `🏆 ${item.from} achieved: ${item.title}` };
      default: return { icon: '📌', title: `New task from ${item.from}`, toast: `📌 New task from ${item.from}: ${item.title}` };
    }
  };
  const [reminderFlash, setReminderFlash] = useState(null);

  // FIX #7 — Notification detection rewritten from a fragile "count went up" comparison
  // to an explicit seen-ID ledger. Fires identically for General AND Routine tasks,
  // handles multiple simultaneous assignments, and never misfires on first load.
  const processInboxForNotifs = (items) => {
    if (firstInboxLoad.current) {
      items.forEach(i => seenInboxIds.current.add(i.id));
      firstInboxLoad.current = false;
      return;
    }
    const newOnes = items.filter(i => i.read === 'No' && !seenInboxIds.current.has(i.id));
    newOnes.forEach(item => {
      seenInboxIds.current.add(item.id);
      const msg = describeInboxItem(item).toast;
      if (item.type === 'task_reminder') {
        playReminderTone();
        setReminderFlash({ taskId: String(item.taskId), from: item.from, at: Date.now() });
      } else {
        playNotifSound();
      }
      pushNotif(msg, () => handleInboxItemClick(item));
      if (document.visibilityState !== 'visible') fireDesktopNotification('WTC Hub', msg);
    });
  };

  const loadInbox = async () => {
    if (!currentUserInfo) return;
    try {
      const response = await fetch(API_URL + '?action=getInbox&userName=' + encodeURIComponent(currentUserInfo.name));
      const data = await response.json();
      if (data.status === 'ok') {
        processInboxForNotifs(data.inbox);
        setInbox(data.inbox.filter(i => !dismissedInboxIds.current.has(i.id)));
      }
    } catch (error) {}
  };

  const loadInboxBackground = async () => {
    if (!currentUserInfo) return;
    try {
      const response = await fetch(API_URL + '?action=getInbox&userName=' + encodeURIComponent(currentUserInfo.name));
      const data = await response.json();
      if (data.status === 'ok') {
        processInboxForNotifs(data.inbox);
        setInbox(data.inbox.filter(i => !dismissedInboxIds.current.has(i.id)));
      }
    } catch (error) {}
  };

  const processChatsForNotifs = (items) => {
    if (firstChatLoad.current) {
      items.forEach(c => seenChatIds.current.add(c.id));
      firstChatLoad.current = false;
      return;
    }
    const newOnes = items.filter(c => c.to === currentUserInfo?.name && c.read === 'No' && !seenChatIds.current.has(c.id));
    newOnes.forEach(msg => {
      seenChatIds.current.add(msg.id);
      playNotifSound();
      // NEW — clicking a chat toast now opens that conversation directly.
      pushNotif(`💬 New message from ${msg.from}`, () => { setShowChat(true); openChatWith(msg.from); });
      fireDesktopNotification(`💬 ${msg.from}`, msg.message);
    });
  };

  const loadChats = async () => {
    if (!currentUserInfo) return;
    try {
      const response = await fetch(API_URL + '?action=getChats&userName=' + encodeURIComponent(currentUserInfo.name));
      const data = await response.json();
      if (data.status === 'ok') {
        processChatsForNotifs(data.chats);
        setChats(data.chats);
      }
    } catch (error) {}
  };

  const loadChatsBackground = async () => {
    if (!currentUserInfo) return;
    try {
      const response = await fetch(API_URL + '?action=getChats&userName=' + encodeURIComponent(currentUserInfo.name));
      const data = await response.json();
      if (data.status === 'ok') {
        processChatsForNotifs(data.chats);
        setChats(data.chats);
      }
    } catch (error) {}
  };

  const loadAttendance = async () => {
    try {
      const response = await fetch(API_URL + '?action=getAttendance');
      const data = await response.json();
      if (data.status === 'ok') {
        setAttendance(data.attendance);
        if (data.shifts) setAttShifts(data.shifts);
        if (data.rules) setAttRules(data.rules);
        if (!isAdmin || isHR) {
          applyServerAttendance(data.attendance.find(a => a.userId === currentUser));
        }
      }
    } catch (error) {}
  };

  const loadAttendanceBackground = async () => {
    try {
      const response = await fetch(API_URL + '?action=getAttendance');
      const data = await response.json();
      if (data.status === 'ok') {
        setAttendance(data.attendance);
        if (data.shifts) setAttShifts(data.shifts);
        if (data.rules) setAttRules(data.rules);
        if (!isAdmin || isHR) {
          applyServerAttendance(data.attendance.find(a => a.userId === currentUser));
        }
      }
    } catch (error) {}
  };

  const updateMyStatus = async (newStatus) => {
    if (isAdmin && !isHR) return;
    if (!currentUserInfo) return;
    if (attendanceSwitching) return; // prevents double-clicks from creating duplicate log rows
    if (newStatus === 'Lunch Break') {
      const lunch = myLunchInfo();
      if (lunch.taken) { pushNotif('🍽️ Lunch was already marked today.'); return; }
      if (!lunch.windowOpen) { pushNotif('🍽️ Lunch can only be marked between 1:00 and 2:00 PM.'); return; }
    }
    if (newStatus === 'Signed Out') {
      const first = firstInOf(myLiveLog || attendance.find(a => a.userId === currentUser)?.log);
      const outMin = first ? requiredOutMin(first.min) : null;
      const early = outMin !== null && !isOffToday() && nowMinutes() < outMin;
      const msg = early
        ? `Your sign-out time today is ${minToClock(outMin)}.\n\nSigning out now counts as an early sign-out (a strike). Sign out anyway?`
        : 'Sign out for today?';
      if (!window.confirm(msg)) return;
    }
    setAttendanceSwitching(true);

    const nowISO = new Date().toISOString();
    myLiveLogTimeRef.current = new Date(nowISO).getTime();
    setMyStatus(newStatus);
    // Append the new event to the local log immediately — this is what makes the
    // switch feel instant and keeps the per-second timer precise from the very
    // first tick, instead of waiting ~1.5s for the server round-trip.
    setMyLiveLog(prev => prev ? `${prev}||EVT||${newStatus}|SEP|${nowISO}` : `${newStatus}|SEP|${nowISO}`);

    fetch(API_URL, {
      method: 'POST', mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({
        action: 'updateAttendance',
        userId: currentUser,
        userName: currentUserInfo.name,
        status: newStatus
      })
    });
    setTimeout(() => {
      loadAttendanceBackground(); // reconciles myLiveLog with the server's authoritative copy
      setAttendanceSwitching(false);
    }, 1500);
  };

  // ============================================================
  // v13 — ATTENDANCE DISCIPLINE (client side). The server (attendanceWatchdog in Code.gs)
  // is the judge — it records flags and closes forgotten days. The app shows the rules,
  // live warnings and countdowns, so nobody is surprised by a flag.
  // ============================================================
  const [attShifts, setAttShifts] = useState({});
  const [attRules, setAttRules] = useState({ lunchStart: '13:00', lunchEnd: '14:00', lunchMinutes: 30, lunchTolerance: 5, lateGrace: 15, minWorkHours: 8, strikesPerHalfDay: 3 });
  const [showDiscipline, setShowDiscipline] = useState(false);
  const [disciplineTab, setDisciplineTab] = useState('mine'); // mine | team | shifts
  const [disciplineData, setDisciplineData] = useState({ mine: null, team: null });
  const [disciplineLoading, setDisciplineLoading] = useState(false);
  const [discYear, setDiscYear] = useState(new Date().getFullYear());
  const [discMonth, setDiscMonth] = useState(new Date().getMonth() + 1);
  const [correctionDraft, setCorrectionDraft] = useState(null); // { flagId, note, correctedTime }
  const [shiftDrafts, setShiftDrafts] = useState({});
  const lunchNudgeRef = useRef({});

  const hhmmToMin = (t) => { const m = String(t || '').match(/^(\d{1,2}):(\d{2})/); return m ? Number(m[1]) * 60 + Number(m[2]) : null; };
  const fmtClock = (hhmm) => {
    const m = hhmmToMin(hhmm);
    if (m === null) return hhmm || '';
    const h = Math.floor(m / 60), mm = m % 60;
    return `${((h + 11) % 12) + 1}:${String(mm).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
  };
  const nowMinutes = () => { const d = new Date(); return d.getHours() * 60 + d.getMinutes(); };
  const parseLog = (log) => String(log || '').split('||EVT||').map(x => {
    const [st, ts] = x.split('|SEP|');
    const time = new Date(String(ts || '').trim());
    return st && !isNaN(time.getTime()) ? { status: st.trim(), time } : null;
  }).filter(Boolean).sort((a, b) => a.time - b.time);
  const shiftOf = (userId) => attShifts[userId] || { start: '10:00', end: '19:00' };

  // v16 — FLEXIBLE SHIFT (same rule as the server, see Code.gs):
  // sign in 9:00–10:14 → sign out 9h15m later in 15-min slots (before 9:00 → 6 PM);
  // 10:15–11:00 → ¼ day cut, after 11:00 → ½ day cut, both sign out 7:15 PM.
  const requiredOutMin = (inMin) => inMin < 540 ? 1080 : inMin <= 614 ? 1095 + Math.floor((inMin - 540) / 15) * 15 : 1155;
  const lateCutOf = (inMin) => inMin <= 614 ? 0 : inMin <= 660 ? 0.25 : 0.5;
  const minToClock = (m) => fmtClock(`${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`);
  const todayKeyIST = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
  const isOffToday = () => new Date().getDay() === 0 || holidays.some(h => String(h.date).slice(0, 10) === todayKeyIST());
  const firstInOf = (log) => {
    const ev = parseLog(log);
    const first = ev.find(e => e.status === 'Working' || e.status === 'Meeting');
    return first ? { time: first.time, min: first.time.getHours() * 60 + first.time.getMinutes() } : null;
  };

  // Everything about today's lunch for a given activity log.
  const lunchInfoFromLog = (log) => {
    const ev = parseLog(log);
    const idx = ev.findIndex(e => e.status === 'Lunch Break');
    const nm = nowMinutes();
    const ws = hhmmToMin(attRules.lunchStart), we = hhmmToMin(attRules.lunchEnd);
    const windowOpen = nm >= ws && nm < we;
    if (idx === -1) return { taken: false, onLunch: false, windowOpen, minsToClose: we - nm, beforeWindow: nm < ws, afterWindow: nm >= we };
    const start = ev[idx].time;
    const end = idx + 1 < ev.length ? ev[idx + 1].time : null;
    const usedMs = Math.max(0, (end || new Date()) - start);
    return { taken: true, onLunch: !end, windowOpen, start, end, usedMin: usedMs / 60000, beforeWindow: false, afterWindow: nm >= we };
  };
  const myLunchInfo = () => lunchInfoFromLog(myLiveLog || attendance.find(a => a.userId === currentUser)?.log);

  // Live warnings for one person's day (used on the personal card and on Team Status).
  const dayWarnings = (userId, log) => {
    const ev = parseLog(log);
    const nm = nowMinutes();
    const out = [];
    if (isOffToday()) {
      if (ev.length) out.push({ kind: 'ok', text: 'Extra working day' });
      return out;
    }
    if (ev.length === 0) {
      if (nm > 614 && nm < 1155) out.push({ kind: 'bad', text: 'Not signed in' });
      return out;
    }
    const first = firstInOf(log);
    if (first) {
      const cut = lateCutOf(first.min);
      if (cut === 0.25) out.push({ kind: 'warn', text: '¼ day cut (late)' });
      if (cut === 0.5) out.push({ kind: 'bad', text: '½ day cut (late)' });
    }
    const lunch = lunchInfoFromLog(log);
    if (lunch.onLunch && lunch.usedMin > attRules.lunchMinutes) out.push({ kind: 'bad', text: `Lunch +${Math.round(lunch.usedMin - attRules.lunchMinutes)}m` });
    if (lunch.taken && !lunch.onLunch && lunch.usedMin > attRules.lunchMinutes + attRules.lunchTolerance) out.push({ kind: 'warn', text: `Long lunch ${Math.round(lunch.usedMin)}m` });
    if (!lunch.taken && lunch.afterWindow) out.push({ kind: 'warn', text: 'Lunch not marked' });
    const last = ev[ev.length - 1];
    const outMin = first ? requiredOutMin(first.min) : 1155;
    if (last.status !== 'Signed Out' && nm >= outMin + 15) out.push({ kind: 'bad', text: `Past sign-out time (${minToClock(outMin)})` });
    if (last.status === 'Signed Out' && first) {
      const lm = last.time.getHours() * 60 + last.time.getMinutes();
      if (outMin - lm > 2) out.push({ kind: 'warn', text: `Left early (${minToClock(lm)})` });
    }
    return out;
  };

  const loadDiscipline = async (scope, year = discYear, month = discMonth) => {
    if (!currentUser) return;
    setDisciplineLoading(true);
    try {
      const res = await fetch(API_URL + `?action=getDiscipline&userId=${encodeURIComponent(currentUser)}&year=${year}&month=${month}&scope=${scope === 'team' ? 'all' : 'mine'}`);
      const data = await res.json();
      if (data.status === 'ok') {
        setDisciplineData(prev => ({ ...prev, [scope === 'team' ? 'team' : 'mine']: data }));
        if (data.shifts) setAttShifts(data.shifts);
        if (data.rules) setAttRules(data.rules);
      }
    } catch (e) {} finally { setDisciplineLoading(false); }
  };

  const openDiscipline = (tab) => {
    const reviewTab = ['day', 'month', 'leaves', 'salary'].includes(tab);
    const t = (tab === 'team' || reviewTab) && canManageAttendance ? tab : 'mine';
    setDisciplineTab(t);
    setCorrectionDraft(null);
    setShowDiscipline(true);
    if (reviewTab && canManageAttendance) loadReview();
    else loadDiscipline(t);
  };

  const changeDiscMonth = (delta) => {
    let m = discMonth + delta, y = discYear;
    if (m > 12) { m = 1; y++; }
    if (m < 1) { m = 12; y--; }
    setDiscMonth(m); setDiscYear(y);
    if (['day', 'month', 'leaves', 'salary'].includes(disciplineTab)) loadReview(y, m);
    else loadDiscipline(disciplineTab === 'team' ? 'team' : 'mine', y, m);
  };

  const submitCorrection = () => {
    if (!correctionDraft || !correctionDraft.note.trim()) { alert('Please write the reason.'); return; }
    fetch(API_URL, {
      method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ action: 'requestCorrection', flagId: correctionDraft.flagId, userId: currentUser, note: correctionDraft.note.trim(), correctedTime: correctionDraft.correctedTime || '' })
    }).catch(() => {});
    setDisciplineData(prev => prev.mine ? { ...prev, mine: { ...prev.mine, flags: prev.mine.flags.map(f => String(f.id) === String(correctionDraft.flagId) ? { ...f, status: 'Requested', note: correctionDraft.note } : f) } } : prev);
    setCorrectionDraft(null);
    pushNotif('📝 Correction request sent to HR.');
  };

  const decideFlag = (flag, decision) => {
    if (flag.userId === currentUser) { alert("You can't approve your own request."); return; }
    fetch(API_URL, {
      method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ action: 'resolveFlag', flagId: flag.id, decision, resolverId: currentUser, resolverName: currentUserInfo?.name })
    }).catch(() => {});
    setDisciplineData(prev => {
      if (!prev.team) return prev;
      const upd = (list) => (list || []).map(f => String(f.id) === String(flag.id) ? { ...f, status: decision } : f);
      return { ...prev, team: { ...prev.team, flags: upd(prev.team.flags), requests: (prev.team.requests || []).filter(f => String(f.id) !== String(flag.id)) } };
    });
    pushNotif(decision === 'Excused' ? '✅ Excused — strike removed.' : '❌ Request rejected.');
    setTimeout(() => loadDiscipline('team'), 2500);
  };

  const saveShiftFor = (member) => {
    const d = shiftDrafts[member.id];
    if (!d || hhmmToMin(d.start) === null || hhmmToMin(d.end) === null) return;
    if (hhmmToMin(d.end) <= hhmmToMin(d.start)) { alert('Shift end must be after shift start.'); return; }
    setAttShifts(prev => ({ ...prev, [member.id]: { start: d.start, end: d.end } }));
    fetch(API_URL, {
      method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ action: 'saveShift', targetId: member.id, shiftStart: d.start, shiftEnd: d.end, userId: currentUser })
    }).catch(() => {});
    setShiftDrafts(prev => { const n = { ...prev }; delete n[member.id]; return n; });
    pushNotif(`🕘 Shift saved for ${member.displayName}: ${fmtClock(d.start)} – ${fmtClock(d.end)}`);
  };

  // ============================================================
  // v14 — ATTENDANCE REVIEW + LEAVE (HR, PC, Shivendra): any day, any month, everyone.
  // ============================================================
  const LEAVE_TYPES = ['Casual Leave', 'Sick Leave', 'Paid Leave', 'Unpaid Leave', 'Half Day', 'Saturday Off', 'Work From Home', 'Official Duty', 'Comp Off'];
  const [review, setReview] = useState(null);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewDay, setReviewDay] = useState(() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; });
  const [leaveForm, setLeaveForm] = useState({ userIds: [], from: '', to: '', type: 'Casual Leave', note: '' });
  const [reviewCell, setReviewCell] = useState(null);
  const [myLeaves, setMyLeaves] = useState([]);
  const [showSatOff, setShowSatOff] = useState(false);
  const loadMyLeaves = async () => {
    if (!currentUser) return;
    try {
      const res = await fetch(API_URL + '?action=getMyLeaves&userId=' + encodeURIComponent(currentUser));
      const data = await res.json();
      if (data.status === 'ok' && Array.isArray(data.leaves)) setMyLeaves(data.leaves);
    } catch (e) {}
  };
  useEffect(() => { if (currentUser) loadMyLeaves(); }, [currentUser]);
  // Saturdays from today to the end of next month that can still be taken off.
  const upcomingSaturdays = () => {
    const out = [];
    const d = new Date(); d.setHours(12, 0, 0, 0);
    const end = new Date(d.getFullYear(), d.getMonth() + 2, 0, 12);
    while (d <= end) {
      if (d.getDay() === 6) out.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`);
      d.setDate(d.getDate() + 1);
    }
    return out;
  };
  const takeSaturdayOff = async (date) => {
    const used = myLeaves.find(l => l.type === 'Saturday Off' && l.date.slice(0, 7) === date.slice(0, 7));
    if (used) { alert(`You already took ${new Date(used.date + 'T12:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} off this month. Cancel it first to pick another Saturday.`); return; }
    if (!window.confirm(`Take Saturday ${new Date(date + 'T12:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })} off?`)) return;
    try {
      const payload = { userIds: [currentUser], fromDate: date, toDate: date, leaveType: 'Saturday Off', note: 'Monthly Saturday off', markerId: currentUser, markerName: currentUserInfo?.name };
      const res = await fetch(API_URL + '?action=markLeaveSync&data=' + encodeURIComponent(JSON.stringify(payload)));
      const data = await res.json();
      if (data.status === 'ok') { pushNotif('🗓 Saturday off booked.'); loadMyLeaves(); }
      else alert(data.message || 'Could not book it.');
    } catch (e) { alert('Could not reach the server — try again.'); }
  };
  const cancelMySaturday = (l) => {
    if (!window.confirm('Cancel this Saturday off?')) return;
    setMyLeaves(prev => prev.filter(x => x.id !== l.id));
    fetch(API_URL, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ action: 'cancelLeave', id: l.id, markerId: currentUser }) }).catch(() => {});
  };

  const loadReview = async (year = discYear, month = discMonth) => {
    if (!canManageAttendance) return;
    setReviewLoading(true);
    try {
      const res = await fetch(API_URL + `?action=getAttendanceReport&viewerId=${encodeURIComponent(currentUser)}&year=${year}&month=${month}`);
      const data = await res.json();
      if (data.status === 'ok') setReview(data);
    } catch (e) {} finally { setReviewLoading(false); }
  };

  const submitLeave = () => {
    const f = leaveForm;
    if (!f.userIds.length || !f.from) { alert('Choose the person and the date.'); return; }
    if (f.to && f.to < f.from) { alert('The end date is before the start date.'); return; }
    fetch(API_URL, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ action: 'markLeave', userIds: f.userIds, fromDate: f.from, toDate: f.to || f.from, leaveType: f.type, note: f.note, markerId: currentUser, markerName: currentUserInfo?.name }) }).catch(() => {});
    pushNotif(`🌴 ${f.type} marked for ${f.userIds.length} person(s)`);
    setLeaveForm({ userIds: [], from: '', to: '', type: f.type, note: '' });
    setTimeout(() => loadReview(), 2500);
  };

  const cancelLeaveRow = (l) => {
    if (!window.confirm(`Cancel ${l.type} for ${l.name} on ${l.date}?`)) return;
    setReview(prev => prev ? { ...prev, leaves: prev.leaves.map(x => x.id === l.id ? { ...x, status: 'Cancelled' } : x) } : prev);
    fetch(API_URL, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ action: 'cancelLeave', id: l.id, markerId: currentUser }) }).catch(() => {});
    setTimeout(() => loadReview(), 2500);
  };

  const fmtMin = (m) => m ? `${Math.floor(m / 60)}h ${String(m % 60).padStart(2, '0')}m` : '—';

  const downloadSalaryCsv = () => {
    if (!review) return;
    const head = ['Name', 'Working days', 'Present', 'Absent', 'Half-day leave', 'Paid leave', 'Unpaid leave', 'Saturday off', 'WFH', 'Extra days (Sun/holiday)', 'Late arrivals', 'Late cut (days)', 'Strikes', 'Strike deduction (days)', 'Suggested deduction (days)', 'Total hours', 'Avg hours/day'];
    const rows = review.people.map(p => [p.name, p.totals.workingDays, p.totals.present, p.totals.absent, p.totals.halfDays, p.totals.paidLeave, p.totals.unpaidLeave, p.totals.saturdayOff || 0, p.totals.wfh,
      p.totals.extraDays || 0, p.totals.late, p.totals.lateCut || 0, p.totals.strikes, p.totals.strikeDeduction, p.totals.deductionDays, (p.totals.workedMin / 60).toFixed(1), (p.totals.avgWorkedMin / 60).toFixed(1)]);
    const csv = [head, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `WTC-attendance-${review.year}-${String(review.month).padStart(2, '0')}.csv`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  };

  // Load my own record after login (powers the strikes line on the card), refresh every 10 min.
  useEffect(() => {
    if (!currentUser || (isAdmin && !isHR)) return;
    loadDiscipline('mine');
    const t = setInterval(() => loadDiscipline('mine'), 600000);
    return () => clearInterval(t);
  }, [currentUser, isAdmin, isHR]);

  // Lunch countdown nudges: soft sound at 25 min, again at 30 min (once each per day).
  useEffect(() => {
    if (isAdmin && !isHR) return;
    const lunch = myLunchInfo();
    if (!lunch.onLunch) return;
    const key = new Date().toDateString();
    const fired = lunchNudgeRef.current[key] || {};
    if (lunch.usedMin >= attRules.lunchMinutes - 5 && !fired.warn) {
      fired.warn = true; playLunchNudge(); pushNotif('🍽️ 5 minutes of lunch left.');
    }
    if (lunch.usedMin >= attRules.lunchMinutes && !fired.over) {
      fired.over = true; playLunchNudge(); setTimeout(playLunchNudge, 900);
      pushNotif('⏰ Lunch time is over — tap Back to Work.');
      fireDesktopNotification('⏰ Lunch time is over', 'Tap Back to Work in WTC Hub.');
    }
    lunchNudgeRef.current[key] = fired;
  });

  // ============================================================
  // v14 — TARGETS. Everyone sets targets for themselves; PC, Shivendra and HR can also
  // assign targets to anyone. PC and Shivendra see all targets; everyone else sees their
  // own and the ones they assigned (the server enforces the same rule).
  // ============================================================
  const TARGET_UNITS = ['Reels', 'Videos', 'Shorts', 'Posts', 'Carousels', 'Thumbnails', 'Scripts', 'Tasks', 'Followers', 'Views', 'Hours', 'Leads', '%', 'Other'];
  const [targets, setTargets] = useState([]);
  const [targetsCanSeeAll, setTargetsCanSeeAll] = useState(false);
  const [showTargets, setShowTargets] = useState(false);
  const [targetView, setTargetView] = useState('mine'); // mine | assigned | all
  const [targetPersonFilter, setTargetPersonFilter] = useState('all');
  const [targetForm, setTargetForm] = useState(null);
  const [progressDraft, setProgressDraft] = useState({}); // id -> { value, note }
  const [targetHistoryOpen, setTargetHistoryOpen] = useState(null);
  const canAssignTargets = canManageAttendance;

  const loadTargets = async () => {
    if (!currentUser) return;
    try {
      const res = await fetch(API_URL + '?action=getTargets&userId=' + encodeURIComponent(currentUser));
      const data = await res.json();
      if (data.status === 'ok' && Array.isArray(data.targets)) { setTargets(data.targets); setTargetsCanSeeAll(!!data.canSeeAll); }
    } catch (e) {}
  };
  useEffect(() => { if (currentUser) loadTargets(); }, [currentUser]);

  const periodRange = (period, from) => {
    const d = from ? new Date(from + 'T12:00:00') : new Date();
    const key = (x) => `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`;
    const start = new Date(d);
    let end = new Date(d);
    if (period === 'Daily') { /* same day */ }
    else if (period === 'Weekly') { const day = start.getDay(); const toMon = day === 0 ? -6 : 1 - day; start.setDate(start.getDate() + toMon); end = new Date(start); end.setDate(start.getDate() + 5); }
    else if (period === 'Monthly') { start.setDate(1); end = new Date(start.getFullYear(), start.getMonth() + 1, 0); }
    else if (period === 'Quarterly') { start.setMonth(Math.floor(start.getMonth() / 3) * 3, 1); end = new Date(start.getFullYear(), start.getMonth() + 3, 0); }
    else return null;
    return { start: key(start), due: key(end) };
  };

  const openNewTarget = () => {
    const r = periodRange('Monthly');
    setTargetForm({ id: null, title: '', details: '', ownerIds: [currentUser], period: 'Monthly', start: r.start, due: r.due, target: '', unit: 'Reels' });
  };

  const saveTargetForm = () => {
    const f = targetForm;
    if (!f.title.trim()) { alert('Write what the target is.'); return; }
    if (!(Number(f.target) > 0)) { alert('Enter a target number (e.g. 30).'); return; }
    if (!f.due || f.due < f.start) { alert('Check the dates — the due date must be on or after the start.'); return; }
    if (!f.ownerIds.length) { alert('Choose who this target is for.'); return; }
    const payload = { id: f.id, title: f.title.trim(), details: f.details.trim(), ownerIds: f.ownerIds, period: f.period, start: f.start, due: f.due, target: Number(f.target), unit: f.unit };
    if (f.id) {
      setTargets(prev => prev.map(t => t.id === f.id ? { ...t, ...payload, status: t.achieved >= payload.target ? 'Achieved' : 'Active' } : t));
    } else {
      const temp = f.ownerIds.map((oid, i) => {
        const m = team.find(x => x.id === oid);
        return { ...payload, id: 'tmp_' + Date.now() + '_' + i, ownerId: oid, owner: m ? m.name : oid, assignedById: currentUser, assignedBy: currentUserInfo?.name, achieved: 0, status: 'Active', log: [], created: new Date().toISOString() };
      });
      setTargets(prev => [...temp, ...prev]);
    }
    fetch(API_URL, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ action: 'saveTarget', target: payload, userId: currentUser, userName: currentUserInfo?.name }) }).catch(() => {});
    setTargetForm(null);
    pushNotif(f.id ? '🎯 Target updated' : `🎯 Target set${f.ownerIds.length > 1 ? ` for ${f.ownerIds.length} people` : ''}`);
    setTimeout(loadTargets, 2500);
  };

  const saveProgress = (t) => {
    const d = progressDraft[t.id];
    if (!d || d.value === '' || isNaN(Number(d.value))) return;
    if (String(t.id).startsWith('tmp_')) { alert('Still saving — try again in a moment.'); return; }
    const value = Math.max(0, Number(d.value));
    const achievedNow = value >= t.target && t.status !== 'Achieved';
    setTargets(prev => prev.map(x => x.id === t.id ? { ...x, achieved: value, status: value >= x.target ? 'Achieved' : 'Active',
      log: [...(x.log || []), { at: new Date().toISOString(), by: currentUserInfo?.name, value, note: d.note || '' }] } : x));
    fetch(API_URL, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ action: 'updateTargetProgress', id: t.id, achieved: value, note: d.note || '', userId: currentUser, userName: currentUserInfo?.name }) }).catch(() => {});
    setProgressDraft(prev => { const n = { ...prev }; delete n[t.id]; return n; });
    if (achievedNow) { triggerCelebration(); pushNotif('🏆 Target achieved — well done!'); }
  };

  const removeTarget = (t) => {
    if (!window.confirm(`Delete the target "${t.title}"?`)) return;
    setTargets(prev => prev.filter(x => x.id !== t.id));
    fetch(API_URL, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ action: 'deleteTarget', id: t.id, userId: currentUser }) }).catch(() => {});
  };

  // On track / Behind / Overdue / Achieved, from how much time has passed vs. how much is done.
  const targetHealth = (t) => {
    if (t.status === 'Achieved' || t.achieved >= t.target) return { key: 'done', label: 'Achieved' };
    const today = new Date(); today.setHours(12, 0, 0, 0);
    const start = new Date(t.start + 'T12:00:00'), due = new Date(t.due + 'T12:00:00');
    if (today > due) return { key: 'over', label: 'Missed / overdue' };
    const span = Math.max(1, (due - start) / 86400000 + 1);
    const passed = Math.min(span, Math.max(0, (today - start) / 86400000 + 1));
    const expected = (passed / span) * t.target;
    const daysLeft = Math.round((due - today) / 86400000);
    if (t.achieved + 0.0001 >= expected * 0.9) return { key: 'ok', label: 'On track', daysLeft };
    return { key: 'behind', label: `Behind (${Math.round(expected - t.achieved)} to catch up)`, daysLeft };
  };

  const myOpenTargets = targets.filter(t => t.ownerId === currentUser && t.status !== 'Achieved' && t.status !== 'Cancelled').length;

  // FIX #1 + #5 — Real-time calculation. Backend now stores correct UTC timestamps
  // (see Code.gs getIndiaTimeISO), so this math is finally trustworthy. Recomputed every
  // render, and the 1-second `tick` state above forces a re-render every second, so this
  // keeps counting up live instead of freezing. Break categories updated for FIX #4
  // (Tea Break removed — only Lunch Break + Meeting count as breaks now).
  const calculateWorkingTime = (log) => {
    if (!log || typeof log !== 'string') return { working: '0h 0m 0s', breaks: '0h 0m 0s', productivity: 0 };
    try {
      const eventStrings = log.split('||EVT||');
      const events = [];
      for (const eventStr of eventStrings) {
        const parts = eventStr.split('|SEP|');
        if (parts.length !== 2) continue;
        const status = parts[0].trim();
        const timeStr = parts[1].trim();
        if (!status || !timeStr) continue;
        const time = new Date(timeStr);
        if (isNaN(time.getTime())) continue;
        events.push({ status, time });
      }
      if (events.length === 0) return { working: '0h 0m 0s', breaks: '0h 0m 0s', productivity: 0 };
      let workingMs = 0;
      let breakMs = 0;
      const now = new Date();
      for (let i = 0; i < events.length - 1; i++) {
        const duration = events[i + 1].time - events[i].time;
        if (duration < 0) continue;
        if (WORK_STATUSES.includes(events[i].status)) workingMs += duration;
        else if (BREAK_STATUSES.includes(events[i].status)) breakMs += duration;
      }
      const lastEvent = events[events.length - 1];
      if (lastEvent && lastEvent.status !== 'Signed Out') {
        const duration = now - lastEvent.time;
        if (duration > 0) {
          if (WORK_STATUSES.includes(lastEvent.status)) workingMs += duration;
          else if (BREAK_STATUSES.includes(lastEvent.status)) breakMs += duration;
        }
      }
      const workingH = Math.floor(workingMs / 3600000);
      const workingM = Math.floor((workingMs % 3600000) / 60000);
      const workingS = Math.floor((workingMs % 60000) / 1000);
      const breakH = Math.floor(breakMs / 3600000);
      const breakM = Math.floor((breakMs % 3600000) / 60000);
      const breakS = Math.floor((breakMs % 60000) / 1000);
      const totalMs = workingMs + breakMs;
      const productivity = totalMs > 0 ? Math.round((workingMs / totalMs) * 100) : 0;
      return {
        working: `${workingH}h ${workingM}m ${workingS}s`,
        breaks: `${breakH}h ${breakM}m ${breakS}s`,
        productivity: productivity
      };
    } catch (error) {
      return { working: '0h 0m 0s', breaks: '0h 0m 0s', productivity: 0 };
    }
  };

  const timeAgo = (ts) => {
    const t = new Date(ts).getTime();
    if (isNaN(t)) return '';
    const mins = Math.round((Date.now() - t) / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins} min ago`;
    const hrs = Math.round(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return new Date(t).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  const formatMs = (ms) => {
    const h = Math.floor(ms / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    return `${h}h ${m}m`;
  };

  const loadMonthlyAttendance = async (year, month) => {
    if (!currentUser) return;
    setMonthlyLoading(true);
    try {
      const response = await fetch(API_URL + `?action=getMonthlyAttendance&userId=${currentUser}&year=${year}&month=${month}`);
      const data = await response.json();
      if (data.status === 'ok') setMonthlyAttendanceDays(data.days);
    } catch (error) {} finally { setMonthlyLoading(false); }
  };

  const openMonthlyAttendance = () => {
    setShowMonthlyAttendance(true);
    loadMonthlyAttendance(monthlyYear, monthlyMonth);
  };

  const changeMonthlyMonth = (delta) => {
    let newMonth = monthlyMonth + delta;
    let newYear = monthlyYear;
    if (newMonth > 12) { newMonth = 1; newYear++; }
    if (newMonth < 1) { newMonth = 12; newYear--; }
    setMonthlyMonth(newMonth);
    setMonthlyYear(newYear);
    loadMonthlyAttendance(newYear, newMonth);
  };

  const isTaskAssignedToMe = (task) => {
    if (!currentUserInfo) return false;
    const assignees = String(task.assignedTo).split(',').map(a => a.trim());
    return assignees.includes(currentUserInfo.name);
  };

  const filteredTasks = tasks.filter(t => {
    // FIX #2 — Removed the old blanket rule that hid every Routine/Routine Instance task
    // from non-admin viewers on their OWN dashboard. Routine tasks now show up in
    // "Assigned to Me" / "My Own Tasks" / "Assigned by Me" for everyone, same as General tasks.
    if (isAdmin) {
      if (taskViewMode === 'assigned') {
        if (!isTaskAssignedToMe(t)) return false;
      } else if (taskViewMode === 'by_me') {
        if (t.assignedBy !== currentUserInfo.name) return false;
      } else if (taskViewMode === 'own') {
        if (t.assignedBy !== currentUserInfo.name || !isTaskAssignedToMe(t)) return false;
      } else {
        if (managerView !== 'all') {
          // AG/BG aren't real team members (no dashboard), so they're not in `team` —
          // their pseudo-id IS their literal assignedTo name.
          const targetName = (managerView === 'AG' || managerView === 'BG') ? managerView : team.find(u => u.id === managerView)?.name;
          const assignees = String(t.assignedTo).split(',').map(a => a.trim());
          if (!assignees.includes(targetName)) return false;
        }
      }
    } else {
      if (taskViewMode === 'assigned') {
        if (!isTaskAssignedToMe(t)) return false;
      } else if (taskViewMode === 'by_me') {
        if (t.assignedBy !== currentUserInfo.name) return false;
      } else if (taskViewMode === 'own') {
        if (t.assignedBy !== currentUserInfo.name || !isTaskAssignedToMe(t)) return false;
      }
    }
    // FIX — multi-select filters: empty array = no filter (show all), matching the old
    // "All" behavior; a non-empty array means "match ANY of the selected values."
    if (filterStatus.length > 0 && !filterStatus.includes(t.status)) return false;
    if (filterChannel.length > 0) {
      const taskChannels = String(t.channel).split(',').map(c => c.trim());
      if (!taskChannels.some(c => filterChannel.includes(c))) return false;
    }
    if (filterCategory.length > 0 && !filterCategory.includes(t.category)) return false;
    if (filterTaskType.length > 0) {
      const typeMatches = filterTaskType.some(ft => {
        if (ft === 'General') return t.taskType === 'General';
        if (ft === 'Routine') return ['Routine', 'Routine Instance'].includes(t.taskType);
        return false;
      });
      if (!typeMatches) return false;
    }
    return true;
  });

  // FIX — Daily routine tasks 14+ days overdue and never completed get split into their
  // own collapsed section instead of burying the rest of the board. Still fully counted
  // and visible, just tucked away — nothing is hidden from accountability.
  // FIX — sort by due date ascending (soonest first) instead of raw sheet order, so
  // routine tasks (and everything else) appear predictably by urgency, not randomly.
  const sortByDueDate = (a, b) => new Date(a.targetDate) - new Date(b.targetDate);
  const staleTasks = filteredTasks.filter(t => t.isStale && t.status !== 'Completed').sort(sortByDueDate);

  // v13 — every task falls into exactly one bucket, so the board reads like a to-do list:
  // Delayed → Due today → Upcoming → On hold → Completed.
  const todayKeyLocal = (() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; })();
  const dueKeyOf = (t) => {
    if (!t.targetDate) return '';
    const d = new Date(t.targetDate);
    if (isNaN(d.getTime())) return String(t.targetDate).slice(0, 10);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };
  const bucketOf = (t) => {
    if (t.status === 'Completed') return 'done';
    if (t.status === 'On Hold') return 'hold';
    const due = dueKeyOf(t);
    if (!due) return 'upcoming';
    if (due < todayKeyLocal || t.status === 'Delayed') return 'delayed';
    if (due === todayKeyLocal) return 'today';
    return 'upcoming';
  };
  const reminderByTask = {};
  inbox.forEach(i => {
    if (i.type !== 'task_reminder') return;
    const k = String(i.taskId);
    if (!reminderByTask[k] || new Date(i.timestamp) > new Date(reminderByTask[k].timestamp)) reminderByTask[k] = i;
  });
  const boardTasks = filteredTasks.filter(t => !(t.isStale && t.status !== 'Completed'));
  const TASK_BUCKETS = [
    { key: 'delayed', label: 'Delayed', icon: '🔴', hint: 'Past the due date' },
    { key: 'today', label: 'Due today', icon: '🟠', hint: 'Finish these today' },
    { key: 'upcoming', label: 'Upcoming', icon: '🔵', hint: 'Coming up next' },
    { key: 'hold', label: 'On hold', icon: '⏸️', hint: 'Paused for now' },
    { key: 'done', label: 'Completed', icon: '✅', hint: 'Done in the last 24 hours' }
  ];
  const bucketed = { delayed: [], today: [], upcoming: [], hold: [], done: [] };
  boardTasks.forEach(t => bucketed[bucketOf(t)].push(t));
  Object.keys(bucketed).forEach(k => bucketed[k].sort(sortByDueDate));
  const remindedTasks = boardTasks.filter(t => reminderByTask[String(t.id)] && t.status !== 'Completed' && isTaskAssignedToMe(t));
  const openCount = bucketed.delayed.length + bucketed.today.length + bucketed.upcoming.length + bucketed.hold.length;

  const handleAddTask = async () => {
    if (selectedAssignees.length === 0 || !newTask.taskDetails) {
      alert('Please fill Task Details and select at least one assignee!');
      return;
    }
    if (newTask.taskType === 'General' && !newTask.targetDate) {
      alert('Please select target date!');
      return;
    }
    if (newTask.taskType === 'Routine' && !newTask.startDate) {
      alert('Please select start date!');
      return;
    }
    if (newTask.taskType === 'Routine' && (newTask.frequency === 'Weekly' || newTask.frequency === 'Monthly')) {
      if (newTask.reminderMode === 'date' && (newTask.reminderDaysBefore === '' || Number(newTask.reminderDaysBefore) < 0)) {
        alert('Please enter how many days before the due date this should remind you!');
        return;
      }
      if (newTask.reminderMode === 'band' && (newTask.bandStart === '' || newTask.bandEnd === '')) {
        alert('Please set both the band start and end!');
        return;
      }
    }
    try {
      setSaving(true);
      const taskData = {
        ...newTask,
        assignedTo: selectedAssignees.join(', '),
        channel: selectedChannels.length > 0 ? selectedChannels.join(', ') : 'Other',
        assignedBy: currentUserInfo.name,
        status: 'Not Started',
        targetDate: newTask.taskType === 'Routine' ? newTask.startDate : newTask.targetDate,
        // Reminder window fields only make sense for Weekly/Monthly Routine tasks —
        // stripped out otherwise so General tasks are never affected by this system.
        reminderMode: (newTask.taskType === 'Routine' && (newTask.frequency === 'Weekly' || newTask.frequency === 'Monthly')) ? newTask.reminderMode : '',
        reminderDaysBefore: (newTask.taskType === 'Routine' && newTask.reminderMode === 'date') ? newTask.reminderDaysBefore : '',
        bandStart: (newTask.taskType === 'Routine' && newTask.reminderMode === 'band') ? newTask.bandStart : '',
        bandEnd: (newTask.taskType === 'Routine' && newTask.reminderMode === 'band') ? newTask.bandEnd : ''
      };
      const tempTask = { id: Date.now(), ...taskData, delayDays: 0 };
      setTasks([...tasks, tempTask]);
      fetch(API_URL, {
        method: 'POST', mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({ action: 'addTask', task: taskData })
      });
      setNewTask({
        taskDetails: '', remarks: '', priority: 'Medium', targetDate: '',
        taskType: 'General', category: '', frequency: 'Daily', startDate: '', endDate: '',
        reminderMode: 'date', reminderDaysBefore: 3, bandStart: '', bandEnd: ''
      });
      setSelectedAssignees([]);
      setSelectedChannels([]);
      setShowNewTaskForm(false);
      setSaving(false);
      setTimeout(() => loadTasksBackground(), 2000);
    } catch (error) { setSaving(false); }
  };

  // FIX #6 — Task editing. Opens the same-styled modal pre-filled with the task's current data.
  const openEditTask = (task) => {
    if (task.status === 'Completed' && !isAdmin) {
      alert('🔒 This task is completed. Only Shivendra Singh or PC can edit it further.');
      return;
    }
    setEditingTask(task);
    setSelectedAssignees(String(task.assignedTo).split(',').map(a => a.trim()));
    setSelectedChannels(String(task.channel).split(',').map(c => c.trim()).filter(c => c));
    setNewTask({
      taskDetails: task.taskDetails,
      remarks: task.remarks || '',
      priority: task.priority,
      targetDate: task.targetDate ? String(task.targetDate).slice(0, 10) : '',
      taskType: task.taskType === 'Routine' || task.taskType === 'Routine Instance' ? 'Routine' : 'General',
      category: task.category || '',
      frequency: task.frequency || 'Daily',
      startDate: task.startDate || '',
      endDate: task.endDate || ''
    });
    setShowNewTaskForm(true);
  };

  const handleSaveEdit = async () => {
    if (selectedAssignees.length === 0 || !newTask.taskDetails) {
      alert('Please fill Task Details and select at least one assignee!');
      return;
    }
    try {
      setSaving(true);
      const updates = {
        assignedTo: selectedAssignees.join(', '),
        taskDetails: newTask.taskDetails,
        remarks: newTask.remarks,
        priority: newTask.priority,
        targetDate: newTask.targetDate,
        channel: selectedChannels.length > 0 ? selectedChannels.join(', ') : 'Other',
        category: newTask.category
      };
      setTasks(tasks.map(t => t.id === editingTask.id ? { ...t, ...updates } : t));
      fetch(API_URL, {
        method: 'POST', mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({ action: 'updateTask', taskId: editingTask.id, task: updates, userName: currentUserInfo.name })
      });
      closeTaskModal();
      setSaving(false);
      setTimeout(() => loadTasksBackground(), 2000);
    } catch (error) { setSaving(false); }
  };

  const closeTaskModal = () => {
    setShowNewTaskForm(false);
    setEditingTask(null);
    setNewTask({
      taskDetails: '', remarks: '', priority: 'Medium', targetDate: '',
      taskType: 'General', category: '', frequency: 'Daily', startDate: '', endDate: '',
      reminderMode: 'date', reminderDaysBefore: 3, bandStart: '', bandEnd: ''
    });
    setSelectedAssignees([]);
    setSelectedChannels([]);
  };

  const [confettiPieces, setConfettiPieces] = useState([]);

  // Short upbeat ascending chime — distinct from both the notification ding and the call
  // ring, so completing a task has its own small reward feel.
  const playSuccessChime = () => {
    try {
      const ctx = getRingCtx_();
      if (!ctx) return;
      [523.25, 659.25, 783.99].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        const start = idx * 0.09;
        gain.gain.setValueAtTime(0.001, ctx.currentTime + start);
        gain.gain.exponentialRampToValueAtTime(0.35, ctx.currentTime + start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + start);
        osc.stop(ctx.currentTime + start + 0.3);
      });
    } catch (e) {}
  };

  const CONFETTI_COLORS = ['#22c55e', '#064e3b', '#14b8a6', '#0ea5e9', '#f59e0b', '#dc2626'];
  const triggerCelebration = () => {
    const pieces = Array.from({ length: 28 }, (_, i) => ({
      id: Date.now() + '_' + i,
      left: Math.random() * 100,
      delay: Math.random() * 0.3,
      duration: 1.4 + Math.random() * 0.8,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      rotate: Math.random() * 360
    }));
    setConfettiPieces(pieces);
    playSuccessChime();
    setTimeout(() => setConfettiPieces([]), 2400);
  };

  const handleStatusChange = async (taskId, newStatus) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    if (task.status === 'Completed' && !isAdmin) {
      alert('Only Shivendra Singh or PC can change completed tasks!');
      return;
    }
    // FIX — small celebration on a genuine new completion (not when re-selecting
    // Completed again, and not for admins bulk-correcting old records).
    if (newStatus === 'Completed' && task.status !== 'Completed') {
      triggerCelebration();
    }
    setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    try {
      fetch(API_URL, {
        method: 'POST', mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({ action: 'updateStatus', taskId, status: newStatus, userName: currentUserInfo.name })
      });
    } catch (error) {}
  };

  // v13 — "Remind" (replaces the old WhatsApp copy button). Only whoever assigned the
  // task, or PC/Shivendra, can nudge; the assignee hears a distinct knock-knock sound,
  // gets a push + notification, and the card is marked "Reminded".
  const canRemindTask = (task) => {
    if (!currentUserInfo || task.status === 'Completed') return false;
    if (task.assignedBy !== currentUserInfo.name && !isAdmin) return false;
    const others = String(task.assignedTo).split(',').map(a => a.trim()).filter(a => a && a !== currentUserInfo.name && a !== 'AG' && a !== 'BG');
    return others.length > 0;
  };

  const handleRemindTask = async (task) => {
    if (remindBusyId) return;
    setRemindBusyId(task.id);
    try {
      const res = await fetch(API_URL + '?action=remindTask&taskId=' + encodeURIComponent(task.id) + '&from=' + encodeURIComponent(currentUserInfo.name));
      const data = await res.json();
      if (data.status === 'ok') pushNotif(`⏰ Reminder sent to ${(data.reminded || []).join(', ')}`);
      else pushNotif(`ℹ️ ${data.message || 'Could not send the reminder.'}`);
    } catch (e) {
      pushNotif('⚠️ Could not reach the server — check the internet and try again.');
    } finally {
      setRemindBusyId(null);
    }
  };

  // NEW — PC/Shivendra can delete ANY task from the dashboard, not just their own.
  const handleDeleteTask = (task) => {
    if (!isAdmin) return;
    if (!window.confirm(`Delete "${task.taskDetails}"? This cannot be undone.`)) return;
    setTasks(tasks.filter(t => t.id !== task.id));
    try {
      fetch(API_URL, {
        method: 'POST', mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({ action: 'deleteTask', taskId: task.id })
      });
    } catch (error) {}
    setTimeout(() => loadTasksBackground(), 1500);
  };

  const toggleAssignee = (name) => {
    if (selectedAssignees.includes(name)) {
      setSelectedAssignees(selectedAssignees.filter(a => a !== name));
    } else {
      setSelectedAssignees([...selectedAssignees, name]);
    }
  };

  const toggleChannel = (channel) => {
    if (selectedChannels.includes(channel)) {
      setSelectedChannels(selectedChannels.filter(c => c !== channel));
    } else {
      setSelectedChannels([...selectedChannels, channel]);
    }
  };

  // FIX — inbox items no longer all get marked read the moment you open the panel.
  // Clicking a specific notification marks only that one read; everything else stays
  // until you click it too. Also records the dismissal permanently (dismissedInboxIds)
  // so a background poll racing ahead of the server write can never make it pop back.
  //
  // NEW behavior: clicking a task-assignment notification (new_task/new_routine) now
  // NAVIGATES to that task (closes the inbox, switches to a view that shows it, and
  // highlights the card) instead of just disappearing. It stays in the inbox list
  // (marked read so it stops looking "new") until the task itself is marked Completed
  // — a separate effect below watches for that and clears it automatically. A
  // "task_completed" notification (sent to the original assigner) has no further state
  // to wait on, so it still dismisses immediately on click, same as before.
  // FIX — "clicking an assigned-task notification shows No tasks". Three separate causes:
  //   1. Filters were reset to ['All'], but the filters became multi-select lists where an
  //      EMPTY list means "show everything" — ['All'] meant "status must literally equal
  //      'All'", which matches nothing, so the board went blank. Now reset to [].
  //   2. Non-admins could be on the wrong tab (e.g. "Assigned by Me" for a task assigned
  //      TO them). It now switches to whichever tab actually contains that task, and opens
  //      the collapsed "Older Routine Tasks" section if the task lives in there.
  //   3. The notification can arrive a few seconds before the task list refreshes, so the
  //      card didn't exist yet. It now refreshes the list and waits for the card to appear.
  const tasksRef = useRef([]);
  useEffect(() => { tasksRef.current = tasks; }, [tasks]);
  const [pendingNavTaskId, setPendingNavTaskId] = useState(null);
  const pendingNavIdRef = useRef(null);
  useEffect(() => { pendingNavIdRef.current = pendingNavTaskId; }, [pendingNavTaskId]);
  const highlightTimeoutRef = useRef(null);

  const revealTaskCard = (task) => {
    if (isAdmin) {
      setTaskViewMode('all');
      setManagerView('all');
    } else {
      const assignedToMe = isTaskAssignedToMe(task);
      const assignedByMe = task.assignedBy === currentUserInfo?.name;
      setTaskViewMode(assignedToMe ? 'assigned' : (assignedByMe ? 'by_me' : 'assigned'));
    }
    if (task.isStale) setShowOlderRoutine(true);
    setTaskBucket('all');
    setHighlightTaskId(task.id);
    let tries = 0;
    const tryScroll = () => {
      const el = document.getElementById('task-card-' + task.id);
      if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); return; }
      tries += 1;
      if (tries < 20) setTimeout(tryScroll, 150);
    };
    setTimeout(tryScroll, 120);
    if (highlightTimeoutRef.current) clearTimeout(highlightTimeoutRef.current);
    highlightTimeoutRef.current = setTimeout(() => setHighlightTaskId(null), 5000);
  };

  const navigateToTask = (taskId) => {
    if (taskId === undefined || taskId === null || taskId === '') return;
    // Close every other overlay/modal too, so a notification click always lands you on
    // the task list no matter what was open when it fired.
    setShowInbox(false);
    setShowChat(false);
    setShowArchive(false);
    setShowContentCalendar(false);
    setShowTeamManager(false);
    setShowNoticeBoard(false);
    setShowHolidayCalendar(false);
    setShowMyRoutines(false);
    setFilterStatus([]);
    setFilterChannel([]);
    setFilterCategory([]);
    setFilterTaskType([]);
    const task = tasksRef.current.find(t => String(t.id) === String(taskId));
    if (task) {
      setPendingNavTaskId(null);
      revealTaskCard(task);
    } else {
      setPendingNavTaskId(String(taskId));
      loadTasksBackground();
      setTimeout(loadTasksBackground, 2500);
      setTimeout(loadTasksBackground, 6000);
      const waitingFor = String(taskId);
      setTimeout(() => {
        if (pendingNavIdRef.current === waitingFor) {
          setPendingNavTaskId(null);
          pushNotif('ℹ️ That task is no longer on the board (it was completed and archived).');
        }
      }, 12500);
    }
  };

  // Finishes a navigation that was waiting for the task list to catch up.
  useEffect(() => {
    if (!pendingNavTaskId) return;
    const task = tasks.find(t => String(t.id) === pendingNavTaskId);
    if (task) {
      setPendingNavTaskId(null);
      revealTaskCard(task);
    }
  }, [tasks, pendingNavTaskId]);

  // ============================================================
  // Messages from the service worker (see public/sw.js):
  //   'wtc-push'               — a push just arrived while this app is open
  //   'wtc-notification-click' — the user tapped a system notification
  // A call push rings immediately from its own data (no server round-trip). Any other
  // push refreshes the inbox/tasks right away instead of waiting for the 15s cycle.
  // The handler lives in a ref so the single listener always runs the latest code.
  // ============================================================
  const handlePushMessageRef = useRef(null);
  handlePushMessageRef.current = (msg) => {
    if (!msg || !msg.type) return;
    if (msg.type === 'wtc-call-answered') {
      if (incomingCallRef.current && incomingCallRef.current.callId === msg.callId) endRingingUi_(msg.callId);
      seenCallIds.current.add(msg.callId);
      return;
    }
    const push = msg.push || {};
    const extra = push.data || {};
    if (extra.kind === 'call' && extra.callId) {
      ringIncomingCall({ callId: extra.callId, from: extra.from, type: extra.type, timestamp: extra.timestamp });
      return;
    }
    const isMeeting = extra.type === 'new_meeting' || String(extra.taskId || '').startsWith('meeting_');
    if (msg.type === 'wtc-push') {
      loadInboxBackground();
      loadTasksBackground();
      if (isMeeting) loadMeetingsBackground();
      return;
    }
    if (msg.type === 'wtc-notification-click') {
      if (isMeeting) { openMeetings(); return; }
      if (extra.taskId) navigateToTask(extra.taskId);
    }
  };
  useEffect(() => {
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return;
    const listener = (event) => {
      try { if (handlePushMessageRef.current) handlePushMessageRef.current(event.data); } catch (e) {}
    };
    navigator.serviceWorker.addEventListener('message', listener);
    return () => navigator.serviceWorker.removeEventListener('message', listener);
  }, []);

  // A tapped notification can also launch the app fresh as /?task=ID — open that task
  // once the task list has loaded, then tidy the address bar so a refresh won't re-jump.
  const startupTaskHandledRef = useRef(false);
  useEffect(() => {
    if (startupTaskHandledRef.current || !currentUser) return;
    let taskParam = null;
    try { taskParam = new URLSearchParams(window.location.search).get('task'); } catch (e) {}
    if (!taskParam) { startupTaskHandledRef.current = true; return; }
    if (tasks.length === 0) return; // wait for the first task load
    startupTaskHandledRef.current = true;
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete('task');
      window.history.replaceState({}, '', url.toString());
    } catch (e) {}
    if (taskParam.startsWith('meeting_')) openMeetings();
    else navigateToTask(taskParam);
  }, [currentUser, tasks]);

  // v13 — every notification disappears the moment it is clicked, and takes you to
  // what it is about (the task, the meeting list, the attendance panel…).
  const dismissInboxItem = (item) => {
    dismissedInboxIds.current.add(item.id);
    fetch(API_URL, {
      method: 'POST', mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ action: 'markInboxRead', inboxId: item.id })
    }).catch(() => {});
    setInbox(prev => prev.filter(i => i.id !== item.id));
  };

  const handleInboxItemClick = (item) => {
    dismissInboxItem(item);
    setShowInbox(false);
    if (item.type === 'new_meeting' || String(item.taskId || '').startsWith('meeting_')) { openMeetings(); return; }
    if (item.type === 'correction' || item.type === 'attendance') { openDiscipline(item.type === 'correction' ? 'team' : 'mine'); return; }
    if (item.type === 'missed_call') return;
    if (item.type === 'new_target' || item.type === 'target_achieved') { setShowTargets(true); setTargetView(item.type === 'new_target' ? 'mine' : 'assigned'); loadTargets(); return; }
    if (item.taskId) navigateToTask(item.taskId);
  };

  const clearAllInbox = () => {
    if (!currentUserInfo || inbox.length === 0) return;
    inbox.forEach(i => dismissedInboxIds.current.add(i.id));
    setInbox([]);
    fetch(API_URL, {
      method: 'POST', mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ action: 'markAllInboxRead', userName: currentUserInfo.name })
    }).catch(() => {});
  };

  // NEW — auto-clears a task-assignment notification the moment its task is Completed
  // (not before, and not just because it was clicked/viewed).
  useEffect(() => {
    const linkedUnresolved = inbox.filter(i => (i.type === 'new_task' || i.type === 'new_routine' || i.type === 'task_reminder'));
    if (linkedUnresolved.length === 0) return;
    linkedUnresolved.forEach(item => {
      const linkedTask = tasks.find(t => String(t.id) === String(item.taskId));
      if (linkedTask && linkedTask.status === 'Completed') {
        dismissedInboxIds.current.add(item.id);
        fetch(API_URL, {
          method: 'POST', mode: 'no-cors',
          headers: { 'Content-Type': 'text/plain' },
          body: JSON.stringify({ action: 'markInboxRead', inboxId: item.id })
        });
        setInbox(prev => prev.filter(i => i.id !== item.id));
      }
    });
  }, [tasks]);

  const openInbox = () => {
    setShowInbox(!showInbox);
  };

  const openChat = () => {
    setShowChat(!showChat);
    if (showChat) setChatWith(null);
  };

  const openChatWith = (person) => {
    setChatWith(person);
    fetch(API_URL, {
      method: 'POST', mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ action: 'markChatRead', from: person, to: currentUserInfo.name })
    });
    setChats(chats.map(c => (c.from === person && c.to === currentUserInfo.name) ? { ...c, read: 'Yes' } : c));
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !chatWith) return;
    const message = newMessage.trim();
    const tempChat = {
      id: Date.now(),
      from: currentUserInfo.name,
      to: chatWith,
      message: message,
      timestamp: new Date().toISOString(),
      read: 'No',
      type: 'message'
    };
    seenChatIds.current.add(tempChat.id);
    setChats([...chats, tempChat]);
    setNewMessage('');
    fetch(API_URL, {
      method: 'POST', mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({
        action: 'sendChat',
        from: currentUserInfo.name,
        to: chatWith,
        message: message
      })
    });
    setTimeout(() => loadChatsBackground(), 1500);
  };

  const getConversationList = () => {
    const conversations = {};
    chats.forEach(chat => {
      const otherPerson = chat.from === currentUserInfo?.name ? chat.to : chat.from;
      if (!conversations[otherPerson]) {
        conversations[otherPerson] = { lastMessage: chat, unreadCount: 0 };
      }
      if (new Date(chat.timestamp) > new Date(conversations[otherPerson].lastMessage.timestamp)) {
        conversations[otherPerson].lastMessage = chat;
      }
      if (chat.to === currentUserInfo?.name && chat.read === 'No') {
        conversations[otherPerson].unreadCount++;
      }
    });
    return Object.entries(conversations).map(([person, data]) => ({ person, ...data }))
      .sort((a, b) => new Date(b.lastMessage.timestamp) - new Date(a.lastMessage.timestamp));
  };

  const getConversationMessages = () => {
    if (!chatWith) return [];
    return chats.filter(c => 
      (c.from === currentUserInfo?.name && c.to === chatWith) ||
      (c.from === chatWith && c.to === currentUserInfo?.name)
    ).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  };

  const getViewTitle = () => {
    if (isAdmin && taskViewMode === 'all' && managerView === 'all') return 'All Team Tasks';
    if (isAdmin && taskViewMode === 'all' && managerView !== 'all') {
      if (managerView === 'AG' || managerView === 'BG') return `${managerView}'s Tasks`;
      const member = team.find(t => t.id === managerView);
      return `${member?.name}'s Tasks`;
    }
    if (taskViewMode === 'assigned') return 'Tasks Assigned to Me';
    if (taskViewMode === 'by_me') return 'Tasks Assigned by Me';
    if (taskViewMode === 'own') return 'My Own Tasks';
    return '';
  };

  // ---- FIX #13: Team Management panel actions (PC & Shivendra only) ----
  const [tmForm, setTmForm] = useState({ name: '', displayName: '', role: '', avatar: '', quoteType: 'social_media' });
  const [tmEditingId, setTmEditingId] = useState(null);

  const [tmSaving, setTmSaving] = useState(false);

  const handleTeamAdd = async () => {
    if (!tmForm.name.trim()) { alert('Name is required'); return; }
    if (tmSaving) return;
    setTmSaving(true);
    const member = {
      name: tmForm.name.trim(),
      displayName: tmForm.displayName.trim() || tmForm.name.trim(),
      role: tmForm.role.trim(),
      avatar: (tmForm.avatar.trim() || tmForm.name.trim().substring(0, 2)).toUpperCase(),
      quoteType: tmForm.quoteType
    };
    // FIX: this previously used the default 'cors' mode, which Apps Script POST
    // endpoints don't support (no CORS headers on POST responses) — the browser
    // blocked reading the response and threw, which could leave the UI in a
    // confusing state and invite repeated clicks / duplicate rows. Matches the
    // no-cors + delayed-reload pattern used by every other write action in this app.
    fetch(API_URL, {
      method: 'POST', mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ action: 'addTeamMember', member })
    });
    setTimeout(() => {
      setTmForm({ name: '', displayName: '', role: '', avatar: '', quoteType: 'social_media' });
      loadTeam();
      setTmSaving(false);
    }, 1500);
  };

  const handleTeamEdit = (member) => {
    setTmEditingId(member.id);
    setTmForm({ name: member.name, displayName: member.displayName, role: member.role, avatar: member.avatar, quoteType: member.quoteType });
  };

  const handleTeamSaveEdit = async () => {
    if (tmSaving) return;
    setTmSaving(true);
    fetch(API_URL, {
      method: 'POST', mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({
        action: 'updateTeamMember',
        id: tmEditingId,
        updates: { displayName: tmForm.displayName, role: tmForm.role, avatar: tmForm.avatar, quoteType: tmForm.quoteType }
      })
    });
    setTimeout(() => {
      setTmEditingId(null);
      setTmForm({ name: '', displayName: '', role: '', avatar: '', quoteType: 'social_media' });
      loadTeam();
      setTmSaving(false);
    }, 1500);
  };

  const handleTeamToggleActive = async (member) => {
    const nextActive = !(member.active !== false);
    if (!confirm(`${nextActive ? 'Reactivate' : 'Deactivate'} ${member.displayName}?`)) return;
    try {
      fetch(API_URL, {
        method: 'POST', mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({ action: 'setTeamActive', id: member.id, active: nextActive })
      });
      setTimeout(() => loadTeam(), 1000);
    } catch (e) {}
  };

  // ============================================================
  // NOTICE BOARD + HOLIDAY CALENDAR — everyone reads; only PC/Shivendra can post/delete
  // notices (enforced both in the UI below and, more importantly, nowhere else needed
  // since posting is just a data write anyone with the link could technically call, but
  // the UI to do so is gated to canManageTeam same as Team Management).
  // ============================================================
  const loadNotices = async () => {
    try {
      const response = await fetch(API_URL + '?action=getNotices');
      const data = await response.json();
      if (data.status === 'ok') setNotices(data.notices);
    } catch (e) {}
  };

  const loadHolidays = async () => {
    try {
      const response = await fetch(API_URL + '?action=getHolidays');
      const data = await response.json();
      if (data.status === 'ok') setHolidays(data.holidays);
    } catch (e) {}
  };

  const openNoticeBoard = () => {
    setShowNoticeBoard(true);
    loadNotices();
  };

  const openHolidayCalendar = () => {
    setShowHolidayCalendar(true);
    loadHolidays();
  };

  // FIX — HR access request: holidays now live in a real sheet, and PC/Shivendra/Pari
  // (canManageTeam) can add or remove one straight from this modal instead of asking for
  // a code change. Optimistic local update, same pattern as everything else here.
  const handleAddHoliday = () => {
    if (!newHolidayDate || !newHolidayName.trim()) { alert('Pick a date and enter a name.'); return; }
    if (holidaySaving) return;
    setHolidaySaving(true);
    const name = newHolidayName.trim();
    const date = newHolidayDate;
    setHolidays(prev => [...prev, { id: 'tmp_' + Date.now(), date, name }].sort((a, b) => a.date.localeCompare(b.date)));
    fetch(API_URL, {
      method: 'POST', mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ action: 'addHoliday', date, name })
    });
    setNewHolidayDate('');
    setNewHolidayName('');
    setTimeout(() => { loadHolidays(); setHolidaySaving(false); }, 1000);
  };

  const handleDeleteHoliday = (holiday) => {
    if (!confirm(`Remove "${holiday.name}"?`)) return;
    setHolidays(prev => prev.filter(h => h.id !== holiday.id));
    fetch(API_URL, {
      method: 'POST', mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ action: 'deleteHoliday', id: holiday.id })
    });
  };

  // Real-time while open — new notices from PC/Shivendra show up without a manual refresh.
  useEffect(() => {
    if (showNoticeBoard) {
      const interval = setInterval(loadNotices, 20000);
      return () => clearInterval(interval);
    }
  }, [showNoticeBoard]);

  const handlePostNotice = () => {
    if (!newNoticeTitle.trim() || !newNoticeMessage.trim()) { alert('Please fill in both title and message!'); return; }
    if (noticeSaving) return;
    setNoticeSaving(true);
    fetch(API_URL, {
      method: 'POST', mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({
        action: 'addNotice',
        title: newNoticeTitle.trim(),
        message: newNoticeMessage.trim(),
        postedBy: currentUserInfo.name,
        pinned: newNoticePinned
      })
    });
    setTimeout(() => {
      setNewNoticeTitle(''); setNewNoticeMessage(''); setNewNoticePinned(false);
      loadNotices();
      setNoticeSaving(false);
    }, 1200);
  };

  const handleDeleteNotice = (noticeId) => {
    if (!confirm('Delete this notice?')) return;
    fetch(API_URL, {
      method: 'POST', mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ action: 'deleteNotice', noticeId })
    });
    setNotices(prev => prev.filter(n => n.id !== noticeId));
  };

  // ============================================================
  // CONTENT CALENDAR — everyone reads/writes; entries auto-create a linked Task.
  // FIX — "takes 10+ seconds to reflect / some people see nothing". Causes and fixes:
  //   • Empty for some people: a single failed request left the list empty with no
  //     retry. Now: the last copy is saved on each device and shown instantly, the data
  //     is preloaded right after login (before anyone even opens the calendar), and a
  //     failed load retries automatically.
  //   • Slow to reflect: the backend now answers from memory (see Code.gs), the open
  //     calendar refreshes every 4s, and it refreshes the instant the app comes back
  //     to the foreground.
  //   • Entries "disappearing then coming back": a refresh that landed before the server
  //     had finished saving would wipe the just-added entry off the screen. Your own
  //     unconfirmed adds/edits/deletes are now kept on screen until the server confirms
  //     them (pendingContentRef), so nothing ever flickers.
  //   • Out-of-order replies: an older, slower reply can no longer overwrite a newer one.
  // ============================================================
  const pendingContentRef = useRef({ adds: [], edits: {}, deletes: {} });
  const contentReqSeqRef = useRef(0);
  const contentInFlightRef = useRef(false);
  const contentLastJsonRef = useRef('');
  const CONTENT_MATCH_FIELDS = ['channelGroup', 'channels', 'contentType', 'title', 'date', 'time', 'assignedTo',
    'editingStatus', 'videoStatus', 'priority', 'finalLink', 'thumbnailLink', 'designLink', 'rawLink', 'draftLink',
    'liveLink', 'description', 'notes'];

  const mergeWithPendingContent = (serverEntries) => {
    const pending = pendingContentRef.current;
    const now = Date.now();
    let merged = serverEntries;

    // Deletes: hide until the server stops returning the entry (max 60s).
    Object.keys(pending.deletes).forEach(id => {
      const stillThere = serverEntries.some(e => String(e.id) === id);
      if (!stillThere || now - pending.deletes[id] > 60000) delete pending.deletes[id];
    });
    if (Object.keys(pending.deletes).length > 0) {
      merged = merged.filter(e => !pending.deletes[String(e.id)]);
    }

    // Edits: keep showing your edit until the server has it (max 60s).
    Object.keys(pending.edits).forEach(id => {
      const edit = pending.edits[id];
      const serverEntry = serverEntries.find(e => String(e.id) === id);
      const confirmed = serverEntry && CONTENT_MATCH_FIELDS.every(f =>
        edit.payload[f] === undefined || String(serverEntry[f] ?? '') === String(edit.payload[f] ?? ''));
      if (!serverEntry || confirmed || now - edit.ts > 60000) delete pending.edits[id];
    });
    if (Object.keys(pending.edits).length > 0) {
      merged = merged.map(e => pending.edits[String(e.id)] ? { ...e, ...pending.edits[String(e.id)].payload } : e);
    }

    // Adds: keep the local copy until a matching server entry exists (max 90s).
    const claimed = new Set();
    pending.adds = pending.adds.filter(add => {
      const match = serverEntries.find(e => !claimed.has(String(e.id)) &&
        e.title === add.entry.title && String(e.date).slice(0, 10) === add.entry.date &&
        e.channelGroup === add.entry.channelGroup && e.createdBy === add.entry.createdBy);
      if (match) { claimed.add(String(match.id)); return false; }
      return now - add.ts < 90000;
    });
    if (pending.adds.length > 0) merged = [...merged, ...pending.adds.map(a => a.entry)];
    return merged;
  };

  const loadContentCalendar = async (attempt = 0) => {
    if (contentInFlightRef.current && attempt === 0) return;
    contentInFlightRef.current = true;
    const seq = ++contentReqSeqRef.current;
    if (attempt === 0) setContentSyncState(prev => (prev === 'live' ? 'live' : 'syncing'));
    let failed = false;
    const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const abortTimer = controller ? setTimeout(() => controller.abort(), 15000) : null;
    try {
      const response = await fetch(API_URL + '?action=getContentCalendar', controller ? { signal: controller.signal } : undefined);
      const data = await response.json();
      if (data.status !== 'ok' || !Array.isArray(data.entries)) throw new Error(data.message || 'bad response');
      if (seq === contentReqSeqRef.current) { // ignore replies overtaken by a newer request
        const merged = mergeWithPendingContent(data.entries);
        const json = JSON.stringify(merged);
        if (json !== contentLastJsonRef.current) {
          contentLastJsonRef.current = json;
          setContentEntries(merged);
        }
        try { localStorage.setItem('wtc_cache_content_entries', JSON.stringify(data.entries)); } catch (e) {}
        setContentSyncState('live');
      }
    } catch (e) {
      failed = true;
    } finally {
      if (abortTimer) clearTimeout(abortTimer);
      contentInFlightRef.current = false;
    }
    if (failed) {
      if (attempt < 2) setTimeout(() => loadContentCalendar(attempt + 1), attempt === 0 ? 700 : 1800);
      else setContentSyncState('offline');
    }
  };

  const loadContentChannels = async () => {
    try {
      const response = await fetch(API_URL + '?action=getContentChannels');
      const data = await response.json();
      if (data.status === 'ok' && data.groupOrder && data.groupOrder.length > 0) {
        const ordered = {};
        data.groupOrder.forEach(g => { ordered[g] = data.groups[g] || []; });
        setPlatformOverrides(data.platforms || {});
        setChannelPlatforms(data.platforms || {});
        try { localStorage.setItem('wtc_cache_channel_platforms', JSON.stringify(data.platforms || {})); } catch (e) {}
        setContentChannelGroups(ordered);
      }
    } catch (e) {}
  };

  const openContentCalendar = () => {
    if (!canSeeContentCalendar) return;
    setShowContentCalendar(true);
    loadContentCalendar();
    loadContentChannels();
  };

  // Preload right after login, so the data is already there when the calendar opens.
  useEffect(() => {
    if (currentUser && canSeeContentCalendar) loadContentCalendar();
  }, [currentUser, canSeeContentCalendar]);

  // Refresh rhythm: every 4s while the calendar is open, every 60s in the background
  // (so the saved copy stays fresh), and only while the app is actually on screen.
  useEffect(() => {
    if (!currentUser || !canSeeContentCalendar) return;
    const everyMs = showContentCalendar ? 4000 : 60000;
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') loadContentCalendar();
    }, everyMs);
    const onVisible = () => {
      if (document.visibilityState === 'visible' && showContentCalendar) loadContentCalendar();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [currentUser, showContentCalendar, canSeeContentCalendar]);

  // v14 — edit a channel: rename it, move it to another group, or set its platform.
  const [editingChannel, setEditingChannel] = useState(null); // { group, name, newName, newGroup, platform }
  const saveChannelEdit = () => {
    const ec = editingChannel;
    if (!ec) return;
    const newName = ec.newName.trim(), newGroup = ec.newGroup.trim();
    if (!newName || !newGroup) { alert('Channel and group names are required.'); return; }
    setContentChannelGroups(prev => {
      const next = { ...prev };
      next[ec.group] = (next[ec.group] || []).filter(c => c !== ec.name);
      if (next[ec.group].length === 0 && ec.group !== newGroup) delete next[ec.group];
      next[newGroup] = [...(next[newGroup] || []), newName];
      return next;
    });
    const overrides = { ...channelPlatforms };
    delete overrides[ec.name];
    if (ec.platform) overrides[newName] = ec.platform;
    setPlatformOverrides(overrides);
    setChannelPlatforms(overrides);
    if (newName !== ec.name || newGroup !== ec.group) {
      setContentEntries(prev => prev.map(e => (e.channelGroup === ec.group && e.channels === ec.name) ? { ...e, channelGroup: newGroup, channels: newName } : e));
    }
    fetch(API_URL, {
      method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ action: 'updateContentChannel', groupName: ec.group, oldName: ec.name, newName, newGroup, platform: ec.platform, userId: currentUser })
    }).catch(() => {});
    setEditingChannel(null);
    setTimeout(() => { loadContentChannels(); loadContentCalendar(); }, 2500);
  };

  const handleAddChannel = () => {
    const group = (newChannelGroup || '').trim();
    const channel = (newChannelName || '').trim();
    if (!group || !channel) { alert('Enter both a group name and a channel name.'); return; }
    if (newChannelPlatform) {
      const overrides = { ...channelPlatforms, [channel]: newChannelPlatform };
      setPlatformOverrides(overrides); setChannelPlatforms(overrides);
    }
    setContentChannelGroups(prev => {
      const next = { ...prev };
      next[group] = [...(next[group] || []), channel];
      return next;
    });
    fetch(API_URL, {
      method: 'POST', mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ action: 'addContentChannel', groupName: group, channelName: channel, platform: newChannelPlatform })
    });
    setNewChannelName('');
    setNewChannelPlatform('');
  };

  const handleDeleteChannel = (group, channel) => {
    if (!confirm(`Remove "${channel}" from ${group}?`)) return;
    setContentChannelGroups(prev => {
      const next = { ...prev };
      next[group] = (next[group] || []).filter(c => c !== channel);
      if (next[group].length === 0) delete next[group];
      return next;
    });
    fetch(API_URL, {
      method: 'POST', mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ action: 'deleteContentChannel', groupName: group, channelName: channel })
    });
    if (contentGroupTab === group) {
      const remaining = Object.keys(contentChannelGroups).filter(g => g !== group);
      if (remaining.length > 0) setContentGroupTab(remaining[0]);
    }
  };

  const changeContentCalMonth = (delta) => {
    let m = contentCalMonth + delta, y = contentCalYear;
    if (m > 11) { m = 0; y++; }
    if (m < 0) { m = 11; y--; }
    setContentCalMonth(m);
    setContentCalYear(y);
  };

  const openNewContentEntry = (dateStr) => {
    const groupChannels = contentChannelGroups[contentGroupTab] || [];
    setContentForm({
      channels: groupChannels[0] || '', contentType: 'Long Format Video',
      title: '', date: dateStr || '', time: '', assignedTo: [], editingStatus: 'Not Started', videoStatus: 'Not Started', priority: 'Medium',
      finalLink: '', thumbnailLink: '', designLink: '', rawLink: '', draftLink: '', liveLink: '', description: '', notes: ''
    });
    setEditingContentEntry({});
  };

  const openEditContentEntry = (entry) => {
    setContentForm({
      channels: entry.channels, contentType: entry.contentType, title: entry.title,
      date: entry.date ? String(entry.date).slice(0, 10) : '', time: entry.time || '',
      assignedTo: entry.assignedTo ? String(entry.assignedTo).split(',').map(a => a.trim()) : [],
      editingStatus: entry.editingStatus || 'Not Started', videoStatus: entry.videoStatus || 'Not Started', priority: entry.priority || 'Medium',
      finalLink: entry.finalLink || '', thumbnailLink: entry.thumbnailLink || '', designLink: entry.designLink || '', liveLink: entry.liveLink || '',
      rawLink: entry.rawLink || '', draftLink: entry.draftLink || '',
      description: entry.description || '', notes: entry.notes || ''
    });
    setEditingContentEntry(entry);
  };

  const toggleContentAssignee = (name) => {
    setContentForm(prev => ({
      ...prev,
      assignedTo: prev.assignedTo.includes(name) ? prev.assignedTo.filter(a => a !== name) : [...prev.assignedTo, name]
    }));
  };

  const handleSaveContentEntry = () => {
    if (!contentForm.title.trim() || !contentForm.date || contentForm.assignedTo.length === 0) {
      alert('Please fill in Title, Date, and at least one Assignee!');
      return;
    }
    if (contentSaving) return;
    setContentSaving(true);

    const isNew = !editingContentEntry.id;
    if (!isNew && String(editingContentEntry.id).startsWith('tmp_')) {
      setContentSaving(false);
      alert('This entry is still being saved — please try again in a couple of seconds.');
      return;
    }
    const payload = {
      channelGroup: contentGroupTab,
      channels: contentForm.channels,
      contentType: contentForm.contentType,
      title: contentForm.title.trim(),
      date: contentForm.date,
      time: contentForm.time,
      assignedTo: contentForm.assignedTo.join(', '),
      editingStatus: contentForm.editingStatus,
      videoStatus: contentForm.videoStatus,
      priority: contentForm.priority,
      finalLink: contentForm.finalLink.trim(),
      thumbnailLink: contentForm.thumbnailLink.trim(),
      designLink: contentForm.designLink.trim(),
      liveLink: (contentForm.liveLink || '').trim(),
      rawLink: contentForm.rawLink.trim(),
      draftLink: contentForm.draftLink.trim(),
      description: contentForm.description.trim(),
      notes: contentForm.notes.trim(),
      createdBy: currentUserInfo.name
    };

    // FIX — instant "reflect on edit": update contentEntries in local state right away
    // instead of waiting on the next poll tick. A new entry gets a temporary local ID so
    // it renders on the grid immediately; the background reload a moment later swaps it
    // for the real server ID transparently (same date/title, so nothing visibly jumps).
    if (isNew) {
      const tempId = 'tmp_' + Date.now();
      const localEntry = { ...payload, id: tempId, createdDate: new Date().toISOString().slice(0, 10) };
      pendingContentRef.current.adds.push({ entry: localEntry, ts: Date.now() });
      contentLastJsonRef.current = '';
      setContentEntries(prev => [...prev, localEntry]);
      fetch(API_URL, {
        method: 'POST', mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({ action: 'addContentEntry', entry: payload })
      });
    } else {
      pendingContentRef.current.edits[String(editingContentEntry.id)] = { payload, ts: Date.now() };
      contentLastJsonRef.current = '';
      setContentEntries(prev => prev.map(e => e.id === editingContentEntry.id ? { ...e, ...payload } : e));
      fetch(API_URL, {
        method: 'POST', mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({ action: 'updateContentEntry', id: editingContentEntry.id, updates: payload, userName: currentUserInfo.name })
      });
      // Marked Published → its task card completes right away (the server does the same).
      if (payload.videoStatus === 'Published' && editingContentEntry.videoStatus !== 'Published' && editingContentEntry.linkedTaskId) {
        const linkedId = String(editingContentEntry.linkedTaskId);
        setTasks(prev => prev.map(t => String(t.id) === linkedId ? { ...t, status: 'Completed', completionDate: new Date().toISOString() } : t));
        pushNotif('✅ Published — the linked task was marked Completed.');
      }
    }
    setEditingContentEntry(null);
    setContentSaving(false);
    // Follow-up refreshes to pick up the server's confirmed copy (and the real ID) fast.
    setTimeout(() => loadContentCalendar(), 1500);
    setTimeout(() => loadContentCalendar(), 4000);
    setTimeout(() => {
      loadContentCalendar();
      loadTasksBackground(); // linked task created/updated
    }, 8000);
  };

  // v14 — reuse an entry for another channel (same title, date, people, links), opened as
  // a new entry so the channel can be changed before saving.
  const duplicateContentEntry = () => {
    const groupChannels = contentChannelGroups[contentGroupTab] || [];
    const other = groupChannels.find(c => c !== contentForm.channels) || contentForm.channels;
    setContentForm(prev => ({ ...prev, channels: other, videoStatus: 'Not Started', liveLink: '' }));
    setEditingContentEntry({});
    pushNotif('⧉ Copied — pick the channel and press Create Entry.');
  };

  const handleDeleteContentEntry = () => {
    if (!editingContentEntry?.id) return;
    if (String(editingContentEntry.id).startsWith('tmp_')) {
      alert('This entry is still being saved — please try again in a couple of seconds.');
      return;
    }
    if (!confirm('Delete this content entry? (The linked task, if any, will stay on the task board.)')) return;
    pendingContentRef.current.deletes[String(editingContentEntry.id)] = Date.now();
    contentLastJsonRef.current = '';
    delete pendingContentRef.current.edits[String(editingContentEntry.id)];
    setTimeout(() => loadContentCalendar(), 2000);
    fetch(API_URL, {
      method: 'POST', mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ action: 'deleteContentEntry', id: editingContentEntry.id })
    });
    setContentEntries(prev => prev.filter(e => e.id !== editingContentEntry.id));
    setEditingContentEntry(null);
  };

  // FIX — hoisted out of the modal's render tree (hooks can't live inside a conditional
  // block) so the month grid only recomputes when something it depends on actually
  // changes, instead of on every render — this is the real fix for the "calendar feels
  // slow" complaint, not just a faster poll.
  const contentStageOf = (entry) => {
    if (entry.videoStatus === 'Published') return 'pub';
    if (entry.videoStatus === 'Scheduled in YT Studio') return 'sched';
    if (entry.editingStatus && entry.editingStatus !== 'Not Started') return 'edit';
    return 'plan';
  };

  const contentCalGridData = useMemo(() => {
    const q = ccSearch.trim().toLowerCase();
    const groupAll = contentEntries.filter(e => e.channelGroup === contentGroupTab);
    const entriesThisGroup = groupAll.filter(e =>
      (ccPlatformFilter === 'all' || platformOf(e.channels) === ccPlatformFilter) &&
      (!q || [e.title, e.channels, e.assignedTo, e.notes, e.description].some(v => String(v || '').toLowerCase().includes(q))));
    const groupPlatforms = Array.from(new Set([...(contentChannelGroups[contentGroupTab] || []), ...groupAll.map(e => e.channels)].map(platformOf)));
    const firstOfMonth = new Date(contentCalYear, contentCalMonth, 1);
    const startOffset = firstOfMonth.getDay(); // 0=Sun
    const daysInMon = new Date(contentCalYear, contentCalMonth + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < startOffset; i++) cells.push(null);
    for (let d = 1; d <= daysInMon; d++) cells.push(d);
    while (cells.length % 7 !== 0) cells.push(null);
    const holidaySet = {};
    holidays.forEach(h => { holidaySet[h.date] = h.name; });
    return { entriesThisGroup, cells, holidaySet, groupPlatforms };
  }, [contentGroupTab, contentEntries, contentCalYear, contentCalMonth, holidays, ccPlatformFilter, ccSearch, channelPlatforms, contentChannelGroups]);

  // ============================================================
  // MY RECURRING TASKS — everyone (including Shivendra/PC) can see and manage the
  // recurring tasks that belong to them: ones assigned TO them or BY them. Admins can
  // also switch to "Whole team". For each one: how often it repeats, when it started,
  // when it ends (its duration), days left, how many copies are open/done — and
  // Pause / Resume / Change end date / Remove.
  // How it works underneath: a recurring task's End Date controls whether new copies
  // keep being created (empty = forever, a past date = paused). See updateRoutine in
  // Code.gs, which also re-checks permission on the server side.
  // ============================================================
  const localDateKey_ = (d) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

  // FIX — the list now comes from the server's getRoutines, which reads EVERY row
  // including archived ones. Before, it was built from the task board's data, which leaves
  // out archived rows — and a recurring task gets archived 24h after anyone marks its main
  // card "Completed", even though it keeps creating copies. So live recurring tasks were
  // missing from the list. Falls back to the board's data only if the server can't answer.
  const [serverRoutines, setServerRoutines] = useState(null);
  const [routinesLoading, setRoutinesLoading] = useState(false);

  const loadRoutines = async (scope) => {
    const myName = currentUserInfo?.name;
    if (!myName) return;
    setRoutinesLoading(true);
    try {
      const response = await fetch(API_URL + '?action=getRoutines&userName=' + encodeURIComponent(myName) +
        '&scope=' + encodeURIComponent(scope || routineScope));
      const data = await response.json();
      if (data.status === 'ok' && Array.isArray(data.routines)) setServerRoutines(data.routines);
    } catch (e) {
    } finally {
      setRoutinesLoading(false);
    }
  };

  // Load once after login (powers the 🔁 badge), and again whenever the scope changes.
  useEffect(() => {
    if (currentUserInfo?.name) loadRoutines(routineScope);
  }, [currentUserInfo?.name, routineScope]);

  const openMyRoutines = () => {
    setRoutineEndDraft({});
    setShowMyRoutines(true);
    loadRoutines(routineScope);
  };

  const myRoutineRows = useMemo(() => {
    if (!currentUserInfo) return [];
    const me = currentUserInfo.name;
    const todayKey = localDateKey_(new Date());
    const rank = { active: 0, scheduled: 1, paused: 2, ended: 3 };

    let source;
    if (serverRoutines) {
      source = serverRoutines.map(r => ({ task: r, hasSchedule: r.hasSchedule !== false, open: r.openCopies || 0, done: r.doneCopies || 0 }));
    } else {
      const templates = tasks.filter(t => t.taskType === 'Routine');
      const scoped = (isAdmin && routineScope === 'all')
        ? templates
        : templates.filter(t => isTaskAssignedToMe(t) || t.assignedBy === me);
      source = scoped.map(t => {
        const copies = tasks.filter(c => c.taskType === 'Routine Instance' &&
          c.taskDetails === t.taskDetails && c.assignedTo === t.assignedTo);
        return { task: t, hasSchedule: true, open: copies.filter(c => c.status !== 'Completed').length, done: copies.filter(c => c.status === 'Completed').length };
      });
    }

    return source.map(({ task: t, hasSchedule, open, done }) => {
      const end = t.endDate ? String(t.endDate).slice(0, 10) : '';
      const start = t.startDate ? String(t.startDate).slice(0, 10) : '';
      let status = 'active';
      if (!hasSchedule) status = 'ended';
      else if (end && end < todayKey) status = 'paused';
      else if (start && start > todayKey) status = 'scheduled';
      let daysLeft = null;
      if (hasSchedule && end && end >= todayKey) {
        daysLeft = Math.round((new Date(end + 'T12:00:00') - new Date(todayKey + 'T12:00:00')) / 86400000);
      }
      let totalDays = null;
      if (hasSchedule && start && end) {
        totalDays = Math.round((new Date(end + 'T12:00:00') - new Date(start + 'T12:00:00')) / 86400000) + 1;
      }
      return { task: t, hasSchedule, start, end, status, openCopies: open, doneCopies: done, daysLeft, totalDays };
    }).sort((a, b) => (rank[a.status] - rank[b.status]) ||
      String(a.task.taskDetails).localeCompare(String(b.task.taskDetails)));
  }, [serverRoutines, tasks, currentUserInfo, routineScope, isAdmin]);

  // Badge on the 🔁 button: how many of MY recurring tasks are currently running.
  const activeRoutineCount = myRoutineRows.filter(r => r.status === 'active' &&
    (routineScope === 'mine' || isTaskAssignedToMe(r.task) || r.task.assignedBy === currentUserInfo?.name)).length;

  const describeRoutineFrequency = (t, start) => {
    if (t.frequency === 'Weekly' && start) {
      return 'Every ' + new Date(start + 'T12:00:00').toLocaleDateString('en-IN', { weekday: 'long' });
    }
    if (t.frequency === 'Monthly' && start) {
      const day = new Date(start + 'T12:00:00').getDate();
      const suffix = (day % 10 === 1 && day !== 11) ? 'st' : (day % 10 === 2 && day !== 12) ? 'nd' : (day % 10 === 3 && day !== 13) ? 'rd' : 'th';
      return `Every month on the ${day}${suffix}`;
    }
    return 'Every day';
  };

  const formatNiceDate = (key) => key
    ? new Date(key + 'T12:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : '';

  // Shared sender: updates the task locally first (instant), then saves to the server.
  const saveRoutineEndDate = (task, endDate, doneMessage) => {
    setRoutineBusyId(task.id);
    setTasks(prev => prev.map(t => String(t.id) === String(task.id) ? { ...t, endDate } : t));
    setServerRoutines(prev => prev ? prev.map(r => String(r.id) === String(task.id) ? { ...r, endDate } : r) : prev);
    fetch(API_URL, {
      method: 'POST', mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ action: 'updateRoutine', taskId: task.id, updates: { endDate }, userName: currentUserInfo.name })
    });
    setRoutineEndDraft(prev => { const next = { ...prev }; delete next[task.id]; return next; });
    if (doneMessage) pushNotif(doneMessage);
    setTimeout(() => { loadTasksBackground(); loadRoutines(); setRoutineBusyId(null); }, 1500);
  };

  const pauseRoutine = (task) => {
    if (!confirm(`Pause "${task.taskDetails}"?\n\nNo new copies will be created until you resume it. Copies already on the board stay.`)) return;
    const y = new Date();
    y.setDate(y.getDate() - 1);
    saveRoutineEndDate(task, localDateKey_(y), '⏸️ Recurring task paused');
  };

  const resumeRoutine = (task) => {
    saveRoutineEndDate(task, '', '▶️ Recurring task resumed — it will run with no end date');
  };

  const saveRoutineDuration = (task) => {
    const draft = routineEndDraft[task.id];
    if (draft === undefined) return;
    if (draft && task.startDate && draft < String(task.startDate).slice(0, 10)) {
      alert('The end date can’t be before the start date.');
      return;
    }
    saveRoutineEndDate(task, draft, draft ? `📅 Will now run until ${formatNiceDate(draft)}` : '♾️ Will now run with no end date');
  };

  const removeRoutine = (row) => {
    const task = row.task;
    if (!confirm(`Remove the recurring task "${task.taskDetails}" permanently?\n\nIt will stop repeating and disappear from this list.`)) return;
    let removeOpenCopies = false;
    if (row.openCopies > 0) {
      removeOpenCopies = confirm(`It also has ${row.openCopies} unfinished cop${row.openCopies === 1 ? 'y' : 'ies'} on the board.\n\nOK = remove those too\nCancel = keep them on the board`);
    }
    setRoutineBusyId(task.id);
    setServerRoutines(prev => prev ? prev.filter(r => String(r.id) !== String(task.id)) : prev);
    setTasks(prev => prev.filter(t => {
      if (String(t.id) === String(task.id)) return false;
      if (removeOpenCopies && t.taskType === 'Routine Instance' && t.taskDetails === task.taskDetails &&
        t.assignedTo === task.assignedTo && t.status !== 'Completed') return false;
      return true;
    }));
    fetch(API_URL, {
      method: 'POST', mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ action: 'deleteRoutine', taskId: task.id, userName: currentUserInfo.name, removeOpenCopies })
    });
    pushNotif('🗑️ Recurring task removed');
    setTimeout(() => { loadTasksBackground(); loadRoutines(); setRoutineBusyId(null); }, 1500);
  };

  // "Track" — jump to the board filtered to recurring tasks, so every copy is visible.
  const viewRoutineCopiesOnBoard = () => {
    setShowMyRoutines(false);
    setFilterStatus([]);
    setFilterChannel([]);
    setFilterCategory([]);
    setFilterTaskType(['Routine']);
    setTaskBucket('all');
    setShowOlderRoutine(true);
  };

  const unreadInbox = inbox.filter(i => i.read === 'No').length;
  const unreadChats = chats.filter(c => c.read === 'No' && c.to === currentUserInfo?.name).length;

  // FIX — PWA browser-tab block. Only ever affects THIS page, in THIS tab — a website
  // cannot see or touch any other tab or site, so this has zero effect anywhere else.
  // Triggers only if this device has already completed the private one-time setup
  // (meaning they've used the installed app before) AND they're currently NOT inside
  // the installed app — i.e., they opened the link in a regular browser tab instead.
  let hasSavedPwaUser = false;
  try { hasSavedPwaUser = !!localStorage.getItem(PWA_USER_KEY); } catch (e) {}
  const showBrowserBlock = hasSavedPwaUser && !isRunningStandalone();

  if (showBrowserBlock) {
    return (
      <div className="app">
        <div className="welcome-screen">
          <div className="welcome-card">
            <img src="/wtc-logo.png" alt="WTC" className="welcome-logo" />
            <h1>WTC Management Hub</h1>
            <p className="welcome-text">Please use the WTC Hub app to access your dashboard.</p>
            <div className="welcome-info">
              Open the <strong>WTC Hub</strong> icon on your desktop or home screen instead of this browser tab.
            </div>
          </div>
        </div>
      </div>
    );
  }

  // FIX — one-time private setup screen. Shown only when no dashboard link has been
  // identified yet (no ?user= in the URL, nothing saved on this device). Purely a
  // private text box — no list of names or links is ever shown here.
  if (needsPwaSetup) {
    return (
      <div className="app">
        <div className="welcome-screen">
          <div className="welcome-card">
            <img src="/wtc-logo.png" alt="WTC" className="welcome-logo" />
            <h1>WTC Management Hub</h1>
            <p className="welcome-text">Enter your personal dashboard link to get started. This is saved privately on this device only — you won't need to enter it again.</p>
            <input
              type="text"
              className="pwa-setup-input"
              placeholder="Paste your link or enter your username"
              value={pwaSetupInput}
              onChange={(e) => setPwaSetupInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handlePwaSetupSubmit()}
            />
            {pwaSetupError && <p className="pwa-setup-error">{pwaSetupError}</p>}
            <button className="btn-new-task pwa-setup-btn" onClick={handlePwaSetupSubmit}>Continue</button>
          </div>
        </div>
      </div>
    );
  }

  // FIX — show a neutral loading state while team data is still being fetched, instead of
  // jumping straight to the "invalid user" dead-end screen. Matters most for anyone added
  // to the team after the original 14, whose account only exists once this resolves.
  if (!teamLoaded && currentUser) {
    return (
      <div className="app">
        <div className="welcome-screen">
          <div className="welcome-card">
            <img src="/wtc-logo.png" alt="WTC" className="welcome-logo" />
            <h1>WTC Management Hub</h1>
            <p className="welcome-text">Loading your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (isInvalidUser) {
    return (
      <div className="app">
        <div className="welcome-screen">
          <div className="welcome-card">
            <img src="/wtc-logo.png" alt="WTC" className="welcome-logo" />
            <h1>WTC Management Hub</h1>
            <p className="welcome-text">Please use your personal dashboard link.</p>
            <div className="welcome-info">
              <strong>Need your link?</strong><br/>
              Contact Shivendra Singh for your personal URL.
            </div>
            <button className="btn-secondary" style={{ marginTop: '16px' }} onClick={handleUseDifferentLink}>Try a different link</button>
          </div>
        </div>
        <footer className="footer">
          <p>Made with <span className="heart">❤</span> by Shivendra • WTC Management</p>
        </footer>
      </div>
    );
  }

  return (
    <div className="app">
      {/* FIX — completion celebration confetti */}
      {confettiPieces.length > 0 && (
        <div className="confetti-overlay">
          {confettiPieces.map(p => (
            <span
              key={p.id}
              className="confetti-piece"
              style={{
                left: `${p.left}%`,
                backgroundColor: p.color,
                animationDelay: `${p.delay}s`,
                animationDuration: `${p.duration}s`,
                transform: `rotate(${p.rotate}deg)`
              }}
            />
          ))}
        </div>
      )}

      {/* FIX #7/#10 — notification queue: multiple can stack, each flashes in and auto-dismisses */}
      <div className="notif-stack">
        {notifQueue.map(n => (
          <div
            key={n.id}
            className={`notif-popup ${n.onClick ? 'clickable' : ''}`}
            onClick={() => {
              if (n.onClick) n.onClick();
              setNotifQueue(q => q.filter(x => x.id !== n.id));
            }}
          >
            <div className="notif-icon">🔔</div>
            <div className="notif-msg">{n.message}</div>
            <button className="notif-close" onClick={(e) => { e.stopPropagation(); setNotifQueue(q => q.filter(x => x.id !== n.id)); }}>✕</button>
          </div>
        ))}
      </div>

      <header className="header-premium">
        <div className="header-container">
          <div className="header-brand">
            <img src="/wtc-logo-tight.png" alt="Write Track Creations" className="logo-premium" />
            <div className="brand-info">
              <h1 className="brand-title">WTC Hub</h1>
              <p className="brand-subtitle">{currentUserInfo?.role}</p>
            </div>
          </div>

          <div className="header-center">
            <p className="greeting-text">{greeting}</p>
            <p className="date-text">{new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</p>
          </div>

          <div className="header-actions-premium">
            <nav className="icon-dock" aria-label="Main">
              {canSeeContentCalendar && (
                <button className="icon-btn" onClick={openContentCalendar} title="Content Calendar"><FiCalendar /><span className="icon-label">Content</span></button>
              )}
              <button className="icon-btn" onClick={openMeetings} title="Team Meet"><FiUsers /><span className="icon-label">Meet</span></button>
              <button className={`icon-btn ${activeRoutineCount > 0 ? 'has-routines' : ''}`} onClick={openMyRoutines} title={`My Recurring Tasks${activeRoutineCount ? ` — ${activeRoutineCount} running` : ''}`}>
                <FiRepeat /><span className="icon-label">Routines</span>
                {activeRoutineCount > 0 && <span className="badge-count badge-soft">{activeRoutineCount}</span>}
              </button>
              <button className="icon-btn" onClick={() => { setShowTargets(true); setTargetView('mine'); loadTargets(); }} title="Targets">
                <FiTarget /><span className="icon-label">Targets</span>
                {myOpenTargets > 0 && <span className="badge-count badge-soft">{myOpenTargets}</span>}
              </button>
              <button className="icon-btn" onClick={openNoticeBoard} title="Notice Board"><FiClipboard /><span className="icon-label">Notices</span></button>
              <button className="icon-btn" onClick={openHolidayCalendar} title="Holiday Calendar"><FiSun /><span className="icon-label">Holidays</span></button>
              {canManageTeam && (
                <button className="icon-btn" onClick={() => setShowTeamManager(true)} title="Manage Team"><FiSettings /><span className="icon-label">Team</span></button>
              )}
              <span className="dock-divider"></span>
              {canCall && (
                <button className="icon-btn icon-call" onClick={openCallCompose} title="Call / Summon"><FiPhone /></button>
              )}
              <button className="icon-btn" onClick={openChat} title="Chat">
                <FiMessageSquare />
                {unreadChats > 0 && <span className="badge-count">{unreadChats}</span>}
              </button>
              <button className="icon-btn" onClick={openInbox} title="Notifications">
                <FiBell />
                {unreadInbox > 0 && <span className="badge-count">{unreadInbox > 99 ? '99+' : unreadInbox}</span>}
              </button>
              {notifPermission !== 'granted' && notifPermission !== 'unsupported' && (
                <button className="icon-btn icon-warn" onClick={notifPermission === 'default' ? requestNotifPermission : () => alert('Notifications are blocked for this app.\n\nTo fix: click the 🔒 icon next to the address (or the app\'s ⋮ menu → App info) → Notifications → Allow. Then reopen the app.')} title="Alerts are off on this device — click to turn on">
                  <FiBellOff />
                </button>
              )}
              <button
                className={`icon-btn ${manualRefreshing ? 'spinning' : ''}`}
                onClick={async () => {
                  if (manualRefreshing) return;
                  setManualRefreshing(true);
                  await Promise.all([loadTasksBackground(), loadAttendanceBackground(), loadInboxBackground(), loadChatsBackground(), loadTeam(), loadSettings()]);
                  setTimeout(() => setManualRefreshing(false), 500);
                }}
                title="Refresh"
              >
                <FiRefreshCw />
              </button>
            </nav>
            {!showArchive && (
              <button className="btn-new-task" onClick={() => setShowNewTaskForm(true)}>
                <FiPlus /> New Task
              </button>
            )}
          </div>
        </div>
      </header>

      {todayQuote && <p className="quote-strip">“{todayQuote}”</p>}

      {/* Shown only while THIS device can't receive call alerts, with the exact fix. */}
      {!pushBannerDismissed && ['not-allowed', 'blocked', 'unsupported', 'error'].includes(myPushState.status) && (
        <div className={`push-banner push-banner-${myPushState.status}`} role="status">
          <span className="push-banner-icon"><FiBell /></span>
          <div className="push-banner-text">
            <strong>
              {myPushState.status === 'not-allowed' ? 'Turn on alerts for this device'
                : myPushState.status === 'blocked' ? 'Alerts are blocked on this device'
                : 'This device can’t receive alerts'}
            </strong>
            <span>
              {myPushState.status === 'not-allowed' ? 'So calls, reminders and new tasks reach you even when the app is closed.'
                : myPushState.status === 'blocked' ? 'Open the site settings (🔒 next to the address, or Settings → Apps on a phone) → Notifications → Allow, then reopen the app.'
                : myPushState.detail}
            </span>
          </div>
          {myPushState.status === 'not-allowed' && (
            <button className="btn-success push-banner-btn" onClick={requestNotifPermission}>Turn on</button>
          )}
          {myPushState.status === 'error' && (
            <button className="btn-secondary push-banner-btn" onClick={() => subscribeToPush(currentUserInfo?.name)}>Try again</button>
          )}
          <button className="push-banner-close" onClick={() => setPushBannerDismissed(true)} aria-label="Hide">✕</button>
        </div>
      )}

      {showInbox && (
        <div className="side-panel inbox-panel">
          <div className="panel-header">
            <h3><FiBell /> Notifications {inbox.length > 0 && <span className="panel-count">{inbox.length}</span>}</h3>
            {inbox.length > 0 && <button className="panel-text-btn" onClick={clearAllInbox}>Clear all</button>}
            <button className="close-btn" onClick={() => setShowInbox(false)} aria-label="Close"><FiX /></button>
          </div>
          <div className="panel-body">
            {inbox.length === 0 ? (
              <div className="inbox-empty">
                <div className="inbox-empty-icon"><FiCheckCircle /></div>
                <p>You're all caught up</p>
                <span>New tasks, reminders and updates will appear here.</span>
              </div>
            ) : (
              <>
                <p className="inbox-hint">Tap a notification to open it — it clears automatically.</p>
                {inbox.map(item => {
                  const d = describeInboxItem(item);
                  return (
                    <div key={item.id} className={`inbox-item inbox-${item.type}`} onClick={() => handleInboxItemClick(item)}>
                      <div className="inbox-icon">{d.icon}</div>
                      <div className="inbox-content">
                        <p className="inbox-title">{d.title}</p>
                        <p className="inbox-task">{item.title}</p>
                        <p className="inbox-time">{timeAgo(item.timestamp)}</p>
                      </div>
                      <button className="inbox-dismiss" title="Dismiss" onClick={(e) => { e.stopPropagation(); dismissInboxItem(item); }}><FiX /></button>
                    </div>
                  );
                })}
              </>
            )}
          </div>
        </div>
      )}

      {/* FIX #12 — Chat redesigned to read like an email client: inbox-style conversation
          rows on the left, a threaded message pane on the right, sender/timestamp headers per message. */}
      {showChat && (
        <div className="side-panel chat-panel-email">
          <div className="panel-header">
            {chatWith ? (
              <>
                <button className="back-btn" onClick={() => setChatWith(null)}>←</button>
                <h3>{chatWith}</h3>
              </>
            ) : (
              <h3>💬 Team Chat</h3>
            )}
            <button className="close-btn" onClick={openChat}>✕</button>
          </div>
          {!chatWith ? (
            <div className="panel-body email-list">
              <p className="section-title">Team</p>
              <div className="email-rows">
                {activeTeam.filter(m => m.id !== currentUser).map(member => {
                  const conv = getConversationList().find(c => c.person === member.name);
                  return (
                    <div key={member.id} className="email-row" onClick={() => openChatWith(member.name)}>
                      <div className="email-avatar-wrap">
                        <div className="email-avatar">{member.avatar}</div>
                        {isPresent(member.name) && <span className="presence-dot" title="Currently working"></span>}
                      </div>
                      <div className="email-row-body">
                        <div className="email-row-top">
                          <strong>{member.displayName}</strong>
                          {conv && <span className="email-time">{new Date(conv.lastMessage.timestamp).toLocaleDateString([], { day: '2-digit', month: 'short' })}</span>}
                        </div>
                        <div className="email-row-bottom">
                          <span className="email-preview">{conv ? conv.lastMessage.message : member.role}</span>
                          {conv && conv.unreadCount > 0 && <span className="unread-badge">{conv.unreadCount}</span>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <>
              <div className="chat-messages-email">
                {getConversationMessages().map((msg, idx, arr) => {
                  const isMe = msg.from === currentUserInfo.name;
                  const showHeader = idx === 0 || arr[idx - 1].from !== msg.from;
                  return (
                    <div key={msg.id} className={`email-msg ${isMe ? 'sent' : 'received'}`}>
                      {showHeader && (
                        <div className="email-msg-header">
                          <span className="email-msg-from">{isMe ? 'You' : msg.from}</span>
                          <span className="email-msg-time">{new Date(msg.timestamp).toLocaleString([], { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      )}
                      <div className="email-msg-body">{msg.message}</div>
                    </div>
                  );
                })}
              </div>
              <div className="chat-input">
                <input
                  type="text"
                  placeholder="Write a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                />
                <button onClick={sendMessage}>Send ➤</button>
              </div>
            </>
          )}
        </div>
      )}

      {/* FIX #13 — Team Management panel, PC & Shivendra only */}
      {showTeamManager && canManageTeam && (
        <div className="modal-overlay" onClick={() => setShowTeamManager(false)}>
          <div className="modal-content compact" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>👥 Team Management</h3>
              <button className="modal-close" onClick={() => setShowTeamManager(false)}>✕</button>
            </div>
            <div className="modal-body compact-body">
              <p className="tm-hint">Renaming here only changes what's <strong>displayed</strong> — it won't touch any existing task history. Deactivating hides someone from dashboards and new task assignment without deleting their past tasks.</p>

              <div className="tm-form">
                <div className="form-row-3">
                  <div className="form-group">
                    <label>{tmEditingId ? 'Display Name' : 'Full Name *'}</label>
                    <input
                      type="text"
                      value={tmEditingId ? tmForm.displayName : tmForm.name}
                      onChange={(e) => tmEditingId ? setTmForm({...tmForm, displayName: e.target.value}) : setTmForm({...tmForm, name: e.target.value})}
                      placeholder="e.g. Rohit Sharma"
                      disabled={!!tmEditingId ? false : false}
                    />
                  </div>
                  <div className="form-group">
                    <label>Role / Designation</label>
                    <input type="text" value={tmForm.role} onChange={(e) => setTmForm({...tmForm, role: e.target.value})} placeholder="e.g. Video Editor" />
                  </div>
                  <div className="form-group">
                    <label>Avatar (2 letters)</label>
                    <input type="text" maxLength={3} value={tmForm.avatar} onChange={(e) => setTmForm({...tmForm, avatar: e.target.value})} placeholder="e.g. RS" />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Quote Style</label>
                    <select value={tmForm.quoteType} onChange={(e) => setTmForm({...tmForm, quoteType: e.target.value})}>
                      <option value="social_media">Social Media</option>
                      <option value="video_editor">Video Editor</option>
                      <option value="pr">PR</option>
                      <option value="hr">HR</option>
                      <option value="manager">Manager</option>
                      <option value="ceo">CEO</option>
                    </select>
                  </div>
                  <div className="form-group" style={{display:'flex', alignItems:'flex-end', gap:'8px'}}>
                    {tmEditingId ? (
                      <>
                        <button className="btn-success" onClick={handleTeamSaveEdit} disabled={tmSaving}>{tmSaving ? 'Saving...' : '💾 Save Changes'}</button>
                        <button className="btn-secondary" onClick={() => { setTmEditingId(null); setTmForm({ name: '', displayName: '', role: '', avatar: '', quoteType: 'social_media' }); }}>Cancel</button>
                      </>
                    ) : (
                      <button className="btn-success" onClick={handleTeamAdd} disabled={tmSaving}>{tmSaving ? 'Adding...' : '➕ Add New Team Member'}</button>
                    )}
                  </div>
                </div>
              </div>

              <p className="section-title" style={{marginTop: '20px'}}>Current Roster</p>
              <div className="tm-list">
                {team.map(member => (
                  <div key={member.id} className={`tm-row ${member.active === false ? 'inactive' : ''}`}>
                    <div className="chat-avatar">{member.avatar}</div>
                    <div className="tm-row-info">
                      <strong>{member.displayName}</strong>
                      <span>{member.role} {member.isAdmin ? '• Admin' : ''} {member.isHR ? '• HR' : ''}</span>
                      <span className="tm-url">?user={member.id}</span>
                    </div>
                    <div className="tm-row-actions">
                      <button className="btn-secondary" onClick={() => handleTeamEdit(member)}>✏️ Edit</button>
                      <button className="btn-secondary" onClick={() => handleTeamToggleActive(member)}>
                        {member.active === false ? '✅ Reactivate' : '🚫 Deactivate'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* LEADERBOARD — visible to everyone including Shivendra/PC, real-time while open */}
      {/* HOLIDAY CALENDAR — separate from Notice Board, its own icon and modal */}
      {showHolidayCalendar && (
        <div className="modal-overlay" onClick={() => setShowHolidayCalendar(false)}>
          <div className="modal-content compact" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>🗓️ Holiday Calendar</h3>
              <button className="modal-close" onClick={() => setShowHolidayCalendar(false)}>✕</button>
            </div>
            <div className="modal-body compact-body">
              {canManageTeam && (
                <div className="holiday-admin-row">
                  <input type="date" value={newHolidayDate} onChange={(e) => setNewHolidayDate(e.target.value)} />
                  <input type="text" placeholder="Holiday name" value={newHolidayName} onChange={(e) => setNewHolidayName(e.target.value)} />
                  <button className="btn-success" onClick={handleAddHoliday} disabled={holidaySaving}>+ Add</button>
                </div>
              )}
              {holidays.length === 0 ? (
                <p className="empty-text">Loading...</p>
              ) : (
                <div className="holiday-grid">
                  {holidays.map(h => {
                    const d = new Date(h.date + 'T12:00:00');
                    return (
                      <div key={h.id || h.date} className="holiday-card">
                        <div className="holiday-card-date">
                          <span className="holiday-day">{d.getDate()}</span>
                          <span className="holiday-month">{d.toLocaleDateString('en-IN', { month: 'short' })}</span>
                        </div>
                        <div className="holiday-card-info">
                          <strong>{h.name}</strong>
                          <span>{d.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric' })}</span>
                        </div>
                        {canManageTeam && (
                          <button className="holiday-delete-btn" onClick={() => handleDeleteHoliday(h)} title="Remove holiday">✕</button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MY RECURRING TASKS — everyone manages their own recurring tasks here. */}
      {showMyRoutines && (
        <div className="modal-overlay" onClick={() => setShowMyRoutines(false)}>
          <div className="modal-content routine-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header routine-header">
              <h3>🔁 My Recurring Tasks</h3>
              <button className="modal-close" onClick={() => setShowMyRoutines(false)}>✕</button>
            </div>
            <div className="modal-body compact-body">
              <div className="routine-toolbar">
                {isAdmin ? (
                  <div className="routine-scope">
                    <button className={routineScope === 'mine' ? 'active' : ''} onClick={() => setRoutineScope('mine')}>Mine</button>
                    <button className={routineScope === 'all' ? 'active' : ''} onClick={() => setRoutineScope('all')}>Whole team</button>
                  </div>
                ) : (
                  <span className="routine-hint">Recurring tasks assigned to you or by you</span>
                )}
                <button className="btn-secondary routine-board-btn" onClick={viewRoutineCopiesOnBoard}>📋 See all copies on the board</button>
              </div>

              <div className="routine-summary">
                <span><strong>{myRoutineRows.filter(r => r.status === 'active').length}</strong> active</span>
                <span><strong>{myRoutineRows.filter(r => r.status === 'paused' || r.status === 'ended').length}</strong> paused / past</span>
                <span><strong>{myRoutineRows.reduce((n, r) => n + r.openCopies, 0)}</strong> open copies</span>
              </div>

              {routinesLoading && serverRoutines === null && <p className="empty-text">Loading every recurring task…</p>}
              {myRoutineRows.length === 0 ? (
                <div className="routine-empty">
                  <div className="routine-empty-icon">🔁</div>
                  <p>No recurring tasks {routineScope === 'all' ? 'in the team' : 'for you'} yet.</p>
                  <p className="routine-empty-sub">Create one from “+ New Task” → Routine.</p>
                </div>
              ) : (
                <div className="routine-list">
                  {myRoutineRows.map(row => {
                    const t = row.task;
                    const draft = routineEndDraft[t.id];
                    const editing = draft !== undefined;
                    const busy = String(routineBusyId) === String(t.id);
                    return (
                      <div key={t.id} className={`routine-card routine-${row.status} ${busy ? 'routine-busy' : ''}`}>
                        <div className="routine-card-top">
                          <div className="routine-title">{t.taskDetails}</div>
                          <span className={`routine-status routine-status-${row.status}`}>
                            {row.status === 'active' ? '● Active' : row.status === 'scheduled' ? '◷ Starts soon' : row.status === 'ended' ? '◼ Past' : '⏸ Paused'}
                          </span>
                        </div>

                        <div className="routine-meta">
                          <span className="routine-chip">🔄 {describeRoutineFrequency(t, row.start)}</span>
                          <span className="routine-chip">👤 {t.assignedTo}</span>
                          {t.archived && <span className="routine-chip" title="Its main card was marked Completed on the board, so it was hidden there — it still repeats.">📦 hidden from board</span>}
                          {t.assignedBy && <span className="routine-chip">✍️ by {t.assignedBy}</span>}
                        </div>

                        <div className="routine-duration">
                          <div>
                            <label>{row.hasSchedule ? 'Started' : 'First copy'}</label>
                            <strong>{row.start ? formatNiceDate(row.start) : '—'}</strong>
                          </div>
                          <div>
                            <label>{row.hasSchedule ? 'Ends' : 'Last copy'}</label>
                            <strong>{row.end ? formatNiceDate(row.end) : 'No end date'}</strong>
                          </div>
                          <div>
                            <label>{row.status === 'paused' || row.status === 'ended' ? 'Status' : 'Time left'}</label>
                            <strong>
                              {row.status === 'ended' ? 'Old series — no longer repeating' : row.status === 'paused' ? 'Not repeating'
                                : row.daysLeft === null ? 'Ongoing'
                                : row.daysLeft === 0 ? 'Last day today'
                                : `${row.daysLeft} day${row.daysLeft === 1 ? '' : 's'}`}
                            </strong>
                          </div>
                          <div>
                            <label>Copies</label>
                            <strong>{row.openCopies} open · {row.doneCopies} done</strong>
                          </div>
                        </div>

                        {row.totalDays && row.status !== 'paused' && row.daysLeft !== null && (
                          <div className="routine-progress" title={`${row.totalDays - row.daysLeft} of ${row.totalDays} days done`}>
                            <div style={{ width: `${Math.min(100, Math.max(3, ((row.totalDays - row.daysLeft) / row.totalDays) * 100))}%` }}></div>
                          </div>
                        )}

                        {!row.hasSchedule ? (
                          <div className="routine-past-note">Its schedule was deleted earlier, so it can’t be paused or resumed — shown here for your record.</div>
                        ) : editing ? (
                          <div className="routine-edit-row">
                            <label>Run until</label>
                            <input
                              type="date"
                              min={row.start || undefined}
                              value={draft}
                              onChange={(e) => setRoutineEndDraft(prev => ({ ...prev, [t.id]: e.target.value }))}
                            />
                            <button className="btn-secondary" onClick={() => setRoutineEndDraft(prev => ({ ...prev, [t.id]: '' }))}>♾️ No end</button>
                            <button className="btn-success" onClick={() => saveRoutineDuration(t)} disabled={busy}>Save</button>
                            <button className="btn-secondary" onClick={() => setRoutineEndDraft(prev => { const n = { ...prev }; delete n[t.id]; return n; })}>Cancel</button>
                          </div>
                        ) : (
                          <div className="routine-actions">
                            {row.status === 'paused' ? (
                              <button className="routine-btn routine-btn-resume" onClick={() => resumeRoutine(t)} disabled={busy}>▶️ Resume</button>
                            ) : (
                              <button className="routine-btn routine-btn-pause" onClick={() => pauseRoutine(t)} disabled={busy}>⏸️ Pause</button>
                            )}
                            <button className="routine-btn" onClick={() => setRoutineEndDraft(prev => ({ ...prev, [t.id]: row.end || '' }))} disabled={busy}>📅 Change duration</button>
                            <button className="routine-btn routine-btn-remove" onClick={() => removeRoutine(row)} disabled={busy}>🗑️ Remove</button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TEAM MEET — anyone can schedule a meeting and assign anyone; assigned people
          (and the creator) get a 5-minute-before alarm (see effect above). */}
      {showMeetings && (
        <div className="modal-overlay" onClick={() => { setShowMeetings(false); setShowNewMeetingForm(false); }}>
          <div className="modal-content compact" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header meeting-header">
              <h3>🤝 Team Meet</h3>
              <button className="modal-close" onClick={() => { setShowMeetings(false); setShowNewMeetingForm(false); }}>✕</button>
            </div>
            <div className="modal-body compact-body">
              {!showNewMeetingForm ? (
                <>
                  <button className="btn-success" style={{ marginBottom: '16px' }} onClick={() => setShowNewMeetingForm(true)}>
                    + Schedule a Meeting
                  </button>
                  {meetings.length === 0 ? (
                    <p className="empty-text">No meetings scheduled yet.</p>
                  ) : (
                    <div className="meetings-list">
                      {[...meetings]
                        .sort((a, b) => new Date(`${a.meetingDate}T${a.meetingTime || '00:00'}`) - new Date(`${b.meetingDate}T${b.meetingTime || '00:00'}`))
                        .map(m => {
                          const canDelete = isAdmin || m.createdBy === currentUserInfo?.name;
                          const isRoutine = m.type === 'Routine';
                          // Recurring meetings are never "past" — they keep coming back.
                          const isPast = !isRoutine && new Date(`${m.meetingDate}T${m.meetingTime || '00:00'}`) < new Date();
                          return (
                            <div key={m.id} className={`meeting-card ${isPast ? 'meeting-past' : ''} ${isRoutine ? 'meeting-routine' : ''}`}>
                              <div className="meeting-card-main">
                                <div className="meeting-card-top">
                                  <span className="meeting-type-tag">{isRoutine ? `🔄 ${m.frequency || 'Daily'}` : m.type}</span>
                                  <strong>{m.title}</strong>
                                </div>
                                {m.purpose && <p className="meeting-purpose">{m.purpose}</p>}
                                <div className="meeting-card-meta">
                                  <span>📅 {isRoutine ? 'From ' : ''}{new Date(m.meetingDate + 'T12:00:00').toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                  <span>🕐 {fmtClock12(m.meetingTime)}</span>
                                  <span>👥 {m.assignedTo}</span>
                                </div>
                                <p className="meeting-created-by">Scheduled by {m.createdBy}</p>
                              </div>
                              {canDelete && (
                                <button className="btn-delete-task" title="Delete meeting" onClick={() => handleDeleteMeeting(m)}>🗑️</button>
                              )}
                            </div>
                          );
                        })}
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="form-group">
                    <label>Meeting Title *</label>
                    <input type="text" placeholder="e.g. Weekly Content Review" value={newMeeting.title} onChange={(e) => setNewMeeting({ ...newMeeting, title: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Meeting Purpose</label>
                    <input type="text" placeholder="What's this meeting about? (optional)" value={newMeeting.purpose} onChange={(e) => setNewMeeting({ ...newMeeting, purpose: e.target.value })} />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Type</label>
                      <select value={newMeeting.type} onChange={(e) => setNewMeeting({ ...newMeeting, type: e.target.value })}>
                        <option value="Team Meet">Team Meet (one-time)</option>
                        <option value="General">General (one-time)</option>
                        <option value="Routine">Routine (recurring)</option>
                        <option value="Other">Other (one-time)</option>
                      </select>
                    </div>
                    {/* NEW — Routine meetings recur; the rest happen once, on their exact date. */}
                    {newMeeting.type === 'Routine' && (
                      <div className="form-group">
                        <label>Repeats</label>
                        <select value={newMeeting.frequency} onChange={(e) => setNewMeeting({ ...newMeeting, frequency: e.target.value })}>
                          <option value="Daily">Daily</option>
                          <option value="Weekly">Weekly (same weekday)</option>
                          <option value="Monthly">Monthly (same date)</option>
                        </select>
                      </div>
                    )}
                  </div>
                  <div className="form-group">
                    <label>Assign to * ({meetingAssignees.length} selected)</label>
                    <div className="assignee-avatars-select">
                      {team.filter(m => m.active !== false).map(member => (
                        <div
                          key={member.id}
                          className={`avatar-select ${meetingAssignees.includes(member.name) ? 'checked' : ''}`}
                          onClick={() => toggleMeetingAssignee(member.name)}
                          title={member.name}
                        >
                          {member.avatar}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>{newMeeting.type === 'Routine' ? 'Starts On *' : 'Date *'}</label>
                      <input type="date" value={newMeeting.meetingDate} onChange={(e) => setNewMeeting({ ...newMeeting, meetingDate: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label>Time *</label>
                      <TimePicker12 value={newMeeting.meetingTime} onChange={(v) => setNewMeeting({ ...newMeeting, meetingTime: v })} />
                    </div>
                  </div>
                  {newMeeting.type === 'Routine' && (
                    <p className="meeting-purpose" style={{ marginTop: '-4px', marginBottom: '12px' }}>
                      🔄 This will repeat {newMeeting.frequency.toLowerCase()} starting from the date above — everyone assigned gets the 5-minute reminder every time it recurs.
                    </p>
                  )}
                  <div className="modal-footer" style={{ padding: '15px 0 0', border: 'none', background: 'transparent' }}>
                    <button className="btn-secondary" onClick={() => setShowNewMeetingForm(false)}>Cancel</button>
                    <button className="btn-success" onClick={handleAddMeeting} disabled={meetingSaving}>
                      {meetingSaving ? 'Saving...' : '✅ Schedule Meeting'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CONTENT CALENDAR — everyone reads/writes, entries integrate with the Task board */}
      {showContentCalendar && (
        <div className="modal-overlay" onClick={() => { setShowContentCalendar(false); setEditingContentEntry(null); }}>
          <div className="modal-content xl" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header cc-header">
              <h3>🗓️ Content Calendar</h3>
              <span className={`cc-sync cc-sync-${contentSyncState}`} title="Calendar sync status">
                <span className="cc-sync-dot"></span>
                {contentSyncState === 'live' ? 'Live' : contentSyncState === 'offline' ? 'Reconnecting…' : 'Syncing…'}
              </span>
              {isAppAdmin && (
                <button className="btn-secondary cc-manage-btn" onClick={openCcAccess}><FiShield /> Access</button>
              )}
              {canManageTeam && (
                <button className="btn-secondary cc-manage-btn" onClick={() => setShowManageChannels(true)}><FiSettings /> Channels</button>
              )}
              <button className="modal-close" onClick={() => { setShowContentCalendar(false); setEditingContentEntry(null); }}>✕</button>
            </div>
            <div className="modal-body compact-body">
              {/* v17 — compact top bar, frozen while the calendar scrolls (down to the day names). */}
              <div className="cc-sticky">
                <div className="cc-bar1">
                  <div className="cc-group-tabs cc-tabs-compact">
                    {Object.keys(contentChannelGroups).map(group => (
                      <button key={group} className={contentGroupTab === group ? 'active' : ''} onClick={() => { setContentGroupTab(group); setExpandedContentDay(null); setCcPlatformFilter('all'); }}>{group}</button>
                    ))}
                  </div>
                  <div className="cc-monthnav">
                    <button onClick={() => { changeContentCalMonth(-1); setExpandedContentDay(null); }} title="Previous month">‹</button>
                    <strong>{new Date(contentCalYear, contentCalMonth, 1).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</strong>
                    <button onClick={() => { changeContentCalMonth(1); setExpandedContentDay(null); }} title="Next month">›</button>
                  </div>
                  <div className="cc-view-toggle">
                    <button className={ccView === 'month' ? 'active' : ''} onClick={() => setCcView('month')}>Month</button>
                    <button className={ccView === 'agenda' ? 'active' : ''} onClick={() => setCcView('agenda')}>List</button>
                  </div>
                </div>

                <div className="cc-bar2">
                  {(() => {
                    const monthPrefix = `${contentCalYear}-${String(contentCalMonth + 1).padStart(2, '0')}`;
                    const inMonth = contentCalGridData.entriesThisGroup.filter(e => String(e.date).slice(0, 7) === monthPrefix);
                    const published = inMonth.filter(e => e.videoStatus === 'Published').length;
                    const scheduled = inMonth.filter(e => e.videoStatus === 'Scheduled in YT Studio').length;
                    const inEdit = inMonth.filter(e => e.videoStatus !== 'Published' && e.videoStatus !== 'Scheduled in YT Studio' && e.editingStatus && e.editingStatus !== 'Not Started').length;
                    const n = new Date();
                    const todayKey = `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}-${String(n.getDate()).padStart(2, '0')}`;
                    const overdue = inMonth.filter(e => e.videoStatus !== 'Published' && String(e.date).slice(0, 10) < todayKey).length;
                    const missingLink = inMonth.filter(e => e.videoStatus !== 'Published' && (e.editingStatus === 'Approved') && !toOpenableUrl(e.finalLink)).length;
                    const mismatched = inMonth.filter(e => platformMismatch(e)).length;
                    const noLive = inMonth.filter(e => e.videoStatus === 'Published' && String(e.date).slice(0, 10) >= LIVE_LINK_SINCE && !toOpenableUrl(e.liveLink)).length;
                    const noTime = inMonth.filter(e => e.videoStatus !== 'Published' && !e.time).length;
                    return (
                      <div className="cc-pills">
                        <span className="cc-pill"><b>{inMonth.length}</b> planned</span>
                        <span className="cc-pill pub"><b>{published}</b> published</span>
                        {inEdit > 0 && <span className="cc-pill edit"><b>{inEdit}</b> editing</span>}
                        {scheduled > 0 && <span className="cc-pill sched"><b>{scheduled}</b> scheduled</span>}
                        {overdue > 0 && <span className="cc-pill bad"><b>{overdue}</b> past date</span>}
                        {missingLink > 0 && <span className="cc-pill bad"><b>{missingLink}</b> no final link</span>}
                        {mismatched > 0 && <span className="cc-pill bad" title="The title names a different platform than the channel it is booked on">⚠ <b>{mismatched}</b> wrong platform</span>}
                        {noTime > 0 && <span className="cc-pill"><b>{noTime}</b> no time</span>}
                        {noLive > 0 && <span className="cc-pill"><b>{noLive}</b> no post link</span>}
                      </div>
                    );
                  })()}
                  <div className="cc-pf-filter cc-pf-compact">
                    <button className={ccPlatformFilter === 'all' ? 'active' : ''} onClick={() => setCcPlatformFilter('all')}>All</button>
                    {contentCalGridData.groupPlatforms.map(pk => (
                      <button key={pk} className={ccPlatformFilter === pk ? 'active' : ''} onClick={() => setCcPlatformFilter(pk)} title={PLATFORMS[pk].label}>
                        <span className="pf-icon" style={{ background: PLATFORMS[pk].bg }}>{PLATFORMS[pk].Icon ? (() => { const I = PLATFORMS[pk].Icon; return <I size={10} />; })() : null}</span>
                      </button>
                    ))}
                  </div>
                  <input className="cc-search" type="search" placeholder="Search…" value={ccSearch} onChange={(e) => setCcSearch(e.target.value)} />
                  <span className="cc-legend-btn" tabIndex={0}>Colours ⓘ
                    <span className="cc-legend-pop">
                      {(() => {
                        const monthPrefix = `${contentCalYear}-${String(contentCalMonth + 1).padStart(2, '0')}`;
                        const seen = new Map();
                        contentCalGridData.entriesThisGroup.filter(e => String(e.date).slice(0, 7) === monthPrefix).forEach(e => {
                          const pk = platformOf(e.channels);
                          const color = blockColor(e.contentType, e.channels);
                          const key = pk + '|' + color;
                          if (!seen.has(key)) seen.set(key, { color, label: `${PLATFORMS[pk].label} ${pk === 'other' ? '' : formatInfo(e.contentType, e.channels).text}`.trim() });
                        });
                        return Array.from(seen.entries()).map(([k, it]) => <span key={k} className="cc-legend-item"><span className="cc-swatch" style={{ background: it.color }}></span>{it.label}</span>);
                      })()}
                      <span className="cc-legend-item"><span className="cc-done-mini">✓</span>Published</span>
                      <span className="cc-legend-item"><span className="cc-status-dot st-edit"></span>Editing</span>
                      <span className="cc-legend-item"><span className="cc-status-dot st-sched"></span>Scheduled</span>
                      <span className="cc-legend-item">🔗 green = final/live link added</span>
                    </span>
                  </span>
                </div>

                {ccView === 'month' && (
                  <div className="cc-weekdays">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <div key={d} className={d === 'Sun' ? 'cc-sun' : ''}>{d}</div>)}
                  </div>
                )}
              </div>

              {ccView === 'month' && (() => {
                const { entriesThisGroup, cells, holidaySet } = contentCalGridData;
                const now = new Date();
                const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
                const MAX_CHIPS = 4;
                return (
                  <div className="cc-calendar-grid cc-v15 cc-v17">
                    {cells.map((day, idx) => {
                      if (day === null) return <div key={idx} className="cc-day-cell cc-day-empty"></div>;
                      const dateStr = `${contentCalYear}-${String(contentCalMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                      const dayEntries = entriesThisGroup.filter(e => String(e.date).slice(0, 10) === dateStr)
                        .sort((a, b) => (a.time || '99').localeCompare(b.time || '99'));
                      const isToday = dateStr === todayStr;
                      const isPast = dateStr < todayStr;
                      const holidayName = holidaySet[dateStr];
                      const visibleEntries = dayEntries.slice(0, MAX_CHIPS);
                      const extraCount = dayEntries.length - visibleEntries.length;
                      const doneCount = dayEntries.filter(e => e.videoStatus === 'Published').length;
                      return (
                        <div
                          key={idx}
                          className={`cc-day-cell ${isToday ? 'cc-today' : ''} ${isPast ? 'cc-past' : ''} ${holidayName ? 'cc-holiday' : ''} ${idx % 7 === 0 ? 'cc-sunday' : ''}`}
                          onClick={() => openNewContentEntry(dateStr)}
                        >
                          <div className="cc-day-top">
                            <span className={isToday ? 'cc-day-num-today' : 'cc-day-num'}>{day}</span>
                            {dayEntries.length > 0 && (
                              <span className={`cc-day-count ${doneCount === dayEntries.length ? 'all-done' : ''}`} title={`${doneCount} of ${dayEntries.length} published`}>
                                {doneCount === dayEntries.length ? '✓ ' : ''}{doneCount}/{dayEntries.length}
                              </span>
                            )}
                            <span className="cc-day-add" title="Add content">＋</span>
                          </div>
                          {holidayName && <div className="cc-holiday-ribbon" title={holidayName}>🎉 {holidayName}</div>}
                          <div className="cc-day-entries">
                            {visibleEntries.map(entry => {
                              const fmt = formatInfo(entry.contentType, entry.channels);
                              const pk = platformOf(entry.channels);
                              const isPublished = entry.videoStatus === 'Published';
                              const stage = contentStageOf(entry);
                              const warn = platformMismatch(entry);
                              return (
                                <div
                                  key={entry.id}
                                  className={`cc-chip cc-evt cc-st-${stage} ${String(entry.id).startsWith('tmp_') ? 'cc-chip-saving' : ''} ${warn ? 'cc-chip-warn' : ''}`}
                                  style={{ '--chip': blockColor(entry.contentType, entry.channels) }}
                                  onClick={(e) => { e.stopPropagation(); openEditContentEntry(entry); }}
                                  title={`${entry.title}\n${entry.channels} · ${fmt.text}${entry.time ? ' · ' + entry.time : ''}\n${entry.videoStatus || 'Not Started'} · ${entry.assignedTo || ''}${warn ? '\n⚠ ' + warn : ''}`}
                                >
                                  <div className="cc-evt-row">
                                    <span className="pf-icon" style={{ background: PLATFORMS[pk].bg }}><PlatformIcon channel={entry.channels} size={8} /></span>
                                    <span className="cc-chip-title">{warn && <span className="cc-warn-dot">⚠</span>}{entry.title}</span>
                                    {entry.time && <span className="cc-chip-time">{fmtClock12(entry.time).replace(':00 ', ' ')}</span>}
                                    {(() => {
                                      const order = ['liveLink', 'finalLink', 'draftLink', 'designLink', 'thumbnailLink', 'rawLink'];
                                      const have = order.filter(k => toOpenableUrl(entry[k]));
                                      if (!have.length) return <span className="cc-link-ind none" title="No link added yet">🔗</span>;
                                      const label = { liveLink: 'Live post', finalLink: 'Final', draftLink: 'Draft', designLink: 'Design', thumbnailLink: 'Thumbnail', rawLink: 'Raw' };
                                      return (
                                        <a className={`cc-link-ind ${have.includes('finalLink') || have.includes('liveLink') ? 'final' : 'some'}`} href={toOpenableUrl(entry[have[0]])} target="_blank" rel="noopener noreferrer"
                                          onClick={(e) => e.stopPropagation()} title={`Links: ${have.map(k => label[k]).join(', ')} — click to open ${label[have[0]]}`}>🔗</a>
                                      );
                                    })()}
                                    {isPublished ? <span className="cc-done" title="Published">✓</span>
                                      : stage === 'sched' ? <span className="cc-stage-dot st-sched" title="Scheduled"></span>
                                      : stage === 'edit' ? <span className="cc-stage-dot st-edit" title={entry.editingStatus}></span> : null}
                                  </div>
                                </div>
                              );
                            })}
                            {extraCount > 0 && (
                              <div className="cc-chip cc-chip-more" onClick={(e) => { e.stopPropagation(); setExpandedContentDay({ dateStr, day }); }}>
                                +{extraCount} more
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}

              {ccView === 'agenda' && (() => {
                const { entriesThisGroup, holidaySet } = contentCalGridData;
                const monthPrefix = `${contentCalYear}-${String(contentCalMonth + 1).padStart(2, '0')}`;
                const now = new Date();
                const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
                const byDay = {};
                entriesThisGroup.filter(e => String(e.date).slice(0, 7) === monthPrefix).forEach(e => { (byDay[String(e.date).slice(0, 10)] = byDay[String(e.date).slice(0, 10)] || []).push(e); });
                const days = Object.keys(byDay).sort();
                if (!days.length) return <div className="inbox-empty"><p>Nothing planned this month</p><span>Switch to Month and tap a day to add content.</span></div>;
                return (
                  <div className="cc-agenda">
                    {days.map(d => (
                      <div key={d} className={`cc-ag-day ${d === todayStr ? 'today' : ''} ${d < todayStr ? 'past' : ''}`}>
                        <div className="cc-ag-date">
                          <strong>{new Date(d + 'T12:00:00').getDate()}</strong>
                          <span>{new Date(d + 'T12:00:00').toLocaleDateString('en-IN', { weekday: 'short', month: 'short' })}</span>
                          {holidaySet[d] && <em>🎉 {holidaySet[d]}</em>}
                        </div>
                        <div className="cc-ag-items">
                          {byDay[d].sort((a, b) => (a.time || '99').localeCompare(b.time || '99')).map(entry => {
                            const fmt = formatInfo(entry.contentType, entry.channels);
                            const pk = platformOf(entry.channels);
                            const stage = contentStageOf(entry);
                            const warn = platformMismatch(entry);
                            return (
                              <div key={entry.id} className={`cc-ag-item cc-st-${stage}`} style={{ '--chip': blockColor(entry.contentType, entry.channels) }} onClick={() => openEditContentEntry(entry)}>
                                <span className="cc-ag-time">{entry.time ? fmtClock12(entry.time) : '—'}</span>
                                <span className="pf-icon" style={{ background: PLATFORMS[pk].bg }}><PlatformIcon channel={entry.channels} size={10} /></span>
                                <div className="cc-ag-main">
                                  <div className="cc-ag-title">{warn && <span className="cc-warn-dot" title={warn}>⚠ </span>}{entry.title}</div>
                                  <div className="cc-ag-sub">{entry.channels} · <span className="cc-format-tag">{fmt.text}</span> · 👤 {entry.assignedTo || '—'}</div>
                                </div>
                                <span className={`cc-ag-status st-${stage}`}>{stage === 'pub' ? '✓ Published' : stage === 'sched' ? 'Scheduled' : stage === 'edit' ? (entry.editingStatus || 'Editing') : 'Planned'}</span>
                                <span className="cc-ag-links">
                                  {CONTENT_LINK_FIELDS.map(f => { const href = toOpenableUrl(entry[f.key]); return href ? <a key={f.key} href={href} target="_blank" rel="noopener noreferrer" title={f.label} onClick={(e) => e.stopPropagation()}>{f.icon}</a> : null; })}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Day-expand popover — Notion-style "see everything scheduled this day"
              when a day has more entries than fit as compact chips in the cell. */}
          {expandedContentDay && (
            <div className="modal-overlay" onClick={() => setExpandedContentDay(null)}>
              <div className="modal-content compact" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h3>{new Date(contentCalYear, contentCalMonth, expandedContentDay.day).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</h3>
                  <button className="modal-close" onClick={() => setExpandedContentDay(null)}>✕</button>
                </div>
                <div className="modal-body compact-body">
                  {contentEntries
                    .filter(e => e.channelGroup === contentGroupTab && String(e.date).slice(0, 10) === expandedContentDay.dateStr)
                    .sort((a, b) => (a.time || '').localeCompare(b.time || ''))
                    .map(entry => {
                      const fmt = formatInfo(entry.contentType, entry.channels);
                      const videoInfo = VIDEO_STATUSES.find(s => s.value === entry.videoStatus) || VIDEO_STATUSES[0];
                      const editInfo = EDITING_STATUSES.find(s => s.value === entry.editingStatus) || EDITING_STATUSES[0];
                      const isPublished = entry.videoStatus === 'Published';
                      return (
                        <div
                          key={entry.id}
                          style={{ '--chip': blockColor(entry.contentType, entry.channels) }}
                          className={`cc-entry-card ${isPublished ? 'cc-posted' : ''}`}
                          onClick={() => { setExpandedContentDay(null); openEditContentEntry(entry); }}
                        >
                          <div className="cc-entry-title">
                            {isPublished && <span className="cc-tick">✓</span>}
                            {entry.time && <strong>{fmtClock12(entry.time)} — </strong>}{entry.title}
                          </div>
                          {platformMismatch(entry) && <div className="cc-form-warn">⚠ {platformMismatch(entry)}</div>}
                          <div className="cc-entry-badges">
                            <ChannelBadge channel={entry.channels} />
                            <span className="cc-badge" style={{ background: fmt.color + '1f', color: fmt.color }}>{fmt.icon} {fmt.text}</span>
                            <span className="cc-badge" style={{ background: editInfo.color + '1f', color: editInfo.color }}>✂️ {editInfo.value}</span>
                            <span className="cc-badge" style={{ background: videoInfo.color + '1f', color: videoInfo.color }}>{videoInfo.icon} {videoInfo.value}</span>
                            <span className="cc-badge cc-badge-people">👤 {entry.assignedTo}</span>
                          </div>
                          {CONTENT_LINK_FIELDS.some(f => toOpenableUrl(entry[f.key])) && (
                            <div className="cc-entry-links">
                              {CONTENT_LINK_FIELDS.map(f => {
                                const href = toOpenableUrl(entry[f.key]);
                                return href ? (
                                  <a key={f.key} className="cc-link-chip" href={href} target="_blank" rel="noopener noreferrer"
                                    title={href} onClick={(e) => e.stopPropagation()}>{f.icon} {f.label} ↗</a>
                                ) : null;
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  <button className="btn-success" style={{ marginTop: '10px' }} onClick={() => { const d = expandedContentDay.dateStr; setExpandedContentDay(null); openNewContentEntry(d); }}>+ Add another</button>
                </div>
              </div>
            </div>
          )}

          {showCcAccess && isAppAdmin && (
            <div className="modal-overlay" onClick={() => setShowCcAccess(false)}>
              <div className="modal-content compact" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h3><FiShield /> Who can open the Content Calendar</h3>
                  <button className="modal-close" onClick={() => setShowCcAccess(false)}>✕</button>
                </div>
                <div className="modal-body compact-body">
                  <p className="tm-hint">PC and Shivendra always have access. People switched off won't see the calendar icon — their linked tasks still appear on their task board as usual.</p>
                  <div className="access-list">
                    {activeTeam.filter(m => m.id !== 'pcwtc45' && m.id !== 'shivendrawtc77').map(m => {
                      const on = ccAccessDraft.includes(m.id);
                      return (
                        <label key={m.id} className={`access-row ${on ? 'on' : ''}`}>
                          <span className="chat-avatar">{m.avatar}</span>
                          <span className="access-name"><strong>{m.displayName}</strong><small>{m.role}</small></span>
                          <input type="checkbox" className="switch" checked={on}
                            onChange={() => setCcAccessDraft(prev => prev.includes(m.id) ? prev.filter(x => x !== m.id) : [...prev, m.id])} />
                        </label>
                      );
                    })}
                  </div>
                </div>
                <div className="modal-footer">
                  <button className="btn-secondary" onClick={() => setShowCcAccess(false)}>Cancel</button>
                  <button className="btn-success" onClick={saveCcAccess}>Save access</button>
                </div>
              </div>
            </div>
          )}

          {/* Manage Channels — PC/Shivendra/Pari: add, rename, move, set platform, remove. */}
          {showManageChannels && (
            <div className="modal-overlay" onClick={() => { setShowManageChannels(false); setEditingChannel(null); }}>
              <div className="modal-content compact" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h3><FiSettings /> Manage Channels</h3>
                  <button className="modal-close" onClick={() => { setShowManageChannels(false); setEditingChannel(null); }}>✕</button>
                </div>
                <div className="modal-body compact-body">
                  <div className="form-row-3">
                    <div className="form-group">
                      <label>Group</label>
                      <input type="text" list="cc-existing-groups" placeholder="e.g. Akshat Gupta" value={newChannelGroup} onChange={(e) => setNewChannelGroup(e.target.value)} />
                      <datalist id="cc-existing-groups">
                        {Object.keys(contentChannelGroups).map(g => <option key={g} value={g} />)}
                      </datalist>
                    </div>
                    <div className="form-group">
                      <label>Channel name</label>
                      <input type="text" placeholder="e.g. AG FB" value={newChannelName} onChange={(e) => setNewChannelName(e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label>Platform</label>
                      <select value={newChannelPlatform} onChange={(e) => setNewChannelPlatform(e.target.value)}>
                        <option value="">Automatic (from name)</option>
                        {Object.keys(PLATFORMS).map(k => <option key={k} value={k}>{PLATFORMS[k].label}</option>)}
                      </select>
                    </div>
                  </div>
                  <button className="btn-success" onClick={handleAddChannel}>+ Add Channel</button>
                  <p className="tm-hint" style={{ marginTop: 10 }}>Tap a channel to rename it, move it to another group or choose its platform. Calendar entries follow the new name automatically.</p>

                  <div className="cc-channel-manage-list">
                    {Object.keys(contentChannelGroups).map(group => (
                      <div key={group} className="cc-channel-manage-group">
                        <strong>{group}</strong>
                        <div className="cc-channel-manage-chips">
                          {(contentChannelGroups[group] || []).map(ch => (
                            <span key={ch} className={`cc-channel-manage-chip ${editingChannel && editingChannel.group === group && editingChannel.name === ch ? 'editing' : ''}`}>
                              <button className="cc-chan-edit" onClick={() => setEditingChannel({ group, name: ch, newName: ch, newGroup: group, platform: channelPlatforms[ch] || '' })} title="Edit channel">
                                <span className="pf-icon" style={{ background: PLATFORMS[platformOf(ch)].bg }}><PlatformIcon channel={ch} size={9} /></span>
                                {ch}
                              </button>
                              <button onClick={() => handleDeleteChannel(group, ch)} title="Remove">✕</button>
                            </span>
                          ))}
                        </div>
                        {editingChannel && editingChannel.group === group && (
                          <div className="cc-chan-editor">
                            <input type="text" value={editingChannel.newName} onChange={(e) => setEditingChannel({ ...editingChannel, newName: e.target.value })} placeholder="Channel name" />
                            <input type="text" list="cc-existing-groups" value={editingChannel.newGroup} onChange={(e) => setEditingChannel({ ...editingChannel, newGroup: e.target.value })} placeholder="Group" />
                            <select value={editingChannel.platform} onChange={(e) => setEditingChannel({ ...editingChannel, platform: e.target.value })}>
                              <option value="">Automatic ({PLATFORMS[platformOf(editingChannel.newName, true)].label})</option>
                              {Object.keys(PLATFORMS).map(k => <option key={k} value={k}>{PLATFORMS[k].label}</option>)}
                            </select>
                            <button className="btn-secondary" onClick={() => setEditingChannel(null)}>Cancel</button>
                            <button className="btn-success" onClick={saveChannelEdit}>Save</button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Entry editor — new or existing, nested modal on top */}
          {editingContentEntry !== null && (
            <div className="modal-overlay" onClick={(e) => { e.stopPropagation(); setEditingContentEntry(null); }}>
              <div className="modal-content compact" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h3>{editingContentEntry.id ? '✏️ Edit Content' : '➕ New Content'} — {contentGroupTab}</h3>
                  <button className="modal-close" onClick={() => setEditingContentEntry(null)}>✕</button>
                </div>
                <div className="modal-body compact-body">
                  <div className="form-row">
                    <div className="form-group">
                      <label>Channel</label>
                      <select value={contentForm.channels} onChange={(e) => setContentForm({ ...contentForm, channels: e.target.value })}>
                        {(contentChannelGroups[contentGroupTab] || []).map(ch => {
                          const lbl = PLATFORMS[platformOf(ch)].label;
                          return <option key={ch} value={ch}>{ch.toLowerCase().includes(lbl.split(' ')[0].toLowerCase()) ? ch : `${ch} · ${lbl}`}</option>;
                        })}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Content Type</label>
                      <select value={contentForm.contentType} onChange={(e) => setContentForm({ ...contentForm, contentType: e.target.value })}>
                        {CONTENT_FORMATS.map(t => <option key={t.value} value={t.value}>{t.icon} {t.label(platformOf(contentForm.channels))}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Title / Topic *</label>
                    <input type="text" value={contentForm.title} onChange={(e) => setContentForm({ ...contentForm, title: e.target.value })} placeholder="e.g. Rudra Avatar Part 3" />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Date *</label>
                      <input type="date" min="2025-01-01" max="2030-12-31" value={contentForm.date} onChange={(e) => setContentForm({ ...contentForm, date: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label>Time</label>
                      <TimePicker12 value={contentForm.time} onChange={(v) => setContentForm({ ...contentForm, time: v })} />
                    </div>
                    <div className="form-group">
                      <label>Priority</label>
                      <select value={contentForm.priority} onChange={(e) => setContentForm({ ...contentForm, priority: e.target.value })}>
                        <option>Low</option><option>Medium</option><option>High</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Assigned To * ({contentForm.assignedTo.length} selected)</label>
                    <div className="assignee-avatars-select">
                      {activeTeam.map(m => (
                        <div key={m.id} className={`avatar-select ${contentForm.assignedTo.includes(m.name) ? 'checked' : ''}`} onClick={() => toggleContentAssignee(m.name)} title={m.displayName}>
                          {m.avatar}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Editing Status</label>
                      <select value={contentForm.editingStatus} onChange={(e) => setContentForm({ ...contentForm, editingStatus: e.target.value })}>
                        {EDITING_STATUSES.map(s => <option key={s.value} value={s.value}>{s.icon} {s.value}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Video Status</label>
                      <select value={contentForm.videoStatus} onChange={(e) => setContentForm({ ...contentForm, videoStatus: e.target.value })}>
                        {VIDEO_STATUSES.map(s => <option key={s.value} value={s.value}>{s.icon} {s.value}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Raw Footage Link</label>
                      <LinkField value={contentForm.rawLink} onChange={(e) => setContentForm({ ...contentForm, rawLink: e.target.value })} placeholder="https://..." />
                    </div>
                    <div className="form-group">
                      <label>Draft/Editing Link</label>
                      <LinkField value={contentForm.draftLink} onChange={(e) => setContentForm({ ...contentForm, draftLink: e.target.value })} placeholder="https://..." />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Final Editing Link</label>
                      <LinkField value={contentForm.finalLink} onChange={(e) => setContentForm({ ...contentForm, finalLink: e.target.value })} placeholder="https://... (fully cut file, ready to publish)" />
                    </div>
                    <div className="form-group">
                      <label>Thumbnail Link</label>
                      <LinkField value={contentForm.thumbnailLink} onChange={(e) => setContentForm({ ...contentForm, thumbnailLink: e.target.value })} placeholder="https://..." />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Design Link</label>
                      <LinkField value={contentForm.designLink} onChange={(e) => setContentForm({ ...contentForm, designLink: e.target.value })} placeholder="https://... (Canva/Figma/PSD source, etc.)" />
                    </div>
                    <div className="form-group">
                      <label>Live Post Link <small className="label-hint">(after publishing)</small></label>
                      <LinkField value={contentForm.liveLink || ''} onChange={(e) => setContentForm({ ...contentForm, liveLink: e.target.value })} placeholder="https://instagram.com/... or youtube.com/..." />
                    </div>
                  </div>
                  {platformMismatch({ title: contentForm.title, channels: contentForm.channels }) && (
                    <p className="cc-form-warn">⚠ {platformMismatch({ title: contentForm.title, channels: contentForm.channels })} — check the Channel.</p>
                  )}

                  <div className="form-group">
                    <label>Description</label>
                    <textarea rows="2" className="notice-textarea" value={contentForm.description} onChange={(e) => setContentForm({ ...contentForm, description: e.target.value })} placeholder="Caption / description..." />
                  </div>

                  <div className="form-group">
                    <label>Notes / Script</label>
                    <textarea rows="3" className="notice-textarea" value={contentForm.notes} onChange={(e) => setContentForm({ ...contentForm, notes: e.target.value })} placeholder="Script, feedback, notes..." />
                  </div>

                  {!editingContentEntry.id && (
                    <p className="reminder-window-hint">This will automatically create a matching task on the board for whoever's assigned.</p>
                  )}
                </div>
                <div className="modal-footer">
                  {editingContentEntry.id && (
                    <button className="btn-secondary" onClick={handleDeleteContentEntry} style={{ color: 'var(--danger)' }}>🗑️ Delete</button>
                  )}
                  {editingContentEntry.id && (
                    <button className="btn-secondary" onClick={duplicateContentEntry} style={{ marginRight: 'auto' }} title="Copy this entry to another channel (e.g. the same reel on Facebook)">⧉ Copy to another channel</button>
                  )}
                  <button className="btn-secondary" onClick={() => setEditingContentEntry(null)}>Cancel</button>
                  <button className="btn-success" onClick={handleSaveContentEntry} disabled={contentSaving}>{contentSaving ? 'Saving...' : (editingContentEntry.id ? '💾 Save Changes' : '✅ Create Entry')}</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* NOTICE BOARD — everyone reads; only PC/Shivendra can post/pin/delete */}
      {showNoticeBoard && (
        <div className="modal-overlay" onClick={() => setShowNoticeBoard(false)}>
          <div className="modal-content compact" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>📋 Notice Board</h3>
              <button className="modal-close" onClick={() => setShowNoticeBoard(false)}>✕</button>
            </div>
            <div className="modal-body compact-body">
              {canManageTeam && (
                <div className="tm-form">
                  <div className="form-group">
                    <label>Title</label>
                    <input type="text" value={newNoticeTitle} onChange={(e) => setNewNoticeTitle(e.target.value)} placeholder="e.g. Office closed Friday" />
                  </div>
                  <div className="form-group">
                    <label>Message</label>
                    <textarea rows="4" value={newNoticeMessage} onChange={(e) => setNewNoticeMessage(e.target.value)} placeholder="Details... (line breaks are preserved)" className="notice-textarea" />
                  </div>
                  <div className="form-row" style={{ alignItems: 'center' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600, color: 'var(--gray-700)' }}>
                      <input type="checkbox" checked={newNoticePinned} onChange={(e) => setNewNoticePinned(e.target.checked)} style={{ width: 'auto' }} />
                      📌 Pin to top
                    </label>
                    <button className="btn-success" onClick={handlePostNotice} disabled={noticeSaving}>{noticeSaving ? 'Posting...' : '📤 Post Notice'}</button>
                  </div>
                </div>
              )}
              {notices.length === 0 ? (
                <p className="empty-text">No notices posted yet.</p>
              ) : (
                <div className="tm-list">
                  {notices.map(n => (
                    <div key={n.id} className={`notice-item ${n.pinned ? 'pinned' : ''}`}>
                      <div className="notice-item-header">
                        <strong>{n.pinned && '📌 '}{n.title}</strong>
                        {canManageTeam && <button className="notif-close" onClick={() => handleDeleteNotice(n.id)} title="Delete">✕</button>}
                      </div>
                      <p className="notice-item-msg">{n.message}</p>
                      <p className="inbox-time">By {n.postedBy} • {new Date(n.timestamp).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showSatOff && (
        <div className="modal-overlay" onClick={() => setShowSatOff(false)}>
          <div className="modal-content compact" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>🗓 Saturday off</h3>
              <button className="modal-close" onClick={() => setShowSatOff(false)}>✕</button>
            </div>
            <div className="modal-body compact-body">
              <p className="tm-hint">You can take one Saturday off every month. Pick it here — HR sees it right away.</p>
              <div className="sat-grid">
                {upcomingSaturdays().map(d => {
                  const mine = myLeaves.find(l => l.date === d && l.type === 'Saturday Off');
                  const monthUsed = myLeaves.find(l => l.type === 'Saturday Off' && l.date.slice(0, 7) === d.slice(0, 7));
                  const otherLeave = myLeaves.find(l => l.date === d && l.type !== 'Saturday Off');
                  return (
                    <div key={d} className={`sat-day ${mine ? 'mine' : ''} ${!mine && monthUsed ? 'used' : ''}`}>
                      <strong>{new Date(d + 'T12:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</strong>
                      {mine ? <button className="btn-ghost" onClick={() => cancelMySaturday(mine)}>✓ Booked · cancel</button>
                        : otherLeave ? <span className="sat-note">{otherLeave.type}</span>
                        : monthUsed ? <span className="sat-note">Used this month</span>
                        : <button className="btn-success" onClick={() => takeSaturdayOff(d)}>Take off</button>}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TARGETS */}
      {showTargets && (
        <div className="modal-overlay" onClick={() => { setShowTargets(false); setTargetForm(null); }}>
          <div className="modal-content targets-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3><FiTarget /> Targets</h3>
              <button className="btn-success tg-new" onClick={openNewTarget}><FiPlus /> {canAssignTargets ? 'Set / assign target' : 'Set my target'}</button>
              <button className="modal-close" onClick={() => { setShowTargets(false); setTargetForm(null); }}>✕</button>
            </div>
            <div className="modal-body compact-body">
              {targetForm ? (
                <div className="tg-form">
                  <h4>{targetForm.id ? 'Edit target' : 'New target'}</h4>
                  {canAssignTargets && !targetForm.id && (
                    <div className="form-group">
                      <label>For ({targetForm.ownerIds.length} selected)</label>
                      <div className="assignee-avatars-select">
                        {activeTeam.map(m => (
                          <div key={m.id} title={m.displayName}
                            className={`avatar-select ${targetForm.ownerIds.includes(m.id) ? 'checked' : ''}`}
                            onClick={() => setTargetForm(f => ({ ...f, ownerIds: f.ownerIds.includes(m.id) ? f.ownerIds.filter(x => x !== m.id) : [...f.ownerIds, m.id] }))}>
                            {m.avatar}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="form-group">
                    <label>Target *</label>
                    <input type="text" placeholder="e.g. Publish reels on AG Insta" value={targetForm.title} onChange={(e) => setTargetForm({ ...targetForm, title: e.target.value })} />
                  </div>
                  <div className="form-row-3">
                    <div className="form-group">
                      <label>How many *</label>
                      <input type="number" min="1" placeholder="30" value={targetForm.target} onChange={(e) => setTargetForm({ ...targetForm, target: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label>Unit</label>
                      <select value={targetForm.unit} onChange={(e) => setTargetForm({ ...targetForm, unit: e.target.value })}>
                        {TARGET_UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Period</label>
                      <select value={targetForm.period} onChange={(e) => { const r = periodRange(e.target.value); setTargetForm({ ...targetForm, period: e.target.value, ...(r || {}) }); }}>
                        {['Daily', 'Weekly', 'Monthly', 'Quarterly', 'Custom'].map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group"><label>Start</label><input type="date" value={targetForm.start} onChange={(e) => setTargetForm({ ...targetForm, start: e.target.value, period: 'Custom' })} /></div>
                    <div className="form-group"><label>Due</label><input type="date" value={targetForm.due} onChange={(e) => setTargetForm({ ...targetForm, due: e.target.value, period: 'Custom' })} /></div>
                  </div>
                  <div className="form-group">
                    <label>Details / how it is measured</label>
                    <textarea rows="2" className="notice-textarea" value={targetForm.details} onChange={(e) => setTargetForm({ ...targetForm, details: e.target.value })} placeholder="Optional" />
                  </div>
                  <div className="tg-form-actions">
                    <button className="btn-secondary" onClick={() => setTargetForm(null)}>Cancel</button>
                    <button className="btn-success" onClick={saveTargetForm}>{targetForm.id ? 'Save changes' : 'Save target'}</button>
                  </div>
                </div>
              ) : (() => {
                const views = [{ k: 'mine', label: 'My targets' }];
                if (canAssignTargets || targets.some(t => t.assignedById === currentUser && t.ownerId !== currentUser)) views.push({ k: 'assigned', label: 'Assigned by me' });
                if (targetsCanSeeAll) views.push({ k: 'all', label: 'Whole team' });
                let list = targets.filter(t => targetView === 'mine' ? t.ownerId === currentUser
                  : targetView === 'assigned' ? (t.assignedById === currentUser && t.ownerId !== currentUser) : true);
                if (targetView !== 'mine' && targetPersonFilter !== 'all') list = list.filter(t => t.ownerId === targetPersonFilter);
                const rank = { behind: 0, over: 1, ok: 2, done: 3 };
                list = list.slice().sort((a, b) => (rank[targetHealth(a).key] - rank[targetHealth(b).key]) || String(a.due).localeCompare(String(b.due)));
                const people = Array.from(new Set(targets.filter(t => targetView === 'all' || t.assignedById === currentUser).map(t => t.ownerId)));
                const sum = { total: list.length, done: list.filter(t => targetHealth(t).key === 'done').length, behind: list.filter(t => ['behind', 'over'].includes(targetHealth(t).key)).length };
                return (
                  <>
                    <div className="disc-tabs">
                      {views.map(v => <button key={v.k} className={targetView === v.k ? 'active' : ''} onClick={() => { setTargetView(v.k); setTargetPersonFilter('all'); }}>{v.label}</button>)}
                      {targetView !== 'mine' && people.length > 1 && (
                        <select className="tg-person" value={targetPersonFilter} onChange={(e) => setTargetPersonFilter(e.target.value)}>
                          <option value="all">Everyone</option>
                          {people.map(pid => <option key={pid} value={pid}>{team.find(m => m.id === pid)?.displayName || pid}</option>)}
                        </select>
                      )}
                    </div>
                    <div className="disc-summary tg-summary">
                      <div><strong>{sum.total}</strong><span>Targets</span></div>
                      <div className="ok"><strong>{sum.done}</strong><span>Achieved</span></div>
                      <div className={sum.behind ? 'bad' : 'ok'}><strong>{sum.behind}</strong><span>Behind / overdue</span></div>
                      <div><strong>{sum.total ? Math.round(list.reduce((n, t) => n + Math.min(1, t.achieved / (t.target || 1)), 0) / sum.total * 100) : 0}%</strong><span>Overall progress</span></div>
                    </div>
                    {list.length === 0 ? (
                      <div className="inbox-empty"><div className="inbox-empty-icon"><FiTarget /></div><p>No targets here yet</p><span>Press “{canAssignTargets ? 'Set / assign target' : 'Set my target'}” to add one.</span></div>
                    ) : (
                      <div className="tg-list">
                        {list.map(t => {
                          const h = targetHealth(t);
                          const pct = Math.min(100, Math.round((t.achieved / (t.target || 1)) * 100));
                          const canUpdate = t.ownerId === currentUser || t.assignedById === currentUser || isAppAdmin;
                          const canEditT = t.assignedById === currentUser || isAppAdmin;
                          const d = progressDraft[t.id];
                          const owner = team.find(m => m.id === t.ownerId);
                          return (
                            <div key={t.id} className={`tg-card tg-${h.key}`}>
                              <div className="tg-top">
                                {targetView !== 'mine' && <span className="mini-avatar tg-avatar" title={t.owner}>{owner?.avatar || String(t.owner || '?').slice(0, 2)}</span>}
                                <div className="tg-title">
                                  <strong>{t.title}</strong>
                                  <span>{t.period} · {formatNiceDate(t.start)} – {formatNiceDate(t.due)}{t.assignedById !== t.ownerId ? ` · set by ${t.assignedBy}` : ''}{targetView !== 'mine' ? ` · for ${t.owner}` : ''}</span>
                                </div>
                                <span className={`tg-health tg-h-${h.key}`}>{h.label}{h.daysLeft !== undefined && h.key !== 'done' ? ` · ${h.daysLeft}d left` : ''}</span>
                              </div>
                              {t.details && <p className="tg-details">{t.details}</p>}
                              <div className="tg-progress">
                                <div className="tg-bar"><div style={{ width: pct + '%' }}></div></div>
                                <span className="tg-num"><strong>{t.achieved}</strong> / {t.target} {t.unit} · {pct}%</span>
                              </div>
                              <div className="tg-actions">
                                {canUpdate && (d ? (
                                  <>
                                    <input type="number" min="0" className="tg-input" value={d.value} onChange={(e) => setProgressDraft(p => ({ ...p, [t.id]: { ...d, value: e.target.value } }))} />
                                    <input type="text" className="tg-note" placeholder="Note (optional)" value={d.note} onChange={(e) => setProgressDraft(p => ({ ...p, [t.id]: { ...d, note: e.target.value } }))} />
                                    <button className="btn-success" onClick={() => saveProgress(t)}>Save</button>
                                    <button className="btn-secondary" onClick={() => setProgressDraft(p => { const n = { ...p }; delete n[t.id]; return n; })}>Cancel</button>
                                  </>
                                ) : (
                                  <button className="btn-ghost" onClick={() => setProgressDraft(p => ({ ...p, [t.id]: { value: String(t.achieved), note: '' } }))}>Update progress</button>
                                ))}
                                {(t.log || []).length > 0 && <button className="btn-ghost" onClick={() => setTargetHistoryOpen(targetHistoryOpen === t.id ? null : t.id)}>History ({t.log.length})</button>}
                                {canEditT && <button className="btn-ghost" onClick={() => setTargetForm({ id: t.id, title: t.title, details: t.details || '', ownerIds: [t.ownerId], period: t.period, start: t.start, due: t.due, target: t.target, unit: t.unit })}><FiEdit2 /> Edit</button>}
                                {canEditT && <button className="btn-ghost tg-del" onClick={() => removeTarget(t)}><FiTrash2 /></button>}
                              </div>
                              {targetHistoryOpen === t.id && (
                                <ul className="tg-history">
                                  {[...(t.log || [])].reverse().map((l, i) => <li key={i}><strong>{l.value}</strong> {t.unit} · {l.by} · {timeAgo(l.at)}{l.note ? ` — ${l.note}` : ''}</li>)}
                                </ul>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* ATTENDANCE RECORD & DISCIPLINE — my flags (with correction requests); for
          HR/PC/Shivendra also the team summary, pending requests and shifts. */}
      {showDiscipline && (
        <div className="modal-overlay" onClick={() => setShowDiscipline(false)}>
          <div className="modal-content discipline-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3><FiShield /> Attendance record</h3>
              <button className="modal-close" onClick={() => setShowDiscipline(false)}>✕</button>
            </div>
            <div className="modal-body compact-body">
              <div className="disc-tabs">
                {(!isAdmin || isHR) && <button className={disciplineTab === 'mine' ? 'active' : ''} onClick={() => { setDisciplineTab('mine'); loadDiscipline('mine'); }}>My record</button>}
                {canManageAttendance && <button className={disciplineTab === 'team' ? 'active' : ''} onClick={() => { setDisciplineTab('team'); loadDiscipline('team'); }}>Team {disciplineData.team?.requests?.length ? <span className="tab-badge">{disciplineData.team.requests.length}</span> : null}</button>}
                {canManageAttendance && <button className={disciplineTab === 'day' ? 'active' : ''} onClick={() => { setDisciplineTab('day'); if (!review) loadReview(); }}>Day view</button>}
                {canManageAttendance && <button className={disciplineTab === 'month' ? 'active' : ''} onClick={() => { setDisciplineTab('month'); if (!review) loadReview(); }}>Month sheet</button>}
                {canManageAttendance && <button className={disciplineTab === 'leaves' ? 'active' : ''} onClick={() => { setDisciplineTab('leaves'); if (!review) loadReview(); }}>Leaves</button>}
                {canManageAttendance && <button className={disciplineTab === 'salary' ? 'active' : ''} onClick={() => { setDisciplineTab('salary'); if (!review) loadReview(); }}>Salary summary</button>}
              </div>

              {(disciplineTab === 'mine' || disciplineTab === 'team') && <div className="disc-rules">
                <strong>Rules</strong>
                <span>Sign in 9:00–10:14 → sign out 9h15m later (before 9 → 6 PM)</span>
                <span>10:15–11:00 → ¼ day cut · after 11 → ½ day cut</span>
                <span>Lunch {fmtClock(attRules.lunchStart)}–{fmtClock(attRules.lunchEnd)}, {attRules.lunchMinutes} min, once</span>
                <span>No lunch marked → 30 min deducted</span>
                <span>Left before sign-out time · forgot sign-out</span>
                <span>Sunday week off · 1 Saturday off a month</span>
                <span className="disc-rule-key">Each = 1 strike · every {attRules.strikesPerHalfDay} strikes in a month = ½ day deduction</span>
              </div>}

              {disciplineTab !== 'shifts' && disciplineTab !== 'day' && (
                <div className="month-nav">
                  <button className="btn-secondary" onClick={() => changeDiscMonth(-1)}>← Prev</button>
                  <strong>{new Date(discYear, discMonth - 1, 1).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</strong>
                  <button className="btn-secondary" onClick={() => changeDiscMonth(1)}>Next →</button>
                </div>
              )}
              {(disciplineLoading || reviewLoading) && <p className="empty-text">Loading…</p>}

              {disciplineTab === 'mine' && disciplineData.mine && (() => {
                const sum = disciplineData.mine.summary?.[currentUser] || { strikes: 0, halfDays: 0, excused: 0, pending: 0 };
                const flags = disciplineData.mine.flags || [];
                return (
                  <>
                    <div className="disc-summary">
                      <div className={sum.strikes >= attRules.strikesPerHalfDay ? 'bad' : sum.strikes ? 'warn' : 'ok'}><strong>{sum.strikes}</strong><span>Strikes</span></div>
                      <div className={sum.halfDays ? 'bad' : 'ok'}><strong>{sum.halfDays}</strong><span>Days deducted</span></div>
                      <div><strong>{sum.pending}</strong><span>Waiting for HR</span></div>
                      <div className="ok"><strong>{sum.excused}</strong><span>Excused</span></div>
                    </div>
                    {sum.strikes > 0 && sum.strikes % attRules.strikesPerHalfDay !== 0 && (
                      <p className="disc-next">{attRules.strikesPerHalfDay - (sum.strikes % attRules.strikesPerHalfDay)} more strike(s) this month = another ½ day deduction.</p>
                    )}
                    {flags.length === 0 ? (
                      <div className="inbox-empty"><div className="inbox-empty-icon"><FiCheckCircle /></div><p>Clean record this month 🎉</p></div>
                    ) : (
                      <div className="flag-list">
                        {flags.slice().sort((a, b) => b.date.localeCompare(a.date)).map(f => (
                          <div key={f.id} className={`flag-row flag-${String(f.status).toLowerCase()}`}>
                            <div className="flag-main">
                              <div className="flag-top"><strong>{f.label}</strong><span className="flag-date">{new Date(f.date + 'T12:00:00').toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}</span><span className={`flag-status st-${String(f.status).toLowerCase()}`}>{f.status === 'Open' ? 'Strike' : f.status === 'Requested' ? 'Waiting for HR' : f.status}</span></div>
                              <div className="flag-detail">{f.detail}</div>
                              {f.note && <div className="flag-note">Your reason: {f.note}{f.correctedTime ? ` · actual time ${fmtClock(f.correctedTime)}` : ''}</div>}
                            </div>
                            {(f.status === 'Open') && (
                              correctionDraft && String(correctionDraft.flagId) === String(f.id) ? (
                                <div className="flag-form">
                                  <textarea rows="2" placeholder="Reason (e.g. client call ran late, forgot to tap sign-out…)" value={correctionDraft.note} onChange={(e) => setCorrectionDraft({ ...correctionDraft, note: e.target.value })} />
                                  {f.type === 'MISSED_SIGNOUT' && (
                                    <label className="flag-time">Actual leaving time <TimePicker12 value={correctionDraft.correctedTime} onChange={(v) => setCorrectionDraft({ ...correctionDraft, correctedTime: v })} /></label>
                                  )}
                                  <div className="flag-form-actions">
                                    <button className="btn-secondary" onClick={() => setCorrectionDraft(null)}>Cancel</button>
                                    <button className="btn-success" onClick={submitCorrection}>Send to HR</button>
                                  </div>
                                </div>
                              ) : (
                                <button className="btn-ghost" onClick={() => setCorrectionDraft({ flagId: f.id, note: '', correctedTime: '' })}>Request correction</button>
                              )
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                );
              })()}

              {disciplineTab === 'team' && canManageAttendance && disciplineData.team && (() => {
                const team = disciplineData.team;
                const rows = activeTeam.filter(m => !m.isAdmin && !NO_ATTENDANCE_IDS.includes(m.id)).map(m => ({ m, s: team.summary?.[m.id] || { strikes: 0, halfDays: 0, excused: 0, pending: 0, byType: {} } }))
                  .sort((a, b) => b.s.strikes - a.s.strikes);
                return (
                  <>
                    {(team.requests || []).length > 0 && (
                      <div className="disc-requests">
                        <h4>Correction requests ({team.requests.length})</h4>
                        {team.requests.map(f => (
                          <div key={f.id} className="flag-row flag-requested">
                            <div className="flag-main">
                              <div className="flag-top"><strong>{f.name}</strong><span>{f.label}</span><span className="flag-date">{new Date(f.date + 'T12:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span></div>
                              <div className="flag-detail">{f.detail}</div>
                              <div className="flag-note">Reason: {f.note}{f.correctedTime ? ` · says they left at ${fmtClock(f.correctedTime)}` : ''}</div>
                            </div>
                            {f.userId === currentUser ? <span className="flag-own">Another manager decides</span> : (
                              <div className="flag-decide">
                                <button className="btn-success" onClick={() => decideFlag(f, 'Excused')}>Excuse</button>
                                <button className="btn-secondary" onClick={() => decideFlag(f, 'Rejected')}>Reject</button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="disc-table-wrap">
                      <table className="monthly-table disc-table">
                        <thead><tr><th>Person</th><th>¼ day late</th><th>½ day late</th><th>Long lunch</th><th>No lunch</th><th>No sign-out</th><th>Left early</th><th>Strikes</th><th>Deduction</th></tr></thead>
                        <tbody>
                          {rows.map(({ m, s: sm }) => (
                            <tr key={m.id} className={sm.halfDays ? 'row-bad' : ''}>
                              <td><strong>{m.displayName}</strong></td>
                              <td>{sm.byType?.LATE_QUARTER || 0}</td>
                              <td>{sm.byType?.LATE_HALF || 0}</td>
                              <td>{sm.byType?.LONG_LUNCH || 0}</td>
                              <td>{sm.byType?.LUNCH_NOT_MARKED || 0}</td>
                              <td>{sm.byType?.MISSED_SIGNOUT || 0}</td>
                              <td>{sm.byType?.EARLY_SIGNOUT || 0}</td>
                              <td><strong>{sm.strikes}</strong>{sm.excused ? <small> (+{sm.excused} excused)</small> : null}</td>
                              <td>{sm.halfDays ? `${sm.halfDays} day` : '—'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="flag-list">
                      {(team.flags || []).slice().sort((a, b) => b.date.localeCompare(a.date)).map(f => (
                        <div key={f.id} className={`flag-row flag-${String(f.status).toLowerCase()}`}>
                          <div className="flag-main">
                            <div className="flag-top"><strong>{f.name}</strong><span>{f.label}</span><span className="flag-date">{new Date(f.date + 'T12:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span><span className={`flag-status st-${String(f.status).toLowerCase()}`}>{f.status === 'Open' ? 'Strike' : f.status}</span></div>
                            <div className="flag-detail">{f.detail}</div>
                          </div>
                          {f.status !== 'Excused' && f.userId !== currentUser && (
                            <button className="btn-ghost" onClick={() => decideFlag(f, 'Excused')}>Excuse</button>
                          )}
                        </div>
                      ))}
                    </div>
                  </>
                );
              })()}

              {disciplineTab === 'day' && canManageAttendance && (() => {
                const [yy, mm] = reviewDay.split('-').map(Number);
                const sameMonth = review && review.year === yy && review.month === mm;
                const rows = sameMonth ? review.people.map(p => ({ p, d: p.days.find(x => x.date === reviewDay) })).filter(r => r.d) : [];
                const codeLabel = { P: 'Present', A: 'Absent', LV: 'Leave', HD: 'Half day', WFH: 'Work from home', OFF: 'Week off', HOL: 'Holiday', FUT: '—', NS: 'Not signed in', X: 'Extra day', SO: 'Saturday off', PRE: 'Before tracking' };
                const count = (c) => rows.filter(r => r.d.code === c).length;
                return (
                  <>
                    <div className="rv-daybar">
                      <button className="btn-secondary" onClick={() => { const d = new Date(reviewDay + 'T12:00:00'); d.setDate(d.getDate() - 1); const k = d.toISOString().slice(0, 10); setReviewDay(k); const [y2, m2] = k.split('-').map(Number); if (!review || review.month !== m2 || review.year !== y2) { setDiscYear(y2); setDiscMonth(m2); loadReview(y2, m2); } }}>← Day</button>
                      <input type="date" value={reviewDay} onChange={(e) => { const k = e.target.value; if (!k) return; setReviewDay(k); const [y2, m2] = k.split('-').map(Number); if (!review || review.month !== m2 || review.year !== y2) { setDiscYear(y2); setDiscMonth(m2); loadReview(y2, m2); } }} />
                      <button className="btn-secondary" onClick={() => { const d = new Date(reviewDay + 'T12:00:00'); d.setDate(d.getDate() + 1); const k = d.toISOString().slice(0, 10); setReviewDay(k); const [y2, m2] = k.split('-').map(Number); if (!review || review.month !== m2 || review.year !== y2) { setDiscYear(y2); setDiscMonth(m2); loadReview(y2, m2); } }}>Day →</button>
                      <strong className="rv-dayname">{new Date(reviewDay + 'T12:00:00').toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</strong>
                    </div>
                    {sameMonth && (
                      <div className="disc-summary">
                        <div className="ok"><strong>{count('P') + count('WFH')}</strong><span>Present</span></div>
                        <div className={count('A') ? 'bad' : 'ok'}><strong>{count('A')}</strong><span>Absent</span></div>
                        <div><strong>{count('LV') + count('HD')}</strong><span>On leave</span></div>
                        <div className={rows.reduce((n, r) => n + r.d.flags.filter(f => f.status !== 'Excused').length, 0) ? 'warn' : 'ok'}><strong>{rows.reduce((n, r) => n + r.d.flags.filter(f => f.status !== 'Excused').length, 0)}</strong><span>Flags</span></div>
                      </div>
                    )}
                    <div className="disc-table-wrap">
                      <table className="monthly-table disc-table rv-day-table">
                        <thead><tr><th>Person</th><th>Status</th><th>In</th><th>Should leave</th><th>Out</th><th>Worked</th><th>Lunch</th><th>Flags</th></tr></thead>
                        <tbody>
                          {rows.map(({ p, d }) => (
                            <tr key={p.userId} className={`rv-row-${d.code}`}>
                              <td><strong>{team.find(m => m.id === p.userId)?.displayName || p.name}</strong></td>
                              <td><span className={`rv-code rv-${d.code}`}>{d.leave || codeLabel[d.code] || d.code}</span></td>
                              <td>{d.inAt ? fmtClock(d.inAt) : '—'}</td>
                              <td>{d.requiredOut ? fmtClock(d.requiredOut) : '—'}</td>
                              <td className={d.outAt && d.requiredOut && d.outAt < d.requiredOut ? 'rv-bad' : ''}>{d.outAt ? fmtClock(d.outAt) : (d.inAt ? 'not signed out' : '—')}</td>
                              <td>{fmtMin(d.workedMin)}</td>
                              <td className={d.lunchMin > attRules.lunchMinutes + attRules.lunchTolerance ? 'rv-bad' : ''}>{d.lunchMin ? `${d.lunchMin}m` : '—'}</td>
                              <td className="rv-flags">{d.flags.length ? d.flags.map((f, i) => <span key={i} className={`warn-chip ${f.status === 'Excused' ? 'ok' : 'bad'}`} title={f.detail}>{({ LATE: 'Late', LATE_QUARTER: '¼ day late', LATE_HALF: '½ day late', EARLY_SIGNOUT: 'Left early', LONG_LUNCH: 'Long lunch', LUNCH_NOT_MARKED: 'No lunch', MISSED_SIGNOUT: 'No sign-out', SHORT_HOURS: 'Short hrs' })[f.type] || f.type}</span>) : '—'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                );
              })()}

              {disciplineTab === 'month' && canManageAttendance && review && (
                <>
                  <div className="rv-legend">
                    <span className="rv-code rv-P">P</span> Present <span className="rv-code rv-A">A</span> Absent <span className="rv-code rv-LV">L</span> Leave <span className="rv-code rv-HD">½</span> Half day <span className="rv-code rv-WFH">W</span> WFH <span className="rv-code rv-SO">S</span> Saturday off <span className="rv-code rv-X">+</span> Extra day (Sunday/holiday work) <span className="rv-code rv-OFF">·</span> Week off/holiday <span className="rv-dot-flag"></span> flag — tap a cell for details
                  </div>
                  <div className="rv-grid-wrap">
                    <table className="rv-grid">
                      <thead>
                        <tr><th className="rv-name-col">Person</th>{review.people[0]?.days.map(d => <th key={d.date} className={['OFF', 'HOL'].includes(d.code) ? 'rv-off' : ''}>{Number(d.date.slice(8))}<small>{'SMTWTFS'[new Date(d.date + 'T12:00:00').getDay()]}</small></th>)}<th>P</th><th>A</th><th>L</th></tr>
                      </thead>
                      <tbody>
                        {review.people.map(p => (
                          <tr key={p.userId}>
                            <td className="rv-name-col">{team.find(m => m.id === p.userId)?.displayName || p.name}</td>
                            {p.days.map(d => {
                              const short = { P: 'P', A: 'A', LV: 'L', HD: '½', WFH: 'W', OFF: '·', HOL: '·', FUT: '', NS: '?', X: '+', SO: 'S', PRE: '' }[d.code];
                              const bad = d.flags.some(f => f.status !== 'Excused');
                              return (
                                <td key={d.date} className={`rv-cell rv-${d.code}`} onClick={() => setReviewCell({ p, d })} title={`${d.date} · ${d.leave || d.code}${d.inAt ? ` · in ${d.inAt}` : ''}${d.outAt ? ` · out ${d.outAt}` : ''}`}>
                                  {short}{bad && <span className="rv-dot-flag"></span>}
                                </td>
                              );
                            })}
                            <td className="rv-tot">{p.totals.present}</td><td className="rv-tot rv-tot-a">{p.totals.absent}</td><td className="rv-tot">{p.totals.leaveDays + p.totals.halfDays * 0.5}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {reviewCell && (
                    <div className="rv-cell-detail">
                      <div className="rv-cell-head">
                        <strong>{reviewCell.p.name}</strong> · {new Date(reviewCell.d.date + 'T12:00:00').toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                        <button className="btn-ghost" onClick={() => setReviewCell(null)}>Close</button>
                      </div>
                      <p>{reviewCell.d.leave ? `🌴 ${reviewCell.d.leave}` : ''} In {reviewCell.d.inAt ? fmtClock(reviewCell.d.inAt) : '—'} · Out {reviewCell.d.outAt ? fmtClock(reviewCell.d.outAt) : '—'} · Worked {fmtMin(reviewCell.d.workedMin)} · Lunch {reviewCell.d.lunchMin ? reviewCell.d.lunchMin + 'm' : '—'}</p>
                      {reviewCell.d.flags.map((f, i) => <p key={i} className="flag-detail">• {f.detail} ({f.status === 'Open' ? 'strike' : f.status})</p>)}
                      {!['OFF', 'HOL'].includes(reviewCell.d.code) && (
                        <button className="btn-ghost" onClick={() => { setLeaveForm({ userIds: [reviewCell.p.userId], from: reviewCell.d.date, to: reviewCell.d.date, type: 'Casual Leave', note: '' }); setDisciplineTab('leaves'); setReviewCell(null); }}>🌴 Mark leave for this day</button>
                      )}
                    </div>
                  )}
                </>
              )}

              {disciplineTab === 'leaves' && canManageAttendance && (
                <>
                  <div className="leave-form">
                    <h4>🌴 Mark leave</h4>
                    <div className="form-group">
                      <label>Who ({leaveForm.userIds.length} selected)</label>
                      <div className="assignee-avatars-select">
                        {activeTeam.filter(m => !m.isAdmin && !NO_ATTENDANCE_IDS.includes(m.id)).map(m => (
                          <div key={m.id} title={m.displayName} className={`avatar-select ${leaveForm.userIds.includes(m.id) ? 'checked' : ''}`}
                            onClick={() => setLeaveForm(f => ({ ...f, userIds: f.userIds.includes(m.id) ? f.userIds.filter(x => x !== m.id) : [...f.userIds, m.id] }))}>{m.avatar}</div>
                        ))}
                      </div>
                    </div>
                    <div className="form-row-3">
                      <div className="form-group"><label>From</label><input type="date" value={leaveForm.from} onChange={(e) => setLeaveForm({ ...leaveForm, from: e.target.value })} /></div>
                      <div className="form-group"><label>To (optional)</label><input type="date" value={leaveForm.to} onChange={(e) => setLeaveForm({ ...leaveForm, to: e.target.value })} /></div>
                      <div className="form-group"><label>Type</label>
                        <select value={leaveForm.type} onChange={(e) => setLeaveForm({ ...leaveForm, type: e.target.value })}>{LEAVE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}</select>
                      </div>
                    </div>
                    <div className="form-group"><label>Note</label><input type="text" placeholder="Reason / approval (optional)" value={leaveForm.note} onChange={(e) => setLeaveForm({ ...leaveForm, note: e.target.value })} /></div>
                    <p className="tm-hint">Sundays and holidays are skipped. On leave days nobody gets attendance flags or reminders, and flags already given that day are excused. Half Day removes late / short-hours / lunch flags only.</p>
                    <button className="btn-success" onClick={submitLeave}>Mark leave</button>
                  </div>
                  <h4 className="rv-subhead">Leaves in {new Date(discYear, discMonth - 1, 1).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</h4>
                  {review && review.leaves.length ? (
                    <div className="flag-list">
                      {review.leaves.slice().sort((a, b) => b.date.localeCompare(a.date)).map(l => (
                        <div key={l.id} className={`flag-row leave-row ${l.status === 'Cancelled' ? 'flag-rejected' : 'flag-excused'}`}>
                          <div className="flag-main">
                            <div className="flag-top"><strong>{l.name}</strong><span>{l.type}</span><span className="flag-date">{new Date(l.date + 'T12:00:00').toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}</span>{l.status === 'Cancelled' && <span className="flag-status st-rejected">Cancelled</span>}</div>
                            <div className="flag-detail">{l.note || '—'} · marked by {l.markedBy}</div>
                          </div>
                          {l.status !== 'Cancelled' && <button className="btn-ghost" onClick={() => cancelLeaveRow(l)}>Cancel</button>}
                        </div>
                      ))}
                    </div>
                  ) : <p className="empty-text">No leaves marked this month.</p>}
                </>
              )}

              {disciplineTab === 'salary' && canManageAttendance && review && (
                <>
                  <div className="rv-salary-head">
                    <p className="tm-hint">Counting starts fresh from {review.reportStart ? new Date(review.reportStart + 'T12:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'the start date'}, up to today. “Suggested deduction” = absent + unpaid leave + ½ per half-day leave + late cuts (¼ / ½) + strike deductions. Extra days (Sunday/holiday work) are shown separately. Check before using for salary.</p>
                    <button className="btn-success" onClick={downloadSalaryCsv}><FiDownload /> Download (Excel/CSV)</button>
                  </div>
                  <div className="disc-table-wrap">
                    <table className="monthly-table disc-table">
                      <thead><tr><th>Person</th><th>Working days</th><th>Present</th><th>Absent</th><th>Leave</th><th>Sat off</th><th>Extra days</th><th>Late cut</th><th>Strikes</th><th>Avg hours</th><th>Suggested deduction</th></tr></thead>
                      <tbody>
                        {review.people.map(p => (
                          <tr key={p.userId} className={p.totals.deductionDays ? 'row-bad' : ''}>
                            <td><strong>{team.find(m => m.id === p.userId)?.displayName || p.name}</strong></td>
                            <td>{p.totals.workingDays}</td><td>{p.totals.present}</td><td>{p.totals.absent}</td><td>{p.totals.paidLeave + p.totals.unpaidLeave + p.totals.halfDays * 0.5}</td>
                            <td>{p.totals.saturdayOff || 0}</td><td className={p.totals.extraDays ? 'rv-good' : ''}>{p.totals.extraDays || 0}</td><td>{p.totals.lateCut ? `${p.totals.lateCut} day` : '—'}</td><td>{p.totals.strikes}</td>
                            <td>{fmtMin(p.totals.avgWorkedMin)}</td><td><strong>{p.totals.deductionDays ? `${p.totals.deductionDays} day` : '—'}</strong></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}

              {disciplineTab === 'shifts' && canManageAttendance && (
                <div className="shift-list">
                  <p className="tm-hint">Each person's office hours. Late marks and the "forgot to sign out" closing time use these. First set automatically from everyone's real sign-in times.</p>
                  {activeTeam.filter(m => !m.isAdmin).map(m => {
                    const cur = shiftOf(m.id);
                    const d = shiftDrafts[m.id];
                    return (
                      <div key={m.id} className="shift-row">
                        <span className="chat-avatar">{m.avatar}</span>
                        <strong className="shift-name">{m.displayName}</strong>
                        <input type="time" value={d ? d.start : cur.start} onChange={(e) => setShiftDrafts(prev => ({ ...prev, [m.id]: { start: e.target.value, end: (prev[m.id] || cur).end } }))} />
                        <span>to</span>
                        <input type="time" value={d ? d.end : cur.end} onChange={(e) => setShiftDrafts(prev => ({ ...prev, [m.id]: { start: (prev[m.id] || cur).start, end: e.target.value } }))} />
                        <button className="btn-success" disabled={!d} onClick={() => saveShiftFor(m)}>Save</button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Monthly Attendance — available to everyone who has the personal attendance card */}
      {showMonthlyAttendance && (
        <div className="modal-overlay" onClick={() => setShowMonthlyAttendance(false)}>
          <div className="modal-content compact" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>📅 My Monthly Attendance</h3>
              <button className="modal-close" onClick={() => setShowMonthlyAttendance(false)}>✕</button>
            </div>
            <div className="modal-body compact-body">
              <div className="month-nav">
                <button className="btn-secondary" onClick={() => changeMonthlyMonth(-1)}>← Prev</button>
                <strong>{new Date(monthlyYear, monthlyMonth - 1, 1).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</strong>
                <button className="btn-secondary" onClick={() => changeMonthlyMonth(1)}>Next →</button>
              </div>
              {monthlyLoading ? (
                <p className="empty-text">Loading...</p>
              ) : (
                <div className="monthly-table-wrap">
                  <table className="monthly-table">
                    <thead>
                      <tr><th>Date</th><th>Working</th><th>Break</th><th>Productivity</th></tr>
                    </thead>
                    <tbody>
                      {monthlyAttendanceDays.map(d => (
                        <tr key={d.date} className={!d.hasData ? 'no-data' : ''}>
                          <td>{new Date(d.date).toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short' })}</td>
                          <td>{d.hasData ? formatMs(d.workingMs) : '—'}</td>
                          <td>{d.hasData ? formatMs(d.breakMs) : '—'}</td>
                          <td>{d.hasData ? `${d.productivity}%` : '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                    {monthlyAttendanceDays.some(d => d.hasData) && (
                      <tfoot>
                        <tr>
                          <td><strong>Total</strong></td>
                          <td><strong>{formatMs(monthlyAttendanceDays.reduce((s, d) => s + d.workingMs, 0))}</strong></td>
                          <td><strong>{formatMs(monthlyAttendanceDays.reduce((s, d) => s + d.breakMs, 0))}</strong></td>
                          <td>—</td>
                        </tr>
                      </tfoot>
                    )}
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="loading-state">
          {loadTimedOut ? (
            <div className="load-timeout-box">
              <p>This is taking longer than expected.</p>
              <button className="btn-secondary" onClick={() => { setLoading(true); loadTasks(); }}>🔄 Try Again</button>
            </div>
          ) : (
            <p>Loading...</p>
          )}
        </div>
      )}

      {/* CALL COMPOSE — pick recipients, then choose the call type */}
      {showCallCompose && canCall && (
        <div className="modal-overlay" onClick={() => setShowCallCompose(false)}>
          <div className="modal-content compact" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>📞 Call / Summon Team</h3>
              <button className="modal-close" onClick={() => setShowCallCompose(false)}>✕</button>
            </div>
            <div className="modal-body compact-body">
              <div className="form-group">
                <label>Who do you want to call? ({callRecipients.length} selected)</label>
                <div className="assignee-avatars-select">
                  <div
                    className={`avatar-select ${callRecipients.length === activeTeam.filter(m => m.id !== currentUser).length ? 'checked' : ''}`}
                    onClick={() => setCallRecipients(
                      callRecipients.length === activeTeam.filter(m => m.id !== currentUser).length
                        ? [] : activeTeam.filter(m => m.id !== currentUser).map(m => m.name)
                    )}
                    title="Select All"
                  >
                    ALL
                  </div>
                  {activeTeam.filter(m => m.id !== currentUser).map(member => (
                    <div
                      key={member.id}
                      className={`avatar-select ${callRecipients.includes(member.name) ? 'checked' : ''}`}
                      onClick={() => toggleCallRecipient(member.name)}
                      title={member.displayName}
                    >
                      {member.avatar}
                      {isPresent(member.name) && <span className="presence-dot"></span>}
                    </div>
                  ))}
                </div>
              </div>
              <p className="call-hint">Their screen rings with sound and a full-screen alert — on the app, the desktop and the phone.</p>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowCallCompose(false)}>Cancel</button>
              <button className="btn-cabin" onClick={() => sendCall('Come to My Cabin')}>🏠 Come to My Cabin</button>
              <button className="btn-urgent-call" onClick={() => sendCall('Immediate Meeting')}>🚨 Immediate Meeting</button>
            </div>
          </div>
        </div>
      )}

      {/* OUTGOING CALL — live status tracker for the caller */}
      {outgoingCall && (
        <div className="modal-overlay" onClick={() => setOutgoingCall(null)}>
          <div className="modal-content compact" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>📞 {outgoingCall.callType} — sent to {outgoingCall.recipients.length}</h3>
              <button className="modal-close" onClick={() => setOutgoingCall(null)}>✕</button>
            </div>
            <div className="modal-body compact-body">
              <div className="call-status-list">
                {outgoingCall.recipients.map(r => {
                  const member = team.find(t => t.name === r.to);
                  const icon = r.response === 'Accepted' ? '✅' : r.response === 'Declined' ? '❌' : r.response === 'Missed' ? '⌛' : r.response === 'Failed' ? '⚠️' : '📞';
                  const cls = r.response === 'Accepted' ? 'accepted' : r.response === 'Declined' ? 'declined' : (r.response === 'Missed' || r.response === 'Failed') ? 'missed' : 'ringing';
                  return (
                    <div key={r.to} className={`call-status-row ${cls}`}>
                      <span className="chat-avatar">{member?.avatar || r.to.substring(0, 2)}</span>
                      <span className="call-status-name">{member?.displayName || r.to}</span>
                      <span className="call-status-badge">{icon} {r.response === 'Ringing' ? 'Ringing...' : r.response === 'Failed' ? 'Not sent — check internet & try again' : r.response}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* INCOMING CALL — full-screen ring overlay */}
      {incomingCall && (
        <div className="incoming-call-overlay">
          <div className="incoming-call-card">
            <div className="incoming-call-avatar">
              {team.find(t => t.name === incomingCall.from)?.avatar || incomingCall.from.substring(0, 2)}
            </div>
            <h2>📞 {incomingCall.from} is calling you</h2>
            <p className="incoming-call-type">{incomingCall.type}</p>
            <div className="incoming-call-actions">
              <button className="btn-decline-call" onClick={() => respondToIncomingCall(incomingCall.callId, 'Declined')}>✕ Decline</button>
              <button className="btn-accept-call" onClick={() => respondToIncomingCall(incomingCall.callId, 'Accepted')}>✓ Accept</button>
            </div>
          </div>
        </div>
      )}

      {activeMeetingAlarm && (
        <div className="incoming-call-overlay meeting-alarm-overlay">
          <div className="incoming-call-card">
            <div className="incoming-call-avatar meeting-alarm-avatar">🤝</div>
            <h2>Meeting starting in 5 minutes!</h2>
            <p className="incoming-call-type">{activeMeetingAlarm.title}</p>
            {activeMeetingAlarm.purpose && <p className="meeting-alarm-purpose">{activeMeetingAlarm.purpose}</p>}
            <p className="meeting-alarm-meta">🕐 {fmtClock12(activeMeetingAlarm.meetingTime)} · 👥 {activeMeetingAlarm.assignedTo}</p>
            <div className="incoming-call-actions">
              <button className="btn-accept-call" onClick={dismissMeetingAlarm}>✓ Got it</button>
            </div>
          </div>
        </div>
      )}

      {!loading && (
        <>
          {(!isAdmin || isHR) && !NO_ATTENDANCE_IDS.includes(currentUser) && (() => {
            const log = myLiveLog || attendance.find(a => a.userId === currentUser)?.log;
            const times = calculateWorkingTime(log);
            const offToday = isOffToday();
            const first = firstInOf(log);
            const outMin = first ? requiredOutMin(first.min) : null;
            const cut = first ? lateCutOf(first.min) : 0;
            const nmNow = nowMinutes();
            const leftToOut = outMin !== null ? outMin - nmNow : null;
            const mySatOff = myLeaves.filter(l => l.type === 'Saturday Off');
            const lunch = lunchInfoFromLog(log);
            const warnings = dayWarnings(currentUser, log);
            const signedIn = !(myStatus === 'Not Signed In' || myStatus === 'Signed Out');
            const mySummary = disciplineData.mine?.summary?.[currentUser];
            const strikes = mySummary ? mySummary.strikes : 0;
            const dayCutMonth = mySummary ? (mySummary.dayCut || 0) : 0;
            const perHalf = attRules.strikesPerHalfDay || 3;
            const lunchLeft = lunch.onLunch ? attRules.lunchMinutes - lunch.usedMin : null;
            const lunchDisabledReason = lunch.taken ? 'Lunch already marked today' : !lunch.windowOpen ? `Lunch can be marked only ${fmtClock(attRules.lunchStart)} – ${fmtClock(attRules.lunchEnd)}` : '';
            return (
              <div className={`attendance-card-premium att-${String(myStatus).replace(/\s+/g, '-').toLowerCase()}`}>
                <div className="att-top">
                  <div className="att-status">
                    <span className="att-status-dot" style={{ background: attendanceColors[myStatus] }}></span>
                    <div>
                      <div className="att-status-label">{myStatus}</div>
                      <div className="att-shift"><FiClock /> {offToday ? 'Week off today — signing in counts as an extra working day' : `Flexible start 9:00–10:14 AM · Lunch ${fmtClock(attRules.lunchStart)}–${fmtClock(attRules.lunchEnd)} (${attRules.lunchMinutes} min)`}</div>
                    </div>
                  </div>
                  <div className="att-metrics">
                    {outMin !== null && !offToday && (
                      <div className={`att-outtime ${myStatus === 'Signed Out' ? '' : leftToOut <= 0 ? 'done' : ''}`}>
                        <span>Sign out at</span><strong>{minToClock(outMin)}</strong>
                        {myStatus !== 'Signed Out' && <em>{leftToOut > 0 ? `in ${Math.floor(leftToOut / 60)}h ${leftToOut % 60}m` : 'you can leave ✓'}</em>}
                      </div>
                    )}
                    <div><span>Worked</span><strong>{times.working}</strong></div>
                    <div><span>Break</span><strong>{times.breaks}</strong></div>
                    <div className={`att-strikes ${strikes >= perHalf ? 'bad' : strikes > 0 ? 'warn' : ''}`} onClick={() => openDiscipline('mine')} title="Open my attendance record">
                      <span>Strikes ({new Date().toLocaleDateString('en-IN', { month: 'short' })})</span><strong>{strikes}{dayCutMonth ? <small className="att-cut"> · {dayCutMonth}d cut</small> : null}</strong>
                    </div>
                  </div>
                </div>

                {!offToday && !first && !signedIn && (
                  <div className={`att-note ${nmNow > 614 ? 'att-note-bad' : 'att-note-info'}`}>
                    🕘 {nmNow <= 614
                      ? `Sign in by 10:14 AM for a full day. Signing in now → sign-out at ${minToClock(requiredOutMin(nmNow))}.`
                      : nmNow <= 660 ? 'It is after 10:14 AM — signing in now cuts ¼ day (sign-out 7:15 PM).' : 'It is after 11:00 AM — signing in now cuts ½ day (sign-out 7:15 PM).'}
                  </div>
                )}
                {first && cut > 0 && !offToday && (
                  <div className="att-note att-note-warn">⏰ Signed in at {first.time.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })} — {cut === 0.25 ? '¼' : '½'} day is cut today.</div>
                )}
                {lunch.onLunch && (
                  <div className={`lunch-meter ${lunchLeft < 0 ? 'over' : lunchLeft <= 5 ? 'ending' : ''}`}>
                    <div className="lunch-meter-text">
                      🍽️ {lunchLeft >= 0 ? `${Math.floor(lunchLeft)}:${String(Math.floor((lunchLeft % 1) * 60)).padStart(2, '0')} of lunch left` : `Lunch is over by ${Math.ceil(-lunchLeft)} min — tap Back to Work`}
                    </div>
                    <div className="lunch-meter-bar"><div style={{ width: `${Math.min(100, (lunch.usedMin / attRules.lunchMinutes) * 100)}%` }}></div></div>
                  </div>
                )}
                {signedIn && !lunch.taken && lunch.windowOpen && (
                  <div className="att-note att-note-info">🍽️ Lunch window is open — closes in {lunch.minsToClose} min. If you don't mark lunch, 30 min are deducted automatically.</div>
                )}
                {signedIn && !lunch.taken && lunch.afterWindow && (
                  <div className="att-note att-note-warn">🍽️ Lunch wasn't marked today — 1:00–1:30 PM will be counted as lunch and a strike is added.</div>
                )}
                {lunch.taken && !lunch.onLunch && lunch.end && (
                  <div className="att-note att-note-ok">✓ Lunch {lunch.start.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })} – {lunch.end.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })} ({Math.round(lunch.usedMin)} min)</div>
                )}
                {warnings.filter(w => /^Past sign-out|^Not signed in/.test(w.text)).map(w => (
                  <div key={w.text} className="att-note att-note-bad">
                    <FiAlertTriangle /> {w.text.startsWith('Past') ? `Your sign-out time was ${minToClock(outMin || 1155)} — sign out before you leave. A forgotten sign-out is closed automatically at night and counts as a strike.` : 'You have not signed in yet.'}
                  </div>
                ))}

                <div className="attendance-buttons">
                  {!signedIn ? (
                    <button className="btn-signin" onClick={() => updateMyStatus('Working')} disabled={attendanceSwitching}>Sign In</button>
                  ) : (
                    <>
                      {myStatus !== 'Working' && <button className="btn-resume" onClick={() => updateMyStatus('Working')} disabled={attendanceSwitching}>Back to Work</button>}
                      {myStatus !== 'Lunch Break' && (
                        <button className="btn-lunch" onClick={() => updateMyStatus('Lunch Break')} disabled={attendanceSwitching || !!lunchDisabledReason} title={lunchDisabledReason || 'Start your 30-minute lunch'}>
                          🍽️ Lunch{lunch.taken ? ' ✓' : ''}
                        </button>
                      )}
                      {myStatus !== 'Meeting' && <button className="btn-meeting" onClick={() => updateMyStatus('Meeting')} disabled={attendanceSwitching}>Meeting</button>}
                      <button className="btn-signout" onClick={() => updateMyStatus('Signed Out')} disabled={attendanceSwitching}>Sign Out</button>
                    </>
                  )}
                  <span className="att-btn-spacer"></span>
                  <button className="btn-ghost" onClick={() => setShowSatOff(true)} title="One Saturday off per month">🗓 Saturday off{mySatOff.length ? ` (${mySatOff.filter(l => l.date.slice(0, 7) === todayKeyIST().slice(0, 7)).length ? 'used' : 'available'})` : ''}</button>
                  <button className="btn-ghost" onClick={() => openDiscipline('mine')}>My record</button>
                  <button className="btn-ghost" onClick={openMonthlyAttendance}>Monthly hours</button>
                </div>
              </div>
            );
          })()}

          {(isAdmin || isHR) && (
            <div className="team-status-section">
              <div className="section-header" onClick={() => setShowAttendance(!showAttendance)}>
                <h3><FiUsers /> Team Status Today <span className="section-caret">{showAttendance ? '▾' : '▸'}</span></h3>
                {canManageAttendance && (
                  <span className="ts-actions">
                    <button className="btn-ghost" onClick={(e) => { e.stopPropagation(); openDiscipline('day'); }}><FiCalendar /> Attendance review &amp; leave</button>
                    <button className="btn-ghost" onClick={(e) => { e.stopPropagation(); openDiscipline('team'); }}><FiShield /> Discipline</button>
                  </span>
                )}
              </div>
              {showAttendance && (
                <div className="team-status-grid">
                  {activeTeam.filter(m => !m.isAdmin && !NO_ATTENDANCE_IDS.includes(m.id)).map(member => {
                    const memberAttendance = attendance.find(a => a.userId === member.id);
                    const mFirst = memberAttendance ? firstInOf(memberAttendance.log) : null;
                    const status = memberAttendance?.status || 'Not Signed In';
                    const times = memberAttendance ? calculateWorkingTime(memberAttendance.log) : { working: '0h 0m 0s', breaks: '0h 0m 0s', productivity: 0 };
                    const warns = dayWarnings(member.id, memberAttendance?.log);
                    return (
                      <div key={member.id} className={`status-card ${warns.some(w => w.kind === 'bad') ? 'has-bad' : ''}`}>
                        <div className="status-avatar" style={{background: attendanceColors[status]}}>{member.avatar}</div>
                        <div className="status-details">
                          <strong>{member.displayName} {member.isHR ? '(HR)' : ''}</strong>
                          <span className="status-text" style={{color: attendanceColors[status]}}>{status === 'Not Signed In' && isOffToday() ? 'Week off' : status}</span>
                          <span className="status-time">⏱ {times.working} · ☕ {times.breaks}{mFirst ? ` · in ${mFirst.time.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })} → out ${minToClock(requiredOutMin(mFirst.min))}` : ''}</span>
                          {warns.length > 0 && (
                            <span className="status-warns">{warns.map(w => <span key={w.text} className={`warn-chip ${w.kind}`}>{w.text}</span>)}</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {!showArchive && (
            <div className="task-view-toggle">
              {isAdmin && (
                <button className={taskViewMode === 'all' ? 'active' : ''} onClick={() => { setTaskViewMode('all'); setManagerView('all'); }}>
                  📊 All Team Tasks
                </button>
              )}
              <button className={taskViewMode === 'assigned' ? 'active' : ''} onClick={() => setTaskViewMode('assigned')}>
                📥 Assigned to Me
              </button>
              <button className={taskViewMode === 'by_me' ? 'active' : ''} onClick={() => setTaskViewMode('by_me')}>
                📤 Assigned by Me
              </button>
              <button className={taskViewMode === 'own' ? 'active' : ''} onClick={() => setTaskViewMode('own')}>
                📝 My Own Tasks
              </button>
              {isAdmin && (
                <button className="btn-archive" onClick={() => { setShowArchive(true); loadArchive(); }}>
                  📁 View Archive
                </button>
              )}
            </div>
          )}

          {showArchive && isAdmin && (
            <div className="archive-view">
              <div className="archive-header">
                <h2>📁 Completed Tasks Archive</h2>
                <button className="btn-secondary" onClick={() => setShowArchive(false)}>← Back</button>
              </div>
              <div className="archive-stats">
                <div className="stat-card">
                  <div className="stat-number">{archivedTasks.length}</div>
                  <div className="stat-label">Total Completed</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">
                    {archivedTasks.filter(t => {
                      const d = new Date(t.completionDate);
                      const week = new Date();
                      week.setDate(week.getDate() - 7);
                      return d > week;
                    }).length}
                  </div>
                  <div className="stat-label">This Week</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">
                    {(() => {
                      const counts = {};
                      archivedTasks.forEach(t => {
                        const assignees = String(t.assignedTo).split(',').map(a => a.trim());
                        assignees.forEach(a => { counts[a] = (counts[a] || 0) + 1; });
                      });
                      const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
                      return sorted.length > 0 ? sorted[0][0] : '-';
                    })()}
                  </div>
                  <div className="stat-label">🏆 Top Performer</div>
                </div>
              </div>
              <div className="tasks-grid">
                {archivedTasks.map(task => (
                  <div key={task.id} className="task-card archived">
                    <div className="task-header">
                      <h3>{task.taskDetails}</h3>
                      <div className="badges">
                        <span className="badge-channel">{task.channel}</span>
                        <span className="badge-completed">✓ Completed</span>
                      </div>
                    </div>
                    <div className="task-meta">
                      <div className="meta-info">
                        <p>👥 {task.assignedTo}</p>
                        <p>📌 By: {task.assignedBy}</p>
                        <p>✅ {new Date(task.completionDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!showArchive && (
            <>
              {isAdmin && taskViewMode === 'all' && (
                <div className="manager-nav">
                  <div className="nav-label">{managerView === 'all' ? 'Quick Switch:' : 'Viewing:'}</div>
                  <div className="user-switcher">
                    <button className={managerView === 'all' ? 'active' : ''} onClick={() => setManagerView('all')}>All Tasks</button>
                    {/* FIX #11 — Quick Switch now includes admin colleagues too (e.g. PC sees Shivendra, and vice versa), excluding only the current viewer */}
                    {activeTeam.filter(m => m.id !== currentUser).map(member => (
                      <button key={member.id} className={`quick-switch-btn ${managerView === member.id ? 'active' : ''}`} onClick={() => setManagerView(member.id)} title={member.displayName}>
                        {member.avatar}
                        {isPresent(member.name) && <span className="presence-dot presence-dot-btn" title="Currently working"></span>}
                      </button>
                    ))}
                    {/* AG and BG are task-assignment-only names (no dashboard/login) — included
                        here so PC/Shivendra can filter to see just their tasks like anyone else. */}
                    {extraAssignees.map(name => (
                      <button key={name} className={managerView === name ? 'active' : ''} onClick={() => setManagerView(name)} title={name}>
                        {name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="view-title">
                <h2>{getViewTitle()}</h2>
                <span className="view-title-sub">{openCount} open · {bucketed.delayed.length} delayed · {bucketed.today.length} due today</span>
              </div>

              <div className="bucket-tabs" role="tablist">
                <button className={taskBucket === 'all' ? 'active' : ''} onClick={() => setTaskBucket('all')}>All <span>{boardTasks.length}</span></button>
                {remindedTasks.length > 0 && (
                  <button className={`bucket-reminded ${taskBucket === 'reminded' ? 'active' : ''}`} onClick={() => setTaskBucket('reminded')}>⏰ Reminders <span>{remindedTasks.length}</span></button>
                )}
                {TASK_BUCKETS.map(b => (
                  <button key={b.key} className={`bucket-${b.key} ${taskBucket === b.key ? 'active' : ''}`} onClick={() => setTaskBucket(b.key)}>
                    {b.icon} {b.label} <span>{bucketed[b.key].length}</span>
                  </button>
                ))}
              </div>

              <div className="filters">
                <MultiSelectFilter
                  label="Status"
                  options={['Not Started', 'In Progress', 'Completed', 'On Hold', 'Delayed']}
                  selected={filterStatus}
                  onChange={setFilterStatus}
                />
                <MultiSelectFilter
                  label="Channels"
                  options={allChannelOptions}
                  selected={filterChannel}
                  onChange={setFilterChannel}
                />
                <MultiSelectFilter
                  label="Categories"
                  options={categories}
                  selected={filterCategory}
                  onChange={setFilterCategory}
                />
                {(isAdmin || canCreateRoutine) && (
                  <MultiSelectFilter
                    label="Types"
                    options={['General', 'Routine']}
                    selected={filterTaskType}
                    onChange={setFilterTaskType}
                  />
                )}
              </div>

              <div className="tasks-container">
                {(() => {
                  const renderTaskCard = (task) => {
                    const isCompleted = task.status === 'Completed';
                    const canChangeStatus = isAdmin || !isCompleted;
                    const canEdit = isAdmin || !isCompleted;
                    const isRoutine = task.taskType === 'Routine' || task.taskType === 'Routine Instance';
                    const channelList = String(task.channel).split(',').map(c => c.trim()).filter(c => c);
                    const bucket = bucketOf(task);
                    const reminder = isTaskAssignedToMe(task) && !isCompleted ? reminderByTask[String(task.id)] : null;
                    const justReminded = reminder && reminderFlash && reminderFlash.taskId === String(task.id) && Date.now() - reminderFlash.at < 15000;
                    const due = task.targetDate ? new Date(task.targetDate) : null;
                    const dueLabel = !due || isNaN(due.getTime()) ? '—'
                      : bucket === 'today' ? 'Today'
                      : due.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
                    return (
                      <div key={task.id} id={`task-card-${task.id}`} className={`task-card bucket-card-${bucket} ${isCompleted ? 'completed' : ''} ${isRoutine ? 'routine' : ''} ${reminder ? 'reminded' : ''} ${justReminded ? 'reminded-flash' : ''} ${String(highlightTaskId) === String(task.id) ? 'task-highlighted' : ''}`}>
                        <div className={`priority-strip ${String(task.priority || 'Medium').toLowerCase()}`}></div>
                        <div className="task-card-top">
                          <span className={`due-pill due-${bucket}`}>
                            {bucket === 'delayed' ? `Delayed ${task.delayDays > 0 ? task.delayDays + 'd' : ''}` : bucket === 'today' ? 'Due today' : bucket === 'hold' ? 'On hold' : bucket === 'done' ? 'Completed' : 'Upcoming'}
                          </span>
                          {isRoutine && <span className="routine-pill">🔄 Routine</span>}
                          <span className="task-due-date"><FiCalendar /> {dueLabel}</span>
                        </div>
                        {reminder && (
                          <div className="reminder-banner">⏰ {reminder.from} reminded you · {timeAgo(reminder.timestamp)}</div>
                        )}
                        <div className="task-header">
                          <div className="task-title-row">
                            <h3>{task.taskDetails}</h3>
                            {canEdit && (
                              <button className="btn-edit-task" onClick={() => openEditTask(task)} title="Edit task"><FiEdit2 /></button>
                            )}
                          </div>
                          <div className="badges">
                            {channelList.map(ch => <ChannelBadge key={ch} channel={ch} />)}
                            <span className={`badge-priority ${String(task.priority || 'Medium').toLowerCase()}`}>{task.priority}</span>
                            {task.category && <span className="badge-category">{task.category}</span>}
                          </div>
                          {task.remarks && <p className="task-remarks">{task.remarks}</p>}
                        </div>
                        <div className="task-meta">
                          <div className="assignee-row">
                            <div className="assignee-avatars">
                              {String(task.assignedTo).split(',').map(a => a.trim()).map(name => (
                                <span key={name} className="mini-avatar-wrap" title={name}>
                                  <span className="mini-avatar">{getAvatarForName(name)}</span>
                                  {isPresent(name) && <span className="presence-dot" title="Currently working"></span>}
                                </span>
                              ))}
                            </div>
                            <span className="assigned-by">by <strong>{task.assignedBy}</strong></span>
                          </div>
                        </div>
                        <div className="task-footer">
                          <select
                            value={task.status}
                            onChange={(e) => handleStatusChange(task.id, e.target.value)}
                            className={`status-select status-${String(task.status).replace(/\s+/g, '-').toLowerCase()} ${!canChangeStatus ? 'locked' : ''}`}
                            disabled={!canChangeStatus}
                          >
                            <option value="Not Started">Not Started</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed {isCompleted && !isAdmin ? '🔒' : ''}</option>
                            <option value="On Hold">On Hold</option>
                            <option value="Delayed">Delayed</option>
                          </select>
                          {canRemindTask(task) && (
                            <button className="btn-remind" onClick={() => handleRemindTask(task)} disabled={String(remindBusyId) === String(task.id)} title="Send a reminder to the assignee">
                              <FiBellRing /> {String(remindBusyId) === String(task.id) ? 'Sending…' : 'Remind'}
                            </button>
                          )}
                          {isAdmin && (
                            <button className="btn-delete-task" title="Delete task" onClick={() => handleDeleteTask(task)}><FiTrash2 /></button>
                          )}
                        </div>
                      </div>
                    );
                  };

                  const sections = taskBucket === 'all'
                    ? TASK_BUCKETS.filter(b => bucketed[b.key].length > 0).map(b => ({ ...b, items: bucketed[b.key] }))
                    : taskBucket === 'reminded'
                      ? [{ key: 'reminded', label: 'Reminders', icon: '⏰', hint: 'Someone is waiting on these', items: remindedTasks }]
                      : TASK_BUCKETS.filter(b => b.key === taskBucket).map(b => ({ ...b, items: bucketed[b.key] }));
                  const nothing = sections.every(sec => sec.items.length === 0) && staleTasks.length === 0;

                  return (
                    <>
                      {nothing ? (
                        <div className="empty-state">
                          <div className="empty-state-icon">🎉</div>
                          <p className="empty-state-title">{taskBucket === 'all' ? "You're all caught up!" : 'Nothing here'}</p>
                          <p className="empty-state-sub">No tasks to show here right now.</p>
                        </div>
                      ) : (
                        <>
                          {sections.filter(sec => sec.items.length > 0).map(sec => (
                            <section key={sec.key} className={`task-section task-section-${sec.key}`}>
                              <div className="task-section-head">
                                <h3>{sec.icon} {sec.label}</h3>
                                <span className="task-section-count">{sec.items.length}</span>
                                <span className="task-section-hint">{sec.hint}</span>
                              </div>
                              <div className={`tasks-grid ${sec.items.length > 12 ? 'compact-cards' : ''}`}>
                                {sec.items.map(renderTaskCard)}
                              </div>
                            </section>
                          ))}
                          {staleTasks.length > 0 && (taskBucket === 'all' || taskBucket === 'delayed') && (
                            <div className="stale-routine-section">
                              <button className="stale-routine-toggle" onClick={() => setShowOlderRoutine(!showOlderRoutine)}>
                                📦 Older Routine Tasks ({staleTasks.length}) — 14+ days unfinished {showOlderRoutine ? '▼' : '▶'}
                              </button>
                              {showOlderRoutine && (
                                <div className="tasks-grid stale-grid">
                                  {staleTasks.map(renderTaskCard)}
                                </div>
                              )}
                            </div>
                          )}
                        </>
                      )}
                    </>
                  );
                })()}
              </div>
            </>
          )}
        </>
      )}

      {showNewTaskForm && (
        <div className="modal-overlay" onClick={closeTaskModal}>
          <div className="modal-content compact" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingTask ? '✏️ Edit Task' : '➕ Create New Task'}</h3>
              <button className="modal-close" onClick={closeTaskModal}>✕</button>
            </div>
            <div className="modal-body compact-body">
              {canCreateRoutine && !editingTask && (
                <div className="form-group">
                  <label>Task Type</label>
                  <div className="task-type-toggle">
                    <button className={newTask.taskType === 'General' ? 'active' : ''} onClick={() => setNewTask({...newTask, taskType: 'General'})} type="button">
                      📋 General
                    </button>
                    <button className={newTask.taskType === 'Routine' ? 'active' : ''} onClick={() => setNewTask({...newTask, taskType: 'Routine'})} type="button">
                      🔄 Routine
                    </button>
                  </div>
                </div>
              )}

              <div className="form-group">
                <label>Assign to * ({selectedAssignees.length} selected)</label>
                <div className="assignee-avatars-select">
                  {allAssignees.map(name => (
                    <div 
                      key={name} 
                      className={`avatar-select ${selectedAssignees.includes(name) ? 'checked' : ''}`}
                      onClick={() => toggleAssignee(name)}
                      title={name}
                    >
                      {getAvatarForName(name)}
                    </div>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Task Details *</label>
                <input type="text" placeholder="What needs to be done?" value={newTask.taskDetails} onChange={(e) => setNewTask({ ...newTask, taskDetails: e.target.value })} />
              </div>

              <div className="form-group">
                <label>Remarks</label>
                <input type="text" placeholder="Additional notes (optional)" value={newTask.remarks} onChange={(e) => setNewTask({ ...newTask, remarks: e.target.value })} />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Priority</label>
                  <select value={newTask.priority} onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}>
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <select value={newTask.category} onChange={(e) => setNewTask({ ...newTask, category: e.target.value })}>
                    <option value="">Select (optional)</option>
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Channels ({selectedChannels.length} selected)</label>
                <div className="channel-select-grid">
                  {allChannelOptions.map(ch => (
                    <div 
                      key={ch}
                      className={`channel-chip ${selectedChannels.includes(ch) ? 'checked' : ''}`}
                      onClick={() => toggleChannel(ch)}
                    >
                      <span className="pf-icon" style={{ background: PLATFORMS[platformOf(ch)].bg }}><PlatformIcon channel={ch} size={9} /></span> {ch}
                    </div>
                  ))}
                </div>
              </div>

              {(newTask.taskType === 'General' || editingTask) ? (
                <div className="form-group">
                  <label>Target Date * {editingTask && !isAdmin && <span className="date-locked-tag">🔒 Only Shivendra/PC can change this</span>}</label>
                  <input
                    type="date" min="2025-01-01" max="2030-12-31"
                    value={newTask.targetDate}
                    onChange={(e) => setNewTask({ ...newTask, targetDate: e.target.value })}
                    disabled={editingTask && !isAdmin}
                    className={editingTask && !isAdmin ? 'input-locked' : ''}
                  />
                </div>
              ) : (
                <>
                  <div className="form-row-3">
                    <div className="form-group">
                      <label>Frequency</label>
                      <select value={newTask.frequency} onChange={(e) => setNewTask({ ...newTask, frequency: e.target.value })}>
                        <option value="Daily">Daily</option>
                        <option value="Weekly">Weekly</option>
                        <option value="Monthly">Monthly</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>{newTask.frequency === 'Daily' ? 'Start *' : (newTask.frequency === 'Weekly' ? 'Anchor Weekday *' : 'Anchor Date *')}</label>
                      <input type="date" min="2025-01-01" max="2030-12-31" value={newTask.startDate} onChange={(e) => setNewTask({ ...newTask, startDate: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label>End (optional)</label>
                      <input type="date" min="2025-01-01" max="2030-12-31" value={newTask.endDate} onChange={(e) => setNewTask({ ...newTask, endDate: e.target.value })} />
                    </div>
                  </div>

                  {(newTask.frequency === 'Weekly' || newTask.frequency === 'Monthly') && (
                    <div className="reminder-window-box">
                      <label className="reminder-window-title">⏰ Reminder Window</label>
                      <div className="task-type-toggle" style={{marginBottom: '10px'}}>
                        <button type="button" className={newTask.reminderMode === 'date' ? 'active' : ''} onClick={() => setNewTask({...newTask, reminderMode: 'date'})}>
                          📆 Specific {newTask.frequency === 'Weekly' ? 'Weekday' : 'Date'} + Days Before
                        </button>
                        <button type="button" className={newTask.reminderMode === 'band' ? 'active' : ''} onClick={() => setNewTask({...newTask, reminderMode: 'band'})}>
                          📊 Date Band
                        </button>
                      </div>

                      {newTask.reminderMode === 'date' ? (
                        <div className="form-group">
                          <label>Remind me this many days before the due date</label>
                          <input
                            type="number" min="0" max="60" placeholder="e.g. 7"
                            value={newTask.reminderDaysBefore}
                            onChange={(e) => setNewTask({ ...newTask, reminderDaysBefore: e.target.value })}
                          />
                          <p className="reminder-window-hint">
                            The task stays hidden and won't notify anyone until {newTask.reminderDaysBefore || 'X'} day(s) before the due date (taken from the {newTask.frequency === 'Weekly' ? 'weekday' : 'day-of-month'} you picked above). It then appears and sends a reminder message, and stays visible (going overdue if needed) until completed.
                          </p>
                        </div>
                      ) : newTask.frequency === 'Weekly' ? (
                        <div className="form-row">
                          <div className="form-group">
                            <label>Band Start (weekday)</label>
                            <select value={newTask.bandStart} onChange={(e) => setNewTask({ ...newTask, bandStart: e.target.value })}>
                              <option value="">Select</option>
                              {['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'].map((d, idx) => (
                                <option key={d} value={idx}>{d}</option>
                              ))}
                            </select>
                          </div>
                          <div className="form-group">
                            <label>Band End (weekday)</label>
                            <select value={newTask.bandEnd} onChange={(e) => setNewTask({ ...newTask, bandEnd: e.target.value })}>
                              <option value="">Select</option>
                              {['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'].map((d, idx) => (
                                <option key={d} value={idx}>{d}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      ) : (
                        <div className="form-row">
                          <div className="form-group">
                            <label>Band Start (day of month)</label>
                            <select value={newTask.bandStart} onChange={(e) => setNewTask({ ...newTask, bandStart: e.target.value })}>
                              <option value="">Select</option>
                              {Array.from({length: 31}, (_, i) => i + 1).map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                          </div>
                          <div className="form-group">
                            <label>Band End (day of month)</label>
                            <select value={newTask.bandEnd} onChange={(e) => setNewTask({ ...newTask, bandEnd: e.target.value })}>
                              <option value="">Select</option>
                              {Array.from({length: 31}, (_, i) => i + 1).map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                          </div>
                        </div>
                      )}
                      {newTask.reminderMode === 'band' && (
                        <p className="reminder-window-hint">
                          The task appears on the Band Start {newTask.frequency === 'Weekly' ? 'weekday' : 'day'} and its due date is the Band End {newTask.frequency === 'Weekly' ? 'weekday' : 'day'} — visible the whole span, every {newTask.frequency === 'Weekly' ? 'week' : 'month'}.
                        </p>
                      )}
                    </div>
                  )}
                </>
              )}
              {editingTask && !isAdmin && (
                <p className="tm-hint">Note: status changes (including marking Completed) still happen from the status dropdown on the task card, not here.</p>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={closeTaskModal}>Cancel</button>
              <button className="btn-success" onClick={editingTask ? handleSaveEdit : handleAddTask} disabled={saving}>
                {saving ? 'Saving...' : (editingTask ? '💾 Save Changes' : '✅ Create Task')}
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="footer">
        <p>Made with <span className="heart">❤</span> by Shivendra • WTC Management</p>
      </footer>
    </div>
  )
}

export default App