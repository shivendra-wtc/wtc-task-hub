import { useState, useEffect } from 'react'
import './App.css'

const API_URL = "https://script.google.com/macros/s/AKfycbxhrBrgG4x5U6v7YzYYbREaptULHIKprzL5ZAdCUySbdQBrqTkib2mEdujKYensAhkR-A/exec";

function App() {
  const channels = [
    'AG Insta', 'AG YT', 'The Fact-Tree Insta', 'The Fact-Tree YT',
    'Poorvaj Insta', 'Poorvaj YT', 'Devastram Insta', 'Devastram YT',
    'Histree YT', 'Histree Insta', 'Other'
  ];

  const team = [
    { id: 1, name: 'Samanta', role: 'Social Media Exec & Design', avatar: 'SA' },
    { id: 2, name: 'Charu', role: 'Social Media Exec & Design', avatar: 'CH' },
    { id: 3, name: 'Saraswati', role: 'Social Media Exec & Design', avatar: 'SR' },
    { id: 4, name: 'Khusi', role: 'Social Media Exec & Design', avatar: 'KH' },
    { id: 5, name: 'Naman', role: 'Video Editor', avatar: 'NM' },
    { id: 6, name: 'Karan', role: 'Video Editor', avatar: 'KR' },
    { id: 7, name: 'Ajay', role: 'Video Editor', avatar: 'AJ' },
    { id: 8, name: 'Sanjeevani', role: 'PR Manager', avatar: 'SJ' },
    { id: 9, name: 'Pari', role: 'HR', avatar: 'PR' }
  ];

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState('manager');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterChannel, setFilterChannel] = useState('All');
  const [showNewTaskForm, setShowNewTaskForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    assignee: '',
    channel: '',
    priority: 'Medium',
    dueDate: ''
  });

  const statusColors = {
    'Not Started': '#3B6D11',
    'In Progress': '#BA7517',
    'Completed': '#0F6E56',
    'On Hold': '#534AB7',
    'Delayed': '#A32D2D'
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_URL + '?action=getTasks');
      const data = await response.json();
      if (data.status === 'ok') {
        setTasks(data.tasks);
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
      alert('Could not load tasks. Check internet connection.');
    } finally {
      setLoading(false);
    }
  };

  const getTaskAlert = (lastUpdated, status, dueDate) => {
    if (status === 'Completed') return null;
    const now = new Date();
    const updatedTime = new Date(lastUpdated);
    const hoursSince = (now - updatedTime) / (1000 * 60 * 60);
    const dueTime = new Date(dueDate);
    const isOverdue = now > dueTime;
    if (hoursSince >= 24) {
      return { type: 'escalation', message: 'No update for ' + Math.round(hoursSince) + 'h' };
    }
    if (isOverdue) {
      return { type: 'overdue', message: 'OVERDUE' };
    }
    return null;
  };

  const filteredTasks = tasks.filter(t => {
    if (currentUser !== 'manager') {
      const user = team.find(u => u.id === currentUser);
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
        body: JSON.stringify({
          action: 'addTask',
          task: newTask
        })
      });

      setNewTask({ title: '', assignee: '', channel: '', priority: 'Medium', dueDate: '' });
      setShowNewTaskForm(false);
      
      setTimeout(() => {
        loadTasks();
        setSaving(false);
      }, 1500);
    } catch (error) {
      console.error('Error adding task:', error);
      alert('Could not save task. Try again.');
      setSaving(false);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    setTasks(tasks.map(t => 
      t.id === taskId ? { ...t, status: newStatus, lastUpdated: new Date().toISOString() } : t
    ));

    try {
      await fetch(API_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({
          action: 'updateStatus',
          taskId: taskId,
          status: newStatus
        })
      });
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleExportWhatsApp = (task) => {
    const message = 'TASK UPDATE - WTC Management\n\nTask: ' + task.title + '\nAssignee: ' + task.assignee + '\nChannel: ' + task.channel + '\nStatus: ' + task.status + '\nPriority: ' + task.priority + '\nDue: ' + new Date(task.dueDate).toLocaleDateString() + '\n\nUpdate in Dashboard: https://wtc-task-hub.vercel.app';
    navigator.clipboard.writeText(message);
    alert('Message copied to clipboard! Paste in WhatsApp.');
  };

  const getUserName = (id) => {
    if (id === 'manager') return 'Manager Dashboard - All Tasks';
    return team.find(t => t.id === id)?.name || '';
  };

  return (
    <div className="app">
      <header className="header">
        <div className="header-left">
          <div className="logo-box">W</div>
          <div>
            <h1>WTC's Management Hub</h1>
            <p className="user-label">{getUserName(currentUser)}</p>
          </div>
        </div>
        <div style={{display: 'flex', gap: '10px'}}>
          <button className="btn-secondary" onClick={loadTasks} title="Refresh data">
            🔄 Refresh
          </button>
          <button className="btn-primary" onClick={() => setShowNewTaskForm(!showNewTaskForm)}>
            + New Task
          </button>
        </div>
      </header>

      {loading && (
        <div style={{textAlign: 'center', padding: '40px', color: '#666'}}>
          <p>Loading tasks from Google Sheets...</p>
        </div>
      )}

      {saving && (
        <div style={{textAlign: 'center', padding: '15px', background: '#fff4e8', color: '#854F0B'}}>
          <p>💾 Saving to Google Sheets...</p>
        </div>
      )}

      {!loading && (
        <>
          <div className="user-switcher">
            <button
              className={currentUser === 'manager' ? 'active' : ''}
              onClick={() => setCurrentUser('manager')}
            >
              All Tasks
            </button>
            {team.map(member => (
              <button
                key={member.id}
                className={currentUser === member.id ? 'active' : ''}
                onClick={() => setCurrentUser(member.id)}
                title={member.name}
              >
                {member.avatar}
              </button>
            ))}
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
              <input
                type="text"
                placeholder="Task title"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              />
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
                <p>No tasks to display</p>
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
                        <select
                          value={task.status}
                          onChange={(e) => handleStatusChange(task.id, e.target.value)}
                          className="status-select"
                          style={{ color: statusColors[task.status] }}
                        >
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
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}

      <footer className="footer">
        <p>Tip: Tasks are saved automatically to Google Sheets. Click 🔄 Refresh to see latest updates.</p>
      </footer>
    </div>
  )
}

export default App