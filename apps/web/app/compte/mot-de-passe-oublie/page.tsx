"use client";

import { useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

export default function MotDePasseOubliePage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await api.post("/api/auth/request-password-reset", {
        email,
        redirectTo: `${window.location.origin}/compte/reinitialiser-mot-de-passe`,
      });
      setSent(true);
    } catch {
      setSent(true);
    }

    setLoading(false);
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-12rem)] px-4">
      <div className="w-full max-w-[420px]">
        <div className="mb-8">
          <h1 className="text-[28px] font-serif font-bold text-text">
            Mot de passe oublie
          </h1>
          <p className="mt-2 text-[14px] text-text-secondary">
            Entrez votre email pour recevoir un lien de reinitialisation.
          </p>
        </div>

        {sent ? (
          <div className="p-5 rounded-2xl bg-primary/5 border border-primary/20">
            <p className="text-[14px] text-text">
              Si un compte existe avec cet email, vous recevrez un lien de reinitialisation.
            </p>
            <Link
              href="/compte/connexion"
              className="inline-block mt-4 text-[13px] font-semibold text-primary hover:text-primary-hover transition-colors"
            >
              Retour a la connexion
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[12px] font-semibold text-text-secondary mb-2 tracking-wide">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="vous@exemple.fr"
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
                  Envoi...
                </span>
              ) : (
                "Envoyer le lien"
              )}
            </button>

            <p className="text-[13px] text-text-secondary text-center">
              <Link
                href="/compte/connexion"
                className="font-semibold text-primary hover:text-primary-hover transition-colors"
              >
                Retour a la connexion
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
