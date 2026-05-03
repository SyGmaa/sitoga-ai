"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteTanaman } from "@/actions/tanaman";

export function DeleteTanamanButton({ id, name }: { id: string, name: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleDelete = () => {
    if (confirm(`Yakin ingin menghapus tanaman "${name}"? Data resep dan pantangan terkait juga akan terhapus.`)) {
      startTransition(async () => {
        const result = await deleteTanaman(id);
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
      title="Hapus Tanaman"
    >
      <span className="material-symbols-outlined text-lg">
        {isPending ? 'progress_activity' : 'delete'}
      </span>
    </button>
  );
}
