"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ScanPage() {
  const router = useRouter();
  const scannerRef = useRef<HTMLDivElement>(null);
  const html5QrCodeRef = useRef<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(true);
  const [result, setResult] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const startScanner = async () => {
      try {
        const { Html5Qrcode } = await import("html5-qrcode");

        if (!mounted || !scannerRef.current) return;

        const scanner = new Html5Qrcode("qr-reader");
        html5QrCodeRef.current = scanner;

        await scanner.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
          },
          (decodedText) => {
            // Auto-redirect if it's an internal tanaman URL
            try {
              const url = new URL(decodedText);
              const path = url.pathname;
              if (path.startsWith("/tanaman/")) {
                setScanning(false);
                setResult(decodedText);
                scanner.stop().catch(() => {});
                router.push(path);
                return;
              }
            } catch {
              // Not a valid URL, check if it's a relative path
              if (decodedText.startsWith("/tanaman/")) {
                setScanning(false);
                setResult(decodedText);
                scanner.stop().catch(() => {});
                router.push(decodedText);
                return;
              }
            }

            // For non-tanaman URLs, just show the result
            setScanning(false);
            setResult(decodedText);
            scanner.stop().catch(() => {});
          },
          () => {} // ignore scan failures (no QR in frame)
        );
      } catch (err: any) {
        if (mounted) {
          setError(
            err?.message?.includes("NotAllowedError") || err?.message?.includes("Permission")
              ? "Izin kamera ditolak. Silakan aktifkan izin kamera di pengaturan browser."
              : "Tidak dapat mengakses kamera. Pastikan perangkat memiliki kamera."
          );
        }
      }
    };

    startScanner();

    return () => {
      mounted = false;
      if (html5QrCodeRef.current) {
        html5QrCodeRef.current.stop().catch(() => {});
      }
    };
  }, [router]);

  const handleRescan = async () => {
    setResult(null);
    setScanning(true);
    setError(null);

    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      const scanner = new Html5Qrcode("qr-reader");
      html5QrCodeRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          try {
            const url = new URL(decodedText);
            const path = url.pathname;
            if (path.startsWith("/tanaman/")) {
              setScanning(false);
              setResult(decodedText);
              scanner.stop().catch(() => {});
              router.push(path);
              return;
            }
          } catch {
            if (decodedText.startsWith("/tanaman/")) {
              setScanning(false);
              setResult(decodedText);
              scanner.stop().catch(() => {});
              router.push(decodedText);
              return;
            }
          }
          setScanning(false);
          setResult(decodedText);
          scanner.stop().catch(() => {});
        },
        () => {}
      );
    } catch {
      setError("Gagal memulai ulang scanner.");
    }
  };

  return (
    <div className="min-h-screen bg-background-dark flex flex-col items-center justify-center p-4 relative">
      {/* Back button */}
      <Link
        href="/"
        className="absolute top-6 left-6 flex items-center gap-2 text-slate-400 hover:text-white transition-colors z-10"
      >
        <span className="material-symbols-outlined">arrow_back</span>
        <span className="text-sm font-medium">Kembali</span>
      </Link>

      <div className="w-full max-w-sm flex flex-col items-center gap-6">
        {/* Title */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider mb-4">
            <span className="material-symbols-outlined text-[16px]">qr_code_scanner</span>
            Scanner
          </div>
          <h1 className="text-2xl font-bold text-white">Scan QR Code</h1>
          <p className="text-slate-400 text-sm mt-1">
            Arahkan kamera ke QR code tanaman
          </p>
        </div>

        {/* Scanner area */}
        <div className="w-full rounded-2xl overflow-hidden bg-black border border-[#234829] relative">
          {scanning && (
            <div className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center">
              <div className="w-[250px] h-[250px] relative">
                <div className="absolute -top-1 -left-1 border-t-4 border-l-4 border-primary w-10 h-10 rounded-tl-lg" />
                <div className="absolute -top-1 -right-1 border-t-4 border-r-4 border-primary w-10 h-10 rounded-tr-lg" />
                <div className="absolute -bottom-1 -left-1 border-b-4 border-l-4 border-primary w-10 h-10 rounded-bl-lg" />
                <div className="absolute -bottom-1 -right-1 border-b-4 border-r-4 border-primary w-10 h-10 rounded-br-lg" />
                <div className="absolute top-0 left-0 w-full h-1 bg-primary shadow-[0_0_15px_#13ec37] animate-scan" />
              </div>
            </div>
          )}
          <div id="qr-reader" ref={scannerRef} className="w-full" />
        </div>

        {/* Error state */}
        {error && (
          <div className="w-full p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm text-center">
            <span className="material-symbols-outlined text-xl mb-2 block">videocam_off</span>
            {error}
          </div>
        )}

        {/* Result state */}
        {result && !result.includes("/tanaman/") && (
          <div className="w-full p-4 rounded-xl bg-surface-dark border border-[#234829] text-center">
            <span className="material-symbols-outlined text-primary text-2xl mb-2 block">check_circle</span>
            <p className="text-white text-sm font-medium mb-1">QR Code terdeteksi</p>
            <p className="text-slate-400 text-xs break-all mb-4">{result}</p>
            <button
              onClick={handleRescan}
              className="flex items-center gap-2 mx-auto px-5 py-2 rounded-full bg-primary text-background-dark text-sm font-bold hover:bg-[#0fd630] transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">refresh</span>
              Scan Ulang
            </button>
          </div>
        )}

        {/* Redirecting state */}
        {result && result.includes("/tanaman/") && (
          <div className="w-full p-4 rounded-xl bg-primary/10 border border-primary/30 text-center">
            <span className="material-symbols-outlined text-primary text-2xl mb-2 block animate-spin">progress_activity</span>
            <p className="text-white text-sm font-medium">Membuka halaman tanaman...</p>
          </div>
        )}

        {/* Scan tip */}
        {scanning && !error && (
          <p className="text-slate-500 text-xs text-center">
            Posisikan QR code di dalam kotak hijau untuk memindai secara otomatis
          </p>
        )}
      </div>

      <style>{`
        @keyframes scan {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        .animate-scan {
          animation: scan 2s ease-in-out infinite;
          position: absolute;
        }
        #qr-reader video {
          border-radius: 0 !important;
          width: 100% !important;
        }
        #qr-reader {
          border: none !important;
        }
        #qr-reader img[alt="Info icon"],
        #qr-reader > div:last-child {
          display: none !important;
        }
      `}</style>
    </div>
  );
}
