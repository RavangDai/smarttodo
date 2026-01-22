import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  FaCheckDouble, FaListUl, FaBell, FaClock, FaTrash, FaSignOutAlt, FaPlus,
  FaEnvelope, FaLock, FaGoogle, FaGithub, FaCheck
} from 'react-icons/fa';

import './App.css';       // <--- 1. Loads your Login Styles
import './Dashboard.css'; // <--- 2. LOADS YOUR NEW DASHBOARD STYLES

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
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
    axios.post('http://localhost:5000/api/tasks', { title: newTask }, getHeaders())
      .then(res => {
        setTasks([...tasks, res.data]);
        setNewTask("");
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

  // --- 4. DASHBOARD VIEW ---
  return (
    <div className="dashboard-layout">

      {/* 🌟 ATMOSPHERE: Floating Background Icons 🌟 */}
      <div className="dashboard-bg-icon icon-1"><FaCheckDouble /></div>
      <div className="dashboard-bg-icon icon-2"><FaListUl /></div>
      <div className="dashboard-bg-icon icon-3"><FaClock /></div>
      <div className="dashboard-bg-icon icon-4"><FaBell /></div>

      {/* Main Card */}
      <div className="task-container">

        {/* Header */}
        <div className="dashboard-header">
          <h2>My Tasks</h2>
          <button onClick={() => setToken(null)} className="btn-logout">
            Logout <FaSignOutAlt />
          </button>
        </div>

        {/* Input Area */}
        <div className="add-task-wrapper">
          <input
            className="task-input"
            value={newTask}
            onChange={e => setNewTask(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addTask()}
            placeholder="What's next?"
          />
          <button onClick={addTask} className="btn-add">
            <FaPlus />
          </button>
        </div>

        {/* Task List */}
        <ul className="task-list">
          {tasks.length === 0 && (
            <p style={{ textAlign: 'center', color: '#94a3b8', marginTop: '20px' }}>
              No tasks yet. Add one above!
            </p>
          )}

          {tasks.map(task => (
            <li key={task._id} className={`task-card ${task.isCompleted ? 'task-completed' : ''}`}>
              <div className="task-content" onClick={() => toggleTask(task._id)}>
                <div className="custom-checkbox">
                  {task.isCompleted && <FaCheck size={14} />}
                </div>
                <span className="task-text">{task.title}</span>
              </div>
              <button className="btn-delete" onClick={() => deleteTask(task._id)}>
                <FaTrash />
              </button>
            </li>
          ))}
        </ul>

      </div>
    </div>
  );
}

export default App;