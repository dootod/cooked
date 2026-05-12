import Link from "next/link";
import { notFound } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

type Ingredient = {
  id: string;
  name: string;
  quantity: number | null;
  unit: string | null;
  note: string | null;
  order: number;
};

type Step = {
  id: string;
  content: string;
  order: number;
  mediaUrl: string | null;
};

type RecipeDetail = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  prepTime: number;
  cookTime: number;
  difficulty: "easy" | "intermediate" | "hard";
  servings: number;
  videoUrl: string | null;
  ingredients: Ingredient[];
  steps: Step[];
  macros: { kcal: number; protein: number; carbs: number; fat: number } | null;
  medias: { id: string; url: string; alt: string | null; isPrimary: boolean }[];
  categories: { id: string; name: string; slug: string }[];
  tags: { id: string; name: string; slug: string }[];
  equipment: { id: string; name: string; iconSlug: string }[];
};

async function getRecipe(slug: string): Promise<RecipeDetail | null> {
  try {
    const res = await fetch(`${API_URL}/api/recipes/${slug}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.recipe ?? null;
  } catch {
    return null;
  }
}

const difficultyLabel: Record<string, string> = {
  easy: "Facile",
  intermediate: "Moyen",
  hard: "Difficile",
};

const difficultyColor: Record<string, string> = {
  easy: "bg-primary/10 text-primary",
  intermediate: "bg-accent-light text-accent-hover",
  hard: "bg-red-50 text-red-500",
};

function formatQuantity(qty: number | null): string {
  if (qty === null) return "";
  if (qty === Math.floor(qty)) return String(qty);
  return qty.toFixed(1);
}

function getVideoEmbedUrl(url: string): string | null {
  const ytMatch = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/
  );
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  return null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const recipe = await getRecipe(slug);
  if (!recipe) return { title: "Recette non trouvee" };
  return {
    title: `${recipe.title} — Cooked`,
    description: recipe.description ?? `Decouvrez la recette ${recipe.title}`,
  };
}

export default async function RecetteDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const recipe = await getRecipe(slug);

  if (!recipe) notFound();

  const totalTime = recipe.prepTime + recipe.cookTime;
  const primaryMedia = recipe.medias.find((m) => m.isPrimary);
  const gallery = recipe.medias.filter((m) => !m.isPrimary);
  const videoEmbed = recipe.videoUrl
    ? getVideoEmbedUrl(recipe.videoUrl)
    : null;

  return (
    <div>
      {/* Dark hero with image */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[#0a0f1e]">
          {primaryMedia && (
            <img
              src={primaryMedia.url}
              alt={primaryMedia.alt ?? recipe.title}
              className="w-full h-full object-cover opacity-30"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f1e] via-[#0a0f1e]/80 to-[#0a0f1e]/60" />
          <div
            className="absolute top-[30%] left-[10%] w-[400px] h-[400px] bg-primary/[0.06] rounded-full blur-[150px]"
            style={{ animation: "public-glow-pulse 8s ease-in-out infinite" }}
          />
          <div className="absolute inset-0 public-dot-grid opacity-15" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16 sm:pb-20">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-white/40 mb-8">
            <Link href="/" className="hover:text-white transition-colors">
              Accueil
            </Link>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m9 18 6-6-6-6" />
            </svg>
            <Link href="/recettes" className="hover:text-white transition-colors">
              Recettes
            </Link>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m9 18 6-6-6-6" />
            </svg>
            <span className="text-white/60 truncate">{recipe.title}</span>
          </nav>

          <div className="flex flex-wrap items-center gap-2 mb-4">
            {recipe.categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/categories/${cat.slug}`}
                className="px-3 py-1 rounded-full bg-white/[0.08] border border-white/[0.1] text-xs font-medium text-white/70 hover:bg-primary hover:text-white hover:border-primary transition-colors"
              >
                {cat.name}
              </Link>
            ))}
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                recipe.difficulty === "easy"
                  ? "bg-primary/20 text-primary"
                  : recipe.difficulty === "intermediate"
                    ? "bg-accent/20 text-accent"
                    : "bg-red-500/20 text-red-400"
              }`}
            >
              {difficultyLabel[recipe.difficulty]}
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-white leading-tight">
            {recipe.title}
          </h1>
          {recipe.description && (
            <p className="mt-4 text-white/40 max-w-2xl text-lg leading-relaxed">
              {recipe.description}
            </p>
          )}

          {/* Quick stats */}
          <div className="mt-8 flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-white/[0.06] flex items-center justify-center">
                <svg className="text-primary" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
              <div>
                <p className="text-lg font-bold font-mono text-white">{totalTime}</p>
                <p className="text-[10px] text-white/30 uppercase tracking-wide">min total</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-white/[0.06] flex items-center justify-center">
                <svg className="text-accent" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z" />
                  <line x1="6" y1="17" x2="18" y2="17" />
                </svg>
              </div>
              <div>
                <p className="text-lg font-bold font-mono text-white">{recipe.prepTime}</p>
                <p className="text-[10px] text-white/30 uppercase tracking-wide">min prep</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-white/[0.06] flex items-center justify-center">
                <svg className="text-[#a78bfa]" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                </svg>
              </div>
              <div>
                <p className="text-lg font-bold font-mono text-white">{recipe.servings}</p>
                <p className="text-[10px] text-white/30 uppercase tracking-wide">portions</p>
              </div>
            </div>
            {recipe.macros && (
              <div className="flex items-center gap-3 ml-auto">
                <span className="text-xs font-mono text-white/40 px-2.5 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06]">
                  {Math.round(recipe.macros.kcal)} kcal
                </span>
                <span className="text-xs font-mono text-accent/80 px-2.5 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06]">
                  {Math.round(recipe.macros.protein)}g prot
                </span>
                <span className="text-xs font-mono text-white/40 px-2.5 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06]">
                  {Math.round(recipe.macros.carbs)}g gluc
                </span>
                <span className="text-xs font-mono text-white/40 px-2.5 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06]">
                  {Math.round(recipe.macros.fat)}g lip
                </span>
              </div>
            )}
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-bg to-transparent" />
      </section>

    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Left column — 60% */}
        <div className="lg:col-span-3 space-y-8">
          {/* Hero image */}
          <div className="aspect-[16/10] rounded-2xl overflow-hidden bg-gradient-to-br from-primary-light to-accent-light">
            {primaryMedia ? (
              <img
                src={primaryMedia.url}
                alt={primaryMedia.alt ?? recipe.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <svg
                  className="text-primary/20"
                  width="80"
                  height="80"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M15 11h.01M11 15h.01M16 16h.01" />
                  <path d="m2 16 20 6-6-20A20 20 0 0 0 2 16" />
                </svg>
              </div>
            )}
          </div>

          {/* Gallery */}
          {gallery.length > 0 && (
            <div className="grid grid-cols-3 gap-3">
              {gallery.map((media) => (
                <div
                  key={media.id}
                  className="aspect-square rounded-xl overflow-hidden bg-primary-light"
                >
                  <img
                    src={media.url}
                    alt={media.alt ?? ""}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Video */}
          {videoEmbed && (
            <div className="aspect-video rounded-2xl overflow-hidden bg-black">
              <iframe
                src={videoEmbed}
                className="w-full h-full"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              />
            </div>
          )}

          {/* Steps */}
          <div>
            <h2 className="text-xl font-serif font-bold text-text mb-6">
              Preparation
            </h2>
            <div className="space-y-6">
              {recipe.steps.map((step, i) => (
                <div key={step.id} className="flex gap-4">
                  <div className="shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center text-white text-sm font-bold">
                    {i + 1}
                  </div>
                  <div className="flex-1 pt-1">
                    <p className="text-text leading-relaxed">{step.content}</p>
                    {step.mediaUrl && (
                      <div className="mt-3 rounded-xl overflow-hidden max-w-sm">
                        <img
                          src={step.mediaUrl}
                          alt={`Etape ${i + 1}`}
                          className="w-full"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column — sticky sidebar 40% */}
        <div className="lg:col-span-2">
          <div className="lg:sticky lg:top-24 space-y-6">
            {/* Macros */}
            {recipe.macros && (
              <div className="p-4 rounded-xl bg-white border border-border/30">
                <h3 className="text-sm font-semibold text-text mb-3">
                  Macros par portion
                </h3>
                <div className="grid grid-cols-4 gap-2">
                  <div className="text-center">
                    <p className="text-lg font-bold font-mono text-primary">
                      {Math.round(recipe.macros.kcal)}
                    </p>
                    <p className="text-[10px] text-text-tertiary uppercase">
                      kcal
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold font-mono text-accent">
                      {Math.round(recipe.macros.protein)}g
                    </p>
                    <p className="text-[10px] text-text-tertiary uppercase">
                      prot
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold font-mono text-text">
                      {Math.round(recipe.macros.carbs)}g
                    </p>
                    <p className="text-[10px] text-text-tertiary uppercase">
                      glucides
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold font-mono text-text">
                      {Math.round(recipe.macros.fat)}g
                    </p>
                    <p className="text-[10px] text-text-tertiary uppercase">
                      lipides
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Ingredients */}
            <div className="p-4 rounded-xl bg-white border border-border/30">
              <h3 className="text-sm font-semibold text-text mb-3">
                Ingredients
                <span className="ml-1 text-text-tertiary font-normal">
                  ({recipe.servings} portions)
                </span>
              </h3>
              <ul className="space-y-2">
                {recipe.ingredients.map((ing) => (
                  <li
                    key={ing.id}
                    className="flex items-start gap-2 text-sm"
                  >
                    <span className="shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full bg-primary/40" />
                    <span className="text-text">
                      {ing.quantity !== null && (
                        <span className="font-mono font-medium">
                          {formatQuantity(ing.quantity)}
                          {ing.unit ? ` ${ing.unit}` : ""}
                        </span>
                      )}{" "}
                      {ing.name}
                      {ing.note && (
                        <span className="text-text-tertiary"> ({ing.note})</span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Equipment */}
            {recipe.equipment.length > 0 && (
              <div className="p-4 rounded-xl bg-white border border-border/30">
                <h3 className="text-sm font-semibold text-text mb-3">
                  Materiel
                </h3>
                <div className="flex flex-wrap gap-2">
                  {recipe.equipment.map((eq) => (
                    <span
                      key={eq.id}
                      className="px-3 py-1.5 rounded-lg bg-primary-light/50 text-xs font-medium text-text"
                    >
                      {eq.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Tags */}
            {recipe.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {recipe.tags.map((tag) => (
                  <Link
                    key={tag.id}
                    href={`/tags/${tag.slug}`}
                    className="px-3 py-1 rounded-full bg-accent-light/60 text-xs font-medium text-accent-hover hover:bg-accent hover:text-white transition-colors"
                  >
                    #{tag.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}
