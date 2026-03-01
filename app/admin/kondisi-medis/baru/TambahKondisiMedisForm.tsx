"use client";

import { useTransition } from "react";
import { createKondisiMedis } from "@/actions/kondisiMedis";

export function TambahKondisiMedisForm() {
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await createKondisiMedis(formData);
      if (res?.error) {
        alert(res.error);
      }
    });
  };

  return (
    <form className="flex flex-col gap-8" onSubmit={handleSubmit}>
              
      <div className="grid grid-cols-1 gap-y-8">
        <div className="flex items-center gap-2 text-amber-500 -mb-4">
          <span className="material-symbols-outlined animate-bounce">emergency</span>
          <span className="text-sm font-bold uppercase tracking-wider">Detail Kondisi Medis</span>
        </div>
        
        <div className="flex flex-col gap-2">
          <label htmlFor="nama" className="text-sm font-bold text-slate-700 dark:text-slate-300">Nama Kondisi</label>
          <input required name="nama" id="nama" placeholder="e.g. Hamil, Diabetes, Hipertensi" type="text" className="w-full bg-transparent border border-slate-300 dark:border-slate-600 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-slate-900 dark:text-white" />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="deskripsi" className="text-sm font-bold text-slate-700 dark:text-slate-300">Deskripsi <span className="text-slate-400 font-normal">(Opsional)</span></label>
          <textarea name="deskripsi" id="deskripsi" placeholder="Deskripsi singkat tentang kondisi medis ini..." rows={3} className="w-full bg-transparent border border-slate-300 dark:border-slate-600 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-slate-900 dark:text-white"></textarea>
        </div>
      </div>

      <div className="h-px bg-linear-to-r from-transparent via-slate-200 dark:via-slate-700 to-transparent w-full my-2"></div>

      <div className="flex justify-end pt-4">
        <button disabled={isPending} type="submit" className="w-full md:w-auto px-8 py-4 bg-primary text-white rounded-xl font-bold hover:bg-primary-hover hover:shadow-[0_10px_20px_-5px_rgba(19,236,55,0.4)] transition-all flex items-center justify-center gap-2 text-lg active:scale-95 disabled:opacity-50">
          <span className="material-symbols-outlined">
            {isPending ? 'progress_activity' : 'save'}
          </span>
          {isPending ? 'Menyimpan...' : 'Simpan Kondisi Medis'}
        </button>
      </div>

    </form>
  );
}
