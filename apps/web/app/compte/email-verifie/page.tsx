"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function EmailVerifiePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  useEffect(() => {
    if (!error) {
      const timeout = setTimeout(() => {
        router.push("/");
      }, 4000);
      return () => clearTimeout(timeout);
    }
  }, [error, router]);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-12rem)] px-4">
        <div className="w-full max-w-[420px] text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-50 flex items-center justify-center">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          </div>
          <h1 className="text-[24px] font-serif font-bold text-text mb-3">
            Lien invalide
          </h1>
          <p className="text-[14px] text-text-secondary mb-6">
            {error === "TOKEN_EXPIRED"
              ? "Ce lien de verification a expire. Demandez-en un nouveau."
              : "Ce lien de verification est invalide ou a deja ete utilise."}
          </p>
          <Link
            href="/compte/connexion"
            className="inline-block px-6 py-3 bg-primary text-white text-[14px] font-semibold rounded-xl hover:bg-primary-hover transition-colors"
          >
            Retour a la connexion
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-12rem)] px-4">
      <div className="w-full max-w-[420px] text-center">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#475B8A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h1 className="text-[24px] font-serif font-bold text-text mb-3">
          Email verifie !
        </h1>
        <p className="text-[14px] text-text-secondary mb-6">
          Votre adresse email a ete verifiee avec succes. Vous allez etre redirige automatiquement.
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-3 bg-primary text-white text-[14px] font-semibold rounded-xl hover:bg-primary-hover transition-colors"
        >
          Aller a l'accueil
        </Link>
      </div>
    </div>
  );
}
