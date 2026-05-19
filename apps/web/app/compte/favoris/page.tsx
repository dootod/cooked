"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "@/lib/auth";
import { api } from "@/lib/api";
import { difficultyLabel } from "@/lib/recipe-utils";

interface FavoriteRecipe {
  recipeId: string;
  title: string;
  slug: string;
  description: string | null;
  prepTime: number;
  cookTime: number;
  difficulty: "easy" | "intermediate" | "hard";
  servings: number;
}

export default function FavorisPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [favorites, setFavorites] = useState<FavoriteRecipe[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/compte/connexion");
      return;
    }
    if (session?.user) {
      api
        .get<{ favorites: FavoriteRecipe[] }>("/api/me/favorites")
        .then((d) => setFavorites(d.favorites))
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [session, isPending, router]);

  async function removeFavorite(recipeId: string) {
    await api.delete(`/api/me/favorites/${recipeId}`);
    setFavorites((prev) => prev.filter((f) => f.recipeId !== recipeId));
  }

  if (isPending || (!session?.user && !loading)) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16 animate-slide-in-up">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[28px] sm:text-[32px] font-serif font-bold text-text">
            Mes favoris
          </h1>
          <p className="mt-1 text-[14px] text-text-secondary">
            {favorites.length} recette{favorites.length !== 1 ? "s" : ""}{" "}
            sauvegardee{favorites.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link
          href="/recettes"
          className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary-hover transition-colors group"
        >
          Explorer
          <svg
            className="transition-transform group-hover:translate-x-1"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
          </svg>
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-40 rounded-2xl bg-white/40 animate-pulse"
            />
          ))}
        </div>
      ) : favorites.length === 0 ? (
        <div className="public-glow-card rounded-2xl text-center py-16 px-8">
          <svg
            width="64"
            height="64"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mx-auto text-accent/30 mb-5"
          >
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
          </svg>
          <h2 className="text-[18px] font-serif font-bold text-text mb-2">
            Aucun favori
          </h2>
          <p className="text-[13px] text-text-secondary mb-6">
            Explorez les recettes et ajoutez vos coups de coeur.
          </p>
          <Link
            href="/recettes"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-primary to-primary/90 text-white text-[13px] font-semibold rounded-xl shadow-[0_4px_16px_rgba(71,91,138,0.25)] hover:shadow-[0_8px_24px_rgba(71,91,138,0.35)] transition-all"
          >
            Explorer les recettes
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {favorites.map((fav, i) => (
            <div
              key={fav.recipeId}
              className={`public-glow-card rounded-2xl p-5 hover-lift animate-slide-in-up animate-stagger-${Math.min(i + 1, 6)}`}
            >
              <div className="flex items-start justify-between gap-3">
                <Link href={`/recettes/${fav.slug}`} className="flex-1 min-w-0">
                  <h3 className="text-[15px] font-semibold text-text truncate hover:text-primary transition-colors">
                    {fav.title}
                  </h3>
                  {fav.description && (
                    <p className="text-[12px] text-text-secondary mt-1 line-clamp-2">
                      {fav.description}
                    </p>
                  )}
                  <div className="flex items-center gap-3 mt-3">
                    <span className="text-[11px] text-text-tertiary flex items-center gap-1">
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                      {fav.prepTime + fav.cookTime} min
                    </span>
                    <span className="text-[11px] text-text-tertiary">
                      {difficultyLabel[fav.difficulty]}
                    </span>
                    <span className="text-[11px] text-text-tertiary">
                      {fav.servings} pers.
                    </span>
                  </div>
                </Link>
                <button
                  onClick={() => removeFavorite(fav.recipeId)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-accent hover:bg-accent/10 transition-all cursor-pointer shrink-0"
                  title="Retirer des favoris"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
