import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Mulai melakukan seeding data tanaman...");

  // Data Mentah
  const dataTanaman = [
    {
      namaLokal: "Bawang Dayak",
      namaLatin: "Eleutherine palmifolia",
      kandunganSenyawa:
        "Naphthoquinone (eleutherin, isoeleutherin), flavonoid, saponin, tanin, alkaloid",
      khasiatUtama:
        "Antioksidan, antidiabetes, antikanker, antibakteri, antijamur, antiinflamasi",
      penyakitTerkait: [
        "Diabetes",
        "Kanker payudara & kolon",
        "Infeksi bakteri/jamur",
        "Hipertensi ringan",
        "Masalah pencernaan",
      ],
      deskripsi:
        "Tanaman herbal dengan umbi berwarna merah menyala yang kaya akan senyawa aktif.",
      lokasiTanam: "Taman Herbal Utama",
    },
    {
      namaLokal: "Bunga Piladang / Bunga Telang",
      namaLatin: "Clitoria ternatea",
      kandunganSenyawa:
        "Anthocyanin (ternatin), flavonoid, alkaloid, saponin, tanin",
      khasiatUtama:
        "Antioksidan kuat, neuroprotektif, antiinflamasi, meningkatkan memori",
      penyakitTerkait: [
        "Gangguan memori",
        "Kecemasan",
        "Radang",
        "Stres oksidatif",
      ],
      deskripsi:
        "Tanaman merambat dengan bunga berwarna biru terang yang sering dijadikan teh (pewarna alami).",
      lokasiTanam: "Taman Herbal Utama",
    },
    {
      namaLokal: "Tanaman Selasih",
      namaLatin: "Ocimum basilicum",
      kandunganSenyawa:
        "Eugenol, linalool, methyl chavicol, flavonoid, saponin",
      khasiatUtama:
        "Antibakteri, antijamur, antiinflamasi, menenangkan, meningkatkan pencernaan",
      penyakitTerkait: [
        "Masalah pencernaan",
        "Stres",
        "Infeksi ringan",
        "Batuk",
      ],
      deskripsi:
        "Tanaman aromatik yang bijinya sering digunakan pada minuman dingin.",
      lokasiTanam: "Taman Herbal Utama",
    },
    {
      namaLokal: "Kenikir",
      namaLatin: "Cosmos caudatus",
      kandunganSenyawa: "Flavonoid (quercetin), tokoferol, fenolik, asam amino",
      khasiatUtama:
        "Antioksidan kuat, menurunkan gula darah, meningkatkan nafsu makan",
      penyakitTerkait: ["Diabetes", "Radikal bebas", "Kurang nafsu makan"],
      deskripsi: "Sering dijadikan lalapan segar, memiliki aroma yang khas.",
      lokasiTanam: "Taman Herbal Utama",
    },
    {
      namaLokal: "Jeruk Kasturi",
      namaLatin: "Citrus microcarpa",
      kandunganSenyawa: "Vitamin C tinggi, limonene, citral, flavonoid",
      khasiatUtama: "Antiviral, antibakteri, ekspektoran, antioksidan",
      penyakitTerkait: [
        "Batuk",
        "Flu",
        "Radang tenggorokan",
        "Gangguan pencernaan",
      ],
      deskripsi: "Jeruk ukuran kecil dengan rasa sangat masam, kaya vitamin C.",
      lokasiTanam: "Taman Buah & Herbal",
    },
    {
      namaLokal: "Cimplukan",
      namaLatin: "Physalis angulata",
      kandunganSenyawa: "Withanolides, saponin, flavonoid, physalin",
      khasiatUtama: "Antidiabetes, antihipertensi, antikanker, imunomodulator",
      penyakitTerkait: ["Diabetes", "Hipertensi", "Kanker", "Peradangan"],
      deskripsi:
        "Tumbuh liar dan memiliki buah yang terbungkus kelopak menggelembung.",
      lokasiTanam: "Area Liar Taman",
    },
    {
      namaLokal: "Lengkuas Putih",
      namaLatin: "Alpinia galanga var. White",
      kandunganSenyawa: "Galangin, eugenol, flavonoid, diarylheptanoids",
      khasiatUtama: "Antimikroba, antiinflamasi, melancarkan pencernaan",
      penyakitTerkait: ["Infeksi bakteri", "Nyeri sendi", "Masalah pencernaan"],
      deskripsi:
        "Rimpang berserat yang umum digunakan untuk masakan dan pengobatan perut.",
      lokasiTanam: "Blok Rimpang",
    },
    {
      namaLokal: "Sambung Nyawa",
      namaLatin: "Gynura procumbens",
      kandunganSenyawa: "Flavonoid, asam fenolat, saponin, tanin",
      khasiatUtama: "Hipoglikemik, hepatoprotektif, antiinflamasi",
      penyakitTerkait: ["Diabetes", "Penyakit hati", "Hipertensi"],
      deskripsi:
        "Daunnya sering dimakan mentah sebagai lalap pengobatan darah tinggi.",
      lokasiTanam: "Taman Herbal Utama",
    },
    {
      namaLokal: "Jadam / Kaktus Centong / Opuntia",
      namaLatin: "Opuntia cochenillifera",
      kandunganSenyawa: "Saponin, mukilago, vitamin B & C, betalain",
      khasiatUtama: "Menyembuhkan luka bakar, antiinflamasi, analgesik",
      penyakitTerkait: ["Luka bakar", "Radang kulit", "Sakit sendi"],
      deskripsi:
        "Berbentuk seperti centong lebar, dagingnya berlendir untuk pendingin luka.",
      lokasiTanam: "Area Kering",
    },
    {
      namaLokal: "Kemuning",
      namaLatin: "Murraya paniculata",
      kandunganSenyawa:
        "Alkaloid murrayanine, coumarin, flavonoid, essential oil",
      khasiatUtama: "Peluruh lemak, antiradang, analgesik",
      penyakitTerkait: ["Obesitas", "Nyeri haid", "Nyeri sendi"],
      deskripsi: "Tanaman perdu beraroma sangat harum terutama di malam hari.",
      lokasiTanam: "Taman Herbal Utama",
    },
    {
      namaLokal: "Belimbing Wuluh",
      namaLatin: "Averrhoa bilimbi",
      kandunganSenyawa: "Asam oksalat, vitamin C, flavonoid, saponin",
      khasiatUtama: "Antiseptik, antioksidan, antidiabetes, antihipertensi",
      penyakitTerkait: ["Jerawat", "Hipertensi", "Diabetes", "Infeksi kulit"],
      deskripsi: "Rasa sangat masam, bunganya bisa dibuat sirup obat batuk.",
      lokasiTanam: "Taman Buah & Herbal",
    },
    {
      namaLokal: "Daun Kari",
      namaLatin: "Murraya koenigii",
      kandunganSenyawa:
        "Carbazole alkaloids (mahanimbine), vitamin A, C, dan kalsium",
      khasiatUtama: "Antidiabetes, antibakteri, meningkatkan fungsi pencernaan",
      penyakitTerkait: ["Diabetes", "Infeksi", "Anemia ringan", "Pencernaan"],
      deskripsi:
        "Sering digunakan dalam bumbu kari, memiliki keharuman yang sangat kuat.",
      lokasiTanam: "Taman Herbal Utama",
    },
    {
      namaLokal: "Mulberry / Murbei",
      namaLatin: "Morus alba",
      kandunganSenyawa:
        "Flavonoid (rutin, quercetin), anthocyanin, resveratrol, alkaloid (DNJ — 1-deoxynojirimycin), vitamin C, tanin",
      khasiatUtama:
        "Antidiabetes, antioksidan kuat, antihipertensi, hipolipidemik (turunkan kolesterol), antiinflamasi, neuroprotektif",
      penyakitTerkait: [
        "Diabetes melitus",
        "Hipertensi",
        "Kolesterol tinggi",
        "Infeksi saluran napas",
        "Gangguan kognitif",
        "Radikal bebas",
      ],
      deskripsi:
        "Daunnya pakan ulat sutera, buahnya berwarna merah keunguan gelap kaya antioksidan.",
      lokasiTanam: "Taman Buah & Herbal",
    },
    {
      namaLokal: "Daun Mint",
      namaLatin: "Mentha spicata / Mentha piperita",
      kandunganSenyawa:
        "Menthol, menthone, rosmarinic acid, flavonoid, limonene",
      khasiatUtama:
        "Antispasmodik, karminatif (melancarkan pencernaan), antibakteri, antifungi, antiinflamasi, pereda nyeri kepala",
      penyakitTerkait: [
        "Masalah pencernaan (kembung, mual, iritasi usus)",
        "Sakit kepala",
        "Batuk pilek",
        "Gangguan pernapasan ringan",
        "Stres ringan",
      ],
      deskripsi: "Memiliki sensasi dingin dan segar, mudah menjalar di tanah.",
      lokasiTanam: "Taman Herbal Utama",
    },
    {
      namaLokal: "Rosemary",
      namaLatin: "Rosmarinus officinalis",
      kandunganSenyawa:
        "Rosmarinic acid, carnosol, carnosic acid, cineole, camphor, flavonoid",
      khasiatUtama:
        "Antioksidan sangat kuat, antimikroba, antiinflamasi, meningkatkan memori, meningkatkan sirkulasi darah, hepatoprotektif",
      penyakitTerkait: [
        "Gangguan memori",
        "Peradangan sendi",
        "Infeksi bakteri ringan",
        "Masalah pencernaan",
        "Kelelahan",
        "Gangguan hati ringan",
      ],
      deskripsi: "Daun runcing seperti jarum beraroma kuat khas rempah.",
      lokasiTanam: "Area Kering",
    },
  ];

  for (const item of dataTanaman) {
    // 1. Buat Data Tanaman
    const tanaman = await prisma.tanaman.create({
      data: {
        namaLokal: item.namaLokal,
        namaLatin: item.namaLatin,
        kandunganSenyawa: item.kandunganSenyawa,
        khasiatUtama: item.khasiatUtama,
        deskripsi: item.deskripsi,
        lokasiTanam: item.lokasiTanam,
      },
    });

    // 2. Buat relasi Penyakit dan TanamanPenyakit
    for (const namaPenyakit of item.penyakitTerkait) {
      // Cari penyakir, jika tidak ada buat baru (upsert tidak bisa jika tidak unik,
      // kita gunakan create/findFirst di sini karena nama Penyakit belum unique)
      let penyakit = await prisma.penyakit.findFirst({
        where: { nama: { equals: namaPenyakit, mode: "insensitive" } },
      });

      if (!penyakit) {
        penyakit = await prisma.penyakit.create({
          data: { nama: namaPenyakit },
        });
      }

      // 3. Hubungkan ke pivot table
      await prisma.tanamanPenyakit.create({
        data: {
          tanamanId: tanaman.id,
          penyakitId: penyakit.id,
        },
      });
    }
  }

  console.log("Seeding selesai!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
