"use server";

import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient();

export async function getAiModels() {
  return await prisma.aiModel.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function upsertAiModel(data: {
  id?: string;
  provider: string;
  modelId: string;
  label: string;
  badge?: string | null;
  isActive: boolean;
  isDefault: boolean;
}) {
  if (data.isDefault) {
    // If setting as default, unset others first
    await prisma.aiModel.updateMany({
      where: { isDefault: true },
      data: { isDefault: false },
    });
  }

  const result = await prisma.aiModel.upsert({
    where: { modelId: data.modelId },
    update: {
      provider: data.provider,
      label: data.label,
      badge: data.badge,
      isActive: data.isActive,
      isDefault: data.isDefault,
    },
    create: {
      provider: data.provider,
      modelId: data.modelId,
      label: data.label,
      badge: data.badge,
      isActive: data.isActive,
      isDefault: data.isDefault,
    },
  });

  revalidatePath("/admin/models");
  revalidatePath("/diagnosa");
  return result;
}

export async function deleteAiModel(id: string) {
  await prisma.aiModel.delete({
    where: { id },
  });
  revalidatePath("/admin/models");
  revalidatePath("/diagnosa");
}

export async function toggleAiModelStatus(id: string, isActive: boolean) {
  await prisma.aiModel.update({
    where: { id },
    data: { isActive },
  });
  revalidatePath("/admin/models");
  revalidatePath("/diagnosa");
}
