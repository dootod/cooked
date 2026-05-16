"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";

export default function ReinitialiserMotDePassePage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caracteres.");
      return;
    }
    if (!/[A-Z]/.test(password)) {
      setError("Le mot de passe doit contenir au moins une majuscule.");
      return;
    }
    if (!/[0-9]/.test(password)) {
      setError("Le mot de passe doit contenir au moins un chiffre.");
      return;
    }
    if (!/[^A-Za-z0-9]/.test(password)) {
      setError("Le mot de passe doit contenir au moins un caractere special.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);

    try {
      await api.post("/api/auth/reset-password", {
        newPassword: password,
        token,
      });
      setDone(true);
    } catch {
      setError("Lien invalide ou expire. Demandez un nouveau lien.");
    }

    setLoading(false);
  }

  if (!token) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-12rem)] px-4">
        <div className="text-center">
          <p className="text-text-secondary mb-4">Lien invalide.</p>
          <Link href="/compte/mot-de-passe-oublie" className="text-primary font-semibold">
            Demander un nouveau lien
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-12rem)] px-4">
      <div className="w-full max-w-[420px]">
        <div className="mb-8">
          <h1 className="text-[28px] font-serif font-bold text-text">
            Nouveau mot de passe
          </h1>
          <p className="mt-2 text-[14px] text-text-secondary">
            Choisissez un nouveau mot de passe.
          </p>
        </div>

        {done ? (
          <div className="p-5 rounded-2xl bg-primary/5 border border-primary/20">
            <p className="text-[14px] text-text mb-4">
              Mot de passe reinitialise avec succes.
            </p>
            <Link
              href="/compte/connexion"
              className="inline-block text-[13px] font-semibold text-primary hover:text-primary-hover transition-colors"
            >
              Se connecter
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[12px] font-semibold text-text-secondary mb-2 tracking-wide">
                Nouveau mot de passe
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                placeholder="Min. 8 caracteres"
                className="w-full px-4 py-3 text-[14px] text-text bg-white border border-border/60 rounded-xl outline-none transition-all duration-200 hover:border-primary/40 focus:border-primary focus:ring-[3px] focus:ring-primary/10 placeholder:text-text-tertiary/60"
              />
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-text-secondary mb-2 tracking-wide">
                Confirmer
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full px-4 py-3 text-[14px] text-text bg-white border border-border/60 rounded-xl outline-none transition-all duration-200 hover:border-primary/40 focus:border-primary focus:ring-[3px] focus:ring-primary/10 placeholder:text-text-tertiary/60"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 px-4 py-3 text-[13px] text-red-600 bg-red-50/80 border border-red-100 rounded-xl">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-primary to-primary/90 text-white text-[15px] font-semibold rounded-xl shadow-[0_4px_16px_rgba(79,111,232,0.3)] hover:shadow-[0_8px_28px_rgba(79,111,232,0.4)] hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Enregistrement...
                </span>
              ) : (
                "Reinitialiser"
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
