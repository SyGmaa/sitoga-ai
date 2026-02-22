"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteGejala } from "@/actions/gejala";

export function DeleteGejalaButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this symptom? This action cannot be undone.")) {
      startTransition(async () => {
        const result = await deleteGejala(id);
        if (result.success) {
          router.refresh();
        } else {
          alert(result.error || "Failed to delete symptom.");
        }
      });
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className={`p-2 hover:bg-white dark:hover:bg-slate-700 rounded-lg text-slate-400 hover:text-red-500 hover:shadow-sm transition-all inline-flex items-center justify-center ${isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
      title="Delete Symptom"
    >
      <span className="material-symbols-outlined text-lg">
        {isPending ? 'progress_activity' : 'delete'}
      </span>
    </button>
  );
}
