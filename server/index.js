// server/index.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config(); // This loads variables from .env

const TaskModel = require('./models/Task');
const UserModel = require('./models/User');

const app = express();
const PORT = process.env.PORT || 5000;

// SECURITY FIX: Use environment variable, fallback only for local dev
const SECRET_KEY = process.env.JWT_SECRET || "fallback-secret-key-for-dev-only"; 

app.use(cors());
app.use(express.json());

// Connect to MongoDB using the hidden URI
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected!"))
  .catch((err) => console.error("❌ MongoDB Error:", err));

// --- MIDDLEWARE (The Bouncer) ---
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.status(401).json({ error: "Access Denied" });

  try {
    const verified = jwt.verify(token, SECRET_KEY);
    req.user = verified;
    next();
  } catch (err) {
    res.status(400).json({ error: "Invalid Token" });
  }
};

// --- AUTH ROUTES ---
app.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new UserModel({ email, password: hashedPassword });
    await newUser.save();
    res.json({ message: "User created" });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await UserModel.findOne({ email });
    if (!user) return res.status(400).json({ error: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, SECRET_KEY, { expiresIn: "1h" });
    res.json({ token, userId: user._id });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- TASK ROUTES ---
app.get('/tasks', verifyToken, async (req, res) => {
  try {
    const tasks = await TaskModel.find({ userId: req.user.id });
    res.json(tasks);
  } catch (err) { res.json({ error: err.message }); }
});

app.post('/tasks', verifyToken, async (req, res) => {
  try {
    const newTask = new TaskModel({ 
      title: req.body.title,
      userId: req.user.id 
    });
    const savedTask = await newTask.save();
    res.json(savedTask);
  } catch (err) { res.json({ error: err.message }); }
});

app.put('/tasks/:id', verifyToken, async (req, res) => {
  try {
    // 1. Find the task to ensure ownership
    const t = await TaskModel.findOne({ _id: req.params.id, userId: req.user.id });
    if (!t) return res.status(404).json({ error: "Task not found" });
    
    // 2. Toggle status
    t.isCompleted = !t.isCompleted;
    await t.save();
    res.json(t);
  } catch (err) { res.json({ error: err.message }); }
});

app.delete('/tasks/:id', verifyToken, async (req, res) => {
  try {
    const result = await TaskModel.findOneAndDelete({ 
      _id: req.params.id, 
      userId: req.user.id 
    });
    res.json(result);
  } catch (err) { res.json({ error: err.message }); }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));