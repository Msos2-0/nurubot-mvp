// api/chat.js  (paste into the file you just created)
//
// Vercel serverless function that proxies user messages to OpenAI (gpt-3.5-turbo).
// Environment variables (set these in Vercel):
// - PROVIDER = openai
// - OPENAI_API_KEY = your OpenAI secret key
// - OPENAI_MODEL = gpt-3.5-turbo  (optional)

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

    const { message } = req.body || {};
    if (!message || typeof message !== "string") return res.status(400).json({ error: "Missing 'message' in body" });

    // Quick crisis detection (conservative)
    const crisisRegex = /\b(suicide|kill myself|end my life|want to die|hurt myself|hang myself|overdose|i will die)\b/i;
    if (crisisRegex.test(message)) {
      const crisisReply = `I'm really sorry — I'm concerned about what you just shared. If you're in immediate danger call emergency services (South Africa: 10111) or an ambulance. You can also call SADAG: 0800 567 567 or Lifeline: 0861 322 322. If you want, I can stay here and listen.`;
      return res.status(200).json({ reply: crisisReply, safety: true });
    }

    // Model instructions
    const systemPrompt = `
You are "NuruMindfulness", a gentle, empathetic chatbot for men's mental health in South Africa.
Tone: calm, non-judgmental, concise, culturally aware. Use short friendly language and suggest practical micro-actions (breathing, grounding, journaling, links to resources).
Never provide medical diagnoses. When appropriate, encourage seeking professional help and include local resources (SADAG 0800 567 567, Lifeline 0861 322 322).
If the user asks for instructions for self-harm, refuse and give crisis resources.
Keep replies to 1-3 short paragraphs.
`;

    const provider = (process.env.PROVIDER || "openai").toLowerCase();

    if (provider === "openai") {
      const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
      if (!OPENAI_API_KEY) return res.status(500).json({ error: "OpenAI key not configured." });

      const model = process.env.OPENAI_MODEL || "gpt-3.5-turbo";
      const payload = {
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ],
        temperature: 0.75,
        max_tokens: 350
      };

      const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!openaiRes.ok) {
        const text = await openaiRes.text();
        console.error("OpenAI error:", openaiRes.status, text);
        return res.status(502).json({ error: "OpenAI API error", detail: text });
      }

      const openaiData = await openaiRes.json();
      const reply = openaiData?.choices?.[0]?.message?.content?.trim() || "Sorry, I couldn't create a reply right now.";
      return res.status(200).json({ reply, safety: false });
    } else {
      // Very basic fallback for other providers (not optimized)
      return res.status(500).json({ error: "No supported provider configured." });
    }
  } catch (err) {
    console.error("Server error:", err);
    return res.status(500).json({ error: "Server error", detail: String(err) });
  }
}
