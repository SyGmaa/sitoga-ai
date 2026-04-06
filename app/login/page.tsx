"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showTransition, setShowTransition] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (res?.error) {
        setError(res.error);
        setIsLoading(false);
      } else {
        // Show blooming transition on success
        setShowTransition(true);
        // Wait for animation before redirect
        setTimeout(() => {
          router.push("/admin");
          // optional: reload to clear cache/state if needed
          // router.refresh();
        }, 2500); // adjust based on bloom animation timing
      }
    } catch (err) {
      setError("Terjadi kesalahan sistem.");
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#0a0f0a] text-slate-100 min-h-screen flex flex-col overflow-hidden relative font-['Space_Grotesk']">
      
      {/* Bioluminescent glow backgrounds */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute rounded-full filter blur-[80px] opacity-15 bg-[#1f8825] w-[500px] h-[500px] -top-20 -left-20"></div>
        <div className="absolute rounded-full filter blur-[80px] opacity-15 bg-[#28432a] w-[400px] h-[400px] bottom-10 right-10"></div>
        <div className="absolute rounded-full filter blur-[80px] opacity-10 bg-[#1f8825] w-[300px] h-[300px] top-1/2 left-1/3"></div>
      </div>

      <header className="relative z-10 flex items-center justify-between px-6 py-6 lg:px-12 border-b border-white/5 bg-[#0a0f0a]/20 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="text-[#1f8825] flex items-center justify-center">
            <span className="material-symbols-outlined text-4xl">eco</span>
          </div>
          <div>
            <h1 className="text-lg font-bold leading-none tracking-tight text-slate-100">SITOBAT-AI UP</h1>
            <p className="text-xs text-[#1f8825] font-medium tracking-widest uppercase mt-1">Admin Portal</p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#1f8825]/10 border border-[#1f8825]/20">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#1f8825] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#1f8825]"></span>
            </span>
            <span className="text-[10px] font-bold text-[#1f8825] uppercase tracking-widest">System Online</span>
          </div>
        </div>
      </header>

      <main className="relative z-10 flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="bg-[#1d301e]/40 backdrop-blur-md border border-white/5 shadow-[0_8px_32px_0_rgba(0,0,0,0.8)] rounded-xl p-8 md:p-10 border-t border-t-white/10">
            
            <div className="mb-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#1f8825]/20 mb-4 border border-[#1f8825]/30">
                <span className="material-symbols-outlined text-[#1f8825] text-3xl">lock_person</span>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Admin Identity</h2>
              <p className="text-slate-400 text-sm tracking-wide">Enter credentials to access the secure botanical database.</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-center">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-[#1f8825] uppercase tracking-widest ml-1" htmlFor="email">Admin Email</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-slate-500 group-focus-within:text-[#1f8825] transition-colors">alternate_email</span>
                  </div>
                  <input 
                    className="block w-full pl-12 pr-4 py-4 bg-[#0a0f0a]/60 border border-white/10 rounded-lg text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-[#1f8825] focus:border-[#1f8825] transition-all duration-300 focus:shadow-[0_0_15px_rgba(31,136,37,0.4)]" 
                    id="email" 
                    type="email" 
                    placeholder="admin@sitoga.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <label className="text-xs font-semibold text-[#1f8825] uppercase tracking-widest" htmlFor="password">Secure Password</label>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-slate-500 group-focus-within:text-[#1f8825] transition-colors">key</span>
                  </div>
                  <input 
                    className="block w-full pl-12 pr-4 py-4 bg-[#0a0f0a]/60 border border-white/10 rounded-lg text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-[#1f8825] focus:border-[#1f8825] transition-all duration-300 focus:shadow-[0_0_15px_rgba(31,136,37,0.4)]" 
                    id="password" 
                    type="password" 
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="pt-2">
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-3 py-4 bg-[#1f8825] hover:bg-[#1f8825]/90 text-white font-bold rounded-lg transition-all duration-300 transform active:scale-[0.98] hover:shadow-[0_0_20px_rgba(31,136,37,0.6)] disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <span className="material-symbols-outlined animate-spin shadow-none">progress_activity</span>
                  ) : (
                    <span className="material-symbols-outlined">psychiatry</span>
                  )}
                  <span className="tracking-widest uppercase text-sm">
                    {isLoading ? "Authenticating..." : "Initialize Access"}
                  </span>
                </button>
              </div>
            </form>

            <div className="mt-8 pt-6 border-t border-white/5 flex flex-col items-center gap-4">
              <p className="text-[10px] text-slate-500 font-medium tracking-[0.2em] uppercase text-center flex items-center justify-center">
                <span className="material-symbols-outlined text-[12px] mr-1">gpp_maybe</span>
                Authorized Access Only
              </p>
            </div>

          </div>
        </div>
      </main>

      <footer className="relative z-10 p-6 text-center">
        <p className="text-[10px] text-slate-600 font-medium tracking-widest uppercase">
            © 2026 SITOBAT-AI. All Rights Reserved.
        </p>
      </footer>

      {/* Decorative side elements */}
      <div className="absolute bottom-10 left-10 opacity-20 hidden lg:block">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-4">
            <div className="h-[1px] w-12 bg-[#1f8825]"></div>
            <span className="text-[10px] font-bold text-[#1f8825] tracking-widest uppercase">Bio-Metric Layer Active</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="h-[1px] w-12 bg-[#1f8825]/30"></div>
            <span className="text-[10px] font-bold text-slate-500 tracking-widest uppercase">Encrypted Neural Link</span>
          </div>
        </div>
      </div>
      <div className="absolute top-1/2 right-10 -translate-y-1/2 opacity-10 hidden xl:block pointer-events-none">
        <div className="rotate-90 origin-right">
          <span className="text-6xl font-black text-white/10 uppercase tracking-[0.5em] whitespace-nowrap select-none">ADMINISTRATION</span>
        </div>
      </div>

      {/* FULL SCREEN TRANSITION COMPONENT ========================== */}
      <AnimatePresence>
        {showTransition && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="fixed inset-0 z-50 bg-[#221022] flex flex-col font-['Spline_Sans']"
          >
             {/* Background Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#110811] via-[#221022] to-[#2d1b2d] z-0"></div>
            
            {/* Ambient Particles */}
            <div className="absolute inset-0 z-0 overflow-hidden opacity-30 pointer-events-none">
                <motion.div 
                  initial={{ y: "100vh", opacity: 0}}
                  animate={{ y: "-10vh", opacity: [0, 0.8, 0] }}
                  transition={{ duration: 4, ease: "linear", repeat: Infinity }}
                  className="absolute left-1/4 w-2 h-2 bg-[#f042f0] rounded-full blur-[1px]" 
                />
                <motion.div 
                  initial={{ y: "100vh", opacity: 0}}
                  animate={{ y: "-10vh", opacity: [0, 0.8, 0] }}
                  transition={{ duration: 5, ease: "linear", repeat: Infinity, delay: 0.5 }}
                  className="absolute left-1/2 w-3 h-3 bg-[#f042f0] rounded-full blur-[2px]" 
                />
                <motion.div 
                  initial={{ y: "100vh", opacity: 0}}
                  animate={{ y: "-10vh", opacity: [0, 0.8, 0] }}
                  transition={{ duration: 6, ease: "linear", repeat: Infinity, delay: 1 }}
                  className="absolute right-1/4 w-1 h-1 bg-white rounded-full blur-[0.5px]" 
                />
                <motion.div 
                  initial={{ y: "100vh", opacity: 0}}
                  animate={{ y: "-10vh", opacity: [0, 0.6, 0] }}
                  transition={{ duration: 4, ease: "linear", repeat: Infinity, delay: 2 }}
                  className="absolute right-1/3 w-2 h-2 bg-[#f042f0]/50 rounded-full blur-[1px]" 
                />
                <motion.div 
                  initial={{ y: "100vh", opacity: 0}}
                  animate={{ y: "-10vh", opacity: [0, 0.7, 0] }}
                  transition={{ duration: 5, ease: "linear", repeat: Infinity, delay: 1.5 }}
                  className="absolute left-1/3 w-1.5 h-1.5 bg-[#f042f0]/70 rounded-full blur-[1px]" 
                />
            </div>

            <div className="relative z-10 flex flex-col h-full w-full">
              <motion.header 
                initial={{ opacity: 0.4 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
                className="flex items-center justify-between px-8 py-4"
              >
                <div className="flex items-center gap-3">
                  <div className="size-8 text-[#f042f0]">
                    <span className="material-symbols-outlined text-3xl">spa</span>
                  </div>
                  <h2 className="text-white text-lg font-bold tracking-wide">SITOBAT-AI Admin</h2>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-xs text-slate-400 font-mono">SECURE CONNECTION ESTABLISHED</div>
                  <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e]"></div>
                </div>
              </motion.header>

              <main className="flex-1 flex flex-col items-center justify-center relative">
                {/* The Bloom Container */}
                <div className="relative cursor-pointer group">
                  {/* Outer Glow / Halo */}
                  <motion.div 
                    animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#f042f0]/10 rounded-full blur-3xl"
                  />
                  <motion.div 
                    animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.7, 0.4] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-[#f042f0]/20 rounded-full blur-2xl"
                  />
                  
                  {/* Rotating Sacred Geometry Rings */}
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute top-1/2 left-1/2 -ml-[170px] -mt-[170px] w-[340px] h-[340px] rounded-full border border-[#f042f0]/20 opacity-60"
                  />
                  <motion.div 
                    animate={{ rotate: -360 }}
                    transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                    className="absolute top-1/2 left-1/2 -ml-[140px] -mt-[140px] w-[280px] h-[280px] rounded-full border border-dashed border-[#f042f0]/30 opacity-40"
                  />
                  
                  {/* The Blooming Flower SVG */}
                  <motion.div 
                    initial={{ scale: 0.7 }}
                    animate={{ scale: 1.1 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="relative z-10"
                  >
                    <svg className="drop-shadow-[0_0_30px_rgba(240,66,240,0.6)]" fill="none" height="200" viewBox="0 0 200 200" width="200" xmlns="http://www.w3.org/2000/svg">
                      {/* Base Petal - Center (blooms from closed to open) */}
                      <motion.path 
                        d="M100 160C100 160 60 140 60 100C60 60 100 40 100 40C100 40 140 60 140 100C140 140 100 160 100 160Z" 
                        fill="#482348" 
                        opacity="0.8"
                        initial={{ scaleY: 0.3, scaleX: 0.5 }}
                        animate={{ scaleY: 1, scaleX: 1 }}
                        transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
                        style={{ transformOrigin: "100px 160px" }}
                      />
                      
                      {/* Left Petal (blooms outward to the left) */}
                      <motion.path 
                        d="M100 160C100 160 40 130 40 90C40 50 100 50 100 50" 
                        fill="#673267" 
                        opacity="0.6"
                        initial={{ rotate: 0, scaleY: 0.2, scaleX: 0.3 }}
                        animate={{ rotate: -45, scaleY: 1, scaleX: 1 }}
                        transition={{ duration: 1.4, ease: "easeOut", delay: 0.5 }}
                        style={{ transformOrigin: "100px 160px" }}
                      />
                      
                      {/* Right Petal (blooms outward to the right) */}
                      <motion.path 
                        d="M100 160C100 160 160 130 160 90C160 50 100 50 100 50" 
                        fill="#673267" 
                        opacity="0.6"
                        initial={{ rotate: 0, scaleY: 0.2, scaleX: 0.3 }}
                        animate={{ rotate: 45, scaleY: 1, scaleX: 1 }}
                        transition={{ duration: 1.4, ease: "easeOut", delay: 0.5 }}
                        style={{ transformOrigin: "100px 160px" }}
                      />
                      
                      {/* Inner Glowing Petals (bloom with pulse) */}
                      <motion.g
                        initial={{ scaleY: 0, opacity: 0 }}
                        animate={{ 
                          scaleY: [0, 1.05, 1, 1.05, 1], 
                          opacity: [0, 1, 1, 1, 1] 
                        }}
                        transition={{ 
                          duration: 2, 
                          ease: "easeOut", 
                          delay: 0.8,
                          times: [0, 0.4, 0.6, 0.8, 1]
                        }}
                        style={{ transformOrigin: "100px 150px" }}
                      >
                        <path d="M100 150C100 150 75 120 75 90C75 60 100 50 100 50C100 50 125 60 125 90C125 120 100 150 100 150Z" fill="url(#paint0_linear)"></path>
                        <path d="M100 140C100 140 85 110 85 90C85 70 100 65 100 65C100 65 115 70 115 90C115 110 100 140 100 140Z" fill="#ffffff" fillOpacity="0.8"></path>
                      </motion.g>
                      
                      {/* Center Core (Pistil) - appears last with glow */}
                      <motion.circle 
                        initial={{ r: 0, opacity: 0 }}
                        animate={{ r: 5, opacity: [0, 1, 0.7, 1] }}
                        transition={{ duration: 1, delay: 1.5, ease: "easeOut" }}
                        cx="100" cy="90" fill="#fff" 
                        className="shadow-[0_0_10px_#fff]"
                      />
                      
                      <defs>
                        <linearGradient id="paint0_linear" x1="100" x2="100" y1="50" y2="150" gradientUnits="userSpaceOnUse">
                          <stop stopColor="#f042f0"></stop>
                          <stop offset="1" stopColor="#673267"></stop>
                        </linearGradient>
                      </defs>
                    </svg>
                  </motion.div>
                </div>

                {/* Blurred Background Cards (depth suggestion) */}
                <div className="absolute w-full h-full pointer-events-none opacity-20 blur-sm z-0 flex justify-between items-center px-20">
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.2 }}
                    transition={{ delay: 1 }}
                    className="w-64 h-96 bg-gradient-to-br from-[#482348] to-transparent rounded-xl border border-white/5 transform -rotate-6 translate-y-12"
                  />
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.2 }}
                    transition={{ delay: 1.2 }}
                    className="w-64 h-80 bg-gradient-to-bl from-[#2d1b2d] to-transparent rounded-xl border border-white/5 transform rotate-6 -translate-y-8"
                  />
                </div>

                {/* Text Status & Progress */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                  className="mt-12 flex flex-col items-center gap-4 z-20"
                >
                  <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-[#f042f0] to-white drop-shadow-sm tracking-tight text-center">
                    Blooming Entrance
                  </h1>
                  <div className="flex items-center gap-3">
                    <div className="size-4 animate-spin text-[#f042f0]">
                      <span className="material-symbols-outlined text-base">progress_activity</span>
                    </div>
                    <p className="text-slate-300 font-light text-lg tracking-wide">Initializing Garden Protocol...</p>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="w-64 h-1.5 bg-white/10 rounded-full mt-4 overflow-hidden relative">
                    <motion.div 
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 2.2, ease: "easeOut" }}
                      className="absolute inset-y-0 left-0 bg-[#f042f0] h-full rounded-full" 
                    />
                    <motion.div 
                      animate={{ left: ["-10%", "110%"] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute inset-y-0 bg-white/50 h-full w-2 blur-[2px]"
                    />
                  </div>
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="text-xs text-[#f042f0]/70 mt-1"
                  >
                    Biometric Match: 99.8%
                  </motion.p>
                </motion.div>
              </main>

              <footer className="p-6 flex justify-between items-end relative z-10">
                 <div className="flex gap-6">
                  <div className="bg-[#2d1b2d]/60 backdrop-blur-md border border-[#f042f0]/10 px-4 py-2 rounded-lg flex items-center gap-3">
                    <span className="material-symbols-outlined text-[#f042f0]">eco</span>
                    <div className="flex flex-col">
                      <span className="text-xs text-slate-400 uppercase tracking-wider">System Status</span>
                      <span className="text-sm font-medium text-white">Optimal</span>
                    </div>
                  </div>
                  <div className="bg-[#2d1b2d]/60 backdrop-blur-md border border-[#f042f0]/10 px-4 py-2 rounded-lg flex items-center gap-3">
                    <span className="material-symbols-outlined text-[#f042f0]">dataset</span>
                    <div className="flex flex-col">
                      <span className="text-xs text-slate-400 uppercase tracking-wider">Database</span>
                      <span className="text-sm font-medium text-white">Connected</span>
                    </div>
                  </div>
                </div>
                <div className="text-right opacity-60">
                  <p className="text-xs text-slate-500 font-mono">SESSION: ENCRYPTED</p>
                </div>
              </footer>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
