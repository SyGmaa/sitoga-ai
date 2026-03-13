"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";

interface DiagnosaOption {
  href: string;
  icon: string;
  label: string;
  sublabel?: string;
  color: string; // tailwind bg class
  hoverColor: string; // tailwind hover bg class
}

const diagnosaOptions: DiagnosaOption[] = [
  {
    href: "/diagnosa",
    icon: "medical_services",
    label: "Diagnosa V1",
    sublabel: "Streaming Chat + RAG",
    color: "bg-primary",
    hoverColor: "hover:bg-[#0fd630]",
  },
  {
    href: "/diagnosa-v2",
    icon: "psychiatry",
    label: "Diagnosa V2",
    sublabel: "Structured Object + RAG",
    color: "bg-blue-600",
    hoverColor: "hover:bg-blue-500",
  },
  {
    href: "/diagnosa-v3",
    icon: "device_hub",
    label: "Diagnosa V3",
    sublabel: "GraphRAG ReAct Agent",
    color: "bg-emerald-600",
    hoverColor: "hover:bg-emerald-500",
  },
  {
    href: "/diagnosa-0.5",
    icon: "science",
    label: "Diagnosa 0.5",
    sublabel: "Legacy Structured",
    color: "bg-amber-600",
    hoverColor: "hover:bg-amber-500",
  },
];

interface DiagnosaDropdownProps {
  /** Visual variant */
  variant?: "hero" | "cta";
}

export function DiagnosaDropdown({ variant = "hero" }: DiagnosaDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isHero = variant === "hero";

  return (
    <div ref={ref} className="relative inline-block">
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center justify-center gap-3 cursor-pointer rounded-full font-bold transition-all transform hover:scale-105 ${
          isHero
            ? "animate-pulse-glow h-14 px-8 bg-primary hover:bg-[#0fd630] text-background-dark text-base"
            : "h-12 px-6 bg-primary hover:bg-[#0fd630] text-background-dark shadow-lg shadow-primary/20"
        }`}
      >
        <span className="material-symbols-outlined">medical_services</span>
        <span>Mulai Diagnosa</span>
        <span
          className={`material-symbols-outlined text-[18px] transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        >
          expand_more
        </span>
      </button>

      {open && (
        <div
          className={`absolute z-50 w-72 rounded-2xl border overflow-hidden shadow-2xl animate-[fadeInDrop_0.2s_ease-out] ${
            isHero
              ? "bottom-full mb-3 left-1/2 -ml-36 bg-white/95 dark:bg-surface-dark/95 backdrop-blur-xl border-slate-200 dark:border-leaf-700"
              : "bottom-full mb-3 left-1/2 -ml-36 bg-white/95 dark:bg-surface-dark/95 backdrop-blur-xl border-slate-200 dark:border-leaf-700"
          }`}
        >
          <div className="p-2 space-y-1">
            {diagnosaOptions.map((opt) => (
              <Link
                key={opt.href}
                href={opt.href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-100 dark:hover:bg-leaf-700/40 transition-colors group"
              >
                <div
                  className={`w-10 h-10 rounded-full ${opt.color} flex items-center justify-center shrink-0 shadow-md group-hover:scale-110 transition-transform`}
                >
                  <span className="material-symbols-outlined text-white text-[20px]">
                    {opt.icon}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-slate-800 dark:text-white group-hover:text-primary transition-colors">
                    {opt.label}
                  </p>
                  {opt.sublabel && (
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                      {opt.sublabel}
                    </p>
                  )}
                </div>
                <span className="material-symbols-outlined text-slate-300 dark:text-slate-600 text-[16px] group-hover:text-primary group-hover:translate-x-0.5 transition-all">
                  arrow_forward
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeInDrop {
          from { opacity: 0; transform: translateY(-6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
