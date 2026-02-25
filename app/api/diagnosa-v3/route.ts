import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { google } from "@ai-sdk/google";
import { streamText, generateText, convertToModelMessages, stepCountIs } from "ai";
import { agentV3Tools } from "@/lib/agentV3Tools";

// Dynamic provider to maintain compatibility with the user's setup
function getModel(clientProvider?: string, clientModel?: string) {
  const validProviders = ["google", "openrouter"];
  const provider = (clientProvider && validProviders.includes(clientProvider)) 
    ? clientProvider 
    : (process.env.AI_PROVIDER || "google");
  const modelName = clientModel || process.env.AI_MODEL || "gemini-2.5-flash"; // Recommended for tool calling

  if (provider === "openrouter") {
    const openrouter = createOpenRouter({
      apiKey: process.env.OPENROUTER_API_KEY,
    });
    return openrouter(modelName);
  }

  return google(modelName);
}

export const maxDuration = 600;

export async function POST(req: Request) {
  try {
    const { messages, provider, model } = await req.json();

    const SYSTEM_PROMPT = `Sebagai Agent Medis Botani ReAct (Relational GraphRAG) Sitoga AI.
Kamu mengevaluasi keluhan dengan sangat analitis dengan menelusuri Graph Database secara berurutan.

IKUTI LANGKAH INI DENGAN SANGAT KETAT:
1. Ekstrak KATA KUNCI utama dari keluhan user, lalu pakai tool "EkstrakDanCariGejala".
2. Masukkan array ID Gejala hasil pencarian ke tool "TelusuriGrafPenyakit".
3. Validasi ID Penyakit hasil penelusuran dengan tool "ValidasiGejalaWajib". JANGAN merekomendasikan diagnosis jika hasil validasinya menyatakan 'sah: false'.
4. Jika merekomendasikan resep tanaman, kamu HARUS memeriksanya dengan tool "FilterKontraindikasiMurni" beserta kondisi medis pasien jika ada (misal: Hamil, Darah Tinggi). JANGAN memberi ramuan sebelum kamu membersihkannya dari kontraindikasi.
5. Teruslah berpikir mandiri jika menemukan jalan buntu (loop), lalu rangkai bukti konklusimu ke pengguna. Jelaskan apa yang kamu temukan dari database kepada pasien dengan ramah.
`;

    // Pastikan payload memiliki array kosong atau 'parts' untuk property yang di-map secara buta oleh convertToModelMessages di SDK v6
    const cleanMessages = messages.map((m: any) => ({
      ...m,
      id: m.id || crypto.randomUUID(),
      toolInvocations: m.toolInvocations || [],
      parts: m.parts || (m.content ? [{ type: 'text', text: m.content }] : [])
    }));

    const result = streamText({
      model: getModel(provider, model),
      system: SYSTEM_PROMPT,
      messages: await convertToModelMessages(cleanMessages),
      stopWhen: stepCountIs(7), // Pengganti maxSteps di SDK AI V5/V6 untuk Agent Loop
      tools: agentV3Tools,
      onFinish: (event) => {
         console.log("[V3 GraphRAG] Stream Finished:", { 
             finishReason: event.finishReason, 
             toolCalls: event.toolCalls?.map(t => t.toolName)
         });
      },
    });

    return result.toUIMessageStreamResponse();

  } catch (error: any) {
    console.error("Diagnosis V3 Error:", error);
    return Response.json(
      { error: "Terjadi kesalahan pada server AI V3.", details: error.stack || error.toString() },
      { status: 500 },
    );
  }
}
