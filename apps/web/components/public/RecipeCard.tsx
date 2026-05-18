import Image from "next/image";
import Link from "next/link";

type RecipeCardData = {
  slug: string;
  title: string;
  description: string | null;
  prepTime: number;
  cookTime: number;
  difficulty: "easy" | "intermediate" | "hard";
  primaryMedia: { url: string; alt: string | null } | null;
  macros: { kcal: number; protein: number; carbs: number; fat: number } | null;
  categories: { name: string; slug: string }[];
};

type Props = {
  recipe: RecipeCardData;
  size?: "small" | "medium" | "hero";
};

const difficultyLabel: Record<string, string> = {
  easy: "Facile",
  intermediate: "Moyen",
  hard: "Difficile",
};

const difficultyColor: Record<string, string> = {
  easy: "bg-primary/20 text-primary",
  intermediate: "bg-accent/20 text-accent",
  hard: "bg-red-500/20 text-red-400",
};

export default function RecipeCard({ recipe, size = "medium" }: Props) {
  const totalTime = recipe.prepTime + recipe.cookTime;
  const hasImage = !!recipe.primaryMedia?.url;

  if (size === "hero") {
    return (
      <Link
        href={`/recettes/${recipe.slug}`}
        className="group relative block rounded-2xl overflow-hidden h-full min-h-[420px] card-shine"
      >
        <div className="absolute inset-0">
          {hasImage ? (
            <Image
              src={recipe.primaryMedia!.url}
              alt={recipe.primaryMedia!.alt ?? recipe.title}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/60 to-accent/40" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />
        </div>
        <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-8">
          <div className="flex items-center gap-2 mb-3">
            {recipe.categories.slice(0, 2).map((cat) => (
              <span
                key={cat.slug}
                className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm text-xs font-medium text-white border border-white/10"
              >
                {cat.name}
              </span>
            ))}
            <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm text-xs font-medium text-white border border-white/10 flex items-center gap-1.5">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
              </svg>
              {totalTime} min
            </span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-serif font-bold text-white group-hover:text-accent-light transition-colors leading-tight">
            {recipe.title}
          </h3>
          {recipe.description && (
            <p className="mt-2 text-sm text-white/60 line-clamp-2 max-w-md">
              {recipe.description}
            </p>
          )}
          {recipe.macros && (
            <div className="mt-4 flex items-center gap-4">
              <span className="text-xs font-mono text-white/50 px-2 py-1 rounded bg-white/[0.06]">
                {Math.round(recipe.macros.kcal)} kcal
              </span>
              <span className="text-xs font-mono text-white/50 px-2 py-1 rounded bg-white/[0.06]">
                {Math.round(recipe.macros.protein)}g prot
              </span>
              <span className="text-xs font-mono text-white/50 px-2 py-1 rounded bg-white/[0.06]">
                {Math.round(recipe.macros.carbs)}g gluc
              </span>
            </div>
          )}
        </div>
        {/* Hover glow border */}
        <div className="absolute inset-0 rounded-2xl border border-white/0 group-hover:border-primary/30 transition-all duration-500 pointer-events-none" />
      </Link>
    );
  }

  if (size === "small") {
    return (
      <Link
        href={`/recettes/${recipe.slug}`}
        className="group block rounded-2xl overflow-hidden public-glow-card p-5 h-full"
      >
        <div className="flex items-center gap-2 mb-3">
          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${difficultyColor[recipe.difficulty]}`}>
            {difficultyLabel[recipe.difficulty]}
          </span>
          <span className="text-xs text-text-tertiary flex items-center gap-1">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
            </svg>
            {totalTime} min
          </span>
        </div>
        <h3 className="text-sm font-serif font-bold text-text group-hover:text-primary transition-colors line-clamp-2">
          {recipe.title}
        </h3>
        {recipe.macros && (
          <div className="mt-3 flex items-center gap-2 text-[10px] font-mono text-text-tertiary">
            <span className="px-1.5 py-0.5 rounded bg-primary/[0.06]">{Math.round(recipe.macros.kcal)} kcal</span>
            <span className="px-1.5 py-0.5 rounded bg-primary/[0.06]">{Math.round(recipe.macros.protein)}g P</span>
          </div>
        )}
      </Link>
    );
  }

  return (
    <Link
      href={`/recettes/${recipe.slug}`}
      className="group block rounded-2xl overflow-hidden public-glow-card h-full hover-lift card-shine"
    >
      <div className="aspect-[4/3] relative overflow-hidden">
        {hasImage ? (
          <Image
            src={recipe.primaryMedia!.url}
            alt={recipe.primaryMedia!.alt ?? recipe.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary-light to-accent-light flex items-center justify-center">
            <svg className="text-primary/20" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 11h.01M11 15h.01M16 16h.01" /><path d="m2 16 20 6-6-20A20 20 0 0 0 2 16" />
            </svg>
          </div>
        )}
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          {recipe.categories.slice(0, 1).map((cat) => (
            <span
              key={cat.slug}
              className="px-2.5 py-0.5 rounded-full bg-black/40 backdrop-blur-sm text-[10px] font-semibold text-white border border-white/10"
            >
              {cat.name}
            </span>
          ))}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${difficultyColor[recipe.difficulty]}`}>
            {difficultyLabel[recipe.difficulty]}
          </span>
          <span className="text-xs text-text-tertiary flex items-center gap-1">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
            </svg>
            {totalTime} min
          </span>
        </div>
        <h3 className="text-base font-serif font-bold text-text group-hover:text-primary transition-colors line-clamp-2">
          {recipe.title}
        </h3>
        {recipe.macros && (
          <div className="mt-2.5 flex items-center gap-2 text-[10px] font-mono text-text-tertiary">
            <span className="px-1.5 py-0.5 rounded bg-primary/[0.06]">{Math.round(recipe.macros.kcal)} kcal</span>
            <span className="px-1.5 py-0.5 rounded bg-primary/[0.06]">{Math.round(recipe.macros.protein)}g P</span>
            <span className="px-1.5 py-0.5 rounded bg-primary/[0.06]">{Math.round(recipe.macros.carbs)}g G</span>
            <span className="px-1.5 py-0.5 rounded bg-primary/[0.06]">{Math.round(recipe.macros.fat)}g L</span>
          </div>
        )}
      </div>
    </Link>
  );
}
