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
      {/* === IMMERSIVE HERO === */}
      <section className="relative h-[55vh] min-h-[420px] max-h-[650px] overflow-hidden">
        <div className="absolute inset-0 bg-[#0a0f1e]">
          {primaryMedia && (
            <img
              src={primaryMedia.url}
              alt={primaryMedia.alt ?? recipe.title}
              className="w-full h-full object-cover opacity-40"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f1e] via-[#0a0f1e]/60 to-transparent" />
          <div
            className="absolute bottom-[10%] left-[5%] w-[500px] h-[500px] bg-primary/[0.08] rounded-full blur-[180px]"
            style={{ animation: "public-glow-pulse 8s ease-in-out infinite" }}
          />
          <div className="absolute inset-0 public-dot-grid opacity-10" />
        </div>

        <div className="absolute inset-0 flex flex-col justify-between">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 w-full">
            <nav className="flex items-center gap-2 text-sm text-white/40">
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
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 w-full">
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
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-white leading-[1.1] max-w-4xl">
              {recipe.title}
            </h1>
            {recipe.description && (
              <p className="mt-4 text-white/40 text-lg max-w-2xl leading-relaxed">
                {recipe.description}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* === FLOATING STATS BAR === */}
      <div className="relative -mt-8 z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4 sm:gap-6 px-5 sm:px-7 py-4 rounded-2xl bg-white/90 backdrop-blur-xl border border-border/30 shadow-xl shadow-black/[0.04]">
          <div className="flex flex-wrap items-center gap-5 sm:gap-7">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                <svg className="text-primary" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-bold font-mono text-text">{totalTime} min</p>
                <p className="text-[10px] text-text-tertiary uppercase tracking-wide">Total</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center">
                <svg className="text-accent" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z" />
                  <line x1="6" y1="17" x2="18" y2="17" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-bold font-mono text-text">{recipe.prepTime} min</p>
                <p className="text-[10px] text-text-tertiary uppercase tracking-wide">Prep</p>
              </div>
            </div>
            {recipe.cookTime > 0 && (
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#a78bfa]/10 flex items-center justify-center">
                  <svg className="text-[#a78bfa]" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 12h.01" />
                    <path d="M12 2a4.5 4.5 0 0 0-4.5 4.5c0 3 4.5 9.5 4.5 9.5s4.5-6.5 4.5-9.5A4.5 4.5 0 0 0 12 2Z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-bold font-mono text-text">{recipe.cookTime} min</p>
                  <p className="text-[10px] text-text-tertiary uppercase tracking-wide">Cuisson</p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-text/[0.06] flex items-center justify-center">
                <svg className="text-text-secondary" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-bold font-mono text-text">{recipe.servings}</p>
                <p className="text-[10px] text-text-tertiary uppercase tracking-wide">Portions</p>
              </div>
            </div>
          </div>
          {recipe.macros && (
            <div className="hidden lg:flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-lg bg-primary/8 text-xs font-mono font-semibold text-primary">
                {Math.round(recipe.macros.kcal)} kcal
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-accent/8 text-xs font-mono font-semibold text-accent">
                {Math.round(recipe.macros.protein)}g prot
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-text/[0.04] text-xs font-mono text-text-secondary">
                {Math.round(recipe.macros.carbs)}g gluc
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-text/[0.04] text-xs font-mono text-text-secondary">
                {Math.round(recipe.macros.fat)}g lip
              </span>
            </div>
          )}
        </div>
      </div>

      {/* === MAIN CONTENT === */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">
          {/* SIDEBAR */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-24 space-y-5">
              {/* Ingredients */}
              <div className="rounded-2xl overflow-hidden border border-border/30">
                <div className="bg-primary/[0.06] px-5 py-3.5 flex items-center gap-2.5">
                  <svg className="text-primary" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z" />
                    <line x1="6" y1="17" x2="18" y2="17" />
                  </svg>
                  <h3 className="font-serif font-bold text-text">Ingredients</h3>
                  <span className="text-sm text-text-tertiary font-normal ml-auto">
                    {recipe.servings} portions
                  </span>
                </div>
                <div className="bg-white p-5">
                  <ul className="space-y-3">
                    {recipe.ingredients.map((ing) => (
                      <li key={ing.id} className="flex items-start gap-3 text-sm group">
                        <span className="shrink-0 mt-1 w-5 h-5 rounded-md border-2 border-border/50 group-hover:border-primary/40 transition-colors" />
                        <span className="text-text">
                          {ing.quantity !== null && (
                            <span className="font-mono font-semibold text-primary">
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
              </div>

              {/* Equipment */}
              {recipe.equipment.length > 0 && (
                <div className="p-5 rounded-2xl bg-white border border-border/30">
                  <h3 className="text-sm font-semibold text-text mb-3 flex items-center gap-2">
                    <svg className="text-text-tertiary" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                    </svg>
                    Materiel
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {recipe.equipment.map((eq) => (
                      <span
                        key={eq.id}
                        className="px-3 py-1.5 rounded-lg bg-primary/[0.06] text-xs font-medium text-text"
                      >
                        {eq.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Macros (mobile — desktop shows in stats bar) */}
              {recipe.macros && (
                <div className="p-5 rounded-2xl bg-white border border-border/30 lg:hidden">
                  <h3 className="text-sm font-semibold text-text mb-3">
                    Macros par portion
                  </h3>
                  <div className="grid grid-cols-4 gap-2">
                    <div className="text-center">
                      <p className="text-lg font-bold font-mono text-primary">
                        {Math.round(recipe.macros.kcal)}
                      </p>
                      <p className="text-[10px] text-text-tertiary uppercase">kcal</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold font-mono text-accent">
                        {Math.round(recipe.macros.protein)}g
                      </p>
                      <p className="text-[10px] text-text-tertiary uppercase">prot</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold font-mono text-text">
                        {Math.round(recipe.macros.carbs)}g
                      </p>
                      <p className="text-[10px] text-text-tertiary uppercase">glucides</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold font-mono text-text">
                        {Math.round(recipe.macros.fat)}g
                      </p>
                      <p className="text-[10px] text-text-tertiary uppercase">lipides</p>
                    </div>
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
                      className="px-3 py-1 rounded-full bg-accent/10 text-xs font-medium text-accent-hover hover:bg-accent hover:text-white transition-colors"
                    >
                      #{tag.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* MAIN — Steps, Gallery, Video */}
          <div className="lg:col-span-2">
            {/* Section header */}
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <svg className="text-primary" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                </svg>
              </div>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-text">
                Preparation
              </h2>
              <div className="flex-1 h-px bg-gradient-to-r from-border/40 to-transparent" />
            </div>

            {/* Steps timeline */}
            <div className="space-y-0">
              {recipe.steps.map((step, i) => (
                <div key={step.id} className="flex gap-5 sm:gap-6">
                  <div className="flex flex-col items-center shrink-0 w-10">
                    <div className="shrink-0 w-10 h-10 rounded-full bg-white border-2 border-primary flex items-center justify-center text-primary text-sm font-bold shadow-sm">
                      {i + 1}
                    </div>
                    {i < recipe.steps.length - 1 && (
                      <div className="flex-1 w-0.5 bg-gradient-to-b from-primary/25 to-primary/10 mt-2 mb-0 rounded-full" />
                    )}
                  </div>
                  <div className="flex-1 pb-6">
                    <div className="p-4 sm:p-5 rounded-xl bg-white border border-border/20 shadow-sm hover:shadow-md hover:border-primary/15 transition-all">
                      <p className="text-text leading-relaxed">{step.content}</p>
                      {step.mediaUrl && (
                        <div className="mt-3 rounded-lg overflow-hidden max-w-sm">
                          <img
                            src={step.mediaUrl}
                            alt={`Etape ${i + 1}`}
                            className="w-full"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Gallery */}
            {gallery.length > 0 && (
              <div className="mt-10">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center">
                    <svg className="text-accent" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-serif font-bold text-text">Photos</h3>
                </div>
                <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 snap-x">
                  {gallery.map((media) => (
                    <div
                      key={media.id}
                      className="shrink-0 w-40 h-40 sm:w-52 sm:h-52 rounded-xl overflow-hidden snap-start"
                    >
                      <img
                        src={media.url}
                        alt={media.alt ?? ""}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Video */}
            {videoEmbed && (
              <div className="mt-10">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-9 h-9 rounded-xl bg-[#a78bfa]/10 flex items-center justify-center">
                    <svg className="text-[#a78bfa]" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-serif font-bold text-text">Video</h3>
                </div>
                <div className="aspect-video rounded-2xl overflow-hidden bg-black shadow-lg">
                  <iframe
                    src={videoEmbed}
                    className="w-full h-full"
                    allowFullScreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
