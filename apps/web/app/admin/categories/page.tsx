"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  order: number;
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const inputClass =
  "w-full px-4 py-2.5 text-[14px] text-text bg-white/80 border border-border/50 rounded-xl outline-none transition-all duration-200 hover:border-primary/40 focus:border-primary focus:ring-[3px] focus:ring-primary/8 focus:bg-white placeholder:text-text-tertiary/60";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");

  async function load() {
    try {
      const { categories } = await api.get<{ categories: Category[] }>("/api/admin/categories");
      setCategories(categories);
    } catch {
      setCategories([]);
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    setSaving(true);
    await api.post("/api/admin/categories", {
      name: newName.trim(),
      slug: generateSlug(newName),
      description: newDescription || null,
    });
    setNewName("");
    setNewDescription("");
    setCreating(false);
    setSaving(false);
    await load();
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Supprimer la categorie « ${name} » ?`)) return;
    await api.delete(`/api/admin/categories/${id}`);
    setCategories((prev) => prev.filter((c) => c.id !== id));
  }

  async function handleSaveEdit(id: string) {
    if (!editName.trim()) return;
    await api.put(`/api/admin/categories/${id}`, {
      name: editName.trim(),
      description: editDescription || null,
    });
    setEditingId(null);
    await load();
  }

  return (
    <div className="admin-fade-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-[28px] font-bold text-text tracking-tight">Categories</h1>
          <p className="mt-1 text-[14px] text-text-secondary">
            {categories.length} categorie{categories.length !== 1 ? "s" : ""}
          </p>
        </div>
        {!creating && (
          <button
            onClick={() => setCreating(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary to-primary/90 text-white text-[13px] font-semibold rounded-xl shadow-[0_4px_16px_rgba(79,111,232,0.3)] hover:shadow-[0_8px_28px_rgba(79,111,232,0.4)] hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Nouvelle categorie
          </button>
        )}
      </div>

      {/* Create form */}
      {creating && (
        <div className="mb-5 admin-glass rounded-xl p-5 ring-2 ring-primary/20">
          <h2 className="text-[14px] font-semibold text-text mb-4">Nouvelle categorie</h2>
          <form onSubmit={handleCreate} className="space-y-3">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Nom (ex: Plat principal)"
              required
              autoFocus
              className={inputClass}
            />
            <input
              type="text"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              placeholder="Description (optionnelle)"
              className={inputClass}
            />
            <p className="text-[11px] text-text-tertiary font-mono">
              /{generateSlug(newName) || "..."}
            </p>
            <div className="flex gap-2 pt-1">
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 bg-gradient-to-r from-primary to-primary/90 text-white text-[13px] font-semibold rounded-xl shadow-[0_4px_12px_rgba(79,111,232,0.25)] hover:shadow-[0_8px_20px_rgba(79,111,232,0.35)] transition-all disabled:opacity-60 cursor-pointer"
              >
                {saving ? "..." : "Creer"}
              </button>
              <button
                type="button"
                onClick={() => setCreating(false)}
                className="px-4 py-2 text-[13px] font-medium text-text-secondary border border-border/50 rounded-xl hover:bg-primary/5 transition-all cursor-pointer"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 rounded-xl bg-white/40 animate-pulse" />
          ))}
        </div>
      ) : categories.length === 0 && !creating ? (
        <div className="admin-glass rounded-xl text-center py-16 px-8">
          <svg width="64" height="64" viewBox="0 0 80 80" fill="none" className="mx-auto mb-5 opacity-60">
            <rect x="8" y="12" width="28" height="24" rx="6" stroke="#4F6FE8" strokeWidth="1.5" />
            <rect x="44" y="12" width="28" height="24" rx="6" stroke="#FF8C69" strokeWidth="1.5" />
            <rect x="8" y="44" width="28" height="24" rx="6" stroke="#FF8C69" strokeWidth="1.5" />
            <rect x="44" y="44" width="28" height="24" rx="6" stroke="#4F6FE8" strokeWidth="1.5" strokeDasharray="4 3" />
            <path d="M58 52v14M51 59h14" stroke="#4F6FE8" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <h3 className="text-[16px] font-semibold text-text mb-1.5">Aucune categorie</h3>
          <p className="text-[13px] text-text-secondary mb-5">Commencez par en creer une.</p>
          <button
            onClick={() => setCreating(true)}
            className="px-5 py-2.5 bg-gradient-to-r from-primary to-primary/90 text-white text-[13px] font-semibold rounded-xl shadow-[0_4px_16px_rgba(79,111,232,0.3)] hover:shadow-[0_8px_24px_rgba(79,111,232,0.4)] transition-all cursor-pointer"
          >
            Creer une categorie
          </button>
        </div>
      ) : (
        <div className="admin-glass rounded-xl overflow-hidden divide-y divide-border/15">
          {categories.map((cat) => (
            <div key={cat.id} className="px-5 py-3.5 group hover:bg-primary/[0.02] transition-colors">
              {editingId === cat.id ? (
                <div className="space-y-3">
                  <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className={inputClass} autoFocus />
                  <input type="text" value={editDescription} onChange={(e) => setEditDescription(e.target.value)} placeholder="Description" className={inputClass} />
                  <div className="flex gap-2">
                    <button onClick={() => handleSaveEdit(cat.id)} className="px-4 py-1.5 bg-gradient-to-r from-primary to-primary/90 text-white text-[12px] font-semibold rounded-lg transition-all cursor-pointer">
                      Enregistrer
                    </button>
                    <button onClick={() => setEditingId(null)} className="px-3 py-1.5 text-[12px] font-medium text-text-secondary border border-border/50 rounded-lg hover:bg-primary/5 transition-all cursor-pointer">
                      Annuler
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-primary/8 flex items-center justify-center shrink-0">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4F6FE8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z" />
                        <path d="M7 7h.01" />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <span className="text-[13px] font-medium text-text">{cat.name}</span>
                      {cat.description && (
                        <p className="text-[11px] text-text-secondary mt-0.5 truncate">{cat.description}</p>
                      )}
                      <span className="text-[10px] text-text-tertiary font-mono">/{cat.slug}</span>
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0 ml-2 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => { setEditingId(cat.id); setEditName(cat.name); setEditDescription(cat.description ?? ""); }}
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-text-tertiary hover:text-primary hover:bg-primary/8 transition-all cursor-pointer"
                      title="Modifier"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(cat.id, cat.name)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-text-tertiary hover:text-red-500 hover:bg-red-50 transition-all cursor-pointer"
                      title="Supprimer"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
