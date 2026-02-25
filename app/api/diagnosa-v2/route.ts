import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";
import { runDiagnosticScoring } from "@/lib/diagnosticService";

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

export const maxDuration = 60; // Fast execution for extraction

export async function POST(req: Request) {
  try {
    const { messages, provider, model } = await req.json();

    // Map conversation into a single prompt for analysis
    const userMessage = messages.map((m: any) => `${m.role.toUpperCase()}: ${m.content}`).join("\n");

    const systemPrompt = `Kamu adalah asisten ekstraktor medis profesional. Analisis riwayat percakapan berikut dan ekstrak gejala utama serta kondisi medis khusus/penyerta dari pengguna (seperti hamil, alergi, maag, dsb).`;

    const { object } = await generateObject({
      model: getModel(provider, model),
      schema: z.object({
        gejala_terdeteksi: z
          .array(z.string())
          .describe("Ekstrak semua keluhan medis/gejala ke dalam daftar string singkat."),
        kondisi_medis_penyerta: z
          .array(z.string())
          .describe("Daftar kondisi khusus penyerta (contoh: ['hamil', 'hipertensi', 'maag']). Kosongkan bila user tidak menginformasikannya."),
        perluTindakLanjut: z
          .boolean()
          .describe("Bernilai true jika keluhannya sangat ambigu dan butuh user menjelaskan lebih detail sebelum diagnosis diberikan."),
        pesanTindakLanjut: z
          .string()
          .optional()
          .describe("Jika perluTindakLanjut true, tulis pertanyaan singkat dan ramah untuk user menggali gejala.")
      }),
      prompt: systemPrompt + "\n\nPercakapan:\n" + userMessage,
    });

    if (object.perluTindakLanjut && object.pesanTindakLanjut) {
        return Response.json({
            tipe_respons: "TINDAK_LANJUT",
            pesan: object.pesanTindakLanjut,
        });
    }

    // Call deterministic scoring engine
    const diagnosticData = await runDiagnosticScoring(
        object.gejala_terdeteksi,
        object.kondisi_medis_penyerta
    );

    return Response.json({
        tipe_respons: "DIAGNOSA_FINAL",
        data: diagnosticData
    });

  } catch (error) {
    console.error("Extraction Error:", error);
    return Response.json(
      { error: "Terjadi kesalahan pada server ekstraksi AI." },
      { status: 500 }
    );
  }
}
