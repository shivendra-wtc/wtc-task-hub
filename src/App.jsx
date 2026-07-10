import { useState, useEffect } from 'react'
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

function App() {
  const channels = [
    'AG Insta', 'AG YT', 'The Fact-Tree YT', 'The Fact-Tree Insta',
    'HisTree YT', 'HisTree Insta', 'AG.books Insta',
    "The 7c's YT", 'Spotify', 'LinkedIn', 'Twitter',
    'Poorvaj Insta', 'Devastram Insta', 'Other'
  ];

  const categories = [
    'Social Media', 'Banking', 'Software/Automation', 'Mails',
    'Special Tasks', 'General', 'Legal', 'Staff',
    'Business', 'Other', 'Calls', 'Meeting', 'Shri Mandir'
  ];

  const team = [
    { id: 'pcwtc45', name: 'PC', displayName: 'PC', fullName: 'Praveen Chilhate', role: 'CEO', avatar: 'PC', quoteType: 'ceo', isAdmin: true },
    { id: 'shivendrawtc77', name: 'Shivendra Singh', displayName: 'Shivendra Singh', fullName: 'Shivendra Singh Tomar', role: 'Sr. Social Media Manager', avatar: 'SS', quoteType: 'manager', isAdmin: true },
    { id: 'deeksha', name: 'Deeksha', displayName: 'Deeksha', fullName: 'Deeksha Jalodiya', role: 'Content Writer', avatar: 'DJ', quoteType: 'social_media' },
    { id: 'nidhi', name: 'Nidhi', displayName: 'Nidhi', fullName: 'Nidhi Vaishnav', role: 'Poorvaj', avatar: 'NV', quoteType: 'social_media' },
    { id: 'samanta', name: 'Samanta', displayName: 'Samanta', fullName: 'Samanta Pradhan', role: 'Social Media Exec & Design', avatar: 'SP', quoteType: 'social_media' },
    { id: 'muskan', name: 'Muskan', displayName: 'Muskan', fullName: 'Muskan Chouhan', role: 'Devastram', avatar: 'MC', quoteType: 'social_media' },
    { id: 'sanjeevani', name: 'Sanjeevani', displayName: 'Sanjeevani', fullName: 'Sanjeevani Saxena', role: 'PR Manager', avatar: 'SJ', quoteType: 'pr' },
    { id: 'pari', name: 'Pari', displayName: 'Pari', fullName: 'Pari Raghuwanshi', role: 'HR', avatar: 'PA', quoteType: 'hr', isHR: true },
    { id: 'khushi', name: 'Khushi', displayName: 'Khushi', fullName: 'Khushi Jain', role: 'Social Media Exec & Design', avatar: 'KJ', quoteType: 'social_media' },
    { id: 'saraswati', name: 'Saraswati', displayName: 'Saraswati', fullName: 'Saraswati Rai', role: 'Social Media Exec & Design', avatar: 'SR', quoteType: 'social_media' },
    { id: 'charu', name: 'Charu', displayName: 'Charu', fullName: 'Charu Nagdawani', role: 'Social Media Exec & Design', avatar: 'CN', quoteType: 'social_media' },
    { id: 'naman', name: 'Naman', displayName: 'Naman', fullName: 'Naman Jain', role: 'Video Editor', avatar: 'NJ', quoteType: 'video_editor' },
    { id: 'karan', name: 'Karan', displayName: 'Karan', fullName: 'Karan', role: 'Video Editor', avatar: 'KR', quoteType: 'video_editor' },
    { id: 'jagdish', name: 'Jagdish', displayName: 'Jagdish', fullName: 'Jagdish Sahu', role: 'Team Member', avatar: 'JS', quoteType: 'social_media' }
  ];

  const extraAssignees = ['AG', 'BG'];
  const allAssignees = [...team.map(t => t.name), ...extraAssignees];

  const getAvatarForName = (name) => {
    const member = team.find(t => t.name === name);
    if (member) return member.avatar;
    if (name === 'AG') return 'AG';
    if (name === 'BG') return 'BG';
    return name.substring(0, 2).toUpperCase();
  };

  const getUserFromURL = () => {
    const params = new URLSearchParams(window.location.search);
    const user = params.get('user');
    if (!user) return null;
    const member = team.find(t => t.id === user.toLowerCase());
    return member ? member.id : null;
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
    if (member) return QUOTES[member.quoteType][day % QUOTES[member.quoteType].length];
    return "";
  };

  const getFormattedDate = () => {
    const now = new Date();
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return `${days[now.getDay()]}, ${months[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`;
  };

  const [tasks, setTasks] = useState([]);
  const [archivedTasks, setArchivedTasks] = useState([]);
  const [inbox, setInbox] = useState([]);
  const [chats, setChats] = useState([]);
  const [prevInboxCount, setPrevInboxCount] = useState(0);
  const [prevChatCount, setPrevChatCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(getUserFromURL());
  const [managerView, setManagerView] = useState('all');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterChannel, setFilterChannel] = useState('All');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterTaskType, setFilterTaskType] = useState('All');
  const [showNewTaskForm, setShowNewTaskForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [attendance, setAttendance] = useState([]);
  const [myStatus, setMyStatus] = useState('Not Signed In');
  const [showAttendance, setShowAttendance] = useState(false);
  const [taskViewMode, setTaskViewMode] = useState('all');
  const [showInbox, setShowInbox] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showArchive, setShowArchive] = useState(false);
  const [selectedAssignees, setSelectedAssignees] = useState([]);
  const [selectedChannels, setSelectedChannels] = useState([]);
  const [showNotifPopup, setShowNotifPopup] = useState(false);
  const [notifMessage, setNotifMessage] = useState('');
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
    endDate: ''
  });

  const currentUserInfo = team.find(t => t.id === currentUser);
  const isAdmin = currentUserInfo?.isAdmin || false;
  const isHR = currentUserInfo?.isHR || false;
  const isInvalidUser = !currentUser;
  const displayName = currentUserInfo?.displayName || '';
  const greeting = displayName ? getTimeBasedGreeting(displayName) : '';
  const todayQuote = currentUser ? getTodayQuote(currentUser) : '';
  const formattedDate = getFormattedDate();

  const statusColors = {
    'Not Started': '#64748b',
    'In Progress': '#d97706',
    'Completed': '#059669',
    'On Hold': '#7c3aed',
    'Delayed': '#dc2626'
  };

  const attendanceColors = {
    'Working': '#059669',
    'Tea Break': '#d97706',
    'Lunch Break': '#dc2626',
    'Meeting': '#7c3aed',
    'Signed Out': '#64748b',
    'Not Signed In': '#94a3b8'
  };

  const playNotifSound = () => {
    try {
      const audio = new Audio('data:audio/wav;base64,UklGRlwFAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YTgFAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGnt/yv2wiBTGH0PLTgjMGHm7A7+OZURE');
      audio.volume = 0.5;
      audio.play().catch(e => {});
    } catch(e) {}
  };

  useEffect(() => {
    if (currentUser) {
      loadTasks();
      loadAttendance();
      loadInbox();
      loadChats();
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      const interval = setInterval(() => {
        loadTasksBackground();
        loadAttendanceBackground();
        loadInboxBackground();
        loadChatsBackground();
      }, 15000);
      return () => clearInterval(interval);
    }
  }, [currentUser]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTick(t => t + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (currentUser && !isAdmin) setTaskViewMode('assigned');
  }, [currentUser, isAdmin]);

  useEffect(() => {
    const unreadCount = inbox.filter(i => i.read === 'No').length;
    if (unreadCount > prevInboxCount && prevInboxCount > 0) {
      const newestUnread = inbox.find(i => i.read === 'No');
      if (newestUnread) {
        playNotifSound();
        setNotifMessage(`New task from ${newestUnread.from}: ${newestUnread.title}`);
        setShowNotifPopup(true);
        setTimeout(() => setShowNotifPopup(false), 5000);
      }
    }
    setPrevInboxCount(unreadCount);
  }, [inbox]);

  useEffect(() => {
    const unreadChats = chats.filter(c => c.read === 'No' && c.to === currentUserInfo?.name).length;
    if (unreadChats > prevChatCount && prevChatCount > 0) {
      const newestChat = chats.filter(c => c.read === 'No' && c.to === currentUserInfo?.name).pop();
      if (newestChat) {
        playNotifSound();
        setNotifMessage(`💬 New message from ${newestChat.from}`);
        setShowNotifPopup(true);
        setTimeout(() => setShowNotifPopup(false), 5000);
      }
    }
    setPrevChatCount(unreadChats);
  }, [chats]);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_URL + '?action=getTasks');
      const data = await response.json();
      if (data.status === 'ok') setTasks(data.tasks);
    } catch (error) {} finally { setLoading(false); }
  };

  const loadTasksBackground = async () => {
    try {
      const response = await fetch(API_URL + '?action=getTasks');
      const data = await response.json();
      if (data.status === 'ok') setTasks(data.tasks);
    } catch (error) {}
  };

  const loadArchive = async () => {
    try {
      const response = await fetch(API_URL + '?action=getArchive');
      const data = await response.json();
      if (data.status === 'ok') setArchivedTasks(data.tasks);
    } catch (error) {}
  };

  const loadInbox = async () => {
    if (!currentUserInfo) return;
    try {
      const response = await fetch(API_URL + '?action=getInbox&userName=' + encodeURIComponent(currentUserInfo.name));
      const data = await response.json();
      if (data.status === 'ok') setInbox(data.inbox);
    } catch (error) {}
  };

  const loadInboxBackground = async () => {
    if (!currentUserInfo) return;
    try {
      const response = await fetch(API_URL + '?action=getInbox&userName=' + encodeURIComponent(currentUserInfo.name));
      const data = await response.json();
      if (data.status === 'ok') setInbox(data.inbox);
    } catch (error) {}
  };

  const loadChats = async () => {
    if (!currentUserInfo) return;
    try {
      const response = await fetch(API_URL + '?action=getChats&userName=' + encodeURIComponent(currentUserInfo.name));
      const data = await response.json();
      if (data.status === 'ok') setChats(data.chats);
    } catch (error) {}
  };

  const loadChatsBackground = async () => {
    if (!currentUserInfo) return;
    try {
      const response = await fetch(API_URL + '?action=getChats&userName=' + encodeURIComponent(currentUserInfo.name));
      const data = await response.json();
      if (data.status === 'ok') setChats(data.chats);
    } catch (error) {}
  };

  const loadAttendance = async () => {
    try {
      const response = await fetch(API_URL + '?action=getAttendance');
      const data = await response.json();
      if (data.status === 'ok') {
        setAttendance(data.attendance);
        if (!isAdmin || isHR) {
          const myRecord = data.attendance.find(a => a.userId === currentUser);
          if (myRecord) setMyStatus(myRecord.status);
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
          const myRecord = data.attendance.find(a => a.userId === currentUser);
          if (myRecord) setMyStatus(myRecord.status);
        }
      }
    } catch (error) {}
  };

  const updateMyStatus = async (newStatus) => {
    if (isAdmin && !isHR) return;
    if (!currentUserInfo) return;
    setMyStatus(newStatus);
    try {
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
      setTimeout(() => loadAttendanceBackground(), 1500);
    } catch (error) {}
  };

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
        if (events[i].status === 'Working') workingMs += duration;
        else if (['Tea Break', 'Lunch Break', 'Meeting'].includes(events[i].status)) breakMs += duration;
      }
      const lastEvent = events[events.length - 1];
      if (lastEvent && lastEvent.status !== 'Signed Out') {
        const duration = now - lastEvent.time;
        if (duration > 0) {
          if (lastEvent.status === 'Working') workingMs += duration;
          else if (['Tea Break', 'Lunch Break', 'Meeting'].includes(lastEvent.status)) breakMs += duration;
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

  const isTaskAssignedToMe = (task) => {
    if (!currentUserInfo) return false;
    const assignees = String(task.assignedTo).split(',').map(a => a.trim());
    return assignees.includes(currentUserInfo.name);
  };

  const filteredTasks = tasks.filter(t => {
    if (isAdmin) {
      if (taskViewMode === 'assigned') {
        if (!isTaskAssignedToMe(t)) return false;
      } else if (taskViewMode === 'by_me') {
        if (t.assignedBy !== currentUserInfo.name) return false;
      } else if (taskViewMode === 'own') {
        if (t.assignedBy !== currentUserInfo.name || !isTaskAssignedToMe(t)) return false;
      } else {
        if (managerView !== 'all') {
          const user = team.find(u => u.id === managerView);
          const assignees = String(t.assignedTo).split(',').map(a => a.trim());
          if (!assignees.includes(user?.name)) return false;
        }
      }
    } else {
      if (t.taskType === 'Routine' || t.taskType === 'Routine Instance') return false;
      
      if (taskViewMode === 'assigned') {
        if (!isTaskAssignedToMe(t)) return false;
      } else if (taskViewMode === 'by_me') {
        if (t.assignedBy !== currentUserInfo.name) return false;
      } else if (taskViewMode === 'own') {
        if (t.assignedBy !== currentUserInfo.name || !isTaskAssignedToMe(t)) return false;
      }
    }
    if (filterStatus !== 'All' && t.status !== filterStatus) return false;
    if (filterChannel !== 'All' && !String(t.channel).split(',').map(c => c.trim()).includes(filterChannel)) return false;
    if (filterCategory !== 'All' && t.category !== filterCategory) return false;
    if (filterTaskType !== 'All') {
      if (filterTaskType === 'General' && t.taskType !== 'General') return false;
      if (filterTaskType === 'Routine' && !['Routine', 'Routine Instance'].includes(t.taskType)) return false;
    }
    return true;
  });

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
    try {
      setSaving(true);
      const taskData = {
        ...newTask,
        assignedTo: selectedAssignees.join(', '),
        channel: selectedChannels.length > 0 ? selectedChannels.join(', ') : 'Other',
        assignedBy: currentUserInfo.name,
        status: 'Not Started',
        targetDate: newTask.taskType === 'Routine' ? newTask.startDate : newTask.targetDate
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
        taskType: 'General', category: '', frequency: 'Daily', startDate: '', endDate: ''
      });
      setSelectedAssignees([]);
      setSelectedChannels([]);
      setShowNewTaskForm(false);
      setSaving(false);
      setTimeout(() => loadTasksBackground(), 2000);
    } catch (error) { setSaving(false); }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    if (task.status === 'Completed' && !isAdmin) {
      alert('Only Shivendra Singh or PC can change completed tasks!');
      return;
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

  const markAllInboxRead = async () => {
    for (const item of inbox.filter(i => i.read === 'No')) {
      try {
        fetch(API_URL, {
          method: 'POST', mode: 'no-cors',
          headers: { 'Content-Type': 'text/plain' },
          body: JSON.stringify({ action: 'markInboxRead', inboxId: item.id })
        });
      } catch(e) {}
    }
    setInbox(inbox.map(i => ({ ...i, read: 'Yes' })));
  };

  const openInbox = () => {
    setShowInbox(!showInbox);
    if (!showInbox && inbox.some(i => i.read === 'No')) {
      markAllInboxRead();
    }
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
      const member = team.find(t => t.id === managerView);
      return `${member?.name}'s Tasks`;
    }
    if (taskViewMode === 'assigned') return 'Tasks Assigned to Me';
    if (taskViewMode === 'by_me') return 'Tasks Assigned by Me';
    if (taskViewMode === 'own') return 'My Own Tasks';
    return '';
  };

  const unreadInbox = inbox.filter(i => i.read === 'No').length;
  const unreadChats = chats.filter(c => c.read === 'No' && c.to === currentUserInfo?.name).length;

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
      {showNotifPopup && (
        <div className="notif-popup">
          <div className="notif-icon">🔔</div>
          <div className="notif-msg">{notifMessage}</div>
          <button className="notif-close" onClick={() => setShowNotifPopup(false)}>✕</button>
        </div>
      )}

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
            <button className="icon-btn" onClick={openChat} title="Chat">
              💬
              {unreadChats > 0 && <span className="badge-count">{unreadChats}</span>}
            </button>
            <button className="icon-btn" onClick={openInbox} title="Inbox">
              🔔
              {unreadInbox > 0 && <span className="badge-count">{unreadInbox}</span>}
            </button>
            <button className="icon-btn" onClick={() => { loadTasks(); loadAttendance(); loadInbox(); loadChats(); }} title="Refresh">
              🔄
            </button>
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
              inbox.map(item => (
                <div key={item.id} className={`inbox-item ${item.read === 'No' ? 'unread' : ''}`}>
                  <div className="inbox-icon">{item.type === 'new_routine' ? '🔄' : '📌'}</div>
                  <div className="inbox-content">
                    <p className="inbox-title">New task from {item.from}</p>
                    <p className="inbox-task">{item.title}</p>
                    <p className="inbox-time">{new Date(item.timestamp).toLocaleString()}</p>
                  </div>
                  <span className={`priority-tag ${item.priority.toLowerCase()}`}>{item.priority}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {showChat && (
        <div className="side-panel chat-panel">
          <div className="panel-header">
            {chatWith ? (
              <>
                <button className="back-btn" onClick={() => setChatWith(null)}>←</button>
                <h3>💬 {chatWith}</h3>
              </>
            ) : (
              <h3>💬 Team Chat</h3>
            )}
            <button className="close-btn" onClick={openChat}>✕</button>
          </div>
          {!chatWith ? (
            <div className="panel-body">
              <div className="chat-search">
                <p className="section-title">Start new chat:</p>
                <div className="team-list">
                  {team.filter(m => m.id !== currentUser).map(member => (
                    <div key={member.id} className="team-chat-item" onClick={() => openChatWith(member.name)}>
                      <div className="chat-avatar">{member.avatar}</div>
                      <div className="chat-info">
                        <strong>{member.displayName}</strong>
                        <span>{member.role}</span>
                      </div>
                    </div>
                  ))}
                </div>
                {getConversationList().length > 0 && (
                  <>
                    <p className="section-title" style={{marginTop: '20px'}}>Recent conversations:</p>
                    {getConversationList().map(conv => {
                      const member = team.find(t => t.name === conv.person);
                      return (
                        <div key={conv.person} className="team-chat-item" onClick={() => openChatWith(conv.person)}>
                          <div className="chat-avatar">{member?.avatar || conv.person.substring(0, 2)}</div>
                          <div className="chat-info">
                            <strong>{conv.person}</strong>
                            <span className="last-msg">{conv.lastMessage.message.substring(0, 40)}</span>
                          </div>
                          {conv.unreadCount > 0 && <span className="unread-badge">{conv.unreadCount}</span>}
                        </div>
                      );
                    })}
                  </>
                )}
              </div>
            </div>
          ) : (
            <>
              <div className="chat-messages">
                {getConversationMessages().map(msg => (
                  <div key={msg.id} className={`chat-bubble ${msg.from === currentUserInfo.name ? 'sent' : 'received'}`}>
                    <div className="chat-text">{msg.message}</div>
                    <div className="chat-time">{new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}</div>
                  </div>
                ))}
              </div>
              <div className="chat-input">
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                />
                <button onClick={sendMessage}>➤</button>
              </div>
            </>
          )}
        </div>
      )}

      {loading && <div className="loading-state"><p>Loading...</p></div>}

      {!loading && (
        <>
          {(!isAdmin || isHR) && (
            <div className="attendance-card-premium">
              <h3>⏰ Your Attendance Today</h3>
              <div className="attendance-info">
                <div className="status-badge" style={{background: attendanceColors[myStatus] + '20', color: attendanceColors[myStatus]}}>
                  {myStatus}
                </div>
                {attendance.find(a => a.userId === currentUser) && (
                  <div className="time-info">
                    {(() => {
                      const times = calculateWorkingTime(attendance.find(a => a.userId === currentUser)?.log);
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
                  <button className="btn-signin" onClick={() => updateMyStatus('Working')}>🟢 Sign In</button>
                ) : (
                  <>
                    {myStatus !== 'Working' && <button className="btn-resume" onClick={() => updateMyStatus('Working')}>🟢 Back to Work</button>}
                    {myStatus !== 'Tea Break' && <button className="btn-tea" onClick={() => updateMyStatus('Tea Break')}>☕ Tea Break</button>}
                    {myStatus !== 'Lunch Break' && <button className="btn-lunch" onClick={() => updateMyStatus('Lunch Break')}>🍽️ Lunch</button>}
                    {myStatus !== 'Meeting' && <button className="btn-meeting" onClick={() => updateMyStatus('Meeting')}>🤝 Meeting</button>}
                    <button className="btn-signout" onClick={() => updateMyStatus('Signed Out')}>🚪 Sign Out</button>
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
                  {team.filter(m => !m.isAdmin && !m.isHR).map(member => {
                    const memberAttendance = attendance.find(a => a.userId === member.id);
                    const status = memberAttendance?.status || 'Not Signed In';
                    const times = memberAttendance ? calculateWorkingTime(memberAttendance.log) : { working: '0h 0m 0s', breaks: '0h 0m 0s', productivity: 0 };
                    return (
                      <div key={member.id} className="status-card">
                        <div className="status-avatar" style={{background: attendanceColors[status]}}>{member.avatar}</div>
                        <div className="status-details">
                          <strong>{member.name}</strong>
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
                    {team.filter(m => !m.isAdmin).map(member => (
                      <button key={member.id} className={managerView === member.id ? 'active' : ''} onClick={() => setManagerView(member.id)} title={member.name}>
                        {member.avatar}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="view-title">
                <h2>{getViewTitle()}</h2>
              </div>

              <div className="filters">
                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                  <option>All Status</option>
                  <option>Not Started</option>
                  <option>In Progress</option>
                  <option>Completed</option>
                  <option>On Hold</option>
                  <option>Delayed</option>
                </select>
                <select value={filterChannel} onChange={(e) => setFilterChannel(e.target.value)}>
                  <option>All Channels</option>
                  {channels.map(ch => <option key={ch}>{ch}</option>)}
                </select>
                <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
                  <option>All Categories</option>
                  {categories.map(cat => <option key={cat}>{cat}</option>)}
                </select>
                {isAdmin && (
                  <select value={filterTaskType} onChange={(e) => setFilterTaskType(e.target.value)}>
                    <option value="All">All Types</option>
                    <option value="General">📋 General</option>
                    <option value="Routine">🔄 Routine</option>
                  </select>
                )}
              </div>

              <div className="tasks-container">
                {filteredTasks.length === 0 ? (
                  <div className="empty-state">
                    <p>No tasks to display</p>
                  </div>
                ) : (
                  <div className="tasks-grid">
                    {filteredTasks.map(task => {
                      const isCompleted = task.status === 'Completed';
                      const canChangeStatus = isAdmin || !isCompleted;
                      const isRoutine = task.taskType === 'Routine' || task.taskType === 'Routine Instance';
                      const channelList = String(task.channel).split(',').map(c => c.trim()).filter(c => c);
                      return (
                        <div key={task.id} className={`task-card ${task.delayDays > 0 ? 'overdue' : ''} ${isCompleted ? 'completed' : ''} ${isRoutine ? 'routine' : ''}`}>
                          <div className={`priority-strip ${task.priority.toLowerCase()}`}></div>
                          {isRoutine && <div className="routine-tag">🔄 Routine Task</div>}
                          {task.delayDays > 0 && <div className="alert-banner">⚠️ Delayed by {task.delayDays} day(s)</div>}
                          <div className="task-header">
                            <h3>{task.taskDetails}</h3>
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
                                  <span key={name} className="mini-avatar" title={name}>{getAvatarForName(name)}</span>
                                ))}
                              </div>
                            </div>
                            <div className="meta-row">
                              <span>📌 By: <strong>{task.assignedBy}</strong></span>
                              <span>📅 {new Date(task.targetDate).toLocaleDateString()}</span>
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
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </>
      )}

      {showNewTaskForm && (
        <div className="modal-overlay" onClick={() => setShowNewTaskForm(false)}>
          <div className="modal-content compact" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>➕ Create New Task</h3>
              <button className="modal-close" onClick={() => setShowNewTaskForm(false)}>✕</button>
            </div>
            <div className="modal-body compact-body">
              {isAdmin && (
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

              {newTask.taskType === 'General' ? (
                <div className="form-group">
                  <label>Target Date *</label>
                  <input type="date" min="2025-01-01" max="2030-12-31" value={newTask.targetDate} onChange={(e) => setNewTask({ ...newTask, targetDate: e.target.value })} />
                </div>
              ) : (
                <div className="form-row-3">
                  <div className="form-group">
                    <label>Frequency</label>
                    <select value={newTask.frequency} onChange={(e) => setNewTask({ ...newTask, frequency: e.target.value })}>
                      <option value="Daily">Daily</option>
                      <option value="Weekly">Weekly (Same day)</option>
                      <option value="Monthly">Monthly (Same date)</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Start *</label>
                    <input type="date" min="2025-01-01" max="2030-12-31" value={newTask.startDate} onChange={(e) => setNewTask({ ...newTask, startDate: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>End</label>
                    <input type="date" min="2025-01-01" max="2030-12-31" value={newTask.endDate} onChange={(e) => setNewTask({ ...newTask, endDate: e.target.value })} />
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowNewTaskForm(false)}>Cancel</button>
              <button className="btn-success" onClick={handleAddTask} disabled={saving}>
                {saving ? 'Saving...' : '✅ Create Task'}
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