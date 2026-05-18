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

## HAUTE (resolues le 2026-05-18)

### 5. ~~Account lockout en memoire seulement~~ RESOLU
- **Fix applique:** Dual-store Redis (Upstash) + in-memory fallback, meme pattern que rate-limit.ts. Auto-detection via env vars.

### 6. ~~Pas d'audit log sur creation/update de recette~~ RESOLU
- **Fix applique:** `logAudit({ action: "recipe.create" })` et `logAudit({ action: "recipe.update" })` ajoutes dans admin/recipes.ts.

### 7. ~~Delete recette = hard delete~~ RESOLU
- **Fix applique:** Colonne `deletedAt` ajoutee au schema recipes. DELETE = soft delete (`set deletedAt`). Toutes les queries (public, admin, favoris) filtrent `isNull(deletedAt)`.

### 8. ~~Validation AVIF faible dans upload~~ RESOLU
- **Fix applique:** Verification `ftyp` (bytes 4-8) + major brand `avif`/`avis`/`mif1` (bytes 8-12). Magic bytes generiques retires.

### 9. ~~Pas de CSRF token explicite~~ VERIFIE
- **Resultat:** Better Auth force SameSite=Lax par defaut + useSecureCookies en prod. CORS avec origins explicites + `credentials: true`. Protection CSRF suffisante sans token explicite.

### 10. ~~Session 7 jours~~ RESOLU
- **Fix applique:** `expiresIn` reduit de 7 jours a 3 jours dans auth.ts.

### 11. ~~Proxy cookie forwarding~~ RESOLU
- **Fix applique:** Forward le bon nom de cookie (`__Secure-` prefix quand present) dans proxy.ts.

---

## MOYENNE (resolues le 2026-05-18)

### 12. ~~Pas de limit taille body globale~~ RESOLU
- **Fix applique:** Middleware Content-Length dans index.ts. Limite 1MB general, 6MB pour /api/admin/upload. Retourne 413 si depasse.

### 13. ~~Video URL sans whitelist de domaines~~ RESOLU
- **Fix applique:** `.refine()` sur videoUrl dans validation.ts. Whitelist: YouTube (youtube.com, youtu.be) + Vimeo (vimeo.com, player.vimeo.com). HTTPS obligatoire.

### 14. ~~Media URL sans whitelist de domaines~~ RESOLU
- **Fix applique:** `isAllowedMediaUrl()` dans validation.ts. Whitelist dynamique: localhost (dev), API_PUBLIC_URL hostname (prod), R2_PUBLIC_URL hostname (futur).

### 15. ~~Email log en dev expose les adresses~~ RESOLU
- **Fix applique:** Fonction `maskEmail()` dans email.ts. Affiche max 3 premiers chars + `***@domain` dans tous les logs (dev et prod).

### 16. ~~Metadata audit en `text` au lieu de `jsonb`~~ RESOLU
- **Fix applique:** Colonne metadata changee de `text` a `jsonb` dans audit.ts schema. Migration 0003. logAudit passe l'objet directement sans JSON.stringify.

### 17. ~~Pas de rate limit specifique favoris/delete~~ VERIFIE
- **Resultat:** Couvert par le rate limit global `/api/me/*` (30/min). Protection suffisante.

### 18. ~~Index manquants sur tables user et recipes~~ RESOLU
- **Fix applique:** `idx_user_role` sur user.role, `idx_recipes_status` sur recipes.status. Migration 0003.

### 19. ~~Uploads servis depuis meme domaine que l'API~~ DIFFERE
- **Raison:** Sera resolu par la migration vers Cloudflare R2 (Phase 1 restante). CSP restrictif deja en place sur /uploads/*.

### 20. ~~Pas de pagination sur GET admin recipes~~ RESOLU
- **Fix applique:** GET /api/admin/recipes utilise `adminPaginationSchema` (page + limit max 200). Retourne `{ recipes, pagination: { page, limit, total, totalPages } }`.

---

## BASSE (resolues le 2026-05-18)

### 21. ~~Admin middleware null-check implicite~~ RESOLU
- **Fix applique:** `if (!user || user.role !== "admin")` — null-check explicite avant comparaison role.

### 22. ~~Double-escaping inutile dans search~~ VERIFIE
- **Resultat:** L'escaping LIKE (`%_\`) est en fait necessaire. Drizzle parametrise contre injection SQL, mais `%` et `_` restent des wildcards LIKE dans la valeur parametree. L'escaping manuel est correct.

### 23. ~~Zod error details expose en reponse API~~ RESOLU
- **Fix applique:** `formatZodErrors()` dans index.ts. Erreurs formatees en `"path: message"` lisibles au lieu de raw Zod issues. Meme formatage dans admin/recipes.ts.

### 24. ~~Transaction cast unsafe~~ RESOLU
- **Fix applique:** Type `DbTransaction` derive de `Parameters<Parameters<typeof db.transaction>[0]>[0]>`. Plus de double cast `as unknown as typeof db`.

### 25. ~~X-XSS-Protection header inconsistant~~ RESOLU
- **Fix applique:** `X-XSS-Protection: 0` partout (API + Next.js). Conforme recommandation OWASP — header deprece, `0` desactive le filtre XSS bugge des anciens navigateurs.

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

### Semaine 1 — Critiques (FAIT)
- [x] Generer migration pour tables `two_factor`, `audit_logs`, colonne `two_factor_enabled`
- [x] Retirer `unsafe-eval` du CSP
- [x] Securiser seed-admin (no defaults, no password log)
- [x] Remplacer localhost par env var dans CSP production

### Semaine 2 — Hautes (FAIT)
- [x] Account lockout via Redis (dual-store Upstash + in-memory)
- [x] Ajouter audit logs sur create/update recipes
- [x] Implementer soft delete recipes (colonne `deletedAt` + filtre toutes queries)
- [x] Renforcer validation AVIF upload (ftyp + major brand)
- [x] Verifier/documenter protection CSRF (SameSite=Lax confirme)
- [x] Reduire session duration (7j → 3j)
- [x] Fix proxy cookie forwarding (__Secure- prefix)

### Semaine 3 — Moyennes (FAIT)
- [x] Body size limit middleware (1MB general, 6MB upload)
- [x] Whitelist video URLs (YouTube/Vimeo)
- [x] Whitelist media URLs (localhost/API_PUBLIC_URL/R2_PUBLIC_URL)
- [x] Masquer emails dans logs (maskEmail)
- [x] Metadata audit en jsonb (migration 0003)
- [x] Index user.role + recipes.status (migration 0003)
- [x] Pagination admin recipes (adminPaginationSchema)
- [x] Plan CDN pour uploads (differe → migration R2)

### Plus tard — Basses (FAIT)
- [x] Admin middleware null-check explicite
- [x] Verifier double-escaping search (correct — necessaire pour LIKE wildcards)
- [x] Formatter Zod errors en reponse
- [x] Fix transaction typing (DbTransaction derive du type db.transaction)
- [x] Harmoniser X-XSS-Protection (0 partout, OWASP)
