"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface Comment {
  id: string;
  userId: string;
  recipeId: string;
  content: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

export default function AdminCommentairesPage() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      const data = await api.get<{ comments: Comment[] }>("/api/admin/comments");
      setComments(data.comments);
    } catch {
      setComments([]);
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleModerate(id: string, status: "approved" | "rejected") {
    await api.patch(`/api/admin/comments/${id}`, { status });
    setComments((prev) => prev.filter((c) => c.id !== id));
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
          <h1 className="text-[28px] font-bold text-text tracking-tight">Moderation</h1>
          <p className="mt-1 text-[14px] text-text-secondary">
            {comments.length} commentaire{comments.length !== 1 ? "s" : ""} en attente
          </p>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 rounded-xl bg-white/40 animate-pulse" />
          ))}
        </div>
      ) : comments.length === 0 ? (
        <div className="admin-glass rounded-xl text-center py-16 px-8">
          <svg width="64" height="64" viewBox="0 0 80 80" fill="none" className="mx-auto mb-5 opacity-60">
            <rect x="10" y="14" width="40" height="28" rx="8" stroke="#4F6FE8" strokeWidth="1.5" />
            <path d="M18 36v8l8-8" stroke="#4F6FE8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="22" cy="28" r="2" fill="#4F6FE8" />
            <circle cx="30" cy="28" r="2" fill="#4F6FE8" />
            <circle cx="38" cy="28" r="2" fill="#4F6FE8" />
            <rect x="30" y="38" width="40" height="24" rx="8" stroke="#FF8C69" strokeWidth="1.5" />
            <path d="M62 62v6l-6-6" stroke="#FF8C69" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <line x1="40" y1="48" x2="60" y2="48" stroke="#FF8C69" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
            <line x1="40" y1="54" x2="54" y2="54" stroke="#FF8C69" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
          </svg>
          <h3 className="text-[16px] font-semibold text-text mb-1.5">Aucun commentaire en attente</h3>
          <p className="text-[13px] text-text-secondary">
            Les commentaires soumis par les membres apparaitront ici pour moderation.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {comments.map((comment) => (
            <div key={comment.id} className="admin-glass rounded-xl p-5">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] text-text leading-relaxed">{comment.content}</p>
                </div>
                <span className="shrink-0 text-[11px] text-text-tertiary font-mono">
                  {formatDate(comment.createdAt)}
                </span>
              </div>
              <div className="flex items-center gap-2 pt-2 border-t border-border/15">
                <button
                  onClick={() => handleModerate(comment.id, "approved")}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-[12px] font-semibold text-emerald-600 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-all cursor-pointer"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Approuver
                </button>
                <button
                  onClick={() => handleModerate(comment.id, "rejected")}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-[12px] font-semibold text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-all cursor-pointer"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                  Rejeter
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
