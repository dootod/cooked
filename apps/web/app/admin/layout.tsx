"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useSession, signOut } from "@/lib/auth";

const navItems = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </svg>
    ),
  },
  {
    label: "Recettes",
    href: "/admin/recettes",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 11h.01M11 15h.01M16 16h.01" />
        <path d="m2 16 20 6-6-20A20 20 0 0 0 2 16" />
      </svg>
    ),
  },
  {
    label: "Catégories",
    href: "/admin/categories",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z" />
        <path d="M7 7h.01" />
      </svg>
    ),
  },
  {
    label: "Modération",
    href: "/admin/commentaires",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
      </svg>
    ),
  },
  {
    label: "Utilisateurs",
    href: "/admin/utilisateurs",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
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
      <div className="flex items-center justify-center min-h-screen bg-[#0F1629]">
        <div className="w-8 h-8 border-2 border-white/10 border-t-primary rounded-full animate-spin" />
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
    <div className="flex min-h-screen bg-bg">
      {/* Dark Sidebar */}
      <aside className="w-[260px] bg-[#0F1629] flex flex-col shrink-0 relative overflow-hidden">
        {/* Animated gradient bar */}
        <div className="h-[2px] admin-gradient-bar shrink-0" />

        {/* Ambient glow orb */}
        <div
          className="absolute top-[30%] left-1/2 w-[180px] h-[180px] bg-primary/20 rounded-full blur-[80px] pointer-events-none"
          style={{ animation: "admin-orb 6s ease-in-out infinite" }}
        />

        {/* Logo */}
        <div className="px-5 pt-6 pb-5 relative z-10">
          <Link href="/admin" className="block">
            <span className="text-[22px] font-serif font-bold text-white">
              Cooked<span className="text-accent">.</span>
            </span>
            <span className="block mt-0.5 text-[10px] font-medium tracking-[0.15em] uppercase text-white/25">
              Administration
            </span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-2 space-y-0.5 relative z-10">
          {navItems.map((item) => {
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-200 relative ${
                  isActive
                    ? "text-white bg-white/[0.08]"
                    : "text-white/40 hover:text-white/70 hover:bg-white/[0.04]"
                }`}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 rounded-r-full bg-gradient-to-b from-primary to-accent" />
                )}
                <span className={`transition-colors ${isActive ? "text-primary" : "text-white/30 group-hover:text-white/50"}`}>
                  {item.icon}
                </span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div className="p-4 border-t border-white/[0.06] relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent p-[1.5px]">
              <div className="w-full h-full rounded-[6px] bg-[#0F1629] flex items-center justify-center text-white text-[11px] font-bold">
                {user.name?.charAt(0)?.toUpperCase() || "A"}
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[12px] font-medium text-white/80 truncate">{user.name}</p>
              <p className="text-[10px] text-white/25 truncate">{user.email}</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-[12px] font-medium text-white/35 border border-white/[0.08] rounded-lg hover:text-white/60 hover:bg-white/[0.04] hover:border-white/[0.12] transition-all duration-200 cursor-pointer"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto admin-dot-grid">
        <div className="p-8 max-w-[1200px]">
          {children}
        </div>
      </main>
    </div>
  );
}
