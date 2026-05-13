"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface User {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  role: string | null;
  banned: boolean | null;
  banReason: string | null;
  createdAt: string;
}

export default function AdminUtilisateursPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      const data = await api.get<{ users: User[] }>("/api/admin/users");
      setUsers(data.users);
    } catch {
      setUsers([]);
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleToggleBan(u: User) {
    const newBanned = !u.banned;
    await api.patch(`/api/admin/users/${u.id}`, {
      banned: newBanned,
      banReason: newBanned ? "Banni par un administrateur" : null,
    });
    await load();
  }

  async function handleToggleRole(u: User) {
    const newRole = u.role === "admin" ? "user" : "admin";
    await api.patch(`/api/admin/users/${u.id}`, { role: newRole });
    await load();
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  return (
    <div className="admin-fade-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-[28px] font-bold text-text tracking-tight">Utilisateurs</h1>
          <p className="mt-1 text-[14px] text-text-secondary">
            {users.length} compte{users.length !== 1 ? "s" : ""} inscrit{users.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 rounded-xl bg-white/40 animate-pulse" />
          ))}
        </div>
      ) : users.length === 0 ? (
        <div className="admin-glass rounded-xl text-center py-16 px-8">
          <svg width="64" height="64" viewBox="0 0 80 80" fill="none" className="mx-auto mb-5 opacity-60">
            <circle cx="32" cy="24" r="10" stroke="#475B8A" strokeWidth="1.5" />
            <path d="M14 56a18 18 0 0 1 36 0" stroke="#475B8A" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="54" cy="30" r="8" stroke="#FF8C69" strokeWidth="1.5" />
            <path d="M42 60a14 14 0 0 1 24 0" stroke="#FF8C69" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <h3 className="text-[16px] font-semibold text-text mb-1.5">Aucun utilisateur inscrit</h3>
          <p className="text-[13px] text-text-secondary">
            Les membres apparaitront ici une fois inscrits.
          </p>
        </div>
      ) : (
        <div className="admin-glass rounded-xl overflow-hidden">
          {/* Desktop table */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/30">
                  <th className="px-5 py-3 text-left text-[10px] font-bold tracking-[0.08em] uppercase text-text-tertiary">Utilisateur</th>
                  <th className="px-5 py-3 text-left text-[10px] font-bold tracking-[0.08em] uppercase text-text-tertiary">Role</th>
                  <th className="px-5 py-3 text-left text-[10px] font-bold tracking-[0.08em] uppercase text-text-tertiary">Statut</th>
                  <th className="px-5 py-3 text-left text-[10px] font-bold tracking-[0.08em] uppercase text-text-tertiary">Inscription</th>
                  <th className="px-5 py-3 text-right text-[10px] font-bold tracking-[0.08em] uppercase text-text-tertiary">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u, i) => (
                  <tr
                    key={u.id}
                    className={`group hover:bg-primary/[0.02] transition-colors ${
                      i < users.length - 1 ? "border-b border-border/15" : ""
                    }`}
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/8 flex items-center justify-center text-[12px] font-bold text-primary shrink-0">
                          {u.name?.charAt(0)?.toUpperCase() || "?"}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[13px] font-medium text-text truncate">{u.name}</p>
                          <p className="text-[11px] text-text-tertiary truncate">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-semibold ${
                        u.role === "admin"
                          ? "bg-primary/10 text-primary"
                          : "bg-border/20 text-text-secondary"
                      }`}>
                        {u.role === "admin" ? "Admin" : "Membre"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      {u.banned ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-red-50 text-red-600">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                          Banni
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-600">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          Actif
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-[12px] text-text-secondary font-mono">{formatDate(u.createdAt)}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex gap-1 justify-end sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleToggleRole(u)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-text-tertiary hover:text-primary hover:bg-primary/8 transition-all cursor-pointer"
                          title={u.role === "admin" ? "Retirer admin" : "Promouvoir admin"}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleToggleBan(u)}
                          className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all cursor-pointer ${
                            u.banned
                              ? "text-emerald-500 hover:bg-emerald-50"
                              : "text-text-tertiary hover:text-red-500 hover:bg-red-50"
                          }`}
                          title={u.banned ? "Debannir" : "Bannir"}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="sm:hidden divide-y divide-border/15">
            {users.map((u) => (
              <div key={u.id} className="px-4 py-3.5">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div className="w-8 h-8 rounded-lg bg-primary/8 flex items-center justify-center text-[12px] font-bold text-primary shrink-0">
                      {u.name?.charAt(0)?.toUpperCase() || "?"}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[13px] font-medium text-text truncate">{u.name}</p>
                      <p className="text-[11px] text-text-tertiary truncate">{u.email}</p>
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0 ml-2">
                    <button
                      onClick={() => handleToggleRole(u)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-text-tertiary hover:text-primary hover:bg-primary/8 transition-all cursor-pointer"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleToggleBan(u)}
                      className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all cursor-pointer ${
                        u.banned ? "text-emerald-500 hover:bg-emerald-50" : "text-text-tertiary hover:text-red-500 hover:bg-red-50"
                      }`}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-[42px]">
                  <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-semibold ${
                    u.role === "admin" ? "bg-primary/10 text-primary" : "bg-border/20 text-text-secondary"
                  }`}>
                    {u.role === "admin" ? "Admin" : "Membre"}
                  </span>
                  {u.banned ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-red-50 text-red-600">Banni</span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-600">Actif</span>
                  )}
                  <span className="text-[10px] text-text-tertiary font-mono">{formatDate(u.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
