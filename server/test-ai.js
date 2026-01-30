require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function listModels() {
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY.trim());
        // For listing models, we don't need a specific model instance usually, 
        // but the SDK structure is a bit different.
        // Actually the SDK doesn't have a direct 'listModels' on genAI instance in some versions?
        // Let's check documentation pattern or try a common one.
        // Wait, looking at docs, it might be separate or via a model manager. 
        // But simpler: let's try 'gemini-pro' which is the standard older one, or 'gemini-1.0-pro'.

        // I will try to generate with 'gemini-pro' instead of listing, as listing might need different permissions or SDK usage I'm less sure of without docs.
        // If 'gemini-pro' works, we use that. 

        console.log("🤖 Testing with 'gemini-pro'...");
        const modelPro = genAI.getGenerativeModel({ model: "gemini-pro" });
        const resultPro = await modelPro.generateContent("Hello");
        console.log("✅ 'gemini-pro' works!");

        console.log("🤖 Testing with 'gemini-1.5-flash' again...");
        const modelFlash = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const resultFlash = await modelFlash.generateContent("Hello");
        console.log("✅ 'gemini-1.5-flash' works!");

    } catch (error) {
        console.error("❌ Error:", error.message);
    }
}

listModels();
