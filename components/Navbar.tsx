import Link from "next/link";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full glass-card border-b border-[#234829]/50 px-6 py-4 transition-all duration-300">
      <div className="mx-auto max-w-7xl flex items-center justify-between">
        <div className="flex items-center gap-3 text-white">
          <div className="flex items-center justify-center size-10 rounded-full bg-primary/10 text-primary">
            <span className="material-symbols-outlined text-3xl">eco</span>
          </div>
          <h2 className="text-white text-xl font-bold tracking-tight">Campus Botanical</h2>
        </div>
        <nav className="hidden md:flex items-center gap-8">
          <Link href="/" className="text-slate-200 hover:text-primary transition-colors text-sm font-medium">Home</Link>
          <Link href="/peta" className="text-slate-200 hover:text-primary transition-colors text-sm font-medium">Garden Map</Link>
          <Link href="/diagnosa" className="text-slate-200 hover:text-primary transition-colors text-sm font-medium">Diagnosis</Link>
          <Link href="/admin" className="text-slate-200 hover:text-primary transition-colors text-sm font-medium">Admin</Link>
        </nav>
        <div className="flex items-center gap-4">
          <Link href="/diagnosa" className="hidden sm:flex items-center gap-2 cursor-pointer rounded-full h-10 px-5 bg-primary hover:bg-[#0fd630] transition-colors text-background-dark text-sm font-bold shadow-[0_0_15px_rgba(19,236,55,0.3)]">
            <span className="material-symbols-outlined text-[20px]">qr_code_scanner</span>
            <span>Quick Scan</span>
          </Link>
          <button className="md:hidden text-white">
            <span className="material-symbols-outlined text-3xl">menu</span>
          </button>
        </div>
      </div>
    </header>
  );
}
