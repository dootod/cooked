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
    <div className="admin-fade-up">
      <div className="mb-7">
        <Link
          href="/admin/recettes"
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-text-tertiary hover:text-primary transition-colors mb-3 group"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-x-0.5 transition-transform">
            <path d="m15 18-6-6 6-6"/>
          </svg>
          Retour aux recettes
        </Link>
        <h1 className="text-[28px] font-bold text-text tracking-tight">
          Modifier la recette
        </h1>
        <p className="mt-1 text-[14px] text-text-secondary">
          Modifiez les informations de la recette.
        </p>
      </div>
      <RecipeForm recipeId={id} />
    </div>
  );
}
