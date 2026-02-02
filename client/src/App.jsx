import { useState, useEffect } from 'react';
import axios from 'axios';
import { FaArrowRight } from 'react-icons/fa';
import confetti from 'canvas-confetti';

import './App.css';
import './Dashboard.css';
import TaskAccordion from './components/TaskAccordion';
import SmartTaskInput from './components/SmartTaskInput';
import SmartInsightsPanel from './components/SmartInsightsPanel';
import Timeline from './components/Timeline';
import Settings from './components/Settings';
import AITypewriter from './components/AITypewriter';
import InteractiveAvatar from './components/InteractiveAvatar';

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

  // Avatar interaction states
  const [isFocusedEmail, setIsFocusedEmail] = useState(false);
  const [isFocusedPassword, setIsFocusedPassword] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [authResult, setAuthResult] = useState('idle'); // 'idle' | 'success' | 'error'

  // ─── EFFECTS ───
  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
      fetchTasks();
    } else {
      localStorage.removeItem('token');
    }
  }, [token]);

  // Apply dark mode on mount
  useEffect(() => {
    const saved = localStorage.getItem('karyaSettings');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.theme === 'dark') {
        document.body.classList.add('dark-mode');
      }
    }
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger if typing in input/textarea
      const isTyping = ['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName);
      const key = e.key.toLowerCase();

      // Ctrl/Cmd + Shift + N = New Task (avoids new window)
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && (key === 'n' || e.code === 'KeyN')) {
        e.preventDefault();
        e.stopPropagation();
        document.querySelector('.task-input')?.focus();
        setActiveView('tasks');
        return;
      }

      // Escape = Close modals
      if (e.key === 'Escape') {
        setShowSettings(false);
        return;
      }

      // / = Focus search (only if not typing)
      if (key === '/' && !isTyping) {
        e.preventDefault();
        document.getElementById('search-input')?.focus();
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
        // Delay token set to show celebration
        setTimeout(() => {
          setToken(res.data.token);
        }, 1200);
      }
    } catch (err) {
      setAuthError(err.response?.data?.msg || 'Authentication failed');
      setAuthResult('error');
      // Reset error state after animation
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

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning.';
    if (hour < 18) return 'Good afternoon.';
    return 'Good evening.';
  };

  // ─── COMPUTED ───
  const pendingCount = tasks.filter(t => !t.isCompleted).length;
  const completedCount = tasks.filter(t => t.isCompleted).length;
  const totalCount = tasks.length;

  const filteredTasks = tasks.filter(task => {
    // Filter by completion status
    if (filter === 'active' && task.isCompleted) return false;
    if (filter === 'completed' && !task.isCompleted) return false;
    // Filter by search query
    if (searchQuery && !task.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  // AI Suggestion (mock for now)
  const getAISuggestion = () => {
    const highPriority = tasks.filter(t => t.priority === 'high' && !t.isCompleted);
    if (highPriority.length > 0) {
      return `Start with "${highPriority[0].title}" — it's marked urgent.`;
    }
    if (pendingCount > 0) {
      return `You have ${pendingCount} task${pendingCount > 1 ? 's' : ''} pending.`;
    }
    return 'All clear. AI will suggest tasks as they arrive.';
  };

  // ════════════════════════════════════════════════════════════════
  // LOGIN VIEW (Split-Screen)
  // ════════════════════════════════════════════════════════════════
  if (!token) {
    return (
      <div className="auth-page">
        {/* Left Panel - Branding & Avatar */}
        <div className="auth-left-panel">
          <header className="auth-header">
            <h1 className="wordmark">KaryaAI</h1>
            <p className="tagline">Intelligent simplicity.<br />AI that gets out of your way.</p>
          </header>

          {/* Interactive Avatar */}
          <InteractiveAvatar
            isTyping={isTyping}
            isFocusedEmail={isFocusedEmail}
            isFocusedPassword={isFocusedPassword}
            authResult={authResult}
            email={email}
          />

          {/* AI Callout with Typewriter Effect */}
          <AITypewriter />
        </div>

        {/* Right Panel - Form */}
        <div className="auth-right-panel">
          <div className="auth-container">
            <h2 className="auth-form-title">
              {isRegistering ? 'Create your account' : 'Welcome back'}
            </h2>
            <p className="auth-form-subtitle">
              {isRegistering
                ? 'Start your productivity journey with AI'
                : 'Sign in to continue to your tasks'}
            </p>

            {authError && (
              <div className="auth-error">{authError}</div>
            )}

            <form onSubmit={handleAuth} className="auth-form">
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
                onFocus={() => {
                  setIsFocusedEmail(true);
                  setAuthResult('idle');
                }}
                onBlur={() => setIsFocusedEmail(false)}
                required
              />
              <input
                type="password"
                className="input-field"
                placeholder="Password"
                value={password}
                onChange={e => {
                  setPassword(e.target.value);
                  setIsTyping(true);
                  clearTimeout(window.typingTimeout);
                  window.typingTimeout = setTimeout(() => setIsTyping(false), 500);
                }}
                onFocus={() => {
                  setIsFocusedPassword(true);
                  setAuthResult('idle');
                }}
                onBlur={() => setIsFocusedPassword(false)}
                required
              />
              <button type="submit" className="btn-primary">
                {isRegistering ? 'CREATE ACCOUNT' : 'SIGN IN'} <FaArrowRight size={12} />
              </button>
            </form>

            <div className="auth-switch">
              <span className="text-secondary">
                {isRegistering ? 'Already have an account?' : 'New to KaryaAI?'}
              </span>
              <button
                className="btn-ghost"
                onClick={() => { setIsRegistering(!isRegistering); setAuthError(''); }}
              >
                {isRegistering ? 'Sign In' : 'Create Account'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }


  // ════════════════════════════════════════════════════════════════
  // DASHBOARD VIEW (Brutalist)
  // ════════════════════════════════════════════════════════════════
  return (
    <div className="app-layout">
      {/* ── TOP BAR ── */}
      <header className="top-bar">
        <div className="top-bar-left">
          <span className="logo">KaryaAI</span>
          <input
            type="text"
            className="search-input"
            placeholder="Search tasks... (/)"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            id="search-input"
          />
        </div>
        <nav className="top-bar-nav">
          <button
            className={`nav-item ${activeView === 'tasks' ? 'active' : ''}`}
            onClick={() => setActiveView('tasks')}
          >
            Tasks
          </button>
          <button
            className={`nav-item ${activeView === 'insights' ? 'active' : ''}`}
            onClick={() => setActiveView('insights')}
          >
            Insights
          </button>
          <button className="nav-item" onClick={() => setShowSettings(true)}>
            Settings
          </button>
          <button className="nav-item logout" onClick={() => setToken(null)}>
            Logout
          </button>
        </nav>
      </header>

      {/* ── SETTINGS MODAL ── */}
      {showSettings && (
        <Settings
          onClose={() => setShowSettings(false)}
          onLogout={() => setToken(null)}
        />
      )}

      {/* ── MAIN ── */}
      <main className="main">
        {activeView === 'tasks' ? (
          <>
            {/* ── HERO GREETING ── */}
            <section className="hero">
              <h1 className="hero-greeting">{getGreeting()}</h1>
              <div className="ai-insight slide-in">
                <span className="ai-label">AI:</span>
                <span className="ai-message">{getAISuggestion()}</span>
              </div>
            </section>

            {/* ── TIMELINE ── */}
            <Timeline tasks={tasks} />

            {/* ── TASK INPUT ── */}
            <SmartTaskInput
              onAddTask={handleAddTask}
              getLocalDateString={getLocalDateString}
              tasks={tasks}
            />

            {/* ── FILTER BAR ── */}
            <div className="filter-bar">
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
              <span className="task-count mono">
                {filteredTasks.length} {filter === 'all' ? 'total' : filter}
              </span>
            </div>

            {/* ── TASK LIST ── */}
            <section className="task-list">
              {filteredTasks.length === 0 ? (
                <div className="empty-state">
                  <p className="empty-text">
                    {filter === 'active'
                      ? 'All clear. AI will suggest tasks as they arrive.'
                      : filter === 'completed'
                        ? 'No completed tasks yet.'
                        : 'No tasks. Add one above.'}
                  </p>
                </div>
              ) : (
                filteredTasks.map((task, index) => (
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
                      const fromId = dragState.dragging;
                      const toId = task._id;
                      if (fromId && fromId !== toId) {
                        const fromIndex = tasks.findIndex(t => t._id === fromId);
                        const toIndex = tasks.findIndex(t => t._id === toId);
                        const reordered = [...tasks];
                        const [moved] = reordered.splice(fromIndex, 1);
                        reordered.splice(toIndex, 0, moved);
                        setTasks(reordered);
                      }
                      setDragState({ dragging: null, over: null });
                    }}
                  />
                ))
              )}
            </section>
          </>
        ) : (
          <SmartInsightsPanel
            tasks={tasks}
            completedCount={completedCount}
            totalCount={totalCount}
          />
        )}
      </main>
    </div>
  );
}

export default App;