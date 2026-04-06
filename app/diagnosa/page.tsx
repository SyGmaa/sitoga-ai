"use client";

import Link from "next/link";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, UIMessage } from "ai";
import { useEffect, useRef, useState } from "react";

interface AiModel {
  id: string;
  provider: string;
  modelId: string;
  label: string;
  badge: string;
  isDefault?: boolean;
}

export default function DiagnosaPage() {
  const [input, setInput] = useState("");
  const [currentKeluhan, setCurrentKeluhan] = useState("");
  const [aiModels, setAiModels] = useState<AiModel[]>([]);
  const [selectedModelIdx, setSelectedModelIdx] = useState(0);
  const [showModelPicker, setShowModelPicker] = useState(false);
  const [isModelsLoading, setIsModelsLoading] = useState(true);

  const selectedModel = aiModels[selectedModelIdx] || null;

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

  const transport = new DefaultChatTransport({
    api: "/api/chat",
  });

  const { messages, setMessages, sendMessage, status } = useChat({
    transport,
    messages: [{
      id: "system-1",
      role: "assistant",
      parts: [{ type: 'text', text: "Yooo... aku clonenya gama, siap membantu mendiagnosa penyakit kamu dengan gacorrr." }]
    }] as UIMessage[]
  });

  useEffect(() => {
    console.log("Current Chat Messages State:", messages);
  }, [messages]);

  const isLoading = status === "streaming" || status === "submitted";

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading, status]);

  const handleSendMessage = async (e?: React.FormEvent, overrideInput?: string) => {
    if (e) e.preventDefault();
    const finalInput = overrideInput || input;
    if (!finalInput.trim() || isLoading) return;

    setCurrentKeluhan(finalInput);
    setInput("");

    sendMessage({ text: finalInput }, {
      body: {
        provider: selectedModel?.provider,
        model: selectedModel?.modelId,
      }
    });
  };

  const renderDiagnosisCard = (toolCallId: string, data: any) => {
    const gejalaClean = data.gejala_terdeteksi || [];
    const rekomendasiClean = data.rekomendasi_tanaman || [];

    return (
      <div key={toolCallId} className="flex flex-col gap-4 w-full">
        <p className="text-slate-200">
          {data.penjelasan_singkat || "Berikut hasil analisis saya:"}
        </p>
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
                {rekomendasiClean.map((plant: any, idx: number) => (
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
                Belum ada rekomendasi tanaman obat spesifik di database kami.
              </p>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderRujukDokter = (toolCallId: string, data: any) => {
    return (
      <div key={toolCallId} className="glass-panel bg-red-900/20 text-left rounded-xl overflow-hidden shadow-2xl border border-red-500/30 w-full animate-[fadeIn_0.5s_ease-out]">
        <div className="bg-red-900/30 px-6 py-4 border-b border-red-500/30 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-red-500/20 p-2 rounded-lg text-red-400">
              <span className="material-symbols-outlined">warning</span>
            </div>
            <div>
              <h3 className="text-white font-bold text-lg">Peringatan Medis</h3>
            </div>
          </div>
        </div>
        <div className="p-6">
          <p className="text-slate-200 mb-2">
            Saya mendeteksi kondisi yang memerlukan perhatian medis profesional segera.
          </p>
          <div className="p-4 bg-red-950/50 rounded-lg border border-red-500/20">
            <p className="text-red-300 text-sm font-semibold">{data.alasan}</p>
          </div>
          <p className="text-slate-400 text-xs mt-4">
            *SITOBAT-AI bukan pengganti diagnosis medis resmi. Silakan hubungi klinik/RS terdekat.
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
          <button onClick={() => setMessages([{ id: "sys1", role: "assistant", parts: [{ type: 'text', text: "Yooo... aku clonenya gama, siap membantu mendiagnosa penyakit kamu dengan gacorrr." }] }])} className="w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[#234829]/20 text-[#92c99b] transition-colors">
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
            
            {messages.map((m, index) => (
              <div key={m.id} className={`flex gap-4 items-start ${m.role === 'user' ? 'justify-end animate-[slideUp_0.4s_ease-out]' : 'animate-[fadeIn_0.5s_ease-out]'}`}>
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
                  
                  {m.parts ? m.parts.map((part: any, partIndex: number) => {
                    if (part.type === 'text' && part.text) {
                      return (
                        <div key={partIndex} className={`p-5 rounded-2xl leading-relaxed shadow-sm flex flex-col gap-3 ${
                          m.role === 'user' 
                            ? 'bg-[#234829] text-white rounded-tr-none shadow-md' 
                            : 'bg-surface-dark/80 border border-[#234829] rounded-tl-none text-slate-200 w-full'
                        }`}>
                          <p>{part.text}</p>
                        </div>
                      );
                    }

                    if (part.type === 'tool-invocation' || part.type.startsWith('tool-') || part.type === 'dynamic-tool') {
                      const toolName = part.type === 'dynamic-tool' ? part.toolName : (part.toolInvocation?.toolName || part.toolName || part.type.replace('tool-', ''));
                      const state = part.toolInvocation?.state || part.state;
                      
                      if (state === 'call' || state === 'input-streaming' || state === 'input-available') {
                         if (toolName === "cariDataPenyakit") {
                           return <p key={partIndex} className="text-xs text-amber-500 italic px-5 py-2">Sedang mencari data herbal di buku resep...</p>;
                         }
                         return <p key={partIndex} className="text-xs text-amber-500 italic px-5 py-2">Sedang menganalisis: {toolName}...</p>;
                      }

                      if (state === 'result' || state === 'output-available' || part.type === 'tool-result') {
                        if (toolName === "sajikanDiagnosaFinal") {
                          const output = part.toolInvocation?.result || part.output || part.args || (part as any).result;
                          return renderDiagnosisCard(part.toolInvocation?.toolCallId || part.toolCallId || String(partIndex), output);
                        }
                        if (toolName === "rujukKeDokter") {
                          const output = part.toolInvocation?.result || part.output || part.args || (part as any).result;
                          return renderRujukDokter(part.toolInvocation?.toolCallId || part.toolCallId || String(partIndex), output);
                        }
                      }
                    }

                    return null;
                  }) : (
                    ((m as any).content || (m as any).text) ? (
                        <div key="text-fallback" className={`p-5 rounded-2xl leading-relaxed shadow-sm flex flex-col gap-3 ${
                          m.role === 'user' 
                            ? 'bg-[#234829] text-white rounded-tr-none shadow-md' 
                            : 'bg-surface-dark/80 border border-[#234829] rounded-tl-none text-slate-200 w-full'
                        }`}>
                          <p>{((m as any).content || (m as any).text)}</p>
                        </div>
                    ) : null
                  )}
                  
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

            {isLoading && messages.length > 0 && messages[messages.length-1].role === 'user' && (
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
                name="prompt"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isLoading}
                className="w-full bg-transparent border-none focus:ring-0 text-white placeholder-slate-400 text-base py-3 outline-none" 
                placeholder={isLoading ? "AI sedang meracik jawaban..." : "Ceritakan keluhanmu di sini..."} 
                type="text"
                autoComplete="off"
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
