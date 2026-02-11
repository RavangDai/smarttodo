import { useState, useEffect } from 'react';
import axios from 'axios';
import { FaArrowRight } from 'react-icons/fa';
import confetti from 'canvas-confetti';
import { DndContext } from '@dnd-kit/core';
import { useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

// New Components
import Sidebar from './components/Sidebar';
import FocusBar from './components/FocusBar';
import ContextPanel from './components/ContextPanel';
import ProjectsView from './components/ProjectsView';
import TaskAccordion from './components/TaskAccordion';
import SmartTaskInput from './components/SmartTaskInput'; // Refactored version
import SmartInsightsPanel from './components/SmartInsightsPanel';
import Settings from './components/Settings';
import AITypewriter from './components/AITypewriter';
import InteractiveAvatar from './components/InteractiveAvatar';
import { PrimaryButton } from './components/ui/Buttons';
import NeoInput from './components/ui/NeoInput';

function App() {
  // ─── STATE ───
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('active');
  const [activeView, setActiveView] = useState('tasks');
  const [showSettings, setShowSettings] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [projects, setProjects] = useState([]);

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
      const taskId = active.id;
      const hour = parseInt(over.id.split('-')[1]);
      const timeString = `${String(hour).padStart(2, '0')}:00`;

      const updatedTask = tasks.find(t => t._id === taskId);
      if (updatedTask) {
        const newTask = { ...updatedTask, dueTime: timeString };
        setTasks(tasks.map(t => t._id === taskId ? newTask : t));

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
  const [authResult, setAuthResult] = useState('idle');

  // ─── EFFECTS ───
  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
      fetchTasks();
      fetchProjects();
    } else {
      localStorage.removeItem('token');
    }
  }, [token]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      const isTyping = ['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName);
      const key = e.key.toLowerCase();

      if (key === '/' && !isTyping) {
        e.preventDefault();
        e.stopPropagation();
        // document.querySelector('.task-input')?.focus(); // Old selector
        // NeoInput uses generic input, but we can rely on autoFocus prop or ref if needed. 
        // For now, let's just create a generic data-attribute or class if we really need to focus it from outside.
        // Or simply set activeView to tasks.
        setActiveView('tasks');
        return;
      }

      if (e.key === 'Escape') {
        setShowSettings(false);
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
    setIsLoading(true);
    axios.get('/api/tasks', getHeaders())
      .then(res => setTasks(res.data))
      .catch(err => console.error(err))
      .finally(() => setIsLoading(false));
  };

  const fetchProjects = () => {
    axios.get('/api/projects', getHeaders())
      .then(res => setProjects(res.data))
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
      dueDate: taskDate,
      dueTime: taskData.dueTime, // Ensure dueTime is passed if separate
      project: taskData.project || undefined
    }, getHeaders())
      .then(res => {
        setTasks([res.data, ...tasks]);
        if (taskData.project) fetchProjects();
      })
      .catch(err => console.error('Error adding task:', err));
  };

  const handleCreateProject = (projectData) => {
    axios.post('/api/projects', projectData, getHeaders())
      .then(res => setProjects([res.data, ...projects]))
      .catch(err => console.error('Error creating project:', err));
  };

  const handleDeleteProject = (id) => {
    axios.delete(`/api/projects/${id}`, getHeaders())
      .then(() => {
        setProjects(projects.filter(p => p._id !== id));
        fetchTasks();
      })
      .catch(err => console.error('Error deleting project:', err));
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
    try {
      const res = await axios.post('/api/ai/plan', {
        tasks: tasks.filter(t => !t.isCompleted),
        userContext: { currentTime: new Date().toLocaleTimeString() }
      }, getHeaders());

      const plan = res.data;
      if (!plan.schedule) return;

      const updates = [];
      plan.schedule.forEach(slot => {
        if (slot.taskId) {
          const task = tasks.find(t => t._id === slot.taskId);
          if (task) {
            const startTime = slot.time.split('-')[0].trim();
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

  // ─── AUTH VIEW ───
  if (!token) {
    return (
      <div className="flex h-screen w-full bg-background text-white overflow-hidden font-sans">
        {/* Left Panel - Avatar */}
        <div className="hidden lg:flex flex-1 flex-col justify-between p-12 relative overflow-hidden bg-black/40">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,107,53,0.15),transparent_50%)]" />

          <header className="relative z-10">
            <h1 className="font-display font-bold text-4xl mb-2">Karya<span className="text-primary">AI</span></h1>
            <p className="text-secondary text-lg">Intelligent simplicity. AI that gets out of your way.</p>
          </header>

          <div className="relative z-10 flex flex-col items-center">
            <InteractiveAvatar
              state={(() => {
                if (authResult === 'success') return 'success';
                if (authResult === 'error') return 'confused';
                if (isFocusedPassword) return showPassword ? 'scanning' : (isTyping ? 'peeking' : 'looking-away');
                if (isFocusedEmail) return isTyping ? 'watching' : 'active';
                return 'idle';
              })()}
              email={email}
              mode="auth"
            />
            <AITypewriter />
          </div>

          <div className="relative z-10 text-xs text-secondary/50 font-mono">
            SYSTEM STATUS: OPERATIONAL
          </div>
        </div>

        {/* Right Panel - Form */}
        <div className="flex-1 flex items-center justify-center p-6 bg-surface/50 backdrop-blur-md">
          <div className="w-full max-w-md p-8 rounded-3xl bg-white/5 border border-white/10 shadow-glass">
            <h2 className="text-3xl font-display font-bold mb-2">
              {isRegistering ? 'Create Account' : 'Welcome Back'}
            </h2>
            <p className="text-secondary mb-8">
              {isRegistering ? 'Join the productivity revolution.' : 'Sign in to access your workspace.'}
            </p>

            {authError && (
              <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {authError}
              </div>
            )}

            <form onSubmit={handleAuth} className="space-y-4">
              <NeoInput
                type="email"
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
                className="w-full"
              />

              <div className="relative">
                <NeoInput
                  type={showPassword ? "text" : "password"}
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
                  className="w-full"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-secondary hover:text-white transition-colors uppercase tracking-wider font-medium"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>

              <PrimaryButton type="submit" className="w-full justify-between">
                {isRegistering ? 'INITIALIZE' : 'AUTHENTICATE'}
                <FaArrowRight size={14} />
              </PrimaryButton>
            </form>

            <div className="mt-8 flex justify-center gap-2 text-sm">
              <span className="text-secondary">
                {isRegistering ? 'Already contain data?' : 'New sequence?'}
              </span>
              <button
                className="text-white hover:text-primary transition-colors font-medium"
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

  // ─── APP VIEW ───
  return (
    <div className={`flex h-screen w-full bg-background text-white overflow-hidden font-sans ${isFocusMode ? 'focus-mode-active' : ''}`}>
      {/* ── SIDEBAR ── */}
      <Sidebar
        activeView={activeView}
        onNavigate={setActiveView}
        onOpenSettings={() => setShowSettings(true)}
        onLogout={() => setToken(null)}
      />

      {/* ── MAIN CONTENT ── */}
      <DndContext onDragEnd={handleDragEnd}>
        <main className="flex-1 flex flex-col relative w-full overflow-hidden">

          {/* ── FOCUS BAR ── */}
          <div className="z-20 w-full glass-panel border-b border-white/5 sticky top-0">
            <FocusBar
              taskCount={pendingCount}
              tasks={tasks}
              isFocusMode={isFocusMode}
              onToggleFocus={() => setIsFocusMode(!isFocusMode)}
            />
          </div>

          {/* ── CONTENT SPLIT ── */}
          <div className="flex-1 flex overflow-hidden">

            {/* ── LEFT: TASK LIST / PROJECTS ── */}
            <section className="flex-1 overflow-y-auto custom-scrollbar relative">
              <AnimatePresence mode="wait">
                {activeView === 'projects' ? (
                  <motion.div
                    key="projects"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className="h-full"
                  >
                    <ProjectsView
                      projects={projects}
                      tasks={tasks}
                      onCreateProject={handleCreateProject}
                      onDeleteProject={handleDeleteProject}
                      onUpdateTask={updateTask}
                      onDeleteTask={deleteTask}
                      onAddTask={handleAddTask}
                      getHeaders={getHeaders}
                      getLocalDateString={getLocalDateString}
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="tasks"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.2 }}
                    className="h-full"
                  >
                    {/* INPUT AREA */}
                    <div className="p-6 pb-2 md:max-w-3xl mx-auto sticky top-0 z-10 bg-background/95 backdrop-blur-xl transition-all">
                      <SmartTaskInput
                        onAddTask={handleAddTask}
                        getLocalDateString={getLocalDateString}
                        tasks={tasks}
                      />
                    </div>

                    {/* FILTER TABS */}
                    <div className="px-6 mb-4 md:max-w-3xl mx-auto flex gap-1">
                      {['active', 'completed', 'all'].map(f => (
                        <button
                          key={f}
                          onClick={() => setFilter(f)}
                          className={`
                                            px-4 py-2 rounded-lg text-sm font-medium transition-all
                                            ${filter === f ? 'bg-primary/10 text-primary' : 'text-secondary hover:text-white hover:bg-white/5'}
                                        `}
                        >
                          {f.toUpperCase()}
                        </button>
                      ))}
                    </div>

                    {/* TASKS */}
                    <div className="px-6 pb-12 md:max-w-3xl mx-auto space-y-3 min-h-[50vh]">
                      {isLoading ? (
                        <div className="space-y-4">
                          {[1, 2, 3].map(i => (
                            <div key={i} className="h-20 bg-white/5 rounded-2xl animate-pulse" />
                          ))}
                        </div>
                      ) : filteredTasks.length === 0 ? (
                        <div className="text-center py-20 text-secondary">
                          <div className="text-4xl mb-4 opacity-50">📋</div>
                          <p>No tasks found.</p>
                          <p className="text-xs mt-2 text-secondary/50">Type above to add new tasks.</p>
                        </div>
                      ) : (
                        <AnimatePresence>
                          {filteredTasks.map((task, i) => (
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
                          ))}
                        </AnimatePresence>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </section>

            {/* ── RIGHT: CONTEXT PANEL ── */}
            <section className="hidden xl:block w-80 border-l border-white/5 bg-black/20 backdrop-blur-sm overflow-y-auto">
              <AnimatePresence mode="wait">
                {activeView === 'insights' ? (
                  <motion.div
                    key="insights"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="h-full"
                  >
                    <SmartInsightsPanel
                      tasks={tasks}
                      completedCount={completedCount}
                      totalCount={totalCount}
                      onAutoSchedule={() => handleAutoSchedule()}
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="context"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="h-full"
                  >
                    <ContextPanel
                      tasks={tasks}
                      onAutoSchedule={handleAutoSchedule}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
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