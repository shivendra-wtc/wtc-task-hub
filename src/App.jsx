import { useState, useEffect, useRef } from 'react'
import './App.css'

const API_URL = "https://script.google.com/macros/s/AKfycbxhrBrgG4x5U6v7YzYYbREaptULHIKprzL5ZAdCUySbdQBrqTkib2mEdujKYensAhkR-A/exec";

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
  { id: 'nidhi', name: 'Nidhi', displayName: 'Nidhi', role: 'Poorvaj', avatar: 'NV', quoteType: 'social_media', active: true },
  { id: 'samanta', name: 'Samanta', displayName: 'Samanta', role: 'Social Media Exec & Design', avatar: 'SP', quoteType: 'social_media', active: true },
  { id: 'muskan', name: 'Muskan', displayName: 'Muskan', role: 'Devastram', avatar: 'MC', quoteType: 'social_media', active: true },
  { id: 'sanjeevani', name: 'Sanjeevani', displayName: 'Sanjeevani', role: 'PR Manager', avatar: 'SJ', quoteType: 'pr', active: true },
  { id: 'pari', name: 'Pari', displayName: 'Pari', role: 'HR', avatar: 'PA', quoteType: 'hr', isHR: true, active: true },
  { id: 'khushi', name: 'Khushi', displayName: 'Khushi', role: 'Social Media Exec & Design', avatar: 'KJ', quoteType: 'social_media', active: true },
  { id: 'saraswati', name: 'Saraswati', displayName: 'Saraswati', role: 'Social Media Exec & Design', avatar: 'SR', quoteType: 'social_media', active: true },
  { id: 'charu', name: 'Charu', displayName: 'Charu', role: 'Social Media Exec & Design', avatar: 'CN', quoteType: 'social_media', active: true },
  { id: 'naman', name: 'Naman', displayName: 'Naman', role: 'Video Editor', avatar: 'NJ', quoteType: 'video_editor', active: true },
  { id: 'karan', name: 'Karan', displayName: 'Karan', role: 'Video Editor', avatar: 'KR', quoteType: 'video_editor', active: true },
  { id: 'jagdish', name: 'Jagdish', displayName: 'Jagdish', role: 'Team Member', avatar: 'JS', quoteType: 'social_media', active: true }
];

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
    'HisTree YT', 'HisTree Insta', 'AG.books Insta',
    "The 7c's YT", "The 7c's Insta", 'Spotify', 'LinkedIn', 'Twitter',
    'Poorvaj Insta', 'Devastram Insta', 'Other'
  ];

  // FIX — Content Calendar channel groups. Each group gets its own calendar tab.
  const CONTENT_CHANNEL_GROUPS = {
    "Akshat Gupta": ['AG Insta', 'AG YT', 'AG.books Insta', 'Spotify', 'LinkedIn', 'Twitter'],
    "The Fact-Tree": ['The Fact-Tree YT', 'The Fact-Tree Insta'],
    "HisTree": ['HisTree YT', 'HisTree Insta'],
    "The 7C's": ["The 7c's YT", "The 7c's Insta"],
    "Poorvaj": ['Poorvaj Insta'],
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
  const [team, setTeam] = useState(() => cacheGet('team') || DEFAULT_TEAM);
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
  const [contentEntries, setContentEntries] = useState([]);
  const [contentGroupTab, setContentGroupTab] = useState('Akshat Gupta');
  const now2_ = new Date();
  const [contentCalYear, setContentCalYear] = useState(now2_.getFullYear());
  const [contentCalMonth, setContentCalMonth] = useState(now2_.getMonth()); // 0-11
  const [editingContentEntry, setEditingContentEntry] = useState(null); // null = closed, {} = new, {...} = editing
  const [contentForm, setContentForm] = useState({
    channels: '', contentType: 'Long Format Video', title: '', date: '',
    assignedTo: [], editingStatus: 'Not Started', videoStatus: 'Not Started', priority: 'Medium',
    finalLink: '', thumbnailLink: '', rawLink: '', draftLink: '', description: '', notes: ''
  });
  const [contentSaving, setContentSaving] = useState(false);
  const [notices, setNotices] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [newNoticeTitle, setNewNoticeTitle] = useState('');
  const [newNoticeMessage, setNewNoticeMessage] = useState('');
  const [newNoticePinned, setNewNoticePinned] = useState(false);
  const [noticeSaving, setNoticeSaving] = useState(false);
  const [manualRefreshing, setManualRefreshing] = useState(false);
  const [showOlderRoutine, setShowOlderRoutine] = useState(false);
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
  const canManageTeam = currentUser === 'pcwtc45' || currentUser === 'shivendrawtc77';
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

  const requestNotifPermission = () => {
    if (typeof Notification === 'undefined') return;
    Notification.requestPermission().then(perm => setNotifPermission(perm));
  };

  const sendTestNotification = () => {
    fireDesktopNotification('WTC Task Hub', '🔔 Test notification — if you see this in your OS notification tray, desktop alerts are working correctly.');
  };

  const pushNotif = (message) => {
    const notifId = Date.now() + Math.random();
    setNotifQueue(q => [...q, { id: notifId, message }]);
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

  // Synthesizes a classic two-tone phone ring using the Web Audio API — deliberately
  // distinct from the task-notification "ding" so a call is unmistakable at a glance/listen.
  // FIX — made louder (gain 0.25 → 0.55) and more urgent (repeats every 1.1s instead of
  // 1.3s, with a fuller triple-burst pattern) so it's genuinely hard to miss across a desk.
  const playRingTone = () => {
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      if (!ringAudioCtxRef.current) ringAudioCtxRef.current = new Ctx();
      const ctx = ringAudioCtxRef.current;
      const playTone = (freq, start, duration) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.001, ctx.currentTime + start);
        gain.gain.exponentialRampToValueAtTime(0.55, ctx.currentTime + start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + start);
        osc.stop(ctx.currentTime + start + duration + 0.05);
      };
      // fuller triple-burst ring pattern
      playTone(950, 0, 0.35);
      playTone(1400, 0, 0.35);
      playTone(950, 0.42, 0.35);
      playTone(1400, 0.42, 0.35);
      playTone(950, 0.84, 0.35);
      playTone(1400, 0.84, 0.35);
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

  // Distinct synthesized alarm — a rising two-tone chirp, deliberately different from
  // both the call ring (two-tone burst) and the notification ding (single beep), so all
  // three are instantly recognizable by ear alone.
  const playAlarmTone = () => {
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      if (!ringAudioCtxRef.current) ringAudioCtxRef.current = new Ctx();
      const ctx = ringAudioCtxRef.current;
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

  const checkIncomingCalls = async () => {
    if (!currentUserInfo || incomingCall) return; // don't interrupt an already-showing ring
    try {
      const response = await fetch(API_URL + '?action=getIncomingCalls&userName=' + encodeURIComponent(currentUserInfo.name));
      const data = await response.json();
      if (data.status === 'ok' && data.calls.length > 0) {
        const fresh = data.calls.find(c => !seenCallIds.current.has(c.callId));
        if (fresh) {
          seenCallIds.current.add(fresh.callId);
          setIncomingCall(fresh);
          startRinging();
          fireDesktopNotification('📞 Incoming Call', `${fresh.from} — ${fresh.type}`);
          // 30-second auto-timeout if ignored
          incomingCallTimeoutRef.current = setTimeout(() => {
            respondToIncomingCall(fresh.callId, 'Missed', true);
          }, 45000);
        }
      }
    } catch (error) {}
  };

  const respondToIncomingCall = (callId, response, isTimeout) => {
    stopRinging();
    fetch(API_URL, {
      method: 'POST', mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ action: 'respondToCall', callId, userName: currentUserInfo.name, response })
    });
    setIncomingCall(null);
  };

  const openCallCompose = () => {
    setCallRecipients([]);
    setShowCallCompose(true);
  };

  const toggleCallRecipient = (name) => {
    setCallRecipients(prev => prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]);
  };

  const sendCall = async (callType) => {
    if (callRecipients.length === 0) { alert('Select at least one person to call!'); return; }
    setShowCallCompose(false);
    try {
      const response = await fetch(API_URL + '?action=startCall&from=' + encodeURIComponent(currentUserInfo.name) +
        '&to=' + encodeURIComponent(callRecipients.join(',')) + '&callType=' + encodeURIComponent(callType));
      const data = await response.json();
      if (data.status === 'ok') {
        setOutgoingCall({ callId: data.callId, callType, recipients: callRecipients.map(r => ({ to: r, response: 'Ringing' })) });
      }
    } catch (error) {}
  };

  // While the sender has the live status tracker open, poll every 3s so accept/decline
  // shows up quickly without needing a full page refresh.
  useEffect(() => {
    if (outgoingCall?.callId) {
      const poll = async () => {
        try {
          const response = await fetch(API_URL + '?action=getCallStatus&callId=' + encodeURIComponent(outgoingCall.callId));
          const data = await response.json();
          if (data.status === 'ok') {
            setOutgoingCall(prev => prev ? { ...prev, recipients: data.recipients } : prev);
          }
        } catch (error) {}
      };
      poll();
      const interval = setInterval(poll, 3000);
      return () => clearInterval(interval);
    }
  }, [outgoingCall?.callId]);

  // Poll for incoming calls every 3s while the tab is active (fast enough to feel
  // immediate) — separate from the main 15s background sync interval.
  // FIX — currentUserInfo?.name is in the dependency array on purpose: without it, if team
  // data (from loadTeam) resolves even a moment AFTER this effect's first run, the interval
  // callback stays permanently stuck with the stale "not loaded yet" closure forever (since
  // nothing else in the array ever changes), and checkIncomingCalls silently no-ops on every
  // single tick. This is exactly why calls to newer team members weren't arriving.
  useEffect(() => {
    if (currentUser) {
      const interval = setInterval(checkIncomingCalls, 3000);
      return () => clearInterval(interval);
    }
  }, [currentUser, incomingCall, currentUserInfo?.name]);

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
        checkIncomingCalls();
        loadTasksBackground();
        loadInboxBackground();
        loadChatsBackground();
        loadAttendanceBackground();
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
        const merged = [...data.team, ...missingDefaults];
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
      const label = item.type === 'new_routine' ? '🔄 Routine task' : '📌 New task';
      const msg = `${label} from ${item.from}: ${item.title}`;
      playNotifSound();
      pushNotif(msg);
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
      pushNotif(`💬 New message from ${msg.from}`);
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
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      if (!ringAudioCtxRef.current) ringAudioCtxRef.current = new Ctx();
      const ctx = ringAudioCtxRef.current;
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

  const CONFETTI_COLORS = ['#c9a961', '#1a3a5c', '#2c5aa0', '#059669', '#dc2626', '#7c3aed'];
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
  // Clicking a specific notification marks only that one read and removes it right
  // away; everything else stays until you click it too. Also records the dismissal
  // permanently (dismissedInboxIds) so a background poll racing ahead of the server
  // write can never make it pop back into the list.
  const handleInboxItemClick = (item) => {
    dismissedInboxIds.current.add(item.id);
    fetch(API_URL, {
      method: 'POST', mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ action: 'markInboxRead', inboxId: item.id })
    });
    setInbox(prev => prev.filter(i => i.id !== item.id));
  };

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
    if (holidays.length === 0) loadHolidays();
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
  // CONTENT CALENDAR — everyone reads/writes; entries auto-create a linked Task
  // ============================================================
  const loadContentCalendar = async () => {
    try {
      const response = await fetch(API_URL + '?action=getContentCalendar');
      const data = await response.json();
      if (data.status === 'ok') setContentEntries(data.entries);
    } catch (e) {}
  };

  const openContentCalendar = () => {
    setShowContentCalendar(true);
    loadContentCalendar();
  };

  // Real-time while open
  useEffect(() => {
    if (showContentCalendar) {
      const interval = setInterval(loadContentCalendar, 15000);
      return () => clearInterval(interval);
    }
  }, [showContentCalendar]);

  const changeContentCalMonth = (delta) => {
    let m = contentCalMonth + delta, y = contentCalYear;
    if (m > 11) { m = 0; y++; }
    if (m < 0) { m = 11; y--; }
    setContentCalMonth(m);
    setContentCalYear(y);
  };

  const openNewContentEntry = (dateStr) => {
    setContentForm({
      channels: CONTENT_CHANNEL_GROUPS[contentGroupTab][0], contentType: 'Long Format Video',
      title: '', date: dateStr || '', assignedTo: [], editingStatus: 'Not Started', videoStatus: 'Not Started', priority: 'Medium',
      finalLink: '', thumbnailLink: '', rawLink: '', draftLink: '', description: '', notes: ''
    });
    setEditingContentEntry({});
  };

  const openEditContentEntry = (entry) => {
    setContentForm({
      channels: entry.channels, contentType: entry.contentType, title: entry.title,
      date: entry.date ? String(entry.date).slice(0, 10) : '',
      assignedTo: entry.assignedTo ? String(entry.assignedTo).split(',').map(a => a.trim()) : [],
      editingStatus: entry.editingStatus || 'Not Started', videoStatus: entry.videoStatus || 'Not Started', priority: entry.priority || 'Medium',
      finalLink: entry.finalLink || '', thumbnailLink: entry.thumbnailLink || '',
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
    const payload = {
      channelGroup: contentGroupTab,
      channels: contentForm.channels,
      contentType: contentForm.contentType,
      title: contentForm.title.trim(),
      date: contentForm.date,
      assignedTo: contentForm.assignedTo.join(', '),
      editingStatus: contentForm.editingStatus,
      videoStatus: contentForm.videoStatus,
      priority: contentForm.priority,
      finalLink: contentForm.finalLink.trim(),
      thumbnailLink: contentForm.thumbnailLink.trim(),
      rawLink: contentForm.rawLink.trim(),
      draftLink: contentForm.draftLink.trim(),
      description: contentForm.description.trim(),
      notes: contentForm.notes.trim(),
      createdBy: currentUserInfo.name
    };

    if (isNew) {
      fetch(API_URL, {
        method: 'POST', mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({ action: 'addContentEntry', entry: payload })
      });
    } else {
      fetch(API_URL, {
        method: 'POST', mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({ action: 'updateContentEntry', id: editingContentEntry.id, updates: payload })
      });
    }
    setTimeout(() => {
      loadContentCalendar();
      if (!isNew) loadTasksBackground(); // linked task status may have changed
      setEditingContentEntry(null);
      setContentSaving(false);
    }, 1200);
  };

  const handleDeleteContentEntry = () => {
    if (!editingContentEntry?.id) return;
    if (!confirm('Delete this content entry? (The linked task, if any, will stay on the task board.)')) return;
    fetch(API_URL, {
      method: 'POST', mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ action: 'deleteContentEntry', id: editingContentEntry.id })
    });
    setContentEntries(prev => prev.filter(e => e.id !== editingContentEntry.id));
    setEditingContentEntry(null);
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
          <div key={n.id} className="notif-popup">
            <div className="notif-icon">🔔</div>
            <div className="notif-msg">{n.message}</div>
            <button className="notif-close" onClick={() => setNotifQueue(q => q.filter(x => x.id !== n.id))}>✕</button>
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
                🎬
              </button>
              {/* FIX — Notice Board + Holiday Calendar consolidated into one "More" dropdown
                  instead of two separate always-visible icons — these are reference/occasional
                  items, unlike Content Calendar which people check daily. */}
              <div className="more-menu-wrap">
                <button className="icon-btn icon-sky" onClick={() => setShowMoreMenu(!showMoreMenu)} title="More">
                  ⋮
                </button>
                {showMoreMenu && (
                  <div className="more-menu-dropdown" onMouseLeave={() => setShowMoreMenu(false)}>
                    <button onClick={() => { setShowMoreMenu(false); openNoticeBoard(); }}>📋 Notice Board</button>
                    <button onClick={() => { setShowMoreMenu(false); openHolidayCalendar(); }}>🗓️ Holiday Calendar</button>
                  </div>
                )}
              </div>
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
                <p className="inbox-hint">Tap a notification to clear it</p>
                {inbox.map(item => (
                  <div key={item.id} className={`inbox-item ${item.read === 'No' ? 'unread' : ''}`} onClick={() => handleInboxItemClick(item)}>
                    <div className="inbox-icon">{item.type === 'new_routine' ? '🔄' : '📌'}</div>
                    <div className="inbox-content">
                      <p className="inbox-title">{item.type === 'new_routine' ? 'Routine task' : 'New task'} from {item.from}</p>
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
              <h3>🗓️ Holiday Calendar 2026</h3>
              <button className="modal-close" onClick={() => setShowHolidayCalendar(false)}>✕</button>
            </div>
            <div className="modal-body compact-body">
              {holidays.length === 0 ? (
                <p className="empty-text">Loading...</p>
              ) : (
                <div className="holiday-grid">
                  {holidays.map(h => {
                    const d = new Date(h.date + 'T12:00:00');
                    return (
                      <div key={h.date} className="holiday-card">
                        <div className="holiday-card-date">
                          <span className="holiday-day">{d.getDate()}</span>
                          <span className="holiday-month">{d.toLocaleDateString('en-IN', { month: 'short' })}</span>
                        </div>
                        <div className="holiday-card-info">
                          <strong>{h.name}</strong>
                          <span>{d.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric' })}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
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
              <h3>🎬 Content Calendar</h3>
              <button className="modal-close" onClick={() => { setShowContentCalendar(false); setEditingContentEntry(null); }}>✕</button>
            </div>
            <div className="modal-body compact-body">
              <div className="cc-group-tabs">
                {Object.keys(CONTENT_CHANNEL_GROUPS).map(group => (
                  <button key={group} className={contentGroupTab === group ? 'active' : ''} onClick={() => setContentGroupTab(group)}>{group}</button>
                ))}
              </div>

              <div className="month-nav" style={{ marginTop: '14px' }}>
                <button className="btn-secondary" onClick={() => changeContentCalMonth(-1)}>← Prev</button>
                <strong>{new Date(contentCalYear, contentCalMonth, 1).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</strong>
                <button className="btn-secondary" onClick={() => changeContentCalMonth(1)}>Next →</button>
              </div>

              <div className="cc-legend">
                {CONTENT_TYPES.map(t => (
                  <span key={t.value} className="cc-legend-item">
                    <span className="cc-legend-dot" style={{ background: t.color }}></span>
                    {t.icon} {t.value}
                  </span>
                ))}
                <span className="cc-legend-item"><span className="cc-tick" style={{ position: 'static' }}>✓</span> Posted</span>
              </div>

              {(() => {
                const groupChannels = CONTENT_CHANNEL_GROUPS[contentGroupTab];
                const entriesThisGroup = contentEntries.filter(e => e.channelGroup === contentGroupTab);
                const firstOfMonth = new Date(contentCalYear, contentCalMonth, 1);
                const startOffset = firstOfMonth.getDay(); // 0=Sun
                const daysInMon = new Date(contentCalYear, contentCalMonth + 1, 0).getDate();
                const cells = [];
                for (let i = 0; i < startOffset; i++) cells.push(null);
                for (let d = 1; d <= daysInMon; d++) cells.push(d);
                while (cells.length % 7 !== 0) cells.push(null);

                const todayStr = new Date().toISOString().slice(0, 10);

                return (
                  <div className="cc-calendar-grid">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                      <div key={d} className="cc-day-header">{d}</div>
                    ))}
                    {cells.map((day, idx) => {
                      if (day === null) return <div key={idx} className="cc-day-cell cc-day-empty"></div>;
                      const dateStr = `${contentCalYear}-${String(contentCalMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                      const dayEntries = entriesThisGroup.filter(e => String(e.date).slice(0, 10) === dateStr);
                      const isToday = dateStr === todayStr;
                      return (
                        <div key={idx} className={`cc-day-cell ${isToday ? 'cc-today' : ''}`} onClick={() => openNewContentEntry(dateStr)}>
                          {/* FIX — today's date gets a red circular badge, Notion-style, instead of plain text */}
                          {isToday ? <span className="cc-day-num-today">{day}</span> : <span className="cc-day-num">{day}</span>}
                          <div className="cc-day-entries">
                            {dayEntries.map(entry => {
                              const typeInfo = CONTENT_TYPES.find(t => t.value === entry.contentType) || CONTENT_TYPES[0];
                              const videoInfo = VIDEO_STATUSES.find(s => s.value === entry.videoStatus) || VIDEO_STATUSES[0];
                              const isPublished = entry.videoStatus === 'Published';
                              return (
                                <div
                                  key={entry.id}
                                  className={`cc-entry-card ${isPublished ? 'cc-posted' : ''}`}
                                  onClick={(e) => { e.stopPropagation(); openEditContentEntry(entry); }}
                                  title={entry.title}
                                >
                                  <div className="cc-entry-title">
                                    {isPublished && <span className="cc-tick">✓</span>}
                                    {entry.title}
                                  </div>
                                  <div className="cc-entry-badges">
                                    <span className="cc-badge" style={{ background: typeInfo.color + '22', color: typeInfo.color }}>
                                      {typeInfo.icon} {typeInfo.value}
                                    </span>
                                    <span className="cc-badge" style={{ background: videoInfo.color + '22', color: videoInfo.color }}>
                                      {videoInfo.icon} {videoInfo.value}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          </div>

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
                        {CONTENT_CHANNEL_GROUPS[contentGroupTab].map(ch => <option key={ch} value={ch}>{ch}</option>)}
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
                      <label>Final/Published Link</label>
                      <input type="text" value={contentForm.finalLink} onChange={(e) => setContentForm({ ...contentForm, finalLink: e.target.value })} placeholder="https://..." />
                    </div>
                    <div className="form-group">
                      <label>Thumbnail Link</label>
                      <input type="text" value={contentForm.thumbnailLink} onChange={(e) => setContentForm({ ...contentForm, thumbnailLink: e.target.value })} placeholder="https://..." />
                    </div>
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
                  const icon = r.response === 'Accepted' ? '✅' : r.response === 'Declined' ? '❌' : r.response === 'Missed' ? '⌛' : '📞';
                  const cls = r.response === 'Accepted' ? 'accepted' : r.response === 'Declined' ? 'declined' : r.response === 'Missed' ? 'missed' : 'ringing';
                  return (
                    <div key={r.to} className={`call-status-row ${cls}`}>
                      <span className="chat-avatar">{member?.avatar || r.to.substring(0, 2)}</span>
                      <span className="call-status-name">{member?.displayName || r.to}</span>
                      <span className="call-status-badge">{icon} {r.response === 'Ringing' ? 'Ringing...' : r.response}</span>
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
                      <div key={task.id} className={`task-card ${task.delayDays > 0 ? 'overdue' : ''} ${isCompleted ? 'completed' : ''} ${isRoutine ? 'routine' : ''} ${routineUrgencyClass}`}>
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