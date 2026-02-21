import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { getAllTanaman } from "@/actions/tanaman";

export const metadata = {
  title: "Database Tanaman - Botanical Garden",
  description: "Jelajahi koleksi flora di kampus kami. Temukan manfaat, spesies, dan karakteristik unik dari setiap tanaman.",
};

export default async function PlantListPage() {
  const result = await getAllTanaman();
  const plants = result.success && result.data ? result.data : [];

  return (
    <div className="relative flex min-h-screen w-full flex-col group/design-root">
      <Navbar />

      <main className="flex-1 flex flex-col items-center w-full bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display">
        <div className="w-full max-w-7xl px-4 md:px-10 py-8 flex flex-col gap-8">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row justify-between items-end gap-6 pb-4 border-b border-[#28432a]/50">
            <div className="flex flex-col gap-2 max-w-2xl">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white">
                Database <span className="text-primary">Tanaman</span>
              </h1>
              <p className="text-[#99c29b] text-lg font-light leading-relaxed">
                Jelajahi koleksi flora di kampus kami. Temukan manfaat, spesies, dan karakteristik unik dari setiap tanaman.
              </p>
            </div>
            <div className="flex gap-2">
              <button className="group flex h-10 items-center justify-center gap-2 rounded-full border border-[#28432a] bg-[#1e2b1f] px-4 text-sm font-medium text-white hover:border-primary hover:text-primary transition-all">
                <span className="material-symbols-outlined text-[20px]">tune</span>
                <span>Filter Lanjutan</span>
              </button>
            </div>
          </div>

          {/* Search & Quick Filters */}
          <div className="flex flex-col gap-6">
            {/* Search Bar */}
            <div className="relative w-full max-w-3xl mx-auto">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-primary">
                <span className="material-symbols-outlined">search</span>
              </div>
              <input 
                className="block w-full rounded-full border-none bg-[#28432a]/50 py-4 pl-12 pr-4 text-white placeholder-[#99c29b] focus:ring-2 focus:ring-primary focus:bg-[#28432a] transition-all shadow-lg backdrop-blur-sm text-lg" 
                placeholder="Cari nama tanaman, spesies latin, atau manfaat..." 
                type="text"
              />
              <div className="absolute inset-y-0 right-2 flex items-center">
                <button className="bg-primary hover:bg-green-600 text-white rounded-full p-2 transition-colors">
                  <span className="material-symbols-outlined">arrow_forward</span>
                </button>
              </div>
            </div>

            {/* Category Pills (Horizontal Scroll) */}
            <div className="flex gap-3 overflow-x-auto pb-2 flex-wrap sm:flex-nowrap sm:scrollbar-hide justify-start md:justify-center">
              <button className="flex h-10 shrink-0 items-center gap-2 rounded-full bg-primary text-white px-5 transition-transform hover:scale-105 active:scale-95 shadow-glow">
                <span className="material-symbols-outlined text-[20px]">grid_view</span>
                <span className="text-sm font-bold">Semua</span>
              </button>
              <button className="flex h-10 shrink-0 items-center gap-2 rounded-full bg-[#28432a] text-white px-5 hover:bg-[#365738] transition-all hover:scale-105 active:scale-95">
                <span className="material-symbols-outlined text-[20px]">prescriptions</span>
                <span className="text-sm font-medium">Tanaman Obat</span>
              </button>
              <button className="flex h-10 shrink-0 items-center gap-2 rounded-full bg-[#28432a] text-white px-5 hover:bg-[#365738] transition-all hover:scale-105 active:scale-95">
                <span className="material-symbols-outlined text-[20px]">potted_plant</span>
                <span className="text-sm font-medium">Tanaman Hias</span>
              </button>
              <button className="flex h-10 shrink-0 items-center gap-2 rounded-full bg-[#28432a] text-white px-5 hover:bg-[#365738] transition-all hover:scale-105 active:scale-95">
                <span className="material-symbols-outlined text-[20px]">park</span>
                <span className="text-sm font-medium">Pohon Peneduh</span>
              </button>
              <button className="flex h-10 shrink-0 items-center gap-2 rounded-full bg-[#28432a] text-white px-5 hover:bg-[#365738] transition-all hover:scale-105 active:scale-95">
                <span className="material-symbols-outlined text-[20px]">stars</span>
                <span className="text-sm font-medium">Tanaman Langka</span>
              </button>
            </div>
          </div>

          {/* Plant Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pt-4">
            {plants.map((plant) => {
              const words = plant.khasiatUtama ? plant.khasiatUtama.split(',').map(s => s.trim().substring(0, 20)).filter(Boolean) : ["Herbal"];
              const tags = words.length > 0 ? words.slice(0, 2) : ["Herbal"];
              
              return (
                <div key={plant.id} className="group relative flex flex-col glass-card rounded-2xl overflow-hidden hover:-translate-y-2 hover:shadow-glow-hover transition-all duration-300 cursor-pointer border border-[#28432a]">
                  <div className="relative h-64 w-full overflow-hidden">
                    <div className="absolute top-3 right-3 z-10">
                      <button className="bg-black/40 hover:bg-primary backdrop-blur-md text-white rounded-full p-2 transition-colors">
                        <span className="material-symbols-outlined text-[20px]">favorite</span>
                      </button>
                    </div>
                    {plant.gambarUrl ? (
                      <img 
                        alt={plant.namaLokal} 
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" 
                        src={plant.gambarUrl}
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-[#1e2b1f] transition-transform duration-500 group-hover:scale-110">
                        <span className="material-symbols-outlined text-6xl text-primary/30">local_florist</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#132014] via-transparent to-transparent opacity-80"></div>
                  </div>
                  
                  <div className="p-5 flex flex-col gap-3 flex-1 bg-[#1e2b1f]/60 backdrop-blur-md">
                    <div>
                      <div className="flex justify-between items-start">
                        <h3 className="text-white text-xl font-bold leading-tight group-hover:text-primary transition-colors">{plant.namaLokal}</h3>
                        <span className="bg-primary/20 text-primary text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                          Tanaman
                        </span>
                      </div>
                      <p className="text-[#99c29b] text-sm italic mt-1 font-serif">{plant.namaLatin}</p>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mt-auto pt-2">
                      {tags.map((tag, idx) => (
                        <span key={idx} className="px-3 py-1 bg-[#28432a] text-white/80 text-xs rounded-full border border-white/5">
                          {tag}
                        </span>
                      ))}
                    </div>
                    
                    <div className="pt-3 border-t border-white/10 mt-2 flex justify-between items-center opacity-80 group-hover:opacity-100 transition-opacity">
                      <span className="text-xs text-[#99c29b] flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">location_on</span> {plant.lokasiTanam || "Zona Tak Dikenal"}
                      </span>
                      <Link href={`/tanaman/${plant.id}`} className="text-xs text-primary font-bold flex items-center gap-1 group/btn">
                        Detail <span className="material-symbols-outlined text-[14px] group-hover/btn:translate-x-1 transition-transform">arrow_forward</span>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {plants.length === 0 && (
              <div className="col-span-full py-12 text-center text-slate-400 italic font-medium">
                Belum ada tanaman di database.
              </div>
            )}
          </div>

          {/* Pagination */}
          {plants.length > 0 && (
            <div className="flex justify-center mt-8 pb-10">
              <button className="flex items-center gap-2 rounded-full bg-[#28432a] px-8 py-4 text-white hover:bg-primary transition-all shadow-lg hover:shadow-glow">
                <span className="font-bold">Muat Lebih Banyak</span>
                <span className="material-symbols-outlined animate-bounce">expand_more</span>
              </button>
            </div>
          )}
        </div>
      </main>

      <Footer />
      
      {/* Floating Action Button */}
      <div className="fixed bottom-24 md:bottom-6 right-6 z-50">
        <Link href="/scan" className="flex items-center justify-center size-14 rounded-full bg-primary text-background-dark shadow-[0_4px_20px_rgba(19,236,55,0.4)] hover:scale-110 transition-transform cursor-pointer">
          <span className="material-symbols-outlined text-3xl">qr_code_scanner</span>
        </Link>
      </div>

      <MobileBottomNav />
      
    </div>
  );
}
