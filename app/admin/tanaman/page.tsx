import Link from 'next/link';
import { getAllTanaman } from '@/actions/tanaman';
import Image from 'next/image';

export default async function AdminTanamanPage() {
  const result = await getAllTanaman();
  const tanamanList = result.success && result.data ? result.data : [];

  return (
    <div className="flex flex-col gap-6 animate-[slide-up_0.5s_ease-out_forwards]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Data Tanaman</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Manage entries and update existing medicinal plants.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin/tanaman/baru" className="bg-primary hover:bg-[#0dbd2a] text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-primary/30 transition-all hover:scale-105 flex items-center gap-2">
            <span className="material-symbols-outlined text-base">add</span> New Plant
          </Link>
        </div>
      </div>

      <div className="bg-white/60 dark:bg-[#0a1e0f]/50 backdrop-blur-md border border-white/40 dark:border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.05)] dark:shadow-[0_4px_30px_rgba(0,0,0,0.3)] rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-200/50 dark:border-slate-700/50 text-slate-500 dark:text-slate-400 uppercase tracking-wider text-xs">
              <tr>
                <th className="px-6 py-5 font-bold" scope="col">Plant Name</th>
                <th className="px-6 py-5 font-bold hidden sm:table-cell" scope="col">Scientific Name</th>
                <th className="px-6 py-5 font-bold hidden md:table-cell" scope="col">Lokasi</th>
                <th className="px-6 py-5 font-bold hidden lg:table-cell" scope="col">Khasiat</th>
                <th className="px-6 py-5 font-bold text-right" scope="col">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/50 dark:divide-slate-700/50">
              {tanamanList.map(tanaman => (
                <tr key={tanaman.id} className="hover:bg-white/40 dark:hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      {tanaman.gambarUrl ? (
                         <div className="h-12 w-12 rounded-xl bg-cover bg-center shadow-md group-hover:scale-110 transition-transform duration-300" style={{ backgroundImage: `url(${tanaman.gambarUrl})` }}></div>
                      ) : (
                         <div className="h-12 w-12 rounded-xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                           <span className="material-symbols-outlined text-slate-400">local_florist</span>
                         </div>
                      )}
                     
                      <div>
                        <Link href={`/tanaman/${tanaman.id}`} className="font-bold text-slate-900 dark:text-slate-100 text-base hover:text-primary transition-colors">
                          {tanaman.namaLokal}
                        </Link>
                        <div className="text-xs text-slate-500 sm:hidden max-w-[120px] truncate">{tanaman.namaLatin}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-300 italic hidden sm:table-cell">{tanaman.namaLatin}</td>
                  <td className="px-6 py-4 hidden md:table-cell">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800 truncate max-w-[150px]">
                      {tanaman.lokasiTanam}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500 hidden lg:table-cell max-w-[200px] truncate">
                    {tanaman.khasiatUtama}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                      <Link href={`/admin/tanaman/${tanaman.id}/edit`} className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-lg text-slate-400 hover:text-blue-500 hover:shadow-sm transition-all inline-flex items-center justify-center">
                        <span className="material-symbols-outlined text-lg">edit</span>
                      </Link>
                      {/* Note: Disabling delete button visually for now until delete action is wired up */}
                      <button className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-lg text-slate-400 hover:text-red-500 hover:shadow-sm transition-all inline-flex items-center justify-center" title="Delete functionality requires further setup.">
                        <span className="material-symbols-outlined text-lg">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              
              {tanamanList.length === 0 && (
                <tr>
                   <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                     No plants found. Click "New Plant" to add one.
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
