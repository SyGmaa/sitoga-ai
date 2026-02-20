"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", icon: "home", label: "Home" },
  { href: "/diagnosa", icon: "medical_services", label: "Diagnosa" },
  { href: "/scan", icon: "qr_code_scanner", label: "Scan" },
  { href: "/admin", icon: "admin_panel_settings", label: "Admin" },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      {/* Gradient fade above the bar */}
      <div className="h-6 bg-linear-to-t from-[rgba(26,51,29,0.9)] to-transparent pointer-events-none" />
      
      {/* Nav bar */}
      <div className="bg-[rgba(26,51,29,0.85)] backdrop-blur-xl border-t border-[#234829]/80 px-2 pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-center justify-around h-16 max-w-md mx-auto">
          {navItems.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex flex-col items-center justify-center gap-0.5 px-3 py-2 rounded-2xl transition-all duration-300 ${
                  isActive
                    ? "text-primary"
                    : "text-slate-400 hover:text-slate-200 active:scale-95"
                }`}
              >
                {/* Active indicator glow */}
                {isActive && (
                  <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full bg-primary shadow-[0_0_12px_rgba(19,236,55,0.6)]" />
                )}
                <span
                  className={`material-symbols-outlined text-[24px] transition-all duration-300 ${
                    isActive ? "scale-110" : ""
                  }`}
                  style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
                >
                  {item.icon}
                </span>
                <span
                  className={`text-[10px] font-semibold tracking-wide transition-colors duration-300 ${
                    isActive ? "text-primary" : "text-slate-500"
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
