"use server";

import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const prisma = new PrismaClient();

export async function getAllKondisiMedis() {
  try {
    const list = await prisma.kondisiMedis.findMany({
      orderBy: { nama: 'asc' },
      include: {
        _count: {
          select: { pantanganTanaman: true }
        }
      }
    });
    return { success: true, data: list };
  } catch (error) {
    console.error("Error fetching all kondisi medis:", error);
    return { success: false, error: "Failed to fetch medical conditions." };
  }
}

export async function createKondisiMedis(formData: FormData) {
  try {
    const nama = formData.get("nama") as string;
    const deskripsi = (formData.get("deskripsi") as string) || null;

    await prisma.kondisiMedis.create({
      data: { nama, deskripsi },
    });
  } catch (error: any) {
    console.error("Error creating kondisi medis:", error);
    if (error?.code === "P2002") {
      return { success: false, error: "Kondisi medis dengan nama tersebut sudah ada." };
    }
    return { success: false, error: "Failed to create medical condition." };
  }

  revalidatePath('/admin/kondisi-medis');
  redirect('/admin/kondisi-medis');
}

export async function getKondisiMedisById(id: string) {
  try {
    const kondisi = await prisma.kondisiMedis.findUnique({
      where: { id },
    });
    return { success: true, data: kondisi };
  } catch (error) {
    console.error("Error fetching kondisi medis by id:", error);
    return { success: false, error: "Failed to fetch medical condition." };
  }
}

export async function updateKondisiMedis(id: string, formData: FormData) {
  try {
    const nama = formData.get("nama") as string;
    const deskripsi = (formData.get("deskripsi") as string) || null;

    await prisma.kondisiMedis.update({
      where: { id },
      data: { nama, deskripsi },
    });
  } catch (error: any) {
    console.error("Error updating kondisi medis:", error);
    if (error?.code === "P2002") {
      return { success: false, error: "Kondisi medis dengan nama tersebut sudah ada." };
    }
    return { success: false, error: "Failed to update medical condition." };
  }

  revalidatePath('/admin/kondisi-medis');
  redirect('/admin/kondisi-medis');
}

export async function deleteKondisiMedis(id: string) {
  try {
    await prisma.kondisiMedis.delete({
      where: { id },
    });
    return { success: true };
  } catch (error) {
    console.error("Error deleting kondisi medis:", error);
    return { success: false, error: "Failed to delete medical condition." };
  }
}
