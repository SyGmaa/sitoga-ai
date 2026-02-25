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

export default function DiagnosaV3Page() {
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
    api: "/api/diagnosa-v3", // Poin ke route V3 yang baru
    body: {
      provider: selectedModel?.provider,
      model: selectedModel?.modelId,
    }
  });

  const { messages, setMessages, sendMessage, status, addToolResult } = useChat({
    transport,
    maxSteps: 7, // Coba paksa client-side orchestration ulang
    messages: [{
      id: "system-v3",
      role: "assistant",
      parts: [{ type: 'text', text: "Halo! Saya adalah Agent Relational GraphRAG (V-3) Sitoga AI. Ceritakan keluhan medis Anda, dan saya akan menelusuri hubungan Gejala dan Penyakit langsung dari database." }]
    }] as UIMessage[]
  });

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
    sendMessage({ text: finalInput });
  };

  const getToolDisplayName = (toolName: string) => {
    switch (toolName) {
      case "EkstrakDanCariGejala": return "Agen sedang mencari keyword gejala di database...";
      case "TelusuriGrafPenyakit": return "Agen menelusuri relasi kandidat Penyakit...";
      case "ValidasiGejalaWajib": return "Agen memvalidasi aturan Gejala Wajib penyakit...";
      case "FilterKontraindikasiMurni": return "Agen memvalidasi pantangan Tanaman (Kontraindikasi)...";
      default: return `Mengeksekusi alat internal: ${toolName}...`;
    }
  };

  const getToolIcon = (toolName: string) => {
    switch (toolName) {
      case "EkstrakDanCariGejala": return "search";
      case "TelusuriGrafPenyakit": return "hub";
      case "ValidasiGejalaWajib": return "verified_user";
      case "FilterKontraindikasiMurni": return "health_and_safety";
      default: return "settings";
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background-light dark:bg-background-dark font-sans text-slate-900 dark:text-slate-100 selection:bg-primary selection:text-background-dark">
      {/* Sidebar Navigation */}
      <nav className="hidden md:flex w-[280px] flex-col border-r border-[#234829]/50 bg-background-dark h-full relative z-20">
        <div className="p-6 flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-full bg-primary/20 text-primary">
            <span className="material-symbols-outlined text-2xl">device_hub</span>
          </div>
          <div>
            <h1 className="text-white text-lg font-bold tracking-tight">GraphRAG V3</h1>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(19,236,55,0.6)]"></span>
              <span className="text-[#92c99b] text-xs font-medium">ReAct Agent</span>
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
          <button onClick={() => setMessages([{ id: "sys-v3", role: "assistant", parts: [{ type: 'text', text: "Halo! Saya Agent V-3. Ceritakan keluhan medis Anda." }] }])} className="w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[#234829]/20 text-[#92c99b] transition-colors">
            <span className="material-symbols-outlined">refresh</span>
            <span className="text-sm">Reset Diagnosis</span>
          </button>
        </div>

        {/* Model Selector - Desktop */}
        <div className="px-4 pb-4 border-t border-[#234829]/50 pt-4">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 block px-1">AI Model (Disarankan: Flash 2.5)</label>
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
            <span className="material-symbols-outlined text-primary">device_hub</span>
            <span className="font-bold">GraphRAG V3</span>
          </div>
          <Link href="/" className="text-white p-2">
            <span className="material-symbols-outlined">close</span>
          </Link>
        </header>

        {/* Chat Stream */}
        <div className="flex-1 overflow-y-auto px-4 py-6 md:px-20 lg:px-40 pb-32 scroll-smooth" id="chat-container">
          <div className="max-w-4xl mx-auto flex flex-col gap-8">
            
            {messages.map((m, index) => (
              <div key={m.id} className={`flex gap-4 items-start ${m.role === 'user' ? 'justify-end animate-[slideUp_0.4s_ease-out]' : 'animate-[fadeIn_0.5s_ease-out]'}`}>
                {m.role !== 'user' && (
                  <div className="w-10 h-10 rounded-full bg-surface-dark border border-[#234829] flex items-center justify-center shrink-0 shadow-lg relative">
                    <span className="material-symbols-outlined text-primary">device_hub</span>
                  </div>
                )}
                
                <div className={`flex flex-col gap-2 max-w-[85%] lg:max-w-[70%] ${m.role === 'user' ? 'items-end' : ''}`}>
                  {m.role !== 'user' && (
                    <div className="flex items-baseline gap-2">
                      <span className="text-primary text-sm font-bold">V-3 Graph Agent</span>
                    </div>
                  )}
                  
                  {m.parts ? m.parts.map((part: any, partIndex: number) => {
                    // Cek agresif jika teks murni hanyalah JSON objek tunggal sisa dari pemanggilan tool
                    const isRawJson = (text: string) => {
                      if (typeof text !== 'string') return false;
                      const trimmed = text.trim();
                      if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
                          // Karena LLM di V3 selalu merespon pakai bahasa Indonesia murni, apapun yang diawali kurawal/siku pasti bocoran tool/JSON.
                          return true;
                      }
                      return false;
                    };

                    // Tampilkan balasan teks biasa dari AI
                    if (part.type === 'text' && part.text && !isRawJson(part.text)) {
                      return (
                        <div key={partIndex} className={`p-5 rounded-2xl leading-relaxed shadow-sm flex flex-col gap-3 ${
                          m.role === 'user' 
                            ? 'bg-[#234829] text-white rounded-tr-none shadow-md' 
                            : 'bg-surface-dark/80 border border-[#234829] rounded-tl-none text-slate-200 w-full'
                        }`}>
                          <div dangerouslySetInnerHTML={{ __html: part.text.replace(/\n/g, '<br />') }} />
                        </div>
                      );
                    }

                    // Menampilkan Chain of Thought dari tool calls (Sangat penting di V-3)
                    if (part.type === 'tool-invocation' || part.type.startsWith('tool-') || part.type === 'dynamic-tool') {
                      const toolName = part.type === 'dynamic-tool' ? part.toolName : (part.toolInvocation?.toolName || part.toolName || part.type.replace('tool-', ''));
                      const state = part.toolInvocation?.state || part.state;
                      
                      const isResult = state === 'result' || state === 'output-available' || part.type === 'tool-result';

                      return (
                        <div key={partIndex} className="bg-background-dark/50 border border-slate-700/50 rounded-xl px-4 py-3 mt-1 w-full text-xs">
                           <div className="flex items-center gap-2">
                              <span className={`material-symbols-outlined text-[16px] ${isResult ? 'text-primary/70' : 'text-amber-500 animate-pulse'}`}>
                                {getToolIcon(toolName)}
                              </span>
                              <span className={isResult ? 'text-slate-400' : 'text-amber-500 italic'}>
                                {getToolDisplayName(toolName)}
                              </span>
                           </div>
                           
                           {/* Menampilkan raw JSON response secara transparan jika audiensnya analis sistem/doctor */}
                           {isResult && (
                             <details className="mt-2 text-[10px] text-slate-500 border-t border-slate-800 pt-2">
                               <summary className="cursor-pointer hover:text-slate-300 transition-colors">Lihat payload database raw</summary>
                               <pre className="mt-2 text-[9px] overflow-x-auto whitespace-pre-wrap">
                                  {JSON.stringify(part.toolInvocation?.result || part.output || part.args || (part as any).result, null, 2)}
                               </pre>
                             </details>
                           )}
                        </div>
                      )
                    }

                    return null;
                  }) : (
                    ((m as any).content || (m as any).text) ? (
                      (() => {
                        const fallbackText = (m as any).content || (m as any).text;
                        const isRawJsonFallback = (text: string) => {
                          if (typeof text !== 'string') return false;
                          const trimmed = text.trim();
                          return trimmed.startsWith('{') || trimmed.startsWith('[');
                        }
                        
                        if (isRawJsonFallback(fallbackText)) return null;

                        return (
                          <div key="text-fallback" className={`p-5 rounded-2xl leading-relaxed shadow-sm flex flex-col gap-3 ${
                            m.role === 'user' 
                              ? 'bg-[#234829] text-white rounded-tr-none shadow-md' 
                              : 'bg-surface-dark/80 border border-[#234829] rounded-tl-none text-slate-200 w-full'
                          }`}>
                            <p>{fallbackText}</p>
                          </div>
                        );
                      })()
                    ) : null
                  )}
                  
                  {m.role === 'assistant' && index === 0 && (
                    <div className="flex gap-2 flex-wrap mt-1">
                      <button onClick={(e) => handleSendMessage(e, "Kepala pusing dan mual sekali mau muntah")} className="px-4 py-2 rounded-full border border-[#234829] bg-transparent text-sm text-[#92c99b] hover:border-primary hover:text-primary transition-colors flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px]">sick</span>
                        Test Gejala Ringan
                      </button>
                      <button onClick={(e) => handleSendMessage(e, "Saya mual dan perut perih, kondisi saya sedang Hamil")} className="px-4 py-2 rounded-full border border-[#234829] bg-transparent text-sm text-[#92c99b] hover:border-primary hover:text-primary transition-colors flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px]">pregnant_woman</span>
                        Test Filter Kontraindikasi
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
                  <span className="material-symbols-outlined text-primary">device_hub</span>
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
                placeholder={isLoading ? "Agent sedang menganalisis Graph Database..." : "Ketikan keluhan atau kondisi medis Anda di sini (misal: 'mual', 'hamil')..."} 
                type="text"
                autoComplete="off"
              />
              <button disabled={isLoading || !input.trim()} type="submit" className="p-3 bg-primary text-background-dark rounded-full hover:brightness-110 disabled:opacity-50 transition-transform active:scale-95 flex items-center justify-center shadow-[0_0_15px_rgba(19,236,55,0.4)]">
                <span className="material-symbols-outlined">send</span>
              </button>
            </form>
            <p className="text-center text-[10px] text-slate-500 mt-3 font-medium">
              Mode V-3: Transparansi Database Penuh. AI tidak berhalusinasi, hanya menyajikan apa yang ditemukan dari Skema Prisma.
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
