import Link from 'next/link';
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function AdminDashboardPage() {
  const totalPlants = await prisma.tanaman.count();
  const totalDiagnosis = await prisma.riwayatDiagnosa.count();
  
  // Fetch latest 3 history
  const recentDiagnosis = await prisma.riwayatDiagnosa.findMany({
    orderBy: { createdAt: "desc" },
    take: 3
  });

  return (
    <div className="flex flex-col gap-8 animate-[slide-up_0.5s_ease-out_forwards]">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">Dashboard Overview</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Welcome back, here's what's happening in the garden today.</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-white/45 dark:bg-[#1e3223]/40 backdrop-blur-sm border border-white/30 dark:border-white/5 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-white/80 dark:hover:bg-white/10 transition-colors flex items-center gap-2">
            <span className="material-symbols-outlined text-base">calendar_today</span> {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </button>
          <Link href="/admin/tanaman/baru" className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-primary/30 transition-all hover:scale-105 flex items-center gap-2">
            <span className="material-symbols-outlined text-base">add</span> New Entry
          </Link>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Left Column (Stats & Activity) */}
        <div className="flex-1 flex flex-col gap-8">
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-[slide-up_0.5s_ease-out_forwards] [animation-delay:0.1s]">
            
            <div className="bg-white/60 dark:bg-[#0a1e0f]/50 backdrop-blur-md border border-white/40 dark:border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.05)] dark:shadow-[0_4px_30px_rgba(0,0,0,0.3)] rounded-3xl p-6 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
              <div className="absolute -right-6 -top-6 w-32 h-32 bg-green-500/10 rounded-full filter blur-2xl group-hover:bg-green-500/20 transition-all"></div>
              <div className="flex items-center gap-4 mb-4">
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white shadow-lg shadow-green-500/30 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined">local_florist</span>
                </div>
                <div>
                  <h3 className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">Total Plants</h3>
                </div>
              </div>
              <p className="text-4xl font-extrabold text-slate-800 dark:text-white tracking-tight">{totalPlants}</p>
              <p className="text-xs text-slate-400 mt-2">Species documented in database</p>
            </div>

            <div className="bg-white/60 dark:bg-[#0a1e0f]/50 backdrop-blur-md border border-white/40 dark:border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.05)] dark:shadow-[0_4px_30px_rgba(0,0,0,0.3)] rounded-3xl p-6 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
              <div className="absolute -right-6 -top-6 w-32 h-32 bg-blue-500/10 rounded-full filter blur-2xl group-hover:bg-blue-500/20 transition-all"></div>
              <div className="flex items-center gap-4 mb-4">
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined">stethoscope</span>
                </div>
                <div>
                  <h3 className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">Diagnoses AI</h3>
                </div>
              </div>
              <p className="text-4xl font-extrabold text-slate-800 dark:text-white tracking-tight">{totalDiagnosis}</p>
              <p className="text-xs text-slate-400 mt-2">Historical consultations logged</p>
            </div>

            <div className="bg-white/60 dark:bg-[#0a1e0f]/50 backdrop-blur-md border border-white/40 dark:border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.05)] dark:shadow-[0_4px_30px_rgba(0,0,0,0.3)] rounded-3xl p-6 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
              <div className="absolute -right-6 -top-6 w-32 h-32 bg-orange-500/10 rounded-full filter blur-2xl group-hover:bg-orange-500/20 transition-all"></div>
              <div className="flex items-center gap-4 mb-4">
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-orange-400 to-amber-600 flex items-center justify-center text-white shadow-lg shadow-orange-500/30 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined">healing</span>
                </div>
                <div>
                  <h3 className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">Top Ailment</h3>
                </div>
              </div>
              <p className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight truncate">Batuk Pilek</p>
               {/* Hardcoding temporarily due to lack of grouped aggregation on JSON blobs in Prisma effectively */}
              <p className="text-xs text-slate-400 mt-2">Highest searched requested</p>
            </div>

          </div>

          {/* Recent Activity */}
          <div className="bg-white/60 dark:bg-[#0a1e0f]/50 backdrop-blur-md border border-white/40 dark:border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.05)] dark:shadow-[0_4px_30px_rgba(0,0,0,0.3)] rounded-3xl p-6 animate-[slide-up_0.5s_ease-out_forwards] [animation-delay:0.2s]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">Diagnoses Activity</h3>
              <Link href="/admin/riwayat" className="text-sm text-primary font-bold hover:underline">View All</Link>
            </div>
            
            <div className="space-y-4">
              {recentDiagnosis.map(riwayat => (
                <div key={riwayat.id} className="flex items-start gap-4 p-3 rounded-2xl hover:bg-white/40 dark:hover:bg-white/5 transition-colors cursor-pointer group">
                  <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0 group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-xl">medical_services</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <p className="text-sm font-bold text-slate-800 dark:text-white">
                        {
                          // Cast hasilDiagnosa appropriately. Assume its an object mapping to our output format
                          (riwayat.hasilDiagnosa as any)?.nama_penyakit || "Penyakit Tidak Diketahui"
                        }
                      </p>
                      <span className="text-xs text-slate-400">
                        {riwayat.createdAt.toLocaleDateString('id-ID', { dateStyle: 'medium' })}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5 max-w-lg truncate">User searched recommendation for <span className="text-slate-700 dark:text-slate-300 font-medium">"{riwayat.keluhanPengguna}"</span>.</p>
                  </div>
                </div>
              ))}
              
              {recentDiagnosis.length === 0 && (
                <p className="text-sm text-slate-500 italic">Belum ada aktivitas diagnosis.</p>
              )}
            </div>
          </div>

        </div>

        {/* Right Column (Tasks) */}
        <div className="hidden xl:flex w-80 flex-col gap-6 animate-[slide-up_0.5s_ease-out_forwards] [animation-delay:0.4s]">
          
          <div className="bg-white/60 dark:bg-[#0a1e0f]/50 backdrop-blur-md border border-white/40 dark:border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.05)] dark:shadow-[0_4px_30px_rgba(0,0,0,0.3)] rounded-3xl p-6 relative overflow-hidden text-white">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-400 opacity-90"></div>
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/20 rounded-full filter blur-3xl"></div>
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-lg">Garden Conditions</h3>
                  <p className="text-blue-100 text-sm">Blok A Taman Herbal</p>
                </div>
                <span className="material-symbols-outlined text-4xl text-yellow-300 animate-pulse">sunny</span>
              </div>
              <div className="flex items-end gap-2 mb-4">
                <span className="text-5xl font-extrabold">24°</span>
                <span className="text-xl mb-1 opacity-80">C</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="bg-white/20 rounded-xl p-2 flex flex-col items-center">
                  <span className="material-symbols-outlined text-blue-100 mb-1">humidity_percentage</span>
                  <span className="font-bold">65%</span>
                  <span className="text-xs text-blue-100">Humidity</span>
                </div>
                <div className="bg-white/20 rounded-xl p-2 flex flex-col items-center">
                  <span className="material-symbols-outlined text-blue-100 mb-1">water_drop</span>
                  <span className="font-bold">Optimal</span>
                  <span className="text-xs text-blue-100">Soil</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/60 dark:bg-[#0a1e0f]/50 backdrop-blur-md border border-white/40 dark:border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.05)] dark:shadow-[0_4px_30px_rgba(0,0,0,0.3)] rounded-3xl p-6">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-4">Upcoming Tasks</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/40 dark:bg-white/5 border border-white/50 dark:border-white/5 hover:border-primary/50 transition-colors cursor-pointer">
                <div className="h-2 w-2 rounded-full bg-red-500"></div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-800 dark:text-white">Water Fern Zone</p>
                  <p className="text-xs text-slate-500">Due in 2 hours</p>
                </div>
                <button className="text-slate-400 hover:text-primary transition-colors">
                  <span className="material-symbols-outlined">check_circle</span>
                </button>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/40 dark:bg-white/5 border border-white/50 dark:border-white/5 hover:border-primary/50 transition-colors cursor-pointer">
                <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-800 dark:text-white">Review Soil pH</p>
                  <p className="text-xs text-slate-500">Due tomorrow</p>
                </div>
                <button className="text-slate-400 hover:text-primary transition-colors">
                  <span className="material-symbols-outlined">check_circle</span>
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
