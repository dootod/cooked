"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/lib/auth";
import { api } from "@/lib/api";

type Ingredient = {
  id: string;
  name: string;
  quantity: number | null;
  unit: string | null;
  note: string | null;
  order: number;
};

type Macros = {
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
};

interface Props {
  recipeId: string;
  section: "ingredients" | "favorite-button";
  ingredients?: Ingredient[];
  baseServings?: number;
  macros?: Macros | null;
}

function formatQuantity(qty: number): string {
  if (qty === Math.floor(qty)) return String(qty);
  return qty.toFixed(1).replace(/\.0$/, "");
}

function IngredientsSection({
  ingredients,
  baseServings,
  macros,
}: {
  ingredients: Ingredient[];
  baseServings: number;
  macros: Macros | null;
}) {
  const [servings, setServings] = useState(baseServings);
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const ratio = servings / baseServings;

  function toggleIngredient(id: string) {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <>
      <div className="rounded-2xl overflow-hidden border border-border/30">
        <div className="bg-primary/[0.06] px-5 py-3.5 flex items-center gap-2.5">
          <svg className="text-primary" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z" />
            <line x1="6" y1="17" x2="18" y2="17" />
          </svg>
          <h3 className="font-serif font-bold text-text">Ingredients</h3>
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => setServings(Math.max(1, servings - 1))}
              className="w-7 h-7 rounded-lg bg-white border border-border/50 flex items-center justify-center text-text-secondary hover:border-primary hover:text-primary transition-colors cursor-pointer"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                <path d="M5 12h14" />
              </svg>
            </button>
            <span className="text-sm font-mono font-bold text-text min-w-[3ch] text-center">
              {servings}
            </span>
            <button
              onClick={() => setServings(Math.min(50, servings + 1))}
              className="w-7 h-7 rounded-lg bg-white border border-border/50 flex items-center justify-center text-text-secondary hover:border-primary hover:text-primary transition-colors cursor-pointer"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </button>
            <span className="text-[11px] text-text-tertiary ml-1">portions</span>
          </div>
        </div>
        <div className="bg-white p-5">
          <ul className="space-y-3">
            {ingredients.map((ing) => {
              const isChecked = checked.has(ing.id);
              const scaledQty = ing.quantity !== null ? ing.quantity * ratio : null;
              return (
                <li
                  key={ing.id}
                  className={`flex items-start gap-3 text-sm group cursor-pointer select-none ${isChecked ? "opacity-50" : ""}`}
                  onClick={() => toggleIngredient(ing.id)}
                >
                  <span
                    className={`shrink-0 mt-1 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
                      isChecked
                        ? "border-primary bg-primary"
                        : "border-border/50 group-hover:border-primary/40"
                    }`}
                  >
                    {isChecked && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </span>
                  <span className={`text-text ${isChecked ? "line-through" : ""}`}>
                    {scaledQty !== null && (
                      <span className="font-mono font-semibold text-primary">
                        {formatQuantity(scaledQty)}
                        {ing.unit ? ` ${ing.unit}` : ""}
                      </span>
                    )}{" "}
                    {ing.name}
                    {ing.note && (
                      <span className="text-text-tertiary"> ({ing.note})</span>
                    )}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {/* Macros scaled by portion */}
      {macros && (
        <div className="p-5 rounded-2xl bg-white border border-border/30">
          <h3 className="text-sm font-semibold text-text mb-3">
            Macros par portion
            {servings !== baseServings && (
              <span className="text-text-tertiary font-normal"> (x{servings})</span>
            )}
          </h3>
          <div className="grid grid-cols-4 gap-2">
            <div className="text-center">
              <p className="text-lg font-bold font-mono text-primary">
                {Math.round(macros.kcal * ratio)}
              </p>
              <p className="text-[10px] text-text-tertiary uppercase">kcal</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold font-mono text-accent">
                {Math.round(macros.protein * ratio)}g
              </p>
              <p className="text-[10px] text-text-tertiary uppercase">prot</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold font-mono text-text">
                {Math.round(macros.carbs * ratio)}g
              </p>
              <p className="text-[10px] text-text-tertiary uppercase">glucides</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold font-mono text-text">
                {Math.round(macros.fat * ratio)}g
              </p>
              <p className="text-[10px] text-text-tertiary uppercase">lipides</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function FavoriteButton({ recipeId }: { recipeId: string }) {
  const { data: session } = useSession();
  const [isFav, setIsFav] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!session?.user) return;
    api
      .get<{ favorites: { recipeId: string }[] }>("/api/me/favorites")
      .then((d) => {
        setIsFav(d.favorites.some((f) => f.recipeId === recipeId));
      })
      .catch(() => {});
  }, [session, recipeId]);

  if (!session?.user) return null;

  async function toggle() {
    setLoading(true);
    try {
      if (isFav) {
        await api.delete(`/api/me/favorites/${recipeId}`);
        setIsFav(false);
      } else {
        await api.post(`/api/me/favorites/${recipeId}`, {});
        setIsFav(true);
      }
    } catch {}
    setLoading(false);
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${
        isFav
          ? "bg-accent/10 text-accent border border-accent/30"
          : "bg-text/[0.04] text-text-secondary border border-border/30 hover:border-accent/40 hover:text-accent"
      }`}
      title={isFav ? "Retirer des favoris" : "Ajouter aux favoris"}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill={isFav ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
      </svg>
      {isFav ? "Favori" : "Favoris"}
    </button>
  );
}

export function RecipeClientFeatures(props: Props) {
  if (props.section === "favorite-button") {
    return <FavoriteButton recipeId={props.recipeId} />;
  }

  if (props.section === "ingredients" && props.ingredients && props.baseServings) {
    return (
      <IngredientsSection
        ingredients={props.ingredients}
        baseServings={props.baseServings}
        macros={props.macros ?? null}
      />
    );
  }

  return null;
}
