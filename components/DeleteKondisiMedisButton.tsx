"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteKondisiMedis } from "@/actions/kondisiMedis";

export function DeleteKondisiMedisButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleDelete = () => {
    if (confirm("Yakin ingin menghapus kondisi medis ini? Semua data pantangan terkait juga akan terhapus.")) {
      startTransition(async () => {
        const result = await deleteKondisiMedis(id);
        if (result.success) {
          router.refresh();
        } else {
          alert(result.error || "Failed to delete.");
        }
      });
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className={`p-2 hover:bg-white dark:hover:bg-slate-700 rounded-lg text-slate-400 hover:text-red-500 hover:shadow-sm transition-all inline-flex items-center justify-center ${isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
      title="Hapus Kondisi Medis"
    >
      <span className="material-symbols-outlined text-lg">
        {isPending ? 'progress_activity' : 'delete'}
      </span>
    </button>
  );
}
