import Image from "next/image";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { MobileBottomNav } from "@/components/MobileBottomNav";

import { notFound } from "next/navigation";
import { getTanamanById, getAllTanaman } from "@/actions/tanaman";

function parseRecipeBody(body: string) {
  const lines = body.split("\n").map(l => l.trim()).filter(Boolean);
  let bagian = "";
  let pengolahan = "";
  let pakai = "";
  let keamanan = "";

  for (const line of lines) {
    const cleanLine = line.replace(/^•\s*/, "").trim();
    if (cleanLine.startsWith("Bagian yang digunakan:")) {
      bagian = cleanLine.replace("Bagian yang digunakan:", "").trim();
    } else if (cleanLine.startsWith("Cara pengolahan:")) {
      pengolahan = cleanLine.replace("Cara pengolahan:", "").trim();
    } else if (cleanLine.startsWith("Cara pakai tradisional:")) {
      pakai = cleanLine.replace("Cara pakai tradisional:", "").trim();
    } else if (cleanLine.startsWith("Catatan keamanan:")) {
      keamanan = cleanLine.replace("Catatan keamanan:", "").trim();
    } else {
      if (cleanLine) {
        if (!pengolahan) pengolahan = cleanLine;
        else pengolahan += "\n" + cleanLine;
      }
    }
  }

  return { bagian, pengolahan, pakai, keamanan };
}

export default async function PlantDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await getTanamanById(id);
  
  if (!result.success || !result.data) {
    notFound();
  }

  const tanaman = result.data;
  const allPlantsResult = await getAllTanaman();
  const relatedPlants = allPlantsResult.success && allPlantsResult.data 
    ? allPlantsResult.data.filter(t => t.id !== tanaman.id).slice(0, 4) 
    : [];
  
  return (
    <div className="bg-background-light dark:bg-background-dark font-sans text-slate-800 dark:text-slate-100 min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow">
        <div className="layout-container flex flex-col items-center">
          <div className="w-full max-w-7xl px-4 md:px-10 py-8">
            
            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 text-sm text-leaf-600 dark:text-leaf-400 mb-6">
              <Link className="hover:text-primary" href="/">Library</Link>
              <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              <span className="text-slate-800 dark:text-white font-medium">{tanaman.namaLatin}</span>
            </div>
            
            {/* Hero Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-12">
              {/* Image Column */}
              <div className="relative group w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-lg dark:shadow-2xl ring-1 ring-slate-200/50 dark:ring-white/10 glass-card">
                {tanaman.gambarUrl ? (
                  <img 
                    alt={tanaman.namaLokal} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                    src={tanaman.gambarUrl}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-slate-100 dark:bg-surface-dark/50">
                    <span className="material-symbols-outlined text-6xl text-primary/30">local_florist</span>
                  </div>
                )}
                
                <div className="absolute top-4 right-4 bg-white/80 dark:bg-black/60 backdrop-blur-md text-primary px-3 py-1.5 rounded-full flex items-center gap-2 text-xs font-bold uppercase tracking-wider border border-primary/20 shadow-sm">
                  <span className="material-symbols-outlined text-[16px]">eco</span>
                  Medicinal
                </div>
              </div>

              {/* Info Column */}
              <div className="flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider border border-primary/20">
                    <span className="material-symbols-outlined text-[14px] filled">verified</span>
                    Verified Specimen
                  </span>
                  {tanaman.penyakitTerkait?.map(pt => (
                    <span key={pt.penyakitId} className="inline-flex items-center px-3 py-1 rounded-full bg-white dark:bg-surface-dark text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200 dark:border-white/10 shadow-xs">
                      {pt.penyakit.nama}
                    </span>
                  ))}
                </div>
                
                <h1 className="text-5xl md:text-6xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">{tanaman.namaLokal}</h1>
                <h2 className="text-xl md:text-2xl text-leaf-600 dark:text-leaf-400 italic font-light mb-6">{tanaman.namaLatin}</h2>
                
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-lg mb-8 max-w-xl">
                  {tanaman.deskripsi}
                </p>
                
                <div className="flex flex-wrap gap-4">
                  <Link href="/peta" className="flex items-center justify-center gap-2 h-12 px-8 rounded-full bg-primary text-white dark:text-leaf-900 text-base font-bold hover:bg-primary-hover transition-all shadow-[0_0_20px_rgba(19,236,55,0.3)] hover:shadow-[0_0_30px_rgba(19,236,55,0.5)]">
                    <span className="material-symbols-outlined">map</span>
                    Locate in Garden
                  </Link>
                  <button className="flex items-center justify-center gap-2 h-12 w-12 rounded-full bg-white dark:bg-surface-dark border border-slate-200 dark:border-leaf-700 text-slate-700 dark:text-white hover:border-primary dark:hover:border-primary hover:text-primary dark:hover:text-primary transition-all shadow-xs">
                    <span className="material-symbols-outlined">share</span>
                  </button>
                </div>

              </div>
            </div>

            {/* Interactive Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
              
              {/* Left Column: Accordions */}
              <div className="lg:col-span-7 flex flex-col gap-4">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Botanical Details</h3>
                
                <details className="group bg-white dark:bg-surface-dark border border-slate-200 dark:border-leaf-700 rounded-xl open:border-primary/50 open:ring-1 open:ring-primary/20 transition-all duration-300 shadow-xs" open>
                  <summary className="flex cursor-pointer items-center justify-between p-6 list-none [&::-webkit-details-marker]:hidden">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-slate-100 dark:bg-leaf-700 rounded-full text-primary group-open:bg-primary group-open:text-white dark:group-open:text-leaf-900 transition-colors">
                        <span className="material-symbols-outlined text-[24px]">spa</span>
                      </div>
                      <h4 className="text-lg font-bold text-slate-800 dark:text-white">Deskripsi</h4>
                    </div>
                    <span className="material-symbols-outlined text-slate-400 group-open:rotate-180 transition-transform duration-300">expand_more</span>
                  </summary>
                  <div className="px-6 pb-6 pt-0 text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-leaf-700/50 mt-2">
                    <p className="mb-4 pt-4 whitespace-pre-wrap">{tanaman.deskripsi}</p>
                  </div>
                </details>

                <details className="group bg-white dark:bg-surface-dark border border-slate-200 dark:border-leaf-700 rounded-xl open:border-primary/50 open:ring-1 open:ring-primary/20 transition-all duration-300 shadow-xs">
                  <summary className="flex cursor-pointer items-center justify-between p-6 list-none [&::-webkit-details-marker]:hidden">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-slate-100 dark:bg-leaf-700 rounded-full text-primary group-open:bg-primary group-open:text-white dark:group-open:text-leaf-900 transition-colors">
                        <span className="material-symbols-outlined text-[24px]">science</span>
                      </div>
                      <h4 className="text-lg font-bold text-slate-800 dark:text-white">Kandungan Senyawa</h4>
                    </div>
                    <span className="material-symbols-outlined text-slate-400 group-open:rotate-180 transition-transform duration-300">expand_more</span>
                  </summary>
                  <div className="px-6 pb-6 pt-0 text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-leaf-700/50 mt-2">
                    <p className="mb-4 pt-4 whitespace-pre-wrap">{tanaman.kandunganSenyawa}</p>
                  </div>
                </details>

                <details className="group bg-white dark:bg-surface-dark border border-slate-200 dark:border-leaf-700 rounded-xl open:border-primary/50 open:ring-1 open:ring-primary/20 transition-all duration-300 shadow-xs">
                  <summary className="flex cursor-pointer items-center justify-between p-6 list-none [&::-webkit-details-marker]:hidden">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-slate-100 dark:bg-leaf-700 rounded-full text-primary group-open:bg-primary group-open:text-white dark:group-open:text-leaf-900 transition-colors">
                        <span className="material-symbols-outlined text-[24px]">healing</span>
                      </div>
                      <h4 className="text-lg font-bold text-slate-800 dark:text-white">Khasiat Utama</h4>
                    </div>
                    <span className="material-symbols-outlined text-slate-400 group-open:rotate-180 transition-transform duration-300">expand_more</span>
                  </summary>
                  <div className="px-6 pb-6 pt-0 text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-leaf-700/50 mt-2">
                    <p className="pt-4 whitespace-pre-wrap">{tanaman.khasiatUtama}</p>
                  </div>
                </details>

              </div>

              {/* Right Column: Recipe Checklist */}
              <div className="lg:col-span-5">
                <div className="sticky top-24 bg-white dark:bg-surface-dark rounded-2xl p-6 border border-slate-200 dark:border-leaf-700 shadow-lg dark:shadow-xl">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white">Cara Pengolahan</h3>
                      <p className="text-sm text-leaf-600 dark:text-leaf-400">Resep Pengobatan Tradisional</p>
                    </div>
                    <div className="p-2 bg-slate-100 dark:bg-leaf-700 rounded-lg text-slate-700 dark:text-white">
                      <span className="material-symbols-outlined text-[24px]">local_cafe</span>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    {tanaman.resepPengolahan.length > 0 ? tanaman.resepPengolahan.map((resep, idx) => {
                      let title = `Resep ${idx + 1}`;
                      let body = resep.langkah;

                      if (resep.langkah.startsWith("Keluhan: ")) {
                        const lines = resep.langkah.split("\n");
                        title = lines[0].replace("Keluhan: ", "Untuk ");
                        body = lines.slice(1).join("\n");
                      }

                      const { bagian, pengolahan, pakai, keamanan } = parseRecipeBody(body);

                      return (
                        <div key={resep.id} className="relative group flex flex-col p-5 rounded-2xl bg-slate-50 dark:bg-background-dark/30 border border-slate-100 dark:border-leaf-700/50 hover:border-primary/40 dark:hover:border-primary/40 transition-all duration-300 shadow-xs hover:shadow-md overflow-hidden">
                          {/* Decorative subtle background glow on hover */}
                          <div className="absolute -inset-px bg-gradient-to-r from-primary/5 to-leaf-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 pointer-events-none" />

                          {/* Top Header Row */}
                          <div className="flex items-start justify-between gap-4 mb-3">
                            <div className="flex items-center gap-2">
                              <span className="material-symbols-outlined text-primary text-[20px] font-bold">medication</span>
                              <h4 className="text-sm font-extrabold text-slate-800 dark:text-white tracking-tight group-hover:text-primary transition-colors">
                                {title}
                              </h4>
                            </div>
                            
                            {bagian && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold border border-emerald-500/20">
                                <span className="material-symbols-outlined text-[12px]">eco</span>
                                {bagian}
                              </span>
                            )}
                          </div>

                          {/* Details Grid */}
                          <div className="space-y-3.5 text-xs mt-1">
                            {/* Pengolahan */}
                            {pengolahan && (
                              <div className="flex gap-2">
                                <div className="flex-shrink-0 mt-0.5 text-primary/80">
                                  <span className="material-symbols-outlined text-[16px]">soup_kitchen</span>
                                </div>
                                <div>
                                  <span className="block font-bold text-slate-500 dark:text-slate-400 text-[10px] uppercase tracking-wider mb-0.5">Cara Pengolahan</span>
                                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-xs">{pengolahan}</p>
                                </div>
                              </div>
                            )}

                            {/* Cara Pakai */}
                            {pakai && (
                              <div className="flex gap-2">
                                <div className="flex-shrink-0 mt-0.5 text-primary/80">
                                  <span className="material-symbols-outlined text-[16px]">local_cafe</span>
                                </div>
                                <div>
                                  <span className="block font-bold text-slate-500 dark:text-slate-400 text-[10px] uppercase tracking-wider mb-0.5">Cara Pakai Tradisional</span>
                                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-xs">{pakai}</p>
                                </div>
                              </div>
                            )}

                            {/* Keamanan */}
                            {keamanan && (
                              <div className="mt-2 p-3 rounded-xl bg-amber-500/10 dark:bg-amber-500/5 border border-amber-500/20 text-amber-800 dark:text-amber-300 flex gap-2">
                                <div className="flex-shrink-0 mt-0.5 text-amber-600 dark:text-amber-400">
                                  <span className="material-symbols-outlined text-[16px] font-bold">warning</span>
                                </div>
                                <div>
                                  <span className="block font-bold text-[9px] uppercase tracking-wider mb-0.5">Catatan Keamanan</span>
                                  <p className="text-[11px] leading-relaxed">{keamanan}</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    }) : (
                      <p className="text-slate-500 dark:text-slate-400 text-sm italic">Belum ada resep pengolahan tercatat untuk tanaman ini.</p>
                    )}
                  </div>
                </div>
              </div>

            </div>

            {/* Related Plants */}
            {relatedPlants.length > 0 && (
              <div className="mt-16 pt-10 border-t border-slate-200 dark:border-leaf-700">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Related Medicinal Plants</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {relatedPlants.map(related => (
                    <Link key={related.id} href={`/tanaman/${related.id}`} className="group block relative rounded-2xl overflow-hidden aspect-[3/4] border border-slate-200 dark:border-leaf-700 shadow-sm">
                      {related.gambarUrl ? (
                        <img 
                          alt={related.namaLokal} 
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                          src={related.gambarUrl}
                        />
                      ) : (
                        <div className="w-full h-full bg-slate-100 dark:bg-surface-dark flex items-center justify-center transition-transform duration-500 group-hover:scale-110">
                          <span className="material-symbols-outlined text-4xl text-primary/30">local_florist</span>
                        </div>
                      )}
                      
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-5">
                        <h4 className="text-white font-bold group-hover:text-primary transition-colors text-lg">{related.namaLokal}</h4>
                        <p className="text-sm text-slate-200 italic">{related.namaLatin}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
}
