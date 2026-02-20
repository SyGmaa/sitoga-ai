"use client";

import { useState } from "react";
import { QRCodeModal } from "@/components/PlantQRCode";

interface QRButtonProps {
  plantId: string;
  plantName: string;
}

export function QRButton({ plantId, plantName }: QRButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-lg text-slate-400 hover:text-emerald-500 hover:shadow-sm transition-all inline-flex items-center justify-center"
        title="View QR Code"
      >
        <span className="material-symbols-outlined text-lg">qr_code_2</span>
      </button>

      <QRCodeModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        plantId={plantId}
        plantName={plantName}
      />
    </>
  );
}
