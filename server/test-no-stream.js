require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function testNoStream() {
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY.trim());
        const model = genAI.getGenerativeModel({ model: "gemini-pro-latest" });

        console.log("🤖 Testing 'gemini-pro-latest' (NO STREAM)...");
        const result = await model.generateContent("Hi");
        console.log("✅ Success! Response:", result.response.text());

    } catch (error) {
        console.error("❌ Failed:", JSON.stringify(error, null, 2));
    }
}

testNoStream();
