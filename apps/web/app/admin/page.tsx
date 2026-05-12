"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

interface Stats {
  total: number;
  published: number;
  draft: number;
}

function StatRing({ value, max, color, size = 52 }: { value: number; max: number; color: string; size?: number }) {
  const sw = 3.5;
  const r = (size - sw) / 2;
  const circ = 2 * Math.PI * r;
  const progress = max > 0 ? Math.min((value / max) * circ, circ) : 0;

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeWidth={sw} className="text-black/[0.04]" />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={color} strokeWidth={sw}
        strokeDasharray={circ} strokeDashoffset={circ - progress}
        strokeLinecap="round"
        className="transition-all duration-1000 ease-out"
      />
    </svg>
  );
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const { recipes } = await api.get<{ recipes: Array<{ status: string }> }>("/api/admin/recipes");
        const total = recipes.length;
        const published = recipes.filter((r) => r.status === "published").length;
        const draft = recipes.filter((r) => r.status === "draft").length;
        setStats({ total, published, draft });
      } catch {
        setStats({ total: 0, published: 0, draft: 0 });
      }
      setLoading(false);
    }
    load();
  }, []);

  const pct = (v: number) => (stats?.total ? Math.round((v / stats.total) * 100) : 0);

  return (
    <div className="admin-fade-up">
      <div className="mb-8">
        <h1 className="text-[28px] font-bold text-text tracking-tight">Dashboard</h1>
        <p className="mt-1 text-[14px] text-text-secondary">Vue d&apos;ensemble de votre contenu</p>
      </div>

      {/* KPIs */}
      {loading ? (
        <div className="grid grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-[140px] rounded-2xl bg-white/40 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-5">
          {/* Total */}
          <div className="admin-glass rounded-2xl p-5 hover:shadow-[0_8px_40px_rgba(79,111,232,0.12)] transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4F6FE8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
                </svg>
              </div>
              <div className="relative">
                <StatRing value={stats?.total ?? 0} max={Math.max(stats?.total ?? 1, 1)} color="#4F6FE8" />
                <span className="absolute inset-0 flex items-center justify-center text-[11px] font-bold text-primary font-mono">
                  {stats?.total ?? 0}
                </span>
              </div>
            </div>
            <p className="text-[26px] font-bold text-text font-mono leading-none">{stats?.total ?? 0}</p>
            <p className="text-[12px] font-medium text-text-secondary mt-1">Recettes totales</p>
          </div>

          {/* Published */}
          <div className="admin-glass rounded-2xl p-5 hover:shadow-[0_8px_40px_rgba(34,197,94,0.12)] transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>
              <div className="relative">
                <StatRing value={stats?.published ?? 0} max={Math.max(stats?.total ?? 1, 1)} color="#22C55E" />
                <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-emerald-600 font-mono">
                  {pct(stats?.published ?? 0)}%
                </span>
              </div>
            </div>
            <p className="text-[26px] font-bold text-text font-mono leading-none">{stats?.published ?? 0}</p>
            <p className="text-[12px] font-medium text-text-secondary mt-1">Publiées</p>
          </div>

          {/* Drafts */}
          <div className="admin-glass rounded-2xl p-5 hover:shadow-[0_8px_40px_rgba(255,140,105,0.12)] transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FF8C69" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </div>
              <div className="relative">
                <StatRing value={stats?.draft ?? 0} max={Math.max(stats?.total ?? 1, 1)} color="#FF8C69" />
                <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-accent font-mono">
                  {pct(stats?.draft ?? 0)}%
                </span>
              </div>
            </div>
            <p className="text-[26px] font-bold text-text font-mono leading-none">{stats?.draft ?? 0}</p>
            <p className="text-[12px] font-medium text-text-secondary mt-1">Brouillons</p>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="mt-10">
        <h2 className="text-[11px] font-bold tracking-[0.1em] uppercase text-text-tertiary mb-4">Actions rapides</h2>
        <div className="grid grid-cols-3 gap-4">
          <Link href="/admin/recettes/nouveau" className="group admin-glass rounded-2xl p-5 hover:shadow-[0_8px_40px_rgba(79,111,232,0.12)] transition-all duration-300 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.04] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center mb-4 shadow-[0_4px_16px_rgba(79,111,232,0.3)] group-hover:shadow-[0_8px_24px_rgba(79,111,232,0.4)] group-hover:scale-105 transition-all duration-300">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </div>
              <p className="text-[14px] font-semibold text-text group-hover:text-primary transition-colors">Nouvelle recette</p>
              <p className="text-[12px] text-text-tertiary mt-0.5">Créer et publier</p>
            </div>
          </Link>

          <Link href="/admin/categories" className="group admin-glass rounded-2xl p-5 hover:shadow-[0_8px_40px_rgba(255,140,105,0.12)] transition-all duration-300 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-accent/[0.04] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-accent/70 flex items-center justify-center mb-4 shadow-[0_4px_16px_rgba(255,140,105,0.3)] group-hover:shadow-[0_8px_24px_rgba(255,140,105,0.4)] group-hover:scale-105 transition-all duration-300">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z" />
                  <path d="M7 7h.01" />
                </svg>
              </div>
              <p className="text-[14px] font-semibold text-text group-hover:text-accent transition-colors">Catégories</p>
              <p className="text-[12px] text-text-tertiary mt-0.5">Organiser le contenu</p>
            </div>
          </Link>

          <Link href="/admin/commentaires" className="group admin-glass rounded-2xl p-5 hover:shadow-[0_8px_40px_rgba(168,85,247,0.12)] transition-all duration-300 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/[0.04] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-500/70 flex items-center justify-center mb-4 shadow-[0_4px_16px_rgba(168,85,247,0.3)] group-hover:shadow-[0_8px_24px_rgba(168,85,247,0.4)] group-hover:scale-105 transition-all duration-300">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
                </svg>
              </div>
              <p className="text-[14px] font-semibold text-text group-hover:text-purple-600 transition-colors">Modération</p>
              <p className="text-[12px] text-text-tertiary mt-0.5">Commentaires en attente</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
