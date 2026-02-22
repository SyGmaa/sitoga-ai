"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateGejala } from "@/actions/gejala";

type GejalaInitialData = {
  id: string;
  nama: string;
};

export function EditGejalaForm({ initialData }: { initialData: GejalaInitialData }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await updateGejala(initialData.id, formData);
      if (result.success) {
        router.push("/admin/gejala");
        router.refresh();
      } else {
        alert(result.error || "Failed to update symptom.");
      }
    });
  };

  return (
    <form className="flex flex-col gap-8" onSubmit={handleSubmit}>
      <div className="flex flex-col gap-2">
        <label htmlFor="nama" className="text-sm font-bold text-slate-700 dark:text-slate-300">
          Nama Gejala
        </label>
        <input
          required
          defaultValue={initialData.nama}
          name="nama"
          id="nama"
          placeholder="e.g. Daun Menguning"
          type="text"
          className="w-full bg-transparent border border-slate-300 dark:border-slate-600 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-slate-900 dark:text-white"
        />
      </div>

      <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-4 pt-4">
        <button
          disabled={isPending}
          type="submit"
          className="w-full sm:w-auto px-8 py-4 bg-primary text-white rounded-xl font-bold hover:bg-primary-hover hover:shadow-[0_10px_20px_-5px_rgba(19,236,55,0.4)] transition-all flex items-center justify-center gap-2 text-lg active:scale-95 disabled:opacity-50"
        >
          <span className="material-symbols-outlined">
            {isPending ? 'progress_activity' : 'save'}
          </span>
          {isPending ? 'Updating...' : 'Update Symptom'}
        </button>
      </div>
    </form>
  );
}
