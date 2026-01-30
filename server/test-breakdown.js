require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function testModel() {
    try {
        console.log("🤖 Testing 'gemini-flash-latest'...");
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY.trim());
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

        const prompt = `Break down this task into 3 subtasks in JSON format:
Task: "gym"

Return each subtask on a new line like:
{"title": "Subtask 1", "estimatedTime": "10m"}`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        console.log("✅ Success! Response:");
        console.log(text);

    } catch (error) {
        console.error("❌ Error:", error.message);
        console.error("Full error:", error);
    }
}

testModel();
