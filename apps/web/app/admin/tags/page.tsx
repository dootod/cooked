"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface Tag {
  id: string;
  name: string;
  slug: string;
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function AdminTagsPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [error, setError] = useState("");

  async function load() {
    try {
      const data = await api.get<{ tags: Tag[] }>("/api/admin/tags");
      setTags(data.tags);
    } catch {}
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!newName.trim()) return;

    try {
      const { tag } = await api.post<{ tag: Tag }>("/api/admin/tags", {
        name: newName.trim(),
        slug: generateSlug(newName.trim()),
      });
      setTags((prev) => [...prev, tag]);
      setNewName("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur creation tag");
    }
  }

  async function handleUpdate(id: string) {
    setError("");
    if (!editName.trim()) return;

    try {
      const { tag } = await api.put<{ tag: Tag }>(`/api/admin/tags/${id}`, {
        name: editName.trim(),
        slug: generateSlug(editName.trim()),
      });
      setTags((prev) => prev.map((t) => (t.id === id ? tag : t)));
      setEditingId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur modification tag");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Supprimer ce tag ? Il sera retire de toutes les recettes associees.")) return;
    try {
      await api.delete(`/api/admin/tags/${id}`);
      setTags((prev) => prev.filter((t) => t.id !== id));
    } catch {}
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-[24px] font-serif font-bold text-text">Tags</h1>
        <span className="text-sm text-text-tertiary">{tags.length} tags</span>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 text-[13px] text-red-600 bg-red-50/80 border border-red-100 rounded-xl">
          {error}
        </div>
      )}

      {/* Create form */}
      <form onSubmit={handleCreate} className="flex gap-3 mb-6">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Nouveau tag..."
          className="flex-1 px-4 py-2.5 text-[14px] text-text bg-white/80 border border-border/50 rounded-xl outline-none transition-all duration-200 hover:border-primary/40 focus:border-primary focus:ring-[3px] focus:ring-primary/8 placeholder:text-text-tertiary/60"
        />
        <button
          type="submit"
          disabled={!newName.trim()}
          className="px-5 py-2.5 bg-gradient-to-r from-primary to-primary/90 text-white text-[13px] font-semibold rounded-xl shadow-[0_2px_12px_rgba(71,91,138,0.25)] hover:shadow-[0_4px_20px_rgba(71,91,138,0.35)] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          Ajouter
        </button>
      </form>

      {/* Tags list */}
      <div className="space-y-2">
        {tags.map((tag) => (
          <div
            key={tag.id}
            className="flex items-center gap-3 px-4 py-3 bg-white/80 border border-border/30 rounded-xl group"
          >
            {editingId === tag.id ? (
              <>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleUpdate(tag.id);
                    if (e.key === "Escape") setEditingId(null);
                  }}
                  autoFocus
                  className="flex-1 px-3 py-1.5 text-[14px] text-text bg-white border border-primary/40 rounded-lg outline-none focus:ring-[2px] focus:ring-primary/10"
                />
                <button
                  onClick={() => handleUpdate(tag.id)}
                  className="px-3 py-1.5 text-[12px] font-semibold text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors cursor-pointer"
                >
                  OK
                </button>
                <button
                  onClick={() => setEditingId(null)}
                  className="px-3 py-1.5 text-[12px] font-medium text-text-secondary border border-border/50 rounded-lg hover:bg-red-50 hover:text-red-500 transition-colors cursor-pointer"
                >
                  Annuler
                </button>
              </>
            ) : (
              <>
                <span className="flex-1 text-[14px] text-text font-medium">
                  #{tag.name}
                </span>
                <span className="text-[11px] text-text-tertiary font-mono">
                  {tag.slug}
                </span>
                <button
                  onClick={() => { setEditingId(tag.id); setEditName(tag.name); }}
                  className="opacity-0 group-hover:opacity-100 w-8 h-8 flex items-center justify-center rounded-lg text-text-tertiary hover:text-primary hover:bg-primary/5 transition-all cursor-pointer"
                  title="Modifier"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 20h9" />
                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                  </svg>
                </button>
                <button
                  onClick={() => handleDelete(tag.id)}
                  className="opacity-0 group-hover:opacity-100 w-8 h-8 flex items-center justify-center rounded-lg text-text-tertiary hover:text-red-500 hover:bg-red-50 transition-all cursor-pointer"
                  title="Supprimer"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
