import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { google } from "@ai-sdk/google";
import { streamText, convertToModelMessages, stepCountIs } from "ai";
import { agentV3Tools } from "@/lib/agentV3Tools";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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

    const SYSTEM_PROMPT = `Sebagai Agent Medis Botani ReAct (Relational GraphRAG) SITOBAT-AI.
Kamu mengevaluasi keluhan dengan sangat analitis dengan menelusuri Graph Database secara berurutan.
Jika keluhan user disampaikan dalam bahasa asing (seperti Bahasa Inggris), kamu WAJIB menerjemahkan gejala/keluhan tersebut ke Bahasa Indonesia terlebih dahulu sebelum memanggil alat pencarian gejala, karena basis data di dalam sistem semuanya menggunakan istilah Bahasa Indonesia.

PENTING/CRITICAL: Kamu WAJIB membalas pesan pengguna menggunakan bahasa yang sama persis dengan bahasa yang digunakan oleh pengguna dalam keluhannya (baik Bahasa Inggris, Bahasa Indonesia, bahasa daerah, maupun bahasa asing lainnya). Abaikan fakta bahwa pesan pembuka asisten ("Ceritakan keluhan medis Anda...") ditulis dalam Bahasa Indonesia; jika pengguna merespon dalam Bahasa Inggris, kamu harus langsung membalas penuh dalam Bahasa Inggris. Jangan gunakan bahasa Indonesia jika pengguna mengirimkan keluhan dalam bahasa Inggris atau bahasa lainnya, meskipun istilah database atau instruksi sistem ini dalam bahasa Indonesia. Kamu harus menerjemahkan kesimpulan hasil analisis akhirmu ke bahasa pengguna.

IKUTI LANGKAH INI DENGAN SANGAT KETAT (ALUR MULTI-STEP REACY):
1. Ekstrak KATA KUNCI utama dari keluhan user (dalam bentuk string yang dipisah koma seperti 'kulit, melepuh'). WAJIB pakai tool "EkstrakDanCariGejala" dan isi parameter 'keywords' dengan string tersebut. Jangan mengirim object kosong \`{}\`.
2. Masukkan ID Gejala hasil pencarian ke tool "TelusuriGrafPenyakit" (dalam bentuk array of strings jika lebih dari satu, ke dalam parameter 'id_gejala_array'). Jangan mengirim object kosong \`{}\`.
3. Validasi ID Penyakit hasil penelusuran dengan tool "ValidasiGejalaWajib". Jika hasil validasi menyatakan 'sah: false' (penyakit belum pasti/batal diverifikasi), kamu TETAP BOLEH menyebutkan diagnosis penyakit tersebut sebagai KEMUNGKINAN AWAL/KEMUNGKINAN KECIL. Namun, kamu WAJIB menyampaikan secara jelas kepada pengguna bahwa diagnosis ini belum diverifikasi sepenuhnya karena beberapa gejala wajib tidak dialami, DAN kamu WAJIB secara aktif bertanya kepada pengguna apakah mereka mengalami gejala-gejala wajib yang tidak dialami tersebut (sebutkan secara spesifik gejala wajib apa saja yang belum terpenuhi dari hasil 'gejalaHilang' dan tanyakan apakah pengguna merasakannya) untuk memastikan kondisi mereka.
4. Jika merekomendasikan resep tanaman, kamu HARUS memeriksanya dengan tool "FilterKontraindikasiMurni" beserta kondisi medis pasien jika ada (misal: Hamil, Darah Tinggi).
   - Tanaman yang tercantum dalam 'pesanDilarang' atau 'tanamanTerlarangIds' (tingkat risiko BERBAHAYA) DILARANG KERAS untuk direkomendasikan. Kamu wajib membuang tanaman ini dari daftar resep/rekomendasi.
   - Tanaman yang tercantum dalam 'pesanPeringatan' atau 'tanamanPeringatanIds' (tingkat risiko HATI-HATI) TETAP BOLEH direkomendasikan, tetapi kamu WAJIB menuliskan catatan peringatan/edukasi kontraindikasi tersebut secara eksplisit kepada pengguna dalam jawaban akhirmu.
5. TANYAKAN KONDISI MEDIS SECARA PROAKTIF: Jika pengguna belum menyebutkan adanya kondisi medis khusus (seperti hamil, menyusui, darah tinggi/hipertensi, maag, gangguan ginjal/jantung, dll.) dalam riwayat percakapan, kamu WAJIB secara proaktif menanyakan kepada pengguna apakah mereka memiliki salah satu kondisi tersebut sebelum atau bersamaan dengan penyampaian hasil rekomendasi tanaman obat. Hal ini sangat penting agar pengguna dapat mengonfirmasinya jika saja mereka lupa menyebutkan kondisi medis tersebut di awal keluhan. Jika pengguna merespons dengan suatu kondisi medis, lakukan penyaringan ulang menggunakan tool 'FilterKontraindikasiMurni' pada giliran percakapan berikutnya.
6. Teruslah berpikir mandiri jika menemukan jalan buntu (loop), lalu rangkai bukti konklusimu ke pengguna. Jelaskan apa yang kamu temukan dari database kepada pasien dengan ramah. Kamu WAJIB membalas menggunakan bahasa yang sama persis dengan bahasa yang digunakan oleh pengguna dalam keluhannya (baik Bahasa Inggris, Bahasa Indonesia, bahasa daerah, maupun bahasa asing lainnya).
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
      onFinish: async (event) => {
         console.log("[V3-Step GraphRAG] Stream Finished:", { 
             finishReason: event.finishReason, 
             toolCalls: event.toolCalls?.map(t => t.toolName)
         });

         const fs = require("fs");
         const path = require("path");
         const debugLogPath = path.join(process.cwd(), "diagnosa-v3-debug.log");
         
         const logDebug = (title: string, data: any) => {
           try {
             fs.appendFileSync(
               debugLogPath,
               `[${new Date().toISOString()}] ${title} (Multi-Step):\n${JSON.stringify(data, null, 2)}\n\n`
             );
           } catch (e) {
             console.error("Failed to write to debug log:", e);
           }
         };

         try {
           const lastUserMsg = [...cleanMessages].reverse().find((m: any) => m.role === "user");
           const keluhanPengguna = lastUserMsg?.content || lastUserMsg?.parts?.find((p: any) => p.type === "text")?.text || "";

           logDebug("1. Keluhan Pengguna", { keluhanPengguna });

           if (!keluhanPengguna) {
             logDebug("Skipped", "Keluhan pengguna kosong");
             return;
           }

           const toolResults = (event.toolResults || []) as any[];
           logDebug("2. Tool Results Raw", toolResults);

           let gejalaTerdeteksi: string[] = [];
           const gejalaToolResult = toolResults.find(t => t.toolName === "EkstrakDanCariGejala");
           if (gejalaToolResult && gejalaToolResult.result && Array.isArray(gejalaToolResult.result.gejala)) {
             gejalaTerdeteksi = gejalaToolResult.result.gejala.map((g: any) => g.nama || g.namaLokal || "").filter(Boolean);
           }

           let kandidatPenyakit: any[] = [];
           const grafToolResult = toolResults.find(t => t.toolName === "TelusuriGrafPenyakit");
           if (grafToolResult && grafToolResult.result && Array.isArray(grafToolResult.result.kandidat)) {
             kandidatPenyakit = grafToolResult.result.kandidat;
           }

           const validasiToolResults = toolResults.filter(t => t.toolName === "ValidasiGejalaWajib");
           let finalPenyakit: any = null;

           if (validasiToolResults.length > 0) {
             const sahValidation = validasiToolResults.find(v => v.result && v.result.sah === true);
             const chosenValidation = sahValidation || validasiToolResults[validasiToolResults.length - 1];
             const validatedPenyakitId = chosenValidation.args?.penyakitId;

             if (validatedPenyakitId) {
               finalPenyakit = kandidatPenyakit.find(k => k.id === validatedPenyakitId);
             }
           }

           if (!finalPenyakit && kandidatPenyakit.length > 0) {
             finalPenyakit = kandidatPenyakit[0];
           }

           logDebug("3. Parsed Data", {
             gejalaTerdeteksi,
             kandidatPenyakitCount: kandidatPenyakit.length,
             hasFinalPenyakit: !!finalPenyakit,
             finalPenyakitName: finalPenyakit?.nama
           });

           if (!finalPenyakit && gejalaTerdeteksi.length === 0) {
             logDebug("Skipped", "Tidak ada penyakit terdiagnosa dan tidak ada gejala terdeteksi");
             return;
           }

           const namaPenyakit = finalPenyakit ? (finalPenyakit.nama || "Tidak diketahui") : "Tidak diketahui";

           let tanamanTerlarangIds: string[] = [];
           const filterToolResult = toolResults.find(t => t.toolName === "FilterKontraindikasiMurni");
           if (filterToolResult && filterToolResult.result && Array.isArray(filterToolResult.result.tanamanTerlarangIds)) {
             tanamanTerlarangIds = filterToolResult.result.tanamanTerlarangIds;
           }

           const rekomendasiTanamanRaw = finalPenyakit ? (finalPenyakit.tanamanObat || []) : [];
           const rekomendasiTanaman = rekomendasiTanamanRaw
             .filter((t: any) => !tanamanTerlarangIds.includes(t.id))
             .map((t: any) => ({
               id: t.id,
               nama: t.nama
             }));

           const percakapan = [
             ...cleanMessages.map((m: any) => ({
               role: m.role,
               content: m.content || m.parts?.find((p: any) => p.type === "text")?.text || ""
             })),
             {
               role: "assistant",
               content: event.text || ""
             }
           ].filter(m => m.content && m.content.trim() !== "");

           const hasilDiagnosa = {
             nama_penyakit: namaPenyakit,
             gejala_terdeteksi: gejalaTerdeteksi,
             rekomendasi_tanaman: rekomendasiTanaman,
             tanaman_obat: rekomendasiTanaman,
             penjelasan_singkat: event.text || "",
             percakapan: percakapan,
             mode_diagnosa: "V3_MULTI_STEP_OPTIMIZED"
           };

           const saved = await prisma.riwayatDiagnosa.create({
             data: {
               keluhanPengguna,
               hasilDiagnosa
             }
           });
           logDebug("5. DB Save Success", { id: saved.id });
           console.log("[V3-Step GraphRAG] Berhasil menyimpan riwayat diagnosa:", namaPenyakit);
         } catch (dbError: any) {
           logDebug("ERROR", { message: dbError.message, stack: dbError.stack });
           console.error("[V3-Step GraphRAG] Gagal menyimpan riwayat diagnosa:", dbError);
         }
      },
    });

    return result.toUIMessageStreamResponse();

  } catch (error: any) {
    console.error("Diagnosis V3 Step Error:", error);
    return Response.json(
      { error: "Terjadi kesalahan pada server AI V3 Step.", details: error.stack || error.toString() },
      { status: 500 },
    );
  }
}
