"use client";

export default function AdminCommentairesPage() {
  return (
    <div className="admin-fade-up">
      <div className="mb-8">
        <h1 className="text-[28px] font-bold text-text tracking-tight">Modération</h1>
        <p className="mt-1 text-[14px] text-text-secondary">
          Commentaires en attente de validation.
        </p>
      </div>

      <div className="admin-glass rounded-2xl text-center py-20 px-8">
        <svg width="80" height="80" viewBox="0 0 80 80" fill="none" className="mx-auto mb-6">
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
        <h3 className="text-lg font-semibold text-text mb-2">Aucun commentaire en attente</h3>
        <p className="text-sm text-text-secondary">
          Les commentaires soumis par les membres apparaitront ici pour modération.
        </p>
      </div>
    </div>
  );
}
