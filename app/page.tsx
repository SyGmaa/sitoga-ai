import Image from "next/image";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { getAllTanaman } from "@/actions/tanaman";

export default async function Home() {
  const result = await getAllTanaman();
  // limit to 3 for the featured section
  const plants = result.success && result.data ? result.data.slice(0, 3) : [];

  return (
    <div className="relative flex min-h-screen w-full flex-col group/design-root">
      <Navbar />

      <main className="flex-1 flex flex-col">
        {/* Hero Section */}
        <section className="relative h-[85vh] w-full overflow-hidden flex items-center justify-center">
          <div
            className="absolute inset-0 w-full h-full bg-cover bg-center animate-slow-zoom"
            style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCMp6BXMzmd_VAUg-meCYBH7Lzy6Uo0eqBX2EdpwfrrIlzJ8gbh4BQbrFqhtbLmgfBC4DGD-3lFXTFeAL88LUtkafI8V9aBl3cz4aeAm_o6WDo0Nq7RgwZjEEkGKG8Ta2DwnG71tnZZy3-cOPhCL9dr5r3XjTFWDPlw7nO9pgj8lYHAvstj2YCFZ-9EoqVfrI5zhOjuItsAapZtZ2y365s9AvFeh6qA0LwQMhKHSq9e0Tj6fFModUB_N7g7aPsSrQqr-MAKCH8I1A')" }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background-dark/80 via-background-dark/50 to-background-dark"></div>
          
          <div className="relative z-10 px-4 max-w-4xl mx-auto text-center flex flex-col items-center gap-6 md:gap-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card border-primary/30 text-primary text-xs font-bold tracking-wider uppercase mb-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              AI Powered System
            </div>
            <h1 className="text-white text-5xl md:text-7xl font-bold leading-[1.1] tracking-tight hero-text-shadow">
              Nature&apos;s Pharmacy,<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-400">AI Diagnosis</span>
            </h1>
            <p className="text-slate-200 text-lg md:text-xl font-light max-w-2xl leading-relaxed hero-text-shadow">
              Explore our campus collection and identify herbal remedies instantly. Just snap a photo to unlock centuries of botanical wisdom.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <Link href="/diagnosa" className="animate-pulse-glow flex items-center justify-center gap-3 cursor-pointer rounded-full h-14 px-8 bg-primary hover:bg-[#0fd630] text-background-dark text-base font-bold transition-all transform hover:scale-105">
                <span className="material-symbols-outlined">medical_services</span>
                <span>Mulai Konsultasi</span>
              </Link>
              <Link href="/peta" className="flex items-center justify-center gap-3 cursor-pointer rounded-full h-14 px-8 glass-card hover:bg-white/10 text-white text-base font-bold transition-all border border-white/20">
                <span className="material-symbols-outlined">map</span>
                <span>View Garden Map</span>
              </Link>
            </div>
          </div>
          
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-70 animate-bounce">
            <span className="text-xs uppercase tracking-widest text-white/60">Scroll</span>
            <span className="material-symbols-outlined text-white">keyboard_arrow_down</span>
          </div>
        </section>

        {/* Featured Plants Section */}
        <section className="py-24 px-6 md:px-10 bg-background-dark relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-900/20 rounded-full blur-[100px] pointer-events-none"></div>
          
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
              <div>
                <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">Top Medicinal Plants</h2>
                <p className="text-slate-400 max-w-lg text-lg">Discover the healing power of nature growing right on our campus grounds.</p>
              </div>
              <Link className="group flex items-center gap-2 text-primary font-bold hover:text-white transition-colors" href="/admin">
                View Collection
                <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {plants.map((plant) => {
                // Generate a quick fake tag list based on the khasiatUtama text
                const words = plant.khasiatUtama ? plant.khasiatUtama.split(',').map(s => s.trim().substring(0, 15)).filter(Boolean) : ["Healing"];
                const tags = words.length > 0 ? words.slice(0, 2) : ["Healing"];
                
                return (
                <Link key={plant.id} href={`/tanaman/${plant.id}`} className="group relative rounded-3xl overflow-hidden glass-card hover:border-primary/50 transition-all duration-300 hover:-translate-y-2 cursor-pointer h-full flex flex-col">
                  <div className="aspect-[4/3] w-full overflow-hidden bg-surface-dark relative">
                    {plant.gambarUrl ? (
                      <img 
                        alt={plant.namaLokal} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                        src={plant.gambarUrl}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="material-symbols-outlined text-6xl text-primary/30">local_florist</span>
                      </div>
                    )}
                  </div>
                  <div className="p-6 flex flex-col flex-grow">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-2xl font-bold text-white group-hover:text-primary transition-colors">{plant.namaLokal}</h3>
                      <span className="material-symbols-outlined text-primary opacity-0 group-hover:opacity-100 transition-opacity">arrow_outward</span>
                    </div>
                    <p className="text-slate-300 italic text-sm mb-4">{plant.namaLatin}</p>
                    <div className="mt-auto flex flex-wrap gap-2">
                       {tags.map((tag, idx) => (
                         <span key={idx} className={`px-3 py-1 rounded-full ${idx === 0 ? 'bg-surface-dark border border-white/10 text-xs text-primary font-medium' : 'bg-surface-dark border border-white/10 text-xs text-slate-300 font-medium'}`}>
                           {tag}
                         </span>
                       ))}
                    </div>
                  </div>
                </Link>
              )})}
              
              {plants.length === 0 && (
                <div className="col-span-full py-12 text-center text-slate-400 italic">
                  No plants added yet. Check back soon!
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Diagnosis Call to Action Section */}
        <section className="py-20 px-6 relative bg-background-dark">
          <div className="max-w-5xl mx-auto rounded-[2.5rem] bg-gradient-to-br from-[#1a331d] to-[#0f1f10] border border-[#234829] p-8 md:p-16 flex flex-col md:flex-row items-center gap-10 overflow-hidden relative">
            <div className="absolute -right-20 -top-20 w-80 h-80 bg-primary/10 rounded-full blur-[80px]"></div>
            
            <div className="flex-1 z-10 text-center md:text-left">
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">Ready to diagnose?</h2>
              <p className="text-slate-300 text-lg mb-8">Use our advanced AI tool to describe symptoms or scan any plant on campus and instantly retrieve its medicinal properties and usage guides.</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <Link href="/diagnosa" className="flex items-center justify-center gap-2 cursor-pointer rounded-full h-12 px-6 bg-primary hover:bg-[#0fd630] text-background-dark font-bold transition-all shadow-lg shadow-primary/20">
                  <span className="material-symbols-outlined">shutter_speed</span>
                  <span>Start Diagnosis</span>
                </Link>
                <button className="flex items-center justify-center gap-2 cursor-pointer rounded-full h-12 px-6 bg-transparent hover:bg-white/5 border border-white/20 text-white font-medium transition-all">
                  <span>How it works</span>
                </button>
              </div>
            </div>
            
            <div className="flex-1 w-full max-w-sm z-10 relative">
              <div className="aspect-[9/16] rounded-[2rem] bg-black border-4 border-slate-700 overflow-hidden relative shadow-2xl">
                <img alt="Phone screen showing plant scan" className="absolute inset-0 w-full h-full object-cover opacity-60" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAb6RjzApkVI_MviT6OeFEoxMI1_wMUCuVQ98pcB4DSeZqLC-i1FnnNjGrdVVApN-WeeOaTJZP4fRMMC1ECTy3gllDwBWUfRvEJ9Q8vsYK0v7AziYqhiDVcTd4PfUQWzvIsjcz7SAHhTNHENJRhfWWqVcs9WpvTuWHu6VcJf_Ja5Sdb7hWjtTX_qdT-voiPiWBYVhqKeQQC50YjN-iCltA-biawzyM9n-bpPVWD1uIFopWhL1ReD2svo-5qOJvaCZlQKEjgPpiU8g"/>
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
                  <div className="w-full h-64 border-2 border-primary/70 rounded-xl relative">
                    <div className="absolute top-0 left-0 w-full h-1 bg-primary shadow-[0_0_15px_#13ec37] animate-[scan_2s_ease-in-out_infinite]"></div>
                    <div className="absolute -top-3 -left-3 border-t-4 border-l-4 border-primary w-8 h-8 rounded-tl-lg"></div>
                    <div className="absolute -top-3 -right-3 border-t-4 border-r-4 border-primary w-8 h-8 rounded-tr-lg"></div>
                    <div className="absolute -bottom-3 -left-3 border-b-4 border-l-4 border-primary w-8 h-8 rounded-bl-lg"></div>
                    <div className="absolute -bottom-3 -right-3 border-b-4 border-r-4 border-primary w-8 h-8 rounded-br-lg"></div>
                  </div>
                  <div className="mt-6 bg-black/80 backdrop-blur-md rounded-xl p-4 w-full border border-white/10">
                    <div className="h-2 w-20 bg-slate-600 rounded-full mb-2"></div>
                    <div className="h-4 w-3/4 bg-primary/80 rounded-full mb-2"></div>
                    <div className="h-2 w-1/2 bg-slate-600 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Link href="/diagnosa" className="flex items-center justify-center size-14 rounded-full bg-primary text-background-dark shadow-[0_4px_20px_rgba(19,236,55,0.4)] hover:scale-110 transition-transform cursor-pointer">
          <span className="material-symbols-outlined text-3xl">qr_code_scanner</span>
        </Link>
      </div>
      
      <style>{`
        @keyframes scan {
            0% { top: 0%; opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { top: 100%; opacity: 0; }
        }
        .animate-\\[scan_2s_ease-in-out_infinite\\] {
           animation: scan 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
