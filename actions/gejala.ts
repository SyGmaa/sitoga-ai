"use server";

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getAllGejala() {
  try {
    const gejalaList = await prisma.gejala.findMany({
      orderBy: { nama: 'asc' },
      include: {
        _count: {
          select: { penyakit: true }
        }
      }
    });
    return { success: true, data: gejalaList };
  } catch (error) {
    console.error("Error fetching all gejala:", error);
    return { success: false, error: "Failed to fetch symptoms." };
  }
}

export async function createGejala(formData: FormData) {
  try {
    const nama = formData.get("nama") as string;
    
    await prisma.gejala.create({
      data: {
        nama,
      }
    });

    return { success: true };
  } catch (error) {
    console.error("Error creating gejala:", error);
    return { success: false, error: "Failed to create symptom." };
  }
}
