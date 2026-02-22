"use client";

import { QRCodeSVG } from "qrcode.react";
import { useRef, useState, useEffect } from "react";
import { createPortal } from "react-dom";

interface PlantQRCodeProps {
  plantId: string;
  plantName: string;
  size?: number;
  showActions?: boolean;
}

export function PlantQRCode({
  plantId,
  plantName,
  size = 180,
  showActions = true,
}: PlantQRCodeProps) {
  const qrRef = useRef<HTMLDivElement>(null);
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const plantUrl = `${origin}/tanaman/${plantId}`;

  const handleDownload = () => {
    const svg = qrRef.current?.querySelector("svg");
    if (!svg) return;

    const canvas = document.createElement("canvas");
    const padding = 40;
    const labelHeight = 60;
    canvas.width = size + padding * 2;
    canvas.height = size + padding * 2 + labelHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const svgData = new XMLSerializer().serializeToString(svg);
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, padding, padding, size, size);

      ctx.fillStyle = "#1a1a1a";
      ctx.font = "bold 14px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(plantName, canvas.width / 2, size + padding + 28, canvas.width - 20);

      ctx.fillStyle = "#666666";
      ctx.font = "11px sans-serif";
      ctx.fillText(
        `sitoga-ai/tanaman/${plantId.slice(0, 8)}...`,
        canvas.width / 2,
        size + padding + 48,
        canvas.width - 20
      );

      const link = document.createElement("a");
      link.download = `qr-${plantName.replace(/\s+/g, "-").toLowerCase()}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  const handlePrint = () => {
    const svg = qrRef.current?.querySelector("svg");
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>QR Code - ${plantName}</title>
          <style>
            body { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; margin: 0; font-family: sans-serif; }
            .label { margin-top: 16px; font-size: 18px; font-weight: bold; color: #1a1a1a; }
            .url { margin-top: 8px; font-size: 12px; color: #666; }
            @media print { body { padding: 0; } }
          </style>
        </head>
        <body>
          ${svgData}
          <div class="label">${plantName}</div>
          <div class="url">${plantUrl}</div>
          <script>window.onload = () => { window.print(); window.close(); }</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  if (!origin) return null;

  return (
    <div className="flex flex-col items-center gap-3">
      <div ref={qrRef} className="bg-white p-5 rounded-xl shadow-lg">
        <QRCodeSVG
          value={plantUrl}
          size={size}
          level="M"
          bgColor="#ffffff"
          fgColor="#112214"
        />
      </div>

      <p className="text-[10px] text-slate-400 text-center truncate w-full max-w-[220px]">
        {plantUrl}
      </p>

      {showActions && (
        <div className="flex items-center gap-2">
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-surface-dark border border-leaf-700 text-white text-xs font-medium hover:border-primary hover:text-primary transition-all"
          >
            <span className="material-symbols-outlined text-[16px]">download</span>
            Download
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-surface-dark border border-leaf-700 text-white text-xs font-medium hover:border-primary hover:text-primary transition-all"
          >
            <span className="material-symbols-outlined text-[16px]">print</span>
            Print
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Modal for Admin page ───────────────────────────────────────────
interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  plantId: string;
  plantName: string;
}

export function QRCodeModal({ isOpen, onClose, plantId, plantName }: QRCodeModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0 }}>
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-background-dark border border-white/10 rounded-2xl p-6 shadow-2xl w-full max-w-xs overflow-hidden">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-white/10 transition-colors text-slate-400 hover:text-white z-10"
        >
          <span className="material-symbols-outlined text-xl">close</span>
        </button>

        <div className="text-center mb-4">
          <h3 className="text-lg font-bold text-white">QR Code</h3>
          <p className="text-sm text-slate-400 mt-0.5 truncate px-6">{plantName}</p>
        </div>

        <PlantQRCode plantId={plantId} plantName={plantName} size={160} />
      </div>
    </div>,
    document.body
  );
}
