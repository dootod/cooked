"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "@/lib/auth";

const navItems = [
  { label: "Accueil", href: "/" },
  { label: "Recettes", href: "/recettes" },
];

type HeaderProps = {
  hideSearch?: boolean;
  hideLogo?: boolean;
  darkBg?: string;
  showGradientBar?: boolean;
  sidebarToggle?: () => void;
  inlineProfile?: boolean;
};

export default function Header({ hideSearch = false, hideLogo = false, darkBg = "bg-[#0a0f1e]", showGradientBar = false, sidebarToggle, inlineProfile = false }: HeaderProps = {}) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);

  const isDark = true;

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/recettes?search=${encodeURIComponent(searchQuery.trim())}`);
    setSearchOpen(false);
    setSearchQuery("");
  }

  const bar = isDark
    ? `${darkBg} border-b border-white/[0.06]`
    : "bg-white/80 backdrop-blur-xl border-b border-border/40";
  const logo = isDark ? "text-white" : "text-text";
  const sIcon = isDark ? "text-white/30" : "text-text-tertiary";
  const sInput = isDark
    ? "bg-white/[0.08] border-white/[0.1] text-white placeholder:text-white/30 focus:border-primary/40"
    : "bg-primary-light/50 border-border/30 text-text placeholder:text-text-tertiary focus:border-primary/30 focus:bg-white";
  const navAct = isDark ? "text-white bg-white/[0.1]" : "text-primary bg-primary-light/60";
  const navDef = isDark
    ? "text-white/50 hover:text-white hover:bg-white/[0.06]"
    : "text-text-secondary hover:text-text hover:bg-primary-light/30";
  const mobBtn = isDark ? "text-white/40 hover:text-white" : "text-text-secondary hover:text-text";
  const mobBorder = isDark ? "border-white/[0.06]" : "border-border/30";
  const mobName = isDark ? "text-white" : "text-text";
  const mobEmail = isDark ? "text-white/40" : "text-text-tertiary";
  const ddBg = isDark
    ? "bg-[#0a0f1e] border-white/[0.1] shadow-black/50"
    : "bg-white/90 backdrop-blur-xl border-border/40 shadow-black/8";
  const ddItem = isDark
    ? "text-white/50 hover:text-white hover:bg-white/[0.06]"
    : "text-text-secondary hover:text-primary hover:bg-primary-light/30";

  return (
    <header className="sticky top-0 z-40">
      {showGradientBar && <div className="h-[2px] admin-gradient-bar" />}
      <div className={bar}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {sidebarToggle && (
              <button onClick={sidebarToggle} className={`lg:hidden shrink-0 w-10 h-10 flex items-center justify-center transition-colors cursor-pointer mr-2 ${mobBtn}`}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              </button>
            )}
            {!hideLogo && (
              <Link href="/" className="shrink-0">
                <span className={`text-2xl font-serif font-bold ${logo}`}>
                  Cooked<span className="text-accent">.</span>
                </span>
              </Link>
            )}

            <form onSubmit={handleSearch} className={`${hideSearch ? "hidden" : "hidden md:flex"} items-center flex-1 max-w-md mx-8`}>
              <div className="relative w-full">
                <svg className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${sIcon}`} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
                </svg>
                <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Rechercher une recette..." className={`w-full pl-10 pr-4 py-2 rounded-full border text-sm focus:outline-none transition-all ${sInput}`} />
              </div>
            </form>

            {inlineProfile ? (
              <nav className="hidden md:flex items-center justify-center flex-1 gap-1">
                {navItems.map((item) => {
                  const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
                  return (
                    <Link key={item.href} href={item.href} className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${isActive ? navAct : navDef}`}>
                      {item.label}
                    </Link>
                  );
                })}
                <div className={`mx-3 w-px h-5 ${isDark ? "bg-white/[0.08]" : "bg-border/40"}`} />
                {session ? (
                  <>
                    <Link href="/compte/profil" className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${navDef}`}>Mon profil</Link>
                    <Link href="/compte/favoris" className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${navDef}`}>Mes favoris</Link>
                    <button onClick={async () => { await signOut(); router.push("/"); }} className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${isDark ? "text-red-400 hover:bg-red-500/10" : "text-red-500 hover:bg-red-50"}`}>Deconnexion</button>
                  </>
                ) : (
                  <Link href="/compte/connexion" className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-all">Connexion</Link>
                )}
              </nav>
            ) : (
              <nav className={`hidden md:flex items-center gap-1 ${hideLogo ? "ml-auto" : ""}`}>
                {navItems.map((item) => {
                  const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
                  return (
                    <Link key={item.href} href={item.href} className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${isActive ? navAct : navDef}`}>
                      {item.label}
                    </Link>
                  );
                })}

                {session ? (
                  <div className="relative ml-2">
                    <button onClick={() => setProfileOpen(!profileOpen)} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${navDef}`}>
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-[10px] font-bold">
                        {session.user?.name?.charAt(0)?.toUpperCase() || "U"}
                      </div>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                    </button>
                    {profileOpen && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setProfileOpen(false)} />
                        <div className={`absolute right-0 top-full mt-2 w-52 border rounded-xl shadow-xl py-1 z-20 ${ddBg}`}>
                          <div className={`px-3 py-2.5 border-b ${mobBorder}`}>
                            <p className={`text-sm font-medium truncate ${mobName}`}>{session.user?.name}</p>
                            <p className={`text-xs truncate ${mobEmail}`}>{session.user?.email}</p>
                          </div>
                          {session.user?.role === "admin" && (
                            <Link href="/admin" className={`block px-3 py-2 text-sm transition-colors ${ddItem}`} onClick={() => setProfileOpen(false)}>Administration</Link>
                          )}
                          <Link href="/compte/profil" className={`block px-3 py-2 text-sm transition-colors ${ddItem}`} onClick={() => setProfileOpen(false)}>Mon profil</Link>
                          <Link href="/compte/favoris" className={`block px-3 py-2 text-sm transition-colors ${ddItem}`} onClick={() => setProfileOpen(false)}>Mes favoris</Link>
                          <button onClick={async () => { await signOut(); setProfileOpen(false); router.push("/"); }} className={`w-full text-left px-3 py-2 text-sm transition-colors ${isDark ? "text-red-400 hover:bg-red-500/10" : "text-red-500 hover:bg-red-50"} cursor-pointer`}>Deconnexion</button>
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <Link href="/compte/connexion" className="ml-3 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-hover hover:shadow-lg hover:shadow-primary/20 transition-all">Connexion</Link>
                )}
              </nav>
            )}

            <div className="flex items-center gap-1 md:hidden">
              {!hideSearch && (
                <button onClick={() => { setSearchOpen(!searchOpen); setMobileOpen(false); }} className={`w-10 h-10 flex items-center justify-center transition-colors cursor-pointer ${mobBtn}`}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
                </button>
              )}
              <button onClick={() => { setMobileOpen(!mobileOpen); setSearchOpen(false); }} className={`w-10 h-10 flex items-center justify-center transition-colors cursor-pointer ${mobBtn}`}>
                {mobileOpen ? (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                ) : (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
                )}
              </button>
            </div>
          </div>

          {searchOpen && (
            <div className="pb-3 md:hidden">
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <svg className={`absolute left-3 top-1/2 -translate-y-1/2 ${sIcon}`} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
                  <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Rechercher une recette..." autoFocus className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm focus:outline-none transition-all ${sInput}`} />
                </div>
              </form>
            </div>
          )}

          {mobileOpen && (
            <nav className="pb-4 space-y-1 md:hidden">
              {navItems.map((item) => {
                const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
                return (
                  <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)} className={`block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive ? navAct : navDef}`}>
                    {item.label}
                  </Link>
                );
              })}
              <div className={`pt-2 border-t ${mobBorder}`}>
                {session ? (
                  <>
                    <div className="px-3 py-2">
                      <p className={`text-sm font-medium ${mobName}`}>{session.user?.name}</p>
                      <p className={`text-xs ${mobEmail}`}>{session.user?.email}</p>
                    </div>
                    {session.user?.role === "admin" && (
                      <Link href="/admin" onClick={() => setMobileOpen(false)} className={`block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${ddItem}`}>Administration</Link>
                    )}
                    <button onClick={async () => { await signOut(); setMobileOpen(false); router.push("/"); }} className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isDark ? "text-red-400 hover:bg-red-500/10" : "text-red-500 hover:bg-red-50"} cursor-pointer`}>Deconnexion</button>
                  </>
                ) : (
                  <Link href="/compte/connexion" onClick={() => setMobileOpen(false)} className="block px-3 py-2.5 rounded-lg text-sm font-medium text-primary hover:bg-primary-light/30 transition-colors">Connexion</Link>
                )}
              </div>
            </nav>
          )}
        </div>
      </div>
    </header>
  );
}
