const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Task = require('../models/Task');

// GET Tasks
router.get('/', auth, async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ msg: 'Server Error' });
  }
});

// POST Task
router.post('/', auth, async (req, res) => {
  try {
    // 👇 LOGGING: This will print to your Black Terminal when you add a task
    console.log("📥 RECEIVED DATA:", req.body);

    const { title, priority, dueDate } = req.body;

    // validation
    if (!title) {
      console.log("❌ Error: Title is missing!");
      return res.status(400).json({ msg: "Title is required" });
    }

    const newTask = new Task({
      title,
      priority,
      dueDate,
      user: req.user.id,
      lastInteraction: Date.now()
    });

    const task = await newTask.save();
    console.log("✅ SAVED TASK:", task); // Log the saved task
    res.json(task);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// DELETE Task
router.delete('/:id', auth, async (req, res) => {
  try {
    let task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ msg: 'Task not found' });
    if (task.user.toString() !== req.user.id) return res.status(401).json({ msg: 'Not authorized' });

    await task.deleteOne();
    res.json({ msg: 'Task removed' });
  } catch (err) {
    res.status(500).json({ msg: 'Server Error' });
  }
});

// UPDATE Task
router.put('/:id', auth, async (req, res) => {
  try {
    let task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ msg: 'Task not found' });
    if (task.user.toString() !== req.user.id) return res.status(401).json({ msg: 'Not authorized' });

    // Destructure all possible fields
    const { title, isCompleted, priority, dueDate, notes, subtasks } = req.body;

    // Update fields if they exist in request
    if (title) task.title = title;
    if (isCompleted !== undefined) task.isCompleted = isCompleted;
    if (priority) task.priority = priority;
    if (dueDate) task.dueDate = dueDate;
    if (notes !== undefined) task.notes = notes;
    if (subtasks) task.subtasks = subtasks;

    task.lastInteraction = Date.now();
    await task.save();
    res.json(task);
  } catch (err) {
    res.status(500).json({ msg: 'Server Error' });
  }
});

module.exports = router;