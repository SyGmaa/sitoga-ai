"use server";

import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { writeFile } from "fs/promises";
import path from "path";

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
    const resepPengolahanRaw = formData.get("resepPengolahan") as string;
    
    let resepPengolahan: string[] = [];
    try {
      if (resepPengolahanRaw) {
        resepPengolahan = JSON.parse(resepPengolahanRaw);
      }
    } catch (e) {
      console.error("Error parsing resepPengolahan:", e);
    }
    
    let gambarUrl = null;
    const gambarFile = formData.get("gambar") as File;
    
    if (gambarFile && gambarFile.size > 0) {
      const buffer = Buffer.from(await gambarFile.arrayBuffer());
      const filename = `${Date.now()}_${gambarFile.name.replace(/\s+/g, '_')}`;
      const uploadDir = path.join(process.cwd(), "public/uploads/tanaman");
      
      try {
        await writeFile(path.join(uploadDir, filename), buffer);
        gambarUrl = `/uploads/tanaman/${filename}`;
      } catch (e) {
        console.error("Error saving file:", e);
      }
    } else {
      // Fallback for when no file is uploaded but a user might provide a URL string through a different field (legacy)
      const gambarUrlRaw = formData.get("gambarUrl") as string;
      gambarUrl = gambarUrlRaw ? gambarUrlRaw : null;
    }
    
    await prisma.tanaman.create({
      data: {
        namaLokal,
        namaLatin,
        deskripsi,
        lokasiTanam,
        kandunganSenyawa,
        khasiatUtama,
        gambarUrl,
        ...(resepPengolahan.length > 0 && {
          resepPengolahan: {
            create: resepPengolahan.map((langkah) => ({ langkah }))
          }
        })
      }
    });
  } catch (error) {
    console.error("Error creating tanaman:", error);
    return { success: false, error: "Failed to create plant." };
  }
  
  revalidatePath('/admin/tanaman');
  redirect('/admin/tanaman');
}

export async function updateTanaman(id: string, formData: FormData) {
  try {
    const namaLokal = formData.get("namaLokal") as string;
    const namaLatin = formData.get("namaLatin") as string;
    const deskripsi = formData.get("deskripsi") as string;
    const lokasiTanam = formData.get("lokasiTanam") as string;
    const kandunganSenyawa = formData.get("kandunganSenyawa") as string;
    const khasiatUtama = formData.get("khasiatUtama") as string;
    const resepPengolahanRaw = formData.get("resepPengolahan") as string;
    
    let resepPengolahan: string[] = [];
    try {
      if (resepPengolahanRaw) {
        resepPengolahan = JSON.parse(resepPengolahanRaw);
      }
    } catch (e) {
      console.error("Error parsing resepPengolahan:", e);
    }
    
    let gambarUrl = undefined;
    const gambarFile = formData.get("gambar") as File;
    
    if (gambarFile && gambarFile.size > 0) {
      const buffer = Buffer.from(await gambarFile.arrayBuffer());
      const filename = `${Date.now()}_${gambarFile.name.replace(/\s+/g, '_')}`;
      const uploadDir = path.join(process.cwd(), "public/uploads/tanaman");
      
      try {
        await writeFile(path.join(uploadDir, filename), buffer);
        gambarUrl = `/uploads/tanaman/${filename}`;
      } catch (e) {
        console.error("Error saving file:", e);
      }
    } else {
      // Allow clearing or keeping existing URL
      const gambarUrlRaw = formData.get("gambarUrl") as string;
      if (gambarUrlRaw !== null && gambarUrlRaw !== undefined) {
         gambarUrl = gambarUrlRaw;
      }
    }
    
    await prisma.tanaman.update({
      where: { id },
      data: {
        namaLokal,
        namaLatin,
        deskripsi,
        lokasiTanam,
        kandunganSenyawa,
        khasiatUtama,
        ...(gambarUrl !== undefined ? { gambarUrl } : {}),
        resepPengolahan: {
          deleteMany: {}, // Hapus langkah lama
          create: resepPengolahan.map((langkah) => ({ langkah })) // Buat baru dari form
        }
      }
    });
  } catch (error) {
    console.error("Error updating tanaman:", error);
    return { success: false, error: "Failed to update plant." };
  }
  
  revalidatePath('/admin/tanaman');
  revalidatePath(`/admin/tanaman/${id}`);
  redirect('/admin/tanaman');
}

