// api/chat.js
import OpenAI from "openai";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { message } = req.body;

  if (!message) {
    console.error("❌ No message received in request body");
    return res.status(400).json({ error: "No message provided" });
  }

  try {
    console.log("📩 Incoming user message:", message);

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY, // backend variable only
    });

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: message }],
    });

    console.log("✅ OpenAI raw response:", JSON.stringify(response, null, 2));

    const reply = response.choices[0].message?.content || "No reply available";
    console.log("🤖 Bot reply:", reply);

    return res.status(200).json({ reply });
  } catch (error) {
    console.error("🔥 OpenAI API error:", error);
    return res
      .status(500)
      .json({ error: "A server error occurred. Please try again later." });
  }
}
