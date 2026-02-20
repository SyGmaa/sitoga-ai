import Link from 'next/link';
import { getAllPenyakit } from '@/actions/penyakit';

export default async function AdminPenyakitPage() {
  const result = await getAllPenyakit();
  const penyakitList = result.success && result.data ? result.data : [];

  return (
    <div className="flex flex-col gap-6 animate-[slide-up_0.5s_ease-out_forwards]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Data Penyakit</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Manage ailments that the AI can diagnose.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin/penyakit/baru" className="bg-primary hover:bg-[#0dbd2a] text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-primary/30 transition-all hover:scale-105 flex items-center gap-2">
            <span className="material-symbols-outlined text-base">add</span> New Ailment
          </Link>
        </div>
      </div>

      <div className="bg-white/60 dark:bg-[#0a1e0f]/50 backdrop-blur-md border border-white/40 dark:border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.05)] dark:shadow-[0_4px_30px_rgba(0,0,0,0.3)] rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-200/50 dark:border-slate-700/50 text-slate-500 dark:text-slate-400 uppercase tracking-wider text-xs">
              <tr>
                <th className="px-6 py-5 font-bold" scope="col">Nama Penyakit / Keluhan</th>
                <th className="px-6 py-5 font-bold hidden md:table-cell" scope="col">Deskripsi</th>
                <th className="px-6 py-5 font-bold text-center" scope="col">Terhubung ke Gejala</th>
                <th className="px-6 py-5 font-bold text-right" scope="col">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/50 dark:divide-slate-700/50">
              {penyakitList.map(penyakit => (
                <tr key={penyakit.id} className="hover:bg-white/40 dark:hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4">
                     <span className="font-bold text-slate-900 dark:text-slate-100 text-base">
                        {penyakit.nama}
                     </span>
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell max-w-[300px] truncate text-slate-600 dark:text-slate-300">
                     {penyakit.deskripsi || <span className="text-slate-400 italic">No description</span>}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800">
                      {penyakit._count.tanamanObat}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                      <Link href={`/admin/penyakit/${penyakit.id}/edit`} className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-lg text-slate-400 hover:text-blue-500 hover:shadow-sm transition-all inline-flex items-center justify-center">
                        <span className="material-symbols-outlined text-lg">edit</span>
                      </Link>
                      <button className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-lg text-slate-400 hover:text-red-500 hover:shadow-sm transition-all inline-flex items-center justify-center">
                        <span className="material-symbols-outlined text-lg">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              
              {penyakitList.length === 0 && (
                <tr>
                   <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                     No ailments found. Click "New Ailment" to add one.
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
