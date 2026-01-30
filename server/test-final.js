require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function testFinal() {
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY.trim());
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        console.log("🤖 Testing 'gemini-1.5-flash'...");
        const result = await model.generateContent("Hi");
        console.log("✅ Success! Response:", result.response.text());

    } catch (error) {
        console.error("❌ Failed:", JSON.stringify(error, null, 2));
        console.error("Error Message:", error.message);
    }
}

testFinal();
