"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useSession, signOut } from "@/lib/auth";

const navItems = [
  { label: "Dashboard", href: "/admin" },
  { label: "Recettes", href: "/admin/recettes" },
  { label: "Catégories", href: "/admin/categories" },
  { label: "Commentaires", href: "/admin/commentaires" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/compte/connexion");
    }
    if (!isPending && session && session.user?.role !== "admin") {
      router.push("/");
    }
  }, [session, isPending, router]);

  if (isPending) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <p style={{ color: "var(--color-text-secondary)", fontSize: 14 }}>Chargement...</p>
      </div>
    );
  }

  if (!session || session.user?.role !== "admin") return null;

  const user = session.user;

  async function handleSignOut() {
    await signOut();
    router.push("/compte/connexion");
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--color-bg)" }}>
      {/* Sidebar */}
      <aside
        style={{
          width: 240,
          background: "var(--color-surface)",
          borderRight: "1px solid var(--color-border)",
          display: "flex",
          flexDirection: "column",
          flexShrink: 0,
        }}
      >
        {/* Logo */}
        <div
          style={{
            padding: "24px",
            borderBottom: "1px solid var(--color-border)",
          }}
        >
          <Link href="/admin" style={{ textDecoration: "none" }}>
            <span
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: 22,
                fontWeight: 700,
                color: "var(--color-primary)",
              }}
            >
              Cooked
            </span>
            <span
              style={{
                fontSize: 11,
                color: "var(--color-text-secondary)",
                display: "block",
                marginTop: 2,
                letterSpacing: "0.05em",
                textTransform: "uppercase",
              }}
            >
              Backoffice
            </span>
          </Link>
        </div>

        {/* Nav */}
        <nav style={{ padding: "12px 0", flex: 1 }}>
          {navItems.map((item) => {
            const isActive =
              item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: "block",
                  padding: "10px 24px",
                  fontSize: 14,
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? "var(--color-primary)" : "var(--color-text-secondary)",
                  background: isActive ? "var(--color-primary-light)" : "transparent",
                  borderLeft: isActive
                    ? "3px solid var(--color-primary)"
                    : "3px solid transparent",
                  textDecoration: "none",
                  transition: "background 0.15s",
                }}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User + logout */}
        <div
          style={{
            padding: 16,
            borderTop: "1px solid var(--color-border)",
          }}
        >
          <p style={{ fontSize: 13, fontWeight: 500, color: "var(--color-text)" }}>{user.name}</p>
          <p style={{ fontSize: 12, color: "var(--color-text-secondary)", marginBottom: 10 }}>
            {user.email}
          </p>
          <button
            onClick={handleSignOut}
            style={{
              fontSize: 13,
              color: "var(--color-text-secondary)",
              background: "transparent",
              border: "1px solid var(--color-border)",
              borderRadius: 6,
              padding: "6px 12px",
              cursor: "pointer",
              width: "100%",
            }}
          >
            Se déconnecter
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, padding: 32, overflow: "auto" }}>{children}</main>
    </div>
  );
}
