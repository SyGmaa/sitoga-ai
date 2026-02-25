import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ==========================================
// V1: Legacy Diagnostic Context
// ==========================================
export interface DiagnosaContextResult {
  penyakit: string;
  gejala: string[];
  rekomendasiTanaman: {
    id: string;
    namaLokal: string;
    namaLatin: string;
    khasiatUtama: string;
    pantanganKondisi: string | null;
  }[];
  gejalaWajibBelumTerpenuhi?: string[];
}

export async function getDiagnosticContext(
  detectedSymptoms: string[],
  isHamil: boolean = false
): Promise<DiagnosaContextResult[]> {
  const allPenyakit = await prisma.penyakit.findMany({
    include: {
      gejala: {
        include: {
          gejala: true,
        },
      },
      tanamanObat: {
        include: {
          tanaman: {
            include: {
              pantanganTanaman: {
                include: { kondisiMedis: true }
              }
            }
          },
        },
      },
    },
  });

  const results: DiagnosaContextResult[] = [];

  for (const p of allPenyakit) {
    const diseaseSymptoms = p.gejala.map((g) => g.gejala.nama.toLowerCase());
    
    const tokenize = (text: string) => text.toLowerCase().split(/[\s,]+/).filter(w => w.length > 2 && !['dan', 'atau', 'yang', 'di', 'ke', 'dari', 'bisa', 'terasa', 'kurang', 'mudah', 'sering', 'cepat', 'sangat'].includes(w));
    const userTokens = detectedSymptoms.flatMap(ds => tokenize(ds));

    const matchedSymptoms = diseaseSymptoms.filter((ds) => {
      const dsTokens = tokenize(ds);
      return userTokens.some(ut => dsTokens.some(dst => dst === ut || dst.includes(ut) || ut.includes(dst)));
    });

    if (matchedSymptoms.length === 0) continue;

    const wajibGejalaIdsList = p.gejala.filter(g => g.isGejalaWajib).map(g => g.gejala.nama.toLowerCase());
    const missingWajibGejala = wajibGejalaIdsList.filter((wg) => {
       const wgTokens = tokenize(wg);
       return !userTokens.some(ut => wgTokens.some(wgt => wgt === ut || wgt.includes(ut) || ut.includes(wgt)));
    });

    let validTanaman = p.tanamanObat.map(to => to.tanaman);
    
    if (isHamil) {
      validTanaman = validTanaman.filter(t => !t.pantanganTanaman.some(pt => pt.kondisiMedis.nama.toLowerCase() === "hamil"));
    }

    results.push({
      penyakit: p.nama,
      gejala: p.gejala.map(g => g.gejala.nama),
      rekomendasiTanaman: validTanaman.map(t => ({
        id: t.id,
        namaLokal: t.namaLokal,
        namaLatin: t.namaLatin,
        khasiatUtama: t.khasiatUtama,
        pantanganKondisi: t.pantanganTanaman.map(pt => `${pt.kondisiMedis.nama}: ${pt.alasan}`).join(", ") || null
      })),
      gejalaWajibBelumTerpenuhi: missingWajibGejala.length > 0 ? missingWajibGejala : undefined
    });
  }

  return results;
}


// ==========================================
// V2: Hybrid Reasoning Engine (Deterministic)
// ==========================================
export async function runDiagnosticScoring(
  gejalaTerdeteksi: string[],
  kondisiMedisPenyerta: string[]
) {
  const allPenyakit = await prisma.penyakit.findMany({
    include: {
      gejala: {
        include: { gejala: true },
      },
      tanamanObat: {
        include: {
          tanaman: {
            include: {
              pantanganTanaman: {
                include: { kondisiMedis: true }
              }
            }
          }
        }
      }
    }
  });

  const tokenize = (text: string) => text.toLowerCase().split(/[\s,]+/).filter(w => w.length > 2 && !['dan', 'atau', 'yang', 'di', 'ke', 'dari', 'bisa', 'terasa', 'kurang', 'mudah', 'sering', 'cepat', 'sangat'].includes(w));
  const userTokens = gejalaTerdeteksi.flatMap(ds => tokenize(ds));
  const userKondisiTokens = kondisiMedisPenyerta.flatMap(k => tokenize(k));

  const scoredResults = allPenyakit.map(penyakit => {
    let maxScore = 0;
    let userScore = 0;
    let isDisqualified = false;
    let missingWajib: string[] = [];

    for (const relasiGejala of penyakit.gejala) {
      const gNama = relasiGejala.gejala.nama;
      const bobot = relasiGejala.bobotGejala;
      maxScore += bobot;

      const dsTokens = tokenize(gNama);
      const isMatch = userTokens.some(ut => dsTokens.some(dst => dst === ut || dst.includes(ut) || ut.includes(dst)));

      if (isMatch) {
        userScore += bobot;
      } else if (relasiGejala.isGejalaWajib) {
        isDisqualified = true;
        missingWajib.push(gNama);
      }
    }

    if (isDisqualified) {
      userScore = 0;
    }

    const probability = maxScore > 0 ? (userScore / maxScore) * 100 : 0;

    // Filter & Peringatan Tanaman
    const rekomendasiTanaman = penyakit.tanamanObat.map(to => {
      const t = to.tanaman;
      const peringatan: { kondisi: string, tingkatRisiko: string, alasan: string }[] = [];
      let isBerbahaya = false;

      // Cek bentrok kondisi medis
      t.pantanganTanaman.forEach(pt => {
        const kondisiTokens = tokenize(pt.kondisiMedis.nama);
        const userHasCondition = userKondisiTokens.some(ukt => kondisiTokens.some(kt => kt === ukt || kt.includes(ukt) || ukt.includes(kt)));
        
        // Literal match fallback
        const directMatch = kondisiMedisPenyerta.some(k => k.toLowerCase().includes(pt.kondisiMedis.nama.toLowerCase()) || pt.kondisiMedis.nama.toLowerCase().includes(k.toLowerCase()));

        if (userHasCondition || directMatch) {
          peringatan.push({
            kondisi: pt.kondisiMedis.nama,
            tingkatRisiko: pt.tingkatRisiko || "PERHATIAN",
            alasan: pt.alasan || "Ada kontraindikasi"
          });
          if (pt.tingkatRisiko === "BERBAHAYA" || pt.tingkatRisiko === "TINGGI") {
            isBerbahaya = true;
          }
        }
      });

      return {
        id: t.id,
        namaLokal: t.namaLokal,
        namaLatin: t.namaLatin,
        deskripsi: t.deskripsi,
        gambarUrl: t.gambarUrl,
        khasiatUtama: t.khasiatUtama,
        peringatanMedis: peringatan.length > 0 ? peringatan : null,
        isAmanDikonsumsi: !isBerbahaya
      };
    });

    return {
      penyakit: penyakit.nama,
      deskripsi: penyakit.deskripsi,
      probability: Math.round(probability),
      gejalaDicocokkan: userScore > 0,
      missingWajib: missingWajib.length > 0 ? missingWajib : null,
      rekomendasiTanaman: rekomendasiTanaman
    };
  });

  const sorted = scoredResults.filter(s => s.probability > 0).sort((a, b) => b.probability - a.probability);
  
  if (sorted.length === 0 || sorted[0].probability < 40) {
    return {
      status: "RUJUK_DOKTER",
      pesan_rujukan: "Sistem menyarankan Anda untuk segera memeriksakan diri ke dokter atau fasilitas kesehatan terdekat. Gejala yang Anda sebutkan terlalu ambigu, spesifik, atau persentase kecocokannya rendah (< 40%)."
    };
  }

  return {
    status: "SUKSES",
    penyakit_tertinggi: sorted[0].penyakit,
    probabilitas: sorted[0].probability,
    gejala_terdeteksi: gejalaTerdeteksi,
    kandidat_lainnya: sorted.slice(1, 3).map(k => ({ penyakit: k.penyakit, probabilitas: k.probability })),
    tanaman_rekomendasi: sorted[0].rekomendasiTanaman.filter(t => t.isAmanDikonsumsi),
    tanaman_dihapus_karena_pantangan: sorted[0].rekomendasiTanaman.filter(t => !t.isAmanDikonsumsi)
  };
}
