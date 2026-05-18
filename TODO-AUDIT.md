# Audit Fonctionnement & Securite — Cooked

Audit du 2026-05-18. Chaque item classe par severite.

---

## CRITIQUE (a faire avant tout deploiement)

### 1. Tables manquantes en DB — `two_factor` et `audit_logs`
- **Fichiers:** `packages/db/schema/audit.ts`, `packages/db/schema/auth.ts`
- **Probleme:** Le schema definit `auditLogs` et `twoFactor` mais la migration `0000_far_revanche.sql` ne les cree PAS. Aussi la colonne `two_factor_enabled` manque dans la table `user` de la migration.
- **Impact:** `logAudit()` crash a chaque appel (insert dans table inexistante). 2FA inutilisable.
- **Fix:** `pnpm db:generate` pour generer migration des tables manquantes, puis `pnpm db:migrate`.

### 2. CSP avec `unsafe-eval` en production
- **Fichier:** `apps/web/next.config.ts:34`
- **Probleme:** `script-src 'self' 'unsafe-inline' 'unsafe-eval'` — `unsafe-eval` annule toute protection XSS du CSP.
- **Fix:** Retirer `'unsafe-eval'`. Next.js n'en a pas besoin. Utiliser nonce pour `unsafe-inline` si possible.

### 3. Seed admin avec credentials par defaut + log du mot de passe
- **Fichier:** `apps/api/src/scripts/seed-admin.ts:9-11,29`
- **Probleme:** Password par defaut `admin123456`, et le script log le mot de passe en clair en console.
- **Fix:** Exiger les env vars (pas de fallback), supprimer le `console.log` du password.

### 4. CSP production reference encore `localhost`
- **Fichier:** `apps/web/next.config.ts:37-38`
- **Probleme:** `img-src` et `connect-src` incluent `http://localhost:*` dans le CSP production. Devrait etre l'URL de prod.
- **Fix:** Utiliser env var pour l'URL API dans le CSP, pas localhost en dur.

---

## HAUTE (a faire avant production)

### 5. Account lockout en memoire seulement
- **Fichier:** `apps/api/src/lib/account-lockout.ts:4`
- **Probleme:** `Map<string, ...>` en memoire. Restart serveur = lockouts perdus. Multi-instance = pas de partage.
- **Fix:** Utiliser Redis (Upstash deja configure pour rate-limit) pour persister les lockouts.

### 6. Pas d'audit log sur creation/update de recette
- **Fichier:** `apps/api/src/routes/admin/recipes.ts:72,175`
- **Probleme:** `logAudit` est appele sur delete (ligne 312) mais pas sur create ni update.
- **Fix:** Ajouter `logAudit({ action: "recipe.create" })` et `logAudit({ action: "recipe.update" })`.

### 7. Delete recette = hard delete, pas de soft delete
- **Fichier:** `apps/api/src/routes/admin/recipes.ts:303-310`
- **Probleme:** Suppression definitive, pas de recovery possible. Audit log cree APRES le delete (si la table existe).
- **Fix:** Ajouter champ `deletedAt` au schema recipes, utiliser soft delete.

### 8. Validation AVIF faible dans upload
- **Fichier:** `apps/api/src/routes/admin/upload.ts:18,25-28`
- **Probleme:** Magic bytes AVIF = `[0x00, 0x00, 0x00]` — trop generique. Le check `ftyp` est mieux mais les 3 premiers bytes matchent beaucoup de formats.
- **Fix:** Verifier `ftyp` + `avif` ou `avis` dans les bytes 8-11 pour validation plus stricte.

### 9. Pas de CSRF token explicite
- **Fichier:** Toutes les routes API
- **Probleme:** Depend entierement de SameSite cookie (Better Auth). Pas de double-submit cookie ou token CSRF.
- **Impact:** Si SameSite est `None` (par erreur ou cross-domain), vulnérable CSRF.
- **Fix:** Verifier que Better Auth force SameSite=Lax. Documenter pourquoi pas de CSRF token.

### 10. Session 7 jours sans re-authentification
- **Fichier:** `apps/api/src/lib/auth.ts:86`
- **Probleme:** `expiresIn: 60 * 60 * 24 * 7` — session valide 7 jours. Long pour operations sensibles.
- **Fix:** Reduire a 3 jours. Ou demander re-auth pour actions admin critiques.

### 11. Proxy admin ne forward que le cookie non-secure
- **Fichier:** `apps/web/proxy.ts:18`
- **Probleme:** Forward `better-auth.session_token` meme si le cookie original est `__Secure-`. Pourrait bypasser la validation secure cookie.
- **Fix:** Forward le bon nom de cookie selon l'env (prod = `__Secure-`).

---

## MOYENNE (a planifier)

### 12. Pas de limit taille body globale
- **Fichier:** `apps/api/src/index.ts`
- **Probleme:** Aucune limite explicite sur taille des requetes. Un payload enorme pourrait saturer la memoire.
- **Fix:** Ajouter middleware qui refuse `Content-Length > 5MB`.

### 13. Video URL sans whitelist de domaines
- **Fichier:** `apps/api/src/lib/validation.ts:15`
- **Probleme:** `z.string().url()` accepte n'importe quelle URL. Embed potentiel de sites malveillants.
- **Fix:** Whitelist YouTube + Vimeo avec `.refine()`.

### 14. Media URL sans whitelist de domaines
- **Fichier:** `apps/api/src/lib/validation.ts:48`
- **Probleme:** URL media accepte tout domaine. `next.config.ts` limite les images cote Next, mais l'API stocke tout.
- **Fix:** Valider que URL vient de R2 ou localhost.

### 15. Email log en dev expose les adresses
- **Fichier:** `apps/api/src/lib/email.ts:24-28,42-43`
- **Probleme:** Log complet `opts.to` en dev. Si les logs sont captures, emails exposes.
- **Fix:** Masquer la partie apres `@` dans les logs dev.

### 16. Metadata audit en `text` au lieu de `jsonb`
- **Fichier:** `packages/db/schema/audit.ts:16`
- **Probleme:** `text("metadata")` stocke du JSON en string. Impossible de requeter efficacement.
- **Fix:** Changer en `jsonb("metadata")` pour PostgreSQL.

### 17. Pas de rate limit specifique favoris/delete
- **Fichier:** `apps/api/src/routes/me.ts:63,90`
- **Probleme:** POST/DELETE favoris proteges par email verification mais pas rate-limited specifiquement. Le rate limit global `/api/me/*` (30/min) est la, mais toggle rapide possible.
- **Fix:** OK car couvert par le global 30/min. Optionnel: reduire a 15/min pour write ops.

### 18. Index manquants sur tables user et recipes
- **Fichier:** `packages/db/schema/auth.ts`, `packages/db/schema/recipes.ts`
- **Probleme:** Pas d'index sur `user.role` (requetes admin lentes) ni `recipes.status` (filtre published).
- **Fix:** Ajouter `index("idx_user_role").on(t.role)` et `index("idx_recipes_status").on(t.status)`.

### 19. Uploads servis depuis meme domaine que l'API
- **Fichier:** `apps/api/src/index.ts:60-66`
- **Probleme:** `/uploads/*` servi par meme serveur Hono. Cookies API envoyes avec requetes upload.
- **Fix:** En prod, servir depuis un sous-domaine ou CDN separe. CSP sur uploads est deja present (bon point).

### 20. Pas de pagination sur GET admin recipes
- **Fichier:** `apps/api/src/routes/admin/recipes.ts:21-28`
- **Probleme:** `limit(200)` en dur, pas de pagination. Avec beaucoup de recettes, reponse lourde.
- **Fix:** Utiliser `adminPaginationSchema` comme les autres routes admin.

---

## BASSE (a faire quand possible)

### 21. Admin middleware null-check implicite
- **Fichier:** `apps/api/src/middleware/admin.ts:6`
- **Probleme:** `user?.role` — optional chaining suggere user pourrait etre null. Devrait etre explicite.
- **Fix:** `if (!user || user.role !== "admin")` pour clarte.

### 22. Double-escaping inutile dans search
- **Fichier:** `apps/api/src/routes/recipes.ts:38`
- **Probleme:** Sanitize manuellement `%_\` pour LIKE mais Drizzle parametrise deja. Pas dangereux, juste redondant.
- **Fix:** Garder ou retirer — pas de risque reel. Drizzle `ilike` est safe.

### 23. Zod error details expose en reponse API
- **Fichier:** `apps/api/src/index.ts:53`, `apps/api/src/routes/admin/recipes.ts:76`
- **Probleme:** `details: err.issues` renvoie structure interne Zod. Pas critique mais info leakage minor.
- **Fix:** Formatter les erreurs en messages lisibles, pas raw Zod issues.

### 24. Transaction cast unsafe
- **Fichier:** `apps/api/src/routes/admin/recipes.ts:15`
- **Probleme:** `tx as unknown as typeof db` — double cast dangereux. Marche mais pourrait casser.
- **Fix:** Utiliser le type transaction de Drizzle directement.

### 25. X-XSS-Protection header inconsistant
- **Fichier:** `apps/api/src/index.ts:30` vs `apps/web/next.config.ts:24`
- **Probleme:** API met `X-XSS-Protection: 0`, Next met `1; mode=block`. Header deprece de toute facon.
- **Fix:** Mettre `0` partout (recommandation OWASP actuelle) ou retirer completement.

---

## Points positifs (deja bien fait)

- CORS configure avec origins explicites + `credentials: true`
- Headers securite presents (X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy)
- Rate limiting avec support Redis (Upstash)
- Validation input Zod sur toutes les routes
- Drizzle ORM empeche injection SQL (queries parametrees)
- HSTS en production
- Better Auth gere hashing passwords (bcrypt)
- Upload : validation extension + magic bytes + UUID filename
- CSP sur `/uploads/*` restrictif (`default-src 'none'; img-src 'self'`)
- `.env` dans `.gitignore` et jamais commit dans git
- Email verification requise pour actions write (favoris, commentaires)
- Ban system avec expiration

---

## Plan d'action suggere

### Semaine 1 — Critiques
- [ ] Generer migration pour tables `two_factor`, `audit_logs`, colonne `two_factor_enabled`
- [ ] Retirer `unsafe-eval` du CSP
- [ ] Securiser seed-admin (no defaults, no password log)
- [ ] Remplacer localhost par env var dans CSP production

### Semaine 2 — Hautes
- [ ] Account lockout via Redis
- [ ] Ajouter audit logs sur create/update recipes
- [ ] Implementer soft delete recipes
- [ ] Renforcer validation AVIF upload
- [ ] Verifier/documenter protection CSRF
- [ ] Reduire session duration
- [ ] Fix proxy cookie forwarding

### Semaine 3 — Moyennes
- [ ] Body size limit middleware
- [ ] Whitelist video URLs (YouTube/Vimeo)
- [ ] Whitelist media URLs (R2/localhost)
- [ ] Masquer emails dans logs dev
- [ ] Metadata audit en jsonb
- [ ] Index user.role + recipes.status
- [ ] Pagination admin recipes
- [ ] Plan CDN pour uploads

### Plus tard — Basses
- [ ] Admin middleware null-check explicite
- [ ] Nettoyer double-escaping search
- [ ] Formatter Zod errors en reponse
- [ ] Fix transaction typing
- [ ] Harmoniser X-XSS-Protection
