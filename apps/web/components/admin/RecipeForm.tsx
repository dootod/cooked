"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

interface Ingredient {
  name: string;
  quantity: string;
  unit: string;
  note: string;
}

interface Step {
  content: string;
}

interface RecipeFormProps {
  recipeId?: string;
}

const DIFFICULTY_OPTIONS = [
  { value: "easy", label: "Facile" },
  { value: "intermediate", label: "Intermédiaire" },
  { value: "hard", label: "Difficile" },
] as const;

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function RecipeForm({ recipeId }: RecipeFormProps) {
  const router = useRouter();
  const isEditing = Boolean(recipeId);

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugManual, setSlugManual] = useState(false);
  const [description, setDescription] = useState("");
  const [prepTime, setPrepTime] = useState("");
  const [cookTime, setCookTime] = useState("");
  const [difficulty, setDifficulty] = useState<"easy" | "intermediate" | "hard">("easy");
  const [servings, setServings] = useState("4");
  const [status, setStatus] = useState<"draft" | "published">("draft");
  const [videoUrl, setVideoUrl] = useState("");
  const [macroKcal, setMacroKcal] = useState("");
  const [macroProtein, setMacroProtein] = useState("");
  const [macroCarbs, setMacroCarbs] = useState("");
  const [macroFat, setMacroFat] = useState("");
  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { name: "", quantity: "", unit: "", note: "" },
  ]);
  const [steps, setSteps] = useState<Step[]>([{ content: "" }]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(isEditing);
  const [error, setError] = useState("");

  // Auto-generate slug from title
  useEffect(() => {
    if (!slugManual && title) {
      setSlug(generateSlug(title));
    }
  }, [title, slugManual]);

  // Load existing recipe when editing
  useEffect(() => {
    if (!recipeId) return;
    async function load() {
      try {
        const { recipe } = await api.get<{
          recipe: {
            title: string;
            slug: string;
            description: string | null;
            prepTime: number;
            cookTime: number;
            difficulty: "easy" | "intermediate" | "hard";
            servings: number;
            status: "draft" | "published";
            videoUrl: string | null;
            macros: { kcal: number; protein: number; carbs: number; fat: number } | null;
            ingredients: Array<{ name: string; quantity: number | null; unit: string | null; note: string | null }>;
            steps: Array<{ content: string }>;
          };
        }>(`/api/admin/recipes/${recipeId}`);

        setTitle(recipe.title);
        setSlug(recipe.slug);
        setSlugManual(true);
        setDescription(recipe.description ?? "");
        setPrepTime(String(recipe.prepTime));
        setCookTime(String(recipe.cookTime));
        setDifficulty(recipe.difficulty);
        setServings(String(recipe.servings));
        setStatus(recipe.status);
        setVideoUrl(recipe.videoUrl ?? "");

        if (recipe.macros) {
          setMacroKcal(String(recipe.macros.kcal));
          setMacroProtein(String(recipe.macros.protein));
          setMacroCarbs(String(recipe.macros.carbs));
          setMacroFat(String(recipe.macros.fat));
        }

        if (recipe.ingredients.length) {
          setIngredients(
            recipe.ingredients.map((ing) => ({
              name: ing.name,
              quantity: ing.quantity != null ? String(ing.quantity) : "",
              unit: ing.unit ?? "",
              note: ing.note ?? "",
            }))
          );
        }

        if (recipe.steps.length) {
          setSteps(recipe.steps.map((s) => ({ content: s.content })));
        }
      } catch {
        setError("Impossible de charger la recette.");
      }
      setFetchLoading(false);
    }
    load();
  }, [recipeId]);

  function addIngredient() {
    setIngredients([...ingredients, { name: "", quantity: "", unit: "", note: "" }]);
  }

  function removeIngredient(i: number) {
    setIngredients(ingredients.filter((_, idx) => idx !== i));
  }

  function updateIngredient(i: number, field: keyof Ingredient, value: string) {
    setIngredients(ingredients.map((ing, idx) => (idx === i ? { ...ing, [field]: value } : ing)));
  }

  function addStep() {
    setSteps([...steps, { content: "" }]);
  }

  function removeStep(i: number) {
    setSteps(steps.filter((_, idx) => idx !== i));
  }

  function updateStep(i: number, value: string) {
    setSteps(steps.map((s, idx) => (idx === i ? { content: value } : s)));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setError("Le titre est requis.");
      return;
    }

    setLoading(true);
    setError("");

    const payload = {
      title: title.trim(),
      slug: slug || generateSlug(title),
      description: description || null,
      prepTime: Number(prepTime) || 0,
      cookTime: Number(cookTime) || 0,
      difficulty,
      servings: Number(servings) || 1,
      status,
      videoUrl: videoUrl || null,
      macros:
        macroKcal || macroProtein || macroCarbs || macroFat
          ? {
              kcal: Number(macroKcal) || 0,
              protein: Number(macroProtein) || 0,
              carbs: Number(macroCarbs) || 0,
              fat: Number(macroFat) || 0,
            }
          : undefined,
      ingredients: ingredients.filter((ing) => ing.name.trim()),
      steps: steps.filter((s) => s.content.trim()),
    };

    try {
      if (isEditing) {
        await api.put(`/api/admin/recipes/${recipeId}`, payload);
      } else {
        await api.post("/api/admin/recipes", payload);
      }
      router.push("/admin/recettes");
    } catch (err) {
      setError("Une erreur est survenue. Vérifiez que le slug est unique.");
    }

    setLoading(false);
  }

  if (fetchLoading) {
    return <p style={{ color: "var(--color-text-secondary)", fontSize: 14 }}>Chargement...</p>;
  }

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 800 }}>
      {error && (
        <div
          style={{
            background: "#fff5f5",
            border: "1px solid #feb2b2",
            borderRadius: 8,
            padding: "12px 16px",
            marginBottom: 24,
            fontSize: 14,
            color: "#e53e3e",
          }}
        >
          {error}
        </div>
      )}

      {/* Section: Informations de base */}
      <Section title="Informations">
        <Field label="Titre *">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="Ex : Pasta Carbonara"
            style={inputStyle}
          />
        </Field>

        <Field label="Slug (URL)">
          <input
            type="text"
            value={slug}
            onChange={(e) => {
              setSlug(e.target.value);
              setSlugManual(true);
            }}
            placeholder="pasta-carbonara"
            style={inputStyle}
          />
          <p style={{ fontSize: 11, color: "var(--color-text-secondary)", marginTop: 4 }}>
            URL : /recettes/{slug || "..."}
          </p>
        </Field>

        <Field label="Description">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Décrivez brièvement la recette..."
            style={{ ...inputStyle, resize: "vertical" }}
          />
        </Field>

        <Field label="Vidéo (URL YouTube / Vimeo)">
          <input
            type="url"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="https://youtube.com/watch?v=..."
            style={inputStyle}
          />
        </Field>
      </Section>

      {/* Section: Détails */}
      <Section title="Détails">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12 }}>
          <Field label="Prép. (min)">
            <input
              type="number"
              min={0}
              value={prepTime}
              onChange={(e) => setPrepTime(e.target.value)}
              placeholder="15"
              style={inputStyle}
            />
          </Field>
          <Field label="Cuisson (min)">
            <input
              type="number"
              min={0}
              value={cookTime}
              onChange={(e) => setCookTime(e.target.value)}
              placeholder="20"
              style={inputStyle}
            />
          </Field>
          <Field label="Portions">
            <input
              type="number"
              min={1}
              value={servings}
              onChange={(e) => setServings(e.target.value)}
              style={inputStyle}
            />
          </Field>
          <Field label="Difficulté">
            <select
              value={difficulty}
              onChange={(e) =>
                setDifficulty(e.target.value as "easy" | "intermediate" | "hard")
              }
              style={inputStyle}
            >
              {DIFFICULTY_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="Statut">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as "draft" | "published")}
            style={{ ...inputStyle, maxWidth: 200 }}
          >
            <option value="draft">Brouillon</option>
            <option value="published">Publié</option>
          </select>
        </Field>
      </Section>

      {/* Section: Macros */}
      <Section title="Macronutriments (par portion)">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12 }}>
          <Field label="Kcal">
            <input
              type="number"
              min={0}
              value={macroKcal}
              onChange={(e) => setMacroKcal(e.target.value)}
              placeholder="450"
              style={inputStyle}
            />
          </Field>
          <Field label="Protéines (g)">
            <input
              type="number"
              min={0}
              value={macroProtein}
              onChange={(e) => setMacroProtein(e.target.value)}
              placeholder="25"
              style={inputStyle}
            />
          </Field>
          <Field label="Glucides (g)">
            <input
              type="number"
              min={0}
              value={macroCarbs}
              onChange={(e) => setMacroCarbs(e.target.value)}
              placeholder="60"
              style={inputStyle}
            />
          </Field>
          <Field label="Lipides (g)">
            <input
              type="number"
              min={0}
              value={macroFat}
              onChange={(e) => setMacroFat(e.target.value)}
              placeholder="18"
              style={inputStyle}
            />
          </Field>
        </div>
      </Section>

      {/* Section: Ingrédients */}
      <Section title="Ingrédients">
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "3fr 1fr 1fr 2fr 32px",
              gap: 8,
              marginBottom: 4,
            }}
          >
            {["Ingrédient", "Quantité", "Unité", "Note", ""].map((h) => (
              <span
                key={h}
                style={{ fontSize: 11, color: "var(--color-text-secondary)", fontWeight: 600, textTransform: "uppercase" }}
              >
                {h}
              </span>
            ))}
          </div>

          {ingredients.map((ing, i) => (
            <div
              key={i}
              style={{ display: "grid", gridTemplateColumns: "3fr 1fr 1fr 2fr 32px", gap: 8, alignItems: "center" }}
            >
              <input
                type="text"
                value={ing.name}
                onChange={(e) => updateIngredient(i, "name", e.target.value)}
                placeholder="Ex : farine"
                style={inputStyle}
              />
              <input
                type="text"
                value={ing.quantity}
                onChange={(e) => updateIngredient(i, "quantity", e.target.value)}
                placeholder="200"
                style={inputStyle}
              />
              <input
                type="text"
                value={ing.unit}
                onChange={(e) => updateIngredient(i, "unit", e.target.value)}
                placeholder="g"
                style={inputStyle}
              />
              <input
                type="text"
                value={ing.note}
                onChange={(e) => updateIngredient(i, "note", e.target.value)}
                placeholder="tamisée"
                style={inputStyle}
              />
              <button
                type="button"
                onClick={() => removeIngredient(i)}
                style={{
                  background: "transparent",
                  border: "1px solid var(--color-border)",
                  borderRadius: 6,
                  cursor: "pointer",
                  color: "var(--color-text-secondary)",
                  fontSize: 16,
                  lineHeight: 1,
                  padding: "4px 8px",
                }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addIngredient}
          style={{ ...addBtnStyle, marginTop: 8 }}
        >
          + Ajouter un ingrédient
        </button>
      </Section>

      {/* Section: Étapes */}
      <Section title="Étapes">
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {steps.map((step, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "28px 1fr 32px", gap: 10, alignItems: "start" }}>
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 14,
                  color: "var(--color-primary)",
                  fontWeight: 700,
                  paddingTop: 10,
                }}
              >
                {i + 1}.
              </span>
              <textarea
                value={step.content}
                onChange={(e) => updateStep(i, e.target.value)}
                rows={2}
                placeholder={`Description de l'étape ${i + 1}...`}
                style={{ ...inputStyle, resize: "vertical" }}
              />
              <button
                type="button"
                onClick={() => removeStep(i)}
                style={{
                  background: "transparent",
                  border: "1px solid var(--color-border)",
                  borderRadius: 6,
                  cursor: "pointer",
                  color: "var(--color-text-secondary)",
                  fontSize: 16,
                  lineHeight: 1,
                  padding: "4px 8px",
                  marginTop: 6,
                }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addStep}
          style={{ ...addBtnStyle, marginTop: 8 }}
        >
          + Ajouter une étape
        </button>
      </Section>

      {/* Actions */}
      <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
        <button
          type="submit"
          disabled={loading}
          style={{
            background: loading ? "var(--color-border)" : "var(--color-primary)",
            color: "white",
            border: "none",
            borderRadius: 8,
            padding: "12px 28px",
            fontSize: 15,
            fontWeight: 600,
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading
            ? "Enregistrement..."
            : isEditing
            ? "Enregistrer les modifications"
            : "Créer la recette"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/recettes")}
          style={{
            background: "transparent",
            border: "1px solid var(--color-border)",
            borderRadius: 8,
            padding: "12px 20px",
            fontSize: 15,
            color: "var(--color-text-secondary)",
            cursor: "pointer",
          }}
        >
          Annuler
        </button>
      </div>
    </form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        borderRadius: 10,
        padding: 24,
        marginBottom: 20,
      }}
    >
      <h2
        style={{
          fontFamily: "var(--font-serif)",
          fontSize: 16,
          fontWeight: 700,
          color: "var(--color-primary)",
          marginBottom: 16,
        }}
      >
        {title}
      </h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <label style={{ fontSize: 13, fontWeight: 500, color: "var(--color-text-secondary)" }}>
        {label}
      </label>
      {children}
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

const addBtnStyle: React.CSSProperties = {
  background: "var(--color-primary-light)",
  color: "var(--color-primary)",
  border: "1px dashed var(--color-primary)",
  borderRadius: 8,
  padding: "8px 16px",
  fontSize: 13,
  fontWeight: 600,
  cursor: "pointer",
};
