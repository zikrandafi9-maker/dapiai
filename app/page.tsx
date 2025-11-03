"use client";

import { useState } from "react";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setAnswer("");

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Terjadi kesalahan");

      setAnswer(data.output);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-2xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">Coba Gemini di Next.js</h1>

      <form onSubmit={handleGenerate} className="space-y-3">
        <textarea
          className="w-full p-3 border rounded"
          rows={5}
          placeholder="Tulis pertanyaanmu di sini…"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
        <button
          className="px-4 py-2 rounded bg-black text-white disabled:opacity-60"
          disabled={loading || !prompt.trim()}
        >
          {loading ? "Meminta jawaban…" : "Kirim ke Gemini"}
        </button>
      </form>

      {error && <p className="text-red-600">Error: {error}</p>}

      {answer && (
        <section className="p-4 border rounded">
          <h2 className="font-semibold mb-2">Jawaban</h2>
          <pre className="whitespace-pre-wrap">{answer}</pre>
        </section>
      )}
    </main>
  );
}