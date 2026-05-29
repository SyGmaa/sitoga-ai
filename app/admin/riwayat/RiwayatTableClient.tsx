"use client";

import { useState } from "react";
import Link from "next/link";

interface RiwayatListProps {
  initialList: any[];
}

export default function RiwayatTableClient({ initialList }: RiwayatListProps) {
  const [selectedRiwayat, setSelectedRiwayat] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<"summary" | "chat">("summary");

  const closeModal = () => {
    setSelectedRiwayat(null);
    setActiveTab("summary");
  };

  return (
    <>
      <div className="bg-white/60 dark:bg-[#0a1e0f]/50 backdrop-blur-md border border-white/40 dark:border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.05)] dark:shadow-[0_4px_30px_rgba(0,0,0,0.3)] rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-200/50 dark:border-slate-700/50 text-slate-500 dark:text-slate-400 uppercase tracking-wider text-xs">
              <tr>
                <th className="px-6 py-5 font-bold" scope="col">Tanggal</th>
                <th className="px-6 py-5 font-bold" scope="col">Keluhan Pengguna</th>
                <th className="px-6 py-5 font-bold" scope="col">Hasil Diagnosa</th>
                <th className="px-6 py-5 font-bold text-center" scope="col">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/50 dark:divide-slate-700/50">
              {initialList.map((riwayat) => {
                const hasil = riwayat.hasilDiagnosa as any;
                const namaPenyakit = hasil?.nama_penyakit || "Tidak diketahui";
                const tanaman = hasil?.tanaman_obat || hasil?.rekomendasi_tanaman;

                return (
                  <tr 
                    key={riwayat.id} 
                    className="hover:bg-white/40 dark:hover:bg-white/5 transition-colors group cursor-pointer"
                    onClick={() => setSelectedRiwayat(riwayat)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0 group-hover:scale-110 transition-transform">
                          <span className="material-symbols-outlined text-xl">medical_services</span>
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 dark:text-white text-sm">
                            {new Date(riwayat.createdAt).toLocaleDateString("id-ID", { dateStyle: "long" })}
                          </p>
                          <p className="text-xs text-slate-400">
                            {new Date(riwayat.createdAt).toLocaleTimeString("id-ID", { timeStyle: "short" })}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-slate-700 dark:text-slate-300 max-w-xs truncate font-medium">
                        {riwayat.keluhanPengguna}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800 w-fit">
                          <span className="material-symbols-outlined text-sm">vaccines</span>
                          {namaPenyakit}
                        </span>
                        {Array.isArray(tanaman) && tanaman.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {tanaman.slice(0, 3).map((t: any, i: number) => (
                              <span key={i} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                                🌿 {typeof t === "string" ? t : t.nama || t.namaLokal || "Tanaman"}
                              </span>
                            ))}
                            {tanaman.length > 3 && (
                              <span className="text-xs text-slate-400">+{tanaman.length - 3} lainnya</span>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => setSelectedRiwayat(riwayat)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-hover border border-primary/20 hover:bg-primary hover:text-white dark:hover:bg-primary transition-all cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-sm">visibility</span>
                        Detail
                      </button>
                    </td>
                  </tr>
                );
              })}

              {initialList.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="h-16 w-16 rounded-full bg-slate-100 dark:bg-slate-800/50 flex items-center justify-center text-slate-400">
                        <span className="material-symbols-outlined text-3xl">history</span>
                      </div>
                      <p className="text-slate-500 font-medium">Belum ada riwayat diagnosa.</p>
                      <p className="text-slate-400 text-xs">Riwayat akan muncul setelah pengguna melakukan konsultasi.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedRiwayat && (() => {
        const hasil = selectedRiwayat.hasilDiagnosa as any;
        const namaPenyakit = hasil?.nama_penyakit || "Tidak diketahui";
        const gejala = hasil?.gejala_terdeteksi || [];
        const tanaman = hasil?.tanaman_obat || hasil?.rekomendasi_tanaman || [];
        const penjelasan = hasil?.penjelasan_singkat || hasil?.penjelasan || "";
        
        // Get conversation log, fallback to mock conversation if older log format
        const percakapan = hasil?.percakapan || [
          { role: "user", content: selectedRiwayat.keluhanPengguna },
          { role: "assistant", content: penjelasan || "Hasil analisis diagnosis selesai." }
        ];

        return (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-[riwayatFadeIn_0.2s_ease-out]"
            onClick={closeModal}
          >
            <div 
              className="bg-white dark:bg-[#0c1f11] border border-slate-200 dark:border-white/10 rounded-3xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-[riwayatScaleIn_0.2s_ease-out]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="px-6 py-5 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/30">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/20 text-primary flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-xl">clinical_notes</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 dark:text-white text-base">Detail Rekam Diagnosa</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {new Date(selectedRiwayat.createdAt).toLocaleDateString("id-ID", { dateStyle: "long", timeStyle: "short" })}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={closeModal}
                  className="w-8 h-8 rounded-full hover:bg-slate-200 dark:hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
                >
                  <span className="material-symbols-outlined text-xl">close</span>
                </button>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-slate-100 dark:border-white/5 bg-slate-50/20 dark:bg-slate-900/10 px-4">
                <button
                  onClick={() => setActiveTab("summary")}
                  className={`px-5 py-3.5 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
                    activeTab === "summary"
                      ? "border-primary text-primary"
                      : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
                  }`}
                >
                  <span className="material-symbols-outlined text-lg">description</span>
                  Hasil Diagnosis & Resep
                </button>
                <button
                  onClick={() => setActiveTab("chat")}
                  className={`px-5 py-3.5 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
                    activeTab === "chat"
                      ? "border-primary text-primary"
                      : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
                  }`}
                >
                  <span className="material-symbols-outlined text-lg">forum</span>
                  Percakapan Lengkap
                  <span className="bg-primary/20 text-primary text-[10px] px-1.5 py-0.5 rounded-full font-bold ml-1">
                    {percakapan.length} Msg
                  </span>
                </button>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                
                {/* Tab: Summary */}
                {activeTab === "summary" && (
                  <div className="space-y-6 text-slate-800 dark:text-slate-200">
                    {/* Keluhan */}
                    <div>
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Keluhan Pengguna</h4>
                      <div className="p-4 bg-slate-50 dark:bg-[#234829]/10 rounded-2xl border border-slate-200/50 dark:border-white/5">
                        <p className="text-slate-800 dark:text-slate-200 text-sm leading-relaxed font-medium">
                          "{selectedRiwayat.keluhanPengguna}"
                        </p>
                      </div>
                    </div>

                    {/* Penyakit & Gejala */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Penyakit Terdeteksi</h4>
                        <div className="p-4 bg-green-50 dark:bg-[#1b3d22]/30 border border-green-200 dark:border-green-800/30 rounded-2xl flex items-center gap-3">
                          <span className="material-symbols-outlined text-2xl text-green-600 dark:text-green-400 shrink-0">vaccines</span>
                          <div>
                            <p className="text-green-800 dark:text-green-300 font-bold text-base">{namaPenyakit}</p>
                            <p className="text-[10px] text-green-600 dark:text-green-400/80 mt-0.5">CF-Based Diagnosis</p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Gejala Terdeteksi</h4>
                        <div className="p-4 bg-blue-50 dark:bg-[#1a2d3d]/30 border border-blue-200 dark:border-blue-800/30 rounded-2xl">
                          <div className="flex flex-wrap gap-1.5">
                            {gejala.length > 0 ? (
                              gejala.map((g: string, i: number) => (
                                <span key={i} className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800/30">
                                  {g}
                                </span>
                              ))
                            ) : (
                              <p className="text-xs text-slate-500 italic">Tidak ada daftar gejala spesifik yang tercatat.</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Rekomendasi Tanaman */}
                    <div>
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Rekomendasi Tanaman Herbal</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {Array.isArray(tanaman) && tanaman.length > 0 ? (
                          tanaman.map((t: any, i: number) => {
                            const plantId = typeof t === "string" ? null : t.id;
                            const plantName = typeof t === "string" ? t : t.nama || t.namaLokal;
                            
                            return (
                              <div key={i} className="flex items-center justify-between p-3 rounded-2xl bg-emerald-50/50 dark:bg-[#234829]/20 border border-emerald-200/50 dark:border-transparent">
                                <span className="text-sm font-bold text-slate-800 dark:text-slate-200">🌿 {plantName}</span>
                                {plantId && (
                                  <Link 
                                    href={`/tanaman/${plantId}`}
                                    target="_blank"
                                    className="text-xs font-bold text-primary hover:underline flex items-center gap-0.5"
                                  >
                                    Detail <span className="material-symbols-outlined text-[10px]">open_in_new</span>
                                  </Link>
                                )}
                              </div>
                            );
                          })
                        ) : (
                          <div className="col-span-2 p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200/50 dark:border-white/5 text-center">
                            <p className="text-slate-500 dark:text-slate-400 text-xs italic">Tidak ada tanaman herbal tertentu yang direkomendasikan.</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Penjelasan Singkat */}
                    {penjelasan && (
                      <div>
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Penjelasan Diagnosis & Herbal</h4>
                        <div className="p-5 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200/50 dark:border-white/5">
                          <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-line font-normal">
                            {penjelasan}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Tab: Chat History */}
                {activeTab === "chat" && (
                  <div className="space-y-4">
                    <div className="flex flex-col gap-4 bg-slate-50 dark:bg-black/20 p-4 rounded-3xl border border-slate-200/40 dark:border-white/5 max-h-[50vh] overflow-y-auto">
                      {percakapan.map((msg: any, i: number) => {
                        const isUser = msg.role === "user";
                        return (
                          <div
                            key={i}
                            className={`flex gap-3 items-start ${isUser ? "justify-end" : "justify-start"}`}
                          >
                            {!isUser && (
                              <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center shrink-0 shadow-sm text-xs font-bold">
                                AI
                              </div>
                            )}
                            <div className={`flex flex-col gap-1 max-w-[80%] ${isUser ? "items-end" : "items-start"}`}>
                              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                {isUser ? "User" : "SITOBAT-AI"}
                              </span>
                              <div className={`p-4 rounded-2xl leading-relaxed text-sm shadow-sm ${
                                isUser
                                  ? "bg-primary text-background-dark font-medium rounded-tr-none"
                                  : "bg-white dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-tl-none"
                              }`}>
                                <p className="whitespace-pre-line font-normal">{msg.content}</p>
                              </div>
                            </div>
                            {isUser && (
                              <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0 shadow-sm text-xs font-bold">
                                ME
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t border-slate-100 dark:border-white/5 flex justify-end gap-3 bg-slate-50/50 dark:bg-slate-900/30">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 rounded-xl text-sm font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10 transition-colors cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      <style jsx global>{`
        @keyframes riwayatScaleIn {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes riwayatFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </>
  );
}
