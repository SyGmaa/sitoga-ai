import Image from "next/image";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { notFound } from "next/navigation";
import { getTanamanById, getAllTanaman } from "@/actions/tanaman";

export default async function PlantDetailPage({ params }: { params: { id: string } }) {
  const result = await getTanamanById(params.id);
  
  if (!result.success || !result.data) {
    notFound();
  }

  const tanaman = result.data;
  const allPlantsResult = await getAllTanaman();
  const relatedPlants = allPlantsResult.success && allPlantsResult.data 
    ? allPlantsResult.data.filter(t => t.id !== tanaman.id).slice(0, 4) 
    : [];
  
  return (
    <div className="bg-background-light dark:bg-background-dark font-sans text-slate-900 dark:text-slate-100 min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow">
        <div className="layout-container flex flex-col items-center">
          <div className="w-full max-w-7xl px-4 md:px-10 py-8">
            
            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 text-sm text-[#92c99b] mb-6">
              <Link className="hover:text-primary" href="/">Library</Link>
              <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              <span className="text-white font-medium">{tanaman.namaLatin}</span>
            </div>
            
            {/* Hero Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-12">
              {/* Image Column */}
              <div className="relative group w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10 glass-card">
                {tanaman.gambarUrl ? (
                  <img 
                    alt={tanaman.namaLokal} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                    src={tanaman.gambarUrl}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-surface-dark/50">
                    <span className="material-symbols-outlined text-6xl text-primary/30">local_florist</span>
                  </div>
                )}
                
                <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md text-primary px-3 py-1.5 rounded-full flex items-center gap-2 text-xs font-bold uppercase tracking-wider border border-primary/20">
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
                    <span key={pt.penyakitId} className="inline-flex items-center px-3 py-1 rounded-full bg-surface-dark text-slate-300 text-xs font-medium border border-white/10">
                      {pt.penyakit.nama}
                    </span>
                  ))}
                </div>
                
                <h1 className="text-5xl md:text-6xl font-bold text-white mb-2 tracking-tight">{tanaman.namaLokal}</h1>
                <h2 className="text-xl md:text-2xl text-[#92c99b] italic font-light mb-6">{tanaman.namaLatin}</h2>
                
                <div className="flex flex-wrap items-center gap-4 mb-8">
                  <div className="flex items-center gap-2 bg-surface-dark px-4 py-2 rounded-full border border-[#234829] text-white">
                    <span className="material-symbols-outlined text-primary text-[20px]">location_on</span>
                    <span className="text-sm">{tanaman.lokasiTanam}</span>
                  </div>
                </div>
                
                <p className="text-slate-300 leading-relaxed text-lg mb-8 max-w-xl">
                  {tanaman.deskripsi}
                </p>
                
                <div className="flex flex-wrap gap-4">
                  <Link href="/peta" className="flex items-center justify-center gap-2 h-12 px-8 rounded-full bg-primary text-[#112214] text-base font-bold hover:bg-[#0fd630] transition-all shadow-[0_0_20px_rgba(19,236,55,0.3)] hover:shadow-[0_0_30px_rgba(19,236,55,0.5)]">
                    <span className="material-symbols-outlined">map</span>
                    Locate in Garden
                  </Link>
                  <button className="flex items-center justify-center gap-2 h-12 w-12 rounded-full bg-surface-dark border border-[#234829] text-white hover:border-primary hover:text-primary transition-all">
                    <span className="material-symbols-outlined">share</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Interactive Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
              
              {/* Left Column: Accordions */}
              <div className="lg:col-span-7 flex flex-col gap-4">
                <h3 className="text-2xl font-bold text-white mb-2">Botanical Details</h3>
                
                <details className="group bg-surface-dark border border-[#234829] rounded-xl open:border-primary/50 transition-all duration-300" open>
                  <summary className="flex cursor-pointer items-center justify-between p-6 list-none [&::-webkit-details-marker]:hidden">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-[#234829] rounded-full text-primary group-open:bg-primary group-open:text-[#112214] transition-colors">
                        <span className="material-symbols-outlined text-[24px]">spa</span>
                      </div>
                      <h4 className="text-lg font-bold text-white">Deskripsi</h4>
                    </div>
                    <span className="material-symbols-outlined text-slate-400 group-open:rotate-180 transition-transform duration-300">expand_more</span>
                  </summary>
                  <div className="px-6 pb-6 pt-0 text-slate-300 leading-relaxed border-t border-[#234829]/50 mt-2">
                    <p className="mb-4 pt-4 whitespace-pre-wrap">{tanaman.deskripsi}</p>
                  </div>
                </details>

                <details className="group bg-surface-dark border border-[#234829] rounded-xl open:border-primary/50 transition-all duration-300">
                  <summary className="flex cursor-pointer items-center justify-between p-6 list-none [&::-webkit-details-marker]:hidden">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-[#234829] rounded-full text-primary group-open:bg-primary group-open:text-[#112214] transition-colors">
                        <span className="material-symbols-outlined text-[24px]">science</span>
                      </div>
                      <h4 className="text-lg font-bold text-white">Kandungan Senyawa</h4>
                    </div>
                    <span className="material-symbols-outlined text-slate-400 group-open:rotate-180 transition-transform duration-300">expand_more</span>
                  </summary>
                  <div className="px-6 pb-6 pt-0 text-slate-300 leading-relaxed border-t border-[#234829]/50 mt-2">
                    <p className="mb-4 pt-4 whitespace-pre-wrap">{tanaman.kandunganSenyawa}</p>
                  </div>
                </details>

                <details className="group bg-surface-dark border border-[#234829] rounded-xl open:border-primary/50 transition-all duration-300">
                  <summary className="flex cursor-pointer items-center justify-between p-6 list-none [&::-webkit-details-marker]:hidden">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-[#234829] rounded-full text-primary group-open:bg-primary group-open:text-[#112214] transition-colors">
                        <span className="material-symbols-outlined text-[24px]">healing</span>
                      </div>
                      <h4 className="text-lg font-bold text-white">Khasiat Utama</h4>
                    </div>
                    <span className="material-symbols-outlined text-slate-400 group-open:rotate-180 transition-transform duration-300">expand_more</span>
                  </summary>
                  <div className="px-6 pb-6 pt-0 text-slate-300 leading-relaxed border-t border-[#234829]/50 mt-2">
                    <p className="pt-4 whitespace-pre-wrap">{tanaman.khasiatUtama}</p>
                  </div>
                </details>

              </div>

              {/* Right Column: Recipe Checklist */}
              <div className="lg:col-span-5">
                <div className="sticky top-24 bg-surface-dark rounded-2xl p-6 border border-[#234829] shadow-xl">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-bold text-white">Cara Pengolahan</h3>
                      <p className="text-sm text-[#92c99b]">Resep Pengobatan Tradisional</p>
                    </div>
                    <div className="p-2 bg-[#234829] rounded-lg text-white">
                      <span className="material-symbols-outlined text-[24px]">local_cafe</span>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {tanaman.resepPengolahan.length > 0 ? tanaman.resepPengolahan.map((resep, idx) => (
                      <label key={resep.id} className="group flex items-start gap-4 p-4 rounded-xl bg-background-dark/50 border border-transparent hover:border-primary/30 cursor-pointer transition-all has-[:checked]:bg-[#13ec37]/10 has-[:checked]:border-primary/50">
                        <input className="peer h-5 w-5 mt-0.5 rounded border-2 border-[#234829] bg-transparent text-primary focus:ring-0 focus:ring-offset-0 checked:border-primary checked:bg-primary transition-all cursor-pointer appearance-none checked:after:content-['✓'] checked:after:text-background-dark checked:after:font-bold checked:after:flex checked:after:items-center checked:after:justify-center checked:after:text-xs" type="checkbox"/>
                        <div className="flex flex-col">
                          <span className="text-white font-medium peer-checked:text-primary peer-checked:line-through transition-colors">Langkah {idx + 1}</span>
                          <span className="text-xs text-slate-400 mt-1 whitespace-pre-wrap">{resep.langkah}</span>
                        </div>
                      </label>
                    )) : (
                      <p className="text-slate-400 text-sm italic">Belum ada resep pengolahan tercatat untuk tanaman ini.</p>
                    )}
                  </div>
                </div>
              </div>

            </div>

            {/* Related Plants */}
            {relatedPlants.length > 0 && (
              <div className="mt-16 pt-10 border-t border-[#234829]">
                <h3 className="text-xl font-bold text-white mb-6">Related Medicinal Plants</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {relatedPlants.map(related => (
                    <Link key={related.id} href={`/tanaman/${related.id}`} className="group block relative rounded-2xl overflow-hidden aspect-[3/4] border border-[#234829]">
                      {related.gambarUrl ? (
                        <img 
                          alt={related.namaLokal} 
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                          src={related.gambarUrl}
                        />
                      ) : (
                        <div className="w-full h-full bg-surface-dark flex items-center justify-center transition-transform duration-500 group-hover:scale-110">
                          <span className="material-symbols-outlined text-4xl text-primary/30">local_florist</span>
                        </div>
                      )}
                      
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-5">
                        <h4 className="text-white font-bold group-hover:text-primary transition-colors text-lg">{related.namaLokal}</h4>
                        <p className="text-sm text-slate-300 italic">{related.namaLatin}</p>
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
    </div>
  );
}
