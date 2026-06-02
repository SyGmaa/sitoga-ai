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
      .string()
      .describe(
        "WAJIB DIISI! Daftar kata kunci gejala medis dipisahkan koma. Jika keluhan menggunakan bahasa asing (misal Inggris), kamu WAJIB menerjemahkan setiap gejala ke dalam Bahasa Indonesia terlebih dahulu sebelum menjadikannya kata kunci pencarian (karena database gejala menggunakan Bahasa Indonesia). Contoh: 'chills' menjadi 'menggigil', 'fever' menjadi 'demam', 'body temperature above normal' menjadi 'suhu tubuh meningkat'."
      ),
  }),
  // @ts-ignore
  execute: async ({ keywords }: { keywords: string }) => {
    try {
      console.log("[EkstrakDanCariGejala] Keywords received:", keywords);
      if (!keywords || keywords.trim() === "")
        return { message: "Tidak ada kata kunci yang diberikan." };

      const keywordArray = keywords.split(',').map(k => k.trim());
      const allResults: any[] = [];

      // Pecah kalimat menjadi kata-kata individu agar pencarian contains lebih fleksibel, 
      // tapi TETAP PERTAHANKAN frasa aslinya agar pencarian spesifik (seperti 'buang air kecil') tetap jalan.
      const processedKeywords = Array.from(new Set(
        keywordArray.flatMap((k: string) => {
          const words = k.split(/[\s,]+/).map((w: string) => w.trim()).filter((w: string) => w.length > 3 && !['saya', 'aku', 'kami', 'kita', 'dia', 'mereka', 'anda', 'kamu', 'ingin', 'tolong', 'bantu', 'dengan', 'yang', 'dan', 'di', 'ke', 'dari', 'atau', 'pada', 'juga'].includes(w.toLowerCase()));
          return [k.trim(), ...words]; 
        })
      ));

      // Fallback jika semua kata terfilter tapi ada keyword asli
      const finalKeywords = processedKeywords.length > 0 ? processedKeywords : keywordArray;

      const queryPromises = (finalKeywords as string[]).map((keyword) =>
        prisma.gejala.findMany({
          where: {
            nama: {
              contains: keyword,
              mode: "insensitive",
            },
          },
          select: { id: true, nama: true },
        })
      );
      const resultsArray = await Promise.all(queryPromises);
      allResults.push(...resultsArray.flat());

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
    id_gejala_array: z
      .array(z.string())
      .describe("WAJIB DIISI! Daftar ID Gejala (didapatkan dari tool EkstrakDanCariGejala)"),
  }),
  // @ts-ignore
  execute: async ({ id_gejala_array }: { id_gejala_array: string[] }) => {
    try {
      if (!id_gejala_array || id_gejala_array.length === 0)
        return { message: "Data ID Gejala kosong." };

      const gejalaIdArray = id_gejala_array;

      // Cari Penyakit yang terhubung (melalui Pivot PenyakitGejala) ke ID-ID Gejala input
      const penyakitTerkait = await prisma.penyakit.findMany({
        where: {
          gejala: {
            some: {
              gejalaId: {
                in: gejalaIdArray,
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
          tanamanObat: {
            include: {
              tanaman: {
                select: {
                  id: true,
                  namaLokal: true,
                  khasiatUtama: true,
                },
              },
            },
          },
        },
      });

      // Hitung skor kecocokan: jumlah gejala yang overlap antara database dan input LLM
      const penyakitDenganSkor = penyakitTerkait.map((p) => {
        const matchingGejalaIds = p.gejala.filter((g) =>
          gejalaIdArray.includes(g.gejalaId),
        );
        return {
          id: p.id,
          nama: p.nama,
          skor: matchingGejalaIds.length,
          // Mengembalikan relasi tanaman obat agar AI bisa melanjutkan proses FilterKontraindikasiMurni
          tanamanObat: p.tanamanObat.map((t) => ({
            id: t.tanaman.id,
            nama: t.tanaman.namaLokal,
            khasiatUtama: t.tanaman.khasiatUtama,
          })),
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
  execute: async (args: any) => {
    try {
      const penyakitId = args?.penyakitId || args?.id_penyakit;
      const keluhanUserGejalaIds = args?.keluhanUserGejalaIds || args?.id_gejala_user || [];
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
          gejalaHilang,
          message: `Diagnosis BATAL DIVERIFIKASI. Penyakit ini mensyaratkan pasien memiliki gejala wajib: ${gejalaHilang.join(", ")} namun user tidak memilikinya dalam keluhan.`,
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
    "Mengevaluasi kontraindikasi tanaman terhadap kondisi kesehatan pasien (misal: Hamil, Darah Tinggi). Membedakan tingkat risiko: 'BERBAHAYA' (dilarang keras) dan 'HATI-HATI' (diperbolehkan dengan catatan khusus).",
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
        return { tanamanTerlarangIds: [], tanamanPeringatanIds: [], pesanDilarang: [], pesanPeringatan: [], aman: true };

      // Asumsi: jika user tidak menyebutkan kondisi, berarti aman (atau LLM bisa dipandu bertanya)
      if (!kondisiKesehatanPasien || kondisiKesehatanPasien.length === 0) {
        return {
          aman: true,
          tanamanTerlarangIds: [],
          tanamanPeringatanIds: [],
          pesanDilarang: [],
          pesanPeringatan: [],
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
          tanamanTerlarangIds: [],
          tanamanPeringatanIds: [],
          pesanDilarang: [],
          pesanPeringatan: [],
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
          tanaman: { select: { id: true, namaLokal: true } },
          kondisiMedis: { select: { nama: true } },
        },
      });

      if (pantangan.length > 0) {
        // Filter berdasarkan tingkat risiko
        const dilarang = pantangan.filter(p => p.tingkatRisiko?.toUpperCase() === "BERBAHAYA" || !p.tingkatRisiko);
        const peringatan = pantangan.filter(p => p.tingkatRisiko?.toUpperCase() === "HATI-HATI");

        const daftarDilarang = dilarang.map(
          (p) =>
            `[DILARANG - BERBAHAYA] Tanaman '${p.tanaman.namaLokal}' DILARANG KERAS untuk penderita '${p.kondisiMedis.nama}'. Alasan Medis: ${p.alasan || "Tidak ada alasan spesifik."}`,
        );

        const daftarPeringatan = peringatan.map(
          (p) =>
            `[PERINGATAN - HATI-HATI] Tanaman '${p.tanaman.namaLokal}' dapat dikonsumsi penderita '${p.kondisiMedis.nama}' dengan catatan khusus: ${p.alasan || "Tidak ada alasan spesifik."}`,
        );

        return {
          aman: dilarang.length === 0,
          tanamanTerlarangIds: dilarang.map(p => p.tanamanId),
          tanamanPeringatanIds: peringatan.map(p => p.tanamanId),
          pesanDilarang: daftarDilarang,
          pesanPeringatan: daftarPeringatan,
          message: dilarang.length > 0
            ? "Terdapat tanaman berbahaya yang dilarang keras untuk dikonsumsi pasien. Tanaman terlarang ini tidak boleh direkomendasikan."
            : "Ada tanaman dengan catatan risiko ringan (HATI-HATI). Dapat direkomendasikan dengan menyertakan catatan khusus.",
        };
      }

      return {
        aman: true,
        tanamanTerlarangIds: [],
        tanamanPeringatanIds: [],
        pesanDilarang: [],
        pesanPeringatan: [],
        message: "Semua tanaman lolos sensor kontraindikasi murni.",
      };
    } catch (error) {
      console.error("FilterKontraindikasiMurni Error:", error);
      return {
        aman: false,
        tanamanTerlarangIds: [],
        tanamanPeringatanIds: [],
        pesanDilarang: [],
        pesanPeringatan: ["Sistem Pengaman Error. Hindari merekomendasikan tanaman dulu."],
        message: "Sistem Pengaman Error. Jangan rekomendasikan tanaman dulu.",
      };
    }
  },
});

// 5. Tool: AnalisisDiagnosaMedisHibrida (Combined Tool - Opsi A)
export const AnalisisDiagnosaMedisHibrida = tool({
  description:
    "Menganalisis keluhan medis pengguna secara menyeluruh, mencocokkan gejala dengan database, menelusuri penyakit terkait, memvalidasi gejala wajib, serta memfilter rekomendasi tanaman obat berdasarkan kontraindikasi pasien dalam satu langkah cepat terpadu.",
  parameters: z.object({
    keluhan: z
      .string()
      .describe(
        "Keluhan medis atau gejala mentah dari pengguna. Jika keluhan ditulis dalam bahasa asing (misal Inggris), kamu harus menerjemahkannya ke Bahasa Indonesia sebelum memanggil tool (karena basis data di sistem menggunakan Bahasa Indonesia). Contoh: 'fever' -> 'demam'."
      ),
    kondisiKesehatanPasien: z
      .array(z.string())
      .describe(
        "Kondisi kesehatan khusus pasien (contoh: ['Hamil', 'Darah Tinggi'] atau [] jika tidak ada)."
      ),
  }),
  // @ts-ignore
  execute: async ({
    keluhan,
    kondisiKesehatanPasien,
  }: {
    keluhan: string;
    kondisiKesehatanPasien: string[];
  }) => {
    try {
      console.log("[AnalisisDiagnosaMedisHibrida] Input:", { keluhan, kondisiKesehatanPasien });
      if (!keluhan || keluhan.trim() === "") {
        return { message: "Keluhan tidak boleh kosong.", gejala: [], kandidat: [] };
      }

      // --- LANGKAH 1: Ekstrak & Cari Gejala (Secara Paralel) ---
      const words = keluhan
        .split(/[\s,.;?]+/)
        .map((w) => w.trim())
        .filter(
          (w) =>
            w.length > 3 &&
            ![
              "saya", "aku", "kami", "kita", "dia", "mereka", "anda", "kamu",
              "ingin", "tolong", "bantu", "dengan", "yang", "dan", "di", "ke",
              "dari", "atau", "pada", "juga", "sakit", "nyeri", "merasa", "mengalami"
            ].includes(w.toLowerCase())
        );

      const processedKeywords = Array.from(new Set([keluhan.trim(), ...words]));

      const queryPromises = processedKeywords.map((keyword) =>
        prisma.gejala.findMany({
          where: {
            nama: {
              contains: keyword,
              mode: "insensitive",
            },
          },
          select: { id: true, nama: true },
        })
      );
      const resultsArray = await Promise.all(queryPromises);
      const allGejala = resultsArray.flat();

      const uniqueGejala = Array.from(
        new Map(allGejala.map((item) => [item.id, item])).values()
      );

      console.log("[AnalisisDiagnosaMedisHibrida] Gejala terdeteksi:", uniqueGejala);

      if (uniqueGejala.length === 0) {
        return {
          message: "Tidak ada gejala spesifik di database yang cocok dengan keluhan.",
          gejala: [],
          kandidat: [],
        };
      }

      const gejalaIdArray = uniqueGejala.map((g) => g.id);

      // --- LANGKAH 2: Telusuri Graf Penyakit ---
      const penyakitTerkait = await prisma.penyakit.findMany({
        where: {
          gejala: {
            some: {
              gejalaId: {
                in: gejalaIdArray,
              },
            },
          },
        },
        include: {
          gejala: {
            select: {
              gejalaId: true,
              isGejalaWajib: true,
              gejala: { select: { nama: true } },
            },
          },
          tanamanObat: {
            include: {
              tanaman: {
                select: {
                  id: true,
                  namaLokal: true,
                  khasiatUtama: true,
                },
              },
            },
          },
        },
      });

      // --- LANGKAH 3 & 4: Validasi & Filter Kontraindikasi ---
      let kondisiDatabase: any[] = [];
      if (kondisiKesehatanPasien && kondisiKesehatanPasien.length > 0) {
        kondisiDatabase = await prisma.kondisiMedis.findMany({
          where: {
            OR: kondisiKesehatanPasien.map((k) => ({
              nama: { contains: k, mode: "insensitive" },
            })),
          },
        });
      }
      const kondisiIds = kondisiDatabase.map((k) => k.id);

      const kandidatPenyakit = [];

      for (const p of penyakitTerkait) {
        // Hitung skor kecocokan
        const matchingGejalaIds = p.gejala
          .filter((g) => gejalaIdArray.includes(g.gejalaId))
          .map((g) => g.gejalaId);
        const skor = matchingGejalaIds.length;

        // Validasi Gejala Wajib
        const gejalaWajibList = p.gejala.filter((g) => g.isGejalaWajib);
        const gejalaHilang: string[] = [];
        for (const gw of gejalaWajibList) {
          if (!gejalaIdArray.includes(gw.gejalaId)) {
            gejalaHilang.push(gw.gejala.nama);
          }
        }
        const sah = gejalaHilang.length === 0;
        const validasiMessage = sah
          ? "Validasi Lulus. Semua Gejala Wajib telah terpenuhi."
          : `Batal Diverifikasi. Penyakit ini mensyaratkan gejala wajib: ${gejalaHilang.join(", ")} tetapi tidak dialami user.`;

        // Tanaman Obat
        const tanamanObatList = p.tanamanObat.map((t) => ({
          id: t.tanaman.id,
          nama: t.tanaman.namaLokal,
          khasiatUtama: t.tanaman.khasiatUtama,
        }));

        // Filter kontraindikasi
        let tanamanTerlarangIds: string[] = [];
        let tanamanPeringatanIds: string[] = [];
        let pesanDilarang: string[] = [];
        let pesanPeringatan: string[] = [];

        if (kondisiIds.length > 0 && tanamanObatList.length > 0) {
          const pantangan = await prisma.pantanganTanaman.findMany({
            where: {
              tanamanId: { in: tanamanObatList.map((t) => t.id) },
              kondisiMedisId: { in: kondisiIds },
            },
            include: {
              tanaman: { select: { id: true, namaLokal: true } },
              kondisiMedis: { select: { nama: true } },
            },
          });

          if (pantangan.length > 0) {
            const dilarang = pantangan.filter(
              (pan) => pan.tingkatRisiko?.toUpperCase() === "BERBAHAYA" || !pan.tingkatRisiko
            );
            const peringatan = pantangan.filter(
              (pan) => pan.tingkatRisiko?.toUpperCase() === "HATI-HATI"
            );

            tanamanTerlarangIds = dilarang.map((pan) => pan.tanamanId);
            tanamanPeringatanIds = peringatan.map((pan) => pan.tanamanId);

            pesanDilarang = dilarang.map(
              (pan) =>
                `[DILARANG - BERBAHAYA] Tanaman '${pan.tanaman.namaLokal}' DILARANG untuk penderita '${pan.kondisiMedis.nama}'. Alasan: ${pan.alasan || "Tidak ada alasan spesifik."}`
            );
            pesanPeringatan = peringatan.map(
              (pan) =>
                `[PERINGATAN - HATI-HATI] Tanaman '${pan.tanaman.namaLokal}' bisa dikonsumsi penderita '${pan.kondisiMedis.nama}' dengan catatan: ${pan.alasan || "Tidak ada alasan spesifik."}`
            );
          }
        }

        // Rekomendasi aman (tidak dilarang keras)
        const rekomendasiTanaman = tanamanObatList.filter(
          (t) => !tanamanTerlarangIds.includes(t.id)
        );

        kandidatPenyakit.push({
          id: p.id,
          nama: p.nama,
          skor,
          sah,
          gejalaHilang,
          validasiMessage,
          tanamanObat: rekomendasiTanaman,
          tanamanTerlarangIds,
          tanamanPeringatanIds,
          pesanDilarang,
          pesanPeringatan,
        });
      }

      kandidatPenyakit.sort((a, b) => b.skor - a.skor);

      return {
        message: "Analisis Diagnosa Selesai Berbasis Graph.",
        gejala: uniqueGejala,
        kandidat: kandidatPenyakit.slice(0, 5),
      };
    } catch (error: any) {
      console.error("AnalisisDiagnosaMedisHibrida Error:", error);
      return {
        message: "Terjadi kesalahan internal saat menganalisis diagnosa.",
        gejala: [],
        kandidat: [],
      };
    }
  },
});

export const agentV3Tools = {
  EkstrakDanCariGejala,
  TelusuriGrafPenyakit,
  ValidasiGejalaWajib,
  FilterKontraindikasiMurni,
  AnalisisDiagnosaMedisHibrida,
};
