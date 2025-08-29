// server.js — local express server that exposes /api/chat for local development
require('dotenv').config();
const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

const crisisRegex = /\b(suicide|kill myself|end my life|want to die|hurt myself|hang myself|overdose|i will die)\b/i;

app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body || {};
    if (!message || typeof message !== 'string') return res.status(400).json({ error: "Missing 'message' in body" });

    if (crisisRegex.test(message)) {
      const crisisReply = `I'm really sorry — I'm concerned about what you just shared. If you're in immediate danger call emergency services (South Africa: 10111) or an ambulance. You can also call SADAG: 0800 567 567 or Lifeline: 0861 322 322.`;
      return res.json({ reply: crisisReply, safety: true });
    }

    const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY;
    if (!OPENAI_API_KEY) return res.status(500).json({ error: 'Missing OPENAI_API_KEY in .env' });

    const model = process.env.OPENAI_MODEL || 'gpt-3.5-turbo';
    const payload = {
      model,
      messages: [
        { role: 'system', content: 'You are NuruMindfulness...' }, // a concise system prompt; production uses fuller prompt from api/chat.js
        { role: 'user', content: message }
      ],
      temperature: 0.75,
      max_tokens: 350
    };

    const r = await axios.post('https://api.openai.com/v1/chat/completions', payload, {
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, 'Content-Type': 'application/json' }
    });

    const reply = r.data?.choices?.[0]?.message?.content?.trim() || "Sorry, couldn't generate reply.";
    return res.json({ reply, safety: false });
  } catch (err) {
    console.error(err.response?.data || err.message || err);
    return res.status(500).json({ error: 'Server error', detail: String(err) });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Local API server running on http://localhost:${PORT}`));
