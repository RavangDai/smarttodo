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
        let errorMessage = "Failed to generate breakdown";

        if (error.response?.status === 429 || error.message.includes('429') || error.message.includes('Quota')) {
            errorMessage = "AI Quota Exceeded. Try again later.";
        }

        res.write(`data: {"error": "${errorMessage}"}\n\n`);
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

// POST /api/ai/plan - Daily Scheduler Chatbot
router.post('/plan', auth, async (req, res) => {
    try {
        const { tasks, userContext } = req.body;
        // userContext can include: currentTime, preferences, etc.

        const systemPrompt = `
IDENTITY
You are KaryaAI, an AI-powered daily planning assistant.
You are calm, precise, supportive, and decisive.
Your job is to create realistic, executable daily schedules.

INPUT DATA
Current Time: ${userContext?.currentTime || new Date().toLocaleTimeString()}
Tasks Provided: ${JSON.stringify(tasks)}

SCHEDULING RULES
1. Schedule high-focus tasks during peak energy hours (monitor assumption or user pref).
2. Insert 10-15m breaks every 60-90m.
3. Lunch break around 12:30 or 13:00.
4. Deadlines > High Priority > Personal Preference.
5. If overloaded, suggest deferring low priority tasks.
6. Be realistic with time.

OUTPUT FORMAT
Return a pure JSON object with this structure:
{
  "schedule": [
    { "time": "09:00 - 09:30", "activity": "Morning Setup", "type": "routine" },
    { "time": "09:30 - 11:00", "activity": "Task Name", "type": "task", "taskId": "..." }
  ],
  "notes": "Explanation of the plan.",
  "improvement": "One tip for better flow.",
  "question": "Optional adjustment question."
}
`;

        const result = await model.generateContent(systemPrompt);
        const response = await result.response;
        let text = response.text().trim();

        // Clean markdown
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();

        const plan = JSON.parse(text);
        res.json(plan);

    } catch (error) {
        console.error('❌ Planner Error:', error);
        res.status(500).json({ error: 'Failed to generate plan' });
    }
});

// POST /api/ai/chat - Conversational Interface
router.post('/chat', auth, async (req, res) => {
    try {
        const { message, history, tasks, userContext } = req.body;

        const systemPrompt = `
IDENTITY
You are KaryaAI, a proactive, intelligent productivity assistant.
You are embedded in a Todo App. You have access to the user's tasks.

CONTEXT
Current Time: ${userContext?.currentTime || new Date().toLocaleTimeString()}
User Tasks: ${JSON.stringify(tasks.map(t => ({ id: t._id, title: t.title, priority: t.priority, due: t.dueTime || t.dueDate, status: t.isCompleted ? 'done' : 'pending' })))}

GOAL
Help the user plan, prioritize, and execute.
If the user asks to "plan my day", suggest a schedule in JSON.
If the user is overwhelmed, suggest 1 small task.
If the user chats casually, be brief and professional but friendly.

IMPORTANT
If you want to perform an action (like updating the UI), output a JSON block at the end of your message.
Action Formats:
- SCHEDULE: { "action": "schedule", "schedule": [ ... ] }
- ADD_TASK: { "action": "add_task", "task": { ... } }

Stay concise. No fluff.
`;

        const chatHistory = history.map(msg => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.content }]
        }));

        // Add current message
        chatHistory.push({ role: 'user', parts: [{ text: message }] });

        // Prepend system instruction (Gemini specific way or just insert as first message context)
        // For Gemini 1.5 Flash, system instructions are supported or we just prepend to context.
        // We'll prepend context to the last message for simplicity or use generationConfig if available.

        const result = await model.generateContent({
            contents: chatHistory,
            systemInstruction: { role: 'system', parts: [{ text: systemPrompt }] }
        });

        const response = await result.response;
        const text = response.text();

        res.json({ reply: text });

    } catch (error) {
        console.error('❌ Chat Error:', error);
        res.status(500).json({ error: 'Failed to chat' });
    }
});

module.exports = router;
