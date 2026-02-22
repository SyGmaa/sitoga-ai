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
export async function getGejalaById(id: string) {
  try {
    const gejala = await prisma.gejala.findUnique({
      where: { id },
    });
    return { success: true, data: gejala };
  } catch (error) {
    console.error("Error fetching gejala by id:", error);
    return { success: false, error: "Failed to fetch symptom." };
  }
}

export async function updateGejala(id: string, formData: FormData) {
  try {
    const nama = formData.get("nama") as string;
    
    await prisma.gejala.update({
      where: { id },
      data: {
        nama,
      }
    });

    return { success: true };
  } catch (error) {
    console.error("Error updating gejala:", error);
    return { success: false, error: "Failed to update symptom." };
  }
}

export async function deleteGejala(id: string) {
  try {
    await prisma.gejala.delete({
      where: { id }
    });
    return { success: true };
  } catch (error) {
    console.error("Error deleting gejala:", error);
    return { success: false, error: "Failed to delete symptom." };
  }
}
