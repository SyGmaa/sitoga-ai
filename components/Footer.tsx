import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-leaf-700 bg-background-dark py-10 px-6 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-2 text-white">
          <span className="material-symbols-outlined text-primary">eco</span>
          <span className="font-bold text-lg">AI SITOGA UP</span>
        </div>
        <div className="text-slate-500 text-sm">
          &copy; 2026 Skripsi gama. All rights reserved.
        </div>
        <div className="flex gap-6">
          <Link className="text-slate-400 hover:text-primary transition-colors" href="#"><span className="material-symbols-outlined">mail</span></Link>
          <Link className="text-slate-400 hover:text-primary transition-colors" href="#"><span className="material-symbols-outlined">public</span></Link>
        </div>
      </div>
    </footer>
  );
}
