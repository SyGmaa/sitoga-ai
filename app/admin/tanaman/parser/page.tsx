"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { parsePlantTextAction, saveParsedPlantAction, ParsedPlantData } from "@/actions/aiParser";

export default function AIParserPage() {
  const router = useRouter();
  const [isParsing, startParseTransition] = useTransition();
  const [isSaving, startSaveTransition] = useTransition();
  
  const [rawText, setRawText] = useState("");
  const [parsedData, setParsedData] = useState<ParsedPlantData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleParse = () => {
    if (!rawText.trim()) return;
    setError(null);
    setParsedData(null);

    startParseTransition(async () => {
      const res = await parsePlantTextAction(rawText);
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

  // State update handlers for the review editor
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

  // Penyakit Terkait update handlers
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

  // Pantangan update handlers
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
    <div className="flex flex-col gap-8 max-w-6xl mx-auto pb-12 animate-[slide-up_0.5s_ease-out_forwards]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <div className="flex items-center gap-2 text-purple-500 font-bold text-sm uppercase tracking-wider mb-1">
            <span className="material-symbols-outlined animate-pulse">psychology</span>
            <span>AI Smart Input</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">AI Botanical Parser</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-base md:text-lg">
            Tuliskan artikel atau deskripsi bebas tanaman obat. AI akan memilah data tanaman, gejala, penyakit, dan pantangan medis secara otomatis.
          </p>
        </div>
        <Link href="/admin/tanaman" className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          Kembali
        </Link>
      </div>

      {/* Main Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Input Area */}
        <div className="col-span-1 lg:col-span-5 flex flex-col gap-6">
          <div className="bg-white/60 dark:bg-[#0a1e0f]/50 backdrop-blur-md border border-white/40 dark:border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.05)] dark:shadow-[0_4px_30px_rgba(0,0,0,0.3)] rounded-3xl p-6 flex flex-col gap-4">
            <label htmlFor="rawText" className="text-lg font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <span className="material-symbols-outlined text-purple-500">article</span>
              Teks Deskripsi Tanaman
            </label>
            <textarea
              id="rawText"
              rows={12}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="Contoh: Lidah buaya (Aloe vera) berkhasiat menyembuhkan luka bakar dan sakit mag. Mengandung zat Aloin dan Saponin. Langkah pengolahannya: ambil gel lidah buaya lalu oleskan pada luka bakar. Kontraindikasi bagi ibu hamil karena berisiko keguguran."
              className="w-full bg-transparent border border-slate-300 dark:border-slate-700 rounded-2xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all text-slate-900 dark:text-white resize-y"
            ></textarea>
            
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 text-red-600 dark:text-red-400 p-4 rounded-2xl text-sm flex items-start gap-2">
                <span className="material-symbols-outlined text-lg">error</span>
                <span>{error}</span>
              </div>
            )}

            <button
              onClick={handleParse}
              disabled={isParsing || !rawText.trim()}
              className="w-full py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-bold shadow-lg shadow-purple-500/30 hover:shadow-purple-500/45 transition-all flex items-center justify-center gap-2 text-base active:scale-95 disabled:opacity-50"
            >
              <span className="material-symbols-outlined">
                {isParsing ? "sync" : "auto_awesome"}
              </span>
              {isParsing ? "Sedang Menganalisis..." : "Parse dengan AI"}
            </button>
          </div>
        </div>

        {/* Output/Review Area */}
        <div className="col-span-1 lg:col-span-7 flex flex-col gap-6">
          <AnimatePresence mode="wait">
            {isParsing && (
              <motion.div
                key="loading"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white/45 dark:bg-[#0a1e0f]/30 border border-dashed border-slate-300 dark:border-slate-700 rounded-3xl p-12 flex flex-col items-center justify-center text-center gap-4"
              >
                <div className="relative flex items-center justify-center w-20 h-20">
                  <div className="absolute w-full h-full rounded-full border-4 border-purple-500/20 border-t-purple-500 animate-spin"></div>
                  <span className="material-symbols-outlined text-purple-500 text-4xl animate-pulse">psychology</span>
                </div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">AI Sedang Mengekstrak Data...</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm">
                  Gemini sedang menganalisis kandungan tanaman, penyakit, resep, dan kontraindikasi medis dari artikel Anda.
                </p>
              </motion.div>
            )}

            {!isParsing && !parsedData && (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white/30 dark:bg-[#0a1e0f]/20 border border-dashed border-slate-300 dark:border-slate-800 rounded-3xl p-12 flex flex-col items-center justify-center text-center gap-3 text-slate-400 dark:text-slate-600"
              >
                <span className="material-symbols-outlined text-5xl">manage_search</span>
                <h3 className="text-lg font-bold">Belum Ada Hasil Ekstraksi</h3>
                <p className="text-sm max-w-xs">
                  Masukkan teks deskripsi tanaman obat di panel kiri lalu tekan &quot;Parse dengan AI&quot; untuk memulai.
                </p>
              </motion.div>
            )}

            {parsedData && (
              <motion.div
                key="review"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col gap-6"
              >
                {/* Save Success Screen */}
                {success ? (
                  <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 text-emerald-600 dark:text-emerald-400 p-8 rounded-3xl text-center flex flex-col items-center gap-3 shadow-md">
                    <span className="material-symbols-outlined text-6xl text-emerald-500 animate-bounce">check_circle</span>
                    <h3 className="text-xl font-bold">Tanaman Berhasil Disimpan!</h3>
                    <p className="text-sm">Meredirect kembali ke daftar tanaman utama...</p>
                  </div>
                ) : (
                  <>
                    <div className="bg-white/60 dark:bg-[#0a1e0f]/50 backdrop-blur-md border border-white/40 dark:border-white/10 shadow-sm rounded-3xl p-6 md:p-8 flex flex-col gap-6">
                      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                        <div className="flex items-center gap-3">
                          <span className="material-symbols-outlined text-purple-500 text-2xl">preview</span>
                          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">Review Data Hasil Ekstraksi</h3>
                        </div>
                        <span className="text-xs font-bold text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30 px-3 py-1 rounded-full">
                          AI Generated
                        </span>
                      </div>

                      {/* SECTION 1: Tanaman Basic Info */}
                      <div className="flex flex-col gap-4">
                        <h4 className="text-sm font-bold text-purple-500 uppercase tracking-wider">Informasi Dasar Tanaman</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Nama Lokal</label>
                            <input
                              type="text"
                              value={parsedData.namaLokal}
                              onChange={(e) => updateField("namaLokal", e.target.value)}
                              className="w-full bg-white dark:bg-slate-850 border border-slate-350 dark:border-slate-700 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all text-slate-900 dark:text-white text-sm"
                            />
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Nama Latin (Ilmiah)</label>
                            <input
                              type="text"
                              value={parsedData.namaLatin}
                              onChange={(e) => updateField("namaLatin", e.target.value)}
                              className="w-full bg-white dark:bg-slate-850 border border-slate-350 dark:border-slate-700 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all text-slate-900 dark:text-white text-sm italic"
                            />
                          </div>
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Deskripsi Umum</label>
                          <textarea
                            value={parsedData.deskripsi}
                            onChange={(e) => updateField("deskripsi", e.target.value)}
                            rows={3}
                            className="w-full bg-white dark:bg-slate-850 border border-slate-350 dark:border-slate-700 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all text-slate-900 dark:text-white text-sm"
                          ></textarea>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Kandungan Senyawa</label>
                            <textarea
                              value={parsedData.kandunganSenyawa}
                              onChange={(e) => updateField("kandunganSenyawa", e.target.value)}
                              rows={3}
                              className="w-full bg-white dark:bg-slate-850 border border-slate-350 dark:border-slate-700 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all text-slate-900 dark:text-white text-sm"
                            ></textarea>
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Khasiat Utama</label>
                            <textarea
                              value={parsedData.khasiatUtama}
                              onChange={(e) => updateField("khasiatUtama", e.target.value)}
                              rows={3}
                              className="w-full bg-white dark:bg-slate-850 border border-slate-350 dark:border-slate-700 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all text-slate-900 dark:text-white text-sm"
                            ></textarea>
                          </div>
                        </div>
                      </div>

                      <div className="h-px bg-slate-200 dark:bg-slate-800"></div>

                      {/* SECTION 2: Resep Pengolahan */}
                      <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-bold text-purple-500 uppercase tracking-wider">Cara Pengolahan (Resep)</h4>
                          <button
                            type="button"
                            onClick={addResep}
                            className="text-purple-600 dark:text-purple-400 text-xs font-bold hover:underline flex items-center gap-1"
                          >
                            <span className="material-symbols-outlined text-[16px]">add</span> Tambah Resep
                          </button>
                        </div>

                        <div className="flex flex-col gap-4">
                          {parsedData.resepPengolahan.map((resep, index) => (
                            <div key={index} className="bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl flex flex-col gap-3 relative">
                              <button
                                type="button"
                                onClick={() => removeResep(index)}
                                className="absolute top-3 right-3 text-slate-400 hover:text-red-500"
                                title="Hapus Resep"
                              >
                                <span className="material-symbols-outlined text-[18px]">close</span>
                              </button>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div className="flex flex-col gap-1">
                                  <label className="text-[10px] font-bold text-slate-500">Keluhan</label>
                                  <input
                                    type="text"
                                    value={resep.keluhan}
                                    onChange={(e) => updateResepField(index, "keluhan", e.target.value)}
                                    placeholder="Contoh: Mual"
                                    className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-bold"
                                  />
                                </div>
                                <div className="flex flex-col gap-1">
                                  <label className="text-[10px] font-bold text-slate-500">Bagian yang Digunakan</label>
                                  <input
                                    type="text"
                                    value={resep.bagianYangDigunakan}
                                    onChange={(e) => updateResepField(index, "bagianYangDigunakan", e.target.value)}
                                    placeholder="Contoh: Daun segar"
                                    className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs"
                                  />
                                </div>
                              </div>

                              <div className="flex flex-col gap-1">
                                <label className="text-[10px] font-bold text-slate-500">Cara Pengolahan</label>
                                <textarea
                                  value={resep.caraPengolahan}
                                  onChange={(e) => updateResepField(index, "caraPengolahan", e.target.value)}
                                  rows={2}
                                  placeholder="Contoh: Rebus daun dengan air hingga mendidih..."
                                  className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs"
                                />
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div className="flex flex-col gap-1">
                                  <label className="text-[10px] font-bold text-slate-500">Cara Pakai Tradisional</label>
                                  <input
                                    type="text"
                                    value={resep.caraPakaiTradisional}
                                    onChange={(e) => updateResepField(index, "caraPakaiTradisional", e.target.value)}
                                    placeholder="Contoh: Diminum hangat sedikit-sedikit"
                                    className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs"
                                  />
                                </div>
                                <div className="flex flex-col gap-1">
                                  <label className="text-[10px] font-bold text-slate-500">Catatan Keamanan</label>
                                  <input
                                    type="text"
                                    value={resep.catatanKeamanan}
                                    onChange={(e) => updateResepField(index, "catatanKeamanan", e.target.value)}
                                    placeholder="Contoh: Hindari penggunaan berlebih"
                                    className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs"
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="h-px bg-slate-200 dark:bg-slate-800"></div>

                      {/* SECTION 3: Penyakit & Gejala */}
                      <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-bold text-purple-500 uppercase tracking-wider">Relasi Penyakit & Gejala</h4>
                          <button
                            type="button"
                            onClick={addPenyakit}
                            className="text-purple-600 dark:text-purple-400 text-xs font-bold hover:underline flex items-center gap-1"
                          >
                            <span className="material-symbols-outlined text-[16px]">add</span> Tambah Penyakit
                          </button>
                        </div>

                        <div className="flex flex-col gap-4">
                          {parsedData.penyakitTerkait.map((penyakit, pIndex) => (
                            <div key={pIndex} className="bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl flex flex-col gap-3 relative">
                              <button
                                type="button"
                                onClick={() => removePenyakit(pIndex)}
                                className="absolute top-3 right-3 text-slate-400 hover:text-red-500"
                                title="Hapus Penyakit"
                              >
                                <span className="material-symbols-outlined text-[18px]">close</span>
                              </button>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div className="flex flex-col gap-1">
                                  <label className="text-[10px] font-bold text-slate-500">Nama Penyakit</label>
                                  <input
                                    type="text"
                                    value={penyakit.nama}
                                    onChange={(e) => updatePenyakitField(pIndex, "nama", e.target.value)}
                                    className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-bold"
                                  />
                                </div>
                                <div className="flex flex-col gap-1">
                                  <label className="text-[10px] font-bold text-slate-500">Deskripsi Penyakit</label>
                                  <input
                                    type="text"
                                    value={penyakit.deskripsi}
                                    onChange={(e) => updatePenyakitField(pIndex, "deskripsi", e.target.value)}
                                    className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs"
                                  />
                                </div>
                              </div>

                              <div className="flex flex-col gap-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Gejala Terkait</span>
                                  <button
                                    type="button"
                                    onClick={() => addGejalaToPenyakit(pIndex)}
                                    className="text-purple-600 dark:text-purple-400 text-[10px] font-bold hover:underline flex items-center gap-0.5"
                                  >
                                    <span className="material-symbols-outlined text-[12px]">add</span> Tambah Gejala
                                  </button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  {penyakit.gejala.map((gejala, gIndex) => (
                                    <div key={gIndex} className="flex items-center bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1 gap-1.5">
                                      <input
                                        type="text"
                                        value={gejala}
                                        onChange={(e) => updatePenyakitGejala(pIndex, gIndex, e.target.value)}
                                        className="bg-transparent border-0 p-0 text-xs font-medium focus:ring-0 w-24 outline-none"
                                      />
                                      <button
                                        type="button"
                                        onClick={() => removeGejalaFromPenyakit(pIndex, gIndex)}
                                        className="text-slate-400 hover:text-red-500 shrink-0 flex items-center justify-center"
                                      >
                                        <span className="material-symbols-outlined text-[14px]">close</span>
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="h-px bg-slate-200 dark:bg-slate-800"></div>

                      {/* SECTION 4: Pantangan Medis */}
                      <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-bold text-purple-500 uppercase tracking-wider">Pantangan & Kontraindikasi</h4>
                          <button
                            type="button"
                            onClick={addPantangan}
                            className="text-purple-600 dark:text-purple-400 text-xs font-bold hover:underline flex items-center gap-1"
                          >
                            <span className="material-symbols-outlined text-[16px]">add</span> Tambah Pantangan
                          </button>
                        </div>

                        <div className="flex flex-col gap-4">
                          {parsedData.pantanganTanaman.map((pantangan, index) => (
                            <div key={index} className="bg-amber-50/30 dark:bg-amber-950/10 border border-amber-200/50 dark:border-amber-900/30 p-4 rounded-2xl flex flex-col gap-3 relative">
                              <button
                                type="button"
                                onClick={() => removePantangan(index)}
                                className="absolute top-3 right-3 text-slate-400 hover:text-red-500"
                                title="Hapus Pantangan"
                              >
                                <span className="material-symbols-outlined text-[18px]">close</span>
                              </button>

                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <div className="flex flex-col gap-1">
                                  <label className="text-[10px] font-bold text-amber-600 dark:text-amber-400">Kondisi Medis</label>
                                  <input
                                    type="text"
                                    value={pantangan.kondisiMedisNama}
                                    onChange={(e) => updatePantanganField(index, "kondisiMedisNama", e.target.value)}
                                    placeholder="Contoh: Darah Tinggi"
                                    className="w-full bg-white dark:bg-slate-800 border border-amber-200/50 dark:border-amber-900/30 rounded-lg px-2.5 py-1.5 text-xs font-bold"
                                  />
                                </div>
                                <div className="flex flex-col gap-1 md:col-span-2">
                                  <label className="text-[10px] font-bold text-amber-600 dark:text-amber-400">Deskripsi Kondisi (Opsional)</label>
                                  <input
                                    type="text"
                                    value={pantangan.kondisiMedisDeskripsi}
                                    onChange={(e) => updatePantanganField(index, "kondisiMedisDeskripsi", e.target.value)}
                                    className="w-full bg-white dark:bg-slate-800 border border-amber-200/50 dark:border-amber-900/30 rounded-lg px-2.5 py-1.5 text-xs"
                                  />
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <div className="flex flex-col gap-1">
                                  <label className="text-[10px] font-bold text-amber-600 dark:text-amber-400">Tingkat Risiko</label>
                                  <select
                                    value={pantangan.tingkatRisiko}
                                    onChange={(e) => updatePantanganField(index, "tingkatRisiko", e.target.value)}
                                    className="w-full bg-white dark:bg-slate-800 border border-amber-200/50 dark:border-amber-900/30 rounded-lg px-2.5 py-1.5 text-xs"
                                  >
                                    <option value="HATI-HATI">⚠️ HATI-HATI</option>
                                    <option value="BERBAHAYA">🚫 BERBAHAYA</option>
                                  </select>
                                </div>
                                <div className="flex flex-col gap-1 md:col-span-2">
                                  <label className="text-[10px] font-bold text-amber-600 dark:text-amber-400">Alasan Pantangan</label>
                                  <input
                                    type="text"
                                    value={pantangan.alasan}
                                    onChange={(e) => updatePantanganField(index, "alasan", e.target.value)}
                                    className="w-full bg-white dark:bg-slate-800 border border-amber-200/50 dark:border-amber-900/30 rounded-lg px-2.5 py-1.5 text-xs"
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Action Panel */}
                    <div className="bg-white/40 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 flex items-center justify-end gap-3">
                      <button
                        onClick={() => setParsedData(null)}
                        className="px-5 py-3 rounded-xl border border-slate-350 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-sm"
                      >
                        Reset
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/35 transition-all flex items-center gap-2 text-sm disabled:opacity-50 active:scale-95"
                      >
                        <span className="material-symbols-outlined text-lg">
                          {isSaving ? "progress_activity" : "cloud_done"}
                        </span>
                        {isSaving ? "Menyimpan..." : "Simpan ke Database"}
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
