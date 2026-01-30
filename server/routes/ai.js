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

module.exports = router;
