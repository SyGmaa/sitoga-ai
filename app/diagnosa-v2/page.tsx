"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

interface AiModel {
  id: string;
  provider: string;
  modelId: string;
  label: string;
  badge: string;
  isDefault?: boolean;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  data?: any;
}

export default function DiagnosaV2Page() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "system-1",
      role: "assistant",
      content: "Yooo... aku Hybrid AI versi baru. Sistem pemeriksaanku digerakkan oleh algoritma deterministik yang pantang halusinasi! Silakan ceritakan keluhanmu secara detail."
    }
  ]);
  const [aiModels, setAiModels] = useState<AiModel[]>([]);
  const [selectedModelIdx, setSelectedModelIdx] = useState(0);
  const [showModelPicker, setShowModelPicker] = useState(false);
  const [isModelsLoading, setIsModelsLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const selectedModel = aiModels[selectedModelIdx] || null;
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchModels() {
      try {
        const res = await fetch("/api/models");
        const data = await res.json();
        if (Array.isArray(data)) {
          setAiModels(data);
          const defaultIdx = data.findIndex((m: AiModel) => m.isDefault);
          if (defaultIdx !== -1) setSelectedModelIdx(defaultIdx);
        }
      } catch (err) {
        console.error("Failed to load AI models:", err);
      } finally {
        setIsModelsLoading(false);
      }
    }
    fetchModels();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSendMessage = async (e?: React.FormEvent, overrideInput?: string) => {
    if (e) e.preventDefault();
    const finalInput = overrideInput || input;
    if (!finalInput.trim() || isLoading) return;

    setInput("");
    
    const userMsg: Message = {
        id: `user-${Date.now()}`,
        role: "user",
        content: finalInput
    };
    
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
        const payload = {
            provider: selectedModel?.provider,
            model: selectedModel?.modelId,
            messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content }))
        };

        const res = await fetch("/api/diagnosa-v2", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        const data = await res.json();
        
        if (!res.ok) {
            throw new Error(data.error || "Gagal memproses diagnosa");
        }

        const asstMsgId = `asst-${Date.now()}`;
        
        if (data.tipe_respons === "TINDAK_LANJUT") {
            setMessages(prev => [...prev, {
                id: asstMsgId,
                role: "assistant",
                content: data.pesan
            }]);
        } else if (data.tipe_respons === "DIAGNOSA_FINAL" && data.data) {
            const diagData = data.data;
            if (diagData.status === "RUJUK_DOKTER") {
                setMessages(prev => [...prev, {
                    id: asstMsgId,
                    role: "assistant",
                    content: diagData.pesan_rujukan,
                    data: {
                        type: "RUJUK_DOKTER",
                        alasan: diagData.pesan_rujukan
                    }
                }]);
            } else if (diagData.status === "SUKSES") {
                setMessages(prev => [...prev, {
                    id: asstMsgId,
                    role: "assistant",
                    content: "Berikut adalah hasil diagnosa dari sistem Hibrida:",
                    data: {
                        type: "DIAGNOSA_FINAL",
                        nama_penyakit: diagData.penyakit_tertinggi,
                        probabilitas: diagData.probabilitas,
                        gejala_terdeteksi: diagData.gejala_terdeteksi,
                        rekomendasi_tanaman: diagData.tanaman_rekomendasi,
                        peringatanTambahan: diagData.tanaman_dihapus_karena_pantangan?.length > 0 
                            ? "Catatan: Sebagian tanaman disembunyikan/dibatalkan aplikasinya karena bertentangan dengan kondisi medis Anda." 
                            : null
                    }
                }]);
            }
        }
    } catch (err: any) {
        console.error(err);
        setMessages(prev => [...prev, {
            id: `sys-err-${Date.now()}`,
            role: "assistant",
            content: `Maaf, terjadi kesalahan: ${err.message}`
        }]);
    } finally {
        setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([{
      id: "system-1",
      role: "assistant",
      content: "Yooo... aku Hybrid AI versi baru. Sistem pemeriksaanku digerakkan oleh algoritma deterministik yang pantang halusinasi! Silakan ceritakan keluhanmu secara detail."
    }]);
  };

  const renderDiagnosisCard = (data: any) => {
    const gejalaClean = data.gejala_terdeteksi || [];
    const rekomendasiClean = data.rekomendasi_tanaman || [];

    return (
      <div className="glass-panel text-left rounded-xl overflow-hidden shadow-2xl border border-primary/20 w-full animate-[fadeIn_0.5s_ease-out] mt-3">
        <div className="bg-[#234829]/30 px-6 py-4 border-b border-[#234829] flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-primary/20 p-2 rounded-lg text-primary">
              <span className="material-symbols-outlined">health_metrics</span>
            </div>
            <div>
              <h3 className="text-white font-bold text-lg">Hybrid Deterministic Result</h3>
            </div>
          </div>
          <div className="bg-[#13ec37]/10 px-3 py-1 rounded-full border border-[#13ec37]/30">
             <span className="text-[#13ec37] font-bold text-sm">{data.probabilitas}% Match</span>
          </div>
        </div>
        <div className="p-6">
          <h4 className="text-xl text-white font-semibold mb-2">{data.nama_penyakit}</h4>
          
          {gejalaClean.length > 0 && (
            <p className="text-slate-300 text-sm mb-4">
              Gejala terekstrak: <span className="text-[#92c99b]">{gejalaClean.join(", ")}</span>
            </p>
          )}

          {data.peringatanTambahan && (
            <div className="mb-4 bg-amber-900/40 p-3 rounded-lg border border-amber-500/30 flex items-start gap-2">
               <span className="material-symbols-outlined text-amber-500 text-sm">warning</span>
               <p className="text-amber-200 text-xs italic">{data.peringatanTambahan}</p>
            </div>
          )}
          
          {rekomendasiClean.length > 0 ? (
            <div className="space-y-4">
              <h5 className="text-[#92c99b] text-xs font-bold uppercase tracking-wider mb-2">Rekomendasi Tanaman Obat</h5>
              {rekomendasiClean.map((plant: any, idx: number) => (
                <div key={idx} className="group flex flex-col gap-2 p-4 rounded-xl bg-[#234829]/20 border border-[#234829]/50 hover:border-primary/40 hover:bg-[#234829]/40 transition-all cursor-pointer">
                  <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h6 className="text-white font-bold text-lg">{plant.namaLokal}</h6>
                        <p className="text-slate-400 text-xs italic">{plant.namaLatin}</p>
                      </div>
                      <Link href={`/tanaman/${plant.id}`} className="flex items-center text-[#13ec37] hover:brightness-125 text-sm gap-1 transition-all">
                          <span className="font-semibold">Resep</span>
                          <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                      </Link>
                  </div>
                  {plant.peringatanMedis && (
                     <div className="mt-2 space-y-1">
                        {plant.peringatanMedis.map((warn: any, wIdx: number) => (
                           <div key={wIdx} className="bg-red-900/30 border border-red-500/30 px-2 py-1 rounded flex items-center gap-2">
                               <span className="material-symbols-outlined text-red-400 text-[14px]">gpp_bad</span>
                               <span className="text-red-300 text-[10px] font-semibold">{warn.tingkatRisiko}: {warn.alasan}</span>
                           </div>
                        ))}
                     </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-400 text-sm italic">
              Belum ada rekomendasi tanaman obat yang aman spesifik untuk kondisi ini di database.
            </p>
          )}
        </div>
      </div>
    );
  };

  const renderRujukDokter = (data: any) => {
    return (
      <div className="glass-panel bg-red-900/20 text-left rounded-xl overflow-hidden shadow-2xl border border-red-500/30 w-full animate-[fadeIn_0.5s_ease-out] mt-3">
        <div className="bg-red-900/30 px-6 py-4 border-b border-red-500/30 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-red-500/20 p-2 rounded-lg text-red-400">
              <span className="material-symbols-outlined">emergency</span>
            </div>
            <div>
              <h3 className="text-white font-bold text-lg">Peringatan Medis (Fallback V2)</h3>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="p-4 bg-red-950/50 rounded-lg border border-red-500/20">
            <p className="text-red-300 text-sm font-semibold">{data.alasan}</p>
          </div>
          <p className="text-slate-400 text-xs mt-4">
            *Hasil ini didasarkan pada kalkulasi threshold deterministik yang bernilai di bawah batas aman kepercayaan.
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background-light dark:bg-background-dark font-sans text-slate-900 dark:text-slate-100 selection:bg-primary selection:text-background-dark">
      <nav className="hidden md:flex w-[280px] flex-col border-r border-[#234829]/50 bg-background-dark h-full relative z-20">
        <div className="p-6 flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-full bg-primary/20 text-primary">
            <span className="material-symbols-outlined text-2xl">science</span>
          </div>
          <div>
            <h1 className="text-white text-lg font-bold tracking-tight">V2 Hybrid AI</h1>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#92c99b] shadow-[0_0_8px_rgba(146,201,155,0.6)]"></span>
              <span className="text-[#92c99b] text-xs font-medium">Deterministic Evaluator</span>
            </div>
          </div>
        </div>
        
        <div className="px-4 pb-4">
          <Link href="/" className="w-full flex items-center gap-3 px-4 py-3 rounded-full bg-primary text-background-dark hover:brightness-110 transition-all font-bold shadow-glow group">
            <span className="material-symbols-outlined">home</span>
            Back to Home
          </Link>
        </div>
        
        <div className="flex-1 overflow-y-auto px-2 space-y-1">
          <button onClick={clearChat} className="w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[#234829]/20 text-[#92c99b] transition-colors">
            <span className="material-symbols-outlined">refresh</span>
            <span className="text-sm">Reset Diagnosa</span>
          </button>
        </div>

        {/* Model Selector - Desktop */}
        <div className="px-4 pb-4 border-t border-[#234829]/50 pt-4">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 block px-1">Extractor Model</label>
          <div className="relative">
            <button
              onClick={() => setShowModelPicker(!showModelPicker)}
              disabled={isModelsLoading || aiModels.length === 0}
              className="w-full flex items-center justify-between gap-2 px-4 py-3 rounded-xl bg-[#234829]/30 border border-[#234829] hover:border-primary/40 transition-colors text-left disabled:opacity-50"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="material-symbols-outlined text-primary text-lg">smart_toy</span>
                <div className="min-w-0">
                  {isModelsLoading ? (
                    <p className="text-slate-500 text-sm italic">Loading models...</p>
                  ) : selectedModel ? (
                    <>
                      <p className="text-white text-sm font-medium truncate">{selectedModel.label}</p>
                      <p className="text-slate-500 text-[10px] truncate">{selectedModel.provider}</p>
                    </>
                  ) : (
                    <p className="text-red-400 text-sm">No models available</p>
                  )}
                </div>
              </div>
              <span className={`material-symbols-outlined text-slate-400 text-lg transition-transform ${showModelPicker ? 'rotate-180' : ''}`}>expand_more</span>
            </button>
            {showModelPicker && (
              <div className="absolute bottom-full left-0 w-full mb-2 bg-surface-dark border border-[#234829] rounded-xl shadow-2xl overflow-hidden z-50 animate-[fadeIn_0.15s_ease-out]">
                {aiModels.map((m, idx) => (
                  <button
                    key={m.id}
                    onClick={() => { setSelectedModelIdx(idx); setShowModelPicker(false); }}
                    className={`w-full flex items-center justify-between px-4 py-3 text-left hover:bg-[#234829]/40 transition-colors ${
                      idx === selectedModelIdx ? 'bg-[#234829]/60 border-l-2 border-l-primary' : 'border-l-2 border-l-transparent'
                    }`}
                  >
                    <div className="min-w-0">
                      <p className={`text-sm font-medium truncate ${idx === selectedModelIdx ? 'text-primary' : 'text-white'}`}>{m.label}</p>
                      <p className="text-slate-500 text-[10px]">{m.provider}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full relative bg-background-dark bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#1a2e1d] via-background-dark to-background-dark">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 border-b border-[#234829]/50 bg-background-dark/80 backdrop-blur-md sticky top-0 z-30">
          <div className="flex items-center gap-2 text-white">
            <span className="material-symbols-outlined text-primary">eco</span>
            <span className="font-bold">HerbalAI v2</span>
          </div>
          <div className="flex items-center gap-1">
            <Link href="/" className="text-white p-2">
              <span className="material-symbols-outlined">close</span>
            </Link>
          </div>
        </header>

        {/* Chat Stream */}
        <div className="flex-1 overflow-y-auto px-4 py-6 md:px-20 lg:px-40 pb-32 scroll-smooth" id="chat-container">
          <div className="max-w-4xl mx-auto flex flex-col gap-8">
            
            {messages.map((m, index) => (
              <div key={m.id} className={`flex gap-4 items-start ${m.role === 'user' ? 'justify-end animate-[slideUp_0.4s_ease-out]' : 'animate-[fadeIn_0.5s_ease-out]'}`}>
                {m.role !== 'user' && (
                  <div className="w-10 h-10 rounded-full bg-surface-dark border border-[#234829] flex items-center justify-center shrink-0 shadow-lg relative">
                    <span className="material-symbols-outlined text-primary">science</span>
                    <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-[#13ec37] rounded-full border-2 border-background-dark"></span>
                  </div>
                )}
                
                <div className={`flex flex-col gap-2 max-w-[85%] lg:max-w-[70%] ${m.role === 'user' ? 'items-end' : ''}`}>
                  {m.role !== 'user' && (
                    <div className="flex items-baseline gap-2">
                      <span className="text-primary text-sm font-bold">Hybrid AI Evaluator</span>
                    </div>
                  )}
                  
                  <div className={`p-5 rounded-2xl leading-relaxed shadow-sm w-full flex flex-col gap-3 ${
                    m.role === 'user' 
                      ? 'bg-[#234829] text-white rounded-tr-none shadow-md' 
                      : 'bg-surface-dark/80 border border-[#234829] rounded-tl-none text-slate-200'
                  }`}>
                    <p>{m.content}</p>
                  </div>
                  
                  {m.data?.type === 'DIAGNOSA_FINAL' && renderDiagnosisCard(m.data)}
                  {m.data?.type === 'RUJUK_DOKTER' && renderRujukDokter(m.data)}
                  
                  {m.role === 'assistant' && index === 0 && (
                    <div className="flex gap-2 flex-wrap mt-1">
                      <button onClick={(e) => handleSendMessage(e, "Sakit kepala, gatal-gatal di tangan, dan asam lambung")} className="px-4 py-2 rounded-full border border-[#234829] bg-transparent text-sm text-[#92c99b] hover:border-primary hover:text-primary transition-colors flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px]">vaccines</span>
                        Test Complex Gejala
                      </button>
                    </div>
                  )}
                </div>

                {m.role === 'user' && (
                  <div className="w-10 h-10 rounded-full bg-surface-dark shrink-0 border border-[#234829] flex items-center justify-center text-[#92c99b]">
                    <span className="material-symbols-outlined">person</span>
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-4 items-center animate-[fadeIn_0.5s_ease-out]">
                <div className="w-10 h-10 rounded-full bg-surface-dark border border-[#234829] flex items-center justify-center shrink-0 shadow-lg">
                  <span className="material-symbols-outlined text-primary">science</span>
                </div>
                <div className="flex gap-1 bg-surface-dark/80 border border-[#234829] p-4 rounded-2xl rounded-tl-none items-center h-12">
                   <span className="text-xs text-amber-500 italic mr-2">Mengekstrak dan menskor data medis...</span>
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Sticky Input Area */}
        <div className="absolute bottom-0 left-0 w-full px-4 pb-6 pt-10 fade-mask-bottom z-10 flex justify-center bg-gradient-to-t from-background-dark via-background-dark/90 to-transparent">
          <div className="w-full max-w-3xl relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-[#92c99b]/20 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
            <form onSubmit={handleSendMessage} className="relative glass-input bg-[#234829]/40 backdrop-blur-md border border-[#13ec37]/10 rounded-full p-2 pl-6 flex items-center gap-3 shadow-lg ring-1 ring-white/10 focus-within:ring-primary/50 transition-all">
              <input 
                name="prompt"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isLoading}
                className="w-full bg-transparent border-none focus:ring-0 text-white placeholder-slate-400 text-base py-3 outline-none" 
                placeholder={isLoading ? "Menghitung Bobot Grafik..." : "Ceritakan keluhan beserta kondisimu..."} 
                type="text"
                autoComplete="off"
              />
              <button disabled={isLoading || !input.trim()} type="submit" className="p-3 bg-primary text-background-dark rounded-full hover:brightness-110 disabled:opacity-50 transition-transform active:scale-95 flex items-center justify-center shadow-[0_0_15px_rgba(19,236,55,0.4)]">
                <span className="material-symbols-outlined">send</span>
              </button>
            </form>
            <p className="text-center text-[10px] text-slate-500 mt-3 font-medium">
              V2 AI Pipeline: Deterministic Graph Weighted Scoring Model.
            </p>
          </div>
        </div>
      </main>

      <style>{`
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #234829; border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: #2f5e36; }
        .fade-mask-bottom { mask-image: linear-gradient(to bottom, black 80%, transparent 100%); -webkit-mask-image: linear-gradient(to bottom, black 80%, transparent 100%); }
        .glass-panel { background: rgba(16, 34, 19, 0.6); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}
