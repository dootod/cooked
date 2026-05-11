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
  intermediate: "Intermédiaire",
  hard: "Difficile",
};

const statusLabel: Record<string, string> = {
  draft: "Brouillon",
  published: "Publié",
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
    if (!confirm(`Supprimer « ${title} » ? Cette action est irréversible.`)) return;
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

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: 30,
              fontWeight: 700,
              color: "var(--color-text)",
            }}
          >
            Recettes
          </h1>
          <p style={{ color: "var(--color-text-secondary)", fontSize: 14, marginTop: 4 }}>
            {recipes.length} recette{recipes.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link
          href="/admin/recettes/nouveau"
          style={{
            background: "var(--color-primary)",
            color: "white",
            padding: "10px 20px",
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 600,
            textDecoration: "none",
          }}
        >
          + Nouvelle recette
        </Link>
      </div>

      {loading ? (
        <p style={{ color: "var(--color-text-secondary)", fontSize: 14 }}>Chargement...</p>
      ) : recipes.length === 0 ? (
        <div
          style={{
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: 10,
            padding: 48,
            textAlign: "center",
          }}
        >
          <p style={{ color: "var(--color-text-secondary)", fontSize: 14 }}>
            Aucune recette pour l&apos;instant.
          </p>
          <Link
            href="/admin/recettes/nouveau"
            style={{
              display: "inline-block",
              marginTop: 16,
              color: "var(--color-primary)",
              fontSize: 14,
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Créer la première recette
          </Link>
        </div>
      ) : (
        <div
          style={{
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: 10,
            overflow: "hidden",
          }}
        >
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "var(--color-bg)", borderBottom: "1px solid var(--color-border)" }}>
                {["Titre", "Statut", "Difficulté", "Temps total", "Actions"].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "12px 16px",
                      textAlign: "left",
                      fontSize: 12,
                      fontWeight: 600,
                      color: "var(--color-text-secondary)",
                      letterSpacing: "0.04em",
                      textTransform: "uppercase",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recipes.map((recipe, i) => (
                <tr
                  key={recipe.id}
                  style={{
                    borderBottom:
                      i < recipes.length - 1 ? "1px solid var(--color-border)" : "none",
                  }}
                >
                  <td style={{ padding: "14px 16px" }}>
                    <span style={{ fontWeight: 500, fontSize: 14, color: "var(--color-text)" }}>
                      {recipe.title}
                    </span>
                    <br />
                    <span style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>
                      /{recipe.slug}
                    </span>
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <StatusBadge status={recipe.status} />
                  </td>
                  <td style={{ padding: "14px 16px", fontSize: 13, color: "var(--color-text-secondary)" }}>
                    {difficultyLabel[recipe.difficulty]}
                  </td>
                  <td
                    style={{
                      padding: "14px 16px",
                      fontFamily: "var(--font-mono)",
                      fontSize: 13,
                      color: "var(--color-text-secondary)",
                    }}
                  >
                    {recipe.prepTime + recipe.cookTime} min
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <div style={{ display: "flex", gap: 8 }}>
                      <Link
                        href={`/admin/recettes/${recipe.id}/modifier`}
                        style={actionBtnStyle}
                      >
                        Modifier
                      </Link>
                      <button
                        onClick={() => handleToggleStatus(recipe)}
                        style={{
                          ...actionBtnStyle,
                          cursor: "pointer",
                          background: "transparent",
                        }}
                      >
                        {recipe.status === "draft" ? "Publier" : "Dépublier"}
                      </button>
                      <button
                        onClick={() => handleDelete(recipe.id, recipe.title)}
                        style={{
                          ...actionBtnStyle,
                          cursor: "pointer",
                          background: "transparent",
                          color: "#e53e3e",
                          borderColor: "#feb2b2",
                        }}
                      >
                        Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: "draft" | "published" }) {
  return (
    <span
      style={{
        display: "inline-block",
        padding: "3px 10px",
        borderRadius: 20,
        fontSize: 12,
        fontWeight: 600,
        background: status === "published" ? "var(--color-primary-light)" : "var(--color-accent-light)",
        color: status === "published" ? "var(--color-primary)" : "var(--color-accent)",
      }}
    >
      {statusLabel[status]}
    </span>
  );
}

const actionBtnStyle: React.CSSProperties = {
  fontSize: 12,
  padding: "5px 10px",
  borderRadius: 6,
  border: "1px solid var(--color-border)",
  color: "var(--color-text-secondary)",
  textDecoration: "none",
  display: "inline-block",
};
