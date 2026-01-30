import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  FaCheckDouble, FaListUl, FaBell, FaClock, FaTrash, FaSignOutAlt, FaPlus,
  FaEnvelope, FaLock, FaGoogle, FaGithub, FaCheck, FaMoon, FaSun, FaCalendarAlt,
  FaList, FaTh
} from 'react-icons/fa';
import confetti from 'canvas-confetti';

import './App.css';       // <--- 1. Loads your Login Styles
import './Dashboard.css'; // <--- 2. LOADS YOUR NEW DASHBOARD STYLES
import ProgressRing from './components/ProgressRing';
import TaskAccordion from './components/TaskAccordion';
import Timeline from './components/Timeline';
import Sidebar from './components/Sidebar';
import DynamicGreeting from './components/DynamicGreeting';
import SmartTaskInput from './components/SmartTaskInput';

function App() {

  const [filter, setFilter] = useState('all'); // 'all', 'active', 'completed'
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [tasks, setTasks] = useState([]);

  // New States
  const [newTask, setNewTask] = useState("");
  const [newPriority, setNewPriority] = useState("medium");
  const [newDueDate, setNewDueDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [activeView, setActiveView] = useState('Tasks');
  const [viewMode, setViewMode] = useState('focus'); // 'focus' or 'compact'

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);

  // Subtitle Rotation State
  const [subtitleIndex, setSubtitleIndex] = useState(0);
  const subtitles = [
    "AI suggests when to tackle each task",
    "Understands 'tomorrow at 3pm' like a human",
    "Focus mode eliminates decision fatigue"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setSubtitleIndex(i => (i + 1) % subtitles.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Sync Token with LocalStorage
  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }, [token]);

  // Theme Management (Isolation)
  useEffect(() => {
    if (token) {
      document.body.classList.add('theme-brutalist');
      // Handle dark mode check
      if (darkMode) document.body.classList.add('dark-mode');
      else document.body.classList.remove('dark-mode');
    } else {
      document.body.classList.remove('theme-brutalist');
      document.body.classList.remove('dark-mode');
      // Reset styles for login page
      document.body.style.backgroundColor = '';
      document.body.style.color = '';
    }
  }, [token, darkMode]);

  const getHeaders = () => ({ headers: { 'x-auth-token': token } });

  // Fetch Tasks
  useEffect(() => {
    if (token) {
      axios.get('/api/tasks', getHeaders())
        .then(res => setTasks(res.data))
        .catch(err => console.error(err));
    }
  }, [token]);

  // Auth Handle
  const handleAuth = async (e) => {
    if (e) e.preventDefault();
    const endpoint = isRegistering ? '/register' : '/login';
    try {
      const res = await axios.post(`/api/users${endpoint}`, { email, password });
      if (isRegistering) {
        alert("Account created! Now login.");
        setIsRegistering(false);
      } else {
        setToken(res.data.token);
      }
    } catch (err) {
      alert(err.response?.data?.msg || "Error logging in");
    }
  };

  // Task Actions
  const addTask = () => {
    if (!newTask) return;

    let taskDate = newDueDate;
    if (newDueDate && newTime) {
      taskDate = `${newDueDate}T${newTime}`;
    }

    axios.post('/api/tasks', {
      title: newTask,
      priority: newPriority,
      dueDate: taskDate
    }, getHeaders())
      .then(res => {
        setTasks([...tasks, res.data]);
        setNewTask("");
        setNewPriority("medium");
        setNewDueDate("");
        setNewTime("");
      })
      .catch(err => {
        console.error("Error adding task:", err);
        alert("Failed to add task. Please check if you are logged in.");
      });
  };

  // Smart Task Add Handler (for SmartTaskInput component)
  const handleSmartAddTask = (taskData) => {
    if (!taskData.title) return;

    let taskDate = null;
    if (taskData.dueDate && taskData.dueTime) {
      taskDate = `${taskData.dueDate}T${taskData.dueTime}`;
    } else if (taskData.dueDate) {
      taskDate = taskData.dueDate;
    }

    axios.post('/api/tasks', {
      title: taskData.title,
      priority: taskData.priority || 'medium',
      dueDate: taskDate
    }, getHeaders())
      .then(res => {
        setTasks([...tasks, res.data]);
      })
      .catch(err => {
        console.error("Error adding task:", err);
        alert("Failed to add task. Please check if you are logged in.");
      });
  };

  const deleteTask = (id) => {
    axios.delete(`/api/tasks/${id}`, getHeaders())
      .then(() => setTasks(tasks.filter(t => t._id !== id)))
      .catch(err => console.error("Error deleting task:", err));
  };

  const toggleTask = (id) => {
    axios.put(`/api/tasks/${id}`, {}, getHeaders())
      .then(res => {
        setTasks(tasks.map(t => t._id === id ? { ...t, isCompleted: res.data.isCompleted } : t));
        // Trigger Confetti if completed!
        if (res.data.isCompleted) {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          });
        }
      })
      .catch(err => console.error("Error toggling task:", err));
  };

  // --- 3. LOGIN VIEW (Uses App.css 'split-screen') ---
  if (!token) {
    return (
      <div className="split-screen">
        <div className="left-panel">
          <div className="floating-card card-1">
            <FaCheckDouble color="var(--success)" />
            <span className="card-text-done">Design System</span>
          </div>
          <div className="floating-card card-2">
            <FaClock color="var(--warning)" />
            <span>Client Meeting 2pm</span>
          </div>
          <div className="floating-card card-3">
            <FaBell color="var(--danger)" />
            <span>Fix Server Bug</span>
          </div>
          <div className="orbit-container">
            <div className="logo-box">
              <h1 className="logo-box-text">Smart<br />Todo.</h1>
            </div>
            <p className="orbit-subtitle">{subtitles[subtitleIndex]}</p>

            <div className="orbit-ring ring-1"></div>
            <div className="orbit-ring ring-2"></div>

            <div className="orbit-wrapper">
              <div className="orbit-item item-1">
                <div className="orbiting-icon">
                  <FaCheckDouble />
                </div>
              </div>
              <div className="orbit-item item-2">
                <div className="orbiting-icon">
                  <FaListUl />
                </div>
              </div>
              <div className="orbit-item item-3">
                <div className="orbiting-icon">
                  <FaBell />
                </div>
              </div>
              <div className="orbit-item item-4">
                <div className="orbiting-icon">
                  <FaClock />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="right-panel">
          <div className="auth-container">
            <div className="auth-header">
              <h2>{isRegistering ? "Create Account" : "Welcome Back"}</h2>
              <p className="sub-text">Enter your details to access your workspace.</p>
            </div>

            <div className="social-login">
              <button className="social-btn" type="button" onClick={() => alert("Google Login coming soon!")}>
                <FaGoogle color="#DB4437" /> Google
              </button>
              <button className="social-btn" type="button" onClick={() => alert("GitHub Login coming soon!")}>
                <FaGithub /> GitHub
              </button>
            </div>

            <div className="divider"><span>OR</span></div>

            <form onSubmit={handleAuth}>
              <div className="form-group">
                <label>Email Address</label>
                <div className="input-group">
                  <FaEnvelope className="input-icon" />
                  <input
                    type="email"
                    placeholder="name@company.com"
                    onChange={e => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Password</label>
                <div className="input-group">
                  <FaLock className="input-icon" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    onChange={e => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
              <button className="btn-primary" type="submit">
                {isRegistering ? "Sign Up" : "Sign In"}
              </button>
            </form>

            <div className="switch-auth">
              {isRegistering ? "Already have an account?" : "Don't have an account?"}
              <span onClick={() => setIsRegistering(!isRegistering)}>
                {isRegistering ? " Login" : " Sign Up"}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }
  // --- CALCULATIONS ---
  const completedCount = tasks.filter(t => t.isCompleted).length;
  const totalCount = tasks.length;
  const progress = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

  const filteredTasks = tasks.filter(task => {
    if (filter === 'active') return !task.isCompleted;
    if (filter === 'completed') return task.isCompleted;
    return true;
  });

  // Helper for local date in YYYY-MM-DD
  const getLocalDateString = (date) => {
    const d = new Date(date);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().split('T')[0];
  };

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <>
      {/* Paper Texture Overlay */}
      <div className="paper-overlay"></div>

      <div className="app-shell">
        <Sidebar
          onLogout={() => setToken(null)}
          currentView={activeView}
          onNavigate={setActiveView}
        />

        <div className="dashboard-container">
          {/* --- HEADER --- */}
          <header className="app-header">
            <div className="brand-logo">
              <img src="/logo.png" alt="SmartTodo" className="header-logo-img" />
            </div>

            <div className="header-controls">
              <div className="view-title-pill">{activeView}</div>
              <button className="btn-icon" onClick={() => setDarkMode(!darkMode)} title="Toggle Dark Mode">
                {darkMode ? <FaSun size={18} /> : <FaMoon size={18} />}
              </button>
              <div className="user-avatar">B</div>
            </div>
          </header>

          {activeView === 'Tasks' && (
            <>
              {/* --- HERO --- */}
              <section className="hero-section">
                <div className="hero-main-layout">
                  {/* Dynamic Greeting */}
                  <DynamicGreeting
                    userName="User"
                    highPriorityCount={tasks.filter(t => t.priority === 'high' && !t.isCompleted).length}
                    completionRate={progress}
                    totalTasks={totalCount}
                  />

                  {/* Progress Ring */}
                  <ProgressRing completed={completedCount} total={totalCount} />
                </div>

                {/* Timeline Visual */}
                <Timeline tasks={tasks} />
              </section>

              {/* --- TABS --- */}
              <nav className="tabs-nav">
                <button
                  className={`tab-btn ${filter === 'all' ? 'active' : ''}`}
                  onClick={() => setFilter('all')}
                >
                  All Tasks
                </button>
                <button
                  className={`tab-btn ${filter === 'active' ? 'active' : ''}`}
                  onClick={() => setFilter('active')}
                >
                  Active
                </button>
                <button
                  className={`tab-btn ${filter === 'completed' ? 'active' : ''}`}
                  onClick={() => setFilter('completed')}
                >
                  Completed
                </button>

                {/* View Mode Toggle */}
                <div className="view-mode-toggle">
                  <button
                    className={`view-mode-btn ${viewMode === 'focus' ? 'active' : ''}`}
                    onClick={() => setViewMode('focus')}
                    title="Focus View - Detailed cards"
                  >
                    <FaTh size={12} />
                  </button>
                  <button
                    className={`view-mode-btn ${viewMode === 'compact' ? 'active' : ''}`}
                    onClick={() => setViewMode('compact')}
                    title="Compact View - Dense list"
                  >
                    <FaList size={12} />
                  </button>
                </div>
              </nav>

              {/* --- SMART INPUT --- */}
              <SmartTaskInput
                onAddTask={handleSmartAddTask}
                getLocalDateString={getLocalDateString}
              />

              {/* --- TASK LIST STACK --- */}
              <div className={`task-list-stack ${viewMode}`}>
                {filteredTasks.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">✓</div>
                    <p>Your canvas is clear. What will you accomplish today?</p>
                  </div>
                ) : (
                  filteredTasks.map(task => (
                    <TaskAccordion
                      key={task._id}
                      task={task}
                      viewMode={viewMode}
                      onUpdate={(updatedTask) => setTasks(tasks.map(t => t._id === updatedTask._id ? updatedTask : t))}
                      onDelete={deleteTask}
                      headers={getHeaders().headers}
                    />
                  ))
                )}
              </div>
            </>
          )}

          {activeView === 'Stats' && (
            <div className="view-content fade-in">
              <div className="stats-grid">
                <div className="stat-card">
                  <h3>Completion Rate</h3>
                  <div className="stat-value">{progress}%</div>
                  <p>Overall task efficiency</p>
                </div>
                <div className="stat-card">
                  <h3>Total Completed</h3>
                  <div className="stat-value">{completedCount}</div>
                  <p>Tasks finished to date</p>
                </div>
                <div className="stat-card">
                  <h3>Focus Hours</h3>
                  <div className="stat-value">{(completedCount * 0.5).toFixed(1)}</div>
                  <p>Estimated deep work time</p>
                </div>
              </div>
              <div className="chart-placeholder">
                <div className="chart-bars">
                  {[40, 70, 45, 90, 65, 80, 50].map((h, i) => (
                    <div key={i} className="chart-bar" style={{ height: `${h}%` }}>
                      <span className="bar-label">Day {i + 1}</span>
                    </div>
                  ))}
                </div>
                <p className="chart-caption">Weekly Productivity Trend</p>
              </div>
            </div>
          )}

          {activeView === 'Goals' && (
            <div className="view-content fade-in">
              <div className="goals-header">
                <h2>Active Objectives</h2>
                <button className="btn-pill" onClick={() => alert("Goal creation coming soon!")}>+ New Goal</button>
              </div>
              <div className="goals-list">
                {[
                  { title: "Master React Hooks", progress: 75, color: "var(--primary)" },
                  { title: "Improve Daily Focus", progress: 40, color: "var(--warning)" },
                  { title: "Health & Fitness", progress: 20, color: "var(--success)" }
                ].map((goal, i) => (
                  <div key={i} className="goal-item glass-card">
                    <div className="goal-info">
                      <span className="goal-title">{goal.title}</span>
                      <span className="goal-percent">{goal.progress}%</span>
                    </div>
                    <div className="goal-progress-track">
                      <div className="goal-progress-bar" style={{ width: `${goal.progress}%`, background: goal.color }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeView === 'Settings' && (
            <div className="view-content fade-in">
              <div className="settings-section glass-card">
                <h3>App Preferences</h3>
                <div className="setting-row">
                  <span>Appearance</span>
                  <button className="btn-toggle" onClick={() => setDarkMode(!darkMode)}>
                    {darkMode ? "Switch to Light" : "Switch to Dark"}
                  </button>
                </div>
                <div className="setting-row">
                  <span>Notifications</span>
                  <span className="status-label success">Enabled</span>
                </div>
              </div>

              <div className="settings-section glass-card">
                <h3>Account</h3>
                <div className="profile-preview">
                  <div className="user-avatar-large">B</div>
                  <div className="profile-info">
                    <strong>Bibek User</strong>
                    <span>bibek@example.com</span>
                  </div>
                </div>
                <button className="btn-outline-danger" style={{ marginTop: '20px' }} onClick={() => setToken(null)}>Logout from device</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default App;