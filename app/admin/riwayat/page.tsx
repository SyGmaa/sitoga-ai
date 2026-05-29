import { PrismaClient } from "@prisma/client";
import RiwayatTableClient from "./RiwayatTableClient";

const prisma = new PrismaClient();

export default async function AdminRiwayatPage() {
  const riwayatList = await prisma.riwayatDiagnosa.findMany({
    orderBy: { createdAt: "desc" },
  });

  // Serialize Date objects for safe Server-to-Client component transmission
  const serializedList = riwayatList.map(r => ({
    ...r,
    createdAt: r.createdAt.toISOString(),
  }));

  return (
    <div className="flex flex-col gap-6 animate-[slide-up_0.5s_ease-out_forwards]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Log Diagnosa AI</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Riwayat seluruh konsultasi diagnosa oleh pengguna.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="bg-white/45 dark:bg-[#1e3223]/40 backdrop-blur-sm border border-white/30 dark:border-white/5 px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 text-slate-600 dark:text-slate-300">
            <span className="material-symbols-outlined text-base">database</span>
            {riwayatList.length} Records
          </span>
        </div>
      </div>

      <RiwayatTableClient initialList={serializedList} />
    </div>
  );
}
