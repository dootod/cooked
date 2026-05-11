"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface Stats {
  total: number;
  published: number;
  draft: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const { recipes } = await api.get<{ recipes: Array<{ status: string }> }>(
          "/api/admin/recipes"
        );
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

  return (
    <div>
      <h1
        style={{
          fontFamily: "var(--font-serif)",
          fontSize: 30,
          fontWeight: 700,
          marginBottom: 8,
          color: "var(--color-text)",
        }}
      >
        Dashboard
      </h1>
      <p style={{ color: "var(--color-text-secondary)", marginBottom: 32, fontSize: 14 }}>
        Vue d&apos;ensemble du contenu.
      </p>

      {loading ? (
        <p style={{ color: "var(--color-text-secondary)", fontSize: 14 }}>Chargement...</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, maxWidth: 600 }}>
          <KpiCard label="Recettes totales" value={stats?.total ?? 0} />
          <KpiCard label="Publiées" value={stats?.published ?? 0} accent="var(--color-primary)" />
          <KpiCard label="Brouillons" value={stats?.draft ?? 0} accent="var(--color-accent)" />
        </div>
      )}
    </div>
  );
}

function KpiCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: string;
}) {
  return (
    <div
      style={{
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        borderRadius: 10,
        padding: "20px 24px",
      }}
    >
      <p
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 32,
          fontWeight: 700,
          color: accent ?? "var(--color-text)",
          lineHeight: 1,
          marginBottom: 8,
        }}
      >
        {value}
      </p>
      <p style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>{label}</p>
    </div>
  );
}
