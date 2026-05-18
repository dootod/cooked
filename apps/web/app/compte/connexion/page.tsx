"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signIn, useSession, authClient } from "@/lib/auth";

export default function ConnexionPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [twoFactorRequired, setTwoFactorRequired] = useState(false);
  const [totpCode, setTotpCode] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const registered = searchParams.get("registered");
  const { data: session, isPending } = useSession();

  useEffect(() => {
    if (!isPending && session?.user) {
      router.replace(session.user.role === "admin" ? "/admin" : "/");
    }
  }, [session, isPending, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { data, error: authError } = await signIn.email({ email, password });

    if (authError) {
      setError(authError.message || "Email ou mot de passe incorrect.");
    } else if (data && "twoFactorRedirect" in data && data.twoFactorRedirect) {
      setTwoFactorRequired(true);
    } else if (data?.user) {
      router.push(data.user.role === "admin" ? "/admin" : "/");
      router.refresh();
    }

    setLoading(false);
  }

  async function handleTOTPVerify(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { data, error: verifyError } = await authClient.twoFactor.verifyTotp({ code: totpCode });

    if (verifyError) {
      setError(verifyError.message || "Code invalide");
    } else if (data?.user) {
      router.push((data.user as Record<string, unknown>).role === "admin" ? "/admin" : "/");
      router.refresh();
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
            Gérez vos recettes<br />
            <span className="bg-gradient-to-r from-primary via-accent to-purple-400 bg-clip-text text-transparent">
              en toute simplicité
            </span>
          </h2>
          <p className="mt-4 text-[15px] text-white/40 leading-relaxed max-w-md">
            Accédez à votre espace pour gérer, organiser et publier vos recettes culinaires.
          </p>
        </div>

        {/* Decorative element */}
        <div className="relative z-10 hidden lg:flex items-center gap-3">
          <div className="flex -space-x-2">
            {["#475B8A", "#FF8C69", "#A855F7"].map((color) => (
              <div
                key={color}
                className="w-8 h-8 rounded-full border-2 border-[#0F1629]"
                style={{ background: `linear-gradient(135deg, ${color}, ${color}80)` }}
              />
            ))}
          </div>
          <p className="text-[12px] text-white/30">
            Plateforme culinaire moderne
          </p>
        </div>

        {/* Mobile: compact branding */}
        <div className="relative z-10 lg:hidden mt-4 mb-2">
          <h2 className="text-[22px] font-bold text-white leading-tight">
            Connexion
          </h2>
          <p className="mt-1 text-[14px] text-white/40">
            Accédez à votre espace Cooked
          </p>
        </div>
      </div>

      {/* Right — Form panel */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 lg:p-14 bg-bg">
        <div className="w-full max-w-[420px] animate-slide-in-right">
          {/* Header (desktop only) */}
          <div className="hidden lg:block mb-10">
            <h1 className="text-[30px] font-bold text-text tracking-tight font-serif">
              Connexion
            </h1>
            <p className="mt-2 text-[14px] text-text-secondary">
              Accédez à votre espace Cooked
            </p>
          </div>

          {registered && (
            <div className="mb-6 p-4 rounded-xl bg-primary/5 border border-primary/20">
              <div className="flex items-start gap-3">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#475B8A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                <div>
                  <p className="text-[14px] font-semibold text-text">Compte cree avec succes !</p>
                  <p className="text-[13px] text-text-secondary mt-1">
                    Verifiez votre boite mail pour activer votre compte avant de vous connecter.
                  </p>
                </div>
              </div>
            </div>
          )}

          {!twoFactorRequired ? (
            <>
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

                <div>
                  <label className="block text-[12px] font-semibold text-text-secondary mb-2 tracking-wide">
                    Mot de passe
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full px-4 py-3 text-[14px] text-text bg-white border border-border/60 rounded-xl outline-none transition-all duration-200 hover:border-primary/40 focus:border-primary focus:ring-[3px] focus:ring-primary/10 placeholder:text-text-tertiary/60"
                  />
                </div>

                <div className="flex justify-end">
                  <Link
                    href="/compte/mot-de-passe-oublie"
                    className="text-[12px] font-medium text-primary hover:text-primary-hover transition-colors"
                  >
                    Mot de passe oublie ?
                  </Link>
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
                      Connexion...
                    </span>
                  ) : (
                    "Se connecter"
                  )}
                </button>
              </form>

              <div className="mt-8 flex items-center gap-3">
                <div className="flex-1 h-px bg-border/40" />
                <span className="text-[12px] text-text-tertiary">ou</span>
                <div className="flex-1 h-px bg-border/40" />
              </div>

              <p className="mt-6 text-[13px] text-text-secondary text-center">
                Pas encore de compte ?{" "}
                <Link
                  href="/compte/inscription"
                  className="font-semibold text-primary hover:text-primary-hover transition-colors"
                >
                  Créer un compte
                </Link>
              </p>
            </>
          ) : (
            <form onSubmit={handleTOTPVerify} className="space-y-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </div>
                <div>
                  <p className="text-[15px] font-semibold text-text">Verification 2FA</p>
                  <p className="text-[12px] text-text-secondary">
                    Entrez le code de votre application d&apos;authentification
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-text-secondary mb-2 tracking-wide">
                  Code a 6 chiffres
                </label>
                <input
                  type="text"
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="000000"
                  maxLength={6}
                  autoFocus
                  className="w-full px-4 py-3 text-[14px] text-text bg-white border border-border/60 rounded-xl outline-none transition-all duration-200 hover:border-primary/40 focus:border-primary focus:ring-[3px] focus:ring-primary/10 tracking-[0.5em] text-center font-mono"
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
                disabled={loading || totpCode.length !== 6}
                className="w-full py-3 bg-gradient-to-r from-primary to-primary/90 text-white text-[15px] font-semibold rounded-xl shadow-[0_4px_16px_rgba(79,111,232,0.3)] hover:shadow-[0_8px_28px_rgba(79,111,232,0.4)] hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 cursor-pointer"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Verification...
                  </span>
                ) : (
                  "Verifier"
                )}
              </button>

              <button
                type="button"
                onClick={() => { setTwoFactorRequired(false); setTotpCode(""); setError(""); }}
                className="w-full py-2.5 text-[13px] font-medium text-text-secondary hover:text-text transition-colors cursor-pointer"
              >
                Retour a la connexion
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
