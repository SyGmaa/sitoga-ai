"use server";

import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const prisma = new PrismaClient();

export async function getTanamanById(id: string) {
  try {
    const tanaman = await prisma.tanaman.findUnique({
      where: { id },
      include: {
        resepPengolahan: true,
        penyakitTerkait: {
          include: {
            penyakit: true
          }
        }
      }
    });
    
    return { success: true, data: tanaman };
  } catch (error) {
    console.error("Error fetching tanaman by ID:", error);
    return { success: false, error: "Failed to fetch plant details." };
  }
}

export async function getAllTanaman() {
  try {
    const tanamanList = await prisma.tanaman.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return { success: true, data: tanamanList };
  } catch (error) {
    console.error("Error fetching all tanaman:", error);
    return { success: false, error: "Failed to fetch plants." };
  }
}

export async function createTanaman(formData: FormData) {
  try {
    const namaLokal = formData.get("namaLokal") as string;
    const namaLatin = formData.get("namaLatin") as string;
    const deskripsi = formData.get("deskripsi") as string;
    const lokasiTanam = formData.get("lokasiTanam") as string;
    const kandunganSenyawa = formData.get("kandunganSenyawa") as string;
    const khasiatUtama = formData.get("khasiatUtama") as string;
    const gambarUrlRaw = formData.get("gambarUrl") as string;
    
    const gambarUrl = gambarUrlRaw ? gambarUrlRaw : null;
    
    await prisma.tanaman.create({
      data: {
        namaLokal,
        namaLatin,
        deskripsi,
        lokasiTanam,
        kandunganSenyawa,
        khasiatUtama,
        gambarUrl
      }
    });
  } catch (error) {
    console.error("Error creating tanaman:", error);
    return { success: false, error: "Failed to create plant." };
  }
  
  revalidatePath('/admin/tanaman');
  redirect('/admin/tanaman');
}
