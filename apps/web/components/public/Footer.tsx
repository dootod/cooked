"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();
  const isDark = true;

  const bg = isDark
    ? "bg-[#0a0f1e] border-t border-white/[0.06]"
    : "border-t border-border/40 bg-white/60 backdrop-blur-xl";
  const logo = isDark ? "text-white" : "text-text";
  const desc = isDark ? "text-white/40" : "text-text-secondary";
  const heading = isDark ? "text-white/60" : "text-text";
  const link = isDark
    ? "text-white/40 hover:text-white"
    : "text-text-secondary hover:text-primary";
  const bottomBorder = isDark ? "border-white/[0.06]" : "border-border/30";
  const bottomText = isDark ? "text-white/30" : "text-text-tertiary";

  return (
    <footer className="relative">
      <div className="relative">
        <div className="h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
        <div className="absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-primary/[0.07] to-transparent blur-sm" />
        <div className="absolute left-1/2 -translate-x-1/2 top-0 w-1/3 h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent" />
      </div>
      <div className={bg}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="sm:col-span-2 lg:col-span-1">
              <Link href="/">
                <span className={`text-2xl font-serif font-bold ${logo}`}>
                  Cooked<span className="text-accent">.</span>
                </span>
              </Link>
              <p className={`mt-3 text-sm leading-relaxed ${desc}`}>
                Des recettes culinaires soignees, avec macros et instructions detaillees.
              </p>
            </div>

            <div>
              <h3 className={`text-xs font-semibold uppercase tracking-wider mb-3 ${heading}`}>Explorer</h3>
              <ul className="space-y-2">
                <li><Link href="/recettes" className={`text-sm transition-colors ${link}`}>Toutes les recettes</Link></li>
                <li><Link href="/recettes?sort=recent" className={`text-sm transition-colors ${link}`}>Nouveautes</Link></li>
              </ul>
            </div>

            <div>
              <h3 className={`text-xs font-semibold uppercase tracking-wider mb-3 ${heading}`}>Categories</h3>
              <ul className="space-y-2">
                <li><Link href="/categories/plat" className={`text-sm transition-colors ${link}`}>Plats</Link></li>
                <li><Link href="/categories/dessert" className={`text-sm transition-colors ${link}`}>Desserts</Link></li>
                <li><Link href="/categories/entree" className={`text-sm transition-colors ${link}`}>Entrees</Link></li>
              </ul>
            </div>

            <div>
              <h3 className={`text-xs font-semibold uppercase tracking-wider mb-3 ${heading}`}>Compte</h3>
              <ul className="space-y-2">
                <li><Link href="/compte/connexion" className={`text-sm transition-colors ${link}`}>Connexion</Link></li>
                <li><Link href="/compte/inscription" className={`text-sm transition-colors ${link}`}>Inscription</Link></li>
              </ul>
            </div>
          </div>

          <div className={`mt-10 pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-3 ${bottomBorder}`}>
            <p className={`text-xs ${bottomText}`}>{new Date().getFullYear()} Cooked. Tous droits reserves.</p>
            <p className={`text-xs ${bottomText}`}>Fait avec soin par Thomas</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
