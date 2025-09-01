import React, { useState, useEffect, useRef } from "react";

export default function App() {
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Hi, I’m Nuru, I am here to help you on your journey to better mental health & mindfulness 👋. How are you feeling today?"
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const append = (msg) => setMessages((m) => [...m, msg]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

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
        body: JSON.stringify({ message: text }),
      });

      if (!resp.ok) {
        const errorData = await resp.json().catch(() => ({}));
        throw new Error(errorData.error || `Server returned ${resp.status}`);
      }

      const data = await resp.json();
      const botText = data?.reply || "Sorry, couldn't get a reply right now.";
      append({ sender: "bot", text: botText });
    } catch (err) {
      append({ sender: "bot", text: `⚠️ ${err.message}` });
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
        <h1 className="text-2xl font-bold">NuruMindfulness</h1>
        <p className="text-sm">A safe space for men’s mental well-being</p>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex transition-all duration-300 ${
              msg.sender === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {msg.sender === "bot" && (
              <div className="mr-2 flex-shrink-0">
                {/* Bot avatar: simple silhouette */}
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-gray-700 font-bold">
                  🤖
                </div>
              </div>
            )}
            <div
              className={`px-4 py-2 rounded-2xl shadow-md max-w-xs break-words ${
                msg.sender === "user"
                  ? "bg-blue-600 text-white rounded-br-none animate-slide-in-right"
                  : "bg-gradient-to-r from-green-100 to-green-200 text-gray-800 rounded-bl-none animate-slide-in-left"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="text-sm text-gray-500 italic">Nuru is typing...</div>
        )}
        <div ref={messagesEndRef} />
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
          className={`px-4 py-2 rounded-xl shadow ${
            loading
              ? "bg-gray-400 text-white cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
          disabled={loading}
        >
          {loading ? "Sending..." : "Send"}
        </button>
      </div>

      <style>{`
        @keyframes slide-in-left {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slide-in-right {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-slide-in-left { animation: slide-in-left 0.3s ease forwards; }
        .animate-slide-in-right { animation: slide-in-right 0.3s ease forwards; }
      `}</style>
    </div>
  );
}
