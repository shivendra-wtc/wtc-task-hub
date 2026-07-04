import { useState, useEffect, useRef } from 'react'
import './App.css'

const API_URL = "https://script.google.com/macros/s/AKfycbxhrBrgG4x5U6v7YzYYbREaptULHIKprzL5ZAdCUySbdQBrqTkib2mEdujKYensAhkR-A/exec";

const QUOTES = {
  manager: [
    "Great leaders create more leaders, not followers. — Tom Peters",
    "Vision without execution is hallucination. — Thomas Edison",
    "A leader is one who knows the way, goes the way, and shows the way. — John C. Maxwell",
    "Management is doing things right; leadership is doing the right things. — Peter Drucker",
    "Innovation distinguishes between a leader and a follower. — Steve Jobs",
    "The best executive is the one who has sense enough to pick good people. — Theodore Roosevelt",
    "Leadership is not about being in charge. It's about taking care of those in your charge. — Simon Sinek",
    "Don't tell people how to do things, tell them what to do and let them surprise you. — George Patton",
    "Success is not final, failure is not fatal: it is the courage to continue that counts. — Winston Churchill",
    "Discipline is the bridge between goals and accomplishment. — Jim Rohn",
    "The way to get started is to quit talking and begin doing. — Walt Disney",
    "A goal without a plan is just a wish. — Antoine de Saint-Exupery",
    "Great things never come from comfort zones. — Neil Strauss",
    "Dream big, work hard, stay focused. — Anonymous",
    "The harder you work, the luckier you get. — Gary Player",
    "Believe you can and you're halfway there. — Theodore Roosevelt",
    "Coming together is a beginning, staying together is progress, working together is success. — Henry Ford",
    "Effective leadership is putting first things first. — Stephen Covey",
    "The function of leadership is to produce more leaders, not more followers. — Ralph Nader",
    "Quality is not an act, it is a habit. — Aristotle",
    "Excellence is never an accident. It's a choice. — Aristotle",
    "If your actions inspire others, you are a leader. — John Quincy Adams",
    "Leaders think and talk about the solutions. Followers think and talk about the problems. — Brian Tracy",
    "A leader takes people where they ought to be. — Rosalynn Carter",
    "The leader adjusts the sails. — John Maxwell",
    "Lead from the front. — Anonymous",
    "The greatest leader gets people to do the greatest things. — Ronald Reagan",
    "Do what you can, with what you have, where you are. — Theodore Roosevelt",
    "Success comes to those too busy to look for it. — Henry David Thoreau",
    "The only way to do great work is to love what you do. — Steve Jobs"
  ],
  ceo: [
    "The role of a CEO is to ask the right questions, not have all the answers. — Ken Blanchard",
    "Chase the vision, not the money. — Tony Hsieh",
    "Innovation is saying no to a thousand things. — Steve Jobs",
    "Culture eats strategy for breakfast. — Peter Drucker",
    "Your most unhappy customers are your greatest source of learning. — Bill Gates",
    "The best way to predict the future is to create it. — Peter Drucker",
    "A brand for a company is like a reputation for a person. — Jeff Bezos",
    "Move fast and break things. — Mark Zuckerberg",
    "Ideas are commodities. Execution of them is not. — Michael Dell",
    "The successful warrior has laser-like focus. — Bruce Lee",
    "Whether you think you can or think you can't, you're right. — Henry Ford",
    "Business opportunities are like buses, there's always another one coming. — Richard Branson",
    "Don't be afraid to give up the good to go for the great. — John D. Rockefeller",
    "Success is walking from failure to failure with no loss of enthusiasm. — Winston Churchill",
    "In the middle of every difficulty lies opportunity. — Albert Einstein",
    "The value of an idea lies in the using of it. — Thomas Edison",
    "Every problem is a gift. — Anthony Robbins",
    "Do what you feel in your heart to be right. — Eleanor Roosevelt",
    "The greatest glory lies in rising every time we fall. — Nelson Mandela",
    "Your work will fill a large part of your life. Do great work. — Steve Jobs",
    "Perseverance makes overnight success. — Biz Stone",
    "Get big quietly. — Chris Dixon",
    "It's about making ideas happen. — Scott Belsky",
    "Ask what your customer really wants. — Lisa Stone",
    "Business is more exciting than any game. — Lord Beaverbrook",
    "Quit talking and begin doing. — Walt Disney",
    "If not embarrassed by first version, you launched too late. — Reid Hoffman",
    "Self-education will make you a fortune. — Jim Rohn",
    "Go where there is no path. — Ralph Waldo Emerson",
    "Try to become a person of value. — Albert Einstein"
  ],
  social_media: [
    "Content is king, but engagement is queen. — Mari Smith",
    "Your brand is what people say when you're not in the room. — Jeff Bezos",
    "Design is thinking made visual. — Saul Bass",
    "Creativity takes courage. — Henri Matisse",
    "Content is fire, social media is gasoline. — Jay Baer",
    "Be so good they can't ignore you. — Steve Martin",
    "Creativity is intelligence having fun. — Albert Einstein",
    "Every great design begins with an even better story. — Lorinda Mamo",
    "Good design is good business. — Thomas Watson Jr.",
    "The best marketing doesn't feel like marketing. — Tom Fishburne",
    "Storytelling is the most powerful way to put ideas into the world. — Robert McKee",
    "Make it simple. Make it memorable. — Leo Burnett",
    "Aesthetic matters. First impressions count. — Anonymous",
    "Engagement is the new ROI. — Anonymous",
    "The technology inspires the art. — John Lasseter",
    "Design is intelligence made visible. — Alina Wheeler",
    "Marketing is about the stories you tell. — Seth Godin",
    "Create content that tells. — Beth Comstock",
    "Don't be afraid to get creative. — Mike Volpe",
    "Behind every great brand is a great story. — Anonymous",
    "Simplicity is the ultimate sophistication. — Leonardo da Vinci",
    "Design is how it works. — Steve Jobs",
    "The details make the design. — Charles Eames",
    "Everything is designed. — Brian Reed",
    "Content is the atomic particle of marketing. — Rebecca Lieb",
    "Every post is an opportunity. — Anonymous",
    "Not to be different is virtually suicidal. — Bill Bernbach",
    "Social media is about the people. — Matt Goulart",
    "Focus on how to be social. — Jay Baer",
    "Great design speaks louder than words. — Anonymous"
  ],
  video_editor: [
    "Editing is where stories truly come alive.",
    "Cut to the emotion, not the action. — Walter Murch",
    "The best edit is the one you don't notice.",
    "Every cut tells a story.",
    "Master the rhythm, master the edit.",
    "The frame is your canvas. Paint emotions.",
    "Color tells the story words cannot.",
    "Great editing is invisible. Bad editing is unforgettable.",
    "Timing is everything in video editing.",
    "Less is more - especially in editing.",
    "The magic happens in post-production.",
    "You don't edit videos, you craft experiences.",
    "Render. Review. Refine. Repeat.",
    "B-roll is the bridge between great shots.",
    "Make every second count.",
    "Transition with purpose, cut with reason.",
    "Editing is the strongest manipulator of cinema. — Walter Murch",
    "Cinema is what's in the frame and what's out. — Martin Scorsese",
    "A film is a petrified fountain of thought. — Jean Cocteau",
    "Editing is making good shots better.",
    "Style is knowing who you are. — Orson Welles",
    "Cinema is a mirror. — Alejandro Iñárritu",
    "Directors are storytellers. — Kathryn Bigelow",
    "The camera is a paintbrush. — Peter Weir",
    "Film is a mosaic of time. — Andrei Tarkovsky",
    "Video editing is 90% creativity.",
    "Sound design is half the experience.",
    "Every project teaches something new.",
    "Patience in editing equals perfection.",
    "The soul of storytelling lies in the edit."
  ],
  pr: [
    "PR is what you do, say, and what others say about you.",
    "Build relationships, not just contacts.",
    "Reputation takes years to build, minutes to destroy. — Warren Buffett",
    "Trust is the foundation of all communication.",
    "Your story is your strongest asset.",
    "Make news, don't chase it.",
    "The right pitch at the right time changes everything.",
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
    "Communication works for those who work at it. — John Powell",
    "The best PR is great work.",
    "Publicity is the nuclear weapon of business. — Al Ries",
    "PR is analyzing trends.",
    "Great communicators build relationships.",
    "Words have power to build or destroy.",
    "It's what others say about you.",
    "In PR, silence is not golden.",
    "Guard your reputation with your life.",
    "Perception is reality in PR.",
    "Great PR is invisible but effective.",
    "PR: Making the truth interesting.",
    "The best press releases tell stories."
  ],
  hr: [
    "HR is about the business, not just HR.",
    "Take care of your employees and they'll take care of your business. — Richard Branson",
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
    "The strength of the team is each member. — Phil Jackson",
    "Great vision without great people is irrelevant. — Jim Collins",
    "Be the leader you wish you had.",
    "Compassion in leadership is courage.",
    "Workplace happiness is a foundation.",
    "Employees are your most valuable asset.",
    "Train them well so they can leave, treat them well so they don't want to. — Richard Branson",
    "How employees feel is how customers feel. — Sybil F. Stershic",
    "The greatest asset is people. — Jorge Paulo Lemann",
    "Motivation comes from working on things we care about. — Sheryl Sandberg",
    "Leadership is taking care of those in your charge. — Simon Sinek",
    "A great employee is hard to find. — Tammy Cohen",
    "Working together is success. — Henry Ford",
    "Engagement is emotional commitment. — Kevin Kruse",
    "Build people, then people build the business. — Zig Ziglar",
    "The best HR is invisible.",
    "People don't leave companies, they leave managers."
  ]
};

function App() {
  const channels = [
    'AG Insta', 'AG YT', 'The Fact-Tree YT', 'The Fact-Tree Insta',
    'HisTree YT', 'HisTree Insta', 'AG.books Insta', 'Other'
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
    { id: 'karan', name: 'Karan', displayName: 'Karan', fullName: 'Karan', role: 'Video Editor', avatar: 'KR', quoteType: 'video_editor' }
  ];

  const extraAssignees = ['Jagdish Sahu'];
  const allAssignees = [...team.map(t => t.name), ...extraAssignees];

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
  const [prevInboxCount, setPrevInboxCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(getUserFromURL());
  const [managerView, setManagerView] = useState('all');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterChannel, setFilterChannel] = useState('All');
  const [filterTaskType, setFilterTaskType] = useState('All');
  const [showNewTaskForm, setShowNewTaskForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [attendance, setAttendance] = useState([]);
  const [myStatus, setMyStatus] = useState('Not Signed In');
  const [showAttendance, setShowAttendance] = useState(false);
  const [taskViewMode, setTaskViewMode] = useState('all');
  const [showInbox, setShowInbox] = useState(false);
  const [showArchive, setShowArchive] = useState(false);
  const [selectedAssignees, setSelectedAssignees] = useState([]);
  const [showNotifPopup, setShowNotifPopup] = useState(false);
  const [notifMessage, setNotifMessage] = useState('');
  const [newTask, setNewTask] = useState({
    taskDetails: '',
    remarks: '',
    priority: 'Medium',
    targetDate: '',
    channel: '',
    taskType: 'General',
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
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      const interval = setInterval(() => {
        loadTasksBackground();
        loadAttendanceBackground();
        loadInboxBackground();
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [currentUser]);

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

  const loadTasks = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_URL + '?action=getTasks');
      const data = await response.json();
      if (data.status === 'ok') setTasks(data.tasks);
    } catch (error) { console.error(error); }
    finally { setLoading(false); }
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
    } catch (error) {}
  };

  const calculateWorkingTime = (log) => {
    if (!log || typeof log !== 'string') return { working: '0h 0m', breaks: '0h 0m', productivity: 0 };
    try {
      const events = log.split('|').map(e => {
        const parts = e.split(':');
        if (parts.length < 2) return null;
        const time = new Date(parts.slice(1).join(':'));
        if (isNaN(time.getTime())) return null;
        return { status: parts[0], time };
      }).filter(e => e !== null);
      if (events.length === 0) return { working: '0h 0m', breaks: '0h 0m', productivity: 0 };
      let workingMs = 0, breakMs = 0;
      for (let i = 0; i < events.length - 1; i++) {
        const duration = events[i + 1].time - events[i].time;
        if (duration < 0) continue;
        if (events[i].status === 'Working') workingMs += duration;
        else if (['Tea Break', 'Lunch Break', 'Meeting'].includes(events[i].status)) breakMs += duration;
      }
      const lastEvent = events[events.length - 1];
      if (lastEvent && lastEvent.status !== 'Signed Out') {
        const duration = new Date() - lastEvent.time;
        if (duration > 0) {
          if (lastEvent.status === 'Working') workingMs += duration;
          else if (['Tea Break', 'Lunch Break', 'Meeting'].includes(lastEvent.status)) breakMs += duration;
        }
      }
      const wh = Math.floor(workingMs / 3600000);
      const wm = Math.floor((workingMs % 3600000) / 60000);
      const bh = Math.floor(breakMs / 3600000);
      const bm = Math.floor((breakMs % 3600000) / 60000);
      const totalMs = workingMs + breakMs;
      const productivity = totalMs > 0 ? Math.round((workingMs / totalMs) * 100) : 0;
      return { working: `${wh}h ${wm}m`, breaks: `${bh}h ${bm}m`, productivity };
    } catch (e) {
      return { working: '0h 0m', breaks: '0h 0m', productivity: 0 };
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
      if (taskViewMode === 'assigned') {
        if (!isTaskAssignedToMe(t)) return false;
      } else if (taskViewMode === 'by_me') {
        if (t.assignedBy !== currentUserInfo.name) return false;
      } else if (taskViewMode === 'own') {
        if (t.assignedBy !== currentUserInfo.name || !isTaskAssignedToMe(t)) return false;
      }
    }
    if (filterStatus !== 'All' && t.status !== filterStatus) return false;
    if (filterChannel !== 'All' && t.channel !== filterChannel) return false;
    if (filterTaskType !== 'All') {
      if (filterTaskType === 'General' && t.taskType !== 'General') return false;
      if (filterTaskType === 'Routine' && !['Routine', 'Routine Instance'].includes(t.taskType)) return false;
    }
    return true;
  });

  const handleAddTask = async () => {
    if (selectedAssignees.length === 0 || !newTask.taskDetails || !newTask.channel) {
      alert('Please fill required fields and select assignee!');
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
        assignedBy: currentUserInfo.name,
        status: 'Not Started',
        targetDate: newTask.taskType === 'Routine' ? newTask.startDate : newTask.targetDate
      };
      
      // Optimistic update
      const tempTask = {
        id: Date.now(),
        ...taskData,
        delayDays: 0
      };
      setTasks([...tasks, tempTask]);
      
      fetch(API_URL, {
        method: 'POST', mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({ action: 'addTask', task: taskData })
      });
      
      setNewTask({
        taskDetails: '', remarks: '', priority: 'Medium', targetDate: '',
        channel: '', taskType: 'General', frequency: 'Daily', startDate: '', endDate: ''
      });
      setSelectedAssignees([]);
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
            <button className="icon-btn" onClick={openInbox} title="Inbox">
              🔔
              {unreadInbox > 0 && <span className="badge-count">{unreadInbox}</span>}
            </button>
            <button className="icon-btn" onClick={() => { loadTasks(); loadAttendance(); loadInbox(); }} title="Refresh">
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
        <div className="inbox-panel">
          <div className="inbox-header">
            <h3>📥 Your Inbox ({inbox.length})</h3>
            <button className="close-btn" onClick={() => setShowInbox(false)}>✕</button>
          </div>
          <div className="inbox-body">
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
                    const times = memberAttendance ? calculateWorkingTime(memberAttendance.log) : { working: '0h 0m', breaks: '0h 0m', productivity: 0 };
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
              <button className="btn-archive" onClick={() => { setShowArchive(true); loadArchive(); }}>
                📁 View Archive
              </button>
            </div>
          )}

          {showArchive && (
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
                      const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
                      return top ? top[0] : '-';
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
                <select value={filterTaskType} onChange={(e) => setFilterTaskType(e.target.value)}>
                  <option value="All">All Types</option>
                  <option value="General">📋 General</option>
                  <option value="Routine">🔄 Routine</option>
                </select>
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
                      return (
                        <div key={task.id} className={`task-card ${task.delayDays > 0 ? 'overdue' : ''} ${isCompleted ? 'completed' : ''} ${isRoutine ? 'routine' : ''}`}>
                          <div className={`priority-strip ${task.priority.toLowerCase()}`}></div>
                          {isRoutine && <div className="routine-tag">🔄 Routine Task</div>}
                          {task.delayDays > 0 && <div className="alert-banner">⚠️ Delayed by {task.delayDays} day(s)</div>}
                          <div className="task-header">
                            <h3>{task.taskDetails}</h3>
                            <div className="badges">
                              <span className="badge-channel">{task.channel}</span>
                              <span className={`badge-priority ${task.priority.toLowerCase()}`}>{task.priority}</span>
                            </div>
                            {task.remarks && <p className="task-remarks">💬 {task.remarks}</p>}
                          </div>
                          <div className="task-meta">
                            <div className="meta-info">
                              <p className="assignee">👥 {task.assignedTo}</p>
                              <p className="assigned-by">📌 By: <strong>{task.assignedBy}</strong></p>
                              <p className="due-date">📅 {new Date(task.targetDate).toLocaleDateString()}</p>
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
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>➕ Create New Task</h3>
              <button className="modal-close" onClick={() => setShowNewTaskForm(false)}>✕</button>
            </div>
            <div className="modal-body">
              {isAdmin && (
                <div className="form-group">
                  <label>Task Type</label>
                  <div className="task-type-toggle">
                    <button className={newTask.taskType === 'General' ? 'active' : ''} onClick={() => setNewTask({...newTask, taskType: 'General'})} type="button">
                      📋 General Task
                    </button>
                    <button className={newTask.taskType === 'Routine' ? 'active' : ''} onClick={() => setNewTask({...newTask, taskType: 'Routine'})} type="button">
                      🔄 Routine Task
                    </button>
                  </div>
                </div>
              )}

              <div className="form-group">
                <label>Assign to * (Select multiple)</label>
                <div className="assignee-list">
                  {allAssignees.map(name => (
                    <label key={name} className={`assignee-item ${selectedAssignees.includes(name) ? 'checked' : ''}`}>
                      <input type="checkbox" checked={selectedAssignees.includes(name)} onChange={() => toggleAssignee(name)} />
                      <span className="assignee-name">{name}</span>
                    </label>
                  ))}
                </div>
                {selectedAssignees.length > 0 && (
                  <p className="selected-count">✓ {selectedAssignees.length} selected</p>
                )}
              </div>

              <div className="form-group">
                <label>Task Details *</label>
                <input type="text" placeholder="What needs to be done?" value={newTask.taskDetails} onChange={(e) => setNewTask({ ...newTask, taskDetails: e.target.value })} />
              </div>

              <div className="form-group">
                <label>Remarks / Notes</label>
                <input type="text" placeholder="Additional instructions" value={newTask.remarks} onChange={(e) => setNewTask({ ...newTask, remarks: e.target.value })} />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Channel *</label>
                  <select value={newTask.channel} onChange={(e) => setNewTask({ ...newTask, channel: e.target.value })}>
                    <option value="">Select...</option>
                    {channels.map(ch => <option key={ch} value={ch}>{ch}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Priority</label>
                  <select value={newTask.priority} onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}>
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                  </select>
                </div>
              </div>

              {newTask.taskType === 'General' ? (
                <div className="form-group">
                  <label>Target Date *</label>
                  <input type="date" min="2025-01-01" max="2030-12-31" value={newTask.targetDate} onChange={(e) => setNewTask({ ...newTask, targetDate: e.target.value })} />
                </div>
              ) : (
                <>
                  <div className="form-group">
                    <label>Frequency</label>
                    <select value={newTask.frequency} onChange={(e) => setNewTask({ ...newTask, frequency: e.target.value })}>
                      <option value="Daily">Daily</option>
                      <option value="Weekly">Weekly</option>
                    </select>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Start Date *</label>
                      <input type="date" min="2025-01-01" max="2030-12-31" value={newTask.startDate} onChange={(e) => setNewTask({ ...newTask, startDate: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label>End Date (Optional)</label>
                      <input type="date" min="2025-01-01" max="2030-12-31" value={newTask.endDate} onChange={(e) => setNewTask({ ...newTask, endDate: e.target.value })} />
                    </div>
                  </div>
                </>
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