# TODO Securite — Cooked

## Phase 3 — Avant production

- [ ] **Email verification** — Activer la verification email dans Better Auth (`emailVerification: { sendOnSignUp: true }`). Requiert Resend configure (RESEND_API_KEY)
- [ ] **Password reset** — Implementer le flux "mot de passe oublie" via Better Auth (`forgetPassword` plugin). Requiert Resend
- [ ] **Rate limit API publique** — Ajouter rate limiting sur `/api/recipes` et `/api/categories` (ex: 100 req/min) pour empecher le scraping
- [ ] **Audit logging** — Logger les actions admin sensibles (ban, role change, suppression recette) dans une table `audit_logs` avec userId, action, targetId, timestamp
- [ ] **CORS multi-domaine prod** — Adapter `CORS_ORIGIN` pour supporter plusieurs origines en production (split par virgule ou tableau)
- [ ] **Upload garbage collection** — Supprimer les fichiers orphelins dans `/uploads` quand une recette ou un media est supprime (hook cascade ou cron job)
- [ ] **Cookie Secure flag** — Verifier que Better Auth set `secure: true` sur les cookies en production (HTTPS only)
- [ ] **Rate limit par user** — Completer le rate limiting actuel (par IP) avec un rate limit par userId pour les routes authentifiees
- [ ] Rediriger l'accès au login et register si dékà connecté
- [ ] Faire le calculateur de macro en fonction du nombre de portion
- [ ] Pouvoir ajouter et modifier les tags des recettes
- [ ] Pouvoir cocher les ingrédients sur les pages des recettes
- [ ] Pouvoir ajouter des recettes aux favoris
- [ ] Mettre à jour la seed en fonction des données acutellment présent sur le site
