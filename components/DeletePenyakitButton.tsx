"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deletePenyakit } from "@/actions/penyakit";

export function DeletePenyakitButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this ailment? This action cannot be undone.")) {
      startTransition(async () => {
        const result = await deletePenyakit(id);
        if (result.success) {
          router.refresh();
        } else {
          alert(result.error || "Failed to delete ailment.");
        }
      });
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className={`p-2 hover:bg-white dark:hover:bg-slate-700 rounded-lg text-slate-400 hover:text-red-500 hover:shadow-sm transition-all inline-flex items-center justify-center ${isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
      title="Delete Ailment"
    >
      <span className="material-symbols-outlined text-lg">
        {isPending ? 'progress_activity' : 'delete'}
      </span>
    </button>
  );
}
