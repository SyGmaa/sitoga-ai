"use client";

import { useTransition } from "react";
import { createTanaman } from "@/actions/tanaman";

export function TambahTanamanForm() {
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(() => {
      createTanaman(formData);
    });
  };

  return (
    <form className="flex flex-col gap-8" onSubmit={handleSubmit}>
              
      {/* Section: Identification */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8">
        <div className="col-span-1 md:col-span-2 flex items-center gap-2 text-primary -mb-4">
          <span className="material-symbols-outlined animate-bounce">local_florist</span>
          <span className="text-sm font-bold uppercase tracking-wider">Identification</span>
        </div>
        
        <div className="flex flex-col gap-2">
          <label htmlFor="namaLokal" className="text-sm font-bold text-slate-700 dark:text-slate-300">Nama Lokal</label>
          <input required name="namaLokal" id="namaLokal" placeholder="e.g. Lidah Buaya" type="text" className="w-full bg-transparent border border-slate-300 dark:border-slate-600 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-slate-900 dark:text-white" />
        </div>
        
        <div className="flex flex-col gap-2">
          <label htmlFor="namaLatin" className="text-sm font-bold text-slate-700 dark:text-slate-300">Nama Latin</label>
          <input required name="namaLatin" id="namaLatin" placeholder="e.g. Aloe vera" type="text" className="w-full bg-transparent border border-slate-300 dark:border-slate-600 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-slate-900 dark:text-white italic" />
        </div>
        
        <div className="col-span-1 md:col-span-2 flex flex-col gap-2">
          <label htmlFor="lokasiTanam" className="text-sm font-bold text-slate-700 dark:text-slate-300">Lokasi Tanam</label>
          <input required name="lokasiTanam" id="lokasiTanam" placeholder="e.g. Blok A Taman Herbal" type="text" className="w-full bg-transparent border border-slate-300 dark:border-slate-600 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-slate-900 dark:text-white" />
        </div>

        <div className="col-span-1 md:col-span-2 flex flex-col gap-2">
          <label htmlFor="deskripsi" className="text-sm font-bold text-slate-700 dark:text-slate-300">Deskripsi Umum</label>
          <textarea required name="deskripsi" id="deskripsi" placeholder="Deskripsi mengenai tanaman ini..." rows={4} className="w-full bg-transparent border border-slate-300 dark:border-slate-600 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-slate-900 dark:text-white"></textarea>
        </div>
      </div>

      <div className="h-px bg-linear-to-r from-transparent via-slate-200 dark:via-slate-700 to-transparent w-full my-2"></div>

      {/* Section: Botanical Properties */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8">
        <div className="col-span-1 md:col-span-2 flex items-center gap-2 text-primary -mb-4">
          <span className="material-symbols-outlined animate-bounce">science</span>
          <span className="text-sm font-bold uppercase tracking-wider">Properties & Uses</span>
        </div>
        
        <div className="flex flex-col gap-2">
          <label htmlFor="kandunganSenyawa" className="text-sm font-bold text-slate-700 dark:text-slate-300">Kandungan Senyawa</label>
          <textarea required name="kandunganSenyawa" id="kandunganSenyawa" placeholder="e.g. Saponin, flavonoid..." rows={3} className="w-full bg-transparent border border-slate-300 dark:border-slate-600 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-slate-900 dark:text-white"></textarea>
        </div>
        
        <div className="flex flex-col gap-2">
          <label htmlFor="khasiatUtama" className="text-sm font-bold text-slate-700 dark:text-slate-300">Khasiat Utama</label>
          <textarea required name="khasiatUtama" id="khasiatUtama" placeholder="e.g. Mengobati luka bakar, panas dalam..." rows={3} className="w-full bg-transparent border border-slate-300 dark:border-slate-600 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-slate-900 dark:text-white"></textarea>
        </div>
      </div>

      <div className="h-px bg-linear-to-r from-transparent via-slate-200 dark:via-slate-700 to-transparent w-full my-2"></div>

      {/* Section: Visuals */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 text-primary">
          <span className="material-symbols-outlined animate-bounce">image</span>
          <span className="text-sm font-bold uppercase tracking-wider">Visual Reference</span>
        </div>
        
        <div className="flex flex-col gap-2">
          <label htmlFor="gambar" className="text-sm font-bold text-slate-700 dark:text-slate-300">Image Upload (Opsional)</label>
          <input name="gambar" id="gambar" type="file" accept="image/*" className="w-full bg-transparent border border-slate-300 dark:border-slate-600 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-slate-900 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20" />
          <p className="text-xs text-slate-500">Upload a high-quality picture of the plant.</p>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end pt-4">
        <button disabled={isPending} type="submit" className="w-full md:w-auto px-8 py-4 bg-primary text-white rounded-xl font-bold hover:bg-[#0dbd2a] hover:shadow-[0_10px_20px_-5px_rgba(19,236,55,0.4)] transition-all flex items-center justify-center gap-2 text-lg active:scale-95 disabled:opacity-50">
          <span className="material-symbols-outlined">
            {isPending ? 'progress_activity' : 'save'}
          </span>
          {isPending ? 'Saving...' : 'Save Plant Database'}
        </button>
      </div>

    </form>
  );
}
