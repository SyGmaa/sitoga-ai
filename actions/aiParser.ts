"use server";

import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";
import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient();

// Helper to get active AI model
async function getActiveModel() {
  const defaultModel = await prisma.aiModel.findFirst({
    where: { isDefault: true, isActive: true }
  });
  if (defaultModel) {
    return defaultModel;
  }
  const anyActive = await prisma.aiModel.findFirst({
    where: { isActive: true }
  });
  return anyActive || null;
}

function getModelInstance(provider: string, modelName: string) {
  if (provider === "openrouter") {
    const openrouter = createOpenRouter({
      apiKey: process.env.OPENROUTER_API_KEY,
    });
    return openrouter(modelName);
  }
  // Fallback to Google Gemini
  return google(modelName);
}

// Zod Schema for Vercel AI SDK generateObject
const plantParserSchema = z.object({
  namaLokal: z.string().describe("Nama lokal tanaman obat dalam bahasa Indonesia"),
  namaLatin: z.string().describe("Nama ilmiah / Latin tanaman obat"),
  deskripsi: z.string().describe("Deskripsi umum mengenai tanaman obat tersebut secara lengkap"),
  kandunganSenyawa: z.string().describe("Kandungan senyawa kimia aktif / zat berkhasiat di dalam tanaman"),
  khasiatUtama: z.string().describe("Khasiat utama medis tanaman obat tersebut"),
  resepPengolahan: z.array(z.object({
    keluhan: z.string().describe("Penyakit atau keluhan yang diobati dengan resep ini (contoh: Mual, Luka bakar ringan)"),
    bagianYangDigunakan: z.string().describe("Bagian tanaman yang digunakan (contoh: Daun muda, Rimpang segar, Bunga)"),
    caraPengolahan: z.string().describe("Langkah-langkah pembuatan ramuan obat herbal secara lengkap"),
    caraPakaiTradisional: z.string().describe("Cara penggunaan ramuan secara tradisional (contoh: Diminum hangat sedikit-sedikit)"),
    catatanKeamanan: z.string().describe("Peringatan atau catatan efek samping ramuan ini")
  })).describe("Daftar resep pengolahan ramuan obat herbal"),
  penyakitTerkait: z.array(z.object({
    nama: z.string().describe("Nama penyakit / keluhan medis yang dapat disembuhkan"),
    deskripsi: z.string().describe("Deskripsi singkat penyakit tersebut"),
    gejala: z.array(z.string()).describe("Daftar gejala-gejala umum penyakit tersebut")
  })).describe("Daftar penyakit yang dapat disembuhkan oleh tanaman ini"),
  pantanganTanaman: z.array(z.object({
    kondisiMedisNama: z.string().describe("Nama kondisi medis kontraindikasi (contoh: Hamil, Menyusui, Darah Tinggi, Maag)"),
    kondisiMedisDeskripsi: z.string().describe("Deskripsi singkat kondisi medis kontraindikasi tersebut"),
    tingkatRisiko: z.enum(["HATI-HATI", "BERBAHAYA"]).describe("Tingkat risiko penggunaan tanaman obat untuk kondisi tersebut"),
    alasan: z.string().describe("Penjelasan medis mengapa dilarang atau dibatasi")
  })).describe("Daftar kondisi medis yang dilarang/tidak dianjurkan mengonsumsi tanaman ini")
});

export type ParsedPlantData = z.infer<typeof plantParserSchema>;

export async function parsePlantTextAction(text: string) {
  try {
    const activeModel = await getActiveModel();
    const provider = activeModel?.provider || process.env.AI_PROVIDER || "google";
    const modelName = activeModel?.modelId || process.env.AI_MODEL || "gemini-2.5-flash";

    const model = getModelInstance(provider, modelName);

    const { object } = await generateObject({
      model: model,
      schema: plantParserSchema,
      prompt: `Analisis teks mengenai tanaman obat berikut dan ekstrak informasinya secara lengkap sesuai dengan skema JSON yang ditentukan.
      Teks Input:
      """
      ${text}
      """
      `,
    });

    return { success: true, data: object };
  } catch (error: any) {
    console.error("AI Parser Error:", error);
    return { success: false, error: error.message || "Gagal memproses teks dengan AI." };
  }
}

export async function saveParsedPlantAction(data: ParsedPlantData) {
  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Process Penyakit and Gejala
      const penyakitIds: string[] = [];

      for (const p of data.penyakitTerkait) {
        // Find or create Penyakit
        let penyakit = await tx.penyakit.findFirst({
          where: { nama: { equals: p.nama, mode: "insensitive" } }
        });

        if (!penyakit) {
          penyakit = await tx.penyakit.create({
            data: {
              nama: p.nama,
              deskripsi: p.deskripsi || null
            }
          });
        }

        penyakitIds.push(penyakit.id);

        // Find/create Gejala and link to Penyakit
        for (const gName of p.gejala) {
          let gejala = await tx.gejala.findFirst({
            where: { nama: { equals: gName, mode: "insensitive" } }
          });

          if (!gejala) {
            gejala = await tx.gejala.create({
              data: { nama: gName }
            });
          }

          // Check if relation already exists
          const existingPG = await tx.penyakitGejala.findUnique({
            where: {
              penyakitId_gejalaId: {
                penyakitId: penyakit.id,
                gejalaId: gejala.id
              }
            }
          });

          if (!existingPG) {
            await tx.penyakitGejala.create({
              data: {
                penyakitId: penyakit.id,
                gejalaId: gejala.id,
                isGejalaWajib: false,
                bobotGejala: 3 // Default weight
              }
            });
          }
        }
      }

      // 2. Process KondisiMedis and Pantangan
      const pantanganList: { kondisiMedisId: string; tingkatRisiko: string; alasan: string }[] = [];

      for (const pt of data.pantanganTanaman) {
        let kondisiMedis = await tx.kondisiMedis.findFirst({
          where: { nama: { equals: pt.kondisiMedisNama, mode: "insensitive" } }
        });

        if (!kondisiMedis) {
          kondisiMedis = await tx.kondisiMedis.create({
            data: {
              nama: pt.kondisiMedisNama,
              deskripsi: pt.kondisiMedisDeskripsi || null
            }
          });
        }

        pantanganList.push({
          kondisiMedisId: kondisiMedis.id,
          tingkatRisiko: pt.tingkatRisiko,
          alasan: pt.alasan
        });
      }

      // 3. Create Tanaman and link all relations (Formatting Resep into structured multi-line text)
      const newTanaman = await tx.tanaman.create({
        data: {
          namaLokal: data.namaLokal,
          namaLatin: data.namaLatin,
          deskripsi: data.deskripsi,
          kandunganSenyawa: data.kandunganSenyawa,
          khasiatUtama: data.khasiatUtama,
          resepPengolahan: {
            create: data.resepPengolahan.map((resep) => {
              const formattedLangkah = [
                `Keluhan: ${resep.keluhan}`,
                `• Bagian yang digunakan: ${resep.bagianYangDigunakan}`,
                `• Cara pengolahan: ${resep.caraPengolahan}`,
                `• Cara pakai tradisional: ${resep.caraPakaiTradisional}`,
                `• Catatan keamanan: ${resep.catatanKeamanan}`
              ].join('\n');
              return { langkah: formattedLangkah };
            })
          },
          penyakitTerkait: {
            create: penyakitIds.map((penyakitId) => ({ penyakitId }))
          },
          pantanganTanaman: {
            create: pantanganList.map((pt) => ({
              kondisiMedisId: pt.kondisiMedisId,
              tingkatRisiko: pt.tingkatRisiko,
              alasan: pt.alasan
            }))
          }
        }
      });

      return newTanaman;
    });

    revalidatePath("/admin/tanaman");
    revalidatePath("/admin/penyakit");
    revalidatePath("/admin/gejala");
    revalidatePath("/admin/kondisi-medis");
    
    return { success: true, data: result };
  } catch (error: any) {
    console.error("Save Parsed Plant Transaction Error:", error);
    return { success: false, error: error.message || "Gagal menyimpan data tanaman ke database." };
  }
}
