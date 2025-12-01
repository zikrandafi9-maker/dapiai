import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt tidak boleh kosong" },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "API Key tidak ditemukan di .env" },
        { status: 500 }
      );
    }

    // ================================
    // ➤ Tambahan: ambil tanggal sekarang
    // ================================
    const currentDate = new Date().toLocaleString("id-ID", {
      dateStyle: "full",
      timeStyle: "medium",
      timeZone: "Asia/Jakarta",
    });

    // Gabungkan tanggal + prompt user
    const finalPrompt = `Tanggal dan waktu saat ini: ${currentDate}.
    
Pengguna bertanya: ${prompt}`;
    // ================================
    // ➤ Selesai tambahan
    // ================================

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
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
        }),
      }
    );

    const raw = await response.text();
    console.log("RAW RESPONSE:", raw);

    const data = JSON.parse(raw);

    if (data.error) {
      return NextResponse.json({ error: data.error.message }, { status: 500 });
    }

    const output =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Tidak ada jawaban dari Gemini.";

    return NextResponse.json({ result: output });
  } catch (err) {
    console.error("API ERROR:", err);
    return NextResponse.json(
      { error: "Gagal memproses permintaan" },
      { status: 500 }
    );
  }
}
