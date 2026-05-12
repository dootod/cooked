"use client";

import Link from "next/link";
import { RecipeForm } from "@/components/admin/RecipeForm";

export default function NouvelleRecettePage() {
  return (
    <div className="admin-fade-up">
      <div className="max-w-[960px] mx-auto mb-7">
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
          Nouvelle recette
        </h1>
        <p className="mt-1 text-[14px] text-text-secondary">
          Remplissez les informations pour creer une nouvelle recette.
        </p>
      </div>
      <RecipeForm />
    </div>
  );
}
