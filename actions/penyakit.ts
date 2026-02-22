"use server";

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getAllPenyakit() {
  try {
    const penyakitList = await prisma.penyakit.findMany({
      orderBy: { nama: 'asc' },
      include: {
        _count: {
          select: { gejala: true, tanamanObat: true }
        }
      }
    });
    return { success: true, data: penyakitList };
  } catch (error) {
    console.error("Error fetching all penyakit:", error);
    return { success: false, error: "Failed to fetch ailments." };
  }
}

export async function createPenyakit(formData: FormData) {
  try {
    const nama = formData.get("nama") as string;
    const deskripsi = formData.get("deskripsi") as string;
    const gejalaIdsRaw = formData.get("gejalaIds") as string;
    const tanamanIdsRaw = formData.get("tanamanIds") as string;

    const gejalaIds: string[] = gejalaIdsRaw ? JSON.parse(gejalaIdsRaw) : [];
    const tanamanIds: string[] = tanamanIdsRaw ? JSON.parse(tanamanIdsRaw) : [];

    await prisma.penyakit.create({
      data: {
        nama,
        deskripsi,
        gejala: {
          create: gejalaIds.map((id) => ({ gejalaId: id })),
        },
        tanamanObat: {
          create: tanamanIds.map((id) => ({ tanamanId: id })),
        },
      }
    });

    return { success: true };
  } catch (error) {
    console.error("Error creating penyakit:", error);
    return { success: false, error: "Failed to create ailment." };
  }
}
export async function getPenyakitById(id: string) {
  try {
    const penyakit = await prisma.penyakit.findUnique({
      where: { id },
      include: {
        gejala: {
          select: { gejalaId: true }
        },
        tanamanObat: {
          select: { tanamanId: true }
        }
      }
    });
    return { success: true, data: penyakit };
  } catch (error) {
    console.error("Error fetching penyakit by id:", error);
    return { success: false, error: "Failed to fetch ailment." };
  }
}

export async function updatePenyakit(id: string, formData: FormData) {
  try {
    const nama = formData.get("nama") as string;
    const deskripsi = formData.get("deskripsi") as string;
    const gejalaIdsRaw = formData.get("gejalaIds") as string;
    const tanamanIdsRaw = formData.get("tanamanIds") as string;

    const gejalaIds: string[] = gejalaIdsRaw ? JSON.parse(gejalaIdsRaw) : [];
    const tanamanIds: string[] = tanamanIdsRaw ? JSON.parse(tanamanIdsRaw) : [];

    await prisma.$transaction([
      // Hapus relasi lama
      prisma.penyakitGejala.deleteMany({ where: { penyakitId: id } }),
      prisma.tanamanPenyakit.deleteMany({ where: { penyakitId: id } }),
      
      // Update data penyakit
      prisma.penyakit.update({
        where: { id },
        data: {
          nama,
          deskripsi,
          gejala: {
            create: gejalaIds.map((gId) => ({ gejalaId: gId })),
          },
          tanamanObat: {
            create: tanamanIds.map((tId) => ({ tanamanId: tId })),
          },
        }
      })
    ]);

    return { success: true };
  } catch (error) {
    console.error("Error updating penyakit:", error);
    return { success: false, error: "Failed to update ailment." };
  }
}

export async function deletePenyakit(id: string) {
  try {
    await prisma.penyakit.delete({
      where: { id }
    });
    return { success: true };
  } catch (error) {
    console.error("Error deleting penyakit:", error);
    return { success: false, error: "Failed to delete ailment." };
  }
}
