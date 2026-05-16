"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface Category {
  id: string;
  name: string;
  slug: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export default function Footer() {
  const pathname = usePathname();
  const isDark = pathname === "/";
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetch(`${API_URL}/api/categories`)
      .then((r) => (r.ok ? r.json() : { categories: [] }))
      .then((d) => setCategories(d.categories?.slice(0, 4) ?? []))
      .catch(() => {});
  }, []);

  return (
    <footer className="relative animate-slide-in-up">
      {!isDark && (
        <div className="relative">
          <div className="h-px bg-gradient-to-r from-transparent via-primary/15 to-transparent" />
          <div className="absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-primary/[0.03] to-transparent blur-md" />
        </div>
      )}

      <div
        className={
          isDark
            ? "bg-[#0A0F1E] border-t border-white/[0.06]"
            : "bg-white/50 backdrop-blur-sm border-t border-border/20"
        }
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="sm:col-span-2 lg:col-span-1">
              <Link href="/">
                <span
                  className={`text-2xl font-serif font-bold ${isDark ? "text-white" : "text-text"}`}
                >
                  Cooked<span className="text-accent">.</span>
                </span>
              </Link>
              <p
                className={`mt-3 text-sm leading-relaxed ${isDark ? "text-white/35" : "text-text-secondary"}`}
              >
                Des recettes culinaires soignees, avec macros et instructions
                detaillees.
              </p>
            </div>

            <div>
              <h3
                className={`text-xs font-semibold uppercase tracking-wider mb-3 ${isDark ? "text-white/50" : "text-text"}`}
              >
                Explorer
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/recettes"
                    className={`text-sm transition-colors ${isDark ? "text-white/30 hover:text-white/60" : "text-text-secondary hover:text-primary"}`}
                  >
                    Toutes les recettes
                  </Link>
                </li>
                <li>
                  <Link
                    href="/categories"
                    className={`text-sm transition-colors ${isDark ? "text-white/30 hover:text-white/60" : "text-text-secondary hover:text-primary"}`}
                  >
                    Categories
                  </Link>
                </li>
              </ul>
            </div>

            {categories.length > 0 && (
              <div>
                <h3
                  className={`text-xs font-semibold uppercase tracking-wider mb-3 ${isDark ? "text-white/50" : "text-text"}`}
                >
                  Categories
                </h3>
                <ul className="space-y-2">
                  {categories.map((cat) => (
                    <li key={cat.id}>
                      <Link
                        href={`/categories/${cat.slug}`}
                        className={`text-sm transition-colors ${isDark ? "text-white/30 hover:text-white/60" : "text-text-secondary hover:text-primary"}`}
                      >
                        {cat.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div>
              <h3
                className={`text-xs font-semibold uppercase tracking-wider mb-3 ${isDark ? "text-white/50" : "text-text"}`}
              >
                Compte
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/compte/connexion"
                    className={`text-sm transition-colors ${isDark ? "text-white/30 hover:text-white/60" : "text-text-secondary hover:text-primary"}`}
                  >
                    Connexion
                  </Link>
                </li>
                <li>
                  <Link
                    href="/compte/inscription"
                    className={`text-sm transition-colors ${isDark ? "text-white/30 hover:text-white/60" : "text-text-secondary hover:text-primary"}`}
                  >
                    Inscription
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div
            className={`mt-10 pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-3 ${
              isDark ? "border-white/[0.06]" : "border-border/30"
            }`}
          >
            <p
              className={`text-xs ${isDark ? "text-white/20" : "text-text-tertiary"}`}
            >
              {new Date().getFullYear()} Cooked. Tous droits reserves.
            </p>
            <p
              className={`text-xs ${isDark ? "text-white/20" : "text-text-tertiary"}`}
            >
              Fait avec soin par Thomas
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
