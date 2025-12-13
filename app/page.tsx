"use client";

import { useEffect, useRef, useState } from "react";

type Message = {
  role: "user" | "ai";
  content: string;
};

export default function Home() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function sendMessage() {
    if (!input.trim() || loading) return;

    const messageText = input;
    setInput("");

    setMessages((prev) => [...prev, { role: "user", content: messageText }]);

    setLoading(true);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: messageText }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error();

      setMessages((prev) => [...prev, { role: "ai", content: data.result }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "ai", content: "Maaf, terjadi kesalahan. Silakan coba lagi." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex flex-col h-screen bg-gradient-to-br from-blue-50 via-sky-100 to-indigo-100">
      {/* HEADER */}
      <header className="relative h-20 flex items-center justify-center bg-gradient-to-r from-blue-600 to-indigo-600 shadow-md">
        {/* Glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 opacity-70 blur-xl" />

        <h1 className="relative text-white text-3xl md:text-4xl font-bold tracking-wide">
          DapiAI
        </h1>
      </header>

      {/* CHAT AREA */}
      <section className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex items-end gap-3 ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {msg.role === "ai" && (
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white text-xs font-semibold shadow">
                AI
              </div>
            )}

            <div
              className={`max-w-[70%] px-5 py-3 text-sm leading-relaxed shadow-md ${
                msg.role === "user"
                  ? "bg-gradient-to-br from-blue-600 to-blue-500 text-white rounded-3xl rounded-br-md"
                  : "bg-white/90 text-gray-800 rounded-3xl rounded-bl-md border"
              }`}
            >
              {msg.content}
            </div>

            {msg.role === "user" && (
              <div className="w-9 h-9 rounded-full bg-gray-300 flex items-center justify-center text-gray-700 text-xs font-semibold shadow">
                You
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-end gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white text-xs font-semibold shadow">
              D
            </div>
            <div className="px-5 py-3 rounded-3xl bg-white/80 border shadow text-sm text-blue-600 animate-pulse">
              DapiAI sedang mengetik…
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </section>

      {/* INPUT */}
      <div className="p-4 bg-white/80 backdrop-blur border-t">
        <div className="flex items-end gap-3 max-w-4xl mx-auto">
          <textarea
            rows={1}
            className="flex-1 resize-none rounded-2xl border border-blue-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
            placeholder="Tulis pesan ke DapiAI…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="h-11 px-6 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-medium shadow hover:opacity-90 transition disabled:opacity-50"
          >
            Kirim
          </button>
        </div>

        <p className="mt-2 text-xs text-gray-500 text-center">
          Enter untuk kirim • Shift + Enter untuk baris baru
        </p>
      </div>
    </main>
  );
}
