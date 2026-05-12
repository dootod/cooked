import Link from "next/link";
import { notFound } from "next/navigation";
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

async function getRecipesByCategory(
  slug: string,
  page: number
): Promise<{ recipes: RecipeListItem[]; total: number }> {
  try {
    const params = new URLSearchParams({
      category: slug,
      page: String(page),
      limit: "12",
    });
    const res = await fetch(`${API_URL}/api/recipes?${params.toString()}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return { recipes: [], total: 0 };
    const data = await res.json();
    return { recipes: data.recipes ?? [], total: data.total ?? 0 };
  } catch {
    return { recipes: [], total: 0 };
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const categories = await getCategories();
  const category = categories.find((c) => c.slug === slug);
  if (!category) return { title: "Categorie non trouvee" };
  return {
    title: `${category.name} — Cooked`,
    description:
      category.description ?? `Recettes dans la categorie ${category.name}`,
  };
}

export default async function CategorieDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const page = sp.page ? Number(sp.page) : 1;

  const [categories, { recipes, total }] = await Promise.all([
    getCategories(),
    getRecipesByCategory(slug, page),
  ]);

  const category = categories.find((c) => c.slug === slug);
  if (!category) notFound();

  const totalPages = Math.ceil(total / 12);

  return (
    <div>
      {/* Dark hero banner */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[#0a0f1e]">
          <div
            className="absolute top-[20%] right-[20%] w-[400px] h-[400px] bg-primary/[0.08] rounded-full blur-[150px]"
            style={{ animation: "public-glow-pulse 8s ease-in-out infinite" }}
          />
          <div
            className="absolute bottom-[10%] left-[10%] w-[300px] h-[300px] bg-[#a78bfa]/[0.06] rounded-full blur-[120px]"
            style={{ animation: "public-glow-pulse 10s ease-in-out infinite 3s" }}
          />
          <div className="absolute inset-0 public-dot-grid opacity-20" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16 sm:pb-20">
          <nav className="flex items-center gap-2 text-sm text-white/40 mb-8">
            <Link href="/" className="hover:text-white transition-colors">Accueil</Link>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
            <Link href="/recettes" className="hover:text-white transition-colors">Recettes</Link>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
            <span className="text-white/60">{category.name}</span>
          </nav>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-white leading-tight">
            {category.name}
          </h1>
          {category.description && (
            <p className="mt-3 text-white/40 text-lg">{category.description}</p>
          )}
          <p className="mt-2 text-white/30 text-sm">
            {total} recette{total !== 1 ? "s" : ""}
          </p>

          {categories.length > 1 && (
            <div className="flex flex-wrap items-center gap-2 mt-8">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/categories/${cat.slug}`}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                    cat.slug === slug
                      ? "bg-primary text-white shadow-lg shadow-primary/25"
                      : "bg-white/[0.06] border border-white/[0.08] text-white/50 hover:bg-white/[0.1] hover:text-white"
                  }`}
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          )}
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-bg to-transparent" />
      </section>

    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
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
            <path d="M15 11h.01M11 15h.01M16 16h.01" />
            <path d="m2 16 20 6-6-20A20 20 0 0 0 2 16" />
          </svg>
          <h3 className="text-lg font-serif font-bold text-text">
            Aucune recette dans cette categorie
          </h3>
          <p className="mt-1 text-text-secondary">
            Revenez bientot, de nouvelles recettes arrivent.
          </p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <nav className="mt-10 flex items-center justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/categories/${slug}${p > 1 ? `?page=${p}` : ""}`}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                p === page
                  ? "bg-primary text-white"
                  : "text-text-secondary hover:bg-primary-light/50 hover:text-primary"
              }`}
            >
              {p}
            </Link>
          ))}
        </nav>
      )}
    </div>
    </div>
  );
}
