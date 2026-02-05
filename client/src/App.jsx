import { useState, useEffect } from 'react';
import axios from 'axios';
import { FaArrowRight } from 'react-icons/fa';
import confetti from 'canvas-confetti';

import { DndContext } from '@dnd-kit/core';
import { useSearchParams } from 'react-router-dom';

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
import { generateSchedule } from './utils/aiScheduler';

function App() {
  // ─── STATE ───
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('active');
  const [activeView, setActiveView] = useState('tasks');
  const [showSettings, setShowSettings] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFocusMode, setIsFocusMode] = useState(false);

  // URL State
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTaskId = searchParams.get('task');

  const handleToggleTask = (taskId) => {
    if (activeTaskId === taskId) {
      setSearchParams(prev => {
        const next = new URLSearchParams(prev);
        next.delete('task');
        return next;
      });
    } else {
      setSearchParams(prev => {
        const next = new URLSearchParams(prev);
        next.set('task', taskId);
        return next;
      });
    }
  };

  // Drag State handled by dnd-kit context
  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over) return;

    if (over.id.startsWith('hour-')) {
      // Task dropped on timeline hour
      const taskId = active.id;
      const hour = parseInt(over.id.split('-')[1]);

      // Formats time as HH:00
      const timeString = `${String(hour).padStart(2, '0')}:00`;

      // Update task data locally first for instant feedback (optimistic)
      const updatedTask = tasks.find(t => t._id === taskId);
      if (updatedTask) {
        const newTask = { ...updatedTask, dueTime: timeString };
        setTasks(tasks.map(t => t._id === taskId ? newTask : t));

        // Persist to server
        axios.put(`/api/tasks/${taskId}`, { dueTime: timeString }, getHeaders())
          .catch(err => console.error(err));

        confetti({ particleCount: 30, spread: 30, origin: { x: 0.8, y: 0.5 }, colors: ['#FF6B00', '#FFFFFF'] });
      }
    }
  };

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
  const [isHoveringSubmit, setIsHoveringSubmit] = useState(false);
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
        // Also close task detail
        if (activeTaskId) {
          setSearchParams(prev => {
            const next = new URLSearchParams(prev);
            next.delete('task');
            return next;
          });
        }
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [activeTaskId, setSearchParams]);

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

  const handleAutoSchedule = async () => {
    // Call AI Scheduler API
    try {
      const res = await axios.post('/api/ai/plan', {
        tasks: tasks.filter(t => !t.isCompleted),
        userContext: { currentTime: new Date().toLocaleTimeString() }
      }, getHeaders());

      const plan = res.data;
      if (!plan.schedule) return;

      // Apply schedule to tasks (Optimistic + Server)
      const updates = [];
      plan.schedule.forEach(slot => {
        if (slot.taskId) {
          const task = tasks.find(t => t._id === slot.taskId);
          if (task) {
            // Start time from slot "09:00 - ..."
            const startTime = slot.time.split('-')[0].trim(); // "09:00"

            // Construct Date
            const [hours, minutes] = startTime.split(':');
            const newDate = new Date();
            newDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

            updates.push({
              ...task,
              dueTime: startTime,
              dueDate: newDate.toISOString()
            });
          }
        }
      });

      // Batch update
      const newTasks = tasks.map(t => {
        const update = updates.find(u => u._id === t._id);
        return update ? update : t;
      });
      setTasks(newTasks);

      Promise.all(updates.map(task =>
        axios.put(`/api/tasks/${task._id}`, { dueDate: task.dueDate, dueTime: task.dueTime }, getHeaders())
      ))
        .then(() => {
          confetti({ particleCount: 50, spread: 60, origin: { x: 0.8, y: 0.5 }, colors: ['#4ade80', '#60a5fa'] });
        });

    } catch (err) {
      console.error('AI Planning Failed:', err);
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

          {/* Avatar State Logic */}
          <InteractiveAvatar
            state={(() => {
              if (authResult === 'success') return 'success';
              if (authResult === 'error') return 'confused';

              if (isFocusedPassword) {
                if (showPassword) return 'scanning'; // Scan when password visible
                if (isTyping) return 'peeking'; // Peek when typing
                return 'looking-away'; // Avert eyes by default on password
              }

              if (isFocusedEmail) {
                if (isTyping) return 'watching';
                return 'active'; // Look attentive
              }

              return 'idle';
            })()}
            email={email}
            mode="auth"
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
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-secondary)', fontSize: '14px' }}
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
        </div >
      </div >
    );
  }

  // ════════════════════════════════════════════════════════════════
  // DASHBOARD VIEW (Pilot's HUD)
  // ════════════════════════════════════════════════════════════════
  return (
    <div className={`app-container ${isFocusMode ? 'focus-mode-active' : ''}`}>
      {/* ── SIDEBAR ── */}
      <Sidebar
        activeView={activeView}
        onNavigate={setActiveView}
        onOpenSettings={() => setShowSettings(true)}
        onLogout={() => setToken(null)}
      />

      {/* ── MAIN CONTENT ── */}
      <DndContext onDragEnd={handleDragEnd}>
        <main className="main-content">

          {/* ── FOCUS BAR ── */}
          <FocusBar
            taskCount={pendingCount}
            tasks={tasks}
            isFocusMode={isFocusMode}
            onToggleFocus={() => setIsFocusMode(!isFocusMode)}
          />

          {/* ── CONTENT SPLIT ── */}
          <div className="content-split">

            {/* ── LEFT: TASK LIST ── */}
            <section className="task-list-container">

              {/* ── INPUT AREA (Sticky Top) ── */}
              <div style={{ padding: '1.5rem', paddingBottom: '0.5rem', background: 'var(--color-bg)', position: 'sticky', top: 0, zIndex: 10 }}>
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
                      isExpanded={activeTaskId === task._id}
                      onToggle={() => handleToggleTask(task._id)}
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
                  onAutoSchedule={() => handleAutoSchedule()}
                />
              ) : (
                /* Default to Timeline for 'tasks' or 'projects' for now */
                <ContextPanel
                  tasks={tasks}
                  onAutoSchedule={handleAutoSchedule}
                />
              )}
            </section>

          </div>
        </main>
      </DndContext>

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