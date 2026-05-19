# Audit Complet — Todo List

> Audit du 18/05/2026 — 45 items

- [x] **Ajouter manuellement** ~~On ne peux plus supprimer des utilisateurs depuis la page utilisateurs admin~~ Fix: `audit_logs.userId` etait `.notNull()` + `onDelete: "set null"` = conflit constraint. Rendu nullable — `packages/db/schema/audit.ts`

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

- [x] **#8** API — CSRF: verification Origin header sur requetes state-changing — `apps/api/src/index.ts`
- [x] **#9** API — Rate limit: `TRUST_PROXY` env var, ignore forwarded headers si pas configure — `apps/api/src/middleware/rate-limit.ts`
- [x] **#10** API — ~~Suppression categories~~ FAUX POSITIF: FK `onDelete: "cascade"` gere par PostgreSQL
- [x] **#11** API — CRUD commentaires public: GET + POST `/api/recipes/:slug/comments` — `apps/api/src/routes/comments.ts`
- [x] **#12** API — Admin comments pagine avec jointures user/recipe — `apps/api/src/routes/admin/comments.ts`
- [x] **#13** API — `{success: true}` → `{ok: true}` standardise — `apps/api/src/routes/admin/users.ts`
- [x] **#14** DB — Index ajoutes: `verification.identifier`, `verification.expiresAt` (session.expiresAt deja fait en #4) — `packages/db/schema/auth.ts`
- [x] **#15** DB — ~~Index ratings.userId~~ Deja fait en #6
- [x] **#16** DB — Index `recipes.deletedAt` ajoute — `packages/db/schema/recipes.ts`
- [x] **#17** Web — `<img>` → `next/image` avec `fill`+`sizes` sur RecipeCard, recipe detail, profil — Multiple fichiers
- [x] **#18** Web — Alt attributes corriges: fallback `recipe.title` au lieu de `""` — Multiple fichiers
- [x] **#19** Web — Error logging ajoute: `console.error` avant throw dans api.ts — `apps/web/lib/api.ts`

## MOYENNE PRIORITE (DX / Accessibilite / Performance)

- [x] **#20** Web — Focus indicators (`*:focus-visible`), skip-to-content link, `<main id="main-content">` — `globals.css` + `layout.tsx`
- [x] **#21** Web — `prefers-reduced-motion: reduce` desactive toutes animations — `globals.css`
- [x] **#22** Web — `title` + `loading="lazy"` ajoutes sur iframe video — `apps/web/app/(public)/recettes/[slug]/page.tsx`
- [x] **#23** Web — `isDark` dynamique selon pathname (accueil + detail recette = dark) — `Header.tsx:31`
- [x] **#24** Web — Pagination admin recettes (20/page) avec controles Precedent/Suivant — `apps/web/app/admin/recettes/page.tsx`
- [x] **#25** Web — ~~Stagger animation~~ FAUX POSITIF: classes `.animate-stagger-1` a `.animate-stagger-6` deja definies dans `globals.css:292-297`
- [x] **#26** API — Equipment inclus dans listing public recettes — `apps/api/src/routes/recipes.ts`
- [x] **#27** API — Search etendu a `title OR description` — `apps/api/src/routes/recipes.ts`
- [x] **#28** API — `emailVerifiedMiddleware` ajoute sur `PATCH /api/me` — `apps/api/src/routes/me.ts`
- [x] **#29** API — Lock in-memory `cleanupRunning` empeche execution concurrente — `apps/api/src/routes/admin/cleanup.ts`
- [x] **#30** API — Cast simplifie `as AppEnv["Variables"]["user"]` (supprime `unknown`) — `apps/api/src/middleware/auth.ts`
- [x] **#31** DB — `createdAt`/`updatedAt` dans verification rendus `.notNull().defaultNow()` — `packages/db/schema/auth.ts`
- [x] **#32** DB — Index composite `(action, created_at)` ajoute sur audit_logs — `packages/db/schema/audit.ts`
- [x] **#33** Infra — ESLint 10 + typescript-eslint configure (flat config) — `eslint.config.js`
- [x] **#34** Infra — Husky + lint-staged (ESLint fix + Prettier sur pre-commit) — `.husky/pre-commit` + `package.json`
- [x] **#35** Infra — `db:generate`/`db:migrate` ajoutes dans turbo.json — `turbo.json`

## BASSE PRIORITE (Polish / Nice-to-have)

- [x] **#36** Web — Dynamic import pour RecipeForm (loading skeleton) — `nouveau/page.tsx` + `modifier/page.tsx`
- [x] **#37** Web — Animation morph reduite 8s → 5s + `prefers-reduced-motion` couvre tout — `globals.css`
- [ ] **#38** Web — Header trop gros composant, split en sous-composants — `Header.tsx`
- [x] **#39** Web — `difficultyLabel` extrait dans `lib/recipe-utils.ts`, importe dans 5 fichiers — Multiple
- [x] **#40** Web — ~~Pas de next.config~~ FAUX POSITIF: `next.config.ts` existe deja avec CSP + image domains
- [ ] **#41** Web — Pas de tests (zero jest/vitest) — Global
- [ ] **#42** API — Pas de tests — Global
- [ ] **#43** DB — Subpath export `@cooked/db/schema` existe malgre warning CLAUDE.md — `packages/db/package.json`
- [x] **#44** DB — Type union `AuditTarget` force both-or-neither sur `targetId`/`targetType` — `apps/api/src/lib/audit.ts`
- [x] **#45** Infra — `BETTER_AUTH_SECRET` ajoute a `.env.example` — `apps/web/.env.example`
