"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

interface Stats {
  total: number;
  published: number;
  draft: number;
  categories: number;
  users: number;
  sessions: number;
}

interface RecentRecipe {
  id: string;
  title: string;
  slug: string;
  status: "draft" | "published";
  difficulty: "easy" | "intermediate" | "hard";
  prepTime: number;
  cookTime: number;
  createdAt: string;
}

function useAnimatedCounter(target: number, duration = 1200) {
  const [count, setCount] = useState(0);
  const prevTarget = useRef(0);

  useEffect(() => {
    if (target === 0 && prevTarget.current === 0) return;
    if (target === prevTarget.current) return;
    prevTarget.current = target;

    const start = performance.now();
    function update(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(target * eased));
      if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  }, [target, duration]);

  return count;
}

const difficultyLabel: Record<string, string> = {
  easy: "Facile",
  intermediate: "Moyen",
  hard: "Difficile",
};

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentRecipes, setRecentRecipes] = useState<RecentRecipe[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [recipesRes, categoriesRes, usersRes] = await Promise.allSettled([
          api.get<{ recipes: RecentRecipe[] }>("/api/admin/recipes"),
          api.get<{ categories: Array<{ id: string }> }>("/api/admin/categories"),
          api.get<{ totalUsers: number; activeSessions: number }>("/api/admin/users/stats"),
        ]);

        const recipes = recipesRes.status === "fulfilled" ? recipesRes.value.recipes : [];
        const categories = categoriesRes.status === "fulfilled" ? categoriesRes.value.categories : [];
        const userStats = usersRes.status === "fulfilled" ? usersRes.value : { totalUsers: 0, activeSessions: 0 };

        setStats({
          total: recipes.length,
          published: recipes.filter((r) => r.status === "published").length,
          draft: recipes.filter((r) => r.status === "draft").length,
          categories: categories.length,
          users: userStats.totalUsers,
          sessions: userStats.activeSessions,
        });

        const sorted = [...recipes].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setRecentRecipes(sorted.slice(0, 6));
      } catch {
        setStats({ total: 0, published: 0, draft: 0, categories: 0, users: 0, sessions: 0 });
      }
      setLoading(false);
    }
    load();
  }, []);

  const animTotal = useAnimatedCounter(stats?.total ?? 0);
  const animPublished = useAnimatedCounter(stats?.published ?? 0);
  const animDraft = useAnimatedCounter(stats?.draft ?? 0);
  const animCategories = useAnimatedCounter(stats?.categories ?? 0);
  const animUsers = useAnimatedCounter(stats?.users ?? 0);
  const animSessions = useAnimatedCounter(stats?.sessions ?? 0);

  const today = new Date().toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  function formatTime(iso: string) {
    return new Date(iso).toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  const kpis = [
    { key: "total", label: "Recettes", value: animTotal, color: "#4F6FE8", bg: "bg-primary/8" },
    { key: "published", label: "Publiees", value: animPublished, color: "#22C55E", bg: "bg-emerald-500/8" },
    { key: "draft", label: "Brouillons", value: animDraft, color: "#FF8C69", bg: "bg-accent/8" },
    { key: "categories", label: "Categories", value: animCategories, color: "#A855F7", bg: "bg-purple-500/8" },
    { key: "users", label: "Utilisateurs", value: animUsers, color: "#06B6D4", bg: "bg-cyan-500/8" },
    { key: "sessions", label: "Sessions actives", value: animSessions, color: "#F59E0B", bg: "bg-amber-500/8" },
  ];

  return (
    <div className="admin-fade-up">
      {/* Header */}
      <div className="mb-8">
        <p className="text-[12px] font-medium text-text-tertiary mb-1 font-mono tracking-wide uppercase">
          {today}
        </p>
        <h1 className="text-[28px] font-bold tracking-tight text-text">
          Tableau de bord
        </h1>
      </div>

      {/* KPI Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-[88px] rounded-xl bg-white/40 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {kpis.map((kpi) => (
            <div key={kpi.key} className="admin-glass rounded-xl p-4">
              <p className="text-[28px] font-bold font-mono leading-none tracking-tight" style={{ color: kpi.color }}>
                {kpi.value}
              </p>
              <p className="text-[11px] font-medium text-text-secondary mt-1.5">{kpi.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Main content grid */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Recent Recipes — 2/3 */}
        <div className="lg:col-span-2 admin-glass rounded-xl overflow-hidden">
          <div className="px-5 py-3.5 border-b border-border/20 flex items-center justify-between">
            <h2 className="text-[13px] font-bold text-text">Recettes recentes</h2>
            <Link
              href="/admin/recettes"
              className="text-[12px] font-medium text-primary hover:text-primary-hover transition-colors"
            >
              Tout voir
            </Link>
          </div>
          {recentRecipes.length === 0 ? (
            <div className="p-10 text-center">
              <p className="text-[13px] text-text-tertiary">Aucune recette</p>
              <Link
                href="/admin/recettes/nouveau"
                className="inline-flex items-center gap-1.5 mt-3 text-[13px] font-medium text-primary hover:text-primary-hover transition-colors"
              >
                Creer une recette
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-border/15">
              {recentRecipes.map((recipe) => (
                <Link
                  key={recipe.id}
                  href={`/admin/recettes/${recipe.id}/modifier`}
                  className="flex items-center justify-between px-5 py-3 hover:bg-primary/[0.02] transition-colors group"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div
                      className={`w-[3px] h-8 rounded-full shrink-0 ${
                        recipe.status === "published" ? "bg-emerald-400" : "bg-accent/60"
                      }`}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-medium text-text truncate group-hover:text-primary transition-colors">
                        {recipe.title}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[11px] text-text-tertiary font-mono">
                          {formatDate(recipe.createdAt)}
                        </span>
                        <span className="text-[10px] text-text-tertiary">
                          {difficultyLabel[recipe.difficulty] ?? recipe.difficulty}
                        </span>
                        <span className="text-[10px] text-text-tertiary font-mono">
                          {recipe.prepTime + recipe.cookTime}min
                        </span>
                      </div>
                    </div>
                  </div>
                  <span
                    className={`shrink-0 ml-3 px-2 py-0.5 rounded text-[10px] font-semibold ${
                      recipe.status === "published"
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-accent/10 text-accent"
                    }`}
                  >
                    {recipe.status === "published" ? "Publie" : "Brouillon"}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Technical Info — 1/3 */}
        <div className="space-y-5">
          {/* Platform status */}
          <div className="admin-glass rounded-xl p-5">
            <h2 className="text-[13px] font-bold text-text mb-4">Plateforme</h2>
            <div className="space-y-2.5">
              {[
                { name: "API Hono", status: "ok", detail: "Port 3001", color: "bg-emerald-400" },
                { name: "PostgreSQL", status: "ok", detail: "Drizzle ORM", color: "bg-emerald-400" },
                { name: "Better Auth", status: "ok", detail: `${stats?.users ?? 0} comptes`, color: "bg-emerald-400" },
                { name: "Stockage R2", status: "pending", detail: "Non configure", color: "bg-amber-400" },
                { name: "Emails Resend", status: "pending", detail: "Non configure", color: "bg-amber-400" },
              ].map((svc) => (
                <div key={svc.name} className="flex items-center justify-between py-1.5">
                  <div className="flex items-center gap-2.5">
                    <span className={`block w-2 h-2 rounded-full ${svc.color}`} />
                    <span className="text-[12px] font-medium text-text">{svc.name}</span>
                  </div>
                  <span className={`text-[11px] font-mono ${svc.status === "ok" ? "text-emerald-600" : "text-amber-600"}`}>
                    {svc.detail}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Stack info */}
          <div className="admin-glass rounded-xl p-5">
            <h2 className="text-[13px] font-bold text-text mb-4">Stack technique</h2>
            <div className="space-y-2">
              {[
                { label: "Frontend", value: "Next.js 16.2" },
                { label: "Backend", value: "Hono 4.12" },
                { label: "ORM", value: "Drizzle 0.45" },
                { label: "Auth", value: "Better Auth 1.6" },
                { label: "Monorepo", value: "Turborepo + pnpm" },
                { label: "CSS", value: "Tailwind CSS v4" },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between py-1">
                  <span className="text-[11px] text-text-secondary">{item.label}</span>
                  <span className="text-[11px] font-mono text-text">{item.value}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-3 border-t border-border/20 flex items-center justify-between">
              <span className="text-[10px] font-mono text-text-tertiary">v1.0.0-dev</span>
              <span className="text-[10px] text-text-tertiary">Phase 1 MVP</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
