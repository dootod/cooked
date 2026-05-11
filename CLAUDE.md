# Cooked — Contexte projet pour Claude Code

## Stack

- **Monorepo** Turborepo 2.x + pnpm 11.x
- **`apps/api`** — Hono 4.12.x + @hono/node-server 2.0.2, port 3001, `"type": "module"`, tsx en dev
- **`apps/web`** — Next.js 16.2.x App Router, port 3000, Turbopack en dev
- **`packages/db`** — Drizzle ORM 0.45.x + postgres.js, `"type": "module"`, partagé entre api et web
- **Auth** — Better Auth 1.6.x (pas encore câblé, stubs en place)
- **Médias** — Cloudflare R2 (pas encore câblé)
- **Emails** — Resend (pas encore câblé)

## Conventions importantes

### Imports workspace
- Importer depuis `@cooked/db` (pas `@cooked/db/schema`) — le subpath export ne résout pas bien avec tsx ESM
- `packages/db/index.ts` re-exporte tout via `export * from "./schema/recipes.js"` et `export * from "./schema/users.js"` (extensions `.js` obligatoires pour ESM)

### API (apps/api)
- Chaque fichier route = une instance `Hono` exportée en default
- Middlewares dans `src/middleware/` — `auth.ts` vérifie JWT, `admin.ts` vérifie le rôle
- Routes admin protégées par `authMiddleware` + `adminMiddleware`
- Imports relatifs avec extension `.js` (Node ESM strict)

### Web (apps/web)
- App Router Next.js 16 — pages dans `app/`
- `proxy.ts` (remplace `middleware.ts` de Next.js 15) — protège `/admin`
- La fonction exportée doit s'appeler `proxy` (convention Next.js 16)
- Variables d'env publiques préfixées `NEXT_PUBLIC_`
- `lib/api.ts` — wrapper fetch vers l'API Hono
- `lib/auth.ts` — client Better Auth

### DB (packages/db)
- Schéma dans `schema/recipes.ts` et `schema/users.ts`
- Migrations dans `migrations/` (via `pnpm db:generate` + `pnpm db:migrate`)
- `pnpm db:push` pour dev (applique directement sans migration)
- IDs en `text` avec `crypto.randomUUID()`

## Design system
- Primaire : `#4F6FE8` (indigo)
- Accent : `#FF8C69` (pêche corail)
- Fond : `#F6F8FF`
- Fonts : Playfair Display (titres), Inter (UI), JetBrains Mono (macros/données)
- CSS variables dans `apps/web/app/globals.css`

## Dev

```bash
pnpm dev          # lance api + web en parallèle
pnpm typecheck    # vérification TS tous packages
```

## Statut phase actuelle

**Phase 1 MVP** — structure en place, DB créée, serveurs up.
Prochaine étape : implémenter CRUD recettes backoffice + pages publiques.

## Fichiers clés

| Fichier | Rôle |
|---|---|
| `packages/db/schema/recipes.ts` | Tables recipes, categories, tags, ingredients, steps, macros, medias, equipment + jointures |
| `packages/db/schema/users.ts` | Tables users, favorites, ratings, comments |
| `apps/api/src/index.ts` | Point d'entrée Hono — monte toutes les routes |
| `apps/web/app/layout.tsx` | Layout racine Next.js — fonts Google |
| `apps/web/proxy.ts` | Protection routes /admin |
| `docs/prd.md` | PRD complet du projet |
