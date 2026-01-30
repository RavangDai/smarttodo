require('dotenv').config();

async function listModels() {
    const key = process.env.GEMINI_API_KEY.trim();
    if (!key) {
        console.error("❌ No API Key found!");
        return;
    }

    // Mask key for log
    console.log(`🔑 Listing models with key ending in ...${key.slice(-5)}`);

    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;
        const response = await fetch(url);

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`❌ Fetch failed: ${response.status} ${response.statusText}`);
            console.error(errorText);
            return;
        }

        const data = await response.json();

        if (data.models) {
            console.log("✅ All Available Models:");
            data.models.forEach(m => {
                if (m.supportedGenerationMethods && m.supportedGenerationMethods.includes("generateContent")) {
                    console.log(` - ${m.name}`);
                }
            });
        } else {
            console.error("❌ No 'models' field in response:", JSON.stringify(data, null, 2));
        }
    } catch (error) {
        console.error("❌ Exception:", error.message);
    }
}

listModels();
