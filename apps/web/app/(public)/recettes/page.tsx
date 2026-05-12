import Link from "next/link";
import RecipeCard from "@/components/public/RecipeCard";
import RecipeFilters from "@/components/public/RecipeFilters";

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

  return (
    <div>
      {/* Dark hero banner */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[#0a0f1e]">
          <div
            className="absolute top-[30%] left-[10%] w-[400px] h-[400px] bg-primary/[0.08] rounded-full blur-[150px]"
            style={{ animation: "public-glow-pulse 8s ease-in-out infinite" }}
          />
          <div
            className="absolute bottom-[20%] right-[15%] w-[300px] h-[300px] bg-accent/[0.06] rounded-full blur-[120px]"
            style={{ animation: "public-glow-pulse 10s ease-in-out infinite 3s" }}
          />
          <div className="absolute inset-0 public-dot-grid opacity-20" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="max-w-2xl">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-white leading-tight">
              {search
                ? `Resultats pour "${search}"`
                : category
                  ? "Recettes"
                  : "Toutes les recettes"}
            </h1>
            <p className="mt-3 text-white/40 text-lg">
              {total} recette{total !== 1 ? "s" : ""} trouvee{total !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-bg to-transparent" />
      </section>

      <div className="relative">
        <div className="h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
        <div className="absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-primary/[0.07] to-transparent blur-sm" />
        <div className="absolute left-1/2 -translate-x-1/2 top-0 w-1/3 h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent" />
      </div>

    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Filters */}
      <RecipeFilters
        categories={categories}
        currentSearch={search}
        currentCategory={category}
        currentDifficulty={difficulty}
        currentSort={sort}
      />

      {/* Grid */}
      {recipes.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {recipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} size="medium" />
          ))}
        </div>
      ) : (
        <div className="py-20 text-center">
          <svg
            className="mx-auto text-primary/20 mb-4"
            width="64"
            height="64"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <h3 className="text-lg font-serif font-bold text-text">
            Aucune recette trouvee
          </h3>
          <p className="mt-1 text-text-secondary">
            Essayez de modifier vos filtres ou votre recherche.
          </p>
          <Link
            href="/recettes"
            className="inline-block mt-4 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-colors"
          >
            Reinitialiser les filtres
          </Link>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <nav className="mt-10 flex items-center justify-center gap-2">
          {page > 1 && (
            <PaginationLink page={page - 1} params={sp} label="Precedent" />
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
                <span key={`ellipsis-${i}`} className="px-2 text-text-tertiary">
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
            <PaginationLink page={page + 1} params={sp} label="Suivant" />
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
  label: string;
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
      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
        isActive
          ? "bg-primary text-white"
          : "text-text-secondary hover:bg-primary-light/50 hover:text-primary"
      }`}
    >
      {label}
    </Link>
  );
}
