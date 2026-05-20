"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { parsePlantTextAction, saveParsedPlantAction, ParsedPlantData } from "@/actions/aiParser";

// Quick-fill templates for premium UX testing
const TEMPLATES = [
  {
    title: "Pegagan (Kognitif)",
    text: "Pegagan (Centella asiatica) adalah tanaman liar merambat yang rasanya manis segar. Tanaman obat ini berkhasiat utama untuk melancarkan aliran darah dan meningkatkan daya ingat. Kandungan senyawa aktif utamanya adalah triterpenoid seperti asiaticoside dan madecassoside.\n\nPegagan dapat menyembuhkan penyakit Daya Ingat Menurun dan Luka Ringan. Gejala daya ingat menurun meliputi sulit konsentrasi dan sering lupa hal-hal kecil. Sedangkan gejala luka ringan meliputi kulit tergores serta nyeri lokal.\n\nBerikut adalah cara pengolahan ramuan Pegagan untuk Daya Ingat Menurun:\nGunakan daun segar pegagan sebanyak 15 lembar. Cara pengolahannya adalah cuci daun hingga bersih, lalu rebus dengan 2 gelas air sampai mendidih hingga tersisa 1 gelas. Cara pakai tradisionalnya yaitu dengan meminum ramuan hangat tersebut satu kali sehari setelah makan secara teratur. Catatan keamanannya: jangan dikonsumsi berlebihan agar tidak menyebabkan sakit kepala.\n\nPerhatian Medis: Penggunaan pegagan dilarang keras bagi penderita penyakit hati kronis karena berisiko membebani fungsi organ hati secara berlebihan. Selain itu, ibu hamil juga sebaiknya berhati-hati karena berpotensi merangsang kontraksi rahim."
  },
  {
    title: "Meniran (Imun)",
    text: "Meniran (Phyllanthus urinaria) merupakan tanaman herbal tegak berukuran kecil. Berkhasiat utama meningkatkan sistem kekebalan tubuh (imunomodulator). Mengandung flavonoid, quercetin, dan filantin.\n\nMeniran sangat baik untuk mempercepat penyembuhan Hepatitis Ringan dan Asam Urat. Gejala hepatitis ringan meliputi lemas, mual, dan mata agak kuning. Gejala asam urat ditandai sendi bengkak dan kemerahan pada sendi.\n\nResep Pengolahan untuk Hepatitis Ringan:\nMemakai herba segar meniran sebanyak 30 gram. Daun dan batang meniran dicuci bersih, kemudian direbus dalam 3 gelas air hingga tersisa 1 gelas. Air rebusan disaring dan diminum hangat 2 kali sehari masing-masing setengah gelas. Jangan dikonsumsi terus-menerus lebih dari 4 minggu secara berturut-turut.\n\nPerhatian Medis: Bahaya untuk pasien sebelum operasi karena dapat mengencerkan darah, serta tidak dianjurkan bagi penderita penyakit ginjal akut."
  }
];

export default function AIParserPage() {
  const router = useRouter();
  const [isParsing, startParseTransition] = useTransition();
  const [isSaving, startSaveTransition] = useTransition();
  
  const [rawText, setRawText] = useState("");
  const [parsedData, setParsedData] = useState<ParsedPlantData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  // Custom states for loading checklist animation
  const [scanStep, setScanStep] = useState(0);

  const handleParse = () => {
    if (!rawText.trim()) return;
    setError(null);
    setParsedData(null);
    setScanStep(0);

    // Step-by-step scanner visual feedback
    const interval = setInterval(() => {
      setScanStep((prev) => (prev < 3 ? prev + 1 : prev));
    }, 1200);

    startParseTransition(async () => {
      const res = await parsePlantTextAction(rawText);
      clearInterval(interval);
      if (res.success && res.data) {
        setParsedData(res.data as ParsedPlantData);
      } else {
        setError(res.error || "Gagal memproses teks dengan AI.");
      }
    });
  };

  const handleSave = () => {
    if (!parsedData) return;
    setError(null);

    startSaveTransition(async () => {
      const res = await saveParsedPlantAction(parsedData);
      if (res.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push("/admin/tanaman");
        }, 1500);
      } else {
        setError(res.error || "Gagal menyimpan data ke database.");
      }
    });
  };

  // State update handlers for review editor
  const updateField = (field: keyof ParsedPlantData, value: any) => {
    if (!parsedData) return;
    setParsedData({
      ...parsedData,
      [field]: value
    });
  };

  const updateResepField = (index: number, field: string, value: string) => {
    if (!parsedData) return;
    const newResep = [...parsedData.resepPengolahan];
    newResep[index] = {
      ...newResep[index],
      [field]: value
    };
    updateField("resepPengolahan", newResep);
  };

  const addResep = () => {
    if (!parsedData) return;
    updateField("resepPengolahan", [
      ...parsedData.resepPengolahan,
      { keluhan: "", bagianYangDigunakan: "", caraPengolahan: "", caraPakaiTradisional: "", catatanKeamanan: "" }
    ]);
  };

  const removeResep = (index: number) => {
    if (!parsedData) return;
    const newResep = parsedData.resepPengolahan.filter((_, i) => i !== index);
    updateField("resepPengolahan", newResep);
  };

  const updatePenyakitField = (index: number, field: string, value: any) => {
    if (!parsedData) return;
    const newPenyakitList = [...parsedData.penyakitTerkait];
    newPenyakitList[index] = {
      ...newPenyakitList[index],
      [field]: value
    };
    updateField("penyakitTerkait", newPenyakitList);
  };

  const updatePenyakitGejala = (pIndex: number, gIndex: number, value: string) => {
    if (!parsedData) return;
    const newPenyakitList = [...parsedData.penyakitTerkait];
    const newGejala = [...newPenyakitList[pIndex].gejala];
    newGejala[gIndex] = value;
    newPenyakitList[pIndex].gejala = newGejala;
    updateField("penyakitTerkait", newPenyakitList);
  };

  const addGejalaToPenyakit = (pIndex: number) => {
    if (!parsedData) return;
    const newPenyakitList = [...parsedData.penyakitTerkait];
    newPenyakitList[pIndex].gejala = [...newPenyakitList[pIndex].gejala, ""];
    updateField("penyakitTerkait", newPenyakitList);
  };

  const removeGejalaFromPenyakit = (pIndex: number, gIndex: number) => {
    if (!parsedData) return;
    const newPenyakitList = [...parsedData.penyakitTerkait];
    newPenyakitList[pIndex].gejala = newPenyakitList[pIndex].gejala.filter((_, i) => i !== gIndex);
    updateField("penyakitTerkait", newPenyakitList);
  };

  const addPenyakit = () => {
    if (!parsedData) return;
    updateField("penyakitTerkait", [
      ...parsedData.penyakitTerkait,
      { nama: "", deskripsi: "", gejala: [""] }
    ]);
  };

  const removePenyakit = (index: number) => {
    if (!parsedData) return;
    const newPenyakitList = parsedData.penyakitTerkait.filter((_, i) => i !== index);
    updateField("penyakitTerkait", newPenyakitList);
  };

  const updatePantanganField = (index: number, field: string, value: any) => {
    if (!parsedData) return;
    const newPantanganList = [...parsedData.pantanganTanaman];
    newPantanganList[index] = {
      ...newPantanganList[index],
      [field]: value
    };
    updateField("pantanganTanaman", newPantanganList);
  };

  const addPantangan = () => {
    if (!parsedData) return;
    updateField("pantanganTanaman", [
      ...parsedData.pantanganTanaman,
      { kondisiMedisNama: "", kondisiMedisDeskripsi: "", tingkatRisiko: "HATI-HATI", alasan: "" }
    ]);
  };

  const removePantangan = (index: number) => {
    if (!parsedData) return;
    const newPantanganList = parsedData.pantanganTanaman.filter((_, i) => i !== index);
    updateField("pantanganTanaman", newPantanganList);
  };

  return (
    <div className="relative flex flex-col gap-8 max-w-6xl mx-auto pb-20 animate-[slide-up_0.5s_ease-out_forwards]">
      
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 md:p-8 rounded-2xl shadow-sm">
        <div>
          <div className="inline-flex items-center gap-2 text-purple-600 dark:text-purple-400 font-bold text-xs uppercase tracking-wider bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-md mb-3">
            <span className="material-symbols-outlined text-sm">psychology</span>
            <span>AI Assistant</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-none">
            AI Botanical Parser
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm md:text-base max-w-2xl">
            Masukkan deskripsi bebas tanaman obat. AI akan menyaring data botani, penyakit terkait, resep tradisional, dan pantangan medis ke dalam format database.
          </p>
        </div>
        <Link 
          href="/admin/tanaman" 
          className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-50 dark:hover:bg-slate-850 hover:border-slate-350 transition-all flex items-center gap-2 text-xs shadow-sm active:scale-95 shrink-0"
        >
          <span className="material-symbols-outlined text-[16px]">keyboard_backspace</span>
          Daftar Tanaman
        </Link>
      </div>

      {/* Main Split Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Workspace (Left Side) */}
        <div className="col-span-1 lg:col-span-5 flex flex-col gap-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm rounded-2xl p-6 flex flex-col gap-5">
            
            <div className="flex items-center justify-between">
              <label htmlFor="rawText" className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <span className="material-symbols-outlined text-purple-600 dark:text-purple-400">clinical_notes</span>
                Catatan Sumber Bebas
              </label>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold tracking-wider uppercase">Teks Artikel</span>
            </div>

            <div className="relative">
              <textarea
                id="rawText"
                rows={12}
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder="Contoh: Lidah buaya (Aloe vera) berkhasiat menyembuhkan luka bakar dan sakit mag. Mengandung zat Aloin dan Saponin. Langkah pengolahannya: ambil gel lidah buaya lalu oleskan pada luka bakar..."
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl px-4 py-3.5 text-xs outline-none focus:border-purple-500 dark:focus:border-purple-400 transition-all text-slate-900 dark:text-slate-100 resize-y leading-relaxed font-sans placeholder-slate-400 dark:placeholder-slate-600"
              ></textarea>
            </div>

            {/* Quick Templates Panel */}
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Uji Coba Cepat (Sampel):</span>
              <div className="grid grid-cols-2 gap-3">
                {TEMPLATES.map((tmpl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setRawText(tmpl.text);
                      setError(null);
                    }}
                    className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl hover:border-purple-500 hover:bg-slate-100/50 dark:hover:bg-slate-900/40 text-left transition-all group"
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="material-symbols-outlined text-xs text-purple-500">lab_research</span>
                      <span className="text-xs font-bold text-slate-850 dark:text-slate-350">{tmpl.title}</span>
                    </div>
                    <span className="text-[9px] text-slate-400 dark:text-slate-500 line-clamp-1">Klik untuk memuat sampel.</span>
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 text-rose-600 dark:text-rose-400 p-4 rounded-xl text-xs flex items-start gap-2 shadow-sm"
              >
                <span className="material-symbols-outlined text-xs shrink-0 mt-0.5">warning</span>
                <span className="font-semibold leading-normal">{error}</span>
              </motion.div>
            )}

            <button
              onClick={handleParse}
              disabled={isParsing || !rawText.trim()}
              className="w-full py-3.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold shadow-sm transition-all duration-200 flex items-center justify-center gap-2 text-xs active:scale-[0.98] disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-base">
                {isParsing ? "hourglass_top" : "insights"}
              </span>
              {isParsing ? "Sedang Menganalisis..." : "Ekstrak dengan AI"}
            </button>
          </div>
        </div>

        {/* Output & Review Dashboard (Right Side) */}
        <div className="col-span-1 lg:col-span-7 flex flex-col gap-6">
          <AnimatePresence mode="wait">
            
            {/* Visual AI parsing scanner */}
            {isParsing && (
              <motion.div
                key="loading"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 flex flex-col items-center justify-center text-center gap-6 min-h-[450px]"
              >
                {/* Rotating scanner without color gradient */}
                <div className="relative w-20 h-20 flex items-center justify-center mb-2">
                  <div className="absolute w-full h-full rounded-full border-4 border-slate-100 dark:border-slate-800 border-t-purple-600 animate-spin [animation-duration:2s]"></div>
                  <span className="material-symbols-outlined text-purple-600 dark:text-purple-400 text-3xl relative z-10 animate-pulse">language_pinnate</span>
                </div>

                <div className="flex flex-col gap-1">
                  <h3 className="text-base font-bold text-slate-850 dark:text-slate-200">Menyaring Pengetahuan Botani</h3>
                  <p className="text-xs text-slate-400 dark:text-slate-500 max-w-xs">
                    Mesin AI sedang memetakan entitas data dan mengintegrasikannya dengan basis pengetahuan medis.
                  </p>
                </div>

                {/* Micro checklist loading flow */}
                <div className="flex flex-col gap-3 w-full max-w-xs text-left bg-slate-50 dark:bg-slate-950 p-5 rounded-xl border border-slate-200 dark:border-slate-850">
                  <div className="flex items-center gap-3 text-xs font-bold transition-all">
                    <span className={`material-symbols-outlined text-base ${scanStep >= 0 ? "text-emerald-500" : "text-slate-300"}`}>
                      {scanStep > 0 ? "task_alt" : "circle"}
                    </span>
                    <span className={scanStep >= 0 ? "text-slate-800 dark:text-slate-200" : "text-slate-400"}>Menganalisis taksonomi tanaman...</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs font-bold transition-all">
                    <span className={`material-symbols-outlined text-base ${scanStep >= 1 ? "text-emerald-500" : "text-slate-300"}`}>
                      {scanStep > 1 ? "task_alt" : "circle"}
                    </span>
                    <span className={scanStep >= 1 ? "text-slate-800 dark:text-slate-200" : "text-slate-400"}>Memetakan relasi penyakit & gejala...</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs font-bold transition-all">
                    <span className={`material-symbols-outlined text-base ${scanStep >= 2 ? "text-emerald-500" : "text-slate-300"}`}>
                      {scanStep > 2 ? "task_alt" : "circle"}
                    </span>
                    <span className={scanStep >= 2 ? "text-slate-800 dark:text-slate-200" : "text-slate-400"}>Menyusun formula resep tradisional...</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs font-bold transition-all">
                    <span className={`material-symbols-outlined text-base ${scanStep >= 3 ? "text-emerald-500" : "text-slate-300"}`}>
                      {scanStep > 3 ? "task_alt" : "circle"}
                    </span>
                    <span className={scanStep >= 3 ? "text-slate-800 dark:text-slate-200" : "text-slate-400"}>Mengevaluasi kontraindikasi klinis...</span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Empty view before parse */}
            {!isParsing && !parsedData && (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 flex flex-col items-center justify-center text-center gap-3 min-h-[450px]"
              >
                <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-400 dark:text-slate-500 flex items-center justify-center border border-slate-100 dark:border-slate-850">
                  <span className="material-symbols-outlined text-2xl">psychology_alt</span>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Tinjauan Hasil Ekstraksi</h3>
                  <p className="text-xs text-slate-450 dark:text-slate-500 max-w-xs mt-1 mx-auto">
                    Panel ini akan menampilkan hasil ekstraksi data botani yang siap ditinjau dan diedit oleh Admin sebelum disimpan.
                  </p>
                </div>
              </motion.div>
            )}

            {/* Review Editor Board */}
            {parsedData && (
              <motion.div
                key="review"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col gap-6"
              >
                {/* Successful Save UI */}
                {success ? (
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-10 text-center flex flex-col items-center justify-center gap-3 shadow-sm min-h-[450px]">
                    <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/20 flex items-center justify-center text-emerald-500">
                      <span className="material-symbols-outlined text-4xl animate-pulse">check_circle</span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-850 dark:text-slate-250">Siklus Sinkronisasi Sukses</h3>
                    <p className="text-xs text-slate-400 dark:text-slate-500 max-w-xs">
                      Spesimen tanaman obat beserta relasi klinis telah aman diintegrasikan ke database utama.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 md:p-8 flex flex-col gap-8">
                      
                      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-855 pb-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-slate-50 dark:bg-slate-950 flex items-center justify-center text-slate-600 dark:text-slate-400 border border-slate-100 dark:border-slate-850">
                            <span className="material-symbols-outlined text-base">analytics</span>
                          </div>
                          <div>
                            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Validasi Hasil AI</h3>
                            <p className="text-[10px] text-slate-450 dark:text-slate-500">Tinjau dan sesuaikan isi sebelum disimpan.</p>
                          </div>
                        </div>
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/30 px-2.5 py-1 rounded-md border border-purple-200/20">
                          SIAP DISIMPAN
                        </span>
                      </div>

                      {/* SECTION 1: Profil Utama Tanaman */}
                      <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-2">
                          <span className="w-1 h-3 rounded-full bg-emerald-500"></span>
                          <h4 className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">I. Profil Botani Utama</h4>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[9px] font-extrabold text-slate-400 uppercase">Nama Lokal</label>
                            <input
                              type="text"
                              value={parsedData.namaLokal}
                              onChange={(e) => updateField("namaLokal", e.target.value)}
                              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl px-3 py-2.5 outline-none focus:border-purple-500 transition-all text-xs text-slate-900 dark:text-white font-bold"
                            />
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[9px] font-extrabold text-slate-400 uppercase">Nama Ilmiah (Latin)</label>
                            <input
                              type="text"
                              value={parsedData.namaLatin}
                              onChange={(e) => updateField("namaLatin", e.target.value)}
                              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl px-3 py-2.5 outline-none focus:border-purple-500 transition-all text-xs text-slate-900 dark:text-white font-bold italic"
                            />
                          </div>
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-[9px] font-extrabold text-slate-400 uppercase">Deskripsi Spesies</label>
                          <textarea
                            value={parsedData.deskripsi}
                            onChange={(e) => updateField("deskripsi", e.target.value)}
                            rows={3}
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl px-3 py-2.5 outline-none focus:border-purple-500 transition-all text-xs text-slate-900 dark:text-white leading-relaxed"
                          ></textarea>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[9px] font-extrabold text-slate-400 uppercase">Senyawa Kimia Aktif</label>
                            <textarea
                              value={parsedData.kandunganSenyawa}
                              onChange={(e) => updateField("kandunganSenyawa", e.target.value)}
                              rows={3}
                              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl px-3 py-2.5 outline-none focus:border-purple-500 transition-all text-xs text-slate-900 dark:text-white leading-relaxed"
                            ></textarea>
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[9px] font-extrabold text-slate-400 uppercase">Khasiat Utama Tradisional</label>
                            <textarea
                              value={parsedData.khasiatUtama}
                              onChange={(e) => updateField("khasiatUtama", e.target.value)}
                              rows={3}
                              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl px-3 py-2.5 outline-none focus:border-purple-500 transition-all text-xs text-slate-900 dark:text-white leading-relaxed"
                            ></textarea>
                          </div>
                        </div>
                      </div>

                      <div className="h-px bg-slate-100 dark:bg-slate-850"></div>

                      {/* SECTION 2: Cara Pengolahan (Resep Terstruktur) */}
                      <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-1 h-3 rounded-full bg-purple-500"></span>
                            <h4 className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">II. Formula Pengolahan (Resep)</h4>
                          </div>
                          <button
                            type="button"
                            onClick={addResep}
                            className="inline-flex items-center gap-1 text-[10px] font-bold text-purple-600 dark:text-purple-400 hover:underline bg-slate-50 dark:bg-slate-950 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-800 transition-all"
                          >
                            <span className="material-symbols-outlined text-xs">add</span> Tambah Resep
                          </button>
                        </div>

                        <div className="flex flex-col gap-5">
                          {parsedData.resepPengolahan.map((resep, index) => (
                            <div 
                              key={index} 
                              className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 p-5 rounded-xl flex flex-col gap-4 relative group"
                            >
                              <button
                                type="button"
                                onClick={() => removeResep(index)}
                                className="absolute top-4 right-4 w-6 h-6 rounded-md bg-white dark:bg-slate-900 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-slate-400 hover:text-rose-500 border border-slate-200 dark:border-slate-800 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 shadow-sm"
                                title="Hapus Resep"
                              >
                                <span className="material-symbols-outlined text-[14px]">close</span>
                              </button>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1.5">
                                  <label className="text-[9px] font-extrabold text-slate-400 uppercase">Indikasi/Keluhan</label>
                                  <div className="relative flex items-center">
                                    <span className="material-symbols-outlined text-[13px] absolute left-3 text-slate-400">medical_information</span>
                                    <input
                                      type="text"
                                      value={resep.keluhan}
                                      onChange={(e) => updateResepField(index, "keluhan", e.target.value)}
                                      placeholder="Contoh: Mual"
                                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-lg pl-9 pr-3 py-2 text-xs font-bold outline-none focus:border-purple-500"
                                    />
                                  </div>
                                </div>
                                <div className="flex flex-col gap-1.5">
                                  <label className="text-[9px] font-extrabold text-slate-400 uppercase">Bagian Yang Digunakan</label>
                                  <div className="relative flex items-center">
                                    <span className="material-symbols-outlined text-[13px] absolute left-3 text-slate-400">potted_plant</span>
                                    <input
                                      type="text"
                                      value={resep.bagianYangDigunakan}
                                      onChange={(e) => updateResepField(index, "bagianYangDigunakan", e.target.value)}
                                      placeholder="Contoh: Daun segar"
                                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-lg pl-9 pr-3 py-2 text-xs outline-none focus:border-purple-500"
                                    />
                                  </div>
                                </div>
                              </div>

                              <div className="flex flex-col gap-1.5">
                                <label className="text-[9px] font-extrabold text-slate-400 uppercase">Prosedur Pengolahan</label>
                                <textarea
                                  value={resep.caraPengolahan}
                                  onChange={(e) => updateResepField(index, "caraPengolahan", e.target.value)}
                                  rows={2}
                                  placeholder="Contoh: Rebus daun dengan air..."
                                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-lg px-3 py-2 text-xs outline-none focus:border-purple-500 leading-relaxed"
                                />
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1.5">
                                  <label className="text-[9px] font-extrabold text-slate-400 uppercase">Cara Pakai Tradisional</label>
                                  <div className="relative flex items-center">
                                    <span className="material-symbols-outlined text-[13px] absolute left-3 text-slate-400">local_cafe</span>
                                    <input
                                      type="text"
                                      value={resep.caraPakaiTradisional}
                                      onChange={(e) => updateResepField(index, "caraPakaiTradisional", e.target.value)}
                                      placeholder="Contoh: Diminum hangat sedikit-sedikit"
                                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-lg pl-9 pr-3 py-2 text-xs outline-none focus:border-purple-500"
                                    />
                                  </div>
                                </div>
                                <div className="flex flex-col gap-1.5">
                                  <label className="text-[9px] font-extrabold text-slate-400 uppercase">Catatan Keamanan</label>
                                  <div className="relative flex items-center">
                                    <span className="material-symbols-outlined text-[13px] absolute left-3 text-slate-400">gavel</span>
                                    <input
                                      type="text"
                                      value={resep.catatanKeamanan}
                                      onChange={(e) => updateResepField(index, "catatanKeamanan", e.target.value)}
                                      placeholder="Contoh: Batasi konsumsi harian"
                                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-lg pl-9 pr-3 py-2 text-xs outline-none focus:border-purple-500"
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="h-px bg-slate-100 dark:bg-slate-850"></div>

                      {/* SECTION 3: Relasi Penyakit dan Gejala */}
                      <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-1 h-3 rounded-full bg-indigo-500"></span>
                            <h4 className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">III. Relasi Diagnostik (Penyakit & Gejala)</h4>
                          </div>
                          <button
                            type="button"
                            onClick={addPenyakit}
                            className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline bg-slate-50 dark:bg-slate-950 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-800 transition-all"
                          >
                            <span className="material-symbols-outlined text-xs">add</span> Tambah Penyakit
                          </button>
                        </div>

                        <div className="flex flex-col gap-5">
                          {parsedData.penyakitTerkait.map((penyakit, pIndex) => (
                            <div 
                              key={pIndex} 
                              className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 p-5 rounded-xl flex flex-col gap-4 relative group"
                            >
                              <button
                                type="button"
                                onClick={() => removePenyakit(pIndex)}
                                className="absolute top-4 right-4 w-6 h-6 rounded-md bg-white dark:bg-slate-900 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-slate-400 hover:text-rose-500 border border-slate-200 dark:border-slate-800 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 shadow-sm"
                                title="Hapus Penyakit"
                              >
                                <span className="material-symbols-outlined text-[14px]">close</span>
                              </button>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1.5">
                                  <label className="text-[9px] font-extrabold text-slate-400 uppercase">Nama Penyakit</label>
                                  <input
                                    type="text"
                                    value={penyakit.nama}
                                    onChange={(e) => updatePenyakitField(pIndex, "nama", e.target.value)}
                                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-lg px-3 py-2 text-xs font-bold outline-none focus:border-indigo-500"
                                  />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                  <label className="text-[9px] font-extrabold text-slate-400 uppercase">Deskripsi Penyakit</label>
                                  <input
                                    type="text"
                                    value={penyakit.deskripsi}
                                    onChange={(e) => updatePenyakitField(pIndex, "deskripsi", e.target.value)}
                                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-lg px-3 py-2 text-xs outline-none focus:border-indigo-500"
                                  />
                                </div>
                              </div>

                              <div className="flex flex-col gap-2">
                                <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-3">
                                  <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Gejala Diagnostik</span>
                                  <button
                                    type="button"
                                    onClick={() => addGejalaToPenyakit(pIndex)}
                                    className="inline-flex items-center gap-0.5 text-[9px] font-extrabold text-indigo-600 dark:text-indigo-400 hover:underline"
                                  >
                                    <span className="material-symbols-outlined text-[12px]">add</span> Tambah Gejala
                                  </button>
                                </div>

                                <div className="flex flex-wrap gap-2 mt-1">
                                  {penyakit.gejala.map((gejala, gIndex) => (
                                    <div 
                                      key={gIndex} 
                                      className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1 gap-1.5 shadow-sm"
                                    >
                                      <input
                                        type="text"
                                        value={gejala}
                                        onChange={(e) => updatePenyakitGejala(pIndex, gIndex, e.target.value)}
                                        className="bg-transparent border-0 p-0 text-xs font-bold focus:ring-0 w-24 outline-none text-slate-800 dark:text-slate-200"
                                      />
                                      <button
                                        type="button"
                                        onClick={() => removeGejalaFromPenyakit(pIndex, gIndex)}
                                        className="text-slate-400 hover:text-rose-500 shrink-0 flex items-center justify-center transition-colors"
                                      >
                                        <span className="material-symbols-outlined text-[12px] font-black">close</span>
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="h-px bg-slate-100 dark:bg-slate-850"></div>

                      {/* SECTION 4: Pantangan & Kontraindikasi Medis */}
                      <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-1 h-3 rounded-full bg-amber-500"></span>
                            <h4 className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">IV. Batasan & Kontraindikasi Medis</h4>
                          </div>
                          <button
                            type="button"
                            onClick={addPantangan}
                            className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-650 dark:text-amber-450 hover:underline bg-slate-50 dark:bg-slate-955 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-800 transition-all"
                          >
                            <span className="material-symbols-outlined text-xs">add</span> Tambah Batasan
                          </button>
                        </div>

                        <div className="flex flex-col gap-5">
                          {parsedData.pantanganTanaman.map((pantangan, index) => (
                            <div 
                              key={index} 
                              className="bg-amber-50/10 dark:bg-amber-950/5 border border-amber-100 dark:border-amber-900/30 p-5 rounded-xl flex flex-col gap-4 relative group"
                            >
                              <button
                                type="button"
                                onClick={() => removePantangan(index)}
                                className="absolute top-4 right-4 w-6 h-6 rounded-md bg-white dark:bg-slate-900 hover:bg-rose-50 dark:hover:bg-rose-955 text-slate-400 hover:text-rose-500 border border-amber-100 dark:border-slate-800 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 shadow-sm"
                                title="Hapus Pantangan"
                              >
                                <span className="material-symbols-outlined text-[14px]">close</span>
                              </button>

                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="flex flex-col gap-1.5">
                                  <label className="text-[9px] font-extrabold text-amber-600 dark:text-amber-400 uppercase">Kondisi Medis Kontraindikasi</label>
                                  <input
                                    type="text"
                                    value={pantangan.kondisiMedisNama}
                                    onChange={(e) => updatePantanganField(index, "kondisiMedisNama", e.target.value)}
                                    placeholder="Contoh: Darah Tinggi"
                                    className="w-full bg-white dark:bg-slate-900 border border-amber-100 dark:border-amber-900/35 rounded-lg px-3 py-2 text-xs font-bold outline-none focus:border-amber-500"
                                  />
                                </div>
                                <div className="flex flex-col gap-1.5 md:col-span-2">
                                  <label className="text-[9px] font-extrabold text-amber-600 dark:text-amber-400 uppercase">Deskripsi Kondisi (Opsional)</label>
                                  <input
                                    type="text"
                                    value={pantangan.kondisiMedisDeskripsi}
                                    onChange={(e) => updatePantanganField(index, "kondisiMedisDeskripsi", e.target.value)}
                                    className="w-full bg-white dark:bg-slate-900 border border-amber-100 dark:border-amber-900/35 rounded-lg px-3 py-2 text-xs outline-none focus:border-amber-500"
                                  />
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="flex flex-col gap-1.5">
                                  <label className="text-[9px] font-extrabold text-amber-600 dark:text-amber-400 uppercase">Tingkat Risiko</label>
                                  <select
                                    value={pantangan.tingkatRisiko}
                                    onChange={(e) => updatePantanganField(index, "tingkatRisiko", e.target.value)}
                                    className="w-full bg-white dark:bg-slate-900 border border-amber-100 dark:border-amber-900/35 rounded-lg px-3 py-2 text-xs outline-none focus:border-amber-500 font-bold"
                                  >
                                    <option value="HATI-HATI">⚠️ HATI-HATI</option>
                                    <option value="BERBAHAYA">🚫 BERBAHAYA</option>
                                  </select>
                                </div>
                                <div className="flex flex-col gap-1.5 md:col-span-2">
                                  <label className="text-[9px] font-extrabold text-amber-600 dark:text-amber-400 uppercase">Rasional Medis / Alasan Larangan</label>
                                  <input
                                    type="text"
                                    value={pantangan.alasan}
                                    onChange={(e) => updatePantanganField(index, "alasan", e.target.value)}
                                    className="w-full bg-white dark:bg-slate-900 border border-amber-100 dark:border-amber-900/35 rounded-lg px-3 py-2 text-xs outline-none focus:border-amber-500"
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Action Dashboard Panel */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4.5 flex items-center justify-end gap-3 shadow-sm">
                      <button
                        onClick={() => setParsedData(null)}
                        className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors text-xs active:scale-[0.97]"
                      >
                        Reset Peninjauan
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-sm transition-all flex items-center gap-2 text-xs disabled:opacity-50 active:scale-[0.97]"
                      >
                        <span className="material-symbols-outlined text-sm">
                          {isSaving ? "sync_saved_locally" : "done_all"}
                        </span>
                        {isSaving ? "Menyimpan Relasi..." : "Integrasikan ke Database"}
                      </button>
                    </div>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
