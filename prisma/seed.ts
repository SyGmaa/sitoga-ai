import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

const plantImageMap: Record<string, string> = {
  'Jahe Merah': 'https://images.unsplash.com/photo-1615486171448-4fd1ebdd1c12?auto=format&fit=crop&q=80',
  'Jambu Biji': 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&q=80',
  'Lidah Buaya': 'https://images.unsplash.com/photo-1596547609652-9fc5d8d428ce?auto=format&fit=crop&q=80',
  'Kunyit': 'https://images.unsplash.com/photo-1615560462719-7521c7d2e964?auto=format&fit=crop&q=80',
  'Bawang Putih': 'https://images.unsplash.com/photo-1560717789-0ac7c58ac90a?auto=format&fit=crop&q=80',
  'Kayu Putih': 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&q=80',
  'Jeruk Nipis': 'https://images.unsplash.com/photo-1590502593747-42a996133562?auto=format&fit=crop&q=80',
  'Kumis Kucing': 'https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?auto=format&fit=crop&q=80',
  'Kemangi': 'https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&q=80',
  'Daun Mint': 'https://images.unsplash.com/photo-1608797178974-15b35a61d121?auto=format&fit=crop&q=80',
  'Sirsak': 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&q=80',
  'Kopi': 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&q=80',
  'Pegagan': 'https://images.unsplash.com/photo-1515150144380-bca9f1650ed9?auto=format&fit=crop&q=80',
  'Temulawak': 'https://images.unsplash.com/photo-1615560462719-7521c7d2e964?auto=format&fit=crop&q=80',
  'Kencur': 'https://images.unsplash.com/photo-1615560462719-7521c7d2e964?auto=format&fit=crop&q=80',
  'Mulberry': 'https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?auto=format&fit=crop&q=80',
};

const defaultImage = 'https://images.unsplash.com/photo-1596708682121-50e561e13a96?auto=format&fit=crop&q=80';

interface MasterCondition {
  slug: string;
  nama: string;
  gejalaWajib: string[];
  gejalaUmum: string[];
}

function parseMasterConditions(content: string): Map<string, MasterCondition> {
  const map = new Map<string, MasterCondition>();
  const lines = content.split('\n');
  let inSection = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('## Master Kondisi/Keluhan dan Gejala')) {
      inSection = true;
      continue;
    }
    if (inSection && trimmed.startsWith('## ')) {
      break;
    }

    if (inSection && trimmed.startsWith('|') && trimmed.endsWith('|')) {
      if (trimmed.includes('Slug') || trimmed.includes('---')) continue;
      const parts = trimmed.split('|').map(p => p.trim());
      if (parts.length >= 7) {
        const slug = parts[2].replace(/`/g, '').trim();
        const nama = parts[3].trim();
        const gejalaWajibRaw = parts[4].trim();
        const gejalaUmumRaw = parts[5].trim();

        if (slug && nama) {
          const gejalaWajib = gejalaWajibRaw && gejalaWajibRaw !== '-'
            ? gejalaWajibRaw.split(',').map(s => s.trim()).filter(Boolean)
            : [];
          const gejalaUmum = gejalaUmumRaw && gejalaUmumRaw !== '-'
            ? gejalaUmumRaw.split(',').map(s => s.trim()).filter(Boolean)
            : [];

          map.set(slug, {
            slug,
            nama,
            gejalaWajib,
            gejalaUmum
          });
        }
      }
    }
  }

  return map;
}

function parseMasterRisks(content: string): Map<string, string> {
  const map = new Map<string, string>();
  const lines = content.split('\n');
  let inSection = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('## Master Kelompok Risiko')) {
      inSection = true;
      continue;
    }
    if (inSection && trimmed.startsWith('## ')) {
      break;
    }

    if (inSection && trimmed.startsWith('|') && trimmed.endsWith('|')) {
      if (trimmed.includes('Slug') || trimmed.includes('---')) continue;
      const parts = trimmed.split('|').map(p => p.trim());
      if (parts.length >= 4) {
        const slug = parts[2].replace(/`/g, '').trim();
        const nama = parts[3].trim();

        if (slug && nama) {
          map.set(slug, nama);
        }
      }
    }
  }

  return map;
}

function parseKeyValueTable(text: string): Record<string, string> {
  const data: Record<string, string> = {};
  const lines = text.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      if (trimmed.includes('---') || trimmed.toLowerCase().includes('field') || trimmed.toLowerCase().includes('aspek')) continue;
      const parts = trimmed.split('|').map(p => p.trim());
      if (parts.length >= 3) {
        const key = parts[1].replace(/\*\*/g, '').trim();
        const value = parts[2].trim();
        if (key && value) {
          data[key] = value;
        }
      }
    }
  }
  return data;
}

function parseRecipesTable(text: string): any[] {
  const recipes: any[] = [];
  const lines = text.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      if (trimmed.includes('---') || trimmed.toLowerCase().includes('kode')) continue;
      const parts = trimmed.split('|').map(p => p.trim());
      if (parts.length >= 8) {
        const kode = parts[1];
        const judul = parts[2];
        const kondisiRefs = parts[3];
        const bagian = parts[4];
        const pengolahan = parts[5];
        const pakai = parts[6];
        const keamanan = parts[7];
        
        if (kode && judul) {
          recipes.push({
            judul,
            kondisiRefs,
            bagian,
            pengolahan,
            pakai,
            keamanan
          });
        }
      }
    }
  }
  return recipes;
}

function normalizeEntityName(name: string): string {
  if (!name) return '';
  let cleaned = name
    .trim()
    .replace(/\.+$/, '')  // Hapus titik di akhir kalimat
    .trim();
  if (!cleaned) return '';
  cleaned = cleaned.toLowerCase();
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

async function main() {
  console.log('=== Inisialisasi Seeding Database ===');

  // 1. Seed Admin
  const adminEmail = 'admin@sitoga.com';
  const existingAdmin = await prisma.admin.findUnique({ where: { email: adminEmail } });
  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await prisma.admin.create({
      data: {
        nama: 'Administrator',
        email: adminEmail,
        password: hashedPassword,
      },
    });
    console.log(`[Admin] Berhasil dibuat: ${adminEmail}`);
  } else {
    console.log(`[Admin] Akun admin sudah terdaftar.`);
  }

  // 2. Pembersihan Data Lama
  console.log('[Pembersihan] Menghapus data lama di database...');
  await prisma.pantanganTanaman.deleteMany();
  await prisma.kondisiMedis.deleteMany();
  await prisma.resep.deleteMany();
  await prisma.tanamanPenyakit.deleteMany();
  await prisma.penyakitGejala.deleteMany();
  await prisma.gejala.deleteMany();
  await prisma.penyakit.deleteMany();
  await prisma.tanaman.deleteMany();
  console.log('[Pembersihan] Pembersihan selesai.');

  // 3. Membaca file data_tanaman.md
  const mdPath = path.join(process.cwd(), 'data_tanaman.md');
  if (!fs.existsSync(mdPath)) {
    throw new Error(`File data_tanaman.md tidak ditemukan di path: ${mdPath}`);
  }

  console.log('[Parser] Membaca data_tanaman.md...');
  const mdContent = fs.readFileSync(mdPath, 'utf8');
  const normalized = mdContent.replace(/\r\n/g, '\n');

  // Phase 1: Parse Masters
  console.log('[Parser] Mengekstrak Master Data...');
  const masterConditions = parseMasterConditions(normalized);
  const masterRisks = parseMasterRisks(normalized);

  console.log(`[Parser] Ditemukan ${masterConditions.size} Master Kondisi dan ${masterRisks.size} Master Kelompok Risiko.`);

  // Phase 2: Seed Masters
  console.log('[Seeder] Menyimpan Master Kelompok Risiko...');
  const riskIdMap = new Map<string, string>();
  for (const [slug, nama] of masterRisks.entries()) {
    const dbRisk = await prisma.kondisiMedis.create({
      data: {
        nama,
        deskripsi: `Kelompok yang perlu berhati-hati: ${nama}`
      }
    });
    riskIdMap.set(slug, dbRisk.id);
  }

  console.log('[Seeder] Menyimpan Master Penyakit & Gejala...');
  const diseaseIdMap = new Map<string, string>();
  const gejalaCache = new Map<string, string>(); // Menyimpan nama gejala -> ID gejala untuk mencegah duplikasi

  let symptomCount = 0;
  for (const cond of masterConditions.values()) {
    // Cari atau buat Penyakit
    const dbDisease = await prisma.penyakit.create({
      data: {
        nama: cond.nama,
        deskripsi: `Keluhan medis atau gangguan kesehatan: ${cond.nama}`
      }
    });
    diseaseIdMap.set(cond.slug, dbDisease.id);

    // Proses Gejala Wajib/Utama
    for (const rawSymptom of cond.gejalaWajib) {
      const normalizedSymptom = normalizeEntityName(rawSymptom);
      if (!normalizedSymptom) continue;

      let gejalaId = gejalaCache.get(normalizedSymptom);
      if (!gejalaId) {
        const dbGejala = await prisma.gejala.create({
          data: { nama: normalizedSymptom }
        });
        gejalaId = dbGejala.id;
        gejalaCache.set(normalizedSymptom, gejalaId);
        symptomCount++;
      }

      await prisma.penyakitGejala.create({
        data: {
          penyakitId: dbDisease.id,
          gejalaId,
          isGejalaWajib: true,
          bobotGejala: 5
        }
      });
    }

    // Proses Gejala Umum
    for (const rawSymptom of cond.gejalaUmum) {
      const normalizedSymptom = normalizeEntityName(rawSymptom);
      if (!normalizedSymptom) continue;

      let gejalaId = gejalaCache.get(normalizedSymptom);
      if (!gejalaId) {
        const dbGejala = await prisma.gejala.create({
          data: { nama: normalizedSymptom }
        });
        gejalaId = dbGejala.id;
        gejalaCache.set(normalizedSymptom, gejalaId);
        symptomCount++;
      }

      // Pastikan relasi tidak dobel (karena bisa jadi gejala wajib & umum tumpang tindih secara tidak sengaja)
      const existingRel = await prisma.penyakitGejala.findUnique({
        where: {
          penyakitId_gejalaId: {
            penyakitId: dbDisease.id,
            gejalaId
          }
        }
      });

      if (!existingRel) {
        await prisma.penyakitGejala.create({
          data: {
            penyakitId: dbDisease.id,
            gejalaId,
            isGejalaWajib: false,
            bobotGejala: 3
          }
        });
      }
    }
  }

  // Phase 3: Parse and Seed Plants
  console.log('[Parser] Mengekstrak Data Tanaman...');
  const plantChunks = normalized.split(/\n### TAN/);
  // Indeks 0 berisi intro dan tabel master, lewati
  const plantsToProcess = plantChunks.slice(1);
  console.log(`[Parser] Ditemukan ${plantsToProcess.length} data tanaman untuk diproses.`);

  let plantCount = 0;
  let recipeCount = 0;
  let contraCount = 0;

  for (const chunk of plantsToProcess) {
    const plantMatch = chunk.trim().match(/^(\d{3})\s*—\s*(.*?)\n([\s\S]+)/);
    if (!plantMatch) continue;

    const plantNum = parseInt(plantMatch[1]);
    const rawPlantName = plantMatch[2].trim();
    const plantBody = plantMatch[3];

    // Bagi section tanaman
    const contraIndex = plantBody.indexOf('#### Kontraindikasi');
    const recipeIndex = plantBody.indexOf('#### Cara Pengolahan');

    const overviewText = contraIndex !== -1 ? plantBody.substring(0, contraIndex) : plantBody;
    const contraText = (contraIndex !== -1 && recipeIndex !== -1)
      ? plantBody.substring(contraIndex, recipeIndex)
      : '';
    const recipeText = recipeIndex !== -1 ? plantBody.substring(recipeIndex) : '';

    // Parsing Overview Table
    const overviewData = parseKeyValueTable(overviewText);
    const namaLokal = (overviewData['Nama lokal'] || rawPlantName).trim();
    const namaLatin = (overviewData['Nama latin'] || '').replace(/\*/g, '').trim();
    const deskripsi = (overviewData['Deskripsi'] || '').trim();
    const kandunganSenyawa = (overviewData['Senyawa aktif utama'] || '').trim();
    const khasiatUtama = (overviewData['Manfaat/khasiat tradisional'] || deskripsi).trim();
    const gambarUrl = plantImageMap[namaLokal] || defaultImage;

    // Simpan Tanaman ke Database
    const dbTanaman = await prisma.tanaman.create({
      data: {
        namaLokal,
        namaLatin,
        deskripsi,
        kandunganSenyawa,
        khasiatUtama,
        gambarUrl
      }
    });
    plantCount++;

    // Relasikan Tanaman ke Penyakit via TanamanPenyakit
    const kondisiRefsRaw = overviewData['Kondisi refs'] || '';
    const kondisiSlugs = kondisiRefsRaw
      ? kondisiRefsRaw.replace(/`/g, '').split(',').map(s => s.trim()).filter(Boolean)
      : [];

    for (const slug of kondisiSlugs) {
      const diseaseId = diseaseIdMap.get(slug);
      if (diseaseId) {
        await prisma.tanamanPenyakit.create({
          data: {
            tanamanId: dbTanaman.id,
            penyakitId: diseaseId
          }
        });
      }
    }

    // Parsing Kontraindikasi & Hubungkan ke KondisiMedis
    if (contraText) {
      const contraData = parseKeyValueTable(contraText);
      const tingkatRisiko = contraData['Tingkat risiko'] || 'Sedang';
      const kelompokRisikoRefsRaw = contraData['Kelompok risiko refs'] || '';
      const pantangan = contraData['Bagian/cara pakai pantangan'] || '';
      const alasan = contraData['Alasan risiko'] || '';

      const riskSlugs = kelompokRisikoRefsRaw
        ? kelompokRisikoRefsRaw.replace(/`/g, '').split(',').map(s => s.trim()).filter(Boolean)
        : [];

      for (const slug of riskSlugs) {
        const riskId = riskIdMap.get(slug);
        if (riskId) {
          await prisma.pantanganTanaman.create({
            data: {
              tanamanId: dbTanaman.id,
              kondisiMedisId: riskId,
              tingkatRisiko,
              alasan: `Bagian pantangan: ${pantangan}. Alasan: ${alasan}`
            }
          });
          contraCount++;
        }
      }
    }

    // Parsing Resep Pengolahan & Simpan ke Resep
    if (recipeText) {
      const recipes = parseRecipesTable(recipeText);
      for (const recipe of recipes) {
        const formattedLangkah = [
          `Keluhan: ${recipe.judul}`,
          `• Bagian yang digunakan: ${recipe.bagian}`,
          `• Cara pengolahan: ${recipe.pengolahan}`,
          `• Cara pakai tradisional: ${recipe.pakai}`,
          `• Catatan keamanan: ${recipe.keamanan}`
        ].join('\n');

        await prisma.resep.create({
          data: {
            tanamanId: dbTanaman.id,
            langkah: formattedLangkah
          }
        });
        recipeCount++;
      }
    }

    console.log(`[Tanaman] Seeding selesai: #${plantNum} ${namaLokal}`);
  }

  console.log('\n=== Ringkasan Seeding Database ===');
  console.log(`✓ Total Tanaman Di-seed    : ${plantCount}`);
  console.log(`✓ Total Penyakit Master    : ${masterConditions.size}`);
  console.log(`✓ Total Gejala Unik        : ${symptomCount}`);
  console.log(`✓ Total Kondisi Medis Master: ${masterRisks.size}`);
  console.log(`✓ Total Relasi Pantangan   : ${contraCount}`);
  console.log(`✓ Total Resep Terbuat      : ${recipeCount}`);
  console.log('==================================');
}

main()
  .catch((e) => {
    console.error('Error saat seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
