# Cooked

Plateforme web de gestion et consultation de recettes culinaires — monorepo TypeScript full-stack.

## Vision

**Cooked** est un outil élégant pour créer, gérer et consulter des recettes culinaires. Il propose un backoffice complet pour les administrateurs, une API REST découplée, et des pages publiques accessibles à tous.

## Stack

| Couche | Tech |
|---|---|
| Monorepo | Turborepo 2.x + pnpm 11.x |
| API | Hono 4.12.x + Node.js 24 LTS |
| Frontend | Next.js 16 App Router |
| Base de données | Drizzle ORM 0.45.x + PostgreSQL |
| Auth | Better Auth 1.6.x |
| Médias | Cloudflare R2 |
| Emails | Resend |

## Structure

```
cooked/
├── apps/
│   ├── api/          Hono — API REST (port 3001)
│   └── web/          Next.js — site public + /admin (port 3000)
├── packages/
│   └── db/           Drizzle ORM — schéma partagé
└── docs/
    ├── prd.md        Product Requirements Document
    └── SETUP.md      Guide d'installation et de développement
```

## Roadmap

- [x] Phase 1 — Structure monorepo + schema DB + stubs API/Web
- [x] Phase 1 — Auth admin (Better Auth) + backoffice CRUD recettes/categories
- [x] Phase 1 — Pages connexion/inscription (split-screen design)
- [x] Phase 1 — Dashboard technique (KPIs, plateforme, stack)
- [x] Phase 1 — Gestion utilisateurs (fetch Better Auth, ban/role)
- [x] Phase 1 — Moderation commentaires fonctionnelle (approve/reject)
- [x] Phase 1 — Responsive complet (sidebar mobile, tables/cards adaptatives, formulaires)
- [x] Phase 1 — Pages publiques (accueil bento grid, catalogue filtrable, detail recette)
- [x] Phase 1 — Audit securite : validation Zod, error handling, FK/indexes DB, proxy admin role check
- [x] Phase 1 — Consolidation schema (table users supprimee, user Better Auth = source unique)
- [x] Phase 1 — API /api/me (profil + favoris CRUD), pages 404/error/loading
- [ ] Phase 1 — Upload images Cloudflare R2
- [ ] Phase 1 — Deploiement Vercel + VPS
- [ ] Phase 2 — Favoris, notation, commentaires membres (frontend)
- [ ] Phase 2 — Recherche full-text + filtres avances
- [ ] Phase 3 — Liste de courses PDF, analytics backoffice
- [ ] Phase 4 — i18n, API publique documentee, app mobile

## Documentation

- [Guide de setup](docs/SETUP.md) — installation, configuration, lancement
- [PRD complet](docs/prd.md) — vision, fonctionnalités, design system, déploiement
