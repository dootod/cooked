"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { difficultyLabel } from "@/lib/recipe-utils";

interface Stats {
  total: number;
  published: number;
  draft: number;
  categories: number;
  users: number;
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

function useLiveClock() {
  const [time, setTime] = useState<Date | null>(null);
  useEffect(() => {
    setTime(new Date());
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return time;
}

function getGreeting(hour: number) {
  if (hour < 12) return "Bonjour";
  if (hour < 18) return "Bon apres-midi";
  return "Bonsoir";
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentRecipes, setRecentRecipes] = useState<RecentRecipe[]>([]);
  const [loading, setLoading] = useState(true);
  const now = useLiveClock();

  useEffect(() => {
    async function load() {
      try {
        const [recipesRes, categoriesRes, usersRes] = await Promise.allSettled([
          api.get<{ recipes: RecentRecipe[]; pagination: { total: number } }>(
            "/api/admin/recipes?limit=200",
          ),
          api.get<{ categories: Array<{ id: string }> }>(
            "/api/admin/categories",
          ),
          api.get<{ totalUsers: number; activeSessions: number }>(
            "/api/admin/users/stats",
          ),
        ]);

        const recipesData =
          recipesRes.status === "fulfilled"
            ? recipesRes.value
            : { recipes: [], pagination: { total: 0 } };
        const recipes = recipesData.recipes;
        const totalRecipes = recipesData.pagination.total;
        const categories =
          categoriesRes.status === "fulfilled"
            ? categoriesRes.value.categories
            : [];
        const userStats =
          usersRes.status === "fulfilled"
            ? usersRes.value
            : { totalUsers: 0, activeSessions: 0 };

        setStats({
          total: totalRecipes,
          published: recipes.filter((r) => r.status === "published").length,
          draft: recipes.filter((r) => r.status === "draft").length,
          categories: categories.length,
          users: userStats.totalUsers,
        });

        const sorted = [...recipes].sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
        setRecentRecipes(sorted.slice(0, 6));
      } catch {
        setStats({
          total: 0,
          published: 0,
          draft: 0,
          categories: 0,
          users: 0,
        });
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
  const greeting = now ? getGreeting(now.getHours()) : "";
  const clock = now
    ? now.toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    : "--:--:--";

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

  const publishedPct =
    stats && stats.total > 0
      ? Math.round((stats.published / stats.total) * 100)
      : 0;
  const draftPct =
    stats && stats.total > 0
      ? Math.round((stats.draft / stats.total) * 100)
      : 0;

  const kpis = [
    {
      key: "total",
      label: "Recettes",
      value: animTotal,
      color: "#475B8A",
      icon: (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#475B8A"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
      ),
    },
    {
      key: "published",
      label: "Publiees",
      value: animPublished,
      color: "#22C55E",
      icon: (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#22C55E"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      ),
    },
    {
      key: "draft",
      label: "Brouillons",
      value: animDraft,
      color: "#FF8C69",
      icon: (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#FF8C69"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
      ),
    },
    {
      key: "categories",
      label: "Categories",
      value: animCategories,
      color: "#A855F7",
      icon: (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#A855F7"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
        </svg>
      ),
    },
    {
      key: "users",
      label: "Utilisateurs",
      value: animUsers,
      color: "#06B6D4",
      icon: (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#06B6D4"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
    },
  ];

  const quickActions = [
    {
      href: "/admin/recettes/nouveau",
      label: "Nouvelle recette",
      desc: "Creer un nouveau plat",
      icon: (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      ),
    },
    {
      href: "/admin/categories",
      label: "Categories",
      desc: "Gerer les categories",
      icon: (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
        </svg>
      ),
    },
    {
      href: "/admin/tags",
      label: "Tags",
      desc: "Gerer les etiquettes",
      icon: (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
          <line x1="7" y1="7" x2="7.01" y2="7" />
        </svg>
      ),
    },
    {
      href: "/admin/utilisateurs",
      label: "Utilisateurs",
      desc: "Gerer les comptes",
      icon: (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
        </svg>
      ),
    },
    {
      href: "/admin/commentaires",
      label: "Moderation",
      desc: "Moderer commentaires",
      icon: (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      ),
    },
  ];

  const services = [
    { name: "API Hono", detail: "Port 3001", status: "ok" as const },
    { name: "PostgreSQL", detail: "Drizzle ORM", status: "ok" as const },
    {
      name: "Better Auth",
      detail: `${stats?.users ?? 0} comptes`,
      status: "ok" as const,
    },
    {
      name: "Stockage R2",
      detail: "Non configure",
      status: "pending" as const,
    },
    { name: "Emails Resend", detail: "Connecte", status: "ok" as const },
  ];

  const stackInfo = [
    { label: "Frontend", value: "Next.js 16.2" },
    { label: "Backend", value: "Hono 4.12" },
    { label: "ORM", value: "Drizzle 0.45" },
    { label: "Auth", value: "Better Auth 1.6" },
    { label: "Monorepo", value: "Turborepo + pnpm" },
    { label: "CSS", value: "Tailwind CSS v4" },
  ];

  if (loading) {
    return (
      <div className="space-y-6 admin-fade-up">
        <div className="flex items-start justify-between">
          <div>
            <div className="h-3 w-40 bg-border/20 rounded animate-pulse mb-3" />
            <div className="h-10 w-64 bg-border/20 rounded animate-pulse mb-2" />
            <div className="h-4 w-48 bg-border/20 rounded animate-pulse" />
          </div>
          <div className="h-12 w-36 bg-border/20 rounded-xl animate-pulse" />
        </div>
        <div className="h-[2px] bg-border/20 rounded-full" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-[120px] rounded-xl admin-shimmer bg-white/60"
              style={{ animationDelay: `${i * 0.3}s` }}
            />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 h-[220px] rounded-xl admin-shimmer bg-white/60" />
          <div className="h-[220px] rounded-xl admin-shimmer bg-white/60" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 h-[340px] rounded-xl admin-shimmer bg-white/60" />
          <div className="h-[340px] rounded-xl admin-shimmer bg-white/60" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-full">
      {/* Decorative background orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full opacity-[0.04] blur-3xl"
          style={{
            background: "radial-gradient(circle, #475B8A, transparent 70%)",
            animation: "admin-orb 12s ease-in-out infinite",
          }}
        />
        <div
          className="absolute top-1/2 -right-48 w-[400px] h-[400px] rounded-full opacity-[0.03] blur-3xl"
          style={{
            background: "radial-gradient(circle, #FF8C69, transparent 70%)",
            animation: "admin-orb 15s ease-in-out infinite 3s",
          }}
        />
        <div
          className="absolute -bottom-32 left-1/3 w-[350px] h-[350px] rounded-full opacity-[0.03] blur-3xl"
          style={{
            background: "radial-gradient(circle, #A855F7, transparent 70%)",
            animation: "admin-orb 10s ease-in-out infinite 6s",
          }}
        />
      </div>

      {/* Main content */}
      <div className="relative space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between flex-wrap gap-4 admin-fade-up">
          <div>
            <p className="text-[11px] font-mono text-text-tertiary tracking-[0.2em] uppercase mb-2">
              {today}
            </p>
            <h1 className="text-[34px] font-bold tracking-tight font-serif admin-gradient-text leading-tight">
              {greeting}
            </h1>
            <p className="text-[14px] text-text-secondary mt-1">
              Tableau de bord &mdash; Vue d&apos;ensemble
            </p>
          </div>
          <div
            className="admin-glow-card rounded-xl px-5 py-3 flex items-center gap-3"
            style={
              {
                "--card-glow": "rgba(34, 197, 94, 0.08)",
                "--card-shadow": "rgba(34, 197, 94, 0.06)",
              } as React.CSSProperties
            }
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-40" />
              <span className="relative rounded-full h-2.5 w-2.5 bg-emerald-400" />
            </span>
            <span className="text-[22px] font-mono font-bold text-text tracking-wider tabular-nums">
              {clock}
            </span>
          </div>
        </div>

        {/* Gradient divider */}
        <div className="h-[2px] admin-gradient-bar rounded-full opacity-30" />

        {/* KPI Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {kpis.map((kpi, i) => (
            <div
              key={kpi.key}
              className="admin-glow-card rounded-xl p-4 relative overflow-hidden animate-scale-in"
              style={
                {
                  "--card-glow": `${kpi.color}12`,
                  "--card-shadow": `${kpi.color}10`,
                  animationDelay: `${i * 80}ms`,
                } as React.CSSProperties
              }
            >
              <div className="flex items-center justify-between mb-3">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center"
                  style={{ background: `${kpi.color}10` }}
                >
                  {kpi.icon}
                </div>
              </div>
              <p
                className="text-[30px] font-bold font-mono leading-none tracking-tight"
                style={{ color: kpi.color }}
              >
                {kpi.value}
              </p>
              <p className="text-[11px] font-medium text-text-secondary mt-2">
                {kpi.label}
              </p>
              <div
                className="absolute bottom-0 left-0 right-0 h-[2px]"
                style={{
                  background: `linear-gradient(90deg, transparent, ${kpi.color}50, transparent)`,
                }}
              />
            </div>
          ))}
        </div>

        {/* Overview: Distribution + Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Content Distribution */}
          <div className="lg:col-span-2 admin-glow-card rounded-xl p-6 animate-slide-in-left animate-stagger-1">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-8 h-8 rounded-lg bg-primary/8 flex items-center justify-center">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#475B8A"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
                  <path d="M22 12A10 10 0 0 0 12 2v10z" />
                </svg>
              </div>
              <h2 className="text-[14px] font-bold text-text">
                Repartition du contenu
              </h2>
            </div>

            {/* Summary stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center p-3 rounded-lg bg-bg/60">
                <p className="text-[22px] font-bold font-mono text-text">
                  {stats?.total ?? 0}
                </p>
                <p className="text-[10px] text-text-tertiary mt-0.5">
                  Total recettes
                </p>
              </div>
              <div className="text-center p-3 rounded-lg bg-bg/60">
                <p className="text-[22px] font-bold font-mono text-emerald-600">
                  {publishedPct}%
                </p>
                <p className="text-[10px] text-text-tertiary mt-0.5">
                  Taux publication
                </p>
              </div>
              <div className="text-center p-3 rounded-lg bg-bg/60">
                <p className="text-[22px] font-bold font-mono text-text">
                  {recentRecipes.length > 0
                    ? Math.round(
                        recentRecipes.reduce(
                          (sum, r) => sum + r.prepTime + r.cookTime,
                          0,
                        ) / recentRecipes.length,
                      )
                    : 0}
                  <span className="text-[12px] text-text-tertiary ml-0.5">
                    min
                  </span>
                </p>
                <p className="text-[10px] text-text-tertiary mt-0.5">
                  Temps moyen
                </p>
              </div>
            </div>

            {/* Distribution bars */}
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                    <span className="text-[12px] font-medium text-text">
                      Publiees
                    </span>
                  </div>
                  <span className="text-[12px] font-mono font-semibold text-emerald-600">
                    {stats?.published ?? 0} ({publishedPct}%)
                  </span>
                </div>
                <div className="h-2.5 rounded-full bg-border/10 overflow-hidden">
                  <div
                    className="h-full rounded-full admin-bar-fill"
                    style={{
                      width: `${publishedPct}%`,
                      background: "linear-gradient(90deg, #22C55E, #4ADE80)",
                    }}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-accent" />
                    <span className="text-[12px] font-medium text-text">
                      Brouillons
                    </span>
                  </div>
                  <span className="text-[12px] font-mono font-semibold text-accent">
                    {stats?.draft ?? 0} ({draftPct}%)
                  </span>
                </div>
                <div className="h-2.5 rounded-full bg-border/10 overflow-hidden">
                  <div
                    className="h-full rounded-full admin-bar-fill"
                    style={{
                      width: `${draftPct}%`,
                      background: "linear-gradient(90deg, #FF8C69, #FFA590)",
                      animationDelay: "0.2s",
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="admin-glow-card rounded-xl p-6 animate-slide-in-right animate-stagger-2">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-8 h-8 rounded-lg bg-accent/8 flex items-center justify-center">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#FF8C69"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
              </div>
              <h2 className="text-[14px] font-bold text-text">
                Actions rapides
              </h2>
            </div>
            <div className="space-y-1">
              {quickActions.map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-primary/[0.04] transition-all duration-300 group"
                >
                  <div className="w-9 h-9 rounded-lg bg-primary/6 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300 shrink-0">
                    {action.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[12px] font-semibold text-text group-hover:text-primary transition-colors">
                      {action.label}
                    </p>
                    <p className="text-[10px] text-text-tertiary truncate">
                      {action.desc}
                    </p>
                  </div>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    className="ml-auto text-text-tertiary opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 shrink-0"
                  >
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Main: Recent Recipes + Platform/Stack */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Recent Recipes */}
          <div className="lg:col-span-2 admin-glow-card rounded-xl overflow-hidden animate-slide-in-up animate-stagger-3">
            <div className="px-6 py-4 border-b border-border/15 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-primary/8 flex items-center justify-center">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#475B8A"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                </div>
                <h2 className="text-[14px] font-bold text-text">
                  Recettes recentes
                </h2>
              </div>
              <Link
                href="/admin/recettes"
                className="flex items-center gap-1 text-[12px] font-semibold text-primary hover:text-primary-hover transition-colors group"
              >
                Tout voir
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  className="group-hover:translate-x-0.5 transition-transform"
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </Link>
            </div>
            {recentRecipes.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 rounded-2xl bg-primary/5 flex items-center justify-center mx-auto mb-4">
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#475B8A"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  >
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                  </svg>
                </div>
                <p className="text-[13px] text-text-secondary mb-1">
                  Aucune recette
                </p>
                <p className="text-[11px] text-text-tertiary mb-4">
                  Commencez par creer votre premiere recette
                </p>
                <Link
                  href="/admin/recettes/nouveau"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-[12px] font-semibold hover:bg-primary-hover transition-colors"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  >
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  Creer une recette
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-border/10">
                {recentRecipes.map((recipe) => (
                  <Link
                    key={recipe.id}
                    href={`/admin/recettes/${recipe.id}/modifier`}
                    className="flex items-center justify-between px-6 py-3.5 hover:bg-primary/[0.02] transition-all duration-300 group"
                  >
                    <div className="flex items-center gap-3.5 min-w-0 flex-1">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 font-bold font-mono text-[14px] ${
                          recipe.status === "published"
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-accent/10 text-accent"
                        }`}
                      >
                        {recipe.prepTime + recipe.cookTime}
                        <span className="text-[8px] ml-px">m</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[13px] font-semibold text-text truncate group-hover:text-primary transition-colors">
                          {recipe.title}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-text-tertiary font-mono">
                            {formatDate(recipe.createdAt)}
                          </span>
                          <span className="w-1 h-1 rounded-full bg-border/40" />
                          <span className="text-[10px] text-text-tertiary">
                            {difficultyLabel[recipe.difficulty] ??
                              recipe.difficulty}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 ml-3">
                      <span
                        className={`px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wide uppercase ${
                          recipe.status === "published"
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-accent/10 text-accent"
                        }`}
                      >
                        {recipe.status === "published" ? "Publie" : "Brouillon"}
                      </span>
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        className="text-text-tertiary opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Platform + Stack */}
          <div className="space-y-5">
            {/* Platform Health */}
            <div className="admin-glow-card rounded-xl p-5 animate-slide-in-right animate-stagger-3">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/8 flex items-center justify-center">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#22C55E"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
                    <rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
                    <line x1="6" y1="6" x2="6.01" y2="6" />
                    <line x1="6" y1="18" x2="6.01" y2="18" />
                  </svg>
                </div>
                <h2 className="text-[14px] font-bold text-text">Plateforme</h2>
              </div>

              {/* Heartbeat line */}
              <div className="mb-4 px-1">
                <svg
                  className="w-full h-8"
                  viewBox="0 0 200 32"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M0,16 L60,16 L70,4 L80,28 L90,8 L100,24 L110,16 L200,16"
                    fill="none"
                    stroke="#22C55E"
                    strokeWidth="1.5"
                    opacity="0.3"
                    className="admin-heartbeat"
                  />
                </svg>
              </div>

              <div className="space-y-1.5">
                {services.map((svc) => (
                  <div
                    key={svc.name}
                    className="flex items-center justify-between py-2 px-2 rounded-lg hover:bg-bg/40 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="relative flex h-2 w-2">
                        {svc.status === "ok" && (
                          <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-30" />
                        )}
                        <span
                          className={`relative rounded-full h-2 w-2 ${
                            svc.status === "ok"
                              ? "bg-emerald-400"
                              : "bg-amber-400"
                          }`}
                        />
                      </span>
                      <span className="text-[12px] font-medium text-text">
                        {svc.name}
                      </span>
                    </div>
                    <span
                      className={`text-[11px] font-mono ${
                        svc.status === "ok"
                          ? "text-emerald-600"
                          : "text-amber-600"
                      }`}
                    >
                      {svc.detail}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Stack */}
            <div className="admin-glow-card rounded-xl p-5 animate-slide-in-right animate-stagger-4">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-lg bg-purple-500/8 flex items-center justify-center">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#A855F7"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polygon points="12 2 2 7 12 12 22 7 12 2" />
                    <polyline points="2 17 12 22 22 17" />
                    <polyline points="2 12 12 17 22 12" />
                  </svg>
                </div>
                <h2 className="text-[14px] font-bold text-text">
                  Stack technique
                </h2>
              </div>
              <div className="space-y-1.5">
                {stackInfo.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-bg/40 transition-colors"
                  >
                    <span className="text-[11px] text-text-secondary">
                      {item.label}
                    </span>
                    <span className="text-[11px] font-mono font-medium text-text">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-3 border-t border-border/15 flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                  <span className="text-[10px] font-mono text-text-tertiary">
                    v1.0.0-dev
                  </span>
                </div>
                <span className="text-[10px] font-semibold text-primary/60 tracking-wide uppercase">
                  Phase 1 MVP
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
