import Link from 'next/link';
import { getAllTanaman } from '@/actions/tanaman';
import Image from 'next/image';
import { QRButton } from '@/components/QRButton';
import { DeleteTanamanButton } from '@/components/DeleteTanamanButton';

export default async function AdminTanamanPage() {
  const result = await getAllTanaman();
  const tanamanList = result.success && result.data ? result.data : [];

  return (
    <div className="flex flex-col gap-6 animate-[slide-up_0.5s_ease-out_forwards]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Data Tanaman</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base">Kelola daftar tanaman obat dan informasi detailnya.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin/tanaman/parser" className="fixed bottom-24 right-6 w-14 h-14 rounded-full z-50 shadow-2xl bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-center sm:static sm:w-auto sm:h-auto sm:rounded-xl sm:px-5 sm:py-2.5 sm:shadow-lg sm:shadow-purple-500/30 sm:z-auto transition-all hover:scale-[1.02] active:scale-95 text-sm font-bold gap-2" title="Input data menggunakan AI">
            <span className="material-symbols-outlined text-2xl sm:text-base">psychology</span> 
            <span className="hidden sm:inline">Input Smart AI</span>
          </Link>
          <Link href="/admin/tanaman/baru" className="fixed bottom-6 right-6 w-14 h-14 rounded-full z-50 shadow-2xl bg-primary text-white flex items-center justify-center sm:static sm:w-auto sm:h-auto sm:rounded-xl sm:px-5 sm:py-2.5 sm:shadow-lg sm:shadow-primary/30 sm:z-auto hover:bg-primary-hover transition-all hover:scale-[1.02] active:scale-95 text-sm font-bold gap-2">
            <span className="material-symbols-outlined text-2xl sm:text-base">add</span> 
            <span className="hidden sm:inline">Tanaman Baru</span>
          </Link>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-white/60 dark:bg-[#0a1e0f]/50 backdrop-blur-md border border-white/40 dark:border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.05)] dark:shadow-[0_4px_30px_rgba(0,0,0,0.3)] rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-200/50 dark:border-slate-700/50 text-slate-500 dark:text-slate-400 uppercase tracking-wider text-xs font-bold">
              <tr>
                <th className="px-6 py-5" scope="col">Nama Tanaman</th>
                <th className="px-6 py-5 hidden lg:table-cell" scope="col">Nama Ilmiah</th>

                <th className="px-6 py-5 hidden xl:table-cell" scope="col">Khasiat Utama</th>
                <th className="px-6 py-5 text-right" scope="col">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/50 dark:divide-slate-700/50">
              {tanamanList.map(tanaman => (
                <tr key={tanaman.id} className="hover:bg-white/40 dark:hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      {tanaman.gambarUrl ? (
                         <div className="h-12 w-12 rounded-xl bg-cover bg-center shadow-md group-hover:scale-110 transition-transform duration-300 border border-white/20" style={{ backgroundImage: `url(${tanaman.gambarUrl})` }}></div>
                      ) : (
                         <div className="h-12 w-12 rounded-xl bg-slate-200 dark:bg-slate-800/50 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300 border border-slate-200 dark:border-slate-700">
                           <span className="material-symbols-outlined text-slate-400">local_florist</span>
                         </div>
                      )}
                     
                      <div className="flex flex-col">
                        <Link href={`/tanaman/${tanaman.id}`} className="font-bold text-slate-900 dark:text-slate-100 text-base hover:text-primary transition-colors leading-tight">
                          {tanaman.namaLokal}
                        </Link>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 italic mt-0.5 lg:hidden">{tanaman.namaLatin}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-300 italic hidden lg:table-cell">{tanaman.namaLatin}</td>

                  <td className="px-6 py-4 text-slate-500 dark:text-slate-400 hidden xl:table-cell max-w-[250px] truncate text-xs">
                    {tanaman.khasiatUtama}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                      <QRButton plantId={tanaman.id} plantName={tanaman.namaLokal} />
                      <Link href={`/admin/tanaman/${tanaman.id}/edit`} className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-lg text-slate-400 hover:text-blue-500 hover:shadow-sm transition-all inline-flex items-center justify-center" title="Edit Tanaman">
                        <span className="material-symbols-outlined text-lg">edit</span>
                      </Link>
                      <DeleteTanamanButton id={tanaman.id} name={tanaman.namaLokal} />
                    </div>
                  </td>
                </tr>
              ))}
              
              {tanamanList.length === 0 && (
                <tr>
                   <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                     Belum ada data tanaman. Klik &quot;Tanaman Baru&quot; untuk menambahkan.
                   </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {tanamanList.map(tanaman => (
          <div key={tanaman.id} className="bg-white/60 dark:bg-[#0a1e0f]/50 backdrop-blur-md border border-white/40 dark:border-white/10 shadow-sm rounded-3xl p-4 flex flex-col gap-4">
            <div className="flex items-center gap-4">
              {tanaman.gambarUrl ? (
                 <div className="h-16 w-16 rounded-2xl bg-cover bg-center shadow-md border border-white/20 shrink-0" style={{ backgroundImage: `url(${tanaman.gambarUrl})` }}></div>
              ) : (
                 <div className="h-16 w-16 rounded-2xl bg-slate-200 dark:bg-slate-800/50 flex items-center justify-center shadow-md border border-slate-200 dark:border-slate-700 shrink-0">
                   <span className="material-symbols-outlined text-slate-400 text-2xl">local_florist</span>
                 </div>
              )}
              <div className="flex-1 min-w-0">
                <Link href={`/tanaman/${tanaman.id}`} className="font-bold text-slate-900 dark:text-slate-100 text-lg hover:text-primary transition-colors block truncate leading-tight">
                  {tanaman.namaLokal}
                </Link>
                <p className="text-xs text-slate-500 dark:text-slate-400 italic truncate mt-0.5">{tanaman.namaLatin}</p>

              </div>
            </div>

            <div className="bg-slate-50/50 dark:bg-black/20 rounded-2xl p-3 border border-slate-100/50 dark:border-white/5">
              <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Khasiat Utama</p>
              <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                {tanaman.khasiatUtama || <span className="italic text-slate-400">Tidak ada informasi khasiat.</span>}
              </p>
            </div>

            <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-white/5 mt-auto">
              <div className="flex items-center gap-1">
                <QRButton plantId={tanaman.id} plantName={tanaman.namaLokal} />
              </div>
              <div className="flex items-center gap-2">
                <Link href={`/admin/tanaman/${tanaman.id}/edit`} className="flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-slate-800/80 rounded-xl text-slate-600 dark:text-slate-300 font-bold text-xs shadow-sm border border-slate-100 dark:border-slate-700 active:scale-95 transition-all">
                  <span className="material-symbols-outlined text-base">edit</span>
                  Edit
                </Link>
                <DeleteTanamanButton id={tanaman.id} name={tanaman.namaLokal} />
              </div>
            </div>
          </div>
        ))}

        {tanamanList.length === 0 && (
          <div className="bg-white/60 dark:bg-[#0a1e0f]/50 backdrop-blur-md border border-white/40 dark:border-white/10 rounded-3xl p-10 text-center text-slate-500 text-sm">
            Belum ada data tanaman.
          </div>
        )}
      </div>
    </div>
  );
}
