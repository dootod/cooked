"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center px-4"
      style={{ backgroundColor: "var(--color-bg)", color: "var(--color-text)" }}
    >
      <h1
        className="mb-2 text-4xl font-bold"
        style={{ fontFamily: "var(--font-serif)", color: "var(--color-primary)" }}
      >
        Erreur
      </h1>
      <p className="mb-8 text-lg" style={{ color: "var(--color-text-secondary)" }}>
        Une erreur inattendue est survenue.
      </p>
      <button
        onClick={reset}
        className="rounded-lg px-6 py-3 font-medium text-white transition-colors"
        style={{ backgroundColor: "var(--color-primary)" }}
      >
        Reessayer
      </button>
    </div>
  );
}
