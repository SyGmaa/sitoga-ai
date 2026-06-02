import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { google } from "@ai-sdk/google";
import { streamText, generateText, convertToModelMessages, stepCountIs } from "ai";
import { agentV3Tools } from "@/lib/agentV3Tools";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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

    const SYSTEM_PROMPT = `Sebagai Agent Medis Botani ReAct (Relational GraphRAG) SITOBAT-AI.
Kamu mengevaluasi keluhan dengan sangat analitis dengan menelusuri Graph Database menggunakan tool gabungan "AnalisisDiagnosaMedisHibrida".
Jika keluhan user disampaikan dalam bahasa asing (seperti Bahasa Inggris), kamu WAJIB menerjemahkan gejala/keluhan tersebut ke Bahasa Indonesia terlebih dahulu sebelum memanggil tool, karena basis data di dalam sistem semuanya menggunakan istilah Bahasa Indonesia.

PENTING/CRITICAL: Kamu WAJIB membalas pesan pengguna menggunakan bahasa yang sama persis dengan bahasa yang digunakan oleh pengguna dalam keluhannya (baik Bahasa Inggris, Bahasa Indonesia, bahasa daerah, maupun bahasa asing lainnya). Abaikan fakta bahwa pesan pembuka asisten ("Ceritakan keluhan medis Anda...") ditulis dalam Bahasa Indonesia; jika pengguna merespon dalam Bahasa Inggris, kamu harus langsung membalas penuh dalam Bahasa Inggris. Kamu harus menerjemahkan kesimpulan hasil analisis akhirmu ke bahasa pengguna.

IKUTI LANGKAH INI DENGAN SANGAT KETAT:
1. Panggil tool "AnalisisDiagnosaMedisHibrida" dengan keluhan pengguna (dan kondisi medisnya jika ada). Tool ini akan secara instan mengembalikan gejala terdeteksi, kandidat penyakit, status validasi gejala wajib, dan filter kontraindikasi tanaman obat.
2. Evaluasi hasil dari "AnalisisDiagnosaMedisHibrida":
   - Jika hasil validasi penyakit menyatakan 'sah: false' (penyakit belum pasti/batal diverifikasi), kamu TETAP BOLEH menyebutkan diagnosis penyakit tersebut sebagai KEMUNGKINAN AWAL/KEMUNGKINAN KECIL. Namun, kamu WAJIB menyampaikan secara jelas kepada pengguna bahwa diagnosis ini belum diverifikasi sepenuhnya karena beberapa gejala wajib tidak dialami, DAN kamu WAJIB secara aktif bertanya kepada pengguna apakah mereka mengalami gejala-gejala wajib yang tidak dialami tersebut (sebutkan secara spesifik gejala wajib apa saja yang belum terpenuhi dari hasil 'gejalaHilang' dan tanyakan apakah pengguna merasakannya) untuk memastikan kondisi mereka.
   - Jika merekomendasikan resep tanaman, pastikan membuang tanaman yang terlarang/dilarang keras (dari 'pesanDilarang' atau 'tanamanTerlarangIds').
   - Tanaman yang memiliki peringatan/tingkat risiko 'HATI-HATI' ('pesanPeringatan' atau 'tanamanPeringatanIds') TETAP BOLEH direkomendasikan, tetapi kamu WAJIB menuliskan catatan peringatan/edukasi kontraindikasi tersebut secara eksplisit kepada pengguna dalam jawaban akhirmu.
3. TANYAKAN KONDISI MEDIS SECARA PROAKTIF: Jika pengguna belum menyebutkan adanya kondisi medis khusus (seperti hamil, menyusui, darah tinggi/hipertensi, maag, gangguan ginjal/jantung, dll.) dalam riwayat percakapan, kamu WAJIB secara proaktif menanyakan kepada pengguna apakah mereka memiliki salah satu kondisi tersebut sebelum atau bersamaan dengan penyampaian hasil rekomendasi tanaman obat. Hal ini sangat penting agar pengguna dapat mengonfirmasinya jika saja mereka lupa menyebutkan kondisi medis tersebut di awal keluhan. Jika pengguna merespons dengan suatu kondisi medis, lakukan penyaringan ulang menggunakan tool 'AnalisisDiagnosaMedisHibrida' pada giliran percakapan berikutnya dengan parameter kondisiKesehatanPasien yang sesuai.
4. Rangkai bukti konklusimu ke pengguna. Jelaskan apa yang kamu temukan dari database kepada pasien dengan ramah menggunakan bahasa yang sama dengan keluhan mereka.
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
         console.log("[V3 GraphRAG] Stream Finished:", { 
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
               `[${new Date().toISOString()}] ${title}:\n${JSON.stringify(data, null, 2)}\n\n`
             );
           } catch (e) {
             console.error("Failed to write to debug log:", e);
           }
         };

         try {
           // 1. Dapatkan keluhan pengguna dari pesan terakhir user
           const lastUserMsg = [...cleanMessages].reverse().find((m: any) => m.role === "user");
           const keluhanPengguna = lastUserMsg?.content || lastUserMsg?.parts?.find((p: any) => p.type === "text")?.text || "";

           logDebug("1. Keluhan Pengguna", { keluhanPengguna });

           if (!keluhanPengguna) {
             logDebug("Skipped", "Keluhan pengguna kosong");
             return;
           }

           // 2. Ekstrak data dari toolResults
           const toolResults = (event.toolResults || []) as any[];
           logDebug("2. Tool Results Raw", toolResults);

           let gejalaTerdeteksi: string[] = [];
           let kandidatPenyakit: any[] = [];
           let finalPenyakit: any = null;
           let tanamanTerlarangIds: string[] = [];

           // Periksa apakah ada hasil dari AnalisisDiagnosaMedisHibrida
           const hibridaResult = toolResults.find(t => t.toolName === "AnalisisDiagnosaMedisHibrida");
           if (hibridaResult && hibridaResult.result) {
             const res = hibridaResult.result;
             if (Array.isArray(res.gejala)) {
               gejalaTerdeteksi = res.gejala.map((g: any) => g.nama || "").filter(Boolean);
             }
             if (Array.isArray(res.kandidat)) {
               kandidatPenyakit = res.kandidat;
               
               // Cari kandidat yang sah
               const sahPenyakit = kandidatPenyakit.find(k => k.sah === true);
               finalPenyakit = sahPenyakit || kandidatPenyakit[0] || null;

               if (finalPenyakit && Array.isArray(finalPenyakit.tanamanTerlarangIds)) {
                 tanamanTerlarangIds = finalPenyakit.tanamanTerlarangIds;
               }
             }
           } else {
             // Fallback/Legacy parsing untuk tool individu lama
             const gejalaToolResult = toolResults.find(t => t.toolName === "EkstrakDanCariGejala");
             if (gejalaToolResult && gejalaToolResult.result && Array.isArray(gejalaToolResult.result.gejala)) {
               gejalaTerdeteksi = gejalaToolResult.result.gejala.map((g: any) => g.nama || g.namaLokal || "").filter(Boolean);
             }

             const grafToolResult = toolResults.find(t => t.toolName === "TelusuriGrafPenyakit");
             if (grafToolResult && grafToolResult.result && Array.isArray(grafToolResult.result.kandidat)) {
               kandidatPenyakit = grafToolResult.result.kandidat;
             }

             const validasiToolResults = toolResults.filter(t => t.toolName === "ValidasiGejalaWajib");
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

             const filterToolResult = toolResults.find(t => t.toolName === "FilterKontraindikasiMurni");
             if (filterToolResult && filterToolResult.result && Array.isArray(filterToolResult.result.tanamanTerlarangIds)) {
               tanamanTerlarangIds = filterToolResult.result.tanamanTerlarangIds;
             }
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

           // Filter tanaman yang direkomendasikan
           const rekomendasiTanamanRaw = finalPenyakit ? (finalPenyakit.tanamanObat || []) : [];
           const rekomendasiTanaman = rekomendasiTanamanRaw
             .filter((t: any) => !tanamanTerlarangIds.includes(t.id))
             .map((t: any) => ({
               id: t.id,
               nama: t.nama
             }));

           // Bersihkan percakapan agar tidak ada object/parts mentah, hanya string content
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

           // Bentuk payload hasilDiagnosa
           const hasilDiagnosa = {
             nama_penyakit: namaPenyakit,
             gejala_terdeteksi: gejalaTerdeteksi,
             rekomendasi_tanaman: rekomendasiTanaman,
             tanaman_obat: rekomendasiTanaman, // kompatibilitas dengan dashboard riwayat
             penjelasan_singkat: event.text || "",
             percakapan: percakapan
           };

           logDebug("4. Payload to Save", {
             namaPenyakit,
             rekomendasiTanamanCount: rekomendasiTanaman.length,
             percakapanCount: percakapan.length
           });

           // 3. Simpan ke database
           const saved = await prisma.riwayatDiagnosa.create({
             data: {
               keluhanPengguna,
               hasilDiagnosa
             }
           });
           logDebug("5. DB Save Success", { id: saved.id });
           console.log("[V3 GraphRAG] Berhasil menyimpan riwayat diagnosa:", namaPenyakit);
         } catch (dbError: any) {
           logDebug("ERROR", { message: dbError.message, stack: dbError.stack });
           console.error("[V3 GraphRAG] Gagal menyimpan riwayat diagnosa ke database:", dbError);
         }
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
