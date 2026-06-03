"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

interface Plant {
  id: string;
  namaLokal: string;
  namaLatin: string;
  deskripsi: string;
  kandunganSenyawa: string;
  khasiatUtama: string;
  gambarUrl: string | null;
  resepPengolahan: { id: string; langkah: string }[];
  penyakitTerkaitIds: string[];
  pantangan: {
    kondisiMedisId: string;
    kondisiMedisNama: string;
    tingkatRisiko: string | null;
    alasan: string | null;
  }[];
}

interface Disease {
  id: string;
  nama: string;
  deskripsi: string | null;
  gejala: {
    gejalaId: string;
    nama: string;
    isGejalaWajib: boolean;
    bobotGejala: number;
  }[];
  tanamanObatIds: string[];
}

interface Symptom {
  id: string;
  nama: string;
}

interface Condition {
  id: string;
  nama: string;
  deskripsi: string | null;
}

interface LibraryClientProps {
  plants: Plant[];
  diseases: Disease[];
  symptoms: Symptom[];
  conditions: Condition[];
}

export default function LibraryClient({
  plants,
  diseases,
  symptoms,
  conditions,
}: LibraryClientProps) {
  // Navigation & Tabs
  const [activeTab, setActiveTab] = useState<"diagnose" | "catalog">("diagnose");

  // Health Profile / Risks States
  const [selectedRisks, setSelectedRisks] = useState<string[]>([]);
  const [showRiskPanel, setShowRiskPanel] = useState(false);

  // Disease Selection States
  const [diseaseSearch, setDiseaseSearch] = useState("");
  const [selectedDiseaseId, setSelectedDiseaseId] = useState<string | null>(null);

  // Catalog States
  const [plantSearch, setPlantSearch] = useState("");
  const [selectedPlantId, setSelectedPlantId] = useState<string | null>(null);

  // Toggle Risk Selection
  const toggleRisk = (id: string) => {
    setSelectedRisks((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const clearRisks = () => {
    setSelectedRisks([]);
  };

  // Filter diseases based on search text
  const filteredDiseases = useMemo(() => {
    if (!diseaseSearch.trim()) return diseases;
    const query = diseaseSearch.toLowerCase();
    return diseases.filter(
      (d) =>
        d.nama.toLowerCase().includes(query) ||
        (d.deskripsi && d.deskripsi.toLowerCase().includes(query))
    );
  }, [diseases, diseaseSearch]);

  // Set default selected disease to the first one in the list if none selected
  const activeDisease = useMemo(() => {
    if (selectedDiseaseId) {
      return diseases.find((d) => d.id === selectedDiseaseId) || null;
    }
    return filteredDiseases[0] || diseases[0] || null;
  }, [selectedDiseaseId, filteredDiseases, diseases]);

  // Recommended plants for the active disease
  const recommendedPlants = useMemo(() => {
    if (!activeDisease) return [];
    return plants.filter((plant) =>
      activeDisease.tanamanObatIds.includes(plant.id)
    );
  }, [activeDisease, plants]);

  // Filter plants in catalog tab
  const filteredPlantsCatalog = useMemo(() => {
    if (!plantSearch.trim()) return plants;
    const query = plantSearch.toLowerCase();
    return plants.filter(
      (p) =>
        p.namaLokal.toLowerCase().includes(query) ||
        p.namaLatin.toLowerCase().includes(query) ||
        p.khasiatUtama.toLowerCase().includes(query) ||
        p.kandunganSenyawa.toLowerCase().includes(query)
    );
  }, [plants, plantSearch]);

  // Get active plant for details modal
  const activePlant = useMemo(() => {
    if (!selectedPlantId) return null;
    return plants.find((p) => p.id === selectedPlantId) || null;
  }, [selectedPlantId, plants]);

  // Contraindication Tiered Warning Checker
  const getPlantSafetyStatus = (plant: Plant) => {
    if (selectedRisks.length === 0) return { status: "safe", warnings: [] };

    const activeWarnings = plant.pantangan.filter((p) =>
      selectedRisks.includes(p.kondisiMedisId)
    );

    if (activeWarnings.length === 0) return { status: "safe", warnings: [] };

    const isHighRisk = activeWarnings.some(
      (w) =>
        w.tingkatRisiko?.toUpperCase() === "BERBAHAYA" ||
        w.tingkatRisiko?.toUpperCase() === "TINGGI"
    );

    return {
      status: isHighRisk ? "danger" : "warning",
      warnings: activeWarnings,
    };
  };

  // Helper to format step-by-step processing recipes beautifully
  const formatRecipeText = (text: string) => {
    const lines = text.split("\n");
    return (
      <div className="space-y-2 mt-1">
        {lines.map((line, idx) => {
          const trimmed = line.trim();
          if (trimmed.startsWith("Keluhan:")) {
            return (
              <h5
                key={idx}
                className="font-bold text-slate-800 dark:text-emerald-300 mt-4 first:mt-0 text-sm border-b border-slate-100 dark:border-leaf-700/30 pb-1"
              >
                {trimmed}
              </h5>
            );
          } else if (trimmed.startsWith("•") || trimmed.startsWith("-")) {
            const content = trimmed.substring(1).trim();
            const colonIndex = content.indexOf(":");
            if (colonIndex !== -1) {
              const label = content.substring(0, colonIndex);
              const desc = content.substring(colonIndex + 1);
              return (
                <div key={idx} className="flex gap-2 items-start pl-2 text-xs">
                  <span className="text-primary mt-0.5 select-none">✦</span>
                  <p className="text-slate-600 dark:text-slate-300">
                    <span className="font-semibold text-slate-700 dark:text-slate-200">
                      {label}:
                    </span>{" "}
                    {desc}
                  </p>
                </div>
              );
            }
            return (
              <div key={idx} className="flex gap-2 items-start pl-2 text-xs">
                <span className="text-primary mt-0.5 select-none">✦</span>
                <p className="text-slate-600 dark:text-slate-300">{content}</p>
              </div>
            );
          }
          return (
            <p
              key={idx}
              className="text-slate-500 dark:text-slate-400 pl-2 text-xs leading-relaxed"
            >
              {trimmed}
            </p>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6 w-full font-sans">
      {/* 1. Header Hero Panel */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-800 to-green-950 p-6 md:p-8 text-white shadow-xl dark:shadow-glow-hover/10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[radial-gradient(circle_at_100%_0%,_rgba(19,236,55,0.15)_0%,_transparent_70%)] pointer-events-none z-0"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest bg-emerald-950/60 dark:bg-black/30 backdrop-blur-md px-3.5 py-1.5 rounded-full w-fit">
              <span className="material-symbols-outlined text-[14px]">
                verified_user
              </span>
              Pustaka Kebenaran Botani
            </div>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-white">
              Ensiklopedia <span className="text-primary">Kesehatan Herbal</span>
            </h1>
            <p className="text-emerald-200 text-sm md:text-base font-light max-w-2xl leading-relaxed">
              Temukan hubungan ilmiah antara keluhan gejala, diagnosis penyakit,
              rekomendasi tanaman obat tradisional, beserta peringatan keamanan
              kontraindikasi secara bertingkat.
            </p>
          </div>

          <div className="flex gap-3 shrink-0">
            {/* Health Profile Trigger Button */}
            <button
              onClick={() => setShowRiskPanel(!showRiskPanel)}
              className={`flex items-center gap-2 rounded-full px-5 py-3 text-sm font-bold shadow-md transition-all active:scale-95 cursor-pointer relative ${
                selectedRisks.length > 0
                  ? "bg-amber-500 text-slate-950 hover:bg-amber-400"
                  : "bg-white text-slate-950 hover:bg-slate-100"
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">
                {selectedRisks.length > 0 ? "warning" : "health_and_safety"}
              </span>
              <span>Profil Medis Saya</span>
              {selectedRisks.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-white rounded-full text-[10px] w-5 h-5 flex items-center justify-center font-bold animate-[pulse_1.5s_infinite]">
                  {selectedRisks.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Tab switch Navigation */}
        <div className="flex gap-2 mt-8 border-t border-white/10 pt-4 z-10 relative">
          <button
            onClick={() => setActiveTab("diagnose")}
            className={`flex h-11 items-center gap-2.5 rounded-full px-6 text-sm font-bold transition-all ${
              activeTab === "diagnose"
                ? "bg-primary text-background-dark shadow-glow"
                : "bg-white/10 text-white hover:bg-white/20"
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">
              healing
            </span>
            <span>Cari Penyakit & Herbal</span>
          </button>
          <button
            onClick={() => setActiveTab("catalog")}
            className={`flex h-11 items-center gap-2.5 rounded-full px-6 text-sm font-bold transition-all ${
              activeTab === "catalog"
                ? "bg-primary text-background-dark shadow-glow"
                : "bg-white/10 text-white hover:bg-white/20"
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">
              local_florist
            </span>
            <span>Katalog Tanaman Obat</span>
          </button>
        </div>
      </div>

      {/* 2. Floating Health Profile Panel */}
      {showRiskPanel && (
        <div className="animate-[slideDown_0.25s_ease-out] bg-white dark:bg-leaf-800 rounded-3xl border border-slate-200 dark:border-leaf-700/50 p-6 shadow-xl relative z-20">
          <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-leaf-700/30">
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-amber-500 text-2xl">
                health_and_safety
              </span>
              <div>
                <h3 className="font-bold text-lg text-slate-800 dark:text-white">
                  Profil Riwayat Medis / Kerentanan Kesehatan
                </h3>
                <p className="text-xs text-slate-500 dark:text-leaf-400 mt-0.5">
                  Centang kondisi Anda untuk mengaktifkan **Saringan Keamanan Kontraindikasi** otomatis.
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowRiskPanel(false)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined text-2xl">close</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 py-5 max-h-[300px] overflow-y-auto">
            {conditions.map((cond) => {
              const isActive = selectedRisks.includes(cond.id);
              return (
                <button
                  key={cond.id}
                  onClick={() => toggleRisk(cond.id)}
                  className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl border text-left text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-amber-500/10 dark:bg-amber-500/20 border-amber-500 text-amber-600 dark:text-amber-400 ring-2 ring-amber-500/20"
                      : "bg-slate-50 dark:bg-leaf-900 border-slate-200 dark:border-leaf-700/50 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-leaf-700/40"
                  }`}
                >
                  <span
                    className={`material-symbols-outlined text-[18px] shrink-0 ${
                      isActive ? "text-amber-500 font-bold" : "text-slate-400"
                    }`}
                  >
                    {isActive ? "check_box" : "check_box_outline_blank"}
                  </span>
                  <span className="line-clamp-2 leading-snug">{cond.nama}</span>
                </button>
              );
            })}
          </div>

          {selectedRisks.length > 0 && (
            <div className="flex justify-between items-center bg-slate-50 dark:bg-leaf-900 px-4 py-3 rounded-2xl border border-slate-100 dark:border-leaf-700/30">
              <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                Profil Aktif:{" "}
                <span className="text-amber-600 dark:text-amber-400 font-bold">
                  {selectedRisks.length} Kondisi
                </span>{" "}
                terpilih.
              </p>
              <button
                onClick={clearRisks}
                className="text-xs font-bold text-red-500 hover:text-red-400 flex items-center gap-1 transition-colors"
              >
                <span className="material-symbols-outlined text-[14px]">
                  delete_forever
                </span>
                Reset Profil
              </button>
            </div>
          )}
        </div>
      )}

      {/* 3. Tab Contents */}
      <div className="w-full">
        {activeTab === "diagnose" ? (
          /* TAB 1: DISEASE DIRECT LOOKFLOW */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Panel A: Disease Selector (4 Columns) */}
            <div className="lg:col-span-4 bg-white dark:bg-leaf-800 border border-slate-200 dark:border-leaf-700/50 rounded-3xl p-5 shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">
                    format_list_bulleted
                  </span>
                  <h3 className="font-bold text-base text-slate-800 dark:text-white">
                    Pilih Penyakit
                  </h3>
                </div>
              </div>

              {/* Disease Search Bar */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Cari nama penyakit..."
                  value={diseaseSearch}
                  onChange={(e) => setDiseaseSearch(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-leaf-900 border border-slate-200 dark:border-leaf-700/50 rounded-2xl py-2.5 pl-9 pr-4 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                />
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
                  search
                </span>
              </div>

              {/* Disease Selection List */}
              <div className="h-[450px] overflow-y-auto pr-1 space-y-1 bg-slate-50/50 dark:bg-leaf-900/30 p-2 rounded-2xl border border-slate-100 dark:border-leaf-700/20">
                {filteredDiseases.map((disease) => {
                  const isSelected = activeDisease?.id === disease.id;
                  const plantCount = disease.tanamanObatIds.length;
                  return (
                    <button
                      key={disease.id}
                      onClick={() => setSelectedDiseaseId(disease.id)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 text-left rounded-xl transition-all text-xs font-medium cursor-pointer ${
                        isSelected
                          ? "bg-primary/10 dark:bg-primary/20 text-primary border border-primary/30 font-bold shadow-sm"
                          : "hover:bg-slate-100 dark:hover:bg-leaf-750 text-slate-600 dark:text-slate-300 border border-transparent"
                      }`}
                    >
                      <span className="truncate pr-2">{disease.nama}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full shrink-0 ${
                        isSelected
                          ? "bg-primary/20 text-primary"
                          : "bg-slate-100 dark:bg-leaf-900 text-slate-500 dark:text-leaf-400"
                      }`}>
                        {plantCount} Tanaman
                      </span>
                    </button>
                  );
                })}

                {filteredDiseases.length === 0 && (
                  <p className="text-center text-slate-400 text-xs italic py-10">
                    Penyakit tidak ditemukan.
                  </p>
                )}
              </div>
            </div>

            {/* Panel B: Disease Detail & Symptoms (4 Columns) */}
            <div className="lg:col-span-4 bg-white dark:bg-leaf-800 border border-slate-200 dark:border-leaf-700/50 rounded-3xl p-5 shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">
                  info
                </span>
                <h3 className="font-bold text-base text-slate-800 dark:text-white">
                  Detail Penyakit & Gejala
                </h3>
              </div>

              {!activeDisease ? (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-3">
                  <span className="material-symbols-outlined text-5xl text-slate-300 dark:text-leaf-700">
                    medical_services
                  </span>
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-slate-600 dark:text-slate-400">
                      Penyakit Belum Dipilih
                    </p>
                    <p className="text-xs text-slate-400 max-w-[200px]">
                      Silakan pilih penyakit di kolom kiri untuk melihat penjelasan dan gejalanya.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 h-[500px] overflow-y-auto pr-1">
                  {/* Disease Info Box */}
                  <div className="bg-slate-50 dark:bg-leaf-900 border border-slate-100 dark:border-leaf-700/30 p-4 rounded-2xl space-y-2">
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                      {activeDisease.nama}
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-light">
                      {activeDisease.deskripsi || "Tidak ada deskripsi tertulis untuk penyakit ini."}
                    </p>
                  </div>

                  {/* Disease Symptoms List */}
                  <div className="space-y-2.5">
                    <p className="text-[10px] font-bold text-slate-400 dark:text-leaf-400 uppercase tracking-wider">
                      Gejala yang Terkait ({activeDisease.gejala.length})
                    </p>
                    
                    <div className="flex flex-col gap-2">
                      {activeDisease.gejala.map((g) => (
                        <div
                          key={g.gejalaId}
                          className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50/50 dark:bg-leaf-900/20 border border-slate-100 dark:border-leaf-700/10 text-xs"
                        >
                          <span className={`material-symbols-outlined text-[16px] shrink-0 mt-0.5 ${
                            g.isGejalaWajib ? "text-red-500" : "text-emerald-500"
                          }`}>
                            {g.isGejalaWajib ? "emergency" : "circle"}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-slate-800 dark:text-slate-200 leading-snug">
                              {g.nama}
                            </p>
                            <p className="text-[10px] text-slate-500 dark:text-leaf-400 mt-0.5">
                              Tipe: {g.isGejalaWajib ? "Gejala Utama/Wajib" : "Gejala Umum"} • Bobot: {g.bobotGejala}/5
                            </p>
                          </div>
                        </div>
                      ))}

                      {activeDisease.gejala.length === 0 && (
                        <p className="text-slate-400 italic text-xs py-4 text-center">
                          Belum ada data gejala tercatat untuk penyakit ini.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Panel C: Treatment & Safety Check (4 Columns) */}
            <div className="lg:col-span-4 bg-white dark:bg-leaf-800 border border-slate-200 dark:border-leaf-700/50 rounded-3xl p-5 shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">
                  vaccines
                </span>
                <h3 className="font-bold text-base text-slate-800 dark:text-white">
                  Pengobatan Herbal & Keamanan
                </h3>
              </div>

              {!activeDisease ? (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-3">
                  <span className="material-symbols-outlined text-5xl text-slate-300 dark:text-leaf-700">
                    spa
                  </span>
                  <p className="text-sm font-bold text-slate-600 dark:text-slate-400">
                    Pilih Penyakit Terlebih Dahulu
                  </p>
                  <p className="text-xs text-slate-400 max-w-[200px]">
                    Daftar tanaman obat dan saringan keselamatan medis akan muncul di sini.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Summary of Active Disease */}
                  <div className="bg-slate-50 dark:bg-leaf-900 border border-slate-100 dark:border-leaf-700/30 p-4 rounded-2xl space-y-1.5">
                    <p className="text-[10px] font-bold text-primary uppercase tracking-wider">
                      Penyakit Terpilih
                    </p>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                      {activeDisease.nama}
                    </h4>
                  </div>

                  {/* Recommended Plants Grid */}
                  <div className="space-y-3">
                    <p className="text-[10px] font-bold text-slate-400 dark:text-leaf-400 uppercase tracking-wider">
                      Tanaman Pengobatan ({recommendedPlants.length})
                    </p>

                    <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
                      {recommendedPlants.map((plant) => {
                        const safety = getPlantSafetyStatus(plant);
                        return (
                          <div
                            key={plant.id}
                            className={`p-3 rounded-2xl border flex flex-col gap-2.5 transition-all bg-white dark:bg-leaf-800 ${
                              safety.status === "danger"
                                ? "border-red-500/50 bg-red-50/50 dark:bg-red-950/20"
                                : safety.status === "warning"
                                ? "border-amber-500/50 bg-amber-50/50 dark:bg-amber-950/20"
                                : "border-slate-100 dark:border-leaf-700/50"
                            }`}
                          >
                            {/* Plant Card header */}
                            <div className="flex gap-2.5 items-start">
                              {plant.gambarUrl ? (
                                <img
                                  src={plant.gambarUrl}
                                  alt={plant.namaLokal}
                                  className="w-10 h-10 rounded-xl object-cover shrink-0 border border-slate-100 dark:border-leaf-700"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-leaf-900 flex items-center justify-center shrink-0">
                                  <span className="material-symbols-outlined text-primary/40 text-xl">
                                    spa
                                  </span>
                                </div>
                              )}
                              <div className="min-w-0 flex-1">
                                <h5 className="font-bold text-xs text-slate-900 dark:text-white truncate">
                                  {plant.namaLokal}
                                </h5>
                                <p className="text-[9px] text-slate-500 dark:text-leaf-400 italic truncate font-serif">
                                  {plant.namaLatin}
                                </p>
                              </div>
                            </div>

                            {/* Dynamic Safety Badges & Reasoning */}
                            {safety.status !== "safe" ? (
                              <div className="space-y-1">
                                {safety.warnings.map((w, idx) => (
                                  <div
                                    key={idx}
                                    className={`text-[9px] p-2.5 rounded-xl border leading-relaxed ${
                                      safety.status === "danger"
                                        ? "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20"
                                        : "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20"
                                    }`}
                                  >
                                    <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider mb-0.5">
                                      <span className="material-symbols-outlined text-[12px]">
                                        {safety.status === "danger"
                                          ? "error"
                                          : "warning"}
                                      </span>
                                      <span>
                                        {safety.status === "danger"
                                          ? `BENTROK BAHAYA: ${w.kondisiMedisNama}`
                                          : `PERINGATAN: ${w.kondisiMedisNama}`}
                                      </span>
                                    </div>
                                    <p className="font-light">{w.alasan}</p>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="flex items-center gap-1 text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded w-fit">
                                <span className="material-symbols-outlined text-[11px]">
                                  check_circle
                                </span>
                                <span>Aman untuk Anda</span>
                              </div>
                            )}

                            {/* View recipe details trigger button */}
                            <button
                              onClick={() => setSelectedPlantId(plant.id)}
                              className="w-full bg-slate-50 hover:bg-slate-100 dark:bg-leaf-900 dark:hover:bg-leaf-750 text-slate-700 dark:text-white border border-slate-100 dark:border-leaf-700 text-[10px] font-bold py-1.5 rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer"
                            >
                              <span>Lihat Resep & Detail</span>
                              <span className="material-symbols-outlined text-[12px]">
                                arrow_forward
                              </span>
                            </button>
                          </div>
                        );
                      })}

                      {recommendedPlants.length === 0 && (
                        <p className="text-center text-slate-400 text-xs italic py-10">
                          Belum ada data tanaman terdaftar untuk penyakit ini.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* TAB 2: DETAILED BOTANICAL CATALOGUE */
          <div className="space-y-6">
            {/* Search & Statistics Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white dark:bg-leaf-800 border border-slate-200 dark:border-leaf-700/50 p-4 rounded-3xl shadow-sm">
              <div className="relative w-full sm:max-w-md">
                <input
                  type="text"
                  placeholder="Cari tanaman, spesies latin, kandungan senyawa, khasiat..."
                  value={plantSearch}
                  onChange={(e) => setPlantSearch(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-leaf-900 border border-slate-200 dark:border-leaf-700/50 rounded-full py-3 pl-11 pr-4 text-sm text-slate-800 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                />
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl">
                  search
                </span>
              </div>
              <div className="text-xs text-slate-500 dark:text-leaf-400 font-medium shrink-0">
                Menampilkan{" "}
                <span className="font-bold text-primary">
                  {filteredPlantsCatalog.length}
                </span>{" "}
                dari <span className="font-bold">{plants.length}</span> tanaman
              </div>
            </div>

            {/* Plants Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredPlantsCatalog.map((plant) => {
                const safety = getPlantSafetyStatus(plant);
                const treatsCount = plant.penyakitTerkaitIds.length;

                return (
                  <div
                    key={plant.id}
                    onClick={() => setSelectedPlantId(plant.id)}
                    className={`group relative flex flex-col glass-card rounded-3xl overflow-hidden hover:-translate-y-2 dark:hover:shadow-glow-hover hover:shadow-lg transition-all duration-300 cursor-pointer border bg-white dark:bg-transparent ${
                      safety.status === "danger"
                        ? "border-red-500/30 dark:border-red-500/20"
                        : safety.status === "warning"
                        ? "border-amber-500/30 dark:border-amber-500/20"
                        : "border-slate-200 dark:border-leaf-700/50"
                    }`}
                  >
                    {/* Plant image */}
                    <div className="relative h-44 w-full overflow-hidden shrink-0">
                      {plant.gambarUrl ? (
                        <img
                          alt={plant.namaLokal}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                          src={plant.gambarUrl}
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 dark:bg-leaf-800 transition-transform duration-500 group-hover:scale-110">
                          <span className="material-symbols-outlined text-5xl text-primary/30">
                            local_florist
                          </span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 dark:from-background-dark via-transparent to-transparent opacity-80 z-0"></div>

                      {/* Safety badge overlay */}
                      <div className="absolute top-3 left-3 z-10">
                        {safety.status === "danger" ? (
                          <span className="flex items-center gap-1 bg-red-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-md">
                            <span className="material-symbols-outlined text-[12px] font-bold">
                              error
                            </span>
                            BAHAYA
                          </span>
                        ) : safety.status === "warning" ? (
                          <span className="flex items-center gap-1 bg-amber-500 text-slate-900 text-[10px] font-bold px-2.5 py-1 rounded-full shadow-md">
                            <span className="material-symbols-outlined text-[12px] font-bold">
                              warning
                            </span>
                            PANTANGAN
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 bg-emerald-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-md">
                            <span className="material-symbols-outlined text-[12px] font-bold">
                              check_circle
                            </span>
                            AMAN
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Plant texts */}
                    <div className="p-5 flex flex-col gap-3 flex-1 bg-white dark:bg-leaf-800/40 dark:backdrop-blur-md z-10 justify-between">
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-start gap-2">
                          <h3 className="text-slate-900 dark:text-white text-lg font-bold leading-tight group-hover:text-primary transition-colors">
                            {plant.namaLokal}
                          </h3>
                        </div>
                        <p className="text-slate-500 dark:text-leaf-400 text-xs italic font-serif">
                          {plant.namaLatin}
                        </p>
                        <p className="text-slate-600 dark:text-slate-300 text-xs line-clamp-2 leading-relaxed font-light mt-2">
                          {plant.khasiatUtama}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-slate-100 dark:border-white/5 flex justify-between items-center text-[10px] font-medium text-slate-400">
                        <span className="bg-slate-100 dark:bg-leaf-700/50 px-2 py-0.5 rounded-full">
                          {treatsCount} Penyakit
                        </span>
                        <span className="text-primary font-bold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                          Detail
                          <span className="material-symbols-outlined text-[12px]">
                            arrow_forward
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}

              {filteredPlantsCatalog.length === 0 && (
                <div className="col-span-full py-20 text-center text-slate-400 italic">
                  Tanaman tidak ditemukan dalam katalog database.
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 4. Plant Detail Modal Drawer */}
      {activePlant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
          <div className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto bg-white dark:bg-leaf-800 rounded-3xl shadow-2xl border border-slate-200 dark:border-leaf-700 p-6 md:p-8 animate-[zoomIn_0.25s_ease-out]">
            {/* Close Button */}
            <button
              onClick={() => setSelectedPlantId(null)}
              className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-black/20 hover:bg-black/40 text-white flex items-center justify-center transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined">close</span>
            </button>

            {/* Header info with image */}
            <div className="flex flex-col sm:flex-row gap-5 pb-5 border-b border-slate-100 dark:border-leaf-700/30">
              {activePlant.gambarUrl ? (
                <img
                  src={activePlant.gambarUrl}
                  alt={activePlant.namaLokal}
                  className="w-full sm:w-36 h-36 rounded-2xl object-cover border border-slate-100 dark:border-leaf-700 shrink-0 shadow-md"
                />
              ) : (
                <div className="w-full sm:w-36 h-36 rounded-2xl bg-slate-100 dark:bg-leaf-900 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-primary/40 text-4xl">
                    local_florist
                  </span>
                </div>
              )}

              <div className="space-y-2 flex-1 justify-center flex flex-col">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {activePlant.namaLokal}
                </h2>
                <p className="text-sm text-slate-500 dark:text-leaf-400 italic font-serif">
                  {activePlant.namaLatin}
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  <span className="bg-primary/10 text-primary text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                    Tanaman Obat
                  </span>
                  {activePlant.penyakitTerkaitIds.map((pId) => {
                    const disease = diseases.find((d) => d.id === pId);
                    if (!disease) return null;
                    return (
                      <span
                        key={pId}
                        className="bg-slate-100 dark:bg-leaf-700 text-slate-600 dark:text-slate-300 text-[10px] px-2.5 py-1 rounded-full"
                      >
                        {disease.nama}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Main content body */}
            <div className="py-5 space-y-5 text-xs md:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              <div className="space-y-1.5">
                <h4 className="font-bold text-slate-800 dark:text-white text-xs uppercase tracking-wider text-primary">
                  Deskripsi Tanaman
                </h4>
                <p className="font-light">{activePlant.deskripsi}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <h4 className="font-bold text-slate-800 dark:text-white text-xs uppercase tracking-wider text-primary">
                    Kandungan Senyawa Aktif
                  </h4>
                  <p className="font-light bg-slate-50 dark:bg-leaf-900/50 p-3 rounded-2xl border border-slate-100 dark:border-leaf-700/20 text-xs">
                    {activePlant.kandunganSenyawa}
                  </p>
                </div>
                <div className="space-y-1.5">
                  <h4 className="font-bold text-slate-800 dark:text-white text-xs uppercase tracking-wider text-primary">
                    Khasiat Tradisional Utama
                  </h4>
                  <p className="font-light bg-slate-50 dark:bg-leaf-900/50 p-3 rounded-2xl border border-slate-100 dark:border-leaf-700/20 text-xs">
                    {activePlant.khasiatUtama}
                  </p>
                </div>
              </div>

              {/* Recipe step-by-step rendering */}
              <div className="space-y-1.5">
                <h4 className="font-bold text-slate-800 dark:text-white text-xs uppercase tracking-wider text-primary">
                  Cara Pengolahan & Resep Ramuan
                </h4>
                <div className="bg-slate-50 dark:bg-leaf-900 p-4 rounded-3xl border border-slate-100 dark:border-leaf-700/30 space-y-2">
                  {activePlant.resepPengolahan.length > 0 ? (
                    activePlant.resepPengolahan.map((resep) => (
                      <div key={resep.id} className="pb-3 last:pb-0 last:border-b-0 border-b border-slate-200/50 dark:border-leaf-700/40">
                        {formatRecipeText(resep.langkah)}
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-400 italic text-xs">
                      Resep langkah pengolahan belum diinput.
                    </p>
                  )}
                </div>
              </div>

              {/* Complete warnings block */}
              <div className="space-y-1.5 pt-2">
                <h4 className="font-bold text-slate-800 dark:text-white text-xs uppercase tracking-wider text-primary">
                  Saringan Keamanan & Kontraindikasi Lengkap
                </h4>
                <div className="space-y-2">
                  {activePlant.pantangan.map((p, idx) => {
                    const isUserActive = selectedRisks.includes(p.kondisiMedisId);
                    const isHigh =
                      p.tingkatRisiko?.toUpperCase() === "BERBAHAYA" ||
                      p.tingkatRisiko?.toUpperCase() === "TINGGI";
                    return (
                      <div
                        key={idx}
                        className={`p-3 rounded-2xl border text-xs leading-relaxed flex flex-col gap-1.5 ${
                          isUserActive
                            ? isHigh
                              ? "bg-red-500/10 border-red-500/30 text-red-800 dark:text-red-400 ring-2 ring-red-500/10"
                              : "bg-amber-500/10 border-amber-500/30 text-amber-800 dark:text-amber-400 ring-2 ring-amber-500/10"
                            : "bg-slate-50 dark:bg-leaf-900 border-slate-100 dark:border-leaf-700/20 text-slate-500 dark:text-leaf-400"
                        }`}
                      >
                        <div className="flex justify-between items-center font-bold">
                          <span className="flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[14px]">
                              {isHigh ? "error" : "warning"}
                            </span>
                            <span>{p.kondisiMedisNama}</span>
                          </span>
                          <span
                            className={`text-[9px] px-2 py-0.5 rounded-full ${
                              isHigh
                                ? "bg-red-500/20 text-red-600 dark:text-red-400"
                                : "bg-amber-500/20 text-amber-600 dark:text-amber-400"
                            }`}
                          >
                            {p.tingkatRisiko || "Sedang"}
                          </span>
                        </div>
                        <p className="font-light">{p.alasan}</p>
                        {isUserActive && (
                          <div className="text-[9px] font-bold uppercase tracking-wider text-red-600 dark:text-red-400 mt-1 flex items-center gap-1">
                            <span className="material-symbols-outlined text-[12px]">
                              gavel
                            </span>
                            Kondisi ini sedang aktif pada profil kesehatan Anda!
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {activePlant.pantangan.length === 0 && (
                    <p className="text-slate-400 italic text-xs">
                      Tidak ada kontraindikasi medis yang tercatat secara khusus.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="pt-4 border-t border-slate-100 dark:border-leaf-700/30 flex justify-end">
              <button
                onClick={() => setSelectedPlantId(null)}
                className="bg-primary hover:bg-primary-hover text-background-dark font-bold text-xs px-5 py-2.5 rounded-full transition-all active:scale-95 cursor-pointer shadow-md shadow-primary/20"
              >
                Tutup Detail
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Embedded Animations for Smooth Interactivity */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes zoomIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
