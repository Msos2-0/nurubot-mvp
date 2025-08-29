import React, { useState } from "react";

export default function App() {
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hi, I’m Nuru, i am here to help you on your journey to better mental health & mindfulness 👋. How are you feeling today?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const append = (msg) => setMessages((m) => [...m, msg]);

  // Updated sendMessage function
  const sendMessage = async () => {
    const text = input.trim();
    if (!text) return;
    append({ sender: "user", text });
    setInput("");
    setLoading(true);

    try {
      const resp = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: text }) // changed key to "prompt"
      });

      const data = await resp.json();
      const botText = data?.message || "Sorry, couldn't get a reply right now."; // changed to match API response
      append({ sender: "bot", text: botText });
    } catch (err) {
      append({ sender: "bot", text: "There was a connection problem. Try again shortly." });
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-b from-blue-50 to-blue-100">
      <header className="bg-blue-600 text-white text-center py-4 shadow-md">
        <h1 className="text-xl font-bold">NuruMindfulness</h1>
        <p className="text-sm">A safe space for men’s mental well-being</p>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`px-4 py-2 rounded-2xl shadow-md max-w-xs ${msg.sender === "user" ? "bg-blue-600 text-white rounded-br-none" : "bg-white text-gray-800 rounded-bl-none"}`}>
              {msg.text}
            </div>
          </div>
        ))}
        {loading && <div className="text-sm text-gray-500">Nuru is thinking…</div>}
      </div>

      <div className="p-3 bg-white flex items-center shadow-inner">
        <input
          type="text"
          className="flex-1 border border-gray-300 rounded-xl px-4 py-2 mr-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          disabled={loading}
        />
        <button
          onClick={sendMessage}
          className={`px-4 py-2 rounded-xl shadow ${loading ? "bg-gray-400 text-white" : "bg-blue-600 text-white hover:bg-blue-700"}`}
          disabled={loading}
        >
          {loading ? "Sending..." : "Send"}
        </button>
      </div>
    </div>
  );
}
