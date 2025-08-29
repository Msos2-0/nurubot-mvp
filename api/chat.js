// api/chat.js
import OpenAI from "openai";

// Initialize once, reuse across requests
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // must match your Vercel environment variable
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ message: "No prompt provided" });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
    });

    const aiResponse = completion.choices[0].message.content;

    res.status(200).json({ message: aiResponse }); // ✅ matches App.js
  } catch (err) {
    console.error("OpenAI API error:", err);
    res.status(500).json({ message: "Server error: could not get response" }); // ✅ consistent response
  }
}

