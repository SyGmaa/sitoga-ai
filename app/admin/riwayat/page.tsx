import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function AdminRiwayatPage() {
  const riwayatList = await prisma.riwayatDiagnosa.findMany({
    orderBy: { createdAt: "desc" },
  });

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

      <div className="bg-white/60 dark:bg-[#0a1e0f]/50 backdrop-blur-md border border-white/40 dark:border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.05)] dark:shadow-[0_4px_30px_rgba(0,0,0,0.3)] rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-200/50 dark:border-slate-700/50 text-slate-500 dark:text-slate-400 uppercase tracking-wider text-xs">
              <tr>
                <th className="px-6 py-5 font-bold" scope="col">Tanggal</th>
                <th className="px-6 py-5 font-bold" scope="col">Keluhan Pengguna</th>
                <th className="px-6 py-5 font-bold" scope="col">Hasil Diagnosa</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/50 dark:divide-slate-700/50">
              {riwayatList.map(riwayat => {
                const hasil = riwayat.hasilDiagnosa as any;
                const namaPenyakit = hasil?.nama_penyakit || "Tidak diketahui";
                const tanaman = hasil?.tanaman_obat;

                return (
                  <tr key={riwayat.id} className="hover:bg-white/40 dark:hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0 group-hover:scale-110 transition-transform">
                          <span className="material-symbols-outlined text-xl">medical_services</span>
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 dark:text-white text-sm">
                            {riwayat.createdAt.toLocaleDateString("id-ID", { dateStyle: "long" })}
                          </p>
                          <p className="text-xs text-slate-400">
                            {riwayat.createdAt.toLocaleTimeString("id-ID", { timeStyle: "short" })}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-slate-700 dark:text-slate-300 max-w-xs truncate font-medium">
                        {riwayat.keluhanPengguna}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800 w-fit">
                          <span className="material-symbols-outlined text-sm">vaccines</span>
                          {namaPenyakit}
                        </span>
                        {Array.isArray(tanaman) && tanaman.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {tanaman.slice(0, 3).map((t: any, i: number) => (
                              <span key={i} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                                🌿 {typeof t === "string" ? t : t.nama || t.namaLokal || "Tanaman"}
                              </span>
                            ))}
                            {tanaman.length > 3 && (
                              <span className="text-xs text-slate-400">+{tanaman.length - 3} lainnya</span>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {riwayatList.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="h-16 w-16 rounded-full bg-slate-100 dark:bg-slate-800/50 flex items-center justify-center text-slate-400">
                        <span className="material-symbols-outlined text-3xl">history</span>
                      </div>
                      <p className="text-slate-500 font-medium">Belum ada riwayat diagnosa.</p>
                      <p className="text-slate-400 text-xs">Riwayat akan muncul setelah pengguna melakukan konsultasi.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
