require('dotenv').config();

async function listModels() {
    const key = process.env.GEMINI_API_KEY.trim();
    console.log(`🔑 Using Key (last 5): ...${key.slice(-5)}`);

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
        const data = await response.json();

        if (data.models) {
            console.log("✅ Available Models (Filtered):");
            const filtered = data.models.filter(m => m.name.includes("gemini-1.5") || m.name.includes("gemini-pro"));
            filtered.forEach(m => console.log(` - ${m.name}`));
        } else {
            console.error("❌ Error listing models:", JSON.stringify(data, null, 2));
        }
    } catch (error) {
        console.error("❌ Network/Fetch Error:", error.message);
    }
}

listModels();
