# Audit Complet — Todo List

> Audit du 18/05/2026 — 45 items

---

## CRITIQUE (Security / Data Integrity)

- [x] **#1** API — ~~Admin peut se demoter~~ FAUX POSITIF: protection deja en place (ligne 96+100) — `apps/api/src/routes/admin/users.ts`
- [x] **#2** API — Validation WEBP complete: verifie RIFF + bytes 8-12 "WEBP" — `apps/api/src/routes/admin/upload.ts`
- [x] **#3** API — ~~Account lockout case-sensitive~~ FAUX POSITIF: `.toLowerCase()` deja applique (lignes 126,130,134) — `apps/api/src/lib/account-lockout.ts`
- [x] **#4** DB — Index FK ajoutes: `session.userId`, `session.expiresAt`, `account.userId`, `twoFactor.userId` — `packages/db/schema/auth.ts`
- [x] **#5** DB — Unique composite `(accountId, providerId)` ajoute sur account — `packages/db/schema/auth.ts`
- [x] **#6** DB — CHECK constraint `score >= 1 AND score <= 5` + index `ratings.userId` ajoutes — `packages/db/schema/users.ts`
- [x] **#7** Web — Spinner affiche pendant redirect au lieu de null — `apps/web/app/admin/layout.tsx`

## HAUTE PRIORITE (Bugs / Fonctionnel incomplet)

- [ ] **#8** API — Pas de CSRF protection, repose uniquement sur SameSite cookies — `apps/api/src/index.ts`
- [ ] **#9** API — Rate limit IP spoofable via X-Forwarded-For sans validation proxy — `apps/api/src/middleware/rate-limit.ts`
- [ ] **#10** API — Suppression categories sans CASCADE ni check recipes liees, orphelins possibles — `apps/api/src/routes/admin/categories.ts`
- [ ] **#11** API — Comments feature incomplete, table existe mais pas de CRUD public ni creation user — Routes manquantes
- [ ] **#12** API — Admin comments endpoint pas pagine, retourne TOUS les pending — `apps/api/src/routes/admin/comments.ts`
- [ ] **#13** API — Format reponse inconsistant, mix `{ok:true}`, `{success:true}`, `{user:...}` — Multiple fichiers API
- [ ] **#14** DB — Index manquants expiry: `session.expiresAt`, `verification.expiresAt`, `account.*ExpiresAt` — `packages/db/schema/auth.ts`
- [ ] **#15** DB — Index manquant `ratings.userId`, lookups user lents — `packages/db/schema/users.ts`
- [ ] **#16** DB — Soft delete recipes incomplet, `deletedAt` existe mais pas d'index ni filtre par defaut — `packages/db/schema/recipes.ts`
- [ ] **#17** Web — `<img>` partout au lieu de `next/image`, pas d'optimisation images — Multiple pages
- [ ] **#18** Web — Alt attributes manquants/null sur images recettes — Multiple composants
- [ ] **#19** Web — Pas de logging erreurs, erreurs API avalees silencieusement — `apps/web/lib/api.ts`

## MOYENNE PRIORITE (DX / Accessibilite / Performance)

- [ ] **#20** Web — Zero accessibilite: pas de focus indicators, aria-labels, skip-to-content — Global web
- [ ] **#21** Web — Pas de `prefers-reduced-motion`, animations tournent toujours — `apps/web/app/globals.css`
- [ ] **#22** Web — Video iframes sans attribut `title` + pas lazy-loaded — `apps/web/app/(public)/recettes/[slug]/page.tsx`
- [ ] **#23** Web — Header `isDark` hardcode a `true` — `apps/web/components/public/Header.tsx:31`
- [ ] **#24** Web — Admin recettes pas de pagination, hardcode `limit=200` — `apps/web/app/admin/recettes/page.tsx`
- [ ] **#25** Web — Stagger animation inline `animate-stagger-${i}` classes Tailwind pas generees — `apps/web/app/compte/favoris/page.tsx`
- [ ] **#26** API — Equipment pas retourne dans listing public recettes (seulement detail) — `apps/api/src/routes/recipes.ts`
- [ ] **#27** API — Search recettes titre uniquement, pas description/ingredients — `apps/api/src/routes/recipes.ts:39`
- [ ] **#28** API — Email verification bypass sur PATCH /api/me (inconsistant avec favorites) — `apps/api/src/routes/me.ts`
- [ ] **#29** API — Orphan upload cleanup race condition sans lock DB — `apps/api/src/routes/admin/cleanup.ts`
- [ ] **#30** API — Type safety, unsafe cast `as unknown as AppEnv` dans auth middleware — `apps/api/src/middleware/auth.ts:10`
- [ ] **#31** DB — Timestamps nullable dans `verification` table, inconsistant avec autres tables — `packages/db/schema/auth.ts`
- [ ] **#32** DB — Index composite manquant `(action, created_at)` sur audit_logs — `packages/db/schema/audit.ts`
- [ ] **#33** Infra — Zero ESLint, seulement Prettier — Root config
- [ ] **#34** Infra — Zero pre-commit hooks (husky/lint-staged) — Root config
- [ ] **#35** Infra — `db:generate`/`db:migrate` pas dans turbo.json — `turbo.json`

## BASSE PRIORITE (Polish / Nice-to-have)

- [ ] **#36** Web — Pas de dynamic imports composants lourds (RecipeForm, etc.) — Multiple
- [ ] **#37** Web — Animations longues (8-12s) drain batterie mobile — `globals.css`
- [ ] **#38** Web — Header trop gros composant, split en sous-composants — `Header.tsx`
- [ ] **#39** Web — Code duplique `difficultyLabel` dans plusieurs fichiers — Multiple
- [ ] **#40** Web — Pas de next.config.js (CSP headers, image domains) — Manquant
- [ ] **#41** Web — Pas de tests (zero jest/vitest) — Global
- [ ] **#42** API — Pas de tests — Global
- [ ] **#43** DB — Subpath export `@cooked/db/schema` existe malgre warning CLAUDE.md — `packages/db/package.json`
- [ ] **#44** DB — `audit_logs.targetId`/`targetType` pas de validation both-or-neither — `packages/db/schema/audit.ts`
- [ ] **#45** Infra — `.env.example` web manque `BETTER_AUTH_SECRET` — `apps/web/.env.example`
