import { PrismaClient } from "@prisma/client";
import { tool } from "ai";
import { z } from "zod";

const prisma = new PrismaClient();

// 1. Tool: EkstrakDanCariGejala
export const EkstrakDanCariGejala = tool({
  description:
    "Mencari rekam data gejala di database menggunakan kata kunci (keywords) yang diekstrak dari keluhan user.",
  parameters: z.object({
    keywords: z
      .array(z.string())
      .describe(
        "Daftar kata kunci gejala (contoh: ['mual', 'pusing', 'panas'])",
      ),
  }),
  // @ts-ignore
  execute: async ({ keywords }: { keywords: string[] }) => {
    try {
      if (!keywords || keywords.length === 0)
        return { message: "Tidak ada kata kunci yang diberikan." };

      const allResults: any[] = [];

      for (const keyword of keywords) {
        // Melakukan penelusuran string toleran (Full-Text Search) menggunakan contains dan insensitive
        const hasil = await prisma.gejala.findMany({
          where: {
            nama: {
              contains: keyword,
              mode: "insensitive",
            },
          },
          select: { id: true, nama: true }, // Limit payload LLM (Phase 5 Token Efficiency)
        });
        allResults.push(...hasil);
      }

      // Hapus duplikat ID gejala jika user mengulang kata yang mengarah ke ID yang sama
      const uniqueResults = Array.from(
        new Map(allResults.map((item) => [item.id, item])).values(),
      );

      return {
        message: "Data Gejala Ditemukan",
        gejala: uniqueResults,
      };
    } catch (error: any) {
      console.error("EkstrakDanCariGejala Error:", error);
      return { message: "Terjadi kesalahan internal saat mencari gejala." };
    }
  },
});

// 2. Tool: TelusuriGrafPenyakit
export const TelusuriGrafPenyakit = tool({
  description:
    "Menelusuri relasi kandidat penyakit yang cocok dengan node-node Gejala yang ditemukan.",
  parameters: z.object({
    gejalaIds: z
      .array(z.string())
      .describe("Daftar ID Gejala (didapatkan dari tool EkstrakDanCariGejala)"),
  }),
  // @ts-ignore
  execute: async ({ gejalaIds }: { gejalaIds: string[] }) => {
    try {
      if (!gejalaIds || gejalaIds.length === 0)
        return { message: "Data ID Gejala kosong." };

      // Cari Penyakit yang terhubung (melalui Pivot PenyakitGejala) ke ID-ID Gejala input
      const penyakitTerkait = await prisma.penyakit.findMany({
        where: {
          gejala: {
            some: {
              gejalaId: {
                in: gejalaIds,
              },
            },
          },
        },
        include: {
          gejala: {
            select: {
              gejalaId: true,
            },
          },
        },
      });

      // Hitung skor kecocokan: jumlah gejala yang overlap antara database dan input LLM
      const penyakitDenganSkor = penyakitTerkait.map((p) => {
        const matchingGejalaIds = p.gejala.filter((g) =>
          gejalaIds.includes(g.gejalaId),
        );
        return {
          id: p.id,
          nama: p.nama,
          skor: matchingGejalaIds.length,
          // Kembalikan nama saja, jangan pulangkan deskripsi yang panjang
        };
      });

      // Urutkan berdasarkan skor tertinggi
      penyakitDenganSkor.sort((a, b) => b.skor - a.skor);

      return {
        message: "Daftar Penyakit Potensial Berdasarkan Graph",
        kandidat: penyakitDenganSkor.slice(0, 5), // Ambil Top 5 untuk hemat token LLM
      };
    } catch (error: any) {
      console.error("TelusuriGrafPenyakit Error:", error);
      return {
        message: "Terjadi kesalahan internal saat menelusuri graph penyakit.",
      };
    }
  },
});

// 3. Tool: ValidasiGejalaWajib
export const ValidasiGejalaWajib = tool({
  description:
    "Menghentikan halusinasi dengan memastikan bahwa SEMUA parameter Gejala Wajib dari sebuah penyakit benar-benar dimiliki oleh user.",
  parameters: z.object({
    penyakitId: z
      .string()
      .describe(
        "ID Penyakit Kandidat (dari TelusuriGrafPenyakit) yang ingin divalidasi",
      ),
    keluhanUserGejalaIds: z
      .array(z.string())
      .describe(
        "Daftar ID Gejala yang MEMANG dirasakan user (dari tool EkstrakDanCariGejala)",
      ),
  }),
  // @ts-ignore
  execute: async ({
    penyakitId,
    keluhanUserGejalaIds,
  }: {
    penyakitId: string;
    keluhanUserGejalaIds: string[];
  }) => {
    try {
      // Ambil seluruh gejala yang Wajib untuk penyakit ini
      const gejalaWajib = await prisma.penyakitGejala.findMany({
        where: {
          penyakitId: penyakitId,
          isGejalaWajib: true,
        },
        include: {
          gejala: {
            select: {
              nama: true,
            },
          },
        },
      });

      if (gejalaWajib.length === 0) {
        return {
          sah: true,
          message:
            "Penyakit ini tidak memiliki Gejala Wajib khusus. Validasi berhasil.",
        };
      }

      // Cek apakah semua ID dari gejalaWajib ada di dalam array keluhanUserGejalaIds
      const gejalaHilang: string[] = [];
      const gejalaWajibInput = gejalaWajib.map((g) => {
        if (!keluhanUserGejalaIds.includes(g.gejalaId)) {
          gejalaHilang.push(g.gejala.nama);
        }
        return g.gejalaId;
      });

      if (gejalaHilang.length > 0) {
        return {
          sah: false,
          message: `Diagnosis BATAL DIVERIFIKASI. Penyakit ini mensyaratkan pasien memiliki gejala: ${gejalaHilang.join(", ")} namun user tidak memilikinya dalam keluhan.`,
        };
      }

      return {
        sah: true,
        message:
          "Validasi Lulus. Semua Gejala Wajib telah terpenuhi oleh user.",
      };
    } catch (error) {
      console.error("ValidasiGejalaWajib Error:", error);
      return {
        sah: false,
        message: "Terjadi kesalahan saat memvalidasi aturan Graph Constraint.",
      };
    }
  },
});

// 4. Tool: FilterKontraindikasiMurni
export const FilterKontraindikasiMurni = tool({
  description:
    "Mencegah resepan obat berbahaya dengan mem-filter tanaman yang pantang untuk kondisi pasien (Hamil, dll).",
  parameters: z.object({
    tanamanIds: z
      .array(z.string())
      .describe(
        "Daftar ID Tanaman Obat yang ingin diresepkan untuk penyakit tersebut.",
      ),
    kondisiKesehatanPasien: z
      .array(z.string())
      .describe(
        "Kondisi kesehatan pasien (contoh: ['Hamil', 'Darah Tinggi'] atau [] jika tidak ada).",
      ),
  }),
  // @ts-ignore
  execute: async ({
    tanamanIds,
    kondisiKesehatanPasien,
  }: {
    tanamanIds: string[];
    kondisiKesehatanPasien: string[];
  }) => {
    try {
      if (!tanamanIds || tanamanIds.length === 0)
        return { tanamanYangAman: [] };

      // Asumsi: jika user tidak menyebutkan kondisi, berarti aman (atau LLM bisa dipandu bertanya)
      if (!kondisiKesehatanPasien || kondisiKesehatanPasien.length === 0) {
        return {
          aman: true,
          message:
            "Pasien tidak memiliki kondisi khusus. Cek database dilewati.",
        };
      }

      // Cari ID kondisi medis di database yang cocok string-nya secara toleran
      const kondisiDatabase = await prisma.kondisiMedis.findMany({
        where: {
          OR: kondisiKesehatanPasien.map((k) => ({
            nama: { contains: k, mode: "insensitive" },
          })),
        },
      });

      if (kondisiDatabase.length === 0) {
        return {
          aman: true,
          message:
            "Kondisi pasien spesifik tidak tercatat dalam database kontraindikasi. Resep dianggap layak uji.",
        };
      }

      const kondisiIds = kondisiDatabase.map((k) => k.id);

      // Cari Pantangan Tanaman yang bersinggungan
      const pantangan = await prisma.pantanganTanaman.findMany({
        where: {
          tanamanId: { in: tanamanIds },
          kondisiMedisId: { in: kondisiIds },
        },
        include: {
          tanaman: { select: { namaLokal: true } },
          kondisiMedis: { select: { nama: true } },
        },
      });

      if (pantangan.length > 0) {
        const peringatan = pantangan.map(
          (p) =>
            `[BAHAYA - ${p.tingkatRisiko}] Tanaman '${p.tanaman.namaLokal}' DILARANG untuk penderita '${p.kondisiMedis.nama}'. Alasan Medis: ${p.alasan}`,
        );
        return {
          aman: false,
          peringatanKeras: peringatan, // LLM harus menggunakan peringatan keras ini untuk memilah resep akhir
          message:
            "BEBERAPA TANAMAN GAGAL SENSOR KONTRAINDIKASI. HARAP JANGAN BERIKAN TANAMAN TERSEBUT KEPADA PASIEN.",
        };
      }

      return {
        aman: true,
        message: "Semua tanaman lolos sensor kontraindikasi murni.",
      };
    } catch (error) {
      console.error("FilterKontraindikasiMurni Error:", error);
      return {
        aman: false,
        message: "Sistem Pengaman Error. Jangan rekomendasikan tanaman dulu.",
      };
    }
  },
});

export const agentV3Tools = {
  EkstrakDanCariGejala,
  TelusuriGrafPenyakit,
  ValidasiGejalaWajib,
  FilterKontraindikasiMurni,
};
