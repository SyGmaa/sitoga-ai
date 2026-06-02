"use client";

import dynamic from "next/dynamic";

const MapClient = dynamic(() => import("./MapClient"), {
  ssr: false,
  loading: () => (
    <div className="flex-grow flex flex-col items-center justify-center min-h-[70vh] bg-background-light dark:bg-background-dark text-slate-500 dark:text-slate-400">
      <div className="relative flex items-center justify-center">
        <div className="animate-ping absolute inline-flex h-16 w-16 rounded-full bg-primary/20 opacity-75"></div>
        <div className="relative animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
      <p className="mt-6 text-lg font-medium animate-pulse">Memuat Peta Kebun Raya...</p>
    </div>
  ),
});

interface Plant {
  id: string;
  namaLokal: string;
  namaLatin: string;
  deskripsi: string;
  kandunganSenyawa: string;
  khasiatUtama: string;
  gambarUrl: string | null;
}

interface MapWrapperProps {
  plants: Plant[];
}

export default function MapWrapper({ plants }: MapWrapperProps) {
  return <MapClient plants={plants} />;
}
