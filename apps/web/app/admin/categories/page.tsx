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
      const { categories } = await api.get<{ categories: Category[] }>(
        "/api/admin/categories"
      );
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
    if (!confirm(`Supprimer la catégorie « ${name} » ?`)) return;
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
            Catégories
          </h1>
          <p style={{ color: "var(--color-text-secondary)", fontSize: 14, marginTop: 4 }}>
            {categories.length} catégorie{categories.length !== 1 ? "s" : ""}
          </p>
        </div>
        {!creating && (
          <button
            onClick={() => setCreating(true)}
            style={{
              background: "var(--color-primary)",
              color: "white",
              padding: "10px 20px",
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              border: "none",
              cursor: "pointer",
            }}
          >
            + Nouvelle catégorie
          </button>
        )}
      </div>

      {/* Create form */}
      {creating && (
        <div
          style={{
            background: "var(--color-surface)",
            border: "1px solid var(--color-primary)",
            borderRadius: 10,
            padding: 20,
            marginBottom: 20,
          }}
        >
          <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 14, color: "var(--color-text)" }}>
            Nouvelle catégorie
          </h2>
          <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Nom de la catégorie (ex: Plat principal)"
              required
              autoFocus
              style={inputStyle}
            />
            <input
              type="text"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              placeholder="Description (optionnelle)"
              style={inputStyle}
            />
            <p style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>
              Slug : {generateSlug(newName) || "..."}
            </p>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                type="submit"
                disabled={saving}
                style={{
                  background: "var(--color-primary)",
                  color: "white",
                  border: "none",
                  borderRadius: 7,
                  padding: "9px 18px",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: saving ? "not-allowed" : "pointer",
                }}
              >
                {saving ? "..." : "Créer"}
              </button>
              <button
                type="button"
                onClick={() => setCreating(false)}
                style={{
                  background: "transparent",
                  border: "1px solid var(--color-border)",
                  borderRadius: 7,
                  padding: "9px 18px",
                  fontSize: 14,
                  color: "var(--color-text-secondary)",
                  cursor: "pointer",
                }}
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Category list */}
      {loading ? (
        <p style={{ color: "var(--color-text-secondary)", fontSize: 14 }}>Chargement...</p>
      ) : categories.length === 0 && !creating ? (
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
            Aucune catégorie. Commencez par en créer une.
          </p>
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
          {categories.map((cat, i) => (
            <div
              key={cat.id}
              style={{
                padding: "16px 20px",
                borderBottom: i < categories.length - 1 ? "1px solid var(--color-border)" : "none",
              }}
            >
              {editingId === cat.id ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    style={inputStyle}
                    autoFocus
                  />
                  <input
                    type="text"
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    placeholder="Description"
                    style={inputStyle}
                  />
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      onClick={() => handleSaveEdit(cat.id)}
                      style={{
                        background: "var(--color-primary)",
                        color: "white",
                        border: "none",
                        borderRadius: 6,
                        padding: "7px 14px",
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      Enregistrer
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      style={{
                        background: "transparent",
                        border: "1px solid var(--color-border)",
                        borderRadius: 6,
                        padding: "7px 14px",
                        fontSize: 13,
                        color: "var(--color-text-secondary)",
                        cursor: "pointer",
                      }}
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <span style={{ fontWeight: 500, fontSize: 14, color: "var(--color-text)" }}>
                      {cat.name}
                    </span>
                    {cat.description && (
                      <p style={{ fontSize: 12, color: "var(--color-text-secondary)", marginTop: 2 }}>
                        {cat.description}
                      </p>
                    )}
                    <span style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>
                      /{cat.slug}
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      onClick={() => {
                        setEditingId(cat.id);
                        setEditName(cat.name);
                        setEditDescription(cat.description ?? "");
                      }}
                      style={smallBtnStyle}
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => handleDelete(cat.id, cat.name)}
                      style={{ ...smallBtnStyle, color: "#e53e3e", borderColor: "#feb2b2" }}
                    >
                      Supprimer
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

const inputStyle: React.CSSProperties = {
  border: "1px solid var(--color-border)",
  borderRadius: 8,
  padding: "9px 12px",
  fontSize: 14,
  color: "var(--color-text)",
  background: "white",
  outline: "none",
  width: "100%",
  fontFamily: "inherit",
};

const smallBtnStyle: React.CSSProperties = {
  fontSize: 12,
  padding: "5px 10px",
  borderRadius: 6,
  border: "1px solid var(--color-border)",
  color: "var(--color-text-secondary)",
  background: "transparent",
  cursor: "pointer",
};
