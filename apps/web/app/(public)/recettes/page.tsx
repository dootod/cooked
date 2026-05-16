import Link from "next/link";
import RecipeCard from "@/components/public/RecipeCard";
import RecipeFilters from "@/components/public/RecipeFilters";
import { AnimatedSection, AnimatedCard } from "@/components/public/AnimatedSection";

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
};

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

const difficultyLabels: Record<string, string> = {
  easy: "Facile",
  intermediate: "Moyen",
  hard: "Difficile",
};

async function getRecipes(params: URLSearchParams): Promise<{
  recipes: RecipeListItem[];
  total: number;
  page: number;
}> {
  try {
    const res = await fetch(`${API_URL}/api/recipes?${params.toString()}`, {
      next: { revalidate: 30 },
    });
    if (!res.ok) return { recipes: [], total: 0, page: 1 };
    const data = await res.json();
    return {
      recipes: data.recipes ?? [],
      total: data.total ?? 0,
      page: data.page ?? 1,
    };
  } catch {
    return { recipes: [], total: 0, page: 1 };
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

export default async function RecettesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const search = typeof sp.search === "string" ? sp.search : "";
  const category = typeof sp.category === "string" ? sp.category : "";
  const difficulty = typeof sp.difficulty === "string" ? sp.difficulty : "";
  const sort = typeof sp.sort === "string" ? sp.sort : "recent";
  const page = typeof sp.page === "string" ? Number(sp.page) : 1;
  const limit = 12;

  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("limit", String(limit));
  if (search) params.set("search", search);
  if (category) params.set("category", category);
  if (difficulty) params.set("difficulty", difficulty);
  if (sort) params.set("sort", sort);

  const [{ recipes, total }, categories] = await Promise.all([
    getRecipes(params),
    getCategories(),
  ]);

  const totalPages = Math.ceil(total / limit);
  const isFiltered = !!search || !!category || !!difficulty;
  const showFeatured = !isFiltered && page === 1 && recipes.length > 1;
  const gridRecipes = showFeatured ? recipes.slice(1) : recipes;

  return (
    <div>
      {/* Hero — immersive dark with layered depth */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[#0a0f1e]">
          <div
            className="absolute top-[15%] left-[8%] w-[550px] h-[550px] bg-primary/[0.08] rounded-full blur-[180px]"
            style={{ animation: "public-glow-pulse 8s ease-in-out infinite" }}
          />
          <div
            className="absolute bottom-[5%] right-[12%] w-[400px] h-[400px] bg-accent/[0.06] rounded-full blur-[150px]"
            style={{ animation: "public-glow-pulse 10s ease-in-out infinite 3s" }}
          />
          <div
            className="absolute top-[35%] right-[20%] w-[300px] h-[300px] bg-[#a78bfa]/[0.05] rounded-full blur-[120px]"
            style={{ animation: "public-glow-pulse 12s ease-in-out infinite 1s" }}
          />
          <div className="absolute inset-0 public-dot-grid opacity-20" />
          <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.04] to-transparent" />
          <div className="absolute top-0 bottom-0 left-[28%] w-px bg-gradient-to-b from-transparent via-white/[0.03] to-transparent" />
          <div className="absolute top-0 bottom-0 right-[22%] w-px bg-gradient-to-b from-transparent via-white/[0.03] to-transparent" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-20 pb-20 sm:pb-28">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-[11px] font-mono text-white/25 mb-8">
            <Link href="/" className="hover:text-white/50 transition-colors">
              Accueil
            </Link>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="m9 18 6-6-6-6" />
            </svg>
            <span className="text-white/40">Recettes</span>
          </nav>

          <div className="max-w-3xl animate-slide-in-up">
            <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-serif font-bold text-white leading-[1.12] tracking-tight">
              {search ? (
                <>
                  Resultats pour{" "}
                  <span className="public-gradient-text">&ldquo;{search}&rdquo;</span>
                </>
              ) : category ? (
                <>
                  Recettes{" "}
                  <span className="public-gradient-text">{category}</span>
                </>
              ) : (
                <>
                  Explorez nos
                  <br />
                  <span className="public-gradient-text">recettes</span>
                </>
              )}
            </h1>
            <p className="mt-4 text-[15px] sm:text-base text-white/35 max-w-xl leading-relaxed">
              {total} recette{total !== 1 ? "s" : ""} a decouvrir. Filtrez par
              categorie, difficulte ou recherchez par nom.
            </p>
          </div>

          {/* Info badges */}
          <div className="mt-8 flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.05] border border-white/[0.08]">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] font-medium text-white/50">
                {total} recette{total !== 1 ? "s" : ""}
              </span>
            </div>
            {isFiltered && (
              <>
                {search && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-white/[0.06] border border-white/[0.08] text-[11px] text-white/50">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <circle cx="11" cy="11" r="8" />
                      <path d="m21 21-4.3-4.3" />
                    </svg>
                    &ldquo;{search}&rdquo;
                  </span>
                )}
                {category && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-primary/20 border border-primary/25 text-[11px] font-medium text-white/60">
                    {category}
                  </span>
                )}
                {difficulty && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-accent/20 border border-accent/25 text-[11px] font-medium text-white/60">
                    {difficultyLabels[difficulty] ?? difficulty}
                  </span>
                )}
                <Link
                  href="/recettes"
                  className="text-[11px] text-white/30 hover:text-white/50 transition-colors underline underline-offset-2 decoration-white/20"
                >
                  Reinitialiser
                </Link>
              </>
            )}
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-bg to-transparent" />
      </section>

      {/* Transition */}
      <div className="relative">
        <div className="h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
        <div className="absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-primary/[0.07] to-transparent blur-sm" />
        <div className="absolute left-1/2 -translate-x-1/2 top-0 w-1/3 h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent" />
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Filters */}
        <RecipeFilters
          categories={categories}
          currentSearch={search}
          currentCategory={category}
          currentDifficulty={difficulty}
          currentSort={sort}
        />

        {recipes.length > 0 ? (
          <>
            {/* Featured recipe */}
            {showFeatured && (
              <div className="mb-10">
                <AnimatedSection animation="fade-left" className="flex items-center gap-3 mb-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-text-tertiary">
                    Mise en avant
                  </p>
                  <div className="flex-1 h-px bg-gradient-to-r from-border/30 to-transparent" />
                </AnimatedSection>
                <AnimatedCard index={0}>
                  <RecipeCard recipe={recipes[0]} size="hero" />
                </AnimatedCard>
              </div>
            )}

            {/* Grid header */}
            <div className="flex items-center gap-3 mb-6">
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-text-tertiary">
                {showFeatured ? `${gridRecipes.length} autre${gridRecipes.length !== 1 ? "s" : ""} recette${gridRecipes.length !== 1 ? "s" : ""}` : `${total} recette${total !== 1 ? "s" : ""}`}
              </p>
              <div className="flex-1 h-px bg-gradient-to-r from-border/30 to-transparent" />
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {gridRecipes.map((recipe, i) => (
                <AnimatedCard key={recipe.id} index={i}>
                  <RecipeCard recipe={recipe} size="medium" />
                </AnimatedCard>
              ))}
            </div>
          </>
        ) : (
          <div className="py-24 text-center">
            <div className="max-w-sm mx-auto">
              <div className="mx-auto w-24 h-24 rounded-2xl bg-primary/[0.06] flex items-center justify-center mb-6">
                <svg
                  className="text-primary/30"
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                  <path d="M8 11h6" />
                </svg>
              </div>
              <h3 className="text-xl font-serif font-bold text-text">
                Aucune recette trouvee
              </h3>
              <p className="mt-2 text-sm text-text-secondary leading-relaxed">
                Modifiez vos filtres ou votre recherche pour decouvrir des recettes.
              </p>
              <Link
                href="/recettes"
                className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-hover shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                  <path d="M3 3v5h5" />
                </svg>
                Reinitialiser les filtres
              </Link>
            </div>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <nav className="mt-14 flex items-center justify-center gap-1.5">
            {page > 1 && (
              <PaginationLink
                page={page - 1}
                params={sp}
                label={
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="m15 18-6-6 6-6" />
                  </svg>
                }
              />
            )}
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(
                (p) =>
                  p === 1 ||
                  p === totalPages ||
                  (p >= page - 2 && p <= page + 2)
              )
              .reduce<(number | "...")[]>((acc, p, idx, arr) => {
                if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("...");
                acc.push(p);
                return acc;
              }, [])
              .map((p, i) =>
                p === "..." ? (
                  <span
                    key={`ellipsis-${i}`}
                    className="w-10 text-center text-text-tertiary text-sm select-none"
                  >
                    ...
                  </span>
                ) : (
                  <PaginationLink
                    key={p}
                    page={p as number}
                    params={sp}
                    label={String(p)}
                    isActive={p === page}
                  />
                )
              )}
            {page < totalPages && (
              <PaginationLink
                page={page + 1}
                params={sp}
                label={
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                }
              />
            )}
          </nav>
        )}
      </div>
    </div>
  );
}

function PaginationLink({
  page,
  params,
  label,
  isActive,
}: {
  page: number;
  params: Record<string, string | string[] | undefined>;
  label: React.ReactNode;
  isActive?: boolean;
}) {
  const sp = new URLSearchParams();
  for (const [key, val] of Object.entries(params)) {
    if (val && key !== "page") sp.set(key, String(val));
  }
  sp.set("page", String(page));

  return (
    <Link
      href={`/recettes?${sp.toString()}`}
      className={`w-10 h-10 flex items-center justify-center rounded-xl text-sm font-medium transition-all ${
        isActive
          ? "bg-primary text-white shadow-lg shadow-primary/25"
          : "bg-white border border-border/40 text-text-secondary hover:border-primary/40 hover:text-primary hover:bg-primary/[0.04]"
      }`}
    >
      {label}
    </Link>
  );
}
