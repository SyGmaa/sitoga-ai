"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/components/ThemeProvider";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="w-16 h-8 rounded-full bg-slate-200 dark:bg-leaf-800/50 animate-pulse" />;

  const isDark = theme === "dark";

  return (
    <button
      onClick={toggleTheme}
      className="relative flex items-center w-16 h-8 p-1 rounded-full cursor-pointer bg-slate-200 dark:bg-leaf-800/50 border border-slate-300/50 dark:border-leaf-700/50 transition-colors duration-300"
      aria-label="Toggle Theme"
    >
      {/* Background Glow */}
      <div className="absolute inset-0 rounded-full overflow-hidden">
        <AnimatePresence mode="wait">
          {isDark ? (
            <motion.div
              key="dark-glow"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-linear-to-r from-blue-900/20 to-purple-900/20"
            />
          ) : (
            <motion.div
              key="light-glow"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-linear-to-r from-amber-100/30 to-orange-100/30"
            />
          )}
        </AnimatePresence>
      </div>

      {/* Switch Knob */}
      <motion.div
        layout
        className="relative z-10 flex items-center justify-center w-6 h-6 rounded-full bg-white dark:bg-leaf-400 shadow-md"
        animate={{
          x: isDark ? 32 : 0,
        }}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 30,
        }}
      >
        <AnimatePresence mode="wait" initial={false}>
          {isDark ? (
            <motion.span
              key="moon"
              initial={{ scale: 0, rotate: -90 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 90 }}
              transition={{ duration: 0.2 }}
              className="material-symbols-outlined text-[16px] text-leaf-900"
            >
              dark_mode
            </motion.span>
          ) : (
            <motion.span
              key="sun"
              initial={{ scale: 0, rotate: 90 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: -90 }}
              transition={{ duration: 0.2 }}
              className="material-symbols-outlined text-[16px] text-amber-500"
            >
              light_mode
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>
      
      {/* Hidden Icons for Balance */}
      <div className="absolute inset-0 flex justify-between items-center px-2 pointer-events-none">
        <span className={`material-symbols-outlined text-[14px] transition-opacity duration-300 ${isDark ? 'opacity-0' : 'opacity-40 text-slate-500'}`}>
          light_mode
        </span>
        <span className={`material-symbols-outlined text-[14px] transition-opacity duration-300 ${isDark ? 'opacity-40 text-slate-400' : 'opacity-0'}`}>
          dark_mode
        </span>
      </div>
    </button>
  );
}
