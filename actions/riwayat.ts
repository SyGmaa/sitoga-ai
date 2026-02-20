"use server";

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function saveRiwayatDiagnosa(
  keluhanPengguna: string,
  hasilDiagnosa: any
) {
  try {
    const riwayat = await prisma.riwayatDiagnosa.create({
      data: {
        keluhanPengguna,
        hasilDiagnosa
      }
    });
    return { success: true, riwayat };
  } catch (error) {
    console.error("Failed to save diagnosa riwayat:", error);
    return { success: false, error: "Gagal menyimpan riwayat" };
  }
}
