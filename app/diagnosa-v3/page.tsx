"use client";

import Link from "next/link";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, UIMessage } from "ai";
import { useEffect, useRef, useState } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";

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

  // Custom visual States for the Gemini UI Overhaul
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [temperature, setTemperature] = useState(0.7);
  const [maxSteps, setMaxSteps] = useState(7);
  const [isListening, setIsListening] = useState(false);

  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRefA = useRef<HTMLTextAreaElement>(null);
  const textareaRefB = useRef<HTMLTextAreaElement>(null);

  const selectedModel = aiModels[selectedModelIdx] || null;

  // Auto-resize textarea height helper
  const handleInputResize = (textarea: HTMLTextAreaElement | null) => {
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 180)}px`;
  };

  // Adjust height of textareas automatically when input state changes
  useEffect(() => {
    handleInputResize(textareaRefA.current);
    handleInputResize(textareaRefB.current);
  }, [input]);

  // Fetch AI Models
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

  // Web Speech API for voice dictation
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const rec = new SpeechRecognition();
        rec.continuous = false;
        rec.interimResults = false;
        rec.lang = "id-ID";

        rec.onstart = () => {
          setIsListening(true);
        };

        rec.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInput(transcript);
        };

        rec.onerror = (event: any) => {
          console.error("Speech recognition error:", event.error);
          setIsListening(false);
        };

        rec.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = rec;
      }
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Speech Recognition tidak didukung di browser ini. Silakan gunakan Google Chrome atau Microsoft Edge.");
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };
  // Close model picker on outside click
  useEffect(() => {
    const handleClickOutside = () => {
      if (showModelPicker) setShowModelPicker(false);
    };
    if (showModelPicker) {
      // Delay to avoid closing immediately on the same click that opened it
      const timer = setTimeout(() => {
        document.addEventListener("click", handleClickOutside);
      }, 10);
      return () => {
        clearTimeout(timer);
        document.removeEventListener("click", handleClickOutside);
      };
    }
  }, [showModelPicker]);

  const transport = new DefaultChatTransport({
    api: "/api/diagnosa-v3",
  });

  const { messages, setMessages, sendMessage, status, addToolResult } = useChat({
    transport,
    messages: [{
      id: "system-v3",
      role: "assistant",
      parts: [{ type: 'text', text: "Ceritakan keluhan medis Anda, saya akan menelusuri hubungan Gejala dan Penyakit langsung dari database tanaman herbal kebun raya Universitas Pahlawan." }]
    }] as UIMessage[]
  });

  const isLoading = status === "streaming" || status === "submitted";
  const hasUserMessages = messages.some(m => m.role === "user");

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  // Helper: Extract tanaman, gejala, and penyakit data from tool results in a message
  const extractGraphDataFromMessage = (msg: UIMessage) => {
    const tanaman: { id: string; nama: string; khasiatUtama?: string }[] = [];
    const gejalaIds: string[] = [];
    const penyakitIds: string[] = [];
    const tanamanIds: string[] = [];
    const prohibitedTanamanIds: string[] = [];

    if (!msg.parts) return { tanaman, gejalaIds, penyakitIds, tanamanIds };

    for (const part of msg.parts as any[]) {
      const isToolPart = part.type === 'tool-invocation' ||
        part.type?.startsWith('tool-') ||
        part.type === 'dynamic-tool';
      if (!isToolPart) continue;

      const toolName = part.type === 'dynamic-tool'
        ? part.toolName
        : (part.toolInvocation?.toolName || part.toolName || part.type?.replace('tool-', '') || '');

      const state = part.toolInvocation?.state || part.state;
      const isResult = state === 'result' ||
        state === 'output-available' ||
        part.type === 'tool-result';
      if (!isResult) continue;

      let result = part.toolInvocation?.result || part.output || (part as any).result || part.args;
      if (!result) continue;

      if (typeof result === 'string') {
        try { result = JSON.parse(result); } catch { continue; }
      }

      if (toolName === 'EkstrakDanCariGejala' && result.gejala) {
        for (const g of result.gejala) {
          if (g.id && !gejalaIds.includes(g.id)) gejalaIds.push(g.id);
        }
      }

      if (toolName === 'TelusuriGrafPenyakit' && result.kandidat) {
        for (const k of result.kandidat) {
          if (k.id && !penyakitIds.includes(k.id)) penyakitIds.push(k.id);
          if (k.tanamanObat) {
            for (const t of k.tanamanObat) {
              if (t.id && !tanamanIds.includes(t.id)) {
                tanamanIds.push(t.id);
                tanaman.push({ id: t.id, nama: t.nama, khasiatUtama: t.khasiatUtama });
              }
            }
          }
        }
      }

      if (toolName === 'FilterKontraindikasiMurni' && result.tanamanTerlarangIds) {
        for (const id of result.tanamanTerlarangIds) {
          if (!prohibitedTanamanIds.includes(id)) {
            prohibitedTanamanIds.push(id);
          }
        }
      }
    }

    const filteredTanaman = tanaman.filter(t => !prohibitedTanamanIds.includes(t.id));
    const filteredTanamanIds = tanamanIds.filter(id => !prohibitedTanamanIds.includes(id));

    return {
      tanaman: filteredTanaman,
      gejalaIds,
      penyakitIds,
      tanamanIds: filteredTanamanIds
    };
  };

  const buildGraphUrl = (gejalaIds: string[], penyakitIds: string[], tanamanIds: string[]) => {
    const params = new URLSearchParams();
    if (gejalaIds.length) params.set('gejala', gejalaIds.join(','));
    if (penyakitIds.length) params.set('penyakit', penyakitIds.join(','));
    if (tanamanIds.length) params.set('tanaman', tanamanIds.join(','));
    return `/graphrag-visualization.html?${params.toString()}`;
  };

  const getToolDisplayName = (toolName: string) => {
    switch (toolName) {
      case "EkstrakDanCariGejala": return "Mencari keyword gejala di database...";
      case "TelusuriGrafPenyakit": return "Menelusuri relasi kandidat Penyakit...";
      case "ValidasiGejalaWajib": return "Memvalidasi aturan Gejala Wajib penyakit...";
      case "FilterKontraindikasiMurni": return "Memvalidasi pantangan Tanaman (Kontraindikasi)...";
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

  const suggestions = [
    {
      text: "Kepala pusing dan mual sekali mau muntah",
      subtext: "Menguji diagnosa penyakit ringan di database",
      icon: "sick",
    },
    {
      text: "Saya mual dan perut perih, kondisi saya sedang Hamil",
      subtext: "Menguji filter pantangan kontraindikasi obat herbal",
      icon: "pregnant_woman",
    },
    {
      text: "Dada sesak, batuk berdahak, dan badan demam",
      subtext: "Mendiagnosa keluhan pernapasan dan resep",
      icon: "medical_services",
    },
    {
      text: "Nyeri sendi di lutut dan asam urat tinggi",
      subtext: "Mencari tanaman pereda radang sendi",
      icon: "healing",
    }
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-background-light dark:bg-background-dark text-[#1f1f1f] dark:text-[#e3e3e3] font-sans transition-colors duration-300">

      {/* 1. Left Collapsible Sidebar */}
      {/* Mobile backdrop */}
      {sidebarExpanded && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40 animate-[fadeIn_0.2s_ease-out]"
          onClick={() => setSidebarExpanded(false)}
        />
      )}
      <aside
        className={`h-full bg-[#f0f4f9] dark:bg-[#1e1f20] border-r border-[#e3e3e3] dark:border-[#2d2e30] flex flex-col justify-between transition-all duration-300 ease-in-out shrink-0
          ${/* Mobile: fixed overlay, hidden by default */''}
          fixed md:relative z-50 md:z-30
          ${sidebarExpanded ? 'w-[280px] translate-x-0' : 'w-[68px] -translate-x-full md:translate-x-0'}
        `}
      >
        {/* Top Section */}
        <div className="flex flex-col gap-4 pt-4 px-3.5">
          {/* Menu Hamburger Toggle & Brand Header */}
          <div className="flex items-center h-10 px-1 relative">
            <button
              onClick={() => setSidebarExpanded(!sidebarExpanded)}
              className="w-10 h-10 rounded-full hover:bg-[#e1e5ea] dark:hover:bg-[#2b2c2d] flex items-center justify-center text-[#444746] dark:text-[#c4c7c5] transition-colors cursor-pointer shrink-0"
              title="Menu Utama"
            >
              <span className="material-symbols-outlined text-2xl">menu</span>
            </button>

            {sidebarExpanded && (
              <div className="flex items-center gap-2 ml-4 animate-[fadeIn_0.2s_ease-out] whitespace-nowrap">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L14.8 9.2L22 12L14.8 14.8L12 22L9.2 14.8L2 12L9.2 9.2L12 2Z" fill="url(#geminiLogoGrad)" />
                  <defs>
                    <linearGradient id="geminiLogoGrad" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor="#13ec37" />
                      <stop offset="35%" stopColor="#0dbd2a" />
                      <stop offset="70%" stopColor="#92c99b" />
                      <stop offset="100%" stopColor="#3a7544" />
                    </linearGradient>
                  </defs>
                </svg>
                <span className="font-bold text-sm tracking-tight bg-gradient-to-r from-[#13ec37] to-[#92c99b] bg-clip-text text-transparent">
                  SITOBAT V3
                </span>
              </div>
            )}
          </div>

          {/* New Chat Button */}
          <div className="mt-4">
            <button
              onClick={() => setMessages([{
                id: "system-v3",
                role: "assistant",
                parts: [{ type: 'text', text: "Ceritakan keluhan medis Anda, saya akan menelusuri hubungan Gejala dan Penyakit langsung dari database tanaman herbal kebun raya Universitas Pahlawan." }]
              }] as UIMessage[])}
              className={`flex items-center hover:bg-[#e1e5ea] dark:hover:bg-[#2b2c2d] text-[#444746] dark:text-[#c4c7c5] transition-all cursor-pointer ${sidebarExpanded
                ? 'w-full rounded-full py-3 px-5 gap-3.5 bg-[#e9eef6] dark:bg-[#1a1a1a] border border-[#d3d6d9] dark:border-[#2d2e30]'
                : 'w-10 h-10 rounded-full justify-center'
                }`}
              title="Mulai Diagnosa Baru"
            >
              <span className="material-symbols-outlined text-xl">edit</span>
              {sidebarExpanded && <span className="text-xs font-semibold select-none">Diagnosa Baru</span>}
            </button>
          </div>

          {/* Collapsible Action/History list */}
          <div className="flex flex-col gap-1 mt-6">
            <Link
              href="/admin/riwayat"
              target="_blank"
              className={`flex items-center hover:bg-[#e1e5ea] dark:hover:bg-[#2b2c2d] text-[#444746] dark:text-[#c4c7c5] py-2.5 rounded-full transition-colors cursor-pointer ${sidebarExpanded ? 'px-5 gap-3.5' : 'justify-center w-10 h-10'
                }`}
              title="Log Diagnosa AI"
            >
              <div className="relative flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-xl">database</span>
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-blue-500"></span>
              </div>
              {sidebarExpanded && <span className="text-xs font-medium truncate select-none">Log Diagnosa AI</span>}
            </Link>

            <Link
              href="/graphrag-visualization.html"
              target="_blank"
              className={`flex items-center hover:bg-[#e1e5ea] dark:hover:bg-[#2b2c2d] text-[#444746] dark:text-[#c4c7c5] py-2.5 rounded-full transition-colors cursor-pointer ${sidebarExpanded ? 'px-5 gap-3.5' : 'justify-center w-10 h-10'
                }`}
              title="Explore Graph Visual"
            >
              <span className="material-symbols-outlined text-xl">hub</span>
              {sidebarExpanded && <span className="text-xs font-medium truncate select-none">Explore Graph Visual</span>}
            </Link>

            <Link
              href="/admin"
              className={`flex items-center hover:bg-[#e1e5ea] dark:hover:bg-[#2b2c2d] text-[#444746] dark:text-[#c4c7c5] py-2.5 rounded-full transition-colors cursor-pointer ${sidebarExpanded ? 'px-5 gap-3.5' : 'justify-center w-10 h-10'
                }`}
              title="Admin Dashboard"
            >
              <span className="material-symbols-outlined text-xl">grid_view</span>
              {sidebarExpanded && <span className="text-xs font-medium truncate select-none">Dashboard Admin</span>}
            </Link>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="flex flex-col gap-1.5 pb-4 px-3.5 border-t border-[#e3e3e3] dark:border-[#2d2e30] pt-4">
          <Link
            href="/"
            className={`flex items-center hover:bg-[#e1e5ea] dark:hover:bg-[#2b2c2d] text-[#444746] dark:text-[#c4c7c5] py-2.5 rounded-full transition-colors cursor-pointer ${sidebarExpanded ? 'px-5 gap-3.5' : 'justify-center w-10 h-10'
              }`}
            title="Kembali ke Home"
          >
            <span className="material-symbols-outlined text-xl">home</span>
            {sidebarExpanded && <span className="text-xs font-medium select-none">Back to Home</span>}
          </Link>

          <button
            onClick={() => setShowSettings(true)}
            className={`flex items-center hover:bg-[#e1e5ea] dark:hover:bg-[#2b2c2d] text-[#444746] dark:text-[#c4c7c5] py-2.5 rounded-full transition-colors cursor-pointer ${sidebarExpanded ? 'px-5 gap-3.5' : 'justify-center w-10 h-10'
              }`}
            title="Settings & Parameters"
          >
            <div className="relative flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-xl">settings</span>
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-blue-500 animate-ping"></span>
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-blue-500"></span>
            </div>
            {sidebarExpanded && <span className="text-xs font-medium select-none">Settings</span>}
          </button>

          <div
            className={`flex items-center mt-3 pt-3 border-t border-[#e3e3e3] dark:border-[#2d2e30]/50 ${sidebarExpanded ? 'px-3.5 gap-3' : 'justify-center'
              }`}
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 border border-white/20 flex items-center justify-center text-white text-xs font-bold shadow-md overflow-hidden shrink-0">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&fit=crop&q=80"
                alt="Parsivale Avatar"
                className="w-full h-full object-cover"
              />
            </div>
            {sidebarExpanded && (
              <div className="min-w-0 flex-1 animate-[fadeIn_0.2s_ease-out]">
                <p className="text-xs font-semibold text-[#1f1f1f] dark:text-white truncate">Parsivale</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">Analyst / Doctor</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* 2. Main Content Container */}
      <main className="flex-1 flex flex-col h-full relative bg-background-light dark:bg-background-dark transition-colors duration-300">

        {/* Glowing Gradient Background Highlight (Only visible in dark mode, matches screenshot perfectly) */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1200px] h-[75%] bg-[radial-gradient(circle_at_50%_35%,_rgba(19,236,55,0.05)_0%,_transparent_65%)] dark:bg-[radial-gradient(circle_at_50%_35%,_rgba(19,236,55,0.08)_0%,_transparent_65%)] pointer-events-none z-0"></div>

        {/* Global Floating Header (Always accessible) */}
        <header className="flex items-center justify-between px-6 py-4 relative z-10 shrink-0 select-none">
          <div className="flex items-center gap-3">
            <span className="md:hidden w-8 h-8 rounded-full hover:bg-slate-200 dark:hover:bg-[#2b2c2d] flex items-center justify-center cursor-pointer" onClick={() => setSidebarExpanded(!sidebarExpanded)}>
              <span className="material-symbols-outlined text-[#444746] dark:text-[#c4c7c5]">menu</span>
            </span>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#13ec37] shadow-[0_0_8px_rgba(19,236,55,0.7)] animate-[pulse_1.5s_infinite]"></span>
              <span className="text-xs font-bold uppercase tracking-wider text-[#3a7544] dark:text-[#92c99b]">
                GraphRAG ReAct Agent
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Interactive Model Selector for Mobile View (Hidden on desktop) */}
            <div className="relative select-none sm:hidden z-40">
              <button
                type="button"
                onClick={() => setShowModelPicker(!showModelPicker)}
                disabled={isModelsLoading || aiModels.length === 0}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-[#f0f4f9] dark:bg-[#1e1f20] text-[#444746] dark:text-[#c4c7c5] text-[10px] font-semibold border border-[#e3e3e3] dark:border-[#2d2e30] hover:bg-slate-100 hover:dark:bg-[#353739] transition-all disabled:opacity-50 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[#13ec37] text-xs shrink-0">smart_toy</span>
                <span className="max-w-[70px] truncate">{selectedModel ? selectedModel.label : "Pro"}</span>
                <span className="material-symbols-outlined text-[14px] text-slate-400">expand_more</span>
              </button>

              {showModelPicker && (
                <div className="absolute top-full right-0 mt-2 w-56 bg-background-light dark:bg-[#282a2c] border border-[#e3e3e3] dark:border-[#3c4043] rounded-2xl shadow-2xl overflow-hidden z-[100] animate-[fadeIn_0.15s_ease-out]">
                  <div className="px-3.5 py-2.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-black/10">
                    <p className="text-[9px] font-bold text-[#13ec37] uppercase tracking-wider">Pilih Model AI Diagnosa</p>
                  </div>
                  <div className="max-h-[220px] overflow-y-auto">
                    {aiModels.map((m, idx) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => { setSelectedModelIdx(idx); setShowModelPicker(false); }}
                        className={`w-full flex items-center justify-between px-3.5 py-3 text-left hover:bg-slate-100 dark:hover:bg-[#202124] transition-colors ${idx === selectedModelIdx
                          ? 'bg-blue-50 dark:bg-[#2b2c2d] border-l-3 border-[#13ec37]'
                          : 'border-l-3 border-transparent'
                          }`}
                      >
                        <div className="min-w-0">
                          <p className={`text-[11px] font-semibold truncate ${idx === selectedModelIdx ? 'text-[#13ec37]' : 'text-[#1f1f1f] dark:text-[#e3e3e3]'}`}>{m.label}</p>
                          <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-0.5">{m.provider}</p>
                        </div>
                        {idx === selectedModelIdx && (
                          <span className="material-symbols-outlined text-[#13ec37] text-sm">check_circle</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <ThemeToggle />
          </div>
        </header>

        {/* Dynamic Inner Layout depending on state */}
        {!hasUserMessages ? (

          /* ==============================================
             Layout STATE A: Empty Chat (Centred Gemini UI)
             ============================================== */
          <div className="flex-1 overflow-y-auto overflow-x-visible relative z-10 flex flex-col items-center justify-between sm:justify-center px-4 max-w-3xl mx-auto w-full pb-6 sm:pb-20 select-text">

            {/* Big Gradient Greetings */}
            <div className="text-center w-full flex-1 flex flex-col justify-center sm:flex-none sm:mb-10 pt-8 sm:pt-0">
              <div className="w-full">
                <h2 className="text-4xl md:text-5xl font-medium tracking-tight text-[#1f1f1f] dark:text-[#c4c7c5] mb-2">
                  Hi,
                </h2>
                <h3 className="text-3xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-[#13ec37] via-[#0dbd2a] to-[#92c99b] bg-clip-text text-transparent py-1 leading-tight select-none">
                  ada keluhan apa hari ini?
                </h3>
              </div>
            </div>

            {/* Center Pill Input Bar */}
            <div className="w-full relative group mb-4 sm:mb-10">
              {/* Pulsing Border Gradient Glow on focus/hover */}
              <div className="absolute -inset-1 bg-gradient-to-r from-[#13ec37]/30 via-[#0dbd2a]/20 to-[#92c99b]/10 rounded-[28px] blur opacity-15 group-hover:opacity-30 group-focus-within:opacity-40 transition duration-500 ease-out"></div>

              <form
                onSubmit={handleSendMessage}
                className="relative bg-[#f0f4f9] dark:bg-[#1e1f20] border border-[#e3e3e3] dark:border-[#2d2e30] rounded-[28px] pt-3.5 pb-2 px-5 flex flex-col shadow-xl hover:bg-[#e9eff6] hover:dark:bg-[#232426] focus-within:bg-background-light focus-within:dark:bg-[#232426] transition-all duration-300 w-full"
              >
                {/* 1. Text Area Row (Full Width) */}
                <div className="w-full">
                  <textarea
                    ref={textareaRefA}
                    name="prompt"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={isLoading}
                    rows={1}
                    className="w-full bg-transparent border-none focus:ring-0 text-[#1f1f1f] dark:text-[#e3e3e3] placeholder-[#757775] dark:placeholder-[#8e918f] text-base py-1 outline-none resize-none overflow-y-auto max-h-[180px] leading-relaxed"
                    placeholder={isLoading ? "Agent sedang menelusuri Graph Database..." : "Ketikan keluhan atau gejala di sini..."}
                  />
                </div>

                {/* 2. Actions Row (Left & Right) */}
                <div className="flex items-center justify-between w-full mt-1.5">
                  {/* Left Side: Plus Settings Button */}
                  <button
                    type="button"
                    onClick={() => setShowSettings(true)}
                    className="w-11 h-11 rounded-full hover:bg-slate-200 dark:hover:bg-[#2b2c2d] flex items-center justify-center text-[#444746] dark:text-[#c4c7c5] transition-colors shrink-0 cursor-pointer"
                    title="Configure Parameters"
                  >
                    <span className="material-symbols-outlined text-[24px]">add</span>
                  </button>

                  {/* Right Side: Model, Mic, and Send Buttons */}
                  <div className="flex items-center gap-2 select-none">
                    {/* Dropdown Model Picker Inside Input (Hidden on mobile) */}
                    <div className="hidden sm:block relative shrink-0">
                      <button
                        type="button"
                        onClick={() => setShowModelPicker(!showModelPicker)}
                        disabled={isModelsLoading || aiModels.length === 0}
                        className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-background-light dark:bg-[#2b2c2d] text-[#444746] dark:text-[#c4c7c5] text-xs font-semibold border border-[#d3d6d9] dark:border-[#3e4042] hover:bg-slate-100 hover:dark:bg-[#353739] transition-all disabled:opacity-50 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[#13ec37] text-sm shrink-0">smart_toy</span>
                        <span>{selectedModel ? selectedModel.label : "Pro"}</span>
                        <span className="material-symbols-outlined text-[16px] text-slate-400">expand_more</span>
                      </button>

                      {/* Dropdown Options List */}
                      {showModelPicker && (
                        <div className="absolute top-full right-0 mt-3 w-64 bg-background-light dark:bg-[#282a2c] border border-[#e3e3e3] dark:border-[#3c4043] rounded-2xl shadow-2xl overflow-hidden z-[100] animate-[fadeIn_0.15s_ease-out]">
                          <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-black/10">
                            <p className="text-[10px] font-bold text-[#13ec37] uppercase tracking-wider">Pilih Model AI Diagnosa</p>
                          </div>
                          <div className="max-h-[220px] overflow-y-auto">
                            {aiModels.map((m, idx) => (
                              <button
                                key={m.id}
                                type="button"
                                onClick={() => { setSelectedModelIdx(idx); setShowModelPicker(false); }}
                                className={`w-full flex items-center justify-between px-4 py-3.5 text-left hover:bg-slate-100 dark:hover:bg-[#202124] transition-colors ${idx === selectedModelIdx
                                  ? 'bg-blue-50 dark:bg-[#2b2c2d] border-l-3 border-[#13ec37]'
                                  : 'border-l-3 border-transparent'
                                  }`}
                              >
                                <div className="min-w-0">
                                  <p className={`text-xs font-semibold truncate ${idx === selectedModelIdx ? 'text-[#13ec37]' : 'text-[#1f1f1f] dark:text-[#e3e3e3]'}`}>{m.label}</p>
                                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">{m.provider}</p>
                                </div>
                                {idx === selectedModelIdx && (
                                  <span className="material-symbols-outlined text-[#13ec37] text-base">check_circle</span>
                                )}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Voice Microphone Dictation Icon */}
                    <button
                      type="button"
                      onClick={toggleListening}
                      className={`w-11 h-11 rounded-full hover:bg-slate-200 dark:hover:bg-[#2b2c2d] flex items-center justify-center transition-all shrink-0 cursor-pointer ${isListening
                        ? 'text-red-500 bg-red-500/10 animate-pulse border border-red-500/20'
                        : 'text-[#444746] dark:text-[#c4c7c5]'
                        }`}
                      title={isListening ? "Sedang mendengarkan... Klik untuk berhenti" : "Diagnosa lewat Suara (Speech to Text)"}
                    >
                      <span className="material-symbols-outlined text-[22px]">
                        {isListening ? 'mic_off' : 'mic'}
                      </span>
                    </button>

                    {/* Submit Arrow Icon */}
                    <button
                      type="submit"
                      disabled={isLoading || !input.trim()}
                      className="w-11 h-11 bg-primary text-background-dark rounded-full flex items-center justify-center shrink-0 disabled:opacity-35 hover:brightness-110 active:scale-95 transition-all shadow-[0_0_15px_rgba(19,236,55,0.4)] cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                    </button>
                  </div>
                </div>
              </form>
            </div>

            {/* Suggestions Quick Grids */}
            <div className="hidden sm:grid grid-cols-1 sm:grid-cols-2 gap-4 w-full select-none">
              {suggestions.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(undefined, s.text)}
                  className="flex items-start gap-4 p-5 rounded-2xl bg-[#f0f4f9]/50 dark:bg-[#1e1f20]/50 border border-[#e3e3e3] dark:border-[#2d2e30]/80 text-left hover:bg-[#e1e5ea] hover:dark:bg-[#2b2c2d] hover:scale-[1.01] hover:border-slate-400 hover:dark:border-[#3e4042] transition-all duration-300 group cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-xl bg-white dark:bg-[#2d2e30] border border-slate-200 dark:border-slate-800 flex items-center justify-center shrink-0 text-[#13ec37] dark:text-[#92c99b] group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-xl">{s.icon}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-[#1f1f1f] dark:text-[#e3e3e3] line-clamp-1 group-hover:text-[#13ec37] transition-colors">{s.text}</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">{s.subtext}</p>
                  </div>
                </button>
              ))}
            </div>

            <p className="text-center text-[10px] text-slate-400 dark:text-slate-500 mt-6 sm:mt-14 font-medium tracking-wide">
              SITOBAT V3 menggunakan GraphRAG Berbasis Prisma. Hasil diagnosa medis didasarkan sepenuhnya pada database kebun raya UP.
            </p>
          </div>
        ) : (

          /* ==============================================
             Layout STATE B: Active Chat (Gemini Flowing stream)
             ============================================== */
          <div className="flex-1 flex flex-col min-h-0 relative select-text">

            {/* Scrollable chat messages container */}
            <div
              className="flex-1 overflow-y-auto px-4 py-8 md:px-12 lg:px-24 pb-36 scroll-smooth"
              id="chat-container"
            >
              <div className="max-w-3xl mx-auto flex flex-col gap-10">

                {messages.map((m, index) => {
                  // Cek raw JSON hasil pemanggilan tool agar tidak bocor kasar ke user
                  const isRawJson = (text: string) => {
                    if (typeof text !== 'string') return false;
                    const trimmed = text.trim();
                    return trimmed.startsWith('{') || trimmed.startsWith('[');
                  };

                  return (
                    <div
                      key={m.id}
                      className={`flex gap-5 items-start ${m.role === 'user'
                        ? 'justify-end animate-[slideUp_0.3s_ease-out]'
                        : 'animate-[fadeIn_0.4s_ease-out]'
                        }`}
                    >
                      {/* Avatar for Assistant */}
                      {m.role !== 'user' && (
                        <div className="w-9 h-9 rounded-full bg-[#f0f4f9] dark:bg-[#1e1f20] border border-slate-200 dark:border-slate-800 flex items-center justify-center shrink-0 shadow-sm relative overflow-hidden select-none">
                          <svg className="w-5.5 h-5.5 animate-[pulse_3s_infinite]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2L14.8 9.2L22 12L14.8 14.8L12 22L9.2 14.8L2 12L9.2 9.2L12 2Z" fill="url(#botGrad)" />
                            <defs>
                              <linearGradient id="botGrad" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                                <stop offset="0%" stopColor="#13ec37" />
                                <stop offset="50%" stopColor="#0dbd2a" />
                                <stop offset="100%" stopColor="#92c99b" />
                              </linearGradient>
                            </defs>
                          </svg>
                        </div>
                      )}

                      <div className={`flex flex-col gap-2.5 max-w-[85%] lg:max-w-[75%] ${m.role === 'user' ? 'items-end' : ''}`}>

                        {/* Name Header */}
                        <div className="flex items-baseline gap-2 select-none">
                          <span className="text-[11px] font-bold tracking-wider uppercase text-slate-500 dark:text-slate-400">
                            {m.role === 'user' ? 'Anda' : 'SITOBAT V3 AGENT'}
                          </span>
                        </div>

                        {/* Rendering parts */}
                        {m.parts ? m.parts.map((part: any, partIndex: number) => {

                          // TEXT PART
                          if (part.type === 'text' && part.text && !isRawJson(part.text)) {
                            return (
                              <div
                                key={partIndex}
                                className={`rounded-2xl leading-relaxed text-sm ${m.role === 'user'
                                  ? 'bg-[#f0f4f9] dark:bg-[#2b2c2d] text-[#1f1f1f] dark:text-[#e3e3e3] px-5 py-3.5 shadow-sm rounded-tr-none border border-slate-200/50 dark:border-slate-700/30'
                                  : 'text-[#1f1f1f] dark:text-[#e3e3e3] w-full font-normal'
                                  }`}
                              >
                                <div
                                  className="markdown-content space-y-4"
                                  dangerouslySetInnerHTML={{
                                    __html: part.text
                                      .replace(/\n/g, '<br />')
                                      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                      .replace(/\*(.*?)\*/g, '<em>$1</em>')
                                  }}
                                />
                              </div>
                            );
                          }

                          // TOOL CALLS PART (Agent Thinking Chain)
                          const isToolPart = part.type === 'tool-invocation' ||
                            part.type?.startsWith('tool-') ||
                            part.type === 'dynamic-tool';

                          if (isToolPart) {
                            const toolName = part.type === 'dynamic-tool'
                              ? part.toolName
                              : (part.toolInvocation?.toolName || part.toolName || part.type.replace('tool-', ''));

                            const state = part.toolInvocation?.state || part.state;
                            const isResult = state === 'result' || state === 'output-available' || part.type === 'tool-result';

                            return (
                              <div
                                key={partIndex}
                                className="bg-[#f0f4f9]/50 dark:bg-[#1a1a1a]/30 border border-[#e3e3e3] dark:border-slate-800 rounded-xl px-4 py-3 mt-1.5 w-full text-xs font-mono transition-all"
                              >
                                <div className="flex items-center justify-between gap-2 select-none">
                                  <div className="flex items-center gap-2">
                                    <span className={`material-symbols-outlined text-[17px] ${isResult ? 'text-green-500' : 'text-amber-500 animate-spin'
                                      }`}>
                                      {getToolIcon(toolName)}
                                    </span>
                                    <span className={`font-semibold ${isResult ? 'text-slate-400' : 'text-amber-500 animate-pulse'}`}>
                                      {getToolDisplayName(toolName)}
                                    </span>
                                  </div>

                                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${isResult ? 'bg-green-500/10 text-green-500' : 'bg-amber-500/10 text-amber-500'
                                    }`}>
                                    {isResult ? 'Completed' : 'Running'}
                                  </span>
                                </div>

                                {/* Payload database raw expandable */}
                                {isResult && (
                                  <details className="mt-2 text-[10px] text-slate-500 border-t border-slate-200 dark:border-slate-800/80 pt-2 shrink-0">
                                    <summary className="cursor-pointer hover:text-slate-700 dark:hover:text-slate-300 transition-colors select-none">
                                      Lihat payload database raw
                                    </summary>
                                    <pre className="mt-2 text-[9px] overflow-x-auto whitespace-pre-wrap text-[#4f5052] dark:text-slate-400 bg-slate-100 dark:bg-black/30 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 select-all font-mono leading-relaxed max-h-56">
                                      {JSON.stringify(part.toolInvocation?.result || part.output || part.args || (part as any).result, null, 2)}
                                    </pre>
                                  </details>
                                )}
                              </div>
                            );
                          }

                          return null;
                        }) : (
                          // Fallback message text if no parts present
                          ((m as any).content || (m as any).text) ? (
                            (() => {
                              const fallbackText = (m as any).content || (m as any).text;
                              if (isRawJson(fallbackText)) return null;

                              return (
                                <div key="fallback-text" className={`rounded-2xl leading-relaxed text-sm ${m.role === 'user'
                                  ? 'bg-[#f0f4f9] dark:bg-[#2b2c2d] text-[#1f1f1f] dark:text-[#e3e3e3] px-5 py-3.5 shadow-sm rounded-tr-none'
                                  : 'text-[#1f1f1f] dark:text-[#e3e3e3] w-full font-normal'
                                  }`}>
                                  <p className="space-y-4">{fallbackText}</p>
                                </div>
                              );
                            })()
                          ) : null
                        )}

                        {/* Plant Recommendation Cards & Graph Link */}
                        {m.role === 'assistant' && index > 0 && status !== 'streaming' && status !== 'submitted' && (() => {
                          const { tanaman: extractedTanaman, gejalaIds, penyakitIds, tanamanIds } = extractGraphDataFromMessage(m);
                          if (extractedTanaman.length === 0 && gejalaIds.length === 0) return null;

                          return (
                            <div className="mt-4 w-full space-y-3.5 animate-[fadeIn_0.5s_ease-out]">

                              {/* 1. Herbal Plants Cards */}
                              {extractedTanaman.length > 0 && (
                                <div className="bg-white dark:bg-[#1a1a1a]/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
                                  <div className="flex items-center gap-2 mb-3.5 select-none">
                                    <span className="material-symbols-outlined text-[#13ec37] text-[19px]">eco</span>
                                    <span className="text-xs font-bold text-[#1f1f1f] dark:text-white uppercase tracking-wider">
                                      Rekomendasi Tanaman Obat
                                    </span>
                                  </div>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {extractedTanaman.map(t => (
                                      <Link
                                        key={t.id}
                                        href={`/tanaman/${t.id}`}
                                        target="_blank"
                                        className="flex items-center gap-3.5 px-4.5 py-4 rounded-xl bg-slate-50 dark:bg-[#202124]/40 border border-slate-100 dark:border-slate-800/80 hover:border-[#13ec37]/50 dark:hover:border-[#13ec37]/50 hover:bg-slate-100 hover:dark:bg-[#202124]/90 hover:scale-[1.01] transition-all group shadow-2xs"
                                      >
                                        <div className="w-9.5 h-9.5 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-500/20 transition-colors">
                                          <span className="material-symbols-outlined text-[#13ec37] text-[19px]">local_florist</span>
                                        </div>
                                        <div className="min-w-0 flex-1">
                                          <p className="text-slate-800 dark:text-white text-xs font-bold truncate group-hover:text-[#13ec37] transition-colors">{t.nama}</p>
                                          {t.khasiatUtama && (
                                            <p className="text-slate-500 dark:text-slate-400 text-[10px] truncate mt-1">{t.khasiatUtama}</p>
                                          )}
                                        </div>
                                        <span className="material-symbols-outlined text-slate-400 dark:text-slate-500 text-[16px] group-hover:text-[#13ec37] transition-colors">open_in_new</span>
                                      </Link>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* 2. Knowledge Graph Highlight Link */}
                              {(gejalaIds.length > 0 || penyakitIds.length > 0) && (
                                <a
                                  href={buildGraphUrl(gejalaIds, penyakitIds, tanamanIds)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-3.5 px-4.5 py-4 rounded-xl bg-blue-500/5 dark:bg-[#1a1a2e]/40 border border-blue-500/10 dark:border-blue-500/10 hover:border-[#13ec37]/50 hover:bg-blue-500/10 hover:dark:bg-[#1a1a2e]/85 hover:scale-[1.01] transition-all shadow-2xs group w-full"
                                >
                                  <div className="w-9.5 h-9.5 rounded-full bg-blue-500/15 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-500/25 transition-colors">
                                    <span className="material-symbols-outlined text-[#13ec37] text-[19px]">hub</span>
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <p className="text-slate-800 dark:text-white text-xs font-bold group-hover:text-[#13ec37] transition-colors">Lihat Visualisasi Knowledge Graph</p>
                                    <p className="text-slate-500 dark:text-slate-400 text-[10px] mt-1 select-none">
                                      Menelusuri peta relasi {gejalaIds.length} gejala, {penyakitIds.length} penyakit{tanamanIds.length > 0 ? `, ${tanamanIds.length} tanaman` : ''} di database
                                    </p>
                                  </div>
                                  <span className="material-symbols-outlined text-slate-400 dark:text-slate-500 text-[16px] group-hover:text-[#13ec37] transition-colors">arrow_outward</span>
                                </a>
                              )}
                            </div>
                          );
                        })()}
                      </div>

                      {/* Avatar for User */}
                      {m.role === 'user' && (
                        <div className="w-9 h-9 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 border border-white/20 flex items-center justify-center text-white text-xs font-bold shadow-md overflow-hidden shrink-0 select-none">
                          <img
                            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&fit=crop&q=80"
                            alt="Parsivale Avatar"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Loading state indicator */}
                {isLoading && messages.length > 0 && messages[messages.length - 1].role === 'user' && (
                  <div className="flex gap-5 items-center animate-[fadeIn_0.5s_ease-out]">
                    <div className="w-9 h-9 rounded-full bg-[#f0f4f9] dark:bg-[#1e1f20] border border-slate-200 dark:border-slate-800 flex items-center justify-center shrink-0 shadow-sm relative overflow-hidden">
                      <svg className="w-5.5 h-5.5 animate-spin" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2L14.8 9.2L22 12L14.8 14.8L12 22L9.2 14.8L2 12L9.2 9.2L12 2Z" fill="url(#spinGrad)" />
                        <defs>
                          <linearGradient id="spinGrad" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                            <stop offset="0%" stopColor="#13ec37" />
                            <stop offset="100%" stopColor="#0dbd2a" />
                          </linearGradient>
                        </defs>
                      </svg>
                    </div>
                    <div className="flex gap-1.5 bg-[#f0f4f9] dark:bg-[#1e1f20] border border-slate-200 dark:border-slate-800 px-5 py-4 rounded-2xl rounded-tl-none items-center h-12 shadow-2xs select-none">
                      <div className="w-2.5 h-2.5 bg-[#13ec37] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2.5 h-2.5 bg-[#13ec37] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2.5 h-2.5 bg-[#13ec37] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Sticky Bottom Input Bar Area (Matches State A style exactly but fixed at bottom) */}
            <div className="absolute bottom-0 left-0 w-full px-4 pb-6 pt-12 z-30 flex justify-center bg-gradient-to-t from-[#ffffff] via-[#ffffff]/90 to-transparent dark:from-background-dark dark:via-background-dark/90 dark:to-transparent pointer-events-none select-none">
              <div className="w-full max-w-3xl relative group pointer-events-auto">
                <div className="absolute -inset-1 bg-gradient-to-r from-[#13ec37]/30 via-[#0dbd2a]/20 to-[#92c99b]/10 rounded-[28px] blur opacity-15 group-hover:opacity-30 group-focus-within:opacity-40 transition duration-500 ease-out"></div>

                <form
                  onSubmit={handleSendMessage}
                  className="relative bg-[#f0f4f9] dark:bg-[#1e1f20] border border-[#e3e3e3] dark:border-[#2d2e30] rounded-[28px] pt-3.5 pb-2 px-5 flex flex-col shadow-xl hover:bg-[#e9eff6] hover:dark:bg-[#232426] focus-within:bg-background-light focus-within:dark:bg-[#232426] transition-all duration-300 w-full"
                >
                  {/* 1. Text Area Row (Full Width) */}
                  <div className="w-full">
                    <textarea
                      ref={textareaRefB}
                      name="prompt"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      disabled={isLoading}
                      rows={1}
                      className="w-full bg-transparent border-none focus:ring-0 text-[#1f1f1f] dark:text-[#e3e3e3] placeholder-[#757775] dark:placeholder-[#8e918f] text-base py-1 outline-none resize-none overflow-y-auto max-h-[180px] leading-relaxed"
                      placeholder={isLoading ? "Agent sedang menganalisis database..." : "Ketikan gejala atau keluhan lanjutan medis Anda..."}
                    />
                  </div>

                  {/* 2. Actions Row (Left & Right) */}
                  <div className="flex items-center justify-between w-full mt-1.5">
                    {/* Left Side: Plus Settings Button */}
                    <button
                      type="button"
                      onClick={() => setShowSettings(true)}
                      className="w-11 h-11 rounded-full hover:bg-slate-200 dark:hover:bg-[#2b2c2d] flex items-center justify-center text-[#444746] dark:text-[#c4c7c5] transition-colors shrink-0 cursor-pointer"
                      title="Configure Parameters"
                    >
                      <span className="material-symbols-outlined text-[24px]">add</span>
                    </button>

                    {/* Right Side: Model, Mic, and Send Buttons */}
                    <div className="flex items-center gap-2 select-none">
                      {/* Dropdown Model Picker Inside Input (Hidden on mobile) */}
                      <div className="hidden sm:block relative shrink-0">
                        <button
                          type="button"
                          onClick={() => setShowModelPicker(!showModelPicker)}
                          disabled={isModelsLoading || aiModels.length === 0}
                          className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-background-light dark:bg-[#2b2c2d] text-[#444746] dark:text-[#c4c7c5] text-xs font-semibold border border-[#d3d6d9] dark:border-[#3e4042] hover:bg-slate-100 hover:dark:bg-[#353739] transition-all disabled:opacity-50 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[#13ec37] text-sm shrink-0">smart_toy</span>
                          <span>{selectedModel ? selectedModel.label : "Pro"}</span>
                          <span className="material-symbols-outlined text-[16px] text-slate-400">expand_more</span>
                        </button>

                        {/* Dropdown Options List */}
                        {showModelPicker && (
                          <div className="absolute bottom-full right-0 mb-3 w-64 bg-background-light dark:bg-[#282a2c] border border-[#e3e3e3] dark:border-[#3c4043] rounded-2xl shadow-2xl overflow-hidden z-[100] animate-[fadeIn_0.15s_ease-out]">
                            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-black/10">
                              <p className="text-[10px] font-bold text-[#13ec37] uppercase tracking-wider">Pilih Model AI Diagnosa</p>
                            </div>
                            <div className="max-h-[220px] overflow-y-auto">
                              {aiModels.map((m, idx) => (
                                <button
                                  key={m.id}
                                  type="button"
                                  onClick={() => { setSelectedModelIdx(idx); setShowModelPicker(false); }}
                                  className={`w-full flex items-center justify-between px-4 py-3.5 text-left hover:bg-slate-100 dark:hover:bg-[#202124] transition-colors ${idx === selectedModelIdx
                                    ? 'bg-blue-50 dark:bg-[#2b2c2d] border-l-3 border-[#13ec37]'
                                    : 'border-l-3 border-transparent'
                                    }`}
                                >
                                  <div className="min-w-0">
                                    <p className={`text-xs font-semibold truncate ${idx === selectedModelIdx ? 'text-[#13ec37]' : 'text-[#1f1f1f] dark:text-[#e3e3e3]'}`}>{m.label}</p>
                                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">{m.provider}</p>
                                  </div>
                                  {idx === selectedModelIdx && (
                                    <span className="material-symbols-outlined text-[#13ec37] text-base">check_circle</span>
                                  )}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Voice Microphone Dictation Icon */}
                      <button
                        type="button"
                        onClick={toggleListening}
                        className={`w-11 h-11 rounded-full hover:bg-slate-200 dark:hover:bg-[#2b2c2d] flex items-center justify-center transition-all shrink-0 cursor-pointer ${isListening
                          ? 'text-red-500 bg-red-500/10 animate-pulse border border-red-500/20'
                          : 'text-[#444746] dark:text-[#c4c7c5]'
                          }`}
                        title={isListening ? "Listening..." : "Voice input"}
                      >
                        <span className="material-symbols-outlined text-[22px]">
                          {isListening ? 'mic_off' : 'mic'}
                        </span>
                      </button>

                      {/* Submit Arrow Icon */}
                      <button
                        type="submit"
                        disabled={isLoading || !input.trim()}
                        className="w-11 h-11 bg-primary text-background-dark rounded-full flex items-center justify-center shrink-0 disabled:opacity-35 hover:brightness-110 active:scale-95 transition-all shadow-[0_0_15px_rgba(19,236,55,0.4)] cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>

          </div>
        )}

      </main>

      {/* 3. Settings Parameters Glass Modal Drawer */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 select-none animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-background-light dark:bg-[#1e1f20] border border-[#e3e3e3] dark:border-[#2d2e30] rounded-3xl p-6 w-full max-w-md shadow-2xl relative">

            <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#13ec37] text-xl">settings</span>
                <h3 className="text-base font-bold text-[#1f1f1f] dark:text-white">Settings & Parameters</h3>
              </div>
              <button
                onClick={() => setShowSettings(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-200 dark:hover:bg-[#2b2c2d] flex items-center justify-center text-slate-500 dark:text-slate-400 cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <div className="space-y-5 select-text">
              {/* Temperature Slider */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-600 dark:text-slate-400">Model Temperature</span>
                  <span className="text-[#13ec37]">{temperature}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#13ec37]"
                />
                <p className="text-[9px] text-slate-400">Temperatur lebih rendah membuat agen lebih deterministic & patuh pada aturan grafik.</p>
              </div>

              {/* Max Steps Slider */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-600 dark:text-slate-400">Max ReAct Thinking Steps</span>
                  <span className="text-[#13ec37]">{maxSteps}</span>
                </div>
                <input
                  type="range"
                  min="3"
                  max="12"
                  step="1"
                  value={maxSteps}
                  onChange={(e) => setMaxSteps(parseInt(e.target.value))}
                  className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#13ec37]"
                />
                <p className="text-[9px] text-slate-400">Membatasi jumlah langkah pencarian database oleh agen AI untuk mencegah loop tak terbatas.</p>
              </div>

              {/* API Provider Status */}
              <div className="p-4 bg-slate-50 dark:bg-[#282a2c] rounded-2xl border border-slate-100 dark:border-[#3c4043] space-y-2">
                <p className="text-[10px] font-bold text-slate-500 uppercase">Status & Info Database</p>
                <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-slate-600 dark:text-slate-400 leading-relaxed">
                  <div>Model Aktif:</div>
                  <div className="text-right text-[#13ec37] font-semibold truncate">{selectedModel?.label || "Flash 2.5"}</div>

                  <div>Prisma Client:</div>
                  <div className="text-right text-green-500">Connected</div>

                  <div>GraphRAG V3:</div>
                  <div className="text-right">Enabled</div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3 select-none">
              <button
                onClick={() => setShowSettings(false)}
                className="px-5 py-2.5 rounded-full bg-primary hover:bg-primary-hover text-background-dark text-xs font-bold shadow-glow cursor-pointer transition-colors"
              >
                Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global CSS style tags for animation & markdown formats */}
      <style>{`
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(120, 120, 120, 0.2); border-radius: 9999px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(120, 120, 120, 0.4); }
        
        .markdown-content strong {
          color: inherit;
          font-weight: 700;
        }
        .markdown-content br {
          margin-bottom: 0.5rem;
          content: "";
          display: block;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.98); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient {
          background-size: 200% auto;
          animation: gradient 5s ease infinite;
        }
      `}</style>
    </div>
  );
}
