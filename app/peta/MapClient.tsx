"use client";

import React, { useEffect, useRef, useState } from "react";
import Script from "next/script";
import Link from "next/link";
import { useTheme } from "@/components/ThemeProvider";

// TypeScript declarations for window.L
declare global {
  interface Window {
    L: any;
  }
}

interface Plant {
  id: string;
  namaLokal: string;
  namaLatin: string;
  deskripsi: string;
  kandunganSenyawa: string;
  khasiatUtama: string;
  gambarUrl: string | null;
}

interface MapClientProps {
  plants: Plant[];
}

const centerLat = 0.3174182298149855;
const centerLng = 101.03762777478885;

const categories = [
  { id: "all", label: "Semua Tanaman", icon: "eco" },
  { id: "demam", label: "Demam & Flu", icon: "thermostat" },
  { id: "pencernaan", label: "Pencernaan", icon: "nutrition" },
  { id: "kulit", label: "Luka & Kulit", icon: "healing" },
  { id: "darah", label: "Darah & Gula", icon: "bloodtype" },
  { id: "saraf", label: "Nyeri & Saraf", icon: "psychology" }
];

export default function MapClient({ plants }: MapClientProps) {
  const { theme } = useTheme();
  
  const [leafletLoaded, setLeafletLoaded] = useState(false);
  const [leafletReady, setLeafletReady] = useState(false);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedPlantId, setSelectedPlantId] = useState<string | null>(null);
  const [mapStyle, setMapStyle] = useState<"default" | "satellite">("default");

  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const tileLayerRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);
  const centerMarkerRef = useRef<any>(null);

  // Dynamic filter categories logic
  const matchCategory = (plant: Plant, categoryId: string) => {
    if (categoryId === "all") return true;

    const content = `${plant.khasiatUtama} ${plant.deskripsi} ${plant.kandunganSenyawa} ${plant.namaLokal}`.toLowerCase();
    
    switch (categoryId) {
      case "demam":
        return /demam|panas|flu|batuk|pilek|anti-inflamasi|infeksi|radang|suhu|imun/i.test(content);
      case "pencernaan":
        return /lambung|pencernaan|maag|mual|diare|usus|perut|sembelit|pencahar|racun|cacing/i.test(content);
      case "kulit":
        return /kulit|luka|bakar|gatal|bisul|antiseptik|jamur|alergi|memar|kudis|eksem/i.test(content);
      case "darah":
        return /darah|hipertensi|diabetes|gula|kolesterol|jantung|tekanan|stroke|ginjal|kencing/i.test(content);
      case "saraf":
        return /nyeri|sakit kepala|pusing|pegal|lelah|relaksasi|insomnia|saraf|stress|tenang|kejang/i.test(content);
      default:
        return true;
    }
  };

  // Filtered list of plants based on search and category
  const filteredPlants = plants.filter((plant) => {
    const matchesSearch =
      plant.namaLokal.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plant.namaLatin.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = matchCategory(plant, selectedCategory);
    return matchesSearch && matchesCategory;
  });

  // 1. Load Leaflet Stylesheet dynamically on component mount
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  // 2. Initialize Leaflet Map once loaded
  useEffect(() => {
    if (!leafletLoaded || !mapRef.current || mapInstance.current) return;

    const L = window.L;
    if (!L) return;

    // Create Leaflet Map Instance
    const map = L.map(mapRef.current, {
      zoomControl: false, // Disabling default zoom control to add custom styled ones
      attributionControl: false
    }).setView([centerLat, centerLng], 17);

    mapInstance.current = map;

    // Add Scale Control
    L.control.scale({ position: "bottomright" }).addTo(map);

    // Add Attribution Control
    L.control.attribution({ position: "bottomright" }).addTo(map);

    setLeafletReady(true);

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [leafletLoaded]);

  // 3. Dynamic Map Tile Layer based on Dark / Light Theme or Satellite View
  useEffect(() => {
    if (!leafletReady || !mapInstance.current) return;

    const L = window.L;
    const map = mapInstance.current;

    // Remove existing tile layer if it exists
    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    let tileUrl = "";
    let attribution = "";

    if (mapStyle === "satellite") {
      tileUrl = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
      attribution = "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community";
    } else {
      const isDark = theme === "dark";
      tileUrl = isDark
        ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";
      attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';
    }

    const isSatellite = mapStyle === "satellite";
    tileLayerRef.current = L.tileLayer(tileUrl, {
      attribution,
      maxZoom: 20,
      maxNativeZoom: isSatellite ? 17 : 20,
      subdomains: "abcd"
    }).addTo(map);
  }, [theme, mapStyle, leafletReady]);

  // 4. Resize observer to handle map tile resizing issues
  useEffect(() => {
    if (!leafletReady || !mapInstance.current || !mapRef.current) return;

    const resizeObserver = new ResizeObserver(() => {
      if (mapInstance.current) {
        mapInstance.current.invalidateSize();
      }
    });

    resizeObserver.observe(mapRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [leafletReady]);

  // 5. Update Specimen Markers dynamically on filter changes
  useEffect(() => {
    if (!leafletReady || !mapInstance.current) return;

    const L = window.L;
    const map = mapInstance.current;

    // Initialize or clear layer group
    if (!markersLayerRef.current) {
      markersLayerRef.current = L.layerGroup().addTo(map);
    } else {
      markersLayerRef.current.clearLayers();
    }

    const layer = markersLayerRef.current;

    // A. Single Main Botanical Garden Pin (Teardrop Shape pointing down)
    const centerIcon = L.divIcon({
      className: "custom-center-marker",
      html: `
        <div class="relative flex flex-col items-center" style="width: 36px; height: 46px;">
          <!-- Pulsing Ring at the bottom tip of the pin -->
          <div class="absolute rounded-full border-4 border-emerald-500 animate-ping" style="width: 20px; height: 20px; bottom: -10px; left: 8px; opacity: 0.75; pointer-events: none; animation-duration: 2s; z-index: 1;"></div>
          <!-- Shadow under the tip -->
          <div class="absolute bg-black/35 rounded-full blur-[2px]" style="width: 16px; height: 5px; bottom: -2px; left: 10px; z-index: 2; transform: scaleX(1.2);"></div>
          <!-- The teardrop pin SVG -->
          <svg width="36" height="46" viewBox="0 0 36 46" fill="none" xmlns="http://www.w3.org/2000/svg" style="position: absolute; top: 0; left: 0; z-index: 10; filter: drop-shadow(0px 4px 6px rgba(0, 0, 0, 0.25));">
            <!-- Pin Body (Teardrop shape pointing down) -->
            <path d="M18 0C8.06 0 0 8.06 0 18C0 29.82 18 46 18 46C18 46 36 29.82 36 18C36 8.06 27.94 0 18 0Z" fill="#059669" stroke="#ffffff" stroke-width="2"/>
            <!-- Inner White Circle -->
            <circle cx="18" cy="17" r="10" fill="#ffffff"/>
          </svg>
          <!-- Material Symbols Outlined Icon (Leaf/Spa) positioned in the center of the white circle -->
          <span class="material-symbols-outlined text-[16px] text-emerald-600 font-bold absolute" style="top: 9px; left: 10px; z-index: 15; font-variation-settings: 'FILL' 1;">
            spa
          </span>
        </div>
      `,
      iconSize: [36, 46],
      iconAnchor: [18, 46],
      popupAnchor: [0, -46]
    });

    // HTML definition for the default overview popup listing all matching plants
    let defaultPopupHtml = `
      <div class="space-y-2 py-1 max-w-[240px] text-slate-800 dark:text-slate-200">
        <div class="flex items-center gap-2 border-b border-slate-100 dark:border-white/10 pb-1.5">
          <span class="material-symbols-outlined text-primary text-[20px]">forest</span>
          <h4 class="font-black text-sm text-slate-900 dark:text-white">Kebun Raya Universitas Riau</h4>
        </div>
        <p class="text-xs text-slate-500 dark:text-slate-400">Terdapat ${filteredPlants.length} tanaman obat teridentifikasi di lokasi ini.</p>
        <div class="space-y-1.5 max-h-[160px] overflow-y-auto pr-1 scrollbar-thin">
    `;

    filteredPlants.forEach(plant => {
      defaultPopupHtml += `
        <div class="flex items-center justify-between gap-3 text-xs py-1 border-b border-slate-100/50 dark:border-white/5 last:border-0">
          <div class="min-w-0 flex-1">
            <span class="font-bold text-slate-800 dark:text-white block truncate">${plant.namaLokal}</span>
            <span class="text-[9px] text-slate-400 dark:text-slate-500 italic block truncate">${plant.namaLatin}</span>
          </div>
          <a href="/tanaman/${plant.id}" class="text-[10px] bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded font-bold transition-colors">
            Lihat
          </a>
        </div>
      `;
    });

    if (filteredPlants.length === 0) {
      defaultPopupHtml += `
        <div class="text-xs text-slate-400 dark:text-slate-500 italic text-center py-2">
          Tidak ada spesimen tanaman obat yang cocok dengan filter aktif.
        </div>
      `;
    }

    defaultPopupHtml += `
        </div>
      </div>
    `;

    const centerMarker = L.marker([centerLat, centerLng], { icon: centerIcon })
      .bindPopup(defaultPopupHtml, { className: "custom-popup" })
      .addTo(layer);

    centerMarkerRef.current = centerMarker;

    // Reset popup back to the default list overview when closed
    centerMarker.on("popupclose", () => {
      centerMarker.bindPopup(defaultPopupHtml, { className: "custom-popup" });
    });

  }, [filteredPlants, leafletReady]);

  // Smooth Fly-to camera navigation when selecting plant from sidebar
  const flyToPlant = (plant: Plant) => {
    if (!mapInstance.current || !leafletReady || !centerMarkerRef.current) return;

    setSelectedPlantId(plant.id);

    // Pan camera to the single center coordinate
    mapInstance.current.flyTo([centerLat, centerLng], 18, {
      animate: true,
      duration: 1.2
    });

    // Create a specific detail popup content for this selected plant
    const popupDiv = document.createElement("div");
    popupDiv.className = "flex flex-col gap-2 max-w-[220px] text-slate-800 dark:text-slate-200";

    let imgHtml = "";
    if (plant.gambarUrl) {
      imgHtml = `<img src="${plant.gambarUrl}" alt="${plant.namaLokal}" class="w-full h-24 object-cover rounded-lg border border-slate-100 dark:border-white/10 mb-1" />`;
    }

    popupDiv.innerHTML = `
      ${imgHtml}
      <div>
        <h4 class="font-extrabold text-sm text-slate-900 dark:text-white leading-snug">${plant.namaLokal}</h4>
        <p class="text-[10px] text-emerald-600 dark:text-emerald-400 italic mb-1">${plant.namaLatin}</p>
        <p class="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-2 mb-2 leading-relaxed">${plant.khasiatUtama || plant.deskripsi}</p>
        <a href="/tanaman/${plant.id}" class="inline-flex items-center justify-center w-full gap-1.5 py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-primary text-white text-[11px] font-bold transition-all shadow-sm">
          <span>Lihat Detail</span>
          <span class="material-symbols-outlined text-[12px]">arrow_forward</span>
        </a>
      </div>
    `;

    const centerMarker = centerMarkerRef.current;
    
    // Bind specific popup and trigger it
    centerMarker.bindPopup(popupDiv, { className: "custom-popup" });
    
    setTimeout(() => {
      centerMarker.openPopup();
    }, 850);
  };

  // Recenter map coordinates to main garden center
  const recenterMap = () => {
    if (!mapInstance.current || !leafletReady) return;
    setSelectedPlantId(null);
    mapInstance.current.flyTo([centerLat, centerLng], 17, {
      animate: true,
      duration: 1.2
    });
  };

  return (
    <div className="relative flex flex-col md:flex-row w-full h-[calc(100vh-64px)] overflow-hidden">
      {/* Script dynamic loader */}
      <Script
        src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
        onLoad={() => setLeafletLoaded(true)}
        strategy="afterInteractive"
      />

      {/* Sidebar Panel */}
      <div
        className={`absolute md:relative z-20 top-0 left-0 h-full w-[340px] max-w-full bg-white/95 dark:bg-surface-dark/95 backdrop-blur-md shadow-2xl md:shadow-none border-r border-slate-200 dark:border-[#234829]/60 flex flex-col transition-transform duration-300 transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0 md:w-0 overflow-hidden"
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-5 border-b border-slate-100 dark:border-white/10 flex flex-col gap-1.5 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-500 text-[26px]">map</span>
              <h2 className="text-xl font-black text-slate-800 dark:text-white tracking-tight">Peta Kebun Raya</h2>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden flex items-center justify-center p-1 rounded-full bg-slate-100 dark:bg-background-dark/80 text-slate-500 hover:text-slate-800 dark:text-slate-300 dark:hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Eksplorasi koleksi tanaman obat Universitas Riau secara interaktif.
          </p>
        </div>

        {/* Search Input */}
        <div className="px-5 pt-4 pb-2">
          <div className="relative flex items-center">
            <span className="material-symbols-outlined absolute left-3 text-slate-400 dark:text-slate-500 text-[20px]">search</span>
            <input
              type="text"
              placeholder="Cari tanaman obat..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-10 pl-10 pr-8 bg-slate-50 dark:bg-background-dark/30 border border-slate-200 dark:border-leaf-700/60 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 text-slate-800 dark:text-slate-100"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            )}
          </div>
        </div>

        {/* Categories Badges (Scrollable) */}
        <div className="px-5 py-2">
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-2">Filter Khasiat</span>
          <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-leaf-700">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
                  selectedCategory === cat.id
                    ? "bg-emerald-600 border-emerald-600 text-white shadow-sm"
                    : "bg-slate-100 dark:bg-[#2d3b2f]/40 border-slate-200 dark:border-leaf-700/40 text-slate-600 dark:text-slate-300 hover:border-emerald-500/30"
                }`}
              >
                <span className="material-symbols-outlined text-[14px]">{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Plant Specimens List */}
        <div className="flex-1 overflow-y-auto px-5 py-2 space-y-3 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-leaf-700">
          <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">
            <span>Daftar Spesimen</span>
            <span>{filteredPlants.length} Spesimen</span>
          </div>

          {filteredPlants.length > 0 ? (
            filteredPlants.map((plant) => (
              <div
                key={plant.id}
                onClick={() => flyToPlant(plant)}
                className={`group p-3 rounded-xl border transition-all duration-200 cursor-pointer flex gap-3 ${
                  selectedPlantId === plant.id
                    ? "bg-emerald-500/10 dark:bg-emerald-500/5 border-emerald-500/50 shadow-md"
                    : "bg-slate-50/50 dark:bg-[#2d3b2f]/20 border-slate-100 dark:border-[#234829]/30 hover:border-emerald-500/30 hover:bg-slate-50 dark:hover:bg-[#2d3b2f]/35"
                }`}
              >
                {/* Image / Icon */}
                <div className="w-14 h-14 rounded-lg bg-slate-200 dark:bg-[#2d3b2f] overflow-hidden flex-shrink-0 flex items-center justify-center border border-slate-200 dark:border-white/5 relative">
                  {plant.gambarUrl ? (
                    <img src={plant.gambarUrl} alt={plant.namaLokal} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <span className="material-symbols-outlined text-emerald-500 text-[24px]">local_florist</span>
                  )}
                </div>

                {/* Details */}
                <div className="flex-grow min-w-0 flex flex-col justify-center">
                  <div className="flex items-start justify-between gap-1.5">
                    <h3 className="font-extrabold text-sm text-slate-800 dark:text-white leading-tight truncate group-hover:text-emerald-500 transition-colors">
                      {plant.namaLokal}
                    </h3>
                    <span className="material-symbols-outlined text-slate-400 group-hover:translate-x-0.5 transition-transform text-[16px] flex-shrink-0">
                      chevron_right
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 dark:text-slate-400 italic truncate mb-1">
                    {plant.namaLatin}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-300 line-clamp-1 leading-normal">
                    {plant.khasiatUtama || plant.deskripsi}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="py-8 text-center text-xs text-slate-400 dark:text-slate-500 italic">
              Tidak ada spesimen ditemukan.
            </div>
          )}
        </div>

        {/* Sidebar Info Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-white/10 bg-slate-50/50 dark:bg-background-dark/20 text-[10px] text-slate-400 dark:text-slate-500 text-center">
          Universitas Riau &copy; {new Date().getFullYear()} SITOBAT-AI
        </div>
      </div>

      {/* Floating Toggle Sidebar button on Mobile */}
      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="absolute z-20 top-4 left-4 flex items-center justify-center w-12 h-12 bg-white dark:bg-surface-dark border border-slate-200 dark:border-leaf-700/60 rounded-xl shadow-lg text-slate-700 dark:text-white hover:text-primary transition-all"
        >
          <span className="material-symbols-outlined text-[24px]">menu</span>
        </button>
      )}

      {/* Map Container Area */}
      <div className="flex-1 relative h-full w-full">
        {/* Loading Overlay */}
        {!leafletLoaded && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-background-light dark:bg-background-dark text-slate-500">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary mb-4"></div>
            <p className="text-sm font-medium">Mengunduh modul peta...</p>
          </div>
        )}

        {/* The Leaflet Canvas Map */}
        <div ref={mapRef} className="w-full h-full z-10" />

        {/* Floating Custom Actions Bar on Map */}
        <div className="absolute z-20 bottom-8 left-4 flex flex-col gap-2">
          {/* Map Style Toggle Button (Satellite / Standard) */}
          <button
            onClick={() => setMapStyle(mapStyle === "default" ? "satellite" : "default")}
            title={mapStyle === "default" ? "Tampilan Citra Satelit" : "Tampilan Peta Standar"}
            className={`flex items-center justify-center w-12 h-12 rounded-xl backdrop-blur-md shadow-lg border transition-all scale-100 hover:scale-105 active:scale-95 ${
              mapStyle === "satellite"
                ? "bg-emerald-600 border-emerald-600 text-white hover:bg-emerald-700"
                : "bg-white/95 dark:bg-surface-dark/95 border-slate-200 dark:border-[#234829]/60 text-slate-800 dark:text-white hover:bg-primary dark:hover:bg-primary hover:text-white dark:hover:text-background-dark"
            }`}
          >
            <span className="material-symbols-outlined text-[22px]">
              {mapStyle === "default" ? "satellite_alt" : "map"}
            </span>
          </button>

          {/* Recenter Button */}
          <button
            onClick={recenterMap}
            title="Pusatkan Kebun Raya"
            className="flex items-center justify-center w-12 h-12 rounded-xl bg-white/95 dark:bg-surface-dark/95 backdrop-blur-md shadow-lg border border-slate-200 dark:border-[#234829]/60 text-slate-800 dark:text-white hover:bg-primary dark:hover:bg-primary hover:text-white dark:hover:text-background-dark transition-all scale-100 hover:scale-105 active:scale-95"
          >
            <span className="material-symbols-outlined text-[22px]">center_focus_strong</span>
          </button>
        </div>
      </div>
    </div>
  );
}
