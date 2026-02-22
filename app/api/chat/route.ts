import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { google } from "@ai-sdk/google";
import { streamObject } from "ai";
import { z } from "zod";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Dynamic provider: bisa di-override dari UI, fallback ke .env
function getModel(clientProvider?: string, clientModel?: string) {
  const validProviders = ["google", "openrouter"];
  const provider = (clientProvider && validProviders.includes(clientProvider)) 
    ? clientProvider 
    : (process.env.AI_PROVIDER || "google");
  const modelName = clientModel || process.env.AI_MODEL || "gemini-2.5-flash";

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
    const latestMessage = messages[messages.length - 1].content;

    // 1. Fetch RAG Context from Prisma
    // Fetch Penyakit and Gejala relations
    const penyakitData = await prisma.penyakit.findMany({
      include: {
        gejala: {
          include: {
            gejala: true,
          },
        },
        tanamanObat: {
          include: {
            tanaman: {
              select: {
                id: true,
                namaLokal: true,
                namaLatin: true,
                khasiatUtama: true,
              },
            },
          },
        },
      },
    });

    // Format the knowledge base into a clear string for the LLM prompt
    const knowledgeBase = penyakitData
      .map((p) => {
        const gejalaList = p.gejala.map((g) => g.gejala.nama).join(", ");
        const tanamanList = p.tanamanObat
          .map((t) => `${t.tanaman.namaLokal} (ID: ${t.tanaman.id})`)
          .join(", ");
        return `Penyakit: ${p.nama}\nGejala: ${gejalaList}\nTanaman Pengobatan yang direkomendasikan beserta ID-nya: ${tanamanList || "Belum ada data tanaman"}`;
      })
      .join("\n\n---\n\n");

    const systemPrompt = `Anda adalah HerbalAI, seorang ahli botani dan pengobatan herbal profesional.
Tugas Anda adalah mendiagnosa potensi masalah kesehatan pengguna berdasarkan gejala yang disebutkan, dan **HANYA** mencocokkannya dengan database penyakit berikut.

DATABASE PENGETAHUAN KAMI HARI INI:
${knowledgeBase}

INSTRUKSI PENTING:
1. Analisis gejala yang diberikan pengguna.
2. Cari "Penyakit" dalam database di atas yang memiliki "Gejala" paling cocok.
3. Kembalikan array objek berisi ID dan nama tanaman dari bidang "Tanaman Pengobatan yang direkomendasikan beserta ID-nya". HANYA GUNAKAN DATA YANG TERDAPAT PADA TEKS DI ATAS! Jangan mengarang ID atau nama tanaman.
4. Jika gejala tidak cocok dengan penyakit apapun di database, kembalikan nama_penyakit "Tidak Diketahui/Di luar basis data kami", gejala_terdeteksi dengan gejala yang disebutkan, dan rekomendasi_tanaman kosong [].

Pesan pengguna saat ini: "${latestMessage}"`;

    // 2. Generate Structured Output with Vercel AI SDK
    const result = streamObject({
      model: getModel(provider, model),
      system: systemPrompt,
      prompt: latestMessage,
      schema: z.object({
        nama_penyakit: z
          .string()
          .describe(
            'Nama penyakit yang paling cocok dengan gejala dari database, atau "Tidak Diketahui"',
          ),
        gejala_terdeteksi: z
          .array(z.string())
          .describe(
            "Daftar gejala spesifik yang berhasil dianalisis dari input pengguna",
          ),
        rekomendasi_tanaman: z
          .array(
            z.object({
              id: z.string().describe("ID unik tanaman (cuid)"),
              nama: z.string().describe("Nama lokal tanaman"),
            }),
          )
          .describe(
            "Array berisi objek tanaman yang terkait dengan penyakit tersebut BERDASARKAN SYSTEM PROMPT.",
          ),
        penjelasan_singkat: z
          .string()
          .describe(
            "Penjelasan singkat dan ramah (max 2 kalimat) menyapa pengguna dan menjelaskan diagnosis awal.",
          ),
      }),
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("Diagnosis Error:", error);
    return Response.json(
      { error: "Terjadi kesalahan pada server AI." },
      { status: 500 },
    );
  }
}
