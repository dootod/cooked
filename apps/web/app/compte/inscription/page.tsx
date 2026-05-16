"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signUp, useSession } from "@/lib/auth";

export default function InscriptionPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { data: session, isPending } = useSession();

  useEffect(() => {
    if (!isPending && session?.user) {
      router.replace("/");
    }
  }, [session, isPending, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
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
      setError("Le mot de passe doit contenir au moins un caractère spécial.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);

    const { data, error: authError } = await signUp.email({
      email,
      password,
      name,
    });

    if (authError) {
      setError(authError.message || "Une erreur est survenue lors de l'inscription.");
    } else if (data) {
      router.push("/compte/connexion?registered=1");
    }

    setLoading(false);
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-8rem)]">
      {/* Left — Decorative panel */}
      <div className="relative overflow-hidden auth-mesh-bg lg:w-[45%] xl:w-[40%] shrink-0 flex flex-col justify-between p-8 sm:p-12 lg:p-14">
        {/* Floating orbs */}
        <div
          className="absolute top-[15%] left-[20%] w-[200px] h-[200px] bg-primary/20 rounded-full blur-[100px] pointer-events-none"
          style={{ animation: "auth-glow-pulse 4s ease-in-out infinite" }}
        />
        <div
          className="absolute bottom-[20%] right-[10%] w-[160px] h-[160px] bg-accent/15 rounded-full blur-[80px] pointer-events-none"
          style={{ animation: "auth-glow-pulse 5s ease-in-out infinite 1s" }}
        />
        <div
          className="absolute top-[50%] right-[30%] w-[120px] h-[120px] bg-purple-500/10 rounded-full blur-[70px] pointer-events-none"
          style={{ animation: "auth-float 6s ease-in-out infinite" }}
        />

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }} />

        {/* Logo */}
        <div className="relative z-10">
          <Link href="/" className="inline-block">
            <span className="text-[28px] font-serif font-bold text-white">
              Cooked<span className="text-accent">.</span>
            </span>
          </Link>
        </div>

        {/* Branding content */}
        <div className="relative z-10 hidden lg:block">
          <h2 className="text-[32px] xl:text-[38px] font-bold text-white leading-tight tracking-tight">
            Rejoignez la<br />
            <span className="bg-gradient-to-r from-accent via-primary to-purple-400 bg-clip-text text-transparent">
              communauté Cooked
            </span>
          </h2>
          <p className="mt-4 text-[15px] text-white/40 leading-relaxed max-w-md">
            Créez votre compte pour sauvegarder vos recettes favorites, noter et commenter.
          </p>
        </div>

        {/* Features list */}
        <div className="relative z-10 hidden lg:block space-y-3">
          {[
            "Sauvegardez vos recettes favorites",
            "Notez et commentez les recettes",
            "Adaptez les portions automatiquement",
          ].map((feature) => (
            <div key={feature} className="flex items-center gap-2.5">
              <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#475B8A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <span className="text-[13px] text-white/40">{feature}</span>
            </div>
          ))}
        </div>

        {/* Mobile: compact branding */}
        <div className="relative z-10 lg:hidden mt-4 mb-2">
          <h2 className="text-[22px] font-bold text-white leading-tight">
            Inscription
          </h2>
          <p className="mt-1 text-[14px] text-white/40">
            Créez votre compte Cooked
          </p>
        </div>
      </div>

      {/* Right — Form panel */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 lg:p-14 bg-bg">
        <div className="w-full max-w-[420px] animate-slide-in-right">
          {/* Header (desktop only) */}
          <div className="hidden lg:block mb-10">
            <h1 className="text-[30px] font-bold text-text tracking-tight font-serif">
              Créer un compte
            </h1>
            <p className="mt-2 text-[14px] text-text-secondary">
              Remplissez les informations ci-dessous
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[12px] font-semibold text-text-secondary mb-2 tracking-wide">
                Nom
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Votre nom"
                className="w-full px-4 py-3 text-[14px] text-text bg-white border border-border/60 rounded-xl outline-none transition-all duration-200 hover:border-primary/40 focus:border-primary focus:ring-[3px] focus:ring-primary/10 placeholder:text-text-tertiary/60"
              />
            </div>

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

            <div>
              <label className="block text-[12px] font-semibold text-text-secondary mb-2 tracking-wide">
                Mot de passe
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                placeholder="Min. 8 car., 1 maj., 1 chiffre, 1 special"
                className="w-full px-4 py-3 text-[14px] text-text bg-white border border-border/60 rounded-xl outline-none transition-all duration-200 hover:border-primary/40 focus:border-primary focus:ring-[3px] focus:ring-primary/10 placeholder:text-text-tertiary/60"
              />
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-text-secondary mb-2 tracking-wide">
                Confirmer le mot de passe
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
              className="w-full py-3 bg-gradient-to-r from-primary to-primary/90 text-white text-[15px] font-semibold rounded-xl shadow-[0_4px_16px_rgba(79,111,232,0.3)] hover:shadow-[0_8px_28px_rgba(79,111,232,0.4)] hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 cursor-pointer"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Inscription...
                </span>
              ) : (
                "Créer mon compte"
              )}
            </button>
          </form>

          <div className="mt-8 flex items-center gap-3">
            <div className="flex-1 h-px bg-border/40" />
            <span className="text-[12px] text-text-tertiary">ou</span>
            <div className="flex-1 h-px bg-border/40" />
          </div>

          <p className="mt-6 text-[13px] text-text-secondary text-center">
            Déjà un compte ?{" "}
            <Link
              href="/compte/connexion"
              className="font-semibold text-primary hover:text-primary-hover transition-colors"
            >
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
