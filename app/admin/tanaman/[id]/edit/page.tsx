import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getTanamanById } from '@/actions/tanaman';
import { EditTanamanForm } from './EditTanamanForm';

export default async function EditTanamanPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await getTanamanById(id);

  if (!result.success || !result.data) {
    notFound();
  }

  const tanaman = result.data;

  return (
    <div className="flex flex-col gap-8 animate-[slide-up_0.5s_ease-out_forwards]">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">Edit Plant</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">Update an existing entry in the botanical database.</p>
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
            <EditTanamanForm initialData={tanaman} />
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
                 Ensure you provide accurate information based on the latest botanical sources.
               </li>
               <li className="flex gap-2">
                 <span className="material-symbols-outlined text-primary text-sm mt-0.5">check_circle</span>
                 Keep the descriptions clear and comprehensible for the general public.
               </li>
               <li className="flex gap-2">
                 <span className="material-symbols-outlined text-primary text-sm mt-0.5">check_circle</span>
                 Verify the image URL correctly points to a high-quality picture.
               </li>
             </ul>
          </div>
        </div>

      </div>
    </div>
  );
}
