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
