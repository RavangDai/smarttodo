import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  FaCheckDouble, FaListUl, FaBell, FaClock, FaTrash, FaSignOutAlt, FaPlus,
  FaEnvelope, FaLock, FaGoogle, FaGithub, FaCheck, FaMoon, FaSun, FaCalendarAlt
} from 'react-icons/fa';
import confetti from 'canvas-confetti';

import './App.css';       // <--- 1. Loads your Login Styles
import './Dashboard.css'; // <--- 2. LOADS YOUR NEW DASHBOARD STYLES
import ProgressRing from './components/ProgressRing';
import TaskAccordion from './components/TaskAccordion';
import Timeline from './components/Timeline';
import Sidebar from './components/Sidebar';

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

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <>
      {/* Paper Texture Overlay */}
      <div className="paper-overlay"></div>

      <div className="app-shell">
        <Sidebar onLogout={() => setToken(null)} />

        <div className="dashboard-container">
          {/* --- HEADER --- */}
          <header className="app-header">
            <div className="brand-logo">
              <img src="/logo.png" alt="SmartTodo" className="header-logo-img" />
            </div>

            <div className="header-controls">
              <button className="btn-icon" onClick={() => setDarkMode(!darkMode)} title="Toggle Dark Mode">
                {darkMode ? <FaSun size={18} /> : <FaMoon size={18} />}
              </button>
              <div className="user-avatar">B</div>
            </div>
          </header>

          {/* --- HERO --- */}
          <section className="hero-section">
            <div className="hero-main-layout">
              <div className="hero-text-content">
                <div className="hero-title">
                  Your Daily Tasks <br />
                  Organized <span className="highlight">Effortlessly</span>
                </div>
                <div className="hero-subtitle">
                  {subtitles[subtitleIndex]}
                </div>
              </div>

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
          </nav>

          {/* --- INPUT CARD --- */}
          <div className="input-card">
            <input
              className="main-input"
              value={newTask}
              onChange={e => {
                const val = e.target.value;
                setNewTask(val);
              }}
              onKeyDown={(e) => e.key === 'Enter' && addTask()}
              placeholder="What needs to be done today?"
            />
            <div className="input-actions">
              <div className="meta-controls">
                {/* Date Selection */}
                <div className="input-field-group">
                  <FaCalendarAlt className="field-icon" />
                  <div className="date-shortcuts">
                    <button
                      type="button"
                      className={`shortcut-btn ${newDueDate === new Date().toISOString().split('T')[0] ? 'active' : ''}`}
                      onClick={() => setNewDueDate(new Date().toISOString().split('T')[0])}
                    >
                      Today
                    </button>
                    <button
                      type="button"
                      className={`shortcut-btn ${newDueDate === new Date(Date.now() + 86400000).toISOString().split('T')[0] ? 'active' : ''}`}
                      onClick={() => setNewDueDate(new Date(Date.now() + 86400000).toISOString().split('T')[0])}
                    >
                      Tomorrow
                    </button>
                  </div>
                  <input
                    type="date"
                    className="date-input"
                    value={newDueDate}
                    onChange={e => setNewDueDate(e.target.value)}
                    title="Pick a custom date"
                  />
                </div>

                {/* Time Selection */}
                <div className="input-field-group">
                  <FaClock className="field-icon" />
                  <input
                    type="time"
                    className="time-input"
                    value={newTime}
                    onChange={e => setNewTime(e.target.value)}
                    title="Set Time"
                  />
                </div>

                {/* Priority Selection */}
                <div className="input-field-group">
                  <select
                    className="priority-select"
                    value={newPriority}
                    onChange={e => setNewPriority(e.target.value)}
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                  </select>
                </div>
              </div>

              <button onClick={addTask} className="btn-add-task">
                <FaPlus /> Add Task
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
                <TaskAccordion
                  key={task._id}
                  task={task}
                  onUpdate={(updatedTask) => setTasks(tasks.map(t => t._id === updatedTask._id ? updatedTask : t))}
                  onDelete={deleteTask}
                  headers={getHeaders().headers}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default App;