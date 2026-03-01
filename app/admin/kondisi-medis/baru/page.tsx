import Link from 'next/link';
import { TambahKondisiMedisForm } from './TambahKondisiMedisForm';

export default function TambahKondisiMedisPage() {
  return (
    <div className="flex flex-col gap-8 animate-[slide-up_0.5s_ease-out_forwards]">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">Tambah Kondisi Medis</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">Buat entri kondisi medis baru untuk data pantangan.</p>
        </div>
        <div className="flex gap-3">
          <Link href="/admin/kondisi-medis" className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px]">cancel</span>
            Cancel
          </Link>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        <div className="w-full xl:w-2/3 flex flex-col gap-8">
          <div className="bg-white/60 dark:bg-[#0a1e0f]/50 backdrop-blur-md border border-white/40 dark:border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.05)] dark:shadow-[0_4px_30px_rgba(0,0,0,0.3)] rounded-3xl p-6 md:p-10 relative transition-all">
            <TambahKondisiMedisForm />
          </div>
        </div>

        <div className="hidden xl:col-span-1 xl:flex flex-col gap-6 sticky top-24 w-1/3">
          <div className="bg-white/40 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-xl p-6">
             <div className="flex items-center gap-3 mb-4">
               <span className="material-symbols-outlined text-amber-500 text-3xl">info</span>
               <h3 className="text-lg font-bold text-slate-900 dark:text-white">Panduan</h3>
             </div>
             <ul className="space-y-4 text-sm text-slate-600 dark:text-slate-400">
               <li className="flex gap-2">
                 <span className="material-symbols-outlined text-amber-500 text-sm mt-0.5">check_circle</span>
                 Gunakan nama yang jelas dan spesifik, contoh: &quot;Hamil&quot;, &quot;Diabetes&quot;, &quot;Hipertensi&quot;.
               </li>
               <li className="flex gap-2">
                 <span className="material-symbols-outlined text-amber-500 text-sm mt-0.5">check_circle</span>
                 Nama kondisi harus unik dan tidak boleh duplikat.
               </li>
               <li className="flex gap-2">
                 <span className="material-symbols-outlined text-amber-500 text-sm mt-0.5">check_circle</span>
                 Deskripsi opsional, untuk penjelasan lebih lanjut.
               </li>
             </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
