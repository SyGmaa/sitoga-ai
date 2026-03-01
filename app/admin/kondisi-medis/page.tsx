import Link from 'next/link';
import { getAllKondisiMedis } from '@/actions/kondisiMedis';
import { DeleteKondisiMedisButton } from '@/components/DeleteKondisiMedisButton';

export default async function AdminKondisiMedisPage() {
  const result = await getAllKondisiMedis();
  const kondisiList = result.success && result.data ? result.data : [];

  return (
    <div className="flex flex-col gap-6 animate-[slide-up_0.5s_ease-out_forwards]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Kondisi Medis</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Kelola data kondisi medis untuk pantangan tanaman.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin/kondisi-medis/baru" className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-primary/30 transition-all hover:scale-105 flex items-center gap-2">
            <span className="material-symbols-outlined text-base">add</span> Tambah Kondisi
          </Link>
        </div>
      </div>

      <div className="bg-white/60 dark:bg-[#0a1e0f]/50 backdrop-blur-md border border-white/40 dark:border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.05)] dark:shadow-[0_4px_30px_rgba(0,0,0,0.3)] rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-200/50 dark:border-slate-700/50 text-slate-500 dark:text-slate-400 uppercase tracking-wider text-xs">
              <tr>
                <th className="px-6 py-5 font-bold" scope="col">Nama Kondisi</th>
                <th className="px-6 py-5 font-bold" scope="col">Deskripsi</th>
                <th className="px-6 py-5 font-bold text-center" scope="col">Jumlah Pantangan</th>
                <th className="px-6 py-5 font-bold text-right" scope="col">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/50 dark:divide-slate-700/50">
              {kondisiList.map(kondisi => (
                <tr key={kondisi.id} className="hover:bg-white/40 dark:hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4">
                    <span className="font-bold text-slate-900 dark:text-slate-100 text-base">
                      {kondisi.nama}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-slate-600 dark:text-slate-400 text-sm truncate max-w-xs block">
                      {kondisi.deskripsi || <span className="italic text-slate-400">—</span>}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                      {kondisi._count.pantanganTanaman}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                      <Link href={`/admin/kondisi-medis/${kondisi.id}/edit`} className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-lg text-slate-400 hover:text-blue-500 hover:shadow-sm transition-all inline-flex items-center justify-center">
                        <span className="material-symbols-outlined text-lg">edit</span>
                      </Link>
                      <DeleteKondisiMedisButton id={kondisi.id} />
                    </div>
                  </td>
                </tr>
              ))}
              
              {kondisiList.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                    Belum ada kondisi medis. Klik &quot;Tambah Kondisi&quot; untuk menambahkan.
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
