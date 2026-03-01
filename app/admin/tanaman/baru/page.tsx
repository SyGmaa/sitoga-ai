import Link from 'next/link';
import { TambahTanamanForm } from './TambahTanamanForm';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function TambahTanamanPage() {
  const kondisiMedisList = await prisma.kondisiMedis.findMany({
    select: { id: true, nama: true },
    orderBy: { nama: 'asc' },
  });
  return (
    <div className="flex flex-col gap-8 animate-[slide-up_0.5s_ease-out_forwards]">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">Add New Plant</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">Create a new entry in the botanical database.</p>
        </div>
        <div className="flex gap-3">
          <Link href="/admin/tanaman" className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px]">cancel</span>
            Cancel
          </Link>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        
        {/* Form Container */}
        <div className="w-full xl:w-2/3 flex flex-col gap-8">
          <div className="bg-white/60 dark:bg-[#0a1e0f]/50 backdrop-blur-md border border-white/40 dark:border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.05)] dark:shadow-[0_4px_30px_rgba(0,0,0,0.3)] rounded-3xl p-6 md:p-10 relative transition-all">
            <TambahTanamanForm kondisiMedisList={kondisiMedisList} />
          </div>
        </div>

        {/* Right Info Sidebar */}
        <div className="hidden xl:col-span-1 xl:flex flex-col gap-6 sticky top-24 w-1/3">
          <div className="bg-white/40 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-xl p-6">
             <div className="flex items-center gap-3 mb-4">
               <span className="material-symbols-outlined text-primary text-3xl">info</span>
               <h3 className="text-lg font-bold text-slate-900 dark:text-white">Admin Guidelines</h3>
             </div>
             <ul className="space-y-4 text-sm text-slate-600 dark:text-slate-400">
               <li className="flex gap-2">
                 <span className="material-symbols-outlined text-primary text-sm mt-0.5">check_circle</span>
                 Use standard botanical names for scientific identifiers.
               </li>
               <li className="flex gap-2">
                 <span className="material-symbols-outlined text-primary text-sm mt-0.5">check_circle</span>
                 Descriptions should be comprehensive but simple to read for general users.
               </li>
               <li className="flex gap-2">
                 <span className="material-symbols-outlined text-primary text-sm mt-0.5">check_circle</span>
                 Image URLs should point to high-resolution square or standard landscape ratios.
               </li>
             </ul>
          </div>
        </div>

      </div>
    </div>
  );
}
