"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession, authClient } from "@/lib/auth";
import QRCode from "qrcode";
import Link from "next/link";

type Step = "status" | "setup" | "verify" | "backup" | "disable";

export default function SecuritePage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [step, setStep] = useState<Step>("status");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [totpURI, setTotpURI] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/compte/connexion");
    }
  }, [session, isPending, router]);

  useEffect(() => {
    if (totpURI && canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, totpURI, {
        width: 200,
        margin: 2,
        color: { dark: "#1a1a2e", light: "#ffffff" },
      });
    }
  }, [totpURI]);

  const twoFactorEnabled = !!(session?.user as Record<string, unknown>)?.twoFactorEnabled;

  async function handleEnable() {
    setLoading(true);
    setError("");
    try {
      const res = await authClient.twoFactor.enable({ password });
      if (res.error) {
        setError(res.error.message || "Erreur lors de l'activation");
        setLoading(false);
        return;
      }
      setTotpURI(res.data?.totpURI ?? "");
      setBackupCodes(res.data?.backupCodes ?? []);
      setStep("verify");
    } catch {
      setError("Erreur inattendue");
    }
    setLoading(false);
  }

  async function handleVerify() {
    setLoading(true);
    setError("");
    try {
      const res = await authClient.twoFactor.verifyTotp({ code });
      if (res.error) {
        setError(res.error.message || "Code invalide");
        setLoading(false);
        return;
      }
      setStep("backup");
    } catch {
      setError("Erreur inattendue");
    }
    setLoading(false);
  }

  async function handleDisable() {
    setLoading(true);
    setError("");
    try {
      const res = await authClient.twoFactor.disable({ password });
      if (res.error) {
        setError(res.error.message || "Erreur lors de la desactivation");
        setLoading(false);
        return;
      }
      setStep("status");
      setPassword("");
      router.refresh();
    } catch {
      setError("Erreur inattendue");
    }
    setLoading(false);
  }

  if (isPending) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!session?.user) return null;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12 sm:py-16 animate-slide-in-up">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/compte/profil" className="text-text-secondary hover:text-text transition-colors">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </Link>
        <h1 className="text-[28px] sm:text-[32px] font-serif font-bold text-text">
          Securite
        </h1>
      </div>

      <div className="public-glow-card rounded-2xl p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <div>
            <h2 className="text-[16px] font-semibold text-text">Authentification a deux facteurs</h2>
            <p className="text-[12px] text-text-secondary">
              Protegez votre compte avec une application d&apos;authentification (TOTP)
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-100 text-[13px] text-red-600">
            {error}
          </div>
        )}

        {step === "status" && !twoFactorEnabled && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider bg-amber-50 text-amber-600 rounded-full">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                Desactive
              </span>
            </div>

            <p className="text-[13px] text-text-secondary mb-5">
              Ajoutez une couche de securite supplementaire en utilisant une application
              comme Google Authenticator, Authy ou 1Password.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-[12px] font-semibold text-text-secondary mb-1.5 tracking-wide">
                  Mot de passe actuel
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Confirmez votre mot de passe"
                  className="w-full px-4 py-2.5 text-[14px] text-text bg-white border border-border/50 rounded-xl outline-none transition-all duration-200 hover:border-primary/40 focus:border-primary focus:ring-[3px] focus:ring-primary/10"
                />
              </div>
              <button
                onClick={handleEnable}
                disabled={loading || !password}
                className="px-6 py-2.5 bg-gradient-to-r from-primary to-primary/90 text-white text-[13px] font-semibold rounded-xl shadow-[0_4px_16px_rgba(71,91,138,0.25)] hover:shadow-[0_8px_24px_rgba(71,91,138,0.35)] hover:-translate-y-0.5 transition-all disabled:opacity-60 cursor-pointer"
              >
                {loading ? "Activation..." : "Activer la 2FA"}
              </button>
            </div>
          </div>
        )}

        {step === "status" && twoFactorEnabled && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-600 rounded-full">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Active
              </span>
            </div>

            <p className="text-[13px] text-text-secondary mb-5">
              Votre compte est protege par l&apos;authentification a deux facteurs.
            </p>

            <button
              onClick={() => setStep("disable")}
              className="px-5 py-2.5 text-[13px] font-medium text-red-600 border border-red-200 rounded-xl hover:bg-red-50 transition-all cursor-pointer"
            >
              Desactiver la 2FA
            </button>
          </div>
        )}

        {step === "verify" && (
          <div>
            <p className="text-[13px] text-text-secondary mb-4">
              Scannez ce QR code avec votre application d&apos;authentification, puis entrez le code a 6 chiffres.
            </p>

            <div className="flex justify-center mb-6 p-4 bg-white rounded-xl border border-border/30">
              <canvas ref={canvasRef} />
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[12px] font-semibold text-text-secondary mb-1.5 tracking-wide">
                  Code de verification
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="000000"
                  maxLength={6}
                  className="w-full px-4 py-2.5 text-[14px] text-text bg-white border border-border/50 rounded-xl outline-none transition-all duration-200 hover:border-primary/40 focus:border-primary focus:ring-[3px] focus:ring-primary/10 tracking-[0.5em] text-center font-mono"
                  autoFocus
                />
              </div>
              <button
                onClick={handleVerify}
                disabled={loading || code.length !== 6}
                className="w-full px-6 py-2.5 bg-gradient-to-r from-primary to-primary/90 text-white text-[13px] font-semibold rounded-xl shadow-[0_4px_16px_rgba(71,91,138,0.25)] hover:shadow-[0_8px_24px_rgba(71,91,138,0.35)] hover:-translate-y-0.5 transition-all disabled:opacity-60 cursor-pointer"
              >
                {loading ? "Verification..." : "Verifier et activer"}
              </button>
            </div>
          </div>
        )}

        {step === "backup" && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-600 rounded-full">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                2FA activee
              </span>
            </div>

            <div className="p-4 rounded-xl bg-amber-50 border border-amber-100 mb-4">
              <p className="text-[13px] font-semibold text-amber-800 mb-1">
                Sauvegardez vos codes de secours
              </p>
              <p className="text-[12px] text-amber-700">
                Ces codes vous permettront de vous connecter si vous perdez votre appareil.
                Conservez-les en lieu sur. Ils ne seront plus affiches.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-6 p-4 bg-white rounded-xl border border-border/30">
              {backupCodes.map((c, i) => (
                <div key={i} className="px-3 py-2 text-center font-mono text-[13px] text-text bg-bg rounded-lg">
                  {c}
                </div>
              ))}
            </div>

            <button
              onClick={() => {
                setStep("status");
                setPassword("");
                setCode("");
                router.refresh();
              }}
              className="px-6 py-2.5 bg-gradient-to-r from-primary to-primary/90 text-white text-[13px] font-semibold rounded-xl shadow-[0_4px_16px_rgba(71,91,138,0.25)] hover:shadow-[0_8px_24px_rgba(71,91,138,0.35)] hover:-translate-y-0.5 transition-all cursor-pointer"
            >
              J&apos;ai sauvegarde mes codes
            </button>
          </div>
        )}

        {step === "disable" && (
          <div>
            <div className="p-4 rounded-xl bg-red-50 border border-red-100 mb-4">
              <p className="text-[13px] font-semibold text-red-800 mb-1">
                Desactiver la 2FA
              </p>
              <p className="text-[12px] text-red-700">
                Votre compte sera moins protege sans l&apos;authentification a deux facteurs.
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[12px] font-semibold text-text-secondary mb-1.5 tracking-wide">
                  Mot de passe actuel
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Confirmez votre mot de passe"
                  className="w-full px-4 py-2.5 text-[14px] text-text bg-white border border-border/50 rounded-xl outline-none transition-all duration-200 hover:border-primary/40 focus:border-primary focus:ring-[3px] focus:ring-primary/10"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleDisable}
                  disabled={loading || !password}
                  className="px-5 py-2.5 text-[13px] font-medium text-white bg-red-500 rounded-xl hover:bg-red-600 transition-all disabled:opacity-60 cursor-pointer"
                >
                  {loading ? "..." : "Confirmer la desactivation"}
                </button>
                <button
                  onClick={() => { setStep("status"); setPassword(""); setError(""); }}
                  className="px-5 py-2.5 text-[13px] font-medium text-text-secondary border border-border/50 rounded-xl hover:bg-bg transition-all cursor-pointer"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
