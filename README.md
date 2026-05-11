# Cooked

Plateforme web de gestion et consultation de recettes culinaires.

## Stack

| Couche | Tech |
|---|---|
| Monorepo | Turborepo 2.x + pnpm 11.x |
| API | Hono 4.12.x + Node.js 24 |
| Frontend | Next.js 16 (App Router) |
| Base de données | Drizzle ORM 0.45.x + PostgreSQL |
| Auth | Better Auth 1.6.x |
| Médias | Cloudflare R2 |
| Emails | Resend |

## Prérequis

- Node.js >= 24
- pnpm >= 10
- PostgreSQL (local ou distant)

## Setup

### 1. Cloner le repo

```bash
git clone https://github.com/TON_USERNAME/cooked.git
cd cooked
```

### 2. Installer les dépendances

```bash
pnpm install
```

### 3. Variables d'environnement

```bash
# API
cp apps/api/.env.example apps/api/.env

# Web
cp apps/web/.env.example apps/web/.env

# DB (pour les migrations)
cp packages/db/.env.example packages/db/.env
```

Remplir dans `apps/api/.env` :

```env
DATABASE_URL=postgresql://postgres:MOT_DE_PASSE@localhost:5432/cooked
BETTER_AUTH_SECRET=une_chaine_aleatoire_64_chars
BETTER_AUTH_URL=http://localhost:3001
CORS_ORIGIN=http://localhost:3000
PORT=3001
```

### 4. Créer la base de données

Dans pgAdmin ou psql :

```sql
CREATE DATABASE cooked;
```

### 5. Appliquer le schéma

```bash
cd packages/db
pnpm db:push
```

### 6. Lancer en dev

```bash
# Depuis la racine
pnpm dev
```

- Web → http://localhost:3000
- API → http://localhost:3001
- Health check → http://localhost:3001/health

## Scripts disponibles

| Commande | Description |
|---|---|
| `pnpm dev` | Lance tous les serveurs en parallèle |
| `pnpm build` | Build de production |
| `pnpm typecheck` | Vérification TypeScript |
| `pnpm lint` | Lint |
| `cd packages/db && pnpm db:push` | Applique le schéma DB |
| `cd packages/db && pnpm db:studio` | Interface Drizzle Studio |

## Structure

```
cooked/
├── apps/
│   ├── api/          Hono — API REST (port 3001)
│   └── web/          Next.js — site public + /admin (port 3000)
├── packages/
│   └── db/           Drizzle ORM — schéma partagé
├── docs/
│   └── prd.md        Product Requirements Document
└── turbo.json
```

## Roadmap

- [x] Phase 1 — Structure monorepo + schéma DB + stubs API/Web
- [ ] Phase 1 — CRUD recettes backoffice + upload R2
- [ ] Phase 1 — Pages publiques (accueil bento grid, catalogue, détail)
- [ ] Phase 1 — Déploiement Vercel + VPS
- [ ] Phase 2 — Auth membres (Better Auth)
- [ ] Phase 2 — Favoris, notation, commentaires
- [ ] Phase 2 — Recherche full-text + filtres
- [ ] Phase 3 — Liste de courses PDF, analytics
- [ ] Phase 4 — i18n, API publique, mobile

Voir le [PRD complet](docs/prd.md) pour le détail.
