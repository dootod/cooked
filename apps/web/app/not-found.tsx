import Link from "next/link";

export default function NotFound() {
  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center px-4"
      style={{ backgroundColor: "var(--color-bg)", color: "var(--color-text)" }}
    >
      <h1
        className="mb-2 text-6xl font-bold"
        style={{ fontFamily: "var(--font-serif)", color: "var(--color-primary)" }}
      >
        404
      </h1>
      <p className="mb-8 text-lg" style={{ color: "var(--color-text-secondary)" }}>
        Cette page n&apos;existe pas ou a ete deplacee.
      </p>
      <Link
        href="/"
        className="rounded-lg px-6 py-3 font-medium text-white transition-colors"
        style={{ backgroundColor: "var(--color-primary)" }}
      >
        Retour a l&apos;accueil
      </Link>
    </div>
  );
}
