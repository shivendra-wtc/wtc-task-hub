import { useState, useEffect, useRef } from 'react'
import './App.css'

const API_URL = "https://script.google.com/macros/s/AKfycbxhrBrgG4x5U6v7YzYYbREaptULHIKprzL5ZAdCUySbdQBrqTkib2mEdujKYensAhkR-A/exec";

const QUOTES = {
  manager: [
    "Great leaders create more leaders, not followers. - Tom Peters",
    "Vision without execution is hallucination. - Thomas Edison",
    "A leader is one who knows the way, goes the way, and shows the way.",
    "Don't tell people how to do things, tell them what to do and let them surprise you. - George Patton",
    "The best executive is the one who has sense enough to pick good people. - Theodore Roosevelt",
    "Leadership is not about being in charge. It is about taking care of those in your charge. - Simon Sinek",
    "Management is doing things right; leadership is doing the right things. - Peter Drucker",
    "Innovation distinguishes between a leader and a follower. - Steve Jobs",
    "The greatest leader is not necessarily the one who does the greatest things. - Ronald Reagan",
    "Lead by example, not by command.",
    "कर्म ही पूजा है। (Work is worship)",
    "एक अच्छा नेता वह है जो लोगों को विश्वास दिलाए। (A good leader inspires belief)",
    "जहाँ चाह वहाँ राह। (Where there's a will, there's a way)",
    "The function of leadership is to produce more leaders. - Ralph Nader",
    "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    "Discipline is the bridge between goals and accomplishment. - Jim Rohn",
    "Don't watch the clock; do what it does. Keep going. - Sam Levenson",
    "Quality is not an act, it is a habit. - Aristotle",
    "Leaders don't create followers, they create more leaders.",
    "The way to get started is to quit talking and begin doing. - Walt Disney",
    "A goal without a plan is just a wish. - Antoine de Saint-Exupery",
    "The best time to plant a tree was 20 years ago. The second best time is now.",
    "Success is not the key to happiness. Happiness is the key to success.",
    "Do what you can with all you have, wherever you are.",
    "The future depends on what you do today. - Mahatma Gandhi",
    "Great things never come from comfort zones.",
    "Dream it. Wish it. Do it.",
    "Success doesn't just find you. You have to go out and get it.",
    "The harder you work, the luckier you get.",
    "Believe you can and you're halfway there."
  ],
  ceo: [
    "As CEO, my job is to enable my people to think strategically. - Praveen mode",
    "The role of a CEO is not to have all the answers, but to ask the right questions.",
    "A CEO's job is to build a company that lasts. - Warren Buffett",
    "Chase the vision, not the money. - Tony Hsieh",
    "Your most unhappy customers are your greatest source of learning. - Bill Gates",
    "Innovation is saying no to a thousand things. - Steve Jobs",
    "Culture eats strategy for breakfast. - Peter Drucker",
    "The way to get started is to quit talking and begin doing. - Walt Disney",
    "Don't be afraid to give up the good to go for the great. - John D. Rockefeller",
    "Success is walking from failure to failure with no loss of enthusiasm. - Winston Churchill",
    "जो लीडर बनना चाहे, वो सेवक बने। (Who wants to lead, must serve)",
    "व्यापार में विश्वास सबसे बड़ी पूंजी है। (Trust is the biggest capital in business)",
    "In the middle of every difficulty lies opportunity. - Albert Einstein",
    "The customer's perception is your reality. - Kate Zabriskie",
    "You don't build a business, you build people, then people build the business. - Zig Ziglar",
    "Success in business requires training, discipline, and hard work.",
    "Business opportunities are like buses, there's always another one coming. - Richard Branson",
    "The best way to predict the future is to create it.",
    "A brand for a company is like a reputation for a person. - Jeff Bezos",
    "If you're not embarrassed by the first version of your product, you launched too late. - Reid Hoffman",
    "Move fast and break things. - Mark Zuckerberg",
    "Your work is going to fill a large part of your life, and the only way to do great work is to love what you do. - Steve Jobs",
    "The value of an idea lies in the using of it. - Thomas Edison",
    "Wonder what your customer really wants? Ask. Don't tell. - Lisa Stone",
    "Timing, perseverance, and ten years of trying will eventually make you look like an overnight success. - Biz Stone",
    "Ideas are commodities. Execution of them is not. - Michael Dell",
    "Every problem is a gift—without problems we would not grow. - Anthony Robbins",
    "The successful warrior is the average man, with laser-like focus. - Bruce Lee",
    "Whether you think you can or think you can't, you're right. - Henry Ford",
    "Do what you feel in your heart to be right. - Eleanor Roosevelt"
  ],
  social_media: [
    "Content is king, but engagement is queen. - Mari Smith",
    "Social media is about sociology and psychology more than technology. - Brian Solis",
    "Don't be afraid to get creative and experiment with your marketing. - Mike Volpe",
    "Marketing is no longer about the stuff you make, but about the stories you tell. - Seth Godin",
    "Your brand is what people say about you when you're not in the room. - Jeff Bezos",
    "Make every post count. Quality over quantity.",
    "Behind every successful brand is a great social media manager.",
    "Engagement is the new ROI.",
    "Create content that doesn't just sell, but tells.",
    "Be authentic. Be original. Be you.",
    "रचनात्मकता की कोई सीमा नहीं। (Creativity has no limits)",
    "हर पोस्ट एक कहानी है। (Every post is a story)",
    "Design is thinking made visual. - Saul Bass",
    "Creativity takes courage. - Henri Matisse",
    "Don't find customers for your products, find products for your customers. - Seth Godin",
    "The best marketing doesn't feel like marketing. - Tom Fishburne",
    "Good design is good business. - Thomas Watson Jr.",
    "Content builds relationships. Relationships build trust. Trust drives revenue. - Andrew Davis",
    "Storytelling is the most powerful way to put ideas into the world. - Robert McKee",
    "Aesthetic matters. First impressions count.",
    "हर ब्रांड की एक आत्मा होती है। (Every brand has a soul)",
    "Make it simple. Make it memorable. Make it inviting to look at. - Leo Burnett",
    "The art challenges the technology, and the technology inspires the art. - John Lasseter",
    "Your work is your signature. Make sure it's authentic.",
    "Content is fire, social media is gasoline. - Jay Baer",
    "Design is intelligence made visible. - Alina Wheeler",
    "Be so good they can't ignore you. - Steve Martin",
    "Creativity is intelligence having fun. - Albert Einstein",
    "Every great design begins with an even better story. - Lorinda Mamo",
    "Pixels and stories - that's all you need."
  ],
  video_editor: [
    "Editing is where stories truly come alive.",
    "Great videos take great patience.",
    "Cut to the emotion, not the action.",
    "The best edit is the one you don't notice.",
    "Editing is the strongest manipulator of cinema. - Walter Murch",
    "Cinema is a matter of what's in the frame and what's out. - Martin Scorsese",
    "Every cut tells a story.",
    "Patience in editing equals perfection in viewing.",
    "Master the rhythm, master the edit.",
    "Sound design is half of the experience.",
    "एक अच्छा एडिटर वह है जो कहानी सुनाए। (A good editor tells a story)",
    "धैर्य ही एडिटिंग की कुंजी है। (Patience is the key to editing)",
    "Coffee + Creativity = Magic",
    "The frame is your canvas. Paint emotions.",
    "Don't just edit - elevate.",
    "Color tells the story words cannot.",
    "Edit with your heart, refine with your mind.",
    "Great editing is invisible. Bad editing is unforgettable.",
    "Timing is everything in video editing.",
    "Be patient with the cut, ruthless with the trim.",
    "हर फ्रेम एक कहानी है। (Every frame is a story)",
    "Music is the language of emotions in video.",
    "Editing is the soul of storytelling.",
    "Make every second count.",
    "Less is more - especially in editing.",
    "The magic happens in post-production.",
    "Transition with purpose, cut with reason.",
    "Render. Review. Refine. Repeat.",
    "B-roll is the bridge between great shots.",
    "You don't edit videos, you craft experiences."
  ],
  pr: [
    "PR is the result of what you do, what you say, and what others say about you.",
    "Build relationships, not just contacts.",
    "Your brand is what people say about you when you're not in the room. - Jeff Bezos",
    "Publicity is the nuclear weapon of business. - Al Ries",
    "Good PR educates people; bad PR manipulates them.",
    "Authenticity wins in PR.",
    "Communication works for those who work at it. - John Powell",
    "The best PR is great work.",
    "Trust is the foundation of all communication.",
    "Listen first, speak second.",
    "रिश्ते बनाओ, सौदे नहीं। (Build relationships, not deals)",
    "हर शब्द सोच-समझकर बोलो। (Choose every word carefully)",
    "Reputation takes years to build, minutes to destroy.",
    "Your story is your strongest asset.",
    "Be visible. Be valuable. Be vocal.",
    "PR is a marathon, not a sprint.",
    "Make news, don't chase it.",
    "Network with purpose, connect with passion.",
    "The right pitch at the right time changes everything.",
    "Empathy is the secret weapon of PR.",
    "विश्वास सबसे बड़ी पूंजी है। (Trust is the biggest asset)",
    "Press releases tell, stories sell.",
    "Be the source, not just the spokesperson.",
    "Credibility is built one interaction at a time.",
    "Listen to understand, not to respond.",
    "PR is about perception, but reality wins long-term.",
    "Tell the truth, but tell it well.",
    "Relationships are the currency of PR.",
    "Be quotable. Be memorable. Be authentic.",
    "Your media list is your goldmine."
  ],
  hr: [
    "HR is not about HR. HR is about the business.",
    "People may forget what you said, but they'll never forget how you made them feel. - Maya Angelou",
    "Take care of your employees and they'll take care of your business. - Richard Branson",
    "The goal of HR is to make people great.",
    "Hire character. Train skill. - Peter Schutz",
    "Employees who believe that management is concerned about them as a whole person are more productive. - Anne Mulcahy",
    "Train people well enough so they can leave, treat them well enough so they don't want to. - Richard Branson",
    "Culture eats strategy for breakfast. - Peter Drucker",
    "Great vision without great people is irrelevant. - Jim Collins",
    "HR makes the workplace human.",
    "लोगों की देखभाल करो, वे आपकी देखभाल करेंगे। (Care for people, they'll care for you)",
    "इंसानियत सबसे बड़ी संपत्ति है। (Humanity is the greatest wealth)",
    "Happy employees lead to happy customers.",
    "Diversity is being invited to the party; inclusion is being asked to dance.",
    "Talent wins games, teamwork wins championships. - Michael Jordan",
    "The strength of the team is each individual member.",
    "Empathy is the greatest leadership skill.",
    "People are not your most important asset. The right people are. - Jim Collins",
    "A team is not a group of people who work together. A team is a group of people who trust each other.",
    "HR builds bridges between people and possibilities.",
    "हर कर्मचारी एक पारिवारिक सदस्य है। (Every employee is a family member)",
    "Compassion in leadership is courage.",
    "Be the leader you wish you had.",
    "Listen with the intent to understand, not to reply.",
    "Workplace happiness is not a perk, it's a foundation.",
    "Recruit for attitude, train for skill.",
    "Engagement starts with empathy.",
    "Your culture is your competitive advantage.",
    "People work for purpose, not paychecks alone.",
    "HR is the heart of every organization."
  ]
};

function App() {
  const channels = [
    'AG Insta', 'AG YT', 'The Fact-Tree YT', 'The Fact-Tree Insta',
    'HisTree YT', 'HisTree Insta', 'AG.books Insta', 'Other'
  ];

  const team = [
    { id: 'praveen', name: 'Praveen Chilhate', role: 'CEO', avatar: 'PC', quoteType: 'ceo', isAdmin: true },
    { id: 'manager', name: 'Shivendra Tomar', role: 'Sr. Manager - Social Media & Content', avatar: 'ST', quoteType: 'manager', isAdmin: true },
    { id: 'samanta', name: 'Samanta', role: 'Social Media Exec & Design', avatar: 'SA', quoteType: 'social_media' },
    { id: 'charu', name: 'Charu', role: 'Social Media Exec & Design', avatar: 'CH', quoteType: 'social_media' },
    { id: 'saraswati', name: 'Saraswati', role: 'Social Media Exec & Design', avatar: 'SR', quoteType: 'social_media' },
    { id: 'intern', name: 'Intern', role: 'Intern - Social Media', avatar: 'IN', quoteType: 'social_media' },
    { id: 'naman', name: 'Naman', role: 'Video Editor', avatar: 'NM', quoteType: 'video_editor' },
    { id: 'karan', name: 'Karan', role: 'Video Editor', avatar: 'KR', quoteType: 'video_editor' },
    { id: 'sanjeevani', name: 'Sanjeevani', role: 'PR Manager', avatar: 'SJ', quoteType: 'pr' },
    { id: 'pari', name: 'Pari', role: 'HR', avatar: 'PR', quoteType: 'hr' },
    { id: 'nidhi', name: 'Nidhi', role: 'Poorvaj - Kids Brand', avatar: 'ND', quoteType: 'social_media' },
    { id: 'muskan', name: 'Muskan', role: 'Devastram - Ethnic Wear', avatar: 'MK', quoteType: 'social_media' },
    { id: 'deeksha', name: 'Deeksha', role: 'Content Creator', avatar: 'DK', quoteType: 'social_media' }
  ];

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
    const diff = now - start;
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  };

  const getTimeBasedGreeting = (name) => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return `🌅 Good Morning, ${name}!`;
    if (hour >= 12 && hour < 17) return `☀️ Good Afternoon, ${name}!`;
    if (hour >= 17 && hour < 21) return `🌆 Good Evening, ${name}!`;
    return `🌙 Working Late, ${name}!`;
  };

  const getTodayQuote = (userId) => {
    const day = getDayOfYear();
    const member = team.find(t => t.id === userId);
    if (member) {
      return QUOTES[member.quoteType][day % QUOTES[member.quoteType].length];
    }
    return "";
  };

  const getFormattedDate = () => {
    const now = new Date();
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return `${days[now.getDay()]}, ${months[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`;
  };

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(getUserFromURL());
  const [managerView, setManagerView] = useState('all');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterChannel, setFilterChannel] = useState('All');
  const [showNewTaskForm, setShowNewTaskForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [attendance, setAttendance] = useState([]);
  const [myStatus, setMyStatus] = useState('Not Signed In');
  const [showAttendance, setShowAttendance] = useState(false);
  const [taskViewMode, setTaskViewMode] = useState('assigned'); // 'assigned' or 'own'
  const [newTask, setNewTask] = useState({
    assignedTo: '',
    taskDetails: '',
    remarks: '',
    priority: 'Medium',
    targetDate: '',
    channel: ''
  });

  const currentUserInfo = team.find(t => t.id === currentUser);
  const isAdmin = currentUserInfo?.isAdmin || false;
  const isInvalidUser = !currentUser;
  const userName = currentUserInfo?.name || '';
  const greeting = userName ? getTimeBasedGreeting(userName) : '';
  const todayQuote = currentUser ? getTodayQuote(currentUser) : '';
  const formattedDate = getFormattedDate();

  const statusColors = {
    'Not Started': '#3B6D11',
    'In Progress': '#BA7517',
    'Completed': '#0F6E56',
    'On Hold': '#534AB7',
    'Delayed': '#A32D2D'
  };

  const attendanceColors = {
    'Working': '#0F6E56',
    'Tea Break': '#BA7517',
    'Lunch Break': '#A32D2D',
    'Meeting': '#534AB7',
    'Signed Out': '#666666',
    'Not Signed In': '#999999'
  };

  useEffect(() => {
    if (currentUser) {
      loadTasks();
      loadAttendance();
    }
  }, [currentUser]);

  // SMOOTH BACKGROUND REFRESH - No flickering
  useEffect(() => {
    if (currentUser) {
      const interval = setInterval(() => {
        loadTasksBackground();
        loadAttendanceBackground();
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [currentUser]);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_URL + '?action=getTasks');
      const data = await response.json();
      if (data.status === 'ok') setTasks(data.tasks);
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  // Background load - no loading state (no flickering)
  const loadTasksBackground = async () => {
    try {
      const response = await fetch(API_URL + '?action=getTasks');
      const data = await response.json();
      if (data.status === 'ok') setTasks(data.tasks);
    } catch (error) {
      console.error('Background task load error:', error);
    }
  };

  const loadAttendance = async () => {
    try {
      const response = await fetch(API_URL + '?action=getAttendance');
      const data = await response.json();
      if (data.status === 'ok') {
        setAttendance(data.attendance);
        if (!isAdmin) {
          const myRecord = data.attendance.find(a => a.userId === currentUser);
          if (myRecord) setMyStatus(myRecord.status);
        }
      }
    } catch (error) {
      console.error('Error loading attendance:', error);
    }
  };

  // Background attendance load
  const loadAttendanceBackground = async () => {
    try {
      const response = await fetch(API_URL + '?action=getAttendance');
      const data = await response.json();
      if (data.status === 'ok') {
        setAttendance(data.attendance);
        if (!isAdmin) {
          const myRecord = data.attendance.find(a => a.userId === currentUser);
          if (myRecord) setMyStatus(myRecord.status);
        }
      }
    } catch (error) {
      console.error('Background attendance error:', error);
    }
  };

  const updateMyStatus = async (newStatus) => {
    if (isAdmin) return;
    if (!currentUserInfo) return;
    
    setMyStatus(newStatus);
    
    try {
      await fetch(API_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({
          action: 'updateAttendance',
          userId: currentUser,
          userName: currentUserInfo.name,
          status: newStatus
        })
      });
      setTimeout(() => loadAttendanceBackground(), 1500);
    } catch (error) {
      console.error('Error updating attendance:', error);
    }
  };

  const calculateWorkingTime = (log) => {
    if (!log || typeof log !== 'string') {
      return { working: '0h 0m', breaks: '0h 0m', productivity: 0 };
    }
    
    try {
      const events = log.split('|').map(e => {
        const parts = e.split(':');
        if (parts.length < 2) return null;
        const status = parts[0];
        const timeStr = parts.slice(1).join(':');
        const time = new Date(timeStr);
        if (isNaN(time.getTime())) return null;
        return { status, time };
      }).filter(e => e !== null);
      
      if (events.length === 0) return { working: '0h 0m', breaks: '0h 0m', productivity: 0 };
      
      let workingMs = 0;
      let breakMs = 0;
      
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
      
      const workingHours = Math.floor(workingMs / (1000 * 60 * 60));
      const workingMins = Math.floor((workingMs % (1000 * 60 * 60)) / (1000 * 60));
      const breakHours = Math.floor(breakMs / (1000 * 60 * 60));
      const breakMins = Math.floor((breakMs % (1000 * 60 * 60)) / (1000 * 60));
      const totalMs = workingMs + breakMs;
      const productivity = totalMs > 0 ? Math.round((workingMs / totalMs) * 100) : 0;
      
      return {
        working: `${workingHours}h ${workingMins}m`,
        breaks: `${breakHours}h ${breakMins}m`,
        productivity: productivity
      };
    } catch (error) {
      return { working: '0h 0m', breaks: '0h 0m', productivity: 0 };
    }
  };

  // Filter tasks based on user role and view mode
  const filteredTasks = tasks.filter(t => {
    // Hide completed tasks older than 24 hours
    if (t.status === 'Completed' && t.completionDate) {
      const completedTime = new Date(t.completionDate);
      const hoursSince = (new Date() - completedTime) / (1000 * 60 * 60);
      if (hoursSince > 24) return false;
    }
    
    if (isAdmin) {
      // Admin can see all or filter by team member
      if (managerView !== 'all') {
        const user = team.find(u => u.id === managerView);
        if (t.assignedTo !== user?.name) return false;
      }
    } else {
      // Regular team member
      if (taskViewMode === 'assigned') {
        // Show tasks assigned TO me
        if (t.assignedTo !== currentUserInfo.name) return false;
      } else if (taskViewMode === 'own') {
        // Show tasks I created (assigned by me)
        if (t.assignedBy !== currentUserInfo.name) return false;
      }
    }
    
    if (filterStatus !== 'All' && t.status !== filterStatus) return false;
    if (filterChannel !== 'All' && t.channel !== filterChannel) return false;
    return true;
  });

  const handleAddTask = async () => {
    if (!newTask.assignedTo || !newTask.taskDetails || !newTask.targetDate || !newTask.channel) {
      alert('Please fill all required fields!');
      return;
    }
    try {
      setSaving(true);
      const taskData = {
        ...newTask,
        assignedBy: currentUserInfo.name,
        status: 'Not Started'
      };
      await fetch(API_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({ action: 'addTask', task: taskData })
      });
      setNewTask({ assignedTo: '', taskDetails: '', remarks: '', priority: 'Medium', targetDate: '', channel: '' });
      setShowNewTaskForm(false);
      setTimeout(() => { loadTasksBackground(); setSaving(false); }, 1500);
    } catch (error) {
      console.error('Error:', error);
      setSaving(false);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    try {
      await fetch(API_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({ action: 'updateStatus', taskId: taskId, status: newStatus })
      });
      setTimeout(() => loadTasksBackground(), 1500);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleExportWhatsApp = (task) => {
    const teamMember = team.find(t => t.name === task.assignedTo);
    const personalURL = teamMember ? `https://wtc-task-hub.vercel.app/?user=${teamMember.id}` : 'https://wtc-task-hub.vercel.app';
    const message = `📋 TASK ASSIGNED - WTC Management\n\nHi ${task.assignedTo},\n\n📝 Task: ${task.taskDetails}\n💬 Remarks: ${task.remarks || 'N/A'}\n📢 Channel: ${task.channel}\n⚡ Priority: ${task.priority}\n📅 Target Date: ${new Date(task.targetDate).toLocaleDateString()}\n👤 Assigned By: ${task.assignedBy}\n\n🔗 Update in YOUR Dashboard:\n${personalURL}\n\nPlease update status when you start working!`;
    navigator.clipboard.writeText(message);
    alert('Message copied! Paste in WhatsApp to send to ' + task.assignedTo);
  };

  const getViewTitle = () => {
    if (isAdmin && managerView === 'all') return '📊 All Team Tasks';
    if (isAdmin && managerView !== 'all') {
      const member = team.find(t => t.id === managerView);
      return `📋 ${member?.name}'s Tasks`;
    }
    if (taskViewMode === 'assigned') return '📥 Tasks Assigned to Me';
    return '📝 My Own Tasks';
  };

  if (isInvalidUser) {
    return (
      <div className="app">
        <div className="welcome-screen">
          <div className="welcome-card">
            <img src="/wtc-logo.png" alt="WTC Logo" className="welcome-logo" />
            <h1>WTC's Management Hub</h1>
            <p className="welcome-text">Welcome! Please use your personal dashboard link.</p>
            <div className="welcome-info">
              <strong>📌 Need your link?</strong><br/>
              Contact Shivendra to get your personal dashboard URL.
            </div>
          </div>
        </div>
        <footer className="footer">
          <p>Made with ❤️ by Shivendra - WTC Management</p>
        </footer>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="header">
        <div className="header-left">
          <img src="/wtc-logo.png" alt="WTC Logo" className="logo-img" />
          <div className="header-info">
            <h1>{isAdmin ? "WTC's Management Hub" : "WTC Task Hub"}</h1>
            <p className="greeting">{greeting}</p>
            <p className="date-display">📅 {formattedDate}</p>
            <p className="quote-display">💭 {todayQuote}</p>
          </div>
        </div>
        <div className="header-actions">
          {isAdmin && managerView !== 'all' && (
            <button className="btn-home" onClick={() => setManagerView('all')}>
              🏠 Home
            </button>
          )}
          <button className="btn-secondary" onClick={() => { loadTasks(); loadAttendance(); }}>
            🔄 Refresh
          </button>
          <button className="btn-primary" onClick={() => setShowNewTaskForm(!showNewTaskForm)}>
            + New Task
          </button>
        </div>
      </header>

      {loading && (
        <div className="loading-state">
          <p>Loading from Google Sheets...</p>
        </div>
      )}

      {saving && (
        <div className="saving-state">
          <p>💾 Saving to Google Sheets...</p>
        </div>
      )}

      {!loading && (
        <>
          {/* Team member attendance card */}
          {!isAdmin && (
            <div className="attendance-card">
              <h3>⏰ Your Attendance Today</h3>
              <div className="attendance-info">
                <div className="status-badge" style={{background: attendanceColors[myStatus] + '20', color: attendanceColors[myStatus]}}>
                  Status: <strong>{myStatus}</strong>
                </div>
                {attendance.find(a => a.userId === currentUser) && (
                  <div className="time-info">
                    {(() => {
                      const times = calculateWorkingTime(attendance.find(a => a.userId === currentUser)?.log);
                      return (
                        <>
                          <div>⏱️ Working: <strong>{times.working}</strong></div>
                          <div>☕ Breaks: <strong>{times.breaks}</strong></div>
                          <div>📊 Productivity: <strong>{times.productivity}%</strong></div>
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

          {/* Admin: Team Status */}
          {isAdmin && (
            <div className="team-status-section">
              <div className="section-header" onClick={() => setShowAttendance(!showAttendance)}>
                <h3>📊 Team Status Today {showAttendance ? '▼' : '▶'}</h3>
              </div>
              {showAttendance && (
                <div className="team-status-grid">
                  {team.filter(m => !m.isAdmin).map(member => {
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

          {/* Admin: Team Switcher */}
          {isAdmin && (
            <div className="manager-nav">
              <div className="nav-label">{managerView === 'all' ? '👥 Quick Switch:' : '📂 Currently Viewing:'}</div>
              <div className="user-switcher">
                <button className={managerView === 'all' ? 'active' : ''} onClick={() => setManagerView('all')}>🏠 All Tasks</button>
                {team.filter(m => !m.isAdmin).map(member => (
                  <button key={member.id} className={managerView === member.id ? 'active' : ''} onClick={() => setManagerView(member.id)} title={member.name}>
                    {member.avatar}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Team Member: Task View Toggle */}
          {!isAdmin && (
            <div className="task-view-toggle">
              <button 
                className={taskViewMode === 'assigned' ? 'active' : ''} 
                onClick={() => setTaskViewMode('assigned')}
              >
                📥 Assigned to Me
              </button>
              <button 
                className={taskViewMode === 'own' ? 'active' : ''} 
                onClick={() => setTaskViewMode('own')}
              >
                📝 My Own Tasks
              </button>
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
          </div>

          {showNewTaskForm && (
            <div className="new-task-form">
              <h3>Create New Task</h3>
              <div className="form-row">
                <select value={newTask.assignedTo} onChange={(e) => setNewTask({ ...newTask, assignedTo: e.target.value })}>
                  <option value="">Assign to... *</option>
                  {team.map(t => <option key={t.id} value={t.name}>{t.name} ({t.role})</option>)}
                </select>
                <select value={newTask.channel} onChange={(e) => setNewTask({ ...newTask, channel: e.target.value })}>
                  <option value="">Select channel... *</option>
                  {channels.map(ch => <option key={ch} value={ch}>{ch}</option>)}
                </select>
              </div>
              <input type="text" placeholder="Task Details *" value={newTask.taskDetails} onChange={(e) => setNewTask({ ...newTask, taskDetails: e.target.value })} />
              <input type="text" placeholder="Remarks / Notes (optional)" value={newTask.remarks} onChange={(e) => setNewTask({ ...newTask, remarks: e.target.value })} />
              <div className="form-row">
                <select value={newTask.priority} onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}>
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                </select>
                <input type="date" value={newTask.targetDate} onChange={(e) => setNewTask({ ...newTask, targetDate: e.target.value })} />
              </div>
              <div className="form-actions">
                <button className="btn-success" onClick={handleAddTask} disabled={saving}>
                  {saving ? 'Saving...' : 'Create Task'}
                </button>
                <button className="btn-secondary" onClick={() => setShowNewTaskForm(false)}>Cancel</button>
              </div>
            </div>
          )}

          <div className="tasks-container">
            {filteredTasks.length === 0 ? (
              <div className="empty-state">
                <p>{isAdmin ? 'No tasks to display' : (taskViewMode === 'assigned' ? '🎉 No tasks assigned to you. Enjoy!' : '📝 You have not created any tasks yet.')}</p>
              </div>
            ) : (
              <div className="tasks-grid">
                {filteredTasks.map(task => (
                  <div key={task.id} className={`task-card ${task.delayDays > 0 ? 'overdue' : ''}`}>
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
                      <div className="avatar">{task.assignedTo.substring(0, 2).toUpperCase()}</div>
                      <div className="meta-info">
                        <p className="assignee">👤 {task.assignedTo}</p>
                        <p className="assigned-by">📌 Assigned by: <strong>{task.assignedBy}</strong></p>
                        <p className="due-date">📅 Target: {new Date(task.targetDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="task-footer">
                      <select value={task.status} onChange={(e) => handleStatusChange(task.id, e.target.value)} className="status-select" style={{ color: statusColors[task.status] }}>
                        <option value="Not Started">Not Started</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                        <option value="On Hold">On Hold</option>
                        <option value="Delayed">Delayed</option>
                      </select>
                      <button className="btn-whatsapp" onClick={() => handleExportWhatsApp(task)} title="Copy WhatsApp message">
                        WA
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      <footer className="footer">
        <p>Made with ❤️ by Shivendra - WTC Management</p>
      </footer>
    </div>
  )
}

export default App