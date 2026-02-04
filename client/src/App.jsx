import { useState, useEffect } from 'react';
import axios from 'axios';
import { FaArrowRight } from 'react-icons/fa';
import confetti from 'canvas-confetti';

import './App.css';
import './Dashboard.css'; // Might need to cull this later
import TaskAccordion from './components/TaskAccordion';
import SmartTaskInput from './components/SmartTaskInput';
import SmartInsightsPanel from './components/SmartInsightsPanel';
import Settings from './components/Settings';
import AITypewriter from './components/AITypewriter';
import InteractiveAvatar from './components/InteractiveAvatar';

// New Components
import Sidebar from './components/Sidebar';
import FocusBar from './components/FocusBar';
import ContextPanel from './components/ContextPanel';

function App() {
  // ─── STATE ───
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('active');
  const [activeView, setActiveView] = useState('tasks');
  const [showSettings, setShowSettings] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [dragState, setDragState] = useState({ dragging: null, over: null });

  // Auth States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [authError, setAuthError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Avatar interaction states
  const [isFocusedEmail, setIsFocusedEmail] = useState(false);
  const [isFocusedPassword, setIsFocusedPassword] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [authResult, setAuthResult] = useState('idle');

  // ─── EFFECTS ───
  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
      fetchTasks();
    } else {
      localStorage.removeItem('token');
    }
  }, [token]);

  // Apply dark mode on mount (force enabled for HUD look for now or respect persist)
  useEffect(() => {
    document.body.classList.add('dark-mode');
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      const isTyping = ['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName);
      const key = e.key.toLowerCase();

      if ((e.metaKey || e.ctrlKey) && e.shiftKey && (key === 'n' || e.code === 'KeyN')) {
        e.preventDefault();
        e.stopPropagation();
        document.querySelector('.task-input')?.focus();
        setActiveView('tasks');
        return;
      }

      if (e.key === 'Escape') {
        setShowSettings(false);
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, []);

  // ─── API HELPERS ───
  const getHeaders = () => ({ headers: { 'x-auth-token': token } });

  const fetchTasks = () => {
    axios.get('/api/tasks', getHeaders())
      .then(res => setTasks(res.data))
      .catch(err => console.error(err));
  };

  // ─── AUTH ───
  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthResult('idle');
    const endpoint = isRegistering ? '/register' : '/login';
    try {
      const res = await axios.post(`/api/users${endpoint}`, { email, password });
      if (isRegistering) {
        setIsRegistering(false);
        setAuthError('Account created. Please sign in.');
        setAuthResult('success');
      } else {
        setAuthResult('success');
        setTimeout(() => {
          setToken(res.data.token);
        }, 1200);
      }
    } catch (err) {
      setAuthError(err.response?.data?.msg || 'Authentication failed');
      setAuthResult('error');
      setTimeout(() => setAuthResult('idle'), 2000);
    }
  };

  // ─── TASK ACTIONS ───
  const handleAddTask = (taskData) => {
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
      .then(res => setTasks([res.data, ...tasks]))
      .catch(err => console.error('Error adding task:', err));
  };

  const deleteTask = (id) => {
    axios.delete(`/api/tasks/${id}`, getHeaders())
      .then(() => setTasks(tasks.filter(t => t._id !== id)))
      .catch(err => console.error(err));
  };

  const updateTask = (updatedTask) => {
    setTasks(tasks.map(t => t._id === updatedTask._id ? updatedTask : t));
    if (updatedTask.isCompleted) {
      confetti({ particleCount: 40, spread: 40, origin: { y: 0.7 } });
    }
  };

  // ─── HELPERS ───
  const getLocalDateString = (date) => {
    const d = new Date(date);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().split('T')[0];
  };

  // ─── COMPUTED ───
  const pendingCount = tasks.filter(t => !t.isCompleted).length;
  const completedCount = tasks.filter(t => t.isCompleted).length;
  const totalCount = tasks.length;

  const filteredTasks = tasks.filter(task => {
    if (filter === 'active' && task.isCompleted) return false;
    if (filter === 'completed' && !task.isCompleted) return false;
    if (searchQuery && !task.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  // ════════════════════════════════════════════════════════════════
  // LOGIN VIEW
  // ════════════════════════════════════════════════════════════════
  if (!token) {
    return (
      <div className="auth-page">
        <div className="auth-left-panel">
          <header className="auth-header">
            <h1 className="wordmark">KaryaAI</h1>
            <p className="tagline">Intelligent simplicity.<br />AI that gets out of your way.</p>
          </header>

          <div className="sanskrit-overlay">
            <span className="sanskrit-symbol chakra"></span>
          </div>

          <InteractiveAvatar
            isTyping={isTyping}
            isFocusedEmail={isFocusedEmail}
            isFocusedPassword={isFocusedPassword}
            isPasswordVisible={showPassword}
            authResult={authResult}
            email={email}
          />
          <AITypewriter />
        </div>
        <div className="auth-right-panel">
          <div className="auth-container">
            <h2 className="auth-form-title slide-up-stagger" style={{ animationDelay: '0.1s' }}>
              {isRegistering ? 'Create your account' : 'Welcome back'}
            </h2>
            <p className="auth-form-subtitle slide-up-stagger" style={{ animationDelay: '0.2s' }}>
              {isRegistering ? 'Start your productivity journey with AI' : 'Sign in to continue to your tasks'}
            </p>
            {authError && <div className="auth-error slide-up-stagger" style={{ animationDelay: '0.25s' }}>{authError}</div>}
            <form onSubmit={handleAuth} className="auth-form slide-up-stagger" style={{ animationDelay: '0.3s' }}>
              <input
                type="email"
                className="input-field"
                placeholder="Email"
                value={email}
                onChange={e => {
                  setEmail(e.target.value);
                  setIsTyping(true);
                  clearTimeout(window.typingTimeout);
                  window.typingTimeout = setTimeout(() => setIsTyping(false), 500);
                }}
                onFocus={() => { setIsFocusedEmail(true); setAuthResult('idle'); }}
                onBlur={() => setIsFocusedEmail(false)}
                required
              />
              <div className="password-input-group" style={{ position: 'relative' }}>
                <input
                  type={showPassword ? "text" : "password"}
                  className="input-field"
                  placeholder="Password"
                  value={password}
                  onChange={e => {
                    setPassword(e.target.value);
                    setIsTyping(true);
                    clearTimeout(window.typingTimeout);
                    window.typingTimeout = setTimeout(() => setIsTyping(false), 500);
                  }}
                  onFocus={() => { setIsFocusedPassword(true); setAuthResult('idle'); }}
                  onBlur={() => setIsFocusedPassword(false)}
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '14px' }}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              <button type="submit" className="btn-primary">
                {isRegistering ? 'CREATE ACCOUNT' : 'SIGN IN'} <FaArrowRight size={12} />
              </button>
            </form>
            <div className="auth-switch slide-up-stagger" style={{ animationDelay: '0.4s' }}>
              <span className="text-secondary">
                {isRegistering ? 'Already have an account?' : 'New to KaryaAI?'}
              </span>
              <button className="btn-ghost" onClick={() => { setIsRegistering(!isRegistering); setAuthError(''); }}>
                {isRegistering ? 'Sign In' : 'Create Account'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════
  // DASHBOARD VIEW (Pilot's HUD)
  // ════════════════════════════════════════════════════════════════
  return (
    <div className="app-container">
      {/* ── SIDEBAR ── */}
      <Sidebar
        activeView={activeView}
        onNavigate={setActiveView}
        onOpenSettings={() => setShowSettings(true)}
        onLogout={() => setToken(null)}
      />

      {/* ── MAIN CONTENT ── */}
      <main className="main-content">

        {/* ── FOCUS BAR ── */}
        <FocusBar
          taskCount={pendingCount}
        />

        {/* ── CONTENT SPLIT ── */}
        <div className="content-split">

          {/* ── LEFT: TASK LIST ── */}
          <section className="task-list-container">

            {/* ── INPUT AREA (Sticky Top) ── */}
            <div style={{ padding: '1.5rem', paddingBottom: '0.5rem', background: 'var(--bg-primary)', position: 'sticky', top: 0, zIndex: 10 }}>
              <SmartTaskInput
                onAddTask={handleAddTask}
                getLocalDateString={getLocalDateString}
                tasks={tasks}
              />
            </div>

            {/* ── FILTER TABS ── */}
            <div className="filter-bar" style={{ padding: '0 1.5rem', marginBottom: '1rem' }}>
              <div className="filter-tabs">
                {['active', 'completed', 'all'].map(f => (
                  <button
                    key={f}
                    className={`filter-tab ${filter === f ? 'active' : ''}`}
                    onClick={() => setFilter(f)}
                  >
                    {f.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* ── TASKS ── */}
            <div style={{ padding: '0 1.5rem 2rem 1.5rem' }}>
              {filteredTasks.length === 0 ? (
                <div className="empty-state">
                  <p className="empty-text">No tasks found.</p>
                </div>
              ) : (
                filteredTasks.map((task) => (
                  <TaskAccordion
                    key={task._id}
                    task={task}
                    viewMode="focus"
                    onUpdate={updateTask}
                    onDelete={deleteTask}
                    headers={getHeaders().headers}
                    isDragging={dragState.dragging === task._id}
                    isDragOver={dragState.over === task._id}
                    onDragStart={(e) => {
                      e.dataTransfer.effectAllowed = 'move';
                      setDragState(s => ({ ...s, dragging: task._id }));
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      if (dragState.over !== task._id) {
                        setDragState(s => ({ ...s, over: task._id }));
                      }
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      setDragState({ dragging: null, over: null });
                      // Add reorder logic if backend supports it
                    }}
                  />
                ))
              )}
            </div>
          </section>

          {/* ── RIGHT: CONTEXT PANEL ── */}
          <section className="context-panel-container">
            {activeView === 'insights' ? (
              <SmartInsightsPanel
                tasks={tasks}
                completedCount={completedCount}
                totalCount={totalCount}
              />
            ) : (
              /* Default to Timeline for 'tasks' or 'projects' for now */
              <ContextPanel tasks={tasks} />
            )}
          </section>

        </div>
      </main>

      {/* ── SETTINGS MODAL ── */}
      {showSettings && (
        <Settings
          onClose={() => setShowSettings(false)}
          onLogout={() => setToken(null)}
        />
      )}
    </div>
  );
}

export default App;