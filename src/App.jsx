import { useState, useEffect } from 'react'
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
    "अनुशासन से सब कुछ संभव है। (Everything is possible with discipline)",
    "Strategy without tactics is the slowest route to victory. - Sun Tzu",
    "Success usually comes to those who are too busy to be looking for it. - Henry David Thoreau",
    "Coming together is a beginning, staying together is progress, working together is success. - Henry Ford",
    "If your actions inspire others to dream more, learn more, do more, you are a leader. - John Quincy Adams",
    "Leadership is the capacity to translate vision into reality. - Warren Bennis",
    "Be the change that you wish to see in the world. - Mahatma Gandhi",
    "Hire character. Train skill. - Peter Schutz",
    "Effective leadership is putting first things first. - Stephen Covey",
    "A goal without a plan is just a wish. - Antoine de Saint-Exupery"
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
    "Coffee + Creativity = Magic ☕✨",
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
    'AG Insta', 'AG YT', 'The Fact-Tree Insta', 'The Fact-Tree YT',
    'Poorvaj Insta', 'Poorvaj YT', 'Devastram Insta', 'Devastram YT',
    'Histree YT', 'Histree Insta', 'Other'
  ];

  const team = [
    { id: 'samanta', name: 'Samanta', role: 'Social Media Exec & Design', avatar: 'SA', quoteType: 'social_media' },
    { id: 'charu', name: 'Charu', role: 'Social Media Exec & Design', avatar: 'CH', quoteType: 'social_media' },
    { id: 'saraswati', name: 'Saraswati', role: 'Social Media Exec & Design', avatar: 'SR', quoteType: 'social_media' },
    { id: 'khusi', name: 'Khusi', role: 'Social Media Exec & Design', avatar: 'KH', quoteType: 'social_media' },
    { id: 'naman', name: 'Naman', role: 'Video Editor', avatar: 'NM', quoteType: 'video_editor' },
    { id: 'karan', name: 'Karan', role: 'Video Editor', avatar: 'KR', quoteType: 'video_editor' },
    { id: 'ajay', name: 'Ajay', role: 'Video Editor', avatar: 'AJ', quoteType: 'video_editor' },
    { id: 'sanjeevani', name: 'Sanjeevani', role: 'PR Manager', avatar: 'SJ', quoteType: 'pr' },
    { id: 'pari', name: 'Pari', role: 'HR', avatar: 'PR', quoteType: 'hr' }
  ];

  const getUserFromURL = () => {
    const params = new URLSearchParams(window.location.search);
    const user = params.get('user');
    if (!user) return null;
    if (user === 'manager') return 'manager';
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
    if (userId === 'manager') {
      return QUOTES.manager[day % QUOTES.manager.length];
    }
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
  const [newTask, setNewTask] = useState({
    title: '',
    assignee: '',
    channel: '',
    priority: 'Medium',
    dueDate: ''
  });

  const isManager = currentUser === 'manager';
  const isTeamMember = currentUser && currentUser !== 'manager';
  const isInvalidUser = !currentUser;
  const userName = isManager ? 'Shivendra' : (team.find(t => t.id === currentUser)?.name || '');
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

  useEffect(() => {
    if (isManager) {
      const interval = setInterval(() => {
        loadAttendance();
        loadTasks();
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [isManager]);

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

  const loadAttendance = async () => {
    try {
      const response = await fetch(API_URL + '?action=getAttendance');
      const data = await response.json();
      if (data.status === 'ok') {
        setAttendance(data.attendance);
        if (isTeamMember) {
          const myRecord = data.attendance.find(a => a.userId === currentUser);
          if (myRecord) setMyStatus(myRecord.status);
        }
      }
    } catch (error) {
      console.error('Error loading attendance:', error);
    }
  };

  const updateMyStatus = async (newStatus) => {
    if (!isTeamMember) return;
    const userInfo = team.find(t => t.id === currentUser);
    if (!userInfo) return;
    
    setMyStatus(newStatus);
    
    try {
      await fetch(API_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({
          action: 'updateAttendance',
          userId: currentUser,
          userName: userInfo.name,
          status: newStatus
        })
      });
      setTimeout(() => loadAttendance(), 1500);
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
      
      if (events.length === 0) {
        return { working: '0h 0m', breaks: '0h 0m', productivity: 0 };
      }
      
      let workingMs = 0;
      let breakMs = 0;
      
      for (let i = 0; i < events.length - 1; i++) {
        const current = events[i];
        const next = events[i + 1];
        const duration = next.time - current.time;
        
        if (duration < 0) continue;
        
        if (current.status === 'Working') {
          workingMs += duration;
        } else if (current.status === 'Tea Break' || current.status === 'Lunch Break' || current.status === 'Meeting') {
          breakMs += duration;
        }
      }
      
      const lastEvent = events[events.length - 1];
      if (lastEvent && lastEvent.status !== 'Signed Out') {
        const now = new Date();
        const duration = now - lastEvent.time;
        
        if (duration > 0) {
          if (lastEvent.status === 'Working') {
            workingMs += duration;
          } else if (lastEvent.status === 'Tea Break' || lastEvent.status === 'Lunch Break' || lastEvent.status === 'Meeting') {
            breakMs += duration;
          }
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
      console.error('Error calculating time:', error);
      return { working: '0h 0m', breaks: '0h 0m', productivity: 0 };
    }
  };

  const getTaskAlert = (lastUpdated, status, dueDate) => {
    if (status === 'Completed') return null;
    const now = new Date();
    const updatedTime = new Date(lastUpdated);
    const hoursSince = (now - updatedTime) / (1000 * 60 * 60);
    const dueTime = new Date(dueDate);
    const isOverdue = now > dueTime;
    if (hoursSince >= 24) return { type: 'escalation', message: 'No update for ' + Math.round(hoursSince) + 'h' };
    if (isOverdue) return { type: 'overdue', message: 'OVERDUE' };
    return null;
  };

  const filteredTasks = tasks.filter(t => {
    if (isTeamMember) {
      const user = team.find(u => u.id === currentUser);
      if (t.assignee !== user?.name) return false;
    } else if (isManager && managerView !== 'all') {
      const user = team.find(u => u.id === managerView);
      if (t.assignee !== user?.name) return false;
    }
    if (filterStatus !== 'All' && t.status !== filterStatus) return false;
    if (filterChannel !== 'All' && t.channel !== filterChannel) return false;
    return true;
  });

  const handleAddTask = async () => {
    if (!newTask.title || !newTask.assignee || !newTask.channel || !newTask.dueDate) {
      alert('Please fill all fields!');
      return;
    }
    try {
      setSaving(true);
      await fetch(API_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({ action: 'addTask', task: newTask })
      });
      setNewTask({ title: '', assignee: '', channel: '', priority: 'Medium', dueDate: '' });
      setShowNewTaskForm(false);
      setTimeout(() => { loadTasks(); setSaving(false); }, 1500);
    } catch (error) {
      console.error('Error:', error);
      setSaving(false);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus, lastUpdated: new Date().toISOString() } : t));
    try {
      await fetch(API_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({ action: 'updateStatus', taskId: taskId, status: newStatus })
      });
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleExportWhatsApp = (task) => {
    const teamMember = team.find(t => t.name === task.assignee);
    const personalURL = teamMember ? `https://wtc-task-hub.vercel.app/?user=${teamMember.id}` : 'https://wtc-task-hub.vercel.app';
    const message = 'TASK ASSIGNED - WTC Management\n\nHi ' + task.assignee + ',\n\nTask: ' + task.title + '\nChannel: ' + task.channel + '\nStatus: ' + task.status + '\nPriority: ' + task.priority + '\nDue: ' + new Date(task.dueDate).toLocaleDateString() + '\n\nUpdate in YOUR Dashboard:\n' + personalURL + '\n\nPlease update status when you start working!';
    navigator.clipboard.writeText(message);
    alert('Message copied to clipboard! Paste in WhatsApp to send to ' + task.assignee + '.');
  };

  const getViewTitle = () => {
    if (isManager && managerView === 'all') return 'Manager Dashboard - All Tasks';
    if (isManager && managerView !== 'all') {
      const member = team.find(t => t.id === managerView);
      return "Viewing: " + member?.name + "'s Tasks";
    }
    return '';
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
              Contact your manager to get your personal dashboard URL.
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
            <h1>{isManager ? "WTC's Management Hub" : "WTC Task Hub"}</h1>
            <p className="greeting">{greeting}</p>
            <p className="date-display">📅 {formattedDate}</p>
            <p className="quote-display">💭 {todayQuote}</p>
          </div>
        </div>
        <div className="header-actions">
          {isManager && managerView !== 'all' && (
            <button className="btn-home" onClick={() => setManagerView('all')} title="Back to All Tasks">
              🏠 Home
            </button>
          )}
          <button className="btn-secondary" onClick={() => { loadTasks(); loadAttendance(); }} title="Refresh data">
            🔄 Refresh
          </button>
          {isManager && (
            <button className="btn-primary" onClick={() => setShowNewTaskForm(!showNewTaskForm)}>
              + New Task
            </button>
          )}
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
          {isTeamMember && (
            <div className="attendance-card">
              <h3>⏰ Your Attendance Today</h3>
              <div className="attendance-info">
                <div className="status-badge" style={{background: attendanceColors[myStatus] + '20', color: attendanceColors[myStatus]}}>
                  Status: <strong>{myStatus}</strong>
                </div>
                {attendance.find(a => a.userId === currentUser) && (
                  <div className="time-info">
                    {(() => {
                      const myRecord = attendance.find(a => a.userId === currentUser);
                      const times = calculateWorkingTime(myRecord?.log);
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
                  <button className="btn-signin" onClick={() => updateMyStatus('Working')}>
                    🟢 Sign In
                  </button>
                ) : (
                  <>
                    {myStatus !== 'Working' && (
                      <button className="btn-resume" onClick={() => updateMyStatus('Working')}>
                        🟢 Back to Work
                      </button>
                    )}
                    {myStatus !== 'Tea Break' && (
                      <button className="btn-tea" onClick={() => updateMyStatus('Tea Break')}>
                        ☕ Tea Break
                      </button>
                    )}
                    {myStatus !== 'Lunch Break' && (
                      <button className="btn-lunch" onClick={() => updateMyStatus('Lunch Break')}>
                        🍽️ Lunch
                      </button>
                    )}
                    {myStatus !== 'Meeting' && (
                      <button className="btn-meeting" onClick={() => updateMyStatus('Meeting')}>
                        🤝 Meeting
                      </button>
                    )}
                    <button className="btn-signout" onClick={() => updateMyStatus('Signed Out')}>
                      🚪 Sign Out
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          {isManager && (
            <div className="team-status-section">
              <div className="section-header" onClick={() => setShowAttendance(!showAttendance)}>
                <h3>📊 Team Status Today {showAttendance ? '▼' : '▶'}</h3>
              </div>
              {showAttendance && (
                <div className="team-status-grid">
                  {team.map(member => {
                    const memberAttendance = attendance.find(a => a.userId === member.id);
                    const status = memberAttendance?.status || 'Not Signed In';
                    const times = memberAttendance ? calculateWorkingTime(memberAttendance.log) : { working: '0h 0m', breaks: '0h 0m', productivity: 0 };
                    return (
                      <div key={member.id} className="status-card">
                        <div className="status-avatar" style={{background: attendanceColors[status]}}>
                          {member.avatar}
                        </div>
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

          {isManager && (
            <div className="manager-nav">
              <div className="nav-label">{managerView === 'all' ? '👥 Quick Switch:' : '📂 Currently Viewing:'}</div>
              <div className="user-switcher">
                <button className={managerView === 'all' ? 'active' : ''} onClick={() => setManagerView('all')}>
                  🏠 All Tasks
                </button>
                {team.map(member => (
                  <button key={member.id} className={managerView === member.id ? 'active' : ''} onClick={() => setManagerView(member.id)} title={member.name}>
                    {member.avatar}
                  </button>
                ))}
              </div>
            </div>
          )}

          {isManager && managerView !== 'all' && (
            <div className="breadcrumb">
              <button className="breadcrumb-link" onClick={() => setManagerView('all')}>
                ← Back to All Tasks
              </button>
              <span className="breadcrumb-current">Viewing: {team.find(t => t.id === managerView)?.name}</span>
            </div>
          )}

          {isManager && (
            <div className="view-title">
              <h2>📋 {getViewTitle()}</h2>
            </div>
          )}

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

          {showNewTaskForm && isManager && (
            <div className="new-task-form">
              <h3>Create New Task</h3>
              <input type="text" placeholder="Task title" value={newTask.title} onChange={(e) => setNewTask({ ...newTask, title: e.target.value })} />
              <div className="form-row">
                <select value={newTask.assignee} onChange={(e) => setNewTask({ ...newTask, assignee: e.target.value })}>
                  <option value="">Assign to...</option>
                  {team.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
                </select>
                <select value={newTask.channel} onChange={(e) => setNewTask({ ...newTask, channel: e.target.value })}>
                  <option value="">Select channel...</option>
                  {channels.map(ch => <option key={ch} value={ch}>{ch}</option>)}
                </select>
              </div>
              <div className="form-row">
                <select value={newTask.priority} onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}>
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                </select>
                <input type="date" value={newTask.dueDate} onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })} />
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
                <p>{isTeamMember ? 'You have no tasks assigned. Enjoy your day! 🎉' : 'No tasks to display'}</p>
              </div>
            ) : (
              <div className="tasks-grid">
                {filteredTasks.map(task => {
                  const alert = getTaskAlert(task.lastUpdated, task.status, task.dueDate);
                  return (
                    <div key={task.id} className={`task-card ${alert?.type || ''}`}>
                      {alert && <div className="alert-banner">{alert.message}</div>}
                      <div className="task-header">
                        <h3>{task.title}</h3>
                        <div className="badges">
                          <span className="badge-channel">{task.channel}</span>
                          <span className={`badge-priority ${task.priority.toLowerCase()}`}>{task.priority}</span>
                        </div>
                      </div>
                      <div className="task-meta">
                        <div className="avatar">{task.assignee.substring(0, 2)}</div>
                        <div className="meta-info">
                          <p className="assignee">{task.assignee}</p>
                          <p className="due-date">Due: {new Date(task.dueDate).toLocaleDateString()}</p>
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
                        {isManager && (
                          <button className="btn-whatsapp" onClick={() => handleExportWhatsApp(task)} title="Copy WhatsApp message">
                            WA
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
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