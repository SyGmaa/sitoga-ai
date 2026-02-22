"use client";

import Link from "next/link";
import { useTheme } from "@/components/ThemeProvider";

export function Navbar() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50 w-full glass-card border-b border-slate-200 dark:border-leaf-700/50 px-6 py-4 transition-all duration-300">
      <div className="mx-auto max-w-7xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center size-10 rounded-full bg-primary/10 text-primary">
            <span className="material-symbols-outlined text-3xl">eco</span>
          </div>
          <h2 className="text-slate-800 dark:text-white text-xl font-bold tracking-tight">AI SITOGA UP</h2>
        </div>
        <nav className="hidden md:flex flex-wrap items-center gap-4 lg:gap-8">
          <Link href="/" className="text-slate-600 dark:text-slate-200 hover:text-primary transition-colors text-sm font-medium">Home</Link>
          <Link href="/tanaman" className="text-slate-600 dark:text-slate-200 hover:text-primary transition-colors text-sm font-medium">Tanaman</Link>
          <Link href="/peta" className="text-slate-600 dark:text-slate-200 hover:text-primary transition-colors text-sm font-medium">Garden Map</Link>
          <Link href="/diagnosa" className="text-slate-600 dark:text-slate-200 hover:text-primary transition-colors text-sm font-medium">Diagnosis</Link>
          <Link href="/admin" className="text-slate-600 dark:text-slate-200 hover:text-primary transition-colors text-sm font-medium">Admin</Link>
        </nav>
        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-all text-slate-600 dark:text-slate-200"
            title={theme === 'dark' ? 'Ganti ke mode siang' : 'Ganti ke mode malam'}
          >
            <span className={`material-symbols-outlined text-xl transition-transform duration-500 ${theme === 'dark' ? 'rotate-0' : 'rotate-360'}`}>
              {theme === 'dark' ? 'light_mode' : 'dark_mode'}
            </span>
          </button>
          <Link href="/scan" className="hidden sm:flex items-center gap-2 cursor-pointer rounded-full h-10 px-5 bg-primary hover:bg-primary-hover transition-colors text-background-dark text-sm font-bold shadow-[0_0_15px_rgba(19,236,55,0.3)]">
            <span className="material-symbols-outlined text-[20px]">qr_code_scanner</span>
            <span>Quick Scan</span>
          </Link>
        </div>
      </div>
    </header>
  );
}


