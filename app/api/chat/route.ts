import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { google } from "@ai-sdk/google";
import { streamText, tool, convertToModelMessages } from "ai";
import { z } from "zod";
import { PrismaClient } from "@prisma/client";
import { getDiagnosticContext } from "@/lib/diagnosticService";

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

    const systemPrompt = `Anda adalah HerbalAI, seorang ahli botani dan pengobatan herbal profesional.
Tugas Anda adalah mendiagnosa potensi masalah kesehatan pengguna menggunakan interaksi multi-turn.
ATURAN WAJIB (System Instructions):
1. Panggil tool 'cariDataPenyakit' SETIAP KALI user menyebutkan keluhan/gejala baru. LANGSUNG EKSEKUSI TOOL BERSAMAAN DENGAN TEKS BALASAN ANDA! JANGAN PERNAH menunda panggilan tool ke pesan berikutnya. (Misalnya: Jangan hanya membalas "Bentar ya, saya carikan..." lalu berhenti. Anda HARUS memanggil tool di balasan yang sama!).
2. Jika tool 'cariDataPenyakit' menghasilkan data KOSONG (tidak ada penyakit di database), JANGAN katakan Anda mengalami kendala teknis. Langsung panggil tool 'rujukKeDokter' dan katakan gejala tersebut mungkin di luar database herbal.
3. JIKA menemukan penyakit potensial namun GEJALA WAJIB BELUM TERPENUHI, tanyakan secara langsung kepada pengguna menggunakan tool 'tanyaTambahanKondisi'.
4. JIKA GEJALA SUDAH JELAS (dari keluhan atau jawaban pertanyaan spesifik Anda sebelumnya), ANDA DIHARUSKAN LANGSUNG MEMANGGIL TOOL 'sajikanDiagnosaFinal' untuk mengakhiri konsultasi.
5. Panggil 'rujukKeDokter' JIKA DAN HANYA JIKA kondisinya kritis atau diluar database.

INGAT: Setiap balasan Anda WAJIB berisi teks sapaan DAN eksekusi tool jika diperlukan. JANGAN SEKADAR MENGEKSEKUSI TOOL LALU KOSONG. DAN JANGAN HANYA MEMBALAS TEKS TAPI LUPA MEMANGGIL TOOL.`;

    const result = streamText({
      model: getModel(provider, model),
      system: systemPrompt,
      messages: await convertToModelMessages(messages),
      // @ts-ignore
      maxSteps: 5,
      onFinish: (event) => {
         console.log("[DEBUG] Stream Finished:", { 
             finishReason: event.finishReason, 
             text: event.text,
             toolCalls: event.toolCalls?.map(t => t.toolName)
         });
      },
      tools: {
        cariDataPenyakit: tool({
          description: "Mencari data penyakit, gejala wajib, dan rekomendasi tanaman dari database berdasarkan sekumpulan gejala.",
          parameters: z.object({
            gejala_disebutkan: z.array(z.string()).describe("Daftar gejala yang disebutkan oleh pengguna (contoh: ['mual', 'pusing'])."),
            isHamil: z.boolean().optional().describe("Set true jika pengguna sudah mengkonfirmasi sedang hamil. Default false jika belum ditanyakan."),
          }),
          // @ts-ignore - Bypass AI SDK inference issue with Zod
          execute: async (args: { gejala_disebutkan: string[], isHamil?: boolean }) => {
            const data = await getDiagnosticContext(args.gejala_disebutkan, args.isHamil || false);
            return data;
          }
        }),
        rujukKeDokter: tool({
          description: "Rujuk pengguna ke dokter jika gejala terlalu tidak jelas, berbahaya, atau di luar database AI.",
          parameters: z.object({
            alasan: z.string().describe("Alasan medis singkat mengapa pengguna harus ke dokter.")
          }),
          // @ts-ignore
          execute: async (args: { alasan: string }) => {
             return { message: "Pengguna telah dirujuk ke dokter", alasan: args.alasan };
          }
        }),
        sajikanDiagnosaFinal: tool({
          description: "Menyajikan hasil diagnosa akhir beserta resep herbal. Panggil fungsi ini SAAT ANDA 100% YAKIN, dan akhiri sesi.",
          parameters: z.object({
            nama_penyakit: z.string().describe("Nama penyakit dari database"),
            gejala_terdeteksi: z.array(z.string()).describe("Daftar gejala yang dicocokkan"),
            rekomendasi_tanaman: z.array(z.object({
              id: z.string(),
              nama: z.string()
            })).describe("Daftar tanaman pengobatan (id dan nama lokal)."),
            penjelasan_singkat: z.string().describe("Penjelasan diagnosis dan pengobatan secara ramah"),
          }),
          // @ts-ignore
          execute: async (data: any) => {
             // Audit Trail logging (Phase 5)
             const lastUserMsg = messages.reverse().find((m: any) => m.role === "user");
             if (lastUserMsg && lastUserMsg.content) {
                try {
                  await prisma.riwayatDiagnosa.create({
                    data: {
                      keluhanPengguna: lastUserMsg.content,
                      hasilDiagnosa: data
                    }
                  });
                } catch(e) { console.error("Gagal simpan log:", e) }
             }
             return data;
          }
        }),
        tanyaTambahanKondisi: tool({
          description: "[OPSIONAL] Minta saya untuk bertanya kepada pengguna secara interaktif tentang suatu kondisi medis",
          parameters: z.object({
            pertanyaan: z.string().describe("Pertanyaan klarifikasi (misal: 'Apakah ibu hamil?').")
          }),
          // @ts-ignore
          execute: async (args: { pertanyaan: string }) => {
            return { aksi: "Sudah diinstruksikan. Sampaikan pertanyaan ini ke user dengan pesan teksmu sendiri." };
          }
        })
      }
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("Diagnosis Error:", error);
    return Response.json(
      { error: "Terjadi kesalahan pada server AI." },
      { status: 500 },
    );
  }
}
