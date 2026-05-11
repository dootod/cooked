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

- [x] Phase 1 — Structure monorepo + schéma DB + stubs API/Web
- [ ] Phase 1 — CRUD recettes backoffice + upload R2
- [ ] Phase 1 — Pages publiques (accueil bento grid, catalogue, détail)
- [ ] Phase 1 — Déploiement Vercel + VPS
- [ ] Phase 2 — Auth membres, favoris, notation, commentaires
- [ ] Phase 2 — Recherche full-text + filtres avancés
- [ ] Phase 3 — Liste de courses PDF, analytics backoffice
- [ ] Phase 4 — i18n, API publique documentée, app mobile

## Documentation

- [Guide de setup](docs/SETUP.md) — installation, configuration, lancement
- [PRD complet](docs/prd.md) — vision, fonctionnalités, design system, déploiement
