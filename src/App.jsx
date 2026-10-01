import { useState, useEffect, useRef, useMemo } from 'react'
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
  manager: [
    "Great leaders create more leaders, not followers. — Tom Peters",
    "Vision without execution is hallucination. — Thomas Edison",
    "Management is doing things right; leadership is doing the right things. — Peter Drucker",
    "Innovation distinguishes between a leader and a follower. — Steve Jobs",
    "Leadership is not about being in charge. It's about taking care of those in your charge. — Simon Sinek",
    "Success is not final, failure is not fatal. — Winston Churchill",
    "Discipline is the bridge between goals and accomplishment. — Jim Rohn",
    "The way to get started is to quit talking and begin doing. — Walt Disney",
    "A goal without a plan is just a wish. — Antoine de Saint-Exupery",
    "Great things never come from comfort zones.",
    "The harder you work, the luckier you get. — Gary Player",
    "Believe you can and you're halfway there. — Theodore Roosevelt",
    "Effective leadership is putting first things first. — Stephen Covey",
    "Quality is not an act, it is a habit. — Aristotle",
    "Excellence is never an accident. — Aristotle",
    "Do what you can, with what you have, where you are. — Theodore Roosevelt",
    "The only way to do great work is to love what you do. — Steve Jobs",
    "Success comes to those too busy to look for it. — Henry David Thoreau",
    "Coming together is a beginning, staying together is success. — Henry Ford",
    "Lead by example, not by command."
  ],
  ceo: [
    "The role of a CEO is to ask the right questions. — Ken Blanchard",
    "Chase the vision, not the money. — Tony Hsieh",
    "Innovation is saying no to a thousand things. — Steve Jobs",
    "Culture eats strategy for breakfast. — Peter Drucker",
    "The best way to predict the future is to create it. — Peter Drucker",
    "A brand is like a reputation for a person. — Jeff Bezos",
    "Move fast and break things. — Mark Zuckerberg",
    "Ideas are commodities. Execution is not. — Michael Dell",
    "Whether you think you can or can't, you're right. — Henry Ford",
    "Business opportunities are like buses. — Richard Branson",
    "Success is walking from failure to failure with no loss of enthusiasm. — Churchill",
    "In the middle of every difficulty lies opportunity. — Einstein",
    "The greatest glory lies in rising every time we fall. — Mandela",
    "Get big quietly. — Chris Dixon",
    "It's about making ideas happen. — Scott Belsky",
    "Quit talking and begin doing. — Walt Disney",
    "Try to become a person of value. — Einstein",
    "Do what you feel in your heart to be right. — Eleanor Roosevelt",
    "Self-education will make you a fortune. — Jim Rohn",
    "Go where there is no path. — Ralph Waldo Emerson"
  ],
  social_media: [
    "Content is king, but engagement is queen. — Mari Smith",
    "Your brand is what people say when you're not in the room. — Jeff Bezos",
    "Design is thinking made visual. — Saul Bass",
    "Creativity takes courage. — Henri Matisse",
    "Content is fire, social media is gasoline. — Jay Baer",
    "Be so good they can't ignore you. — Steve Martin",
    "Creativity is intelligence having fun. — Einstein",
    "Every great design begins with an even better story.",
    "Good design is good business.",
    "The best marketing doesn't feel like marketing.",
    "Storytelling is the most powerful way to put ideas into the world.",
    "Make it simple. Make it memorable. — Leo Burnett",
    "Marketing is about the stories you tell. — Seth Godin",
    "Simplicity is the ultimate sophistication. — Da Vinci",
    "Design is how it works. — Steve Jobs",
    "The details make the design. — Charles Eames",
    "Focus on how to be social. — Jay Baer",
    "Social media is about the people.",
    "Not to be different is virtually suicidal.",
    "Great design speaks louder than words."
  ],
  video_editor: [
    "Editing is where stories truly come alive.",
    "Cut to the emotion, not the action. — Walter Murch",
    "The best edit is the one you don't notice.",
    "Every cut tells a story.",
    "Master the rhythm, master the edit.",
    "The frame is your canvas. Paint emotions.",
    "Color tells the story words cannot.",
    "Great editing is invisible.",
    "Timing is everything in video editing.",
    "Less is more in editing.",
    "The magic happens in post-production.",
    "You craft experiences, not just videos.",
    "B-roll is the bridge between great shots.",
    "Make every second count.",
    "Transition with purpose, cut with reason.",
    "Cinema is what's in the frame. — Scorsese",
    "Sound design is half the experience.",
    "Patience in editing equals perfection.",
    "The soul of storytelling lies in the edit.",
    "Render. Review. Refine. Repeat."
  ],
  pr: [
    "PR is what others say about you.",
    "Build relationships, not just contacts.",
    "Reputation takes years to build, minutes to destroy. — Warren Buffett",
    "Trust is the foundation of all communication.",
    "Your story is your strongest asset.",
    "Make news, don't chase it.",
    "Press releases tell, stories sell.",
    "Be quotable. Be memorable. Be authentic.",
    "Listen first, speak second. — Stephen Covey",
    "PR is a marathon, not a sprint.",
    "Relationships are the currency of PR.",
    "Tell the truth, but tell it well.",
    "Credibility is built one interaction at a time.",
    "Empathy is the secret weapon of PR.",
    "Authenticity wins in PR.",
    "Your media list is your goldmine.",
    "The best PR is great work.",
    "Perception is reality in PR.",
    "Great communicators build relationships.",
    "Words have power to build or destroy."
  ],
  hr: [
    "HR is about the business.",
    "Take care of your employees. — Richard Branson",
    "People never forget how you made them feel. — Maya Angelou",
    "Culture eats strategy for breakfast. — Peter Drucker",
    "Hire character. Train skill. — Peter Schutz",
    "Talent wins games, teamwork wins championships. — Michael Jordan",
    "Happy employees lead to happy customers.",
    "Empathy is the greatest leadership skill.",
    "Recruit for attitude, train for skill.",
    "Engagement starts with empathy.",
    "Your culture is your competitive advantage.",
    "HR is the heart of every organization.",
    "People work for purpose, not paychecks.",
    "The strength of the team is each member.",
    "Great vision without great people is irrelevant.",
    "Be the leader you wish you had.",
    "Employees are your most valuable asset.",
    "How employees feel is how customers feel.",
    "Motivation comes from working on things we care about.",
    "People don't leave companies, they leave managers."
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

// FIX — reusable multi-select checklist dropdown, replacing the old single-select native
// <select> filters. Lets people check multiple options at once (e.g. "Not Started" AND
// "In Progress" simultaneously) instead of being limited to one value.
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
  const CONTENT_TYPES = [
    { value: 'Long Format Video', color: '#3b82f6', icon: '🎬' },
    { value: 'Short (Vertical)', color: '#f59e0b', icon: '⚡' },
    { value: 'Community Post', color: '#ec4899', icon: '💬' },
    { value: 'Live Stream', color: '#ef4444', icon: '🔴' }
  ];
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
    finalLink: '', thumbnailLink: '', designLink: '', rawLink: '', draftLink: '', description: '', notes: ''
  });
  const [contentSaving, setContentSaving] = useState(false);
  // ---- Content Calendar: dynamic channel groups (PC/Shivendra/Pari can edit these
  // from the app now, instead of them being hardcoded — starts from the same defaults
  // that used to be hardcoded, so nothing changes until someone actually edits it) ----
  const [contentChannelGroups, setContentChannelGroups] = useState(DEFAULT_CONTENT_CHANNEL_GROUPS);
  const [showManageChannels, setShowManageChannels] = useState(false);
  const [newChannelGroup, setNewChannelGroup] = useState('');
  const [newChannelName, setNewChannelName] = useState('');
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
  const greeting = displayName ? getTimeBasedGreeting(displayName) : '';
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

  // FIX — real Web Push subscription. This is what makes calls/alerts actually wake the
  // device instead of depending on a browser tab's polling timer staying alive. Runs
  // once permission is granted and we know who's logged in; safe to call repeatedly —
  // if a subscription already exists, the browser just hands the same one back.
  const subscribeToPush = async (userName) => {
    try {
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;
      if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return;
      if (!userName) return;
      const registration = await navigator.serviceWorker.ready;
      let subscription = await registration.pushManager.getSubscription();
      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
        });
      }
      fetch(API_URL, {
        method: 'POST', mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({ action: 'savePushSubscription', userName, subscription: subscription.toJSON() })
      });
    } catch (e) {
      // Most common cause: permission was granted but the service worker isn't ready
      // yet on first load — subscribeToPush gets called again once currentUser settles.
    }
  };

  const requestNotifPermission = () => {
    if (typeof Notification === 'undefined') return;
    Notification.requestPermission().then(perm => {
      setNotifPermission(perm);
      if (perm === 'granted') subscribeToPush(currentUserInfo?.name);
    });
  };

  // Covers the case where permission was already granted in an earlier session — no
  // button click to hook into, so subscribe as soon as we know who's logged in.
  useEffect(() => {
    if (currentUserInfo?.name && typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      subscribeToPush(currentUserInfo.name);
    }
  }, [currentUserInfo?.name]);

  const sendTestNotification = () => {
    fireDesktopNotification('WTC Task Hub', '🔔 Test notification — if you see this in your OS notification tray, desktop alerts are working correctly.');
  };

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
  const playRingTone = () => {
    try {
      const ctx = getRingCtx_();
      if (!ctx) return;
      const playNote = (freq, start, duration) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.value = freq;
        // Fast attack, natural exponential decay — the "struck bar" marimba character.
        gain.gain.setValueAtTime(0.001, ctx.currentTime + start);
        gain.gain.exponentialRampToValueAtTime(0.5, ctx.currentTime + start + 0.012);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + start);
        osc.stop(ctx.currentTime + start + duration + 0.03);
      };
      // Descending cascade: C6, A5, F5 — repeats each time the interval below fires.
      playNote(1046.5, 0, 0.32);
      playNote(880, 0.16, 0.32);
      playNote(698.46, 0.32, 0.4);
    } catch (e) {}
  };

  const startRinging = () => {
    playRingTone();
    if (ringIntervalRef.current) clearInterval(ringIntervalRef.current);
    ringIntervalRef.current = setInterval(playRingTone, 1300);
  };

  const stopRinging = () => {
    if (ringIntervalRef.current) { clearInterval(ringIntervalRef.current); ringIntervalRef.current = null; }
    if (incomingCallTimeoutRef.current) { clearTimeout(incomingCallTimeoutRef.current); incomingCallTimeoutRef.current = null; }
  };

  // ============================================================
  // LUNCH ALARM — fires 1:00 PM sharp for everyone with the attendance card
  // (Shivendra/PC never see this, same as they never see the attendance card at all).
  // ============================================================
  const [showLunchAlarm, setShowLunchAlarm] = useState(false);
  const lunchAlarmIntervalRef = useRef(null);
  const lunchAlarmTimeoutRef = useRef(null);
  const lunchAlarmFiredTodayRef = useRef(null); // stores the date string it last fired for
  const meetingAlarmIntervalRef = useRef(null);
  const meetingAlarmTimeoutRef = useRef(null);

  // Distinct synthesized alarm — a rising two-tone chirp, deliberately different from
  // both the call ring (two-tone burst) and the notification ding (single beep), so all
  // three are instantly recognizable by ear alone.
  const playAlarmTone = () => {
    try {
      const ctx = getRingCtx_();
      if (!ctx) return;
      const playChirp = (start) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(700, ctx.currentTime + start);
        osc.frequency.exponentialRampToValueAtTime(1100, ctx.currentTime + start + 0.18);
        gain.gain.setValueAtTime(0.001, ctx.currentTime + start);
        gain.gain.exponentialRampToValueAtTime(0.45, ctx.currentTime + start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + start);
        osc.stop(ctx.currentTime + start + 0.25);
      };
      playChirp(0);
      playChirp(0.28);
      playChirp(0.56);
    } catch (e) {}
  };

  const startLunchAlarmSound = () => {
    playAlarmTone();
    if (lunchAlarmIntervalRef.current) clearInterval(lunchAlarmIntervalRef.current);
    lunchAlarmIntervalRef.current = setInterval(playAlarmTone, 1000);
  };

  const dismissLunchAlarm = () => {
    if (lunchAlarmIntervalRef.current) { clearInterval(lunchAlarmIntervalRef.current); lunchAlarmIntervalRef.current = null; }
    if (lunchAlarmTimeoutRef.current) { clearTimeout(lunchAlarmTimeoutRef.current); lunchAlarmTimeoutRef.current = null; }
    setShowLunchAlarm(false);
  };

  // FIX — same reliability problem as the call notifications had: a background/throttled
  // tab could simply miss the exact 13:00 minute this used to require. Two changes:
  // (1) widened the trigger window to 1:00–1:10 PM instead of exactly minute 0, so a
  // delayed/throttled check still catches it; (2) added a visibility-change listener so
  // the moment someone returns to this tab, it immediately checks — same pattern used to
  // fix call delivery. Applies only to people who actually have the personal attendance
  // card (matches updateMyStatus's own admin/HR gate) — Shivendra/PC never see this.
  useEffect(() => {
    if (!currentUser || isAdmin) return;

    const checkAlarmTime = () => {
      const now = new Date();
      const todayKey = now.toDateString();
      const afterOnePM = now.getHours() === 13 && now.getMinutes() <= 10;
      if (afterOnePM && lunchAlarmFiredTodayRef.current !== todayKey) {
        lunchAlarmFiredTodayRef.current = todayKey;
        setShowLunchAlarm(true);
        startLunchAlarmSound();
        fireDesktopNotification('🍽️ Lunch Time', 'Time for your 45-minute lunch break.');
        lunchAlarmTimeoutRef.current = setTimeout(dismissLunchAlarm, 30000); // 30s auto-dismiss
      }
    };

    const interval = setInterval(checkAlarmTime, 30000);

    const handleVisible = () => {
      if (document.visibilityState === 'visible') checkAlarmTime();
    };
    document.addEventListener('visibilitychange', handleVisible);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisible);
    };
  }, [currentUser, isAdmin]);

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
          fireDesktopNotification('🤝 Meeting starting in 5 minutes', `${m.title} at ${m.meetingTime}`);
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
  // FIX — CALLS UNDER 2 SECONDS. Three paths now ring the phone, whichever is first wins
  // (seenCallIds makes sure the same call never rings twice):
  //   1. PUSH → the service worker hands the push straight to this open app
  //      (handlePushMessage below) and it rings instantly, no server round-trip at all.
  //   2. POLL → every 2s while the app is on screen. This used to run every 1s for every
  //      person and was the main thing overloading the backend for the whole team. The
  //      backend now answers it from memory in a fraction of a second, so 2s is both
  //      faster in practice AND far lighter.
  //   3. RETURN → the moment the app comes back to the foreground (visibility effect).
  // Refs (not state) are read inside these handlers so they always see the latest
  // values; stale-closure bugs were one reason calls to some people never showed.
  // ============================================================
  const incomingCallRef = useRef(null);
  useEffect(() => { incomingCallRef.current = incomingCall; }, [incomingCall]);
  const currentUserNameRef = useRef(null);
  useEffect(() => { currentUserNameRef.current = currentUserInfo?.name || null; }, [currentUserInfo?.name]);

  const ringIncomingCall = (call) => {
    if (!call || !call.callId) return;
    if (incomingCallRef.current) return; // already showing a ring — don't interrupt it
    if (seenCallIds.current.has(call.callId)) return;
    // Ignore stale calls (e.g. a delayed push for a call that's already over).
    const ageSecs = call.timestamp ? (Date.now() - new Date(call.timestamp).getTime()) / 1000 : 0;
    if (ageSecs > 120) return;
    seenCallIds.current.add(call.callId);
    const fresh = { callId: call.callId, from: call.from, type: call.type, timestamp: call.timestamp };
    incomingCallRef.current = fresh;
    setIncomingCall(fresh);
    startRinging();
    if (document.visibilityState !== 'visible') {
      fireDesktopNotification('📞 Incoming Call', `${fresh.from} — ${fresh.type}`);
    }
    if (incomingCallTimeoutRef.current) clearTimeout(incomingCallTimeoutRef.current);
    // Auto-mark as Missed if not answered.
    incomingCallTimeoutRef.current = setTimeout(() => {
      respondToIncomingCall(fresh.callId, 'Missed', true);
    }, 45000);
  };

  const callPollInFlightRef = useRef(false);
  const checkIncomingCalls = async () => {
    const myName = currentUserNameRef.current;
    if (!myName || incomingCallRef.current || callPollInFlightRef.current) return;
    callPollInFlightRef.current = true;
    try {
      const response = await fetch(API_URL + '?action=getIncomingCalls&userName=' + encodeURIComponent(myName));
      const data = await response.json();
      if (data.status === 'ok' && data.calls && data.calls.length > 0) {
        const fresh = data.calls.find(c => !seenCallIds.current.has(c.callId));
        if (fresh) ringIncomingCall(fresh);
      }
    } catch (error) {
    } finally {
      callPollInFlightRef.current = false;
    }
  };

  const respondToIncomingCall = (callId, response, isTimeout) => {
    stopRinging();
    fetch(API_URL, {
      method: 'POST', mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ action: 'respondToCall', callId, userName: currentUserNameRef.current || currentUserInfo?.name, response })
    });
    incomingCallRef.current = null;
    setIncomingCall(null);
  };

  const openCallCompose = () => {
    setCallRecipients([]);
    setShowCallCompose(true);
  };

  const toggleCallRecipient = (name) => {
    setCallRecipients(prev => prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]);
  };

  // FIX — "sometimes nothing shows after I press call": the caller's screen used to wait
  // for the whole server round-trip (sheet writes + pushes) before showing anything, and
  // if that request was slow or failed, the calling screen never appeared at all. The
  // call ID is now created right here, the "Calling..." tracker shows INSTANTLY, and the
  // request goes out in the background (retried once automatically if it fails).
  const sendCall = async (callType) => {
    if (callRecipients.length === 0) { alert('Select at least one person to call!'); return; }
    const recipients = [...callRecipients];
    const callId = 'call_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);
    setShowCallCompose(false);
    setOutgoingCall({ callId, callType, recipients: recipients.map(r => ({ to: r, response: 'Ringing' })) });

    const url = API_URL + '?action=startCall&from=' + encodeURIComponent(currentUserInfo.name) +
      '&to=' + encodeURIComponent(recipients.join(',')) + '&callType=' + encodeURIComponent(callType) +
      '&callId=' + encodeURIComponent(callId);
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.status === 'ok') return;
      } catch (error) {}
      await new Promise(r => setTimeout(r, 700));
    }
    // Both attempts failed — say so on the tracker instead of pretending it's ringing.
    setOutgoingCall(prev => prev && prev.callId === callId
      ? { ...prev, recipients: prev.recipients.map(r => ({ ...r, response: 'Failed' })) }
      : prev);
  };

  // Caller's live status — every 1.5s (the backend answers this from memory now).
  useEffect(() => {
    if (outgoingCall?.callId) {
      let cancelled = false;
      const poll = async () => {
        try {
          const response = await fetch(API_URL + '?action=getCallStatus&callId=' + encodeURIComponent(outgoingCall.callId));
          const data = await response.json();
          // Only apply real data — an empty list just means the call is still being
          // registered, and must not wipe out the "Ringing" rows already on screen.
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

  // Fallback poll — every 2s, only while the app is actually on screen (a hidden tab is
  // throttled by the browser anyway; push + the visibility check cover that case).
  useEffect(() => {
    if (!currentUser) return;
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') checkIncomingCalls();
    }, 2000);
    return () => clearInterval(interval);
  }, [currentUser]);

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
      const label = item.type === 'new_routine' ? '🔄 Routine task'
        : item.type === 'task_completed' ? '✅ Task completed'
        : item.type === 'new_meeting' ? '🤝 Meeting scheduled'
        : '📌 New task';
      const msg = item.type === 'task_completed' ? `✅ ${item.from} completed: ${item.title}`
        : item.type === 'new_meeting' ? `🤝 ${item.from} scheduled: ${item.title}`
        : `${label} from ${item.from}: ${item.title}`;
      playNotifSound();
      // NEW — clicking the toast itself now navigates straight to the task, same as
      // clicking the Inbox panel entry does, instead of only being clickable once you
      // open the bell icon.
      pushNotif(msg, item.taskId ? () => handleInboxItemClick(item) : undefined);
      fireDesktopNotification('WTC Task Hub', msg);
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
  const freshTasks = filteredTasks.filter(t => !t.isStale).sort(sortByDueDate);
  const staleTasks = filteredTasks.filter(t => t.isStale).sort(sortByDueDate);

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

  const handleExportWhatsApp = (task) => {
    const assignees = String(task.assignedTo).split(',').map(a => a.trim());
    const firstAssignee = team.find(t => t.name === assignees[0]);
    const personalURL = firstAssignee ? `https://wtc-task-hub.vercel.app/?user=${firstAssignee.id}` : 'https://wtc-task-hub.vercel.app';
    const message = `TASK ASSIGNED - WTC\n\nTo: ${task.assignedTo}\nTask: ${task.taskDetails}\nRemarks: ${task.remarks || 'N/A'}\nChannel: ${task.channel}\nPriority: ${task.priority}\nTarget: ${new Date(task.targetDate).toLocaleDateString()}\nBy: ${task.assignedBy}\n\nDashboard: ${personalURL}`;
    navigator.clipboard.writeText(message);
    alert('Message copied!');
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

  const handleInboxItemClick = (item) => {
    if (item.type === 'task_completed' || item.type === 'new_meeting') {
      // These have no further state to wait on (a meeting notification isn't "resolved"
      // by anything the way a task is by being Completed), so they dismiss on click.
      dismissedInboxIds.current.add(item.id);
      fetch(API_URL, {
        method: 'POST', mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({ action: 'markInboxRead', inboxId: item.id })
      });
      setInbox(prev => prev.filter(i => i.id !== item.id));
      if (item.type === 'new_meeting') { setShowInbox(false); openMeetings(); }
      return;
    }
    fetch(API_URL, {
      method: 'POST', mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ action: 'markInboxRead', inboxId: item.id })
    });
    setInbox(prev => prev.map(i => i.id === item.id ? { ...i, read: 'Yes' } : i));
    if (item.taskId) navigateToTask(item.taskId);
  };

  // NEW — auto-clears a task-assignment notification the moment its task is Completed
  // (not before, and not just because it was clicked/viewed).
  useEffect(() => {
    const linkedUnresolved = inbox.filter(i => (i.type === 'new_task' || i.type === 'new_routine'));
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
    'description', 'notes'];

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
        setContentChannelGroups(ordered);
      }
    } catch (e) {}
  };

  const openContentCalendar = () => {
    setShowContentCalendar(true);
    loadContentCalendar();
    loadContentChannels();
  };

  // Preload right after login, so the data is already there when the calendar opens.
  useEffect(() => {
    if (currentUser) loadContentCalendar();
  }, [currentUser]);

  // Refresh rhythm: every 4s while the calendar is open, every 60s in the background
  // (so the saved copy stays fresh), and only while the app is actually on screen.
  useEffect(() => {
    if (!currentUser) return;
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
  }, [currentUser, showContentCalendar]);

  const handleAddChannel = () => {
    const group = (newChannelGroup || '').trim();
    const channel = (newChannelName || '').trim();
    if (!group || !channel) { alert('Enter both a group name and a channel name.'); return; }
    setContentChannelGroups(prev => {
      const next = { ...prev };
      next[group] = [...(next[group] || []), channel];
      return next;
    });
    fetch(API_URL, {
      method: 'POST', mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ action: 'addContentChannel', groupName: group, channelName: channel })
    });
    setNewChannelName('');
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
      finalLink: '', thumbnailLink: '', designLink: '', rawLink: '', draftLink: '', description: '', notes: ''
    });
    setEditingContentEntry({});
  };

  const openEditContentEntry = (entry) => {
    setContentForm({
      channels: entry.channels, contentType: entry.contentType, title: entry.title,
      date: entry.date ? String(entry.date).slice(0, 10) : '', time: entry.time || '',
      assignedTo: entry.assignedTo ? String(entry.assignedTo).split(',').map(a => a.trim()) : [],
      editingStatus: entry.editingStatus || 'Not Started', videoStatus: entry.videoStatus || 'Not Started', priority: entry.priority || 'Medium',
      finalLink: entry.finalLink || '', thumbnailLink: entry.thumbnailLink || '', designLink: entry.designLink || '',
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
        body: JSON.stringify({ action: 'updateContentEntry', id: editingContentEntry.id, updates: payload })
      });
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
  const contentCalGridData = useMemo(() => {
    const entriesThisGroup = contentEntries.filter(e => e.channelGroup === contentGroupTab);
    const firstOfMonth = new Date(contentCalYear, contentCalMonth, 1);
    const startOffset = firstOfMonth.getDay(); // 0=Sun
    const daysInMon = new Date(contentCalYear, contentCalMonth + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < startOffset; i++) cells.push(null);
    for (let d = 1; d <= daysInMon; d++) cells.push(d);
    while (cells.length % 7 !== 0) cells.push(null);
    const holidaySet = {};
    holidays.forEach(h => { holidaySet[h.date] = h.name; });
    return { entriesThisGroup, cells, holidaySet };
  }, [contentGroupTab, contentEntries, contentCalYear, contentCalMonth, holidays]);

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

  const openMyRoutines = () => {
    setRoutineEndDraft({});
    setShowMyRoutines(true);
    loadTasksBackground();
  };

  const myRoutineRows = useMemo(() => {
    if (!currentUserInfo) return [];
    const me = currentUserInfo.name;
    const todayKey = localDateKey_(new Date());
    const templates = tasks.filter(t => t.taskType === 'Routine');
    const scoped = (isAdmin && routineScope === 'all')
      ? templates
      : templates.filter(t => isTaskAssignedToMe(t) || t.assignedBy === me);
    const rank = { active: 0, scheduled: 1, paused: 2 };
    return scoped.map(t => {
      const end = t.endDate ? String(t.endDate).slice(0, 10) : '';
      const start = t.startDate ? String(t.startDate).slice(0, 10) : '';
      let status = 'active';
      if (end && end < todayKey) status = 'paused';
      else if (start && start > todayKey) status = 'scheduled';
      const copies = tasks.filter(c => c.taskType === 'Routine Instance' &&
        c.taskDetails === t.taskDetails && c.assignedTo === t.assignedTo);
      const openCopies = copies.filter(c => c.status !== 'Completed').length;
      const doneCopies = copies.filter(c => c.status === 'Completed').length;
      let daysLeft = null;
      if (end && end >= todayKey) {
        daysLeft = Math.round((new Date(end + 'T12:00:00') - new Date(todayKey + 'T12:00:00')) / 86400000);
      }
      let totalDays = null;
      if (start && end) {
        totalDays = Math.round((new Date(end + 'T12:00:00') - new Date(start + 'T12:00:00')) / 86400000) + 1;
      }
      return { task: t, start, end, status, openCopies, doneCopies, daysLeft, totalDays };
    }).sort((a, b) => (rank[a.status] - rank[b.status]) ||
      String(a.task.taskDetails).localeCompare(String(b.task.taskDetails)));
  }, [tasks, currentUserInfo, routineScope, isAdmin]);

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
    fetch(API_URL, {
      method: 'POST', mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ action: 'updateRoutine', taskId: task.id, updates: { endDate }, userName: currentUserInfo.name })
    });
    setRoutineEndDraft(prev => { const next = { ...prev }; delete next[task.id]; return next; });
    if (doneMessage) pushNotif(doneMessage);
    setTimeout(() => { loadTasksBackground(); setRoutineBusyId(null); }, 1500);
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
    setTimeout(() => { loadTasksBackground(); setRoutineBusyId(null); }, 1500);
  };

  // "Track" — jump to the board filtered to recurring tasks, so every copy is visible.
  const viewRoutineCopiesOnBoard = () => {
    setShowMyRoutines(false);
    setFilterStatus([]);
    setFilterChannel([]);
    setFilterCategory([]);
    setFilterTaskType(['Routine']);
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
            <img src="/wtc-logo.png" alt="WTC" className="logo-premium" />
            <div className="brand-info">
              <h1 className="brand-title">WTC Hub</h1>
              <p className="brand-subtitle">{currentUserInfo?.role}</p>
            </div>
          </div>
          
          <div className="header-center">
            <p className="greeting-text">{greeting}</p>
            <p className="date-text">{formattedDate}</p>
            <p className="quote-text">"{todayQuote}"</p>
          </div>
          
          <div className="header-actions-premium">
            <div className="icon-dock">
              {notifPermission === 'default' && (
                <button className="icon-btn icon-gold notif-ask-btn" onClick={requestNotifPermission} title="Enable desktop notifications">
                  🔕
                </button>
              )}
              {notifPermission === 'denied' && (
                <button className="icon-btn notif-denied-btn" onClick={() => alert('Desktop notifications are blocked for this site in your browser.\n\nTo fix: click the 🔒 or ⓘ icon in your address bar → Site settings → Notifications → Allow. Then reload this page.')} title="Desktop notifications blocked — click for how to fix">
                  🚫
                </button>
              )}
              {notifPermission === 'granted' && (
                <button className="icon-btn icon-gold" onClick={sendTestNotification} title="Desktop notifications are ON — click to send a test">
                  🔔✓
                </button>
              )}
              <button className="icon-btn icon-rose" onClick={openContentCalendar} title="Content Calendar">
                🗓️
              </button>
              {/* NEW — every icon lives directly in the top bar now; nothing is tucked
                  away behind a "More" dropdown anymore. */}
              <button className="icon-btn icon-sky" onClick={openNoticeBoard} title="Notice Board">
                📋
              </button>
              <button className="icon-btn icon-amber" onClick={openHolidayCalendar} title="Holiday Calendar">
                🏖️
              </button>
              <button className="icon-btn icon-emerald" onClick={openMeetings} title="Team Meet">
                🤝
              </button>
              <button className="icon-btn icon-violet" onClick={openMyRoutines} title="My Recurring Tasks — pause, resume, set duration, remove">
                🔁
              </button>
              {canManageTeam && (
                <button className="icon-btn icon-violet" onClick={() => setShowTeamManager(true)} title="Manage Team">
                  👥
                </button>
              )}
              {canCall && (
                <button className="icon-btn icon-coral call-icon-btn" onClick={openCallCompose} title="Call / Summon">
                  📞
                </button>
              )}
              <button className="icon-btn icon-teal" onClick={openChat} title="Chat">
                💬
                {unreadChats > 0 && <span className="badge-count">{unreadChats}</span>}
              </button>
              <button className="icon-btn icon-gold" onClick={openInbox} title="Inbox">
                🔔
                {unreadInbox > 0 && <span className="badge-count">{unreadInbox}</span>}
              </button>
              <button
                className={`icon-btn ${manualRefreshing ? 'spinning' : ''}`}
                onClick={async () => {
                  if (manualRefreshing) return;
                  setManualRefreshing(true);
                  // FIX — uses the silent background loaders (no full-page "Loading..." block)
                  // so refreshing feels instant instead of blanking the whole dashboard.
                  await Promise.all([loadTasksBackground(), loadAttendanceBackground(), loadInboxBackground(), loadChatsBackground(), loadTeam()]);
                  setTimeout(() => setManualRefreshing(false), 500);
                }}
                title="Refresh"
              >
                🔄
              </button>
            </div>
            {!showArchive && (
              <button className="btn-new-task" onClick={() => setShowNewTaskForm(true)}>
                <span>+</span> New Task
              </button>
            )}
          </div>
        </div>
      </header>

      {showInbox && (
        <div className="side-panel">
          <div className="panel-header">
            <h3>📥 Your Inbox ({inbox.length})</h3>
            <button className="close-btn" onClick={() => setShowInbox(false)}>✕</button>
          </div>
          <div className="panel-body">
            {inbox.length === 0 ? (
              <p className="empty-text">No notifications yet</p>
            ) : (
              <>
                <p className="inbox-hint">Tap a notification to jump to it — task notifications clear on their own once completed</p>
                {inbox.map(item => (
                  <div key={item.id} className={`inbox-item ${item.read === 'No' ? 'unread' : ''}`} onClick={() => handleInboxItemClick(item)}>
                    <div className="inbox-icon">
                      {item.type === 'new_routine' ? '🔄'
                        : item.type === 'task_completed' ? '✅'
                        : item.type === 'new_meeting' ? '🤝'
                        : '📌'}
                    </div>
                    <div className="inbox-content">
                      <p className="inbox-title">
                        {item.type === 'new_routine' ? 'Routine task' : item.type === 'task_completed' ? 'Task completed' : item.type === 'new_meeting' ? 'Meeting scheduled' : 'New task'} from {item.from}
                      </p>
                      <p className="inbox-task">{item.title}</p>
                      <p className="inbox-time">{new Date(item.timestamp).toLocaleString()}</p>
                    </div>
                    <span className={`priority-tag ${item.priority.toLowerCase()}`}>{item.priority}</span>
                  </div>
                ))}
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
                <span><strong>{myRoutineRows.filter(r => r.status === 'paused').length}</strong> paused / ended</span>
                <span><strong>{myRoutineRows.reduce((n, r) => n + r.openCopies, 0)}</strong> open copies</span>
              </div>

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
                            {row.status === 'active' ? '● Active' : row.status === 'scheduled' ? '◷ Starts soon' : '⏸ Paused'}
                          </span>
                        </div>

                        <div className="routine-meta">
                          <span className="routine-chip">🔄 {describeRoutineFrequency(t, row.start)}</span>
                          <span className="routine-chip">👤 {t.assignedTo}</span>
                          {t.assignedBy && <span className="routine-chip">✍️ by {t.assignedBy}</span>}
                        </div>

                        <div className="routine-duration">
                          <div>
                            <label>Started</label>
                            <strong>{row.start ? formatNiceDate(row.start) : '—'}</strong>
                          </div>
                          <div>
                            <label>Ends</label>
                            <strong>{row.end ? formatNiceDate(row.end) : 'No end date'}</strong>
                          </div>
                          <div>
                            <label>{row.status === 'paused' ? 'Status' : 'Time left'}</label>
                            <strong>
                              {row.status === 'paused' ? 'Not repeating'
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

                        {editing ? (
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
                                  <span>🕐 {m.meetingTime}</span>
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
                      <input type="time" value={newMeeting.meetingTime} onChange={(e) => setNewMeeting({ ...newMeeting, meetingTime: e.target.value })} />
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
              {canManageTeam && (
                <button className="btn-secondary cc-manage-btn" onClick={() => setShowManageChannels(true)}>⚙️ Manage Channels</button>
              )}
              <button className="modal-close" onClick={() => { setShowContentCalendar(false); setEditingContentEntry(null); }}>✕</button>
            </div>
            <div className="modal-body compact-body">
              <div className="cc-group-tabs">
                {Object.keys(contentChannelGroups).map(group => (
                  <button key={group} className={contentGroupTab === group ? 'active' : ''} onClick={() => { setContentGroupTab(group); setExpandedContentDay(null); }}>{group}</button>
                ))}
              </div>

              <div className="month-nav" style={{ marginTop: '14px' }}>
                <button className="btn-secondary" onClick={() => { changeContentCalMonth(-1); setExpandedContentDay(null); }}>← Prev</button>
                <strong>{new Date(contentCalYear, contentCalMonth, 1).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</strong>
                <button className="btn-secondary" onClick={() => { changeContentCalMonth(1); setExpandedContentDay(null); }}>Next →</button>
              </div>

              <div className="cc-legend">
                {CONTENT_TYPES.map(t => (
                  <span key={t.value} className="cc-legend-item">
                    <span className="cc-legend-dot" style={{ background: t.color }}></span>
                    {t.icon} {t.value}
                  </span>
                ))}
                <span className="cc-legend-item"><span className="cc-tick" style={{ position: 'static' }}>✓</span> Posted</span>
                <span className="cc-legend-item"><span className="cc-holiday-dot"></span> Holiday</span>
              </div>

              {/* FIX — speed complaint: this grid used to be rebuilt from scratch, inline,
                  on every single render (every 1-second clock tick anywhere in the app).
                  contentCalGridData (useMemo'd in the component body, see above) means it
                  only recomputes when the entries, tab, month, year, or holidays actually
                  change — which is the real reason it now feels fast. */}
              {(() => {
                const { entriesThisGroup, cells, holidaySet } = contentCalGridData;
                const todayStr = new Date().toISOString().slice(0, 10);
                const MAX_CHIPS = 3;

                return (
                  <div className="cc-calendar-grid">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                      <div key={d} className="cc-day-header">{d}</div>
                    ))}
                    {cells.map((day, idx) => {
                      if (day === null) return <div key={idx} className="cc-day-cell cc-day-empty"></div>;
                      const dateStr = `${contentCalYear}-${String(contentCalMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                      const dayEntries = entriesThisGroup.filter(e => String(e.date).slice(0, 10) === dateStr)
                        .sort((a, b) => (a.time || '').localeCompare(b.time || ''));
                      const isToday = dateStr === todayStr;
                      const holidayName = holidaySet[dateStr];
                      const visibleEntries = dayEntries.slice(0, MAX_CHIPS);
                      const extraCount = dayEntries.length - visibleEntries.length;
                      return (
                        <div
                          key={idx}
                          className={`cc-day-cell ${isToday ? 'cc-today' : ''} ${holidayName ? 'cc-holiday' : ''}`}
                          onClick={() => openNewContentEntry(dateStr)}
                        >
                          <div className="cc-day-top">
                            {isToday ? <span className="cc-day-num-today">{day}</span> : <span className="cc-day-num">{day}</span>}
                            {holidayName && <span className="cc-holiday-ribbon" title={holidayName}>{holidayName}</span>}
                          </div>
                          <div className="cc-day-entries">
                            {visibleEntries.map(entry => {
                              const typeInfo = CONTENT_TYPES.find(t => t.value === entry.contentType) || CONTENT_TYPES[0];
                              const isPublished = entry.videoStatus === 'Published';
                              return (
                                <div
                                  key={entry.id}
                                  className={`cc-chip ${isPublished ? 'cc-posted' : ''} ${String(entry.id).startsWith('tmp_') ? 'cc-chip-saving' : ''}`}
                                  style={{ '--chip': typeInfo.color }}
                                  onClick={(e) => { e.stopPropagation(); openEditContentEntry(entry); }}
                                  title={entry.title}
                                >
                                  {isPublished && <span className="cc-tick">✓</span>}
                                  {entry.time && <span className="cc-chip-time">{entry.time}</span>}
                                  <span className="cc-chip-icon">{typeInfo.icon}</span>
                                  <span className="cc-chip-title">{entry.title}</span>
                                </div>
                              );
                            })}
                            {extraCount > 0 && (
                              <div
                                className="cc-chip cc-chip-more"
                                onClick={(e) => { e.stopPropagation(); setExpandedContentDay({ dateStr, day }); }}
                              >
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
                      const typeInfo = CONTENT_TYPES.find(t => t.value === entry.contentType) || CONTENT_TYPES[0];
                      const videoInfo = VIDEO_STATUSES.find(s => s.value === entry.videoStatus) || VIDEO_STATUSES[0];
                      const isPublished = entry.videoStatus === 'Published';
                      return (
                        <div
                          key={entry.id}
                          className={`cc-entry-card ${isPublished ? 'cc-posted' : ''}`}
                          onClick={() => { setExpandedContentDay(null); openEditContentEntry(entry); }}
                        >
                          <div className="cc-entry-title">
                            {isPublished && <span className="cc-tick">✓</span>}
                            {entry.time && <strong>{entry.time} — </strong>}{entry.title}
                          </div>
                          <div className="cc-entry-badges">
                            <span className="cc-badge" style={{ background: typeInfo.color + '22', color: typeInfo.color }}>{typeInfo.icon} {typeInfo.value}</span>
                            <span className="cc-badge" style={{ background: videoInfo.color + '22', color: videoInfo.color }}>{videoInfo.icon} {videoInfo.value}</span>
                          </div>
                        </div>
                      );
                    })}
                  <button className="btn-success" style={{ marginTop: '10px' }} onClick={() => { const d = expandedContentDay.dateStr; setExpandedContentDay(null); openNewContentEntry(d); }}>+ Add another</button>
                </div>
              </div>
            </div>
          )}

          {/* Manage Channels — PC/Shivendra/Pari can add or remove a channel group or a
              channel within a group, straight from the app. */}
          {showManageChannels && (
            <div className="modal-overlay" onClick={() => setShowManageChannels(false)}>
              <div className="modal-content compact" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h3>⚙️ Manage Channels</h3>
                  <button className="modal-close" onClick={() => setShowManageChannels(false)}>✕</button>
                </div>
                <div className="modal-body compact-body">
                  <div className="form-row">
                    <div className="form-group">
                      <label>Group name</label>
                      <input type="text" list="cc-existing-groups" placeholder="e.g. Akshat Gupta" value={newChannelGroup} onChange={(e) => setNewChannelGroup(e.target.value)} />
                      <datalist id="cc-existing-groups">
                        {Object.keys(contentChannelGroups).map(g => <option key={g} value={g} />)}
                      </datalist>
                    </div>
                    <div className="form-group">
                      <label>Channel name</label>
                      <input type="text" placeholder="e.g. AG Insta" value={newChannelName} onChange={(e) => setNewChannelName(e.target.value)} />
                    </div>
                  </div>
                  <button className="btn-success" onClick={handleAddChannel}>+ Add Channel</button>

                  <div className="cc-channel-manage-list">
                    {Object.keys(contentChannelGroups).map(group => (
                      <div key={group} className="cc-channel-manage-group">
                        <strong>{group}</strong>
                        <div className="cc-channel-manage-chips">
                          {(contentChannelGroups[group] || []).map(ch => (
                            <span key={ch} className="cc-channel-manage-chip">
                              {ch}
                              <button onClick={() => handleDeleteChannel(group, ch)} title="Remove">✕</button>
                            </span>
                          ))}
                        </div>
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
                        {(contentChannelGroups[contentGroupTab] || []).map(ch => <option key={ch} value={ch}>{ch}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Content Type</label>
                      <select value={contentForm.contentType} onChange={(e) => setContentForm({ ...contentForm, contentType: e.target.value })}>
                        {CONTENT_TYPES.map(t => <option key={t.value} value={t.value}>{t.icon} {t.value}</option>)}
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
                      <input type="time" value={contentForm.time} onChange={(e) => setContentForm({ ...contentForm, time: e.target.value })} />
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
                      <input type="text" value={contentForm.rawLink} onChange={(e) => setContentForm({ ...contentForm, rawLink: e.target.value })} placeholder="https://..." />
                    </div>
                    <div className="form-group">
                      <label>Draft/Editing Link</label>
                      <input type="text" value={contentForm.draftLink} onChange={(e) => setContentForm({ ...contentForm, draftLink: e.target.value })} placeholder="https://..." />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Final Editing Link</label>
                      <input type="text" value={contentForm.finalLink} onChange={(e) => setContentForm({ ...contentForm, finalLink: e.target.value })} placeholder="https://... (fully cut file, ready to publish)" />
                    </div>
                    <div className="form-group">
                      <label>Thumbnail Link</label>
                      <input type="text" value={contentForm.thumbnailLink} onChange={(e) => setContentForm({ ...contentForm, thumbnailLink: e.target.value })} placeholder="https://..." />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Design Link</label>
                    <input type="text" value={contentForm.designLink} onChange={(e) => setContentForm({ ...contentForm, designLink: e.target.value })} placeholder="https://... (Canva/Figma/PSD source, etc.)" />
                  </div>

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
                    <button className="btn-secondary" onClick={handleDeleteContentEntry} style={{ marginRight: 'auto', color: 'var(--danger)' }}>🗑️ Delete</button>
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
                    </div>
                  ))}
                </div>
              </div>
              <p className="reminder-window-hint">This rings on their dashboard with a full-screen alert and sound — not an actual audio/video call, just a fast way to summon someone.</p>
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

      {/* LUNCH ALARM — fires 1:00 PM sharp, distinct tone, 30s auto-dismiss */}
      {showLunchAlarm && (
        <div className="incoming-call-overlay lunch-alarm-overlay">
          <div className="incoming-call-card">
            <div className="incoming-call-avatar lunch-alarm-avatar">🍽️</div>
            <h2>Lunch Time!</h2>
            <p className="incoming-call-type">Take your 45-minute break</p>
            <div className="incoming-call-actions">
              <button className="btn-accept-call" onClick={dismissLunchAlarm}>✓ Got it</button>
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
            <p className="meeting-alarm-meta">🕐 {activeMeetingAlarm.meetingTime} · 👥 {activeMeetingAlarm.assignedTo}</p>
            <div className="incoming-call-actions">
              <button className="btn-accept-call" onClick={dismissMeetingAlarm}>✓ Got it</button>
            </div>
          </div>
        </div>
      )}

      {!loading && (
        <>
          {(!isAdmin || isHR) && (
            <div className="attendance-card-premium">
              <div className="attendance-card-header">
                <h3>⏰ Your Attendance Today</h3>
                <button className="btn-monthly-attendance" onClick={openMonthlyAttendance}>📅 Monthly Attendance</button>
              </div>
              <div className="attendance-info">
                <div className="status-badge" style={{background: attendanceColors[myStatus] + '20', color: attendanceColors[myStatus]}}>
                  {myStatus}
                </div>
                {(myLiveLog || attendance.find(a => a.userId === currentUser)) && (
                  <div className="time-info">
                    {(() => {
                      const log = myLiveLog || attendance.find(a => a.userId === currentUser)?.log;
                      const times = calculateWorkingTime(log);
                      return (
                        <>
                          <div>⏱️ <strong>{times.working}</strong></div>
                          <div>☕ <strong>{times.breaks}</strong></div>
                          <div>📊 <strong>{times.productivity}%</strong></div>
                        </>
                      );
                    })()}
                  </div>
                )}
              </div>
              <div className="attendance-buttons">
                {myStatus === 'Not Signed In' || myStatus === 'Signed Out' ? (
                  <button className="btn-signin" onClick={() => updateMyStatus('Working')} disabled={attendanceSwitching}>🟢 Sign In</button>
                ) : (
                  <>
                    {myStatus !== 'Working' && <button className="btn-resume" onClick={() => updateMyStatus('Working')} disabled={attendanceSwitching}>🟢 Back to Work</button>}
                    {myStatus !== 'Lunch Break' && <button className="btn-lunch" onClick={() => updateMyStatus('Lunch Break')} disabled={attendanceSwitching}>🍽️ Lunch</button>}
                    {myStatus !== 'Meeting' && <button className="btn-meeting" onClick={() => updateMyStatus('Meeting')} disabled={attendanceSwitching}>🤝 Meeting</button>}
                    <button className="btn-signout" onClick={() => updateMyStatus('Signed Out')} disabled={attendanceSwitching}>🚪 Sign Out</button>
                  </>
                )}
              </div>
            </div>
          )}

          {(isAdmin || isHR) && (
            <div className="team-status-section">
              <div className="section-header" onClick={() => setShowAttendance(!showAttendance)}>
                <h3>📊 Team Status Today {showAttendance ? '▼' : '▶'}</h3>
              </div>
              {showAttendance && (
                <div className="team-status-grid">
                  {/* FIX #3 — Pari (HR) now included alongside regular team members */}
                  {activeTeam.filter(m => !m.isAdmin).map(member => {
                    const memberAttendance = attendance.find(a => a.userId === member.id);
                    const status = memberAttendance?.status || 'Not Signed In';
                    const times = memberAttendance ? calculateWorkingTime(memberAttendance.log) : { working: '0h 0m 0s', breaks: '0h 0m 0s', productivity: 0 };
                    return (
                      <div key={member.id} className="status-card">
                        <div className="status-avatar" style={{background: attendanceColors[status]}}>{member.avatar}</div>
                        <div className="status-details">
                          <strong>{member.displayName} {member.isHR ? '(HR)' : ''}</strong>
                          <span className="status-text" style={{color: attendanceColors[status]}}>{status}</span>
                          <span className="status-time">⏱️ {times.working} | ☕ {times.breaks} | 📊 {times.productivity}%</span>
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
                  options={channels}
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
                  const todayForUrgency = new Date();
                  todayForUrgency.setHours(0, 0, 0, 0);

                  const renderTaskCard = (task) => {
                    const isCompleted = task.status === 'Completed';
                    const canChangeStatus = isAdmin || !isCompleted;
                    const canEdit = isAdmin || !isCompleted;
                    const isRoutine = task.taskType === 'Routine' || task.taskType === 'Routine Instance';
                    const channelList = String(task.channel).split(',').map(c => c.trim()).filter(c => c);
                    const isUrgent = task.priority === 'High' && task.delayDays > 0;

                    // FIX — routine tasks now visually differ by urgency: due today/overdue
                    // gets a red flash so it can't be missed; still a few days out fades
                    // slightly so it doesn't compete for attention with what's actually urgent.
                    let routineUrgencyClass = '';
                    if (isRoutine && !isCompleted && task.targetDate) {
                      const dueDate = new Date(task.targetDate);
                      dueDate.setHours(0, 0, 0, 0);
                      const daysUntilDue = Math.round((dueDate - todayForUrgency) / (1000 * 60 * 60 * 24));
                      routineUrgencyClass = daysUntilDue <= 1 ? 'routine-urgent' : 'routine-fade';
                    }

                    return (
                      <div key={task.id} id={`task-card-${task.id}`} className={`task-card ${task.delayDays > 0 ? 'overdue' : ''} ${isCompleted ? 'completed' : ''} ${isRoutine ? 'routine' : ''} ${routineUrgencyClass} ${String(highlightTaskId) === String(task.id) ? 'task-highlighted' : ''}`}>
                        <div className={`priority-strip ${task.priority.toLowerCase()} ${isUrgent ? 'urgent-shimmer' : ''}`}></div>
                        {isRoutine && <div className="routine-tag">🔄 Routine Task</div>}
                        {task.delayDays > 0 && <div className="alert-banner">⚠️ Delayed by {task.delayDays} day(s)</div>}
                        <div className="task-header">
                          <div className="task-title-row">
                            <h3>{task.taskDetails}</h3>
                            {canEdit && (
                              <button className="btn-edit-task" onClick={() => openEditTask(task)} title="Edit task">✏️</button>
                            )}
                          </div>
                          <div className="badges">
                            {channelList.map(ch => <span key={ch} className="badge-channel">{ch}</span>)}
                            <span className={`badge-priority ${task.priority.toLowerCase()}`}>{task.priority}</span>
                            {task.category && <span className="badge-category">{task.category}</span>}
                          </div>
                          {task.remarks && <p className="task-remarks">💬 {task.remarks}</p>}
                        </div>
                        <div className="task-meta">
                          <div className="assignee-row">
                            <span className="meta-label">Assigned to:</span>
                            <div className="assignee-avatars">
                              {String(task.assignedTo).split(',').map(a => a.trim()).map(name => (
                                <span key={name} className="mini-avatar-wrap" title={name}>
                                  <span className="mini-avatar">{getAvatarForName(name)}</span>
                                  {isPresent(name) && <span className="presence-dot" title="Currently working"></span>}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className="meta-row">
                            <span>📌 By: <strong>{task.assignedBy}</strong></span>
                            <span className="date-badge">📅 {new Date(task.targetDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                          </div>
                        </div>
                        <div className="task-footer">
                          <select
                            value={task.status}
                            onChange={(e) => handleStatusChange(task.id, e.target.value)}
                            className={`status-select ${!canChangeStatus ? 'locked' : ''}`}
                            style={{ color: statusColors[task.status] }}
                            disabled={!canChangeStatus}
                          >
                            <option value="Not Started">Not Started</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed {isCompleted && !isAdmin ? '🔒' : ''}</option>
                            <option value="On Hold">On Hold</option>
                            <option value="Delayed">Delayed</option>
                          </select>
                          <button className="btn-whatsapp" onClick={() => handleExportWhatsApp(task)}>WA</button>
                          {isAdmin && (
                            <button className="btn-delete-task" title="Delete task" onClick={() => handleDeleteTask(task)}>🗑️</button>
                          )}
                        </div>
                      </div>
                    );
                  };

                  return (
                    <>
                      {freshTasks.length === 0 && staleTasks.length === 0 ? (
                        <div className="empty-state">
                          <div className="empty-state-icon">🎉</div>
                          <p className="empty-state-title">You're all caught up!</p>
                          <p className="empty-state-sub">No tasks to show here right now.</p>
                        </div>
                      ) : (
                        <>
                          {freshTasks.length > 0 && (
                            <div className={`tasks-grid ${freshTasks.length > 12 ? 'compact-cards' : ''}`}>
                              {freshTasks.map(renderTaskCard)}
                            </div>
                          )}
                          {staleTasks.length > 0 && (
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
                  {channels.map(ch => (
                    <div 
                      key={ch}
                      className={`channel-chip ${selectedChannels.includes(ch) ? 'checked' : ''}`}
                      onClick={() => toggleChannel(ch)}
                    >
                      {ch}
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