import { useState, useEffect } from 'react';
import axios from 'axios';
import { FaCheckDouble, FaListUl, FaBell, FaClock, FaTrash, FaSignOutAlt, FaPlus } from 'react-icons/fa';
import './App.css';

function App() {
  const [token, setToken] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);

  const getHeaders = () => ({ headers: { 'Authorization': token } });

  useEffect(() => {
    if (token) {
      axios.get('http://localhost:5000/tasks', getHeaders())
        .then(res => setTasks(res.data))
        .catch(err => console.error(err));
    }
  }, [token]);

  const handleAuth = async (e) => {
    if(e) e.preventDefault(); 
    const endpoint = isRegistering ? '/register' : '/login';
    try {
      const res = await axios.post(`http://localhost:5000${endpoint}`, { email, password });
      if (isRegistering) {
        alert("Account created! Now login.");
        setIsRegistering(false);
      } else {
        setToken(res.data.token);
      }
    } catch (err) {
      alert(err.response?.data?.error || "Error");
    }
  };

  const addTask = () => {
    if (!newTask) return;
    axios.post('http://localhost:5000/tasks', { title: newTask }, getHeaders())
      .then(res => {
        setTasks([...tasks, res.data]);
        setNewTask("");
      });
  };

  const deleteTask = (id) => {
    axios.delete(`http://localhost:5000/tasks/${id}`, getHeaders())
      .then(() => setTasks(tasks.filter(t => t._id !== id)));
  };

  const toggleTask = (id) => {
    axios.put(`http://localhost:5000/tasks/${id}`, {}, getHeaders())
      .then(res => {
        setTasks(tasks.map(t => t._id === id ? { ...t, isCompleted: res.data.isCompleted } : t));
      });
  };

  // --- 1. LOGIN SCREEN ---
  if (!token) {
    return (
      <div className="split-screen">
        {/* LEFT SIDE: Visuals */}
        <div className="left-panel">
          
          {/* Floating Task Cards */}
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

          {/* Orbit Animation */}
          <div className="orbit-container">
            <h1 className="orbit-center-text">Smart<br/>Todo.</h1>
            <div className="orbit-ring ring-1"></div>
            <div className="orbit-ring ring-2"></div>
            <div className="orbit-wrapper">
              <div className="orbiting-icon" style={{transform: 'rotate(0deg) translate(140px) rotate(0deg)'}}>
                 <FaCheckDouble color="#2563eb" />
              </div>
              <div className="orbiting-icon" style={{transform: 'rotate(90deg) translate(140px) rotate(-90deg)'}}>
                 <FaListUl color="#2563eb" />
              </div>
              <div className="orbiting-icon" style={{transform: 'rotate(180deg) translate(140px) rotate(-180deg)'}}>
                 <FaBell color="#2563eb" />
              </div>
              <div className="orbiting-icon" style={{transform: 'rotate(270deg) translate(140px) rotate(-270deg)'}}>
                 <FaClock color="#2563eb" />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE: Form */}
        <div className="right-panel">
          <div className="auth-container">
            <h2>{isRegistering ? "Create Account" : "Welcome Back"}</h2>
            <p className="sub-text">Enter your details to access your workspace.</p>
            
            <form onSubmit={handleAuth}>
              <div className="form-group">
                <label>Email Address</label>
                <input type="email" placeholder="name@company.com" onChange={e => setEmail(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input type="password" placeholder="••••••••" onChange={e => setPassword(e.target.value)} />
              </div>
              <button className="btn-primary" type="submit">{isRegistering ? "Sign Up" : "Sign In"}</button>
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

  // --- 2. DASHBOARD ---
  return (
    <div style={{maxWidth: '600px', margin: '50px auto', background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0'}}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:30}}>
        <h2 style={{margin:0, color:'#0f172a'}}>My Tasks</h2>
        <button onClick={() => setToken(null)} style={{background:'white', border:'1px solid #cbd5e1', color:'#64748b', padding:'8px 16px', borderRadius:6, cursor:'pointer', display:'flex', alignItems:'center', gap:5, fontSize:'0.9rem', fontWeight:'600'}}>
          Logout <FaSignOutAlt />
        </button>
      </div>
      
      <div style={{display:'flex', gap:10, marginBottom:30}}>
        <input value={newTask} onChange={e => setNewTask(e.target.value)} placeholder="What needs to be done?" style={{flex:1, padding:14, borderRadius:8, border:'1px solid #cbd5e1', background:'#f8fafc', color:'#0f172a', outline:'none', fontSize:'1rem'}} />
        <button onClick={addTask} style={{background:'#0f172a', border:'none', color:'white', width:50, borderRadius:8, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center'}}> <FaPlus /> </button>
      </div>

      <ul style={{listStyle:'none', padding:0}}>
        {tasks.map(task => (
          <li key={task._id} style={{display:'flex', justifyContent:'space-between', padding:'16px', borderBottom:'1px solid #f1f5f9', alignItems: 'center'}}>
            <span onClick={() => toggleTask(task._id)} style={{textDecoration: task.isCompleted ? 'line-through' : 'none', color: task.isCompleted ? '#94a3b8' : '#334155', cursor:'pointer', fontSize: '1.1rem', flex: 1}}>
              {task.title}
            </span>
            <FaTrash onClick={() => deleteTask(task._id)} style={{color:'#cbd5e1', cursor:'pointer'}} onMouseEnter={(e) => e.target.style.color = '#ef4444'} onMouseLeave={(e) => e.target.style.color = '#cbd5e1'} />
          </li>
        ))}
      </ul>
      {tasks.length === 0 && <p style={{textAlign:'center', color:'#94a3b8', marginTop: 40}}>No tasks yet. Add one above!</p>}
    </div>
  );
}

export default App;