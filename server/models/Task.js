// server/models/Task.js
const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  userId: { 
    type: String, 
    required: true // NEW: Every task MUST belong to someone
  },
  title: {
    type: String,
    required: true,
  },
  isCompleted: {
    type: Boolean,
    default: false,
  }
});

module.exports = mongoose.model('Task', TaskSchema);