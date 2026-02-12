// server/index.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected!"))
  .catch((err) => console.error("❌ MongoDB Error:", err));

// Root Route (Health Check)
app.get('/', (req, res) => {
  res.send('API is running successfully!');
});

// --- ROUTES ---
// Using separate route files for cleaner structure
app.use('/api/users', require('./routes/users'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/ai', require('./routes/ai'));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));