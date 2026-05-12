"use client";

export default function AdminUtilisateursPage() {
  return (
    <div className="admin-fade-up">
      <div className="mb-8">
        <h1 className="text-[28px] font-bold text-text tracking-tight">Utilisateurs</h1>
        <p className="mt-1 text-[14px] text-text-secondary">
          Gestion des comptes membres.
        </p>
      </div>

      <div className="admin-glass rounded-2xl text-center py-20 px-8">
        <svg width="80" height="80" viewBox="0 0 80 80" fill="none" className="mx-auto mb-6">
          <circle cx="32" cy="24" r="10" stroke="#4F6FE8" strokeWidth="1.5" />
          <path d="M14 56a18 18 0 0 1 36 0" stroke="#4F6FE8" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="54" cy="30" r="8" stroke="#FF8C69" strokeWidth="1.5" />
          <path d="M42 60a14 14 0 0 1 24 0" stroke="#FF8C69" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="54" cy="30" r="2" fill="#FF8C69" opacity="0.3" />
          <circle cx="32" cy="24" r="3" fill="#4F6FE8" opacity="0.15" />
        </svg>
        <h3 className="text-lg font-semibold text-text mb-2">Aucun utilisateur inscrit</h3>
        <p className="text-sm text-text-secondary">
          Les membres inscrits apparaitront ici. Vous pourrez les gérer et les modérer.
        </p>
      </div>
    </div>
  );
}
