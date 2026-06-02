import { PrismaClient } from "@prisma/client";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import LibraryClient from "./LibraryClient";

export const metadata = {
  title: "Pustaka Kebenaran Medis & Tanaman Obat - SITOBAT-AI",
  description:
    "Cari keluhan penyakit dan gejalanya, dapatkan rekomendasi tanaman herbal berkhasiat, serta lakukan pengecekan kontraindikasi medis secara interaktif.",
};

const prisma = new PrismaClient();

export default async function PustakaPage() {
  // Query data secara paralel untuk kecepatan pemuatan data
  const [plants, diseases, symptoms, conditions] = await Promise.all([
    prisma.tanaman.findMany({
      include: {
        resepPengolahan: true,
        penyakitTerkait: {
          select: {
            penyakitId: true,
          },
        },
        pantanganTanaman: {
          include: {
            kondisiMedis: true,
          },
        },
      },
      orderBy: {
        namaLokal: "asc",
      },
    }),
    prisma.penyakit.findMany({
      include: {
        gejala: {
          include: {
            gejala: true,
          },
        },
        tanamanObat: {
          select: {
            tanamanId: true,
          },
        },
      },
      orderBy: {
        nama: "asc",
      },
    }),
    prisma.gejala.findMany({
      orderBy: {
        nama: "asc",
      },
    }),
    prisma.kondisiMedis.findMany({
      orderBy: {
        nama: "asc",
      },
    }),
  ]);

  // Transformasi data sederhana untuk memastikan formatnya bersih
  const serializedPlants = plants.map((plant) => ({
    id: plant.id,
    namaLokal: plant.namaLokal,
    namaLatin: plant.namaLatin,
    deskripsi: plant.deskripsi,
    kandunganSenyawa: plant.kandunganSenyawa,
    khasiatUtama: plant.khasiatUtama,
    gambarUrl: plant.gambarUrl,
    resepPengolahan: plant.resepPengolahan.map((resep) => ({
      id: resep.id,
      langkah: resep.langkah,
    })),
    penyakitTerkaitIds: plant.penyakitTerkait.map((pt) => pt.penyakitId),
    pantangan: plant.pantanganTanaman.map((pt) => ({
      kondisiMedisId: pt.kondisiMedisId,
      kondisiMedisNama: pt.kondisiMedis.nama,
      tingkatRisiko: pt.tingkatRisiko,
      alasan: pt.alasan,
    })),
  }));

  const serializedDiseases = diseases.map((disease) => ({
    id: disease.id,
    nama: disease.nama,
    deskripsi: disease.deskripsi,
    gejala: disease.gejala.map((pg) => ({
      gejalaId: pg.gejalaId,
      nama: pg.gejala.nama,
      isGejalaWajib: pg.isGejalaWajib,
      bobotGejala: pg.bobotGejala,
    })),
    tanamanObatIds: disease.tanamanObat.map((to) => to.tanamanId),
  }));

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <Navbar />

      <main className="flex-1 flex flex-col items-center w-full">
        <div className="w-full max-w-7xl px-4 md:px-10 py-8">
          <LibraryClient
            plants={serializedPlants}
            diseases={serializedDiseases}
            symptoms={symptoms}
            conditions={conditions}
          />
        </div>
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
}
