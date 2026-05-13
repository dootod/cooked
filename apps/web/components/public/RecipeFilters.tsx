"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  categories: { id: string; name: string; slug: string }[];
  currentSearch: string;
  currentCategory: string;
  currentDifficulty: string;
  currentSort: string;
};

const difficulties = [
  { value: "", label: "Toutes" },
  { value: "easy", label: "Facile" },
  { value: "intermediate", label: "Moyen" },
  { value: "hard", label: "Difficile" },
];

const sorts = [
  { value: "recent", label: "Plus recents" },
  { value: "prep_asc", label: "Temps croissant" },
];

export default function RecipeFilters({
  categories,
  currentSearch,
  currentCategory,
  currentDifficulty,
  currentSort,
}: Props) {
  const router = useRouter();
  const [search, setSearch] = useState(currentSearch);

  function buildUrl(overrides: Record<string, string>) {
    const params = new URLSearchParams();
    const values: Record<string, string> = {
      search: currentSearch,
      category: currentCategory,
      difficulty: currentDifficulty,
      sort: currentSort,
      ...overrides,
    };
    for (const [key, val] of Object.entries(values)) {
      if (val) params.set(key, val);
    }
    params.delete("page");
    return `/recettes?${params.toString()}`;
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    router.push(buildUrl({ search: search.trim() }));
  }

  return (
    <div className="mb-8 pb-6 border-b border-border/20">
      {/* Search */}
      <form onSubmit={handleSearch} className="relative max-w-md">
        <svg
          className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher une recette..."
          className="w-full pl-11 pr-4 py-3 rounded-xl bg-white border border-border/40 text-sm text-text placeholder:text-text-tertiary/60 focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary/10 transition-all"
        />
      </form>

      {/* Filter pills */}
      <div className="mt-5 flex flex-wrap items-center gap-x-8 gap-y-3">
        {/* Categories */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 -mb-1">
          <span className="text-[10px] font-bold text-text-tertiary uppercase tracking-[0.1em] shrink-0 mr-1">
            Categorie
          </span>
          <button
            onClick={() => router.push(buildUrl({ category: "" }))}
            className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
              !currentCategory
                ? "bg-primary text-white shadow-sm shadow-primary/25"
                : "bg-white border border-border/40 text-text-secondary hover:border-primary/40 hover:text-primary"
            }`}
          >
            Toutes
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => router.push(buildUrl({ category: cat.slug }))}
              className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                currentCategory === cat.slug
                  ? "bg-primary text-white shadow-sm shadow-primary/25"
                  : "bg-white border border-border/40 text-text-secondary hover:border-primary/40 hover:text-primary"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Difficulty */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-bold text-text-tertiary uppercase tracking-[0.1em] mr-1">
            Difficulte
          </span>
          {difficulties.map((d) => (
            <button
              key={d.value}
              onClick={() => router.push(buildUrl({ difficulty: d.value }))}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                currentDifficulty === d.value ||
                (!currentDifficulty && d.value === "")
                  ? "bg-primary text-white shadow-sm shadow-primary/25"
                  : "bg-white border border-border/40 text-text-secondary hover:border-primary/40 hover:text-primary"
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>

        {/* Sort */}
        <div className="flex items-center gap-1.5 sm:ml-auto">
          <span className="text-[10px] font-bold text-text-tertiary uppercase tracking-[0.1em] mr-1">
            Tri
          </span>
          <select
            value={currentSort || "recent"}
            onChange={(e) => router.push(buildUrl({ sort: e.target.value }))}
            className="px-3.5 py-1.5 rounded-lg bg-white border border-border/40 text-xs font-medium text-text-secondary focus:outline-none focus:border-primary/40 cursor-pointer"
          >
            {sorts.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
