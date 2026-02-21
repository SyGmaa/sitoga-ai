"use client";

import { useTransition, useState } from "react";
import { createTanaman } from "@/actions/tanaman";

export function TambahTanamanForm() {
  const [isPending, startTransition] = useTransition();
  const [step, setStep] = useState(1);
  const [langkahPengolahan, setLangkahPengolahan] = useState<string[]>([""]);

  const handleAddLangkah = () => {
    setLangkahPengolahan([...langkahPengolahan, ""]);
  };

  const handleRemoveLangkah = (index: number) => {
    const newLangkah = [...langkahPengolahan];
    newLangkah.splice(index, 1);
    // Selalu sisakan minimal 1
    if (newLangkah.length === 0) newLangkah.push("");
    setLangkahPengolahan(newLangkah);
  };

  const handleChangeLangkah = (index: number, value: string) => {
    const newLangkah = [...langkahPengolahan];
    newLangkah[index] = value;
    setLangkahPengolahan(newLangkah);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(() => {
      createTanaman(formData);
    });
  };

  const handleNextStep = () => {
    // Basic HTML5 validation trigger for Step 1
    const form = document.getElementById("tambah-tanaman-form") as HTMLFormElement;
    if (form) {
      const step1Inputs = form.querySelectorAll('#step-1-container input[required], #step-1-container textarea[required]');
      let allValid = true;
      step1Inputs.forEach((input) => {
        if (!(input as HTMLInputElement).validity.valid) {
          (input as HTMLInputElement).reportValidity();
          allValid = false;
        }
      });
      if (!allValid) return;
    }
    
    window.scrollTo({ top: 0, behavior: "smooth" });
    setStep(2);
  };

  const handlePrevStep = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setStep(1);
  };

  return (
    <form id="tambah-tanaman-form" className="flex flex-col gap-8" onSubmit={handleSubmit}>
      
      {/* Hidden input to store JSON array of preparation steps */}
      <input type="hidden" name="resepPengolahan" value={JSON.stringify(langkahPengolahan.filter(l => l.trim() !== ""))} />
      
      {/* Steps Indicator */}
      <div className="flex flex-col gap-2 mb-2">
        <div className="flex justify-between text-sm font-medium text-slate-700 dark:text-slate-200">
          <span>Step {step} of 2</span>
          <span className="text-primary">{step === 1 ? '50%' : '100%'} Completed</span>
        </div>
        <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary rounded-full transition-all duration-500 ease-out" 
            style={{ width: step === 1 ? '50%' : '100%' }}
          ></div>
        </div>
      </div>

      {/* STEP 1: Identification & Visual Reference */}
      <div id="step-1-container" className={step === 1 ? "flex flex-col gap-8" : "hidden"}>
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

        {/* Step 1 Navigation */}
        <div className="flex justify-end pt-4 mt-2">
          <button 
            type="button" 
            onClick={handleNextStep}
            className="w-full md:w-auto px-8 py-4 bg-primary text-white rounded-xl font-bold hover:bg-[#0dbd2a] hover:shadow-[0_10px_20px_-5px_rgba(19,236,55,0.4)] transition-all flex items-center justify-center gap-2 text-lg active:scale-95"
          >
            Next Step
            <span className="material-symbols-outlined">arrow_forward</span>
          </button>
        </div>
      </div>

      {/* STEP 2: Botanical Properties */}
      <div id="step-2-container" className={step === 2 ? "flex flex-col gap-8" : "hidden"}>
        {/* Section: Botanical Properties */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8">
          <div className="col-span-1 md:col-span-2 flex items-center gap-2 text-primary -mb-4">
            <span className="material-symbols-outlined animate-bounce">science</span>
            <span className="text-sm font-bold uppercase tracking-wider">Properties & Uses</span>
          </div>
          
          <div className="flex flex-col gap-2">
            <label htmlFor="kandunganSenyawa" className="text-sm font-bold text-slate-700 dark:text-slate-300">Kandungan Senyawa</label>
            <textarea required name="kandunganSenyawa" id="kandunganSenyawa" placeholder="e.g. Saponin, flavonoid..." rows={5} className="w-full bg-transparent border border-slate-300 dark:border-slate-600 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-slate-900 dark:text-white"></textarea>
          </div>
          
          <div className="flex flex-col gap-2">
            <label htmlFor="khasiatUtama" className="text-sm font-bold text-slate-700 dark:text-slate-300">Khasiat Utama</label>
            <textarea required name="khasiatUtama" id="khasiatUtama" placeholder="e.g. Mengobati luka bakar, panas dalam..." rows={5} className="w-full bg-transparent border border-slate-300 dark:border-slate-600 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-slate-900 dark:text-white"></textarea>
          </div>
        </div>
        
        <div className="h-px bg-linear-to-r from-transparent via-slate-200 dark:via-slate-700 to-transparent w-full my-2"></div>

        {/* Section: Preparation Steps */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-primary">
              <span className="material-symbols-outlined animate-bounce">soup_kitchen</span>
              <span className="text-sm font-bold uppercase tracking-wider">Cara Pengolahan (Persiapan)</span>
            </div>
            <button 
              type="button" 
              onClick={handleAddLangkah}
              className="text-primary text-sm font-bold hover:text-[#0dbd2a] transition-colors flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-lg">playlist_add</span>
              Tambah Langkah
            </button>
          </div>

          <div className="flex flex-col gap-3 mt-2">
            {langkahPengolahan.map((langkah, index) => (
              <div key={index} className="flex items-start gap-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-3 transition-all group">
                <div className="flex-1 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">Langkah {index + 1}</span>
                  </div>
                  <textarea
                    required
                    value={langkah}
                    onChange={(e) => handleChangeLangkah(index, e.target.value)}
                    placeholder={`Jelaskan langkah ${index + 1}...`}
                    rows={2}
                    className="w-full bg-transparent border-0 px-0 py-1 outline-none focus:ring-0 text-slate-900 dark:text-white resize-none"
                  ></textarea>
                </div>
                {langkahPengolahan.length > 1 && (
                  <button 
                    type="button" 
                    onClick={() => handleRemoveLangkah(index)}
                    className="mt-1 text-slate-400 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                    title="Hapus Langkah"
                  >
                    <span className="material-symbols-outlined text-[20px]">delete</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step 2 Navigation / Submit */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-4 pt-4 mt-2">
          <button 
            type="button" 
            onClick={handlePrevStep}
            className="w-full sm:w-auto px-6 py-4 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined">arrow_back</span>
            Back
          </button>
          
          <button disabled={isPending} type="submit" className="w-full sm:w-auto px-8 py-4 bg-primary text-white rounded-xl font-bold hover:bg-[#0dbd2a] hover:shadow-[0_10px_20px_-5px_rgba(19,236,55,0.4)] transition-all flex items-center justify-center gap-2 text-lg active:scale-95 disabled:opacity-50">
            <span className="material-symbols-outlined">
              {isPending ? 'progress_activity' : 'save'}
            </span>
            {isPending ? 'Saving...' : 'Save Plant Database'}
          </button>
        </div>
      </div>

    </form>
  );
}
