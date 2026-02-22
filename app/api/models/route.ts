import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const models = await prisma.aiModel.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "asc" },
    });
    return Response.json(models);
  } catch (error) {
    console.error("Failed to fetch AI models:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
