import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const penyakitData = await prisma.penyakit.findMany({
      include: {
        gejala: {
          include: {
            gejala: true,
          }
        },
        tanamanObat: {
          include: {
            tanaman: true
          }
        }
      }
    });

    const knowledgeBase = penyakitData.map(p => {
      const gejalaList = p.gejala.map(g => g.gejala.nama).join(', ');
      const tanamanList = p.tanamanObat.map(t => `${t.tanaman.namaLokal} (ID: ${t.tanaman.id})`).join(', ');
      return `Penyakit: ${p.nama}\nGejala: ${gejalaList}\nTanaman Pengobatan yang direkomendasikan beserta ID-nya: ${tanamanList || 'Belum ada data tanaman'}`;
    }).join('\n\n---\n\n');

    console.log(knowledgeBase);
}
main();
