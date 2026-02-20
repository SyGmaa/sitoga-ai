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
    
    await prisma.penyakit.create({
      data: {
        nama,
        deskripsi,
      }
    });

    return { success: true };
  } catch (error) {
    console.error("Error creating penyakit:", error);
    return { success: false, error: "Failed to create ailment." };
  }
}
