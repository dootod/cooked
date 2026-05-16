"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

interface CategoryOption {
  id: string;
  name: string;
  slug: string;
}

interface MediaItem {
  url: string;
  alt: string;
  isPrimary: boolean;
}

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
  { value: "intermediate", label: "Intermediaire" },
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

const inputClass =
  "w-full px-4 py-2.5 text-[14px] text-text bg-white/80 border border-border/50 rounded-xl outline-none transition-all duration-200 hover:border-primary/40 focus:border-primary focus:ring-[3px] focus:ring-primary/8 focus:bg-white placeholder:text-text-tertiary/60";

const selectClass = `${inputClass} appearance-none bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2212%22%20height%3D%228%22%20viewBox%3D%220%200%2012%208%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M1%201.5L6%206.5L11%201.5%22%20stroke%3D%22%236B7A99%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_12px_center] pr-10`;

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
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const [allCategories, setAllCategories] = useState<CategoryOption[]>([]);
  const [medias, setMedias] = useState<MediaItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(isEditing);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get<{ categories: CategoryOption[] }>("/api/admin/categories")
      .then((d) => setAllCategories(d.categories))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!slugManual && title) {
      setSlug(generateSlug(title));
    }
  }, [title, slugManual]);

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
            categoryIds: string[];
            medias: Array<{ url: string; alt: string | null; isPrimary: boolean }>;
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

        if (recipe.categoryIds?.length) {
          setCategoryIds(recipe.categoryIds);
        }

        if (recipe.medias?.length) {
          setMedias(recipe.medias.map((m) => ({ url: m.url, alt: m.alt ?? "", isPrimary: m.isPrimary })));
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

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files?.length) return;
    setUploading(true);

    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append("file", file);
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"}/api/admin/upload`,
          { method: "POST", body: formData, credentials: "include" }
        );
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          setError((err as { error?: string }).error || "Erreur upload");
          continue;
        }
        const { url } = await res.json() as { url: string };
        setMedias((prev) => [
          ...prev,
          { url, alt: "", isPrimary: prev.length === 0 },
        ]);
      } catch {
        setError("Erreur lors de l'upload");
      }
    }
    setUploading(false);
    e.target.value = "";
  }

  function removeMedia(idx: number) {
    setMedias((prev) => {
      const next = prev.filter((_, i) => i !== idx);
      if (next.length && !next.some((m) => m.isPrimary)) {
        next[0].isPrimary = true;
      }
      return next;
    });
  }

  function setPrimaryMedia(idx: number) {
    setMedias((prev) =>
      prev.map((m, i) => ({ ...m, isPrimary: i === idx }))
    );
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
      categoryIds,
      medias: medias.length ? medias : undefined,
    };

    try {
      if (isEditing) {
        await api.put(`/api/admin/recipes/${recipeId}`, payload);
      } else {
        await api.post("/api/admin/recipes", payload);
      }
      router.push("/admin/recettes");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue.");
    }

    setLoading(false);
  }

  if (fetchLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-[960px] mx-auto">
      {error && (
        <div className="mb-6 px-4 py-3 text-[14px] text-red-600 bg-red-50/80 border border-red-100 rounded-xl flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
          {error}
        </div>
      )}

      {/* Informations */}
      <Section title="Informations" icon={
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
      }>
        <div className="space-y-4">
          <Field label="Titre *">
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="Ex : Pasta Carbonara" className={inputClass} />
          </Field>
          <Field label="Slug (URL)">
            <input type="text" value={slug} onChange={(e) => { setSlug(e.target.value); setSlugManual(true); }} placeholder="pasta-carbonara" className={inputClass} />
            <p className="text-[11px] text-text-tertiary mt-1.5 font-mono">/recettes/{slug || "..."}</p>
          </Field>
          <Field label="Description">
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Decrivez brievement la recette..." className={`${inputClass} resize-y`} />
          </Field>
          <Field label="Video (URL YouTube / Vimeo)">
            <input type="url" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="https://youtube.com/watch?v=..." className={inputClass} />
          </Field>
        </div>
      </Section>

      {/* Medias */}
      <Section title="Images" icon={
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
          <circle cx="9" cy="9" r="2" />
          <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
        </svg>
      }>
        {medias.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-4">
            {medias.map((m, i) => (
              <div key={i} className="relative group rounded-xl overflow-hidden border border-border/30 aspect-square">
                <img src={m.url} alt={m.alt || "Image"} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPrimaryMedia(i)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                      m.isPrimary ? "bg-primary text-white" : "bg-white/20 text-white hover:bg-white/40"
                    }`}
                    title={m.isPrimary ? "Image principale" : "Definir comme principale"}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill={m.isPrimary ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => removeMedia(i)}
                    className="w-8 h-8 rounded-full bg-red-500/80 text-white flex items-center justify-center hover:bg-red-600 transition-all cursor-pointer"
                    title="Supprimer"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
                {m.isPrimary && (
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-primary text-white text-[10px] font-bold">
                    Principale
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        <div className="flex flex-col sm:flex-row gap-3">
          <label className="flex-1 relative cursor-pointer">
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              multiple
              onChange={handleFileUpload}
              className="sr-only"
            />
            <div className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-primary/30 rounded-xl text-[13px] font-semibold text-primary hover:bg-primary/5 hover:border-primary/50 transition-all">
              {uploading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                  Upload en cours...
                </span>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  Ajouter des images
                </>
              )}
            </div>
          </label>
        </div>
        <p className="text-[11px] text-text-tertiary mt-2">JPEG, PNG, WebP ou AVIF. Max 5 Mo par image.</p>
      </Section>

      {/* Details */}
      <Section title="Details" icon={
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      }>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <Field label="Prep. (min)">
            <input type="number" min={0} value={prepTime} onChange={(e) => setPrepTime(e.target.value)} placeholder="15" className={inputClass} />
          </Field>
          <Field label="Cuisson (min)">
            <input type="number" min={0} value={cookTime} onChange={(e) => setCookTime(e.target.value)} placeholder="20" className={inputClass} />
          </Field>
          <Field label="Portions">
            <input type="number" min={1} value={servings} onChange={(e) => setServings(e.target.value)} className={inputClass} />
          </Field>
          <Field label="Difficulte">
            <select value={difficulty} onChange={(e) => setDifficulty(e.target.value as "easy" | "intermediate" | "hard")} className={selectClass}>
              {DIFFICULTY_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </Field>
        </div>
        <Field label="Statut">
          <select value={status} onChange={(e) => setStatus(e.target.value as "draft" | "published")} className={`${selectClass} sm:max-w-[240px]`}>
            <option value="draft">Brouillon</option>
            <option value="published">Publie</option>
          </select>
        </Field>
      </Section>

      {/* Categories */}
      {allCategories.length > 0 && (
        <Section title="Categories" icon={
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z" />
          </svg>
        }>
          <div className="flex flex-wrap gap-2">
            {allCategories.map((cat) => {
              const selected = categoryIds.includes(cat.id);
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() =>
                    setCategoryIds((prev) =>
                      selected ? prev.filter((id) => id !== cat.id) : [...prev, cat.id]
                    )
                  }
                  className={`px-4 py-2 text-[13px] font-medium rounded-xl border transition-all duration-200 cursor-pointer ${
                    selected
                      ? "bg-primary text-white border-primary shadow-[0_2px_12px_rgba(71,91,138,0.3)]"
                      : "bg-white/80 text-text-secondary border-border/50 hover:border-primary/40 hover:text-primary"
                  }`}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>
        </Section>
      )}

      {/* Macros */}
      <Section title="Macronutriments" icon={
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 20V10M12 20V4M6 20v-6" />
        </svg>
      }>
        <p className="text-[11px] text-text-tertiary mb-3">Valeurs par portion</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Field label="Kcal">
            <input type="number" min={0} value={macroKcal} onChange={(e) => setMacroKcal(e.target.value)} placeholder="450" className={inputClass} />
          </Field>
          <Field label="Proteines (g)">
            <input type="number" min={0} value={macroProtein} onChange={(e) => setMacroProtein(e.target.value)} placeholder="25" className={inputClass} />
          </Field>
          <Field label="Glucides (g)">
            <input type="number" min={0} value={macroCarbs} onChange={(e) => setMacroCarbs(e.target.value)} placeholder="60" className={inputClass} />
          </Field>
          <Field label="Lipides (g)">
            <input type="number" min={0} value={macroFat} onChange={(e) => setMacroFat(e.target.value)} placeholder="18" className={inputClass} />
          </Field>
        </div>
      </Section>

      {/* Ingredients */}
      <Section title="Ingredients" icon={
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 5H2v7l6.29 6.29c.94.94 2.48.94 3.42 0l3.58-3.58c.94-.94.94-2.48 0-3.42L9 5Z" />
          <path d="M6 9.01V9" />
          <path d="m15 5 6.3 6.3a2.4 2.4 0 0 1 0 3.4L17 19" />
        </svg>
      }>
        <div className="space-y-3">
          {/* Column headers — desktop only */}
          <div className="hidden lg:grid grid-cols-[3fr_1fr_1fr_2fr_40px] gap-3">
            {["Ingredient", "Qte", "Unite", "Note", ""].map((h) => (
              <span key={h} className="text-[10px] font-bold tracking-[0.08em] uppercase text-text-tertiary">{h}</span>
            ))}
          </div>

          {ingredients.map((ing, i) => (
            <div key={i} className="relative">
              {/* Desktop: single row */}
              <div className="hidden lg:grid grid-cols-[3fr_1fr_1fr_2fr_40px] gap-3 items-center">
                <input type="text" value={ing.name} onChange={(e) => updateIngredient(i, "name", e.target.value)} placeholder="Farine" className={inputClass} />
                <input type="text" value={ing.quantity} onChange={(e) => updateIngredient(i, "quantity", e.target.value)} placeholder="200" className={inputClass} />
                <input type="text" value={ing.unit} onChange={(e) => updateIngredient(i, "unit", e.target.value)} placeholder="g" className={inputClass} />
                <input type="text" value={ing.note} onChange={(e) => updateIngredient(i, "note", e.target.value)} placeholder="tamisee" className={inputClass} />
                <button
                  type="button"
                  onClick={() => removeIngredient(i)}
                  className="w-9 h-9 flex items-center justify-center text-text-tertiary hover:text-red-500 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>

              {/* Mobile/tablet: stacked card */}
              <div className="lg:hidden admin-glass rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-text-tertiary uppercase tracking-wide">Ingredient {i + 1}</span>
                  <button
                    type="button"
                    onClick={() => removeIngredient(i)}
                    className="w-8 h-8 flex items-center justify-center text-text-tertiary hover:text-red-500 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
                <input type="text" value={ing.name} onChange={(e) => updateIngredient(i, "name", e.target.value)} placeholder="Nom (ex: Farine)" className={inputClass} />
                <div className="grid grid-cols-2 gap-3">
                  <input type="text" value={ing.quantity} onChange={(e) => updateIngredient(i, "quantity", e.target.value)} placeholder="Quantite (200)" className={inputClass} />
                  <input type="text" value={ing.unit} onChange={(e) => updateIngredient(i, "unit", e.target.value)} placeholder="Unite (g)" className={inputClass} />
                </div>
                <input type="text" value={ing.note} onChange={(e) => updateIngredient(i, "note", e.target.value)} placeholder="Note (ex: tamisee)" className={inputClass} />
              </div>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addIngredient}
          className="mt-4 inline-flex items-center gap-1.5 px-4 py-2.5 text-[13px] font-semibold text-primary border border-dashed border-primary/30 rounded-xl hover:bg-primary/5 hover:border-primary/50 transition-all cursor-pointer"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Ajouter un ingredient
        </button>
      </Section>

      {/* Etapes */}
      <Section title="Etapes" icon={
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="8" y1="6" x2="21" y2="6" />
          <line x1="8" y1="12" x2="21" y2="12" />
          <line x1="8" y1="18" x2="21" y2="18" />
          <line x1="3" y1="6" x2="3.01" y2="6" />
          <line x1="3" y1="12" x2="3.01" y2="12" />
          <line x1="3" y1="18" x2="3.01" y2="18" />
        </svg>
      }>
        <div className="space-y-4">
          {steps.map((step, i) => (
            <div key={i} className="flex gap-3 items-start">
              <div className="w-9 h-9 mt-1 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-white text-[12px] font-bold shadow-[0_2px_8px_rgba(79,111,232,0.25)] shrink-0">
                {i + 1}
              </div>
              <div className="flex-1">
                <textarea
                  value={step.content}
                  onChange={(e) => updateStep(i, e.target.value)}
                  rows={3}
                  placeholder={`Description de l'etape ${i + 1}...`}
                  className={`${inputClass} resize-y`}
                />
              </div>
              <button
                type="button"
                onClick={() => removeStep(i)}
                className="mt-1 w-9 h-9 flex items-center justify-center text-text-tertiary hover:text-red-500 hover:bg-red-50 rounded-lg transition-all cursor-pointer shrink-0"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addStep}
          className="mt-4 inline-flex items-center gap-1.5 px-4 py-2.5 text-[13px] font-semibold text-primary border border-dashed border-primary/30 rounded-xl hover:bg-primary/5 hover:border-primary/50 transition-all cursor-pointer"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Ajouter une etape
        </button>
      </Section>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 mt-2">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 px-7 py-3 bg-gradient-to-r from-primary to-primary/90 text-white text-[15px] font-semibold rounded-xl shadow-[0_4px_20px_rgba(79,111,232,0.3)] hover:shadow-[0_8px_30px_rgba(79,111,232,0.4)] hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
        >
          {loading && (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          )}
          {loading ? "Enregistrement..." : isEditing ? "Enregistrer les modifications" : "Creer la recette"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/recettes")}
          className="px-5 py-3 text-[15px] font-medium text-text-secondary border border-border/50 rounded-xl hover:bg-primary/5 hover:text-primary hover:border-primary/30 transition-all cursor-pointer"
        >
          Annuler
        </button>
      </div>
    </form>
  );
}

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="mb-6 admin-glass rounded-xl p-5 sm:p-6">
      <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-border/30">
        <span className="text-primary">{icon}</span>
        <h2 className="text-[15px] font-bold text-text">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[12px] font-semibold text-text-secondary mb-1.5 tracking-wide">
        {label}
      </label>
      {children}
    </div>
  );
}
