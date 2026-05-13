import Link from "next/link";
import RecipeCard from "@/components/public/RecipeCard";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

type RecipeListItem = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  prepTime: number;
  cookTime: number;
  difficulty: "easy" | "intermediate" | "hard";
  servings: number;
  primaryMedia: { url: string; alt: string | null } | null;
  macros: { kcal: number; protein: number; carbs: number; fat: number } | null;
  categories: { name: string; slug: string }[];
  tags: { name: string; slug: string }[];
};

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
};

async function getRecipes(): Promise<RecipeListItem[]> {
  try {
    const res = await fetch(`${API_URL}/api/recipes?limit=8`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.recipes ?? [];
  } catch {
    return [];
  }
}

async function getCategories(): Promise<Category[]> {
  try {
    const res = await fetch(`${API_URL}/api/categories`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.categories ?? [];
  } catch {
    return [];
  }
}

const categoryIcons: Record<string, React.ReactNode> = {
  plat: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 11h.01M11 15h.01M16 16h.01" /><path d="m2 16 20 6-6-20A20 20 0 0 0 2 16" />
    </svg>
  ),
  dessert: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12h20" /><path d="M20 12v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8" /><path d="m4 8 16-4" />
    </svg>
  ),
  entree: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a10 10 0 0 1 10 10 2 2 0 0 1-2 2H4a2 2 0 0 1-2-2A10 10 0 0 1 12 2Z" /><path d="M4 14v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4" />
    </svg>
  ),
  boisson: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 2h8l4 10H4L8 2Z" /><path d="M12 12v6" /><path d="M6 18h12" />
    </svg>
  ),
  snack: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2Z" />
    </svg>
  ),
};

function getCategoryIcon(slug: string) {
  return categoryIcons[slug] ?? categoryIcons["plat"];
}

export default async function HomePage() {
  const [recipes, categories] = await Promise.all([
    getRecipes(),
    getCategories(),
  ]);

  const heroRecipe = recipes[0];
  const gridRecipes = recipes.slice(1);

  return (
    <div>
      {/* Hero section — dark immersive */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[#0a0f1e]">
          <div
            className="absolute top-[20%] left-[15%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[150px]"
            style={{ animation: "public-glow-pulse 6s ease-in-out infinite" }}
          />
          <div
            className="absolute bottom-[10%] right-[10%] w-[400px] h-[400px] bg-accent/8 rounded-full blur-[120px]"
            style={{ animation: "public-glow-pulse 8s ease-in-out infinite 3s" }}
          />
          <div
            className="absolute top-[50%] right-[30%] w-[300px] h-[300px] bg-[#a78bfa]/[0.06] rounded-full blur-[100px]"
            style={{ animation: "public-glow-pulse 10s ease-in-out infinite 1s" }}
          />
          <div className="absolute inset-0 public-dot-grid opacity-30" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
          <div className="text-center max-w-3xl mx-auto public-fade-up">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.06] border border-white/[0.08] mb-6">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs font-medium text-white/50">{recipes.length} recettes disponibles</span>
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-serif font-bold text-white leading-[1.1]">
              Des recettes qui ont
              <span className="block public-gradient-text"> du gout</span>
            </h1>
            <p className="mt-6 text-lg text-white/40 max-w-xl mx-auto">
              Explorez des recettes detaillees avec macros, etapes illustrees et temps de preparation precis.
            </p>
            <div className="mt-10 flex items-center justify-center gap-4">
              <Link
                href="/recettes"
                className="group px-7 py-3.5 rounded-xl bg-gradient-to-r from-primary to-primary-hover text-white font-medium hover:shadow-xl hover:shadow-primary/25 transition-all duration-300 flex items-center gap-2"
              >
                Explorer les recettes
                <svg className="transition-transform group-hover:translate-x-1" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-bg to-transparent" />
      </section>

      {/* Bento grid — proper layout */}
      {recipes.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-text">
                Recettes recentes
              </h2>
              <p className="mt-1 text-text-secondary">
                Les dernieres creations ajoutees
              </p>
            </div>
            <Link
              href="/recettes"
              className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary-hover transition-colors group"
            >
              Tout voir
              <svg className="transition-transform group-hover:translate-x-1" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
              </svg>
            </Link>
          </div>

          {/* Bento: hero left (2x2) + 2 medium right on desktop */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Hero — spans 2/3 on desktop */}
            {heroRecipe && (
              <div className="lg:col-span-2 lg:row-span-2">
                <RecipeCard recipe={heroRecipe} size="hero" />
              </div>
            )}
            {/* Two medium cards stacked on right */}
            {gridRecipes.slice(0, 2).map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} size="medium" />
            ))}
          </div>

          {/* Second row: 4 equal cards */}
          {gridRecipes.length > 2 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
              {gridRecipes.slice(2, 6).map((recipe, i) => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  size={i >= 4 ? "small" : "medium"}
                />
              ))}
            </div>
          )}

          <div className="mt-8 text-center sm:hidden">
            <Link href="/recettes" className="inline-flex items-center gap-1.5 text-sm font-medium text-primary">
              Voir toutes les recettes
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
              </svg>
            </Link>
          </div>
        </section>
      )}

      {/* Categories — dark section */}
      {categories.length > 0 && (
        <>
        <div className="relative">
          <div className="h-px bg-gradient-to-r from-transparent via-primary/15 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-primary/[0.03] to-transparent blur-md" />
        </div>
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-[#0a0f1e]">
            <div
              className="absolute bottom-[20%] left-[20%] w-[400px] h-[400px] bg-primary/[0.08] rounded-full blur-[150px]"
              style={{ animation: "public-glow-pulse 8s ease-in-out infinite" }}
            />
            <div
              className="absolute top-[10%] right-[15%] w-[300px] h-[300px] bg-accent/[0.06] rounded-full blur-[120px]"
              style={{ animation: "public-glow-pulse 10s ease-in-out infinite 3s" }}
            />
            <div className="absolute inset-0 public-dot-grid opacity-20" />
          </div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white mb-10">
              Par categorie
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/categories/${cat.slug}`}
                  className="group flex flex-col items-center gap-3 p-6 rounded-2xl bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08] hover:border-primary/20 transition-all duration-300"
                >
                  <div className="w-14 h-14 rounded-xl bg-white/[0.06] flex items-center justify-center text-white/60 group-hover:bg-gradient-to-br group-hover:from-primary group-hover:to-primary-hover group-hover:text-white transition-all duration-300">
                    {getCategoryIcon(cat.slug)}
                  </div>
                  <span className="text-sm font-medium text-white/60 group-hover:text-white transition-colors">
                    {cat.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
        </>
      )}

      {/* Empty state */}
      {recipes.length === 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <div className="max-w-md mx-auto public-glow-card p-10 rounded-2xl">
            <svg className="mx-auto text-primary/20 mb-6" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 11h.01M11 15h.01M16 16h.01" /><path d="m2 16 20 6-6-20A20 20 0 0 0 2 16" />
            </svg>
            <h2 className="text-xl font-serif font-bold text-text">Aucune recette pour le moment</h2>
            <p className="mt-2 text-text-secondary">Les recettes apparaitront ici une fois publiees depuis le backoffice.</p>
          </div>
        </section>
      )}
    </div>
  );
}
