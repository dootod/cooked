"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

interface Recipe {
  id: string;
  title: string;
  slug: string;
  status: "draft" | "published";
  difficulty: "easy" | "intermediate" | "hard";
  prepTime: number;
  cookTime: number;
  createdAt: string;
}

const difficultyLabel: Record<string, string> = {
  easy: "Facile",
  intermediate: "Moyen",
  hard: "Difficile",
};

const difficultyColor: Record<string, string> = {
  easy: "text-primary bg-primary/8",
  intermediate: "text-amber-600 bg-amber-50",
  hard: "text-red-500 bg-red-50",
};

export default function AdminRecettesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadRecipes() {
    try {
      const { recipes } = await api.get<{ recipes: Recipe[] }>("/api/admin/recipes");
      setRecipes(recipes);
    } catch {
      setRecipes([]);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadRecipes();
  }, []);

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Supprimer « ${title} » ? Cette action est irreversible.`)) return;
    await api.delete(`/api/admin/recipes/${id}`);
    setRecipes((prev) => prev.filter((r) => r.id !== id));
  }

  async function handleToggleStatus(recipe: Recipe) {
    const newStatus = recipe.status === "draft" ? "published" : "draft";
    await api.put(`/api/admin/recipes/${recipe.id}`, { status: newStatus });
    setRecipes((prev) =>
      prev.map((r) => (r.id === recipe.id ? { ...r, status: newStatus } : r))
    );
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  return (
    <div className="admin-fade-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-[28px] font-bold text-text tracking-tight">Recettes</h1>
          <p className="mt-1 text-[14px] text-text-secondary">
            {recipes.length} recette{recipes.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link
          href="/admin/recettes/nouveau"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary to-primary/90 text-white text-[13px] font-semibold rounded-xl shadow-[0_4px_16px_rgba(79,111,232,0.3)] hover:shadow-[0_8px_28px_rgba(79,111,232,0.4)] hover:-translate-y-0.5 transition-all duration-200"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Nouvelle recette
        </Link>
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 rounded-xl bg-white/40 animate-pulse" />
          ))}
        </div>
      ) : recipes.length === 0 ? (
        <div className="admin-glass rounded-xl text-center py-16 px-8">
          <svg width="64" height="64" viewBox="0 0 80 80" fill="none" className="mx-auto mb-5 opacity-60">
            <rect x="15" y="10" width="50" height="60" rx="6" stroke="#475B8A" strokeWidth="1.5" />
            <line x1="25" y1="25" x2="55" y2="25" stroke="#BEC8DC" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="25" y1="35" x2="50" y2="35" stroke="#BEC8DC" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="25" y1="45" x2="45" y2="45" stroke="#BEC8DC" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="57" cy="57" r="14" stroke="#FF8C69" strokeWidth="1.5" />
            <path d="M57 50v14M50 57h14" stroke="#FF8C69" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <h3 className="text-[16px] font-semibold text-text mb-1.5">Aucune recette</h3>
          <p className="text-[13px] text-text-secondary mb-5">Commencez par creer votre premiere recette.</p>
          <Link
            href="/admin/recettes/nouveau"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary to-primary/90 text-white text-[13px] font-semibold rounded-xl shadow-[0_4px_16px_rgba(79,111,232,0.3)] hover:shadow-[0_8px_24px_rgba(79,111,232,0.4)] transition-all"
          >
            Creer une recette
          </Link>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden sm:block admin-glass rounded-xl overflow-hidden overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/30">
                  <th className="px-5 py-3 text-left text-[10px] font-bold tracking-[0.08em] uppercase text-text-tertiary">Titre</th>
                  <th className="px-5 py-3 text-left text-[10px] font-bold tracking-[0.08em] uppercase text-text-tertiary">Statut</th>
                  <th className="px-5 py-3 text-left text-[10px] font-bold tracking-[0.08em] uppercase text-text-tertiary">Difficulte</th>
                  <th className="px-5 py-3 text-left text-[10px] font-bold tracking-[0.08em] uppercase text-text-tertiary">Temps</th>
                  <th className="px-5 py-3 text-left text-[10px] font-bold tracking-[0.08em] uppercase text-text-tertiary">Date</th>
                  <th className="px-5 py-3 text-right text-[10px] font-bold tracking-[0.08em] uppercase text-text-tertiary">Actions</th>
                </tr>
              </thead>
              <tbody>
                {recipes.map((recipe, i) => (
                  <tr
                    key={recipe.id}
                    className={`group hover:bg-primary/[0.02] transition-colors ${
                      i < recipes.length - 1 ? "border-b border-border/15" : ""
                    }`}
                  >
                    <td className="relative px-5 py-3.5">
                      <div className={`absolute left-0 top-2 bottom-2 w-[3px] rounded-r-full ${
                        recipe.status === "published" ? "bg-emerald-400" : "bg-accent/60"
                      }`} />
                      <p className="text-[13px] font-medium text-text group-hover:text-primary transition-colors">
                        {recipe.title}
                      </p>
                      <p className="text-[11px] text-text-tertiary mt-0.5 font-mono">/{recipe.slug}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-semibold ${
                        recipe.status === "published"
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-accent/10 text-accent"
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          recipe.status === "published" ? "bg-emerald-400" : "bg-accent"
                        }`} />
                        {recipe.status === "published" ? "Publie" : "Brouillon"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-semibold ${difficultyColor[recipe.difficulty]}`}>
                        {difficultyLabel[recipe.difficulty]}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="font-mono text-[12px] text-text-secondary">
                        {recipe.prepTime + recipe.cookTime} min
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-[12px] text-text-secondary font-mono">{formatDate(recipe.createdAt)}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex gap-1 justify-end sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                        <Link
                          href={`/admin/recettes/${recipe.id}/modifier`}
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-text-tertiary hover:text-primary hover:bg-primary/8 transition-all"
                          title="Modifier"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                        </Link>
                        <button
                          onClick={() => handleToggleStatus(recipe)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-text-tertiary hover:text-emerald-600 hover:bg-emerald-50 transition-all cursor-pointer"
                          title={recipe.status === "draft" ? "Publier" : "Depublier"}
                        >
                          {recipe.status === "draft" ? (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                              <circle cx="12" cy="12" r="3" />
                            </svg>
                          ) : (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                              <line x1="1" y1="1" x2="23" y2="23" />
                            </svg>
                          )}
                        </button>
                        <button
                          onClick={() => handleDelete(recipe.id, recipe.title)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-text-tertiary hover:text-red-500 hover:bg-red-50 transition-all cursor-pointer"
                          title="Supprimer"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="sm:hidden space-y-2">
            {recipes.map((recipe) => (
              <div key={recipe.id} className="admin-glass rounded-xl p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-[14px] font-medium text-text truncate">{recipe.title}</p>
                    <p className="text-[11px] text-text-tertiary font-mono mt-0.5">/{recipe.slug}</p>
                  </div>
                  <span className={`shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold ${
                    recipe.status === "published"
                      ? "bg-emerald-50 text-emerald-600"
                      : "bg-accent/10 text-accent"
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      recipe.status === "published" ? "bg-emerald-400" : "bg-accent"
                    }`} />
                    {recipe.status === "published" ? "Publie" : "Brouillon"}
                  </span>
                </div>
                <div className="flex items-center gap-3 mb-3">
                  <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-semibold ${difficultyColor[recipe.difficulty]}`}>
                    {difficultyLabel[recipe.difficulty]}
                  </span>
                  <span className="font-mono text-[11px] text-text-secondary">{recipe.prepTime + recipe.cookTime} min</span>
                  <span className="text-[11px] text-text-tertiary font-mono">{formatDate(recipe.createdAt)}</span>
                </div>
                <div className="flex gap-1 border-t border-border/15 pt-2.5">
                  <Link
                    href={`/admin/recettes/${recipe.id}/modifier`}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-[12px] font-medium text-text-secondary hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                    Modifier
                  </Link>
                  <button
                    onClick={() => handleToggleStatus(recipe)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-[12px] font-medium text-text-secondary hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all cursor-pointer"
                  >
                    {recipe.status === "draft" ? "Publier" : "Depublier"}
                  </button>
                  <button
                    onClick={() => handleDelete(recipe.id, recipe.title)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-[12px] font-medium text-text-secondary hover:text-red-500 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
