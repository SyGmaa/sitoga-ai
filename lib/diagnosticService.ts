import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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
  // 1. Fetch diseases that have at least one of the detected symptoms
  // In a real sophisticated query, we might use a full-text search, but here we check
  // if any of the disease's symptoms matches the detected ones. We'll fetch all and filter in memory for simplicity,
  // or fetch based on an ILIKE. Given the nature of user input vs DB exact string, let's fetch all and filter.
  
  const allPenyakit = await prisma.penyakit.findMany({
    include: {
      gejala: {
        include: {
          gejala: true,
        },
      },
      tanamanObat: {
        include: {
          tanaman: true,
        },
      },
    },
  });

  const results: DiagnosaContextResult[] = [];

  for (const p of allPenyakit) {
    // Determine which of the disease's symptoms the user actually mentioned
    const diseaseSymptoms = p.gejala.map((g) => g.gejala.nama.toLowerCase());
    
    const tokenize = (text: string) => text.toLowerCase().split(/[\s,]+/).filter(w => w.length > 2 && !['dan', 'atau', 'yang', 'di', 'ke', 'dari', 'bisa', 'terasa', 'kurang', 'mudah', 'sering', 'cepat', 'sangat'].includes(w));
    const userTokens = detectedSymptoms.flatMap(ds => tokenize(ds));

    const matchedSymptoms = diseaseSymptoms.filter((ds) => {
      const dsTokens = tokenize(ds);
      return userTokens.some(ut => dsTokens.some(dst => dst === ut || dst.includes(ut) || ut.includes(dst)));
    });

    if (matchedSymptoms.length === 0) continue; // No symptom matched, skip

    // 2. Filter Keguguran (Gejala Wajib)
    const wajibGejalaIdsList = p.gejala.filter(g => g.isGejalaWajib).map(g => g.gejala.nama.toLowerCase());
    const missingWajibGejala = wajibGejalaIdsList.filter((wg) => {
       const wgTokens = tokenize(wg);
       return !userTokens.some(ut => wgTokens.some(wgt => wgt === ut || wgt.includes(ut) || ut.includes(wgt)));
    });

    // Filter Pantangan Tanaman
    let validTanaman = p.tanamanObat.map(to => to.tanaman);
    
    if (isHamil) {
      validTanaman = validTanaman.filter(t => t.amanUntukIbuHamil === true);
    }

    results.push({
      penyakit: p.nama,
      gejala: p.gejala.map(g => g.gejala.nama),
      rekomendasiTanaman: validTanaman.map(t => ({
        id: t.id,
        namaLokal: t.namaLokal,
        namaLatin: t.namaLatin,
        khasiatUtama: t.khasiatUtama,
        pantanganKondisi: t.pantanganKondisi
      })),
      gejalaWajibBelumTerpenuhi: missingWajibGejala.length > 0 ? missingWajibGejala : undefined
    });
  }

  return results;
}
