"use client";

import Link from "next/link";
import { experimental_useObject as useObject } from "@ai-sdk/react";
import { useEffect, useRef, useState } from "react";
import { z } from "zod";
import { saveRiwayatDiagnosa } from "@/actions/riwayat";

interface AiModel {
  id: string;
  provider: string;
  modelId: string;
  label: string;
  badge: string;
}

// Define the expected schema structure for our Diagnosis Object
const diagnosisSchema = z.object({
  nama_penyakit: z.string().optional(),
  gejala_terdeteksi: z.array(z.string()).optional(),
  rekomendasi_tanaman: z.array(z.object({
    id: z.string(),
    nama: z.string()
  })).optional(),
  penjelasan_singkat: z.string().optional(),
});
type DiagnosisResult = z.infer<typeof diagnosisSchema>;

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  isStructured?: boolean;
  structuredData?: DiagnosisResult;
}

export default function DiagnosaPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "system-1",
      role: "assistant",
      content: "Yooo... aku clonenya gama, siap membantu mendiagnosa penyakit kamu dengan gacorrr."
    }
  ]);
  const [input, setInput] = useState("");
  // Track the current user keluhan to save it later
  const [currentKeluhan, setCurrentKeluhan] = useState("");
  // Model selection (Dynamic from DB)
  const [aiModels, setAiModels] = useState<AiModel[]>([]);
  const [selectedModelIdx, setSelectedModelIdx] = useState(0);
  const [showModelPicker, setShowModelPicker] = useState(false);
  const [isModelsLoading, setIsModelsLoading] = useState(true);

  const selectedModel = aiModels[selectedModelIdx];

  // Fetch models from database
  useEffect(() => {
    async function fetchModels() {
      try {
        const res = await fetch("/api/models");
        const data = await res.json();
        if (Array.isArray(data)) {
          setAiModels(data);
          // Auto-select default model if exists
          const defaultIdx = data.findIndex(m => m.isDefault);
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

  // useObject hook specifically designed for streaming structured JSON objects matching Zod schema
  const { object, submit, isLoading } = useObject({
    api: "/api/diagnosa-0.5",
    schema: diagnosisSchema,
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading, object]);

  const handleSendMessage = async (e: React.FormEvent, overrideInput?: string) => {
    e.preventDefault();
    const finalInput = overrideInput || input;
    if (!finalInput.trim() || isLoading) return;

    setCurrentKeluhan(finalInput);

    const newMessages: ChatMessage[] = [
      ...messages,
      { id: Date.now().toString(), role: "user", content: finalInput }
    ];
    setMessages(newMessages);
    setInput("");

    // Submit entire chat history to the API so LLM has context, with selected model
    submit({
      messages: newMessages,
      provider: selectedModel?.provider,
      model: selectedModel?.modelId,
    });
  };

  // When object generation completes, we ideally want to append it to messages history
  // Since useObject streams to the `object` variable, we render the partial `object` at the bottom if `isLoading` is true.
  // We need to implement a mechanism to lock the `object` into `messages` when `isLoading` becomes false.
  useEffect(() => {
    if (!isLoading && object && object.nama_penyakit) {
      // Cast the partial object securely
      const finalData: DiagnosisResult = {
        nama_penyakit: object.nama_penyakit,
        penjelasan_singkat: object.penjelasan_singkat,
        gejala_terdeteksi: object.gejala_terdeteksi?.filter((g): g is string => g !== undefined),
        rekomendasi_tanaman: object.rekomendasi_tanaman?.filter((r): r is { id: string; nama: string } => r !== undefined && r.id !== undefined && r.nama !== undefined),
      };

      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "assistant",
          content: finalData.penjelasan_singkat || "Diagnosis selesai.",
          isStructured: true,
          structuredData: finalData
        }
      ]);

      // Silently log to DB
      if (currentKeluhan) {
        saveRiwayatDiagnosa(currentKeluhan, finalData).catch(err => {
          console.error("Failed silently logging to db:", err);
        });
      }
    }
  }, [isLoading, object]);

  // Use Partial type for streaming but render aggressively
  const renderDiagnosisCard = (data?: Partial<DiagnosisResult>, isStreaming?: boolean) => {
    if (!data) return null;
    
    // Clean up potentially undefined elements from arrays during stream
    const gejalaClean = data.gejala_terdeteksi?.filter((g): g is string => g !== undefined) || [];
    const rekomendasiClean = data.rekomendasi_tanaman?.filter((r): r is { id: string; nama: string } => r !== undefined && r.id !== undefined && r.nama !== undefined) || [];

    return (
      <div className="flex flex-col gap-4 w-full">
        <p className="text-slate-200">
          {data.penjelasan_singkat || (isStreaming ? "Menganalisis gejala..." : "Berikut hasil analisis saya:")}
          {isStreaming && <span className="ml-2 inline-block w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></span>}
        </p>
        
        {data.nama_penyakit && (
          <div className="glass-panel text-left rounded-xl overflow-hidden shadow-2xl border border-primary/20 w-full animate-[fadeIn_0.5s_ease-out]">
            <div className="bg-[#234829]/30 px-6 py-4 border-b border-[#234829] flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="bg-primary/20 p-2 rounded-lg text-primary">
                  <span className="material-symbols-outlined">medical_services</span>
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">Potential Condition</h3>
                </div>
              </div>
            </div>
            <div className="p-6">
              <h4 className="text-xl text-white font-semibold mb-2">{data.nama_penyakit}</h4>
              
              {gejalaClean.length > 0 && (
                <p className="text-slate-300 text-sm mb-4">
                  Gejala terdeteksi: <span className="text-[#92c99b]">{gejalaClean.join(", ")}</span>
                </p>
              )}
              
              {rekomendasiClean.length > 0 ? (
                <div className="space-y-4">
                  <h5 className="text-[#92c99b] text-xs font-bold uppercase tracking-wider mb-2">Rekomendasi Tanaman</h5>
                  {rekomendasiClean.map((plant, idx: number) => (
                    <div key={idx} className="group flex items-center gap-4 p-3 rounded-xl bg-[#234829]/20 border border-transparent hover:border-primary/40 hover:bg-[#234829]/40 transition-all cursor-pointer">
                      <div className="flex-1">
                        <h6 className="text-white font-bold">{plant.nama}</h6>
                        <p className="text-slate-400 text-xs italic">View full details to see instructions.</p>
                      </div>
                      <Link href={`/tanaman/${plant.id}`} className="material-symbols-outlined text-slate-500 group-hover:text-primary transition-colors">chevron_right</Link>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400 text-sm italic">
                  {isStreaming ? "Mencari data tanaman..." : "Belum ada rekomendasi tanaman obat yang spesifik untuk kondisi ini di database kami."}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background-light dark:bg-background-dark font-sans text-slate-900 dark:text-slate-100 selection:bg-primary selection:text-background-dark">
      {/* Sidebar Navigation */}
      <nav className="hidden md:flex w-[280px] flex-col border-r border-[#234829]/50 bg-background-dark h-full relative z-20">
        <div className="p-6 flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-full bg-primary/20 text-primary">
            <span className="material-symbols-outlined text-2xl">eco</span>
          </div>
          <div>
            <h1 className="text-white text-lg font-bold tracking-tight">HerbalAI</h1>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(19,236,55,0.6)]"></span>
              <span className="text-[#92c99b] text-xs font-medium">Online</span>
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
          <button onClick={() => setMessages([{ id: "sys1", role: "assistant", content: "Hello! I am your botanical health assistant. Describe your symptoms or ask about specific plants in our Campus Garden." }])} className="w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[#234829]/20 text-[#92c99b] transition-colors">
            <span className="material-symbols-outlined">add</span>
            <span className="text-sm">Start New Diagnosis</span>
          </button>
        </div>

        {/* Model Selector - Desktop */}
        <div className="px-4 pb-4 border-t border-[#234829]/50 pt-4">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 block px-1">AI Model</label>
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
                    {m.badge && (
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        m.badge === 'Recommended' ? 'bg-primary/20 text-primary' :
                        m.badge === 'New' ? 'bg-amber-500/20 text-amber-400' :
                        m.badge === 'Fast' ? 'bg-sky-500/20 text-sky-400' :
                        m.badge === 'Free' ? 'bg-slate-600/30 text-slate-400' :
                        'bg-[#234829]/30 text-slate-400'
                      }`}>{m.badge}</span>
                    )}
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
            <span className="font-bold">HerbalAI</span>
          </div>
          <div className="flex items-center gap-1">
            {/* Mobile Model Selector */}
            <button
              onClick={() => setShowModelPicker(!showModelPicker)}
              disabled={isModelsLoading || aiModels.length === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#234829]/50 border border-[#234829] text-xs text-slate-300 hover:border-primary/40 transition-colors disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-primary text-sm">smart_toy</span>
              <span className="max-w-[100px] truncate">
                {isModelsLoading ? "Loading..." : selectedModel ? selectedModel.label : "Error"}
              </span>
              <span className={`material-symbols-outlined text-sm transition-transform ${showModelPicker ? 'rotate-180' : ''}`}>expand_more</span>
            </button>
            <Link href="/" className="text-white p-2">
              <span className="material-symbols-outlined">close</span>
          </Link>
          </div>
        </header>
        {showModelPicker && (
          <div className="md:hidden border-b border-[#234829]/50 bg-surface-dark/95 backdrop-blur-md z-20 animate-[fadeIn_0.15s_ease-out]">
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
                {m.badge && (
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                    m.badge === 'Recommended' ? 'bg-primary/20 text-primary' :
                    m.badge === 'New' ? 'bg-amber-500/20 text-amber-400' :
                    m.badge === 'Fast' ? 'bg-sky-500/20 text-sky-400' :
                    m.badge === 'Free' ? 'bg-slate-600/30 text-slate-400' :
                    'bg-[#234829]/30 text-slate-400'
                  }`}>{m.badge}</span>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Chat Stream */}
        <div className="flex-1 overflow-y-auto px-4 py-6 md:px-20 lg:px-40 pb-32 scroll-smooth" id="chat-container">
          <div className="max-w-4xl mx-auto flex flex-col gap-8">
            
            {/* Render confirmed messages */}
            {messages.map((m, index) => (
              <div key={m.id || index} className={`flex gap-4 items-start ${m.role === 'user' ? 'justify-end animate-[slideUp_0.4s_ease-out]' : 'animate-[fadeIn_0.5s_ease-out]'}`}>
                {m.role !== 'user' && (
                  <div className="w-10 h-10 rounded-full bg-surface-dark border border-[#234829] flex items-center justify-center shrink-0 shadow-lg relative">
                    <span className="material-symbols-outlined text-primary">smart_toy</span>
                    <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-primary rounded-full border-2 border-background-dark"></span>
                  </div>
                )}
                
                <div className={`flex flex-col gap-2 max-w-[85%] lg:max-w-[70%] ${m.role === 'user' ? 'items-end' : ''}`}>
                  {m.role !== 'user' && (
                    <div className="flex items-baseline gap-2">
                      <span className="text-primary text-sm font-bold">HerbalAI Assistant</span>
                    </div>
                  )}
                  
                  <div className={`p-5 rounded-2xl leading-relaxed shadow-sm flex flex-col gap-3 ${
                    m.role === 'user' 
                      ? 'bg-[#234829] text-white rounded-tr-none shadow-md' 
                      : 'bg-surface-dark/80 border border-[#234829] rounded-tl-none text-slate-200 w-full'
                  }`}>
                    {m.isStructured && m.structuredData ? renderDiagnosisCard(m.structuredData, false) : <p>{m.content}</p>}
                  </div>
                  
                  {m.role === 'assistant' && index === 0 && (
                    <div className="flex gap-2 flex-wrap mt-1">
                      <button onClick={(e) => handleSendMessage(e, "Sakit kepala dan kurang tidur")} className="px-4 py-2 rounded-full border border-[#234829] bg-transparent text-sm text-[#92c99b] hover:border-primary hover:text-primary transition-colors flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px]">sick</span>
                        Sakit kepala
                      </button>
                      <button onClick={(e) => handleSendMessage(e, "Saya merasa mual dan perut perih sejak pagi")} className="px-4 py-2 rounded-full border border-[#234829] bg-transparent text-sm text-[#92c99b] hover:border-primary hover:text-primary transition-colors flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px]">gastroenterology</span>
                        Sakit Perut
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

            {/* Render currently streaming object */}
            {isLoading && object && (
              <div className="flex gap-4 items-start animate-[fadeIn_0.5s_ease-out]">
                <div className="w-10 h-10 rounded-full bg-surface-dark border border-[#234829] flex items-center justify-center shrink-0 shadow-lg relative">
                  <span className="material-symbols-outlined text-primary">smart_toy</span>
                  <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-primary rounded-full border-2 border-background-dark"></span>
                </div>
                <div className="flex flex-col gap-2 max-w-[85%] lg:max-w-[70%]">
                  <div className="flex items-baseline gap-2">
                    <span className="text-primary text-sm font-bold">HerbalAI Assistant</span>
                  </div>
                  <div className="p-5 rounded-2xl leading-relaxed shadow-sm flex flex-col gap-3 bg-surface-dark/80 border border-[#234829] rounded-tl-none text-slate-200">
                    {renderDiagnosisCard(object as Partial<DiagnosisResult>, true)}
                  </div>
                </div>
              </div>
            )}
            
            {/* Raw loading state before object starts streaming */}
            {isLoading && !object && (
              <div className="flex gap-4 items-center animate-[fadeIn_0.5s_ease-out]">
                <div className="w-10 h-10 rounded-full bg-surface-dark border border-[#234829] flex items-center justify-center shrink-0 shadow-lg">
                  <span className="material-symbols-outlined text-primary">smart_toy</span>
                </div>
                <div className="flex gap-1 bg-surface-dark/80 border border-[#234829] p-4 rounded-2xl rounded-tl-none items-center h-12">
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
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isLoading}
                className="w-full bg-transparent border-none focus:ring-0 text-white placeholder-slate-400 text-base py-3 outline-none" 
                placeholder={isLoading ? "AI sedang meracik jawaban..." : "Ceritakan keluhanmu di sini..."} 
                type="text"
              />
              <button disabled={isLoading || !input.trim()} type="submit" className="p-3 bg-primary text-background-dark rounded-full hover:brightness-110 disabled:opacity-50 transition-transform active:scale-95 flex items-center justify-center shadow-[0_0_15px_rgba(19,236,55,0.4)]">
                <span className="material-symbols-outlined">send</span>
              </button>
            </form>
            <p className="text-center text-[10px] text-slate-500 mt-3 font-medium">
              AI dapat membuat kesalahan. Sistem ini bukan merupakan substitusi diagnosa dokter profesional.
            </p>
          </div>
        </div>
      </main>

      <style>{`
        ::-webkit-scrollbar {
            width: 6px;
        }
        ::-webkit-scrollbar-track {
            background: transparent;
        }
        ::-webkit-scrollbar-thumb {
            background: #234829;
            border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb:hover {
            background: #2f5e36;
        }
        .fade-mask-bottom {
            mask-image: linear-gradient(to bottom, black 80%, transparent 100%);
            -webkit-mask-image: linear-gradient(to bottom, black 80%, transparent 100%);
        }
        .glass-panel {
            background: rgba(16, 34, 19, 0.6);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
        }
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        @keyframes slideUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
