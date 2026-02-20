import Link from "next/link";
import { ReactNode } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-800 dark:text-slate-100 font-sans min-h-screen flex flex-col overflow-hidden selection:bg-primary selection:text-white">
      {/* Background Blobs */}
      <div className="fixed top-0 left-0 w-[100vw] h-[100vh] -z-10 overflow-hidden pointer-events-none">
        <div className="absolute rounded-full filter blur-[80px] opacity-60 animate-[blob_10s_infinite] top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[rgba(19,236,55,0.2)] dark:bg-[rgba(19,236,55,0.15)] [animation-delay:0s]"></div>
        <div className="absolute rounded-full filter blur-[80px] opacity-60 animate-[blob_10s_infinite] top-[20%] right-[-20%] w-[400px] h-[400px] bg-[rgba(14,165,233,0.2)] dark:bg-[rgba(14,165,233,0.15)] [animation-delay:2s]"></div>
        <div className="absolute rounded-full filter blur-[80px] opacity-60 animate-[blob_10s_infinite] bottom-[-20%] left-[20%] w-[600px] h-[600px] bg-[rgba(168,85,247,0.15)] dark:bg-[rgba(168,85,247,0.1)] [animation-delay:4s]"></div>
      </div>

      <header className="h-20 bg-white/50 dark:bg-[#05140a]/60 backdrop-blur-xl flex items-center justify-between px-6 lg:px-10 z-30 sticky top-0 border-b border-white/20 dark:border-white/5 shadow-sm">
        <div className="flex items-center gap-4 lg:gap-8">
          <button className="lg:hidden p-2 rounded-xl hover:bg-white/50 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 transition-colors">
            <span className="material-symbols-outlined">menu</span>
          </button>
          
          <Link href="/admin" className="flex items-center gap-3 group cursor-pointer">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/40 rounded-xl blur-sm group-hover:blur-md transition-all duration-300"></div>
              <div className="relative bg-gradient-to-br from-primary/20 to-emerald-500/20 p-2 rounded-xl text-primary border border-primary/20">
                <span className="material-symbols-outlined text-3xl animate-[pulse-glow_2s_cubic-bezier(0.4,0,0.6,1)_infinite]">spa</span>
              </div>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight hidden sm:block">
              Sitoga<span className="bg-clip-text text-transparent bg-gradient-to-r from-[#13ec37] to-[#0ea5e9]">Admin</span>
            </h1>
          </Link>
          
          <div className="hidden md:flex items-center bg-white/45 dark:bg-[#1e3223]/40 backdrop-blur-sm border border-white/30 dark:border-white/5 rounded-2xl px-4 py-2.5 w-80 lg:w-96 focus-within:ring-2 focus-within:ring-primary/50 focus-within:bg-white/60 dark:focus-within:bg-black/40 transition-all">
            <span className="material-symbols-outlined text-slate-400">search</span>
            <input className="bg-transparent border-none outline-none text-sm ml-3 w-full placeholder-slate-400 focus:ring-0 text-slate-700 dark:text-slate-200" placeholder="Search plant species, ailments..." type="text"/>
          </div>
        </div>
        
        <div className="flex items-center gap-4 lg:gap-6">
          <button className="relative p-3 rounded-xl hover:bg-white/40 dark:hover:bg-white/10 transition-all text-slate-600 dark:text-slate-300 group">
            <span className="material-symbols-outlined group-hover:animate-bounce">notifications</span>
            <span className="absolute top-2 right-2 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-white dark:border-slate-900 animate-ping"></span>
            <span className="absolute top-2 right-2 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
          </button>
          
          <div className="flex items-center gap-3 pl-4 border-l border-slate-300 dark:border-slate-700/50">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold leading-none bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">Admin Utama</p>
              <p className="text-xs text-primary font-medium mt-1">Super Admin</p>
            </div>
            <div className="h-11 w-11 rounded-full p-0.5 bg-gradient-to-tr from-primary to-blue-500 shadow-lg shadow-primary/20">
              <div className="h-full w-full rounded-full bg-cover bg-center border-2 border-white dark:border-slate-900 bg-[url('https://ui-avatars.com/api/?name=Admin+Utama&background=1f8825&color=fff')]"></div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative z-20">
        <aside className="hidden lg:flex w-72 flex-col bg-white/50 dark:bg-[#05140a]/60 backdrop-blur-xl border-r border-white/30 dark:border-white/5 py-8 px-5 gap-3 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-gray-400/50 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent">
          
          <div className="mb-2 px-4 text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-slate-400"></span> Main Menu
          </div>
          
          <Link href="/admin" className="group flex items-center gap-4 px-4 py-3.5 rounded-2xl bg-primary/10 text-primary font-bold shadow-sm border border-primary/20 transition-all hover:shadow-md hover:scale-[1.02]">
            <span className="material-symbols-outlined filled drop-shadow-sm group-hover:scale-110 transition-transform">dashboard</span>
            Dashboard
            <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(19,236,55,0.8)]"></div>
          </Link>
          
          <Link href="/admin/tanaman" className="group flex items-center gap-4 px-4 py-3.5 rounded-2xl text-slate-600 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-white/5 transition-all hover:text-slate-900 dark:hover:text-white hover:pl-5">
            <span className="material-symbols-outlined group-hover:text-emerald-500 transition-colors">potted_plant</span>
            Data Tanaman
          </Link>
          
          <Link href="/admin/penyakit" className="group flex items-center gap-4 px-4 py-3.5 rounded-2xl text-slate-600 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-white/5 transition-all hover:text-slate-900 dark:hover:text-white hover:pl-5">
            <span className="material-symbols-outlined group-hover:text-orange-500 transition-colors">medical_services</span>
            Data Penyakit
          </Link>

          <Link href="/admin/gejala" className="group flex items-center gap-4 px-4 py-3.5 rounded-2xl text-slate-600 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-white/5 transition-all hover:text-slate-900 dark:hover:text-white hover:pl-5">
            <span className="material-symbols-outlined group-hover:text-red-500 transition-colors">healing</span>
            Data Gejala
          </Link>
          
          <div className="mt-8 mb-2 px-4 text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-slate-400"></span> Riwayat
          </div>

          <Link href="/admin/riwayat" className="group flex items-center gap-4 px-4 py-3.5 rounded-2xl text-slate-600 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-white/5 transition-all hover:text-slate-900 dark:hover:text-white hover:pl-5">
            <span className="material-symbols-outlined group-hover:text-blue-500 transition-colors">history</span>
            Log Diagnosa AI
          </Link>
          
          <div className="mt-auto pt-6">
            <Link href="/" className="w-full py-2 flex items-center justify-center gap-2 text-sm text-primary font-bold border border-primary/30 rounded-xl hover:bg-primary hover:text-white transition-all">
              <span className="material-symbols-outlined text-lg">public</span>
              Back to Public Site
            </Link>
          </div>
          
        </aside>

        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 lg:p-8 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-gray-400/50 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent">
          {children}
        </main>
        
      </div>
    </div>
  );
}
