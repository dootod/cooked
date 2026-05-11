"use client";

import Link from "next/link";
import { use } from "react";
import { RecipeForm } from "@/components/admin/RecipeForm";

export default function ModifierRecettePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Link
          href="/admin/recettes"
          style={{ fontSize: 13, color: "var(--color-text-secondary)", textDecoration: "none" }}
        >
          ← Retour aux recettes
        </Link>
        <h1
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: 30,
            fontWeight: 700,
            color: "var(--color-text)",
            marginTop: 8,
          }}
        >
          Modifier la recette
        </h1>
      </div>
      <RecipeForm recipeId={id} />
    </div>
  );
}
