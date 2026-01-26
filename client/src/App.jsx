import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  FaCheckDouble, FaListUl, FaBell, FaClock, FaTrash, FaSignOutAlt, FaPlus,
  FaEnvelope, FaLock, FaGoogle, FaGithub, FaCheck, FaMoon, FaSun, FaCalendarAlt
} from 'react-icons/fa';
import confetti from 'canvas-confetti';

import './App.css';       // <--- 1. Loads your Login Styles
import './Dashboard.css'; // <--- 2. LOADS YOUR NEW DASHBOARD STYLES

function App() {

  const [filter, setFilter] = useState('all'); // 'all', 'active', 'completed'
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [tasks, setTasks] = useState([]);

  // New States
  const [newTask, setNewTask] = useState("");
  const [newPriority, setNewPriority] = useState("medium");
  const [newDueDate, setNewDueDate] = useState("");
  const [darkMode, setDarkMode] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);

  // Sync Token with LocalStorage
  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }, [token]);

  // Dark Mode Effect
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [darkMode]);

  const getHeaders = () => ({ headers: { 'Authorization': token } });

  // Fetch Tasks
  useEffect(() => {
    if (token) {
      axios.get('http://localhost:5000/api/tasks', getHeaders())
        .then(res => setTasks(res.data))
        .catch(err => console.error(err));
    }
  }, [token]);

  // Auth Handle
  const handleAuth = async (e) => {
    if (e) e.preventDefault();
    const endpoint = isRegistering ? '/register' : '/login';
    try {
      const res = await axios.post(`http://localhost:5000/api/users${endpoint}`, { email, password });
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
    axios.post('http://localhost:5000/api/tasks', {
      title: newTask,
      priority: newPriority,
      dueDate: newDueDate
    }, getHeaders())
      .then(res => {
        setTasks([...tasks, res.data]);
        setNewTask("");
        setNewPriority("medium");
        setNewDueDate("");
      });
  };

  const deleteTask = (id) => {
    axios.delete(`http://localhost:5000/api/tasks/${id}`, getHeaders())
      .then(() => setTasks(tasks.filter(t => t._id !== id)));
  };

  const toggleTask = (id) => {
    axios.put(`http://localhost:5000/api/tasks/${id}`, {}, getHeaders())
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
      });
  };

  // --- 3. LOGIN VIEW (Uses App.css 'split-screen') ---
  if (!token) {
    return (
      <div className="split-screen">
        <div className="left-panel">
          <div className="floating-card card-1">
            <FaCheckDouble color="#10b981" />
            <span className="card-text-done">Design System</span>
          </div>
          <div className="floating-card card-2">
            <FaClock color="#f59e0b" />
            <span>Client Meeting 2pm</span>
          </div>
          <div className="floating-card card-3">
            <FaBell color="#ef4444" />
            <span>Fix Server Bug</span>
          </div>
          <div className="orbit-container">
            <h1 className="orbit-center-text">Smart<br />Todo.</h1>
            <div className="orbit-ring ring-1"></div>
            <div className="orbit-ring ring-2"></div>
            <div className="orbit-wrapper">
              <div className="orbiting-icon" style={{ transform: 'rotate(0deg) translate(140px) rotate(0deg)' }}>
                <FaCheckDouble color="#2563eb" />
              </div>
              <div className="orbiting-icon" style={{ transform: 'rotate(90deg) translate(140px) rotate(-90deg)' }}>
                <FaListUl color="#2563eb" />
              </div>
              <div className="orbiting-icon" style={{ transform: 'rotate(180deg) translate(140px) rotate(-180deg)' }}>
                <FaBell color="#2563eb" />
              </div>
              <div className="orbiting-icon" style={{ transform: 'rotate(270deg) translate(140px) rotate(-270deg)' }}>
                <FaClock color="#2563eb" />
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
  // --- Subtitle Rotation ---
  const [subtitleIndex, setSubtitleIndex] = useState(0);
  const subtitles = [
    "AI suggests when to tackle each task",
    "Understands 'tomorrow at 3pm' like a human",
    "Focus mode eliminates decision fatigue"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setSubtitleIndex(iframe => (iframe + 1) % subtitles.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // --- CALCULATIONS ---
  const completedCount = tasks.filter(t => t.isCompleted).length;
  const totalCount = tasks.length;
  const progress = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

  const filteredTasks = tasks.filter(task => {
    if (filter === 'active') return !task.isCompleted;
    if (filter === 'completed') return task.isCompleted;
    return true;
  });

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <>
      {/* Paper Texture Overlay */}
      <div className="paper-overlay"></div>

      <div className="dashboard-container">

        {/* --- HEADER --- */}
        <header className="app-header">
          <div className="brand-logo">Smart Todo.</div>

          <div className="header-controls">
            <button className="btn-icon" onClick={() => setDarkMode(!darkMode)} title="Toggle Dark Mode">
              {darkMode ? <FaSun size={18} /> : <FaMoon size={18} />}
            </button>
            <div className="user-avatar">B</div>
            <button onClick={() => setToken(null)} className="btn-icon" title="Log Out">
              <FaSignOutAlt size={18} />
            </button>
          </div>
        </header>

        {/* --- HERO --- */}
        <section className="hero-section">
          <div className="hero-title">
            Your Daily Tasks <br />
            Organized <span className="highlight">Effortlessly</span>
          </div>
          <div className="hero-subtitle">
            {subtitles[subtitleIndex]}
          </div>
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
        </nav>

        {/* --- INPUT CARD --- */}
        <div className="input-card">
          <input
            className="main-input"
            value={newTask}
            onChange={e => setNewTask(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addTask()}
            placeholder="What needs to be done today?"
          />
          <div className="input-actions">
            {/* Priority Select (Minimal) */}
            <select
              className="meta-select"
              value={newPriority}
              onChange={e => setNewPriority(e.target.value)}
            >
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="low">Low</option>
            </select>

            {/* Date Trigger (Minimal) */}
            <button
              className="date-trigger"
              title="Set Date"
              onClick={() => document.getElementById('hidden-date').showPicker()}
            >
              📅
            </button>
            <input
              id="hidden-date"
              type="date"
              value={newDueDate}
              onChange={e => setNewDueDate(e.target.value)}
              style={{ width: 0, height: 0, opacity: 0, overflow: 'hidden', position: 'absolute' }}
            />

            <button onClick={addTask} className="btn-primary">
              + New Task
            </button>
          </div>
        </div>

        {/* --- TASK LIST STACK --- */}
        <div className="task-list-stack">
          {filteredTasks.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">✓</div>
              <p>Your canvas is clear. What will you accomplish today?</p>
            </div>
          ) : (
            filteredTasks.map(task => (
              <div key={task._id} className={`task-item-row ${task.isCompleted ? 'completed' : ''}`}>
                <button
                  className="check-circle"
                  onClick={() => toggleTask(task._id)}
                >
                  {task.isCompleted && <FaCheck size={10} />}
                </button>

                <div className="task-content">
                  <span className="task-text">{task.title}</span>
                  <div className="task-meta">
                    {task.priority !== 'medium' && (
                      <span className={`meta-priority priority-${task.priority}`}>
                        {task.priority} Priority
                      </span>
                    )}
                    {task.dueDate && (
                      <span>• Due {new Date(task.dueDate).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>

                <button className="delete-action" onClick={() => deleteTask(task._id)}>
                  <FaTrash size={14} />
                </button>
              </div>
            ))
          )}
        </div>

      </div>
    </>
  );
}

export default App;