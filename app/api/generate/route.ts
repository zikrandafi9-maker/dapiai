import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        { error: "Prompt tidak boleh kosong" },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY tidak ditemukan di .env" },
        { status: 500 }
      );
    }

    // Konteks waktu (hanya latar, tidak disebut eksplisit)
    const currentDate = new Date().toLocaleDateString("id-ID", {
      timeZone: "Asia/Jakarta",
      dateStyle: "long",
    });

    /**
     * TEMPLATE JAWABAN DETAIL & NATURAL
     * - Minimal 2–3 kalimat
     * - Ada konteks & penjelasan
     * - Tidak ada bahasa meta / sistem
     */
    const finalPrompt = `
Konteks waktu: ${currentDate}

Pertanyaan:
"${prompt}"

Gaya jawaban:
- Jawab langsung inti pertanyaan
- Sertakan penjelasan singkat agar informatif
- Gunakan minimal 2–3 kalimat yang saling menyambung
- Bahasa Indonesia alami, rapi, dan profesional
- Jangan gunakan kalimat meta atau satu kata saja

Berikan jawaban yang lengkap dan enak dibaca.
`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: finalPrompt }],
            },
          ],
          generationConfig: {
            temperature: 0.3, // natural tapi tetap stabil
            maxOutputTokens: 900,
          },
        }),
      }
    );

    const raw = await response.text();
    const data = JSON.parse(raw);

    if (data.error) {
      return NextResponse.json({ error: data.error.message }, { status: 500 });
    }

    const result =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "Tidak ada jawaban.";

    return NextResponse.json({ result });
  } catch (error) {
    console.error("GEMINI API ERROR:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server" },
      { status: 500 }
    );
  }
}
