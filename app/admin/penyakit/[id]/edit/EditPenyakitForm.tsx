"use client";

import { useTransition, useState, useRef, useEffect } from "react";
import { updatePenyakit } from "@/actions/penyakit";
import { useRouter } from "next/navigation";

interface SelectableItem {
  id: string;
  nama: string;
}

interface GejalaEntry {
  id: string;
  isWajib: boolean;
  bobot: number;
}

interface EditPenyakitFormProps {
  initialData: {
    id: string;
    nama: string;
    deskripsi: string | null;
    gejala: { gejalaId: string; isGejalaWajib: boolean; bobotGejala: number }[];
    tanamanObat: { tanamanId: string }[];
  };
  gejalaList: SelectableItem[];
  tanamanList: SelectableItem[];
}

/* ================================================================
   Reusable Combobox-style multi-select with tags
   ================================================================ */
function MultiSelect({
  items,
  selected,
  onToggle,
  placeholder,
  emptyLabel,
  accentColor,
  accentColorLight,
  icon,
}: {
  items: SelectableItem[];
  selected: string[];
  onToggle: (id: string) => void;
  placeholder: string;
  emptyLabel: string;
  accentColor: string;
  accentColorLight: string;
  icon: string;
}) {
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const filtered = items.filter((i) =>
    i.nama.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={wrapperRef} className="relative flex flex-col gap-3">
      <div
        className="flex flex-wrap items-center gap-2 min-h-[52px] px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white/50 dark:bg-white/5 cursor-text transition-all focus-within:ring-2 focus-within:border-transparent"
        style={{ ["--tw-ring-color" as string]: `${accentColor}50` }}
        onClick={() => { setIsOpen(true); }}
      >
        {selected.map((id) => {
          const item = items.find((i) => i.id === id);
          if (!item) return null;
          return (
            <span
              key={id}
              className="inline-flex items-center gap-1 pl-2.5 pr-1.5 py-1 rounded-lg text-xs font-semibold transition-all animate-[pop_0.2s_ease-out] cursor-pointer group hover:opacity-80"
              style={{
                backgroundColor: `${accentColor}20`,
                color: accentColorLight,
                border: `1px solid ${accentColor}30`,
              }}
              onClick={(e) => { e.stopPropagation(); onToggle(id); }}
            >
              <span className="material-symbols-outlined text-[14px] mr-0.5" style={{ color: accentColor }}>{icon}</span>
              {item.nama}
              <span className="material-symbols-outlined text-[14px] ml-0.5 opacity-60 group-hover:opacity-100 group-hover:rotate-90 transition-all">close</span>
            </span>
          );
        })}

        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onFocus={() => setIsOpen(true)}
          placeholder={selected.length === 0 ? placeholder : "Tambah lagi..."}
          className="flex-1 min-w-[120px] bg-transparent border-0 outline-none py-1 text-sm text-slate-900 dark:text-white placeholder:text-slate-400"
        />

        <span
          className={`material-symbols-outlined text-[20px] text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        >expand_more</span>
      </div>

      {isOpen && (
        <div
          className="absolute top-full left-0 right-0 z-50 mt-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0f1f12] shadow-xl dark:shadow-[0_20px_40px_rgba(0,0,0,0.5)] overflow-hidden animate-[slideDown_0.15s_ease-out]"
        >
          <div className="max-h-60 overflow-y-auto overscroll-contain hide-scrollbar">
            {filtered.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-slate-400 flex flex-col items-center gap-2">
                <span className="material-symbols-outlined text-3xl text-slate-300 dark:text-slate-600">
                  {items.length === 0 ? "inventory_2" : "search_off"}
                </span>
                <span>{items.length === 0 ? emptyLabel : `Tidak ada hasil untuk "${search}"`}</span>
              </div>
            ) : (
              filtered.map((item) => {
                const isSelected = selected.includes(item.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onToggle(item.id)}
                    className="flex items-center gap-3 w-full px-4 py-3 text-left transition-all hover:bg-slate-50 dark:hover:bg-white/5 group"
                  >
                    <div
                      className="w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all duration-200"
                      style={isSelected ? {
                        backgroundColor: accentColor,
                        borderColor: accentColor,
                        boxShadow: `0 0 8px ${accentColor}40`,
                      } : {
                        borderColor: "rgb(148 163 184)",
                      }}
                    >
                      <span
                        className={`material-symbols-outlined text-white text-[16px] transition-all duration-200 ${isSelected ? "scale-100 opacity-100" : "scale-0 opacity-0"}`}
                      >check</span>
                    </div>

                    <span
                      className="material-symbols-outlined text-[18px] transition-colors"
                      style={{ color: isSelected ? accentColor : "rgb(148 163 184)" }}
                    >{icon}</span>
                    <span className={`text-sm transition-colors ${
                      isSelected
                        ? "font-semibold"
                        : "text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white"
                    }`} style={isSelected ? { color: accentColorLight } : {}}>
                      {item.nama}
                    </span>

                    {isSelected && (
                      <span className="ml-auto text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: `${accentColor}20`, color: accentColorLight }}
                      >Dipilih</span>
                    )}
                  </button>
                );
              })
            )}
          </div>

          {items.length > 0 && (
            <div className="flex items-center justify-between px-4 py-2.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-white/[0.02]">
              <span className="text-xs text-slate-400">
                {filtered.length} dari {items.length} ditampilkan
              </span>
              {selected.length > 0 && (
                <span className="text-xs font-bold flex items-center gap-1" style={{ color: accentColorLight }}>
                  <span className="material-symbols-outlined text-[14px]">check_circle</span>
                  {selected.length} dipilih
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ================================================================
   Bobot selector (1-5 dots)
   ================================================================ */
function BobotSelector({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center gap-1.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          className="relative group"
          title={`Bobot ${n}`}
        >
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200 ${
              n <= value
                ? "bg-primary text-white shadow-[0_0_8px_rgba(31,136,37,0.4)] scale-105"
                : "bg-slate-100 dark:bg-slate-800 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
            }`}
          >
            {n}
          </div>
        </button>
      ))}
    </div>
  );
}

/* ================================================================
   Main Form
   ================================================================ */
export function EditPenyakitForm({ initialData, gejalaList, tanamanList }: EditPenyakitFormProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  // Initialize gejala entries from existing data
  const [selectedGejala, setSelectedGejala] = useState<GejalaEntry[]>(
    initialData.gejala.map((g) => ({
      id: g.gejalaId,
      isWajib: g.isGejalaWajib,
      bobot: g.bobotGejala,
    }))
  );
  const [selectedTanaman, setSelectedTanaman] = useState<string[]>(
    initialData.tanamanObat.map(t => t.tanamanId)
  );

  const selectedGejalaIds = selectedGejala.map((g) => g.id);

  const toggleGejala = (id: string) => {
    setSelectedGejala((prev) => {
      const exists = prev.find((g) => g.id === id);
      if (exists) return prev.filter((g) => g.id !== id);
      return [...prev, { id, isWajib: false, bobot: 1 }];
    });
  };

  const updateGejalaWajib = (id: string, isWajib: boolean) => {
    setSelectedGejala((prev) =>
      prev.map((g) => (g.id === id ? { ...g, isWajib } : g))
    );
  };

  const updateGejalaBobot = (id: string, bobot: number) => {
    setSelectedGejala((prev) =>
      prev.map((g) => (g.id === id ? { ...g, bobot } : g))
    );
  };

  const toggleTanaman = (id: string) => {
    setSelectedTanaman((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await updatePenyakit(initialData.id, formData);
      if (res.success) {
        router.push("/admin/penyakit");
        router.refresh();
      } else {
        alert(res.error || "Failed to update");
      }
    });
  };

  const inputClass = "w-full bg-white/50 dark:bg-white/5 border border-slate-300 dark:border-slate-600 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-slate-900 dark:text-white placeholder:text-slate-400";

  return (
    <>
      <style jsx global>{`
        @keyframes pop {
          0% { transform: scale(0.8); opacity: 0; }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes slideDown {
          0% { opacity: 0; transform: translateY(-8px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <form className="flex flex-col gap-8" onSubmit={handleSubmit}>
        {/* Hidden inputs for relation data */}
        <input type="hidden" name="gejalaData" value={JSON.stringify(selectedGejala)} />
        <input type="hidden" name="tanamanIds" value={JSON.stringify(selectedTanaman)} />

        {/* ===== SECTION 1: Detail Penyakit ===== */}
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-2 text-primary">
            <span className="material-symbols-outlined text-2xl">healing</span>
            <span className="text-sm font-bold uppercase tracking-wider">Detail Penyakit</span>
          </div>
          
          <div className="flex flex-col gap-2">
            <label htmlFor="nama" className="text-sm font-bold text-slate-700 dark:text-slate-300">
              Nama Penyakit <span className="text-red-500">*</span>
            </label>
            <input 
              required 
              defaultValue={initialData.nama} 
              name="nama" 
              id="nama" 
              placeholder="e.g. Asam Urat" 
              type="text" 
              className={inputClass} 
            />
          </div>
          
          <div className="flex flex-col gap-2">
            <label htmlFor="deskripsi" className="text-sm font-bold text-slate-700 dark:text-slate-300">
              Deskripsi Umum <span className="text-xs font-normal text-slate-400">(Opsional)</span>
            </label>
            <textarea 
              name="deskripsi" 
              id="deskripsi" 
              defaultValue={initialData.deskripsi || ""} 
              placeholder="Deskripsi..." 
              rows={4} 
              className={inputClass}
            ></textarea>
          </div>
        </div>

        <div className="h-px bg-gradient-to-r from-transparent via-slate-300 dark:via-slate-700 to-transparent w-full"></div>

        {/* ===== SECTION 2: Gejala ===== */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-primary">
              <span className="material-symbols-outlined text-2xl">symptoms</span>
              <span className="text-sm font-bold uppercase tracking-wider">Gejala Terkait</span>
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 -mt-1">Pilih gejala-gejala yang berkaitan dengan penyakit ini</p>

          <MultiSelect
            items={gejalaList}
            selected={selectedGejalaIds}
            onToggle={toggleGejala}
            placeholder="Ketik untuk cari gejala..."
            emptyLabel="Belum ada data gejala."
            accentColor="#1f8825"
            accentColorLight="#4ade80"
            icon="symptoms"
          />

          {/* Per-gejala settings */}
          {selectedGejala.length > 0 && (
            <div className="flex flex-col gap-2 mt-1">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Pengaturan per Gejala
              </p>
              <div className="flex flex-col gap-2">
                {selectedGejala.map((entry) => {
                  const item = gejalaList.find((g) => g.id === entry.id);
                  if (!item) return null;
                  return (
                    <div
                      key={entry.id}
                      className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-white/[0.03] transition-all"
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className="material-symbols-outlined text-[18px] text-primary shrink-0">symptoms</span>
                        <span className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{item.nama}</span>
                      </div>

                      <div className="flex items-center gap-5 sm:gap-6 flex-shrink-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">Bobot:</span>
                          <BobotSelector
                            value={entry.bobot}
                            onChange={(v) => updateGejalaBobot(entry.id, v)}
                          />
                        </div>

                        <label className="flex items-center gap-2 cursor-pointer select-none">
                          <span className="text-xs text-slate-500 dark:text-slate-400">Wajib</span>
                          <button
                            type="button"
                            role="switch"
                            aria-checked={entry.isWajib}
                            onClick={() => updateGejalaWajib(entry.id, !entry.isWajib)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 ${
                              entry.isWajib
                                ? "bg-primary"
                                : "bg-slate-300 dark:bg-slate-600"
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 rounded-full bg-white shadow-md transition-transform duration-200 ${
                                entry.isWajib ? "translate-x-6" : "translate-x-1"
                              }`}
                            />
                          </button>
                        </label>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="h-px bg-gradient-to-r from-transparent via-slate-300 dark:via-slate-700 to-transparent w-full"></div>

        {/* ===== SECTION 3: Tanaman Obat ===== */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-primary">
              <span className="material-symbols-outlined text-2xl">local_florist</span>
              <span className="text-sm font-bold uppercase tracking-wider">Tanaman Obat Terkait</span>
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 -mt-1">Pilih tanaman obat yang bisa mengobati penyakit ini</p>

          <MultiSelect
            items={tanamanList}
            selected={selectedTanaman}
            onToggle={toggleTanaman}
            placeholder="Ketik untuk cari tanaman..."
            emptyLabel="Belum ada data tanaman."
            accentColor="#059669"
            accentColorLight="#34d399"
            icon="eco"
          />
        </div>

        <div className="h-px bg-gradient-to-r from-transparent via-slate-300 dark:via-slate-700 to-transparent w-full"></div>

        {/* ===== SUBMIT ===== */}
        <div className="flex justify-end pt-2">
          <button
            disabled={isPending}
            type="submit"
            className="w-full md:w-auto px-8 py-4 bg-primary text-white rounded-xl font-bold hover:bg-primary-hover hover:shadow-[0_10px_20px_-5px_rgba(19,236,55,0.4)] transition-all flex items-center justify-center gap-2 text-lg active:scale-95 disabled:opacity-50"
          >
            <span className={`material-symbols-outlined ${isPending ? 'animate-spin' : ''}`}>
              {isPending ? 'progress_activity' : 'save'}
            </span>
            {isPending ? 'Memperbarui...' : 'Update Penyakit'}
          </button>
        </div>
      </form>
    </>
  );
}
