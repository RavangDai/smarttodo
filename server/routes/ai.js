const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const Task = require('../models/Task');
const auth = require('../middleware/auth');

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY.trim());
const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

// POST /api/ai/breakdown/:taskId
router.post('/breakdown/:taskId', async (req, res) => {
    // Set headers for SSE/Streaming
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Transfer-Encoding', 'chunked');

    try {
        const task = await Task.findById(req.params.taskId);
        if (!task) {
            res.write(JSON.stringify({ error: "Task not found" }) + "\n");
            return res.end();
        }

        const prompt = `
            You are a productivity expert. Break down the following task into 3-5 actionable subtasks.
            Task: "${task.title}"
            Notes: "${task.notes || ''}"
            
            Return ONLY a raw JSON format (no markdown code blocks) for each subtask on a NEW LINE.
            Format: {"title": "Subtask Name", "estimatedTime": "15m"}
            
            Example output format:
            {"title": "Draft outline", "estimatedTime": "10m"}
            {"title": "Gather resources", "estimatedTime": "20m"}
        `;

        console.log(`🤖 Generative AI: Breaking down task "${task.title}"...`);

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        let subtasks = [];

        // Clean up and process lines
        const lines = text.split('\n').filter(line => line.trim() !== '');

        for (const line of lines) {
            const cleanLine = line.replace(/```json/g, '').replace(/```/g, '').trim();
            if (!cleanLine) continue;

            try {
                if (cleanLine.startsWith('{') && cleanLine.endsWith('}')) {
                    const subtask = JSON.parse(cleanLine);
                    subtasks.push({ title: subtask.title, isCompleted: false });

                    // Simulate stream to client
                    res.write(`data: ${JSON.stringify(subtask)}\n\n`);
                }
            } catch (e) {
                console.log("Line parsing error:", e);
            }
        }

        // Save subtasks to DB
        if (subtasks.length > 0) {
            // Append to existing or replace? Usually append or just set if empty.
            // Let's add them to the task.
            task.subtasks = [...(task.subtasks || []), ...subtasks];
            await task.save();
            console.log(`✅ AI added ${subtasks.length} subtasks to "${task.title}"`);
        }

        res.write(`data: {"done": true}\n\n`);
        res.end();

    } catch (error) {
        console.error("❌ AI Error:", error);
        res.write(`data: {"error": "Failed to generate breakdown"}\n\n`);
        res.end();
    }
});

// POST /api/ai/nlp - Natural Language Task Editing
router.post('/nlp', auth, async (req, res) => {
    try {
        const { taskId, command } = req.body;

        if (!taskId || !command) {
            return res.status(400).json({ error: 'taskId and command are required' });
        }

        const task = await Task.findById(taskId);
        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }

        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const prompt = `
You are a task management AI. Parse this natural language command and return a JSON action.

Task: "${task.title}"
Current due date: ${task.dueDate || 'none'}
Current priority: ${task.priority || 'medium'}
User command: "${command}"

Today is: ${today.toISOString().split('T')[0]}
Tomorrow is: ${tomorrow.toISOString().split('T')[0]}

Return ONLY valid JSON (no markdown, no explanation) in this format:
{
  "action": "update" | "add_subtask" | "delete" | "none",
  "updates": { 
    "dueDate": "ISO date string or null",
    "priority": "low" | "medium" | "high",
    "title": "new title if changed"
  },
  "subtask": "subtask title if action is add_subtask",
  "message": "Human readable confirmation message"
}

Examples:
- "move to tomorrow" → {"action": "update", "updates": {"dueDate": "${tomorrow.toISOString()}"}, "message": "Moved to tomorrow"}
- "high priority" → {"action": "update", "updates": {"priority": "high"}, "message": "Priority set to high"}
- "add subtask buy milk" → {"action": "add_subtask", "subtask": "buy milk", "message": "Added subtask: buy milk"}
`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text().trim();

        // Clean up markdown code blocks if present
        text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

        console.log('🤖 NLP Response:', text);

        let parsed;
        try {
            parsed = JSON.parse(text);
        } catch (e) {
            return res.status(500).json({ error: 'Failed to parse AI response', raw: text });
        }

        // Apply the action
        if (parsed.action === 'update' && parsed.updates) {
            Object.keys(parsed.updates).forEach(key => {
                if (parsed.updates[key] !== undefined && parsed.updates[key] !== null) {
                    task[key] = parsed.updates[key];
                }
            });
            await task.save();
        } else if (parsed.action === 'add_subtask' && parsed.subtask) {
            task.subtasks = [...(task.subtasks || []), { title: parsed.subtask, isCompleted: false }];
            await task.save();
        }

        res.json({
            success: true,
            action: parsed.action,
            message: parsed.message,
            task: task
        });

    } catch (error) {
        console.error('❌ NLP Error:', error);
        res.status(500).json({ error: 'Failed to process command' });
    }
});

module.exports = router;
