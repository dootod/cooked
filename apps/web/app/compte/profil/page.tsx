"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSession, signOut, authClient } from "@/lib/auth";
import { api } from "@/lib/api";
import Link from "next/link";

export default function ProfilPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendError, setResendError] = useState("");

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/compte/connexion");
    }
    if (session?.user) {
      setName(session.user.name || "");
      setEmail(session.user.email || "");
    }
  }, [session, isPending, router]);

  async function handleLogout() {
    await signOut();
    router.push("/");
    router.refresh();
  }

  async function handleResendVerification() {
    setResending(true);
    setResendError("");
    try {
      const { error } = await authClient.sendVerificationEmail({
        email: session!.user.email,
        callbackURL: "/compte/email-verifie",
      });
      if (error) {
        setResendError(error.message || "Erreur lors de l'envoi");
      } else {
        setResendSuccess(true);
        setTimeout(() => setResendSuccess(false), 5000);
      }
    } catch {
      setResendError("Erreur lors de l'envoi de l'email");
    }
    setResending(false);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    try {
      await api.patch("/api/me", { name: name.trim() });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      /* ignore */
    }
    setSaving(false);
  }

  if (isPending) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!session?.user) return null;

  const user = session.user;
  const initials = (user.name || user.email || "U")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12 sm:py-16 animate-slide-in-up">
      <h1 className="text-[28px] sm:text-[32px] font-serif font-bold text-text mb-8">
        Mon profil
      </h1>

      <div className="public-glow-card rounded-2xl p-6 sm:p-8 mb-6">
        <div className="flex items-center gap-4 mb-8">
          {user.image ? (
            <Image
              src={user.image}
              alt={user.name || "Avatar"}
              width={64}
              height={64}
              className="rounded-full object-cover border-2 border-primary/20"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-white text-[18px] font-bold">
              {initials}
            </div>
          )}
          <div>
            <p className="text-[16px] font-semibold text-text">
              {user.name || "Sans nom"}
            </p>
            <p className="text-[13px] text-text-secondary">{user.email}</p>
            <div className="flex items-center gap-2 mt-1.5">
              {user.emailVerified ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-600 rounded-full">
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Email verifie
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-600 rounded-full">
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  Non verifie
                </span>
              )}
              {user.role === "admin" && (
                <span className="inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary rounded-full">
                  Admin
                </span>
              )}
            </div>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-[12px] font-semibold text-text-secondary mb-1.5 tracking-wide">
              Nom
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 text-[14px] text-text bg-white border border-border/50 rounded-xl outline-none transition-all duration-200 hover:border-primary/40 focus:border-primary focus:ring-[3px] focus:ring-primary/10"
            />
          </div>
          <div>
            <label className="block text-[12px] font-semibold text-text-secondary mb-1.5 tracking-wide">
              Email
            </label>
            <input
              type="email"
              value={email}
              disabled
              className="w-full px-4 py-2.5 text-[14px] text-text-secondary bg-bg border border-border/30 rounded-xl cursor-not-allowed"
            />
            {!user.emailVerified && (
              <div className="mt-2 space-y-1">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleResendVerification}
                    disabled={resending || resendSuccess}
                    className="text-[12px] font-medium text-primary hover:text-primary-hover transition-colors disabled:opacity-60 cursor-pointer"
                  >
                    {resending
                      ? "Envoi..."
                      : resendSuccess
                        ? "Email envoye !"
                        : "Renvoyer l'email de verification"}
                  </button>
                </div>
                {resendError && (
                  <p className="text-[11px] text-red-500">{resendError}</p>
                )}
              </div>
            )}
            {user.emailVerified && (
              <p className="text-[11px] text-text-tertiary mt-1">
                L&apos;email ne peut pas etre modifie.
              </p>
            )}
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-gradient-to-r from-primary to-primary/90 text-white text-[13px] font-semibold rounded-xl shadow-[0_4px_16px_rgba(71,91,138,0.25)] hover:shadow-[0_8px_24px_rgba(71,91,138,0.35)] hover:-translate-y-0.5 transition-all disabled:opacity-60 cursor-pointer"
            >
              {saving ? "..." : "Enregistrer"}
            </button>
            {success && (
              <span className="text-[13px] text-emerald-600 font-medium animate-slide-in-left">
                Enregistre
              </span>
            )}
          </div>
        </form>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-3">
        <Link
          href="/compte/favoris"
          className="flex-1 flex items-center gap-3 px-5 py-4 public-glow-card rounded-xl hover-lift cursor-pointer"
        >
          <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#FF8C69"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
            </svg>
          </div>
          <div>
            <p className="text-[13px] font-semibold text-text">Mes favoris</p>
            <p className="text-[11px] text-text-secondary">
              Vos recettes sauvegardees
            </p>
          </div>
        </Link>

        <Link
          href="/compte/securite"
          className="flex-1 flex items-center gap-3 px-5 py-4 public-glow-card rounded-xl hover-lift cursor-pointer"
        >
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--color-primary)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <div>
            <p className="text-[13px] font-semibold text-text">Securite</p>
            <p className="text-[11px] text-text-secondary">
              Authentification a deux facteurs
            </p>
          </div>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={handleLogout}
          className="flex-1 flex items-center gap-3 px-5 py-4 public-glow-card rounded-xl hover:border-red-200 transition-all cursor-pointer"
        >
          <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#EF4444"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </div>
          <div className="text-left">
            <p className="text-[13px] font-semibold text-red-600">
              Deconnexion
            </p>
            <p className="text-[11px] text-text-secondary">Fermer la session</p>
          </div>
        </button>
      </div>
    </div>
  );
}
