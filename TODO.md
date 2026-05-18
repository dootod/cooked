# TODO Securite — Cooked

## Phase 3 — Avant production

- [x] **Email verification** — Activer la verification email dans Better Auth (`emailVerification: { sendOnSignUp: true }`). Requiert Resend configure (RESEND_API_KEY)
- [x] **Password reset** — Implementer le flux "mot de passe oublie" via Better Auth (`sendResetPassword`). Requiert Resend
- [x] **Rate limit API publique** — Ajouter rate limiting sur `/api/recipes` et `/api/categories` (ex: 100 req/min) pour empecher le scraping
- [x] **Audit logging** — Logger les actions admin sensibles (ban, role change, suppression recette) dans une table `audit_logs` avec userId, action, targetId, timestamp
- [x] **CORS multi-domaine prod** — Adapter `CORS_ORIGIN` pour supporter plusieurs origines en production (split par virgule ou tableau)
- [x] **Upload garbage collection** — Supprimer les fichiers orphelins dans `/uploads` quand une recette ou un media est supprime (endpoint admin POST /api/admin/cleanup/orphan-uploads)
- [x] **Cookie Secure flag** — Verifier que Better Auth set `secure: true` sur les cookies en production (HTTPS only) via `advanced.useSecureCookies`
- [x] **Rate limit par user** — Completer le rate limiting actuel (par IP) avec un rate limit par userId pour les routes authentifiees
- [x] Rediriger l'acces au login et register si deja connecte
- [x] Faire le calculateur de macro en fonction du nombre de portion
- [x] Pouvoir ajouter et modifier les tags des recettes
- [x] Pouvoir cocher les ingredients sur les pages des recettes
- [x] Pouvoir ajouter des recettes aux favoris
- [x] Mettre a jour la seed en fonction des donnees actuellement presentes sur le site
- [x] **XSS email templates** — Echapper les variables utilisateur (name, url) dans les templates HTML
- [x] **Validation name inscription** — Limiter le champ name a 100 caracteres max cote serveur
- [x] **banExpires check** — Verifier l'expiration du ban dans le middleware auth (debloquer automatiquement)
- [x] **Proxy cookie prod** — Supporter le prefix `__Secure-` sur le cookie session dans le proxy admin
- [x] **Password reset validation** — Appliquer les memes regles de complexite que l'inscription sur le reset password
- [x] **Email leak URL** — Ne plus passer l'email dans l'URL apres inscription
- [x] **Security headers** — Ajouter X-Content-Type-Options, X-Frame-Options, Referrer-Policy sur toutes les reponses API

## Phase 4 — Securite restante (fait)

- [x] **Rate limit persistant** — Store Redis/Upstash avec fallback in-memory. `@upstash/redis` installe, auto-detection via env vars UPSTASH_REDIS_REST_URL + TOKEN
- [x] **Email verification requise** — Middleware `emailVerifiedMiddleware` bloque ajout/retrait favoris si email non verifie (403)
- [x] **Account lockout** — 5 echecs login = lockout 15 min par email. Module `account-lockout.ts`, intercept sur POST /api/auth/sign-in/email
- [x] **CSRF verification** — `trustedOrigins` configure dans Better Auth (split CORS_ORIGIN). Validation automatique par BA
- [x] **callbackURL validation** — Couvert par `trustedOrigins` — BA refuse les callback vers domaines non-trusted
- [x] **HSTS header** — `Strict-Transport-Security: max-age=63072000; includeSubDomains` en production uniquement
- [x] **Pagination admin users** — Schema `adminPaginationSchema` (max 200, default 50), pagination avec total/totalPages
- [x] **Logs sensibles** — Adresses email masquees en production, visibles uniquement en dev
- [x] **MFA admin** — Better Auth TOTP plugin active. Page `/compte/securite` pour activer/desactiver 2FA. QR code + backup codes. Verification TOTP sur page connexion
