const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const initialModels = [
  { provider: "google", modelId: "gemini-2.5-flash", label: "Gemini 2.5 Flash", badge: "Recommended", isActive: true, isDefault: true },
  { provider: "google", modelId: "gemini-3-flash-preview", label: "Gemini 3 Flash", badge: "New", isActive: true, isDefault: false },
  { provider: "google", modelId: "gemini-2.5-flash-lite", label: "Gemini 2.5 Flash Lite", badge: "Fast", isActive: true, isDefault: false },
  { provider: "openrouter", modelId: "mistralai/mistral-small-3.1-24b-instruct:free", label: "Mistral Small", badge: "Free", isActive: true, isDefault: false },
  { provider: "openrouter", modelId: "arcee-ai/trinity-large-preview:free", label: "Trinity Large", badge: "Free", isActive: true, isDefault: false },
  { provider: "openrouter", modelId: "cognitivecomputations/dolphin-mistral-24b-venice-edition:free", label: "Dolphin Mistral", badge: "Free", isActive: true, isDefault: false },
  { provider: "openrouter", modelId: "deepseek/deepseek-r1-0528:free", label: "DeepSeek R1", badge: "Free", isActive: true, isDefault: false },
];

async function main() {
  console.log('Start initializing AI models...');
  for (const item of initialModels) {
    const model = await prisma.aiModel.upsert({
      where: { modelId: item.modelId },
      update: item,
      create: item,
    });
    console.log(`Upserted model: ${model.label} (${model.modelId})`);
  }
  console.log('Initialization finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
