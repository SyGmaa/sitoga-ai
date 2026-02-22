"use client";

import { useEffect, useState } from "react";
import { getAiModels, toggleAiModelStatus, upsertAiModel, deleteAiModel } from "@/actions/models";

interface AiModel {
  id: string;
  provider: string;
  modelId: string;
  label: string;
  badge: string | null;
  isActive: boolean;
  isDefault: boolean;
}

export default function AdminModelsPage() {
  const [models, setModels] = useState<AiModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingModel, setEditingModel] = useState<Partial<AiModel> | null>(null);
  const [showProviderDropdown, setShowProviderDropdown] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<string>("google");

  useEffect(() => {
    fetchModels();
  }, []);

  useEffect(() => {
    if (editingModel) {
      setSelectedProvider(editingModel.provider || "google");
    }
  }, [editingModel]);

  async function fetchModels() {
    setIsLoading(true);
    const data = await getAiModels();
    setModels(data as AiModel[]);
    setIsLoading(false);
  }

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    await toggleAiModelStatus(id, !currentStatus);
    fetchModels();
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this model?")) {
      await deleteAiModel(id);
      fetchModels();
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      provider: selectedProvider,
      modelId: formData.get("modelId") as string,
      label: formData.get("label") as string,
      badge: formData.get("badge") as string || null,
      isActive: formData.get("isActive") === "true",
      isDefault: formData.get("isDefault") === "true",
    };

    await upsertAiModel(data);
    setIsModalOpen(false);
    setEditingModel(null);
    fetchModels();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight">Kelola Model AI</h2>
          <p className="text-slate-500 mt-1 text-sm">Atur model AI yang tersedia untuk diagnosa.</p>
        </div>
        <button 
          onClick={() => { setEditingModel({}); setIsModalOpen(true); }}
          className="bg-primary text-background-dark px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:brightness-110 transition-all shadow-glow"
        >
          <span className="material-symbols-outlined">add</span>
          Tambah Model
        </button>
      </div>

      <div className="bg-white/50 dark:bg-emerald-950/20 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-white/5 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/20 dark:border-white/5">
                <th className="px-6 py-4 text-xs font-bold uppercase text-slate-400">Label / Name</th>
                <th className="px-6 py-4 text-xs font-bold uppercase text-slate-400">Provider</th>
                <th className="px-6 py-4 text-xs font-bold uppercase text-slate-400">Model ID</th>
                <th className="px-6 py-4 text-xs font-bold uppercase text-slate-400">Badge</th>
                <th className="px-6 py-4 text-xs font-bold uppercase text-slate-400">Status</th>
                <th className="px-6 py-4 text-xs font-bold uppercase text-slate-400 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10 dark:divide-white/5">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-slate-500 italic">Mencolokan kabel ke server...</td>
                </tr>
              ) : models.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-slate-500">Belum ada model yang ditambahkan.</td>
                </tr>
              ) : models.map((model) => (
                <tr key={model.id} className="hover:bg-primary/5 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800 dark:text-white">{model.label}</span>
                      {model.isDefault && (
                        <span className="bg-primary/20 text-primary text-[10px] px-2 py-0.5 rounded-full font-bold">DEFAULT</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <span className="material-symbols-outlined text-sm">{model.provider === 'google' ? 'google' : 'hub'}</span>
                      <span className="capitalize">{model.provider}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-mono text-slate-500 dark:text-slate-500 max-w-[200px] truncate">{model.modelId}</td>
                  <td className="px-6 py-4">
                    {model.badge ? (
                      <span className="bg-slate-200 dark:bg-white/5 text-slate-600 dark:text-slate-400 text-[10px] px-2 py-0.5 rounded-full font-bold">{model.badge}</span>
                    ) : "-"}
                  </td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => handleToggleStatus(model.id, model.isActive)}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold transition-all ${
                        model.isActive 
                          ? "bg-emerald-500/20 text-emerald-500" 
                          : "bg-red-500/20 text-red-500"
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${model.isActive ? "bg-emerald-500" : "bg-red-500"}`}></span>
                      {model.isActive ? "ACTIVE" : "INACTIVE"}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => { setEditingModel(model); setIsModalOpen(true); }}
                        className="p-2 text-slate-400 hover:text-primary transition-colors hover:bg-primary/10 rounded-lg"
                      >
                        <span className="material-symbols-outlined text-xl">edit</span>
                      </button>
                      <button 
                        onClick={() => handleDelete(model.id)}
                        className="p-2 text-slate-400 hover:text-red-500 transition-colors hover:bg-red-500/10 rounded-lg"
                      >
                        <span className="material-symbols-outlined text-xl">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Custom Modal for Add/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-white dark:bg-emerald-950 rounded-3xl shadow-2xl overflow-visible border border-white/10 w-full max-w-lg relative">
            <div className="px-8 py-6 border-b border-white/10 flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">{editingModel?.id ? "Edit Model" : "Tambah Model Baru"}</h3>
              <button onClick={() => { setIsModalOpen(false); setShowProviderDropdown(false); }} className="material-symbols-outlined text-slate-400 hover:text-primary transition-colors">close</button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 relative">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Provider</label>
                  <button
                    type="button"
                    onClick={() => setShowProviderDropdown(!showProviderDropdown)}
                    className="w-full flex items-center justify-between h-[46px] px-4 rounded-xl bg-slate-100 dark:bg-emerald-900/30 border border-white/10 hover:border-primary/40 transition-all group overflow-hidden"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="material-symbols-outlined text-primary !text-lg shrink-0">
                        {selectedProvider === 'google' ? 'smart_toy' : 'hub'}
                      </span>
                      <span className="capitalize text-slate-900 dark:text-white font-semibold text-sm">{selectedProvider}</span>
                    </div>
                    <span className={`material-symbols-outlined text-slate-400 text-lg transition-transform duration-300 ${showProviderDropdown ? 'rotate-180' : ''}`}>expand_more</span>
                  </button>

                  {showProviderDropdown && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setShowProviderDropdown(false)}></div>
                      <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-white dark:bg-emerald-900 border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden animate-[fadeIn_0.2s_ease-out]">
                        {['google', 'openrouter'].map((p) => (
                          <button
                            key={p}
                            type="button"
                            onClick={() => { setSelectedProvider(p); setShowProviderDropdown(false); }}
                            className={`w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-primary/10 transition-colors ${selectedProvider === p ? 'bg-primary/20 text-primary font-bold' : 'text-slate-600 dark:text-slate-200'}`}
                          >
                            <span className="material-symbols-outlined !text-lg">
                              {p === 'google' ? 'smart_toy' : 'hub'}
                            </span>
                            <span className="capitalize text-sm">{p}</span>
                            {selectedProvider === p && <span className="material-symbols-outlined ml-auto text-primary text-base">check_circle</span>}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Badge</label>
                  <input 
                    name="badge" 
                    defaultValue={editingModel?.badge || ""} 
                    placeholder="e.g. Recommended" 
                    className="w-full bg-slate-100 dark:bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/50 text-sm text-slate-900 dark:text-white placeholder-slate-500" 
                    type="text" 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Label / Name</label>
                <input 
                  name="label" 
                  defaultValue={editingModel?.label || ""} 
                  required 
                  placeholder="e.g. Gemini 3 Flash" 
                  className="w-full bg-slate-100 dark:bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/50 text-sm text-slate-900 dark:text-white placeholder-slate-500" 
                  type="text" 
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Model ID</label>
                <input 
                  name="modelId" 
                  defaultValue={editingModel?.modelId || ""} 
                  required 
                  placeholder="e.g. gemini-3-flash-preview" 
                  className="w-full bg-slate-100 dark:bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/50 text-sm text-slate-900 dark:text-white placeholder-slate-500 font-mono" 
                  type="text" 
                />
              </div>

              <div className="flex gap-6 pt-2">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative flex items-center">
                    <input type="checkbox" name="isActive" value="true" defaultChecked={editingModel?.isActive ?? true} className="peer w-5 h-5 opacity-0 absolute cursor-pointer" />
                    <div className="w-5 h-5 border-2 border-slate-300 dark:border-white/10 rounded-md peer-checked:bg-primary peer-checked:border-primary transition-all"></div>
                    <span className="material-symbols-outlined absolute text-background-dark text-lg scale-0 peer-checked:scale-100 transition-transform pointer-events-none">check</span>
                  </div>
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Active</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative flex items-center">
                    <input type="checkbox" name="isDefault" value="true" defaultChecked={editingModel?.isDefault || false} className="peer w-5 h-5 opacity-0 absolute cursor-pointer" />
                    <div className="w-5 h-5 border-2 border-slate-300 dark:border-white/10 rounded-md peer-checked:bg-primary peer-checked:border-primary transition-all"></div>
                    <span className="material-symbols-outlined absolute text-background-dark text-lg scale-0 peer-checked:scale-100 transition-transform pointer-events-none">check</span>
                  </div>
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Set as Default</span>
                </label>
              </div>

              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => { setIsModalOpen(false); setShowProviderDropdown(false); }} className="flex-1 px-6 py-3.5 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 font-bold text-slate-600 dark:text-slate-300 transition-all">Batal</button>
                <button type="submit" className="flex-1 px-6 py-3.5 rounded-xl bg-primary text-background-dark font-bold hover:shadow-glow-lg transition-all active:scale-95">Simpan Model</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
