const express = require('express');
const cors = require('cors');
const { OpenAI } = require('openai');

const app = express();
app.use(cors());
app.use(express.json());

// Tell the server to look in the 'public' folder for our website files
app.use(express.static('public')); 

// Initialize OpenRouter's connection
const openai = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_API_KEY,
});

app.post('/generate-mcq', async (req, res) => {
    try {
        const topic = req.body.topic;
        const prompt = `You are an expert HKDSE Physics teacher. Generate ONE challenging, original multiple-choice question on the topic: ${topic}. 
        It must require deductive reasoning and the application of core physics formulas. 
        Provide the output STRICTLY in JSON format with no markdown formatting. The JSON must have these exact keys:
        "stimulus" (background info/scenario), "question" (the actual question), "options" (an array of exactly 4 strings: A, B, C, D), "correct" (the index 0-3 of the correct option), "explanation" (detailed step-by-step reasoning).`;

        // Requesting the free Gemini 1.5 Flash via OpenRouter
        const completion = await openai.chat.completions.create({
            model: "google/gemini-1.5-flash:free",
            messages: [{ role: "user", content: prompt }]
        });

        let rawText = completion.choices[0].message.content;
        
        // Clean up the text to ensure it is pure JSON
        rawText = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
        const mcqData = JSON.parse(rawText);

        res.json(mcqData);
    } catch (error) {
        console.error("Error generating question:", error);
        res.status(500).json({ error: "Failed to generate question. Please try again." });
    }
});

// Start the server
const listener = app.listen(process.env.PORT || 3000, () => {
    console.log('Your app is listening on port ' + listener.address().port);
});
