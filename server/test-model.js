require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function testModel() {
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY.trim());
        const model = genAI.getGenerativeModel({ model: "gemini-pro-latest" });

        console.log("🤖 Generating content with 'gemini-pro-latest'...");
        const result = await model.generateContent("Say hello");
        const response = await result.response;
        console.log("✅ Success! Response:", response.text());

    } catch (error) {
        console.error("❌ Error:", error.message);
    }
}

testModel();
