# Audit de securite — Cooked

**Date** : 2026-05-19
**Scope** : Monorepo complet (`apps/api`, `apps/web`, `packages/db`)
**Statut** : Audit seulement, aucune modification effectuee

---

## Resume

| Severite | Nombre |
| -------- | ------ |
| Critique | 3      |
| Haute    | 8      |
| Moyenne  | 10     |
| Basse    | 7      |

---

## CRITIQUE

### C1 — Bypass admin proxy sur timeout/erreur reseau

**Fichier** : `apps/web/proxy.ts:38-40`

```ts
} catch {
  // Network error or timeout — let through, client-side layout handles auth
  return NextResponse.next();
}
```

**Probleme** : Si l'API est lente (>3s), down, ou si un attaquant provoque un timeout reseau, le proxy laisse passer la requete vers les pages admin sans verification. Un utilisateur non-authentifie ou non-admin peut acceder a l'interface d'administration.

**Correction** : Bloquer l'acces en cas d'erreur au lieu de laisser passer.

```ts
} catch {
  return NextResponse.redirect(new URL("/compte/connexion", request.url));
}
```

---

### C2 — Fichier .env avec secrets commite dans le repo local

**Fichier** : `apps/api/.env`

**Probleme** : `BETTER_AUTH_SECRET` et `RESEND_API_KEY` sont presents dans le fichier `.env`. Bien que `.gitignore` exclut `.env`, si ce fichier a ete commite par erreur dans l'historique git, les secrets sont exposes. De plus, le fichier existe localement et pourrait etre expose par `serveStatic`.

**Verifications** :

1. Verifier que `.env` n'a jamais ete commite : `git log --all --diff-filter=A -- "**/.env"`
2. Si commite, faire une rotation immediate de `BETTER_AUTH_SECRET` et `RESEND_API_KEY`
3. Ajouter `.env*` (avec wildcard) au `.gitignore` pour plus de securite

---

### C3 — serveStatic expose potentiellement des fichiers sensibles

**Fichier** : `apps/api/src/index.ts:105`

```ts
app.use("/uploads/*", serveStatic({ root: "./" }));
```

**Probleme** : `root: "./"` sert les fichiers depuis la racine du projet. Si un fichier est place dans `./uploads/`, c'est correct. Mais le path resolution de `serveStatic` avec root `"./"` pourrait potentiellement permettre un path traversal selon l'implementation. De plus, le dossier `uploads/` est au meme niveau que `.env`, le code source, etc.

**Correction** :

1. Utiliser un chemin absolu et restreindre explicitement au dossier uploads
2. Deplacer le dossier `uploads/` en dehors du repertoire du projet, ou s'assurer que seul `/uploads/*` est accessible

---

## HAUTE

### H1 — CSP autorise `'unsafe-inline'` pour les scripts

**Fichier** : `apps/web/next.config.ts:41`

```ts
"script-src 'self' 'unsafe-inline'",
```

**Probleme** : `'unsafe-inline'` annule la protection CSP contre les XSS. Un attaquant qui reussit a injecter du HTML peut executer du JavaScript inline.

**Correction** : Utiliser des nonces CSP (Next.js les supporte nativement) ou `'strict-dynamic'`. Si `'unsafe-inline'` est necessaire pour le fonctionnement de Next.js, utiliser au minimum un nonce.

---

### H2 — Validation d'erreurs Zod expose la structure du schema

**Fichier** : `apps/api/src/index.ts:88-91`

```ts
if (err instanceof z.ZodError) {
  return c.json(
    { error: "Validation error", details: formatZodErrors(err.issues) },
    400,
  );
}
```

**Probleme** : Les erreurs Zod non capturees (celles qui remontent au handler global `onError`) leakent les paths et messages de validation. Cela revele la structure interne des schemas a un attaquant.

**Correction** : En production, renvoyer un message generique sans `details`. Les routes qui font `safeParse` gerent deja leurs erreurs correctement ; le probleme est dans le handler global.

---

### H3 — Pas de rate limiting specifique sur sign-up

**Fichier** : `apps/api/src/index.ts:107-113`

**Probleme** : L'inscription (`POST /api/auth/sign-up`) partage le rate limit generique de 10 req/min pour les ecritures auth. Mais il n'y a pas de protection specifique contre l'enumeration d'emails ou la creation massive de comptes. Le lockout ne s'applique qu'au sign-in.

**Correction** :

1. Ajouter un rate limit plus strict sur `/api/auth/sign-up` (ex: 3 req/min par IP)
2. Considerer un CAPTCHA pour l'inscription

---

### H4 — Suppression hard delete des utilisateurs

**Fichier** : `apps/api/src/routes/admin/users.ts:69-72`

```ts
const [deleted] = await db
  .delete(user)
  .where(eq(user.id, id))
  .returning({ id: user.id });
```

**Probleme** : La suppression d'un utilisateur est un hard delete. Grace au `ON DELETE CASCADE`, cela supprime aussi les sessions, comptes, 2FA, favoris, notes, commentaires. C'est irreversible et potentiellement dangereux. Un admin compromis peut effacer toute trace d'un utilisateur.

**Correction** : Implementer un soft delete (champ `deletedAt`) comme pour les recettes, avec une periode de retention avant purge definitive.

---

### H5 — Pas de verification d'existence des categoryIds/tagIds

**Fichier** : `apps/api/src/routes/admin/recipes.ts:192-208`

**Probleme** : Lors de la creation/mise a jour d'une recette, les `categoryIds` et `tagIds` fournis sont inseres directement dans les tables de jointure sans verifier qu'ils existent dans les tables `categories` et `tags`. Avec les foreign keys, ca provoque une erreur 500 PostgreSQL au lieu d'une erreur 400 propre.

**Correction** : Verifier l'existence des IDs avant insertion ou capturer l'erreur FK et renvoyer un 400.

---

### H6 — Codes de backup 2FA stockes en clair

**Fichier** : `packages/db/schema/auth.ts:80`

```ts
backupCodes: text("backup_codes").notNull(),
```

**Probleme** : Les codes de backup 2FA sont stockes en texte brut dans la base. Si la DB est compromise, l'attaquant peut utiliser ces codes pour bypasser le 2FA.

**Correction** : Stocker les codes hashes (bcrypt ou argon2), comme pour les mots de passe. Verifier si Better Auth supporte le hachage des backup codes, sinon l'implementer via un hook.

---

### H7 — Content-Length bypass avec chunked encoding

**Fichier** : `apps/api/src/index.ts:71-82`

```ts
const cl = c.req.header("content-length");
if (cl) {
  // ... check size
}
```

**Probleme** : La verification de taille repose uniquement sur le header `Content-Length`. Les requetes avec `Transfer-Encoding: chunked` n'ont pas ce header et bypasent la limite. Un attaquant peut envoyer un body de taille arbitraire.

**Correction** : Limiter aussi la taille du body lu reellement (stream-based), ou utiliser un middleware de body-parser avec limite integree.

---

### H8 — CORS credentials:true avec origins dynamiques

**Fichier** : `apps/api/src/index.ts:52-58`

```ts
cors({
  origin: allowedOrigins,
  credentials: true,
});
```

**Probleme** : `credentials: true` avec une liste d'origins dynamique est dangereux si `CORS_ORIGIN` est mal configure. Si un attaquant controle une origin dans la liste (ex: typo dans l'env var, sous-domaine compromis), il peut voler les cookies de session.

**Correction** :

1. Valider strictement les origins au demarrage (format URL valide, pas de wildcard)
2. Logger un warning si CORS_ORIGIN contient des valeurs inattendues
3. En production, n'autoriser que les domaines exacts connus

---

## MOYENNE

### M1 — Pas de validation SSL pour la connexion DB

**Fichier** : `packages/db/index.ts:9`

```ts
const client = postgres(process.env.DATABASE_URL);
```

**Probleme** : Aucune configuration SSL explicite. En production, la connexion a la DB pourrait etre non-chiffree, exposant les donnees en transit.

**Correction** : Forcer SSL en production :

```ts
const client = postgres(process.env.DATABASE_URL, {
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: true }
      : false,
});
```

---

### M2 — Session token sans index dedie

**Fichier** : `packages/db/schema/auth.ts:33`

```ts
token: text("token").notNull().unique(),
```

**Probleme** : `unique()` cree un index, mais il n'est pas explicitement nomme. La recherche de session par token est critique en performance — chaque requete authentifiee fait un lookup par token. Pas un probleme de securite direct mais impacte la resilience sous charge (slowloris, DDoS).

**Note** : Drizzle cree automatiquement un unique index. Verifier qu'il est bien present dans les migrations.

---

### M3 — Logger middleware en production

**Fichier** : `apps/api/src/index.ts:34`

```ts
app.use("*", logger());
```

**Probleme** : Le logger Hono log toutes les requetes incluant potentiellement des headers sensibles (Authorization, Cookie). En production, ca peut exposer des tokens dans les logs.

**Correction** : Desactiver le logger en production ou le configurer pour exclure les headers sensibles.

---

### M4 — Cookie prefix revele le framework

**Fichier** : `apps/api/src/lib/auth.ts:90`

```ts
cookiePrefix: "better-auth",
```

**Probleme** : Le prefix `better-auth` dans les cookies revele le framework d'authentification utilise, facilitant le fingerprinting par un attaquant.

**Correction** : Utiliser un prefix neutre comme `__Host-ck` ou `cooked`.

---

### M5 — erreur console.error en production log le stack complet

**Fichier** : `apps/api/src/index.ts:94`

```ts
console.error("[API Error]", err);
```

**Probleme** : En production, le stack trace complet est log. Si les logs sont accessibles (dashboard, sidecar), ca expose des chemins de fichiers internes, versions de dependances, etc.

**Correction** : En production, ne logger que le message et un identifiant de correlation. Logger le stack complet seulement en dev.

---

### M6 — isAllowedMediaUrl ne verifie pas le scheme

**Fichier** : `apps/api/src/lib/validation.ts:8-24`

```ts
function isAllowedMediaUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (parsed.hostname === "localhost") return true;
    // ...
```

**Probleme** : La fonction verifie le hostname mais pas le protocole. Un attaquant pourrait fournir `ftp://localhost/malicious` ou `javascript:alert(1)//localhost`. De plus, `localhost` est toujours autorise, meme en production.

**Correction** :

1. Verifier que le scheme est `http` ou `https`
2. Bloquer `localhost` en production
3. Valider le path commence par `/uploads/`

---

### M7 — open redirect via callback URL

**Fichiers** :

- `apps/web/app/compte/inscription/page.tsx:56`
- `apps/web/app/compte/mot-de-passe-oublie/page.tsx:21`
- `apps/web/app/compte/profil/page.tsx:43`

**Probleme** : `window.location.origin` est utilise pour construire des callback URLs. Si l'attaquant manipule l'origin (ex: via un proxy ou un sous-domaine), il peut rediriger l'utilisateur apres authentification vers un site malveillant.

**Correction** : Utiliser des chemins relatifs pour les callbacks au lieu d'URLs absolues, ou valider l'origin cote serveur.

---

### M8 — Pas de rate limiting sur les commentaires publics

**Fichier** : `apps/api/src/routes/comments.ts:51`

**Probleme** : `POST /:slug/comments` est protege par `authMiddleware` + `emailVerifiedMiddleware` mais utilise le rate limit generique de 100 req/min des routes publiques. Un utilisateur authentifie peut spammer les commentaires.

**Correction** : Ajouter un `userRateLimit` specifique (ex: 5 commentaires/min par utilisateur).

---

### M9 — ban expire mais utilisateur toujours marque comme banni

**Fichier** : `apps/api/src/middleware/auth.ts:11-16`

```ts
if (user.banned) {
  const banExpired = user.banExpires && new Date(user.banExpires) < new Date();
  if (!banExpired) {
    return c.json({ error: "Compte suspendu" }, 403);
  }
}
```

**Probleme** : Si `banExpires` est `null` et `banned` est `true`, le ban est permanent (correct). Mais quand le ban expire, l'utilisateur reste marque `banned: true` dans la DB. Il n'est pas debloque automatiquement — ca depend du cache de session.

**Correction** : Apres verification que le ban a expire, mettre a jour `banned = false` en DB (ou via un cron job de nettoyage).

---

### M10 — CSP absente en developpement

**Fichier** : `apps/web/next.config.ts:34-53`

**Probleme** : Les headers CSP ne sont appliques qu'en production. Le dev est completement ouvert. Cela peut masquer des problemes CSP jusqu'au deploiement.

**Correction** : Appliquer une CSP en dev aussi, en mode `report-only` pour detecter les violations sans bloquer.

---

## BASSE

### B1 — X-XSS-Protection a "0"

**Fichiers** : `apps/api/src/index.ts:39`, `apps/web/next.config.ts:31`

**Contexte** : `X-XSS-Protection: 0` est la recommandation actuelle (OWASP) car le filtre XSS des navigateurs est retire/deprecated et pouvait creer des vulnerabilites. **C'est correct.**

**Action** : Aucune. Garder "0".

---

### B2 — Lockout key utilise l'email brut

**Fichier** : `apps/api/src/lib/account-lockout.ts:69-70`

**Probleme** : La cle Redis utilise l'email brut. `isLockedOut` et `recordFailedLogin` appellent `.toLowerCase()`, ce qui est correct. Mais un attaquant pourrait potentiellement tester des variations unicode d'email.

**Correction** : Normaliser l'email (trim + lowercase + NFC unicode normalization) de maniere consistante.

---

### B3 — Memory store rate limit non partage entre instances

**Fichier** : `apps/api/src/middleware/rate-limit.ts:8-35`

**Probleme** : Le `MemoryStore` est local au processus. En multi-instance (scaling horizontal), le rate limit n'est pas partage. Un attaquant peut multiplier les limites par le nombre d'instances.

**Correction** : En production, utiliser Redis (Upstash est deja supporte, juste configurer les env vars).

---

### B4 — TRUST_PROXY sans validation de reseau interne

**Fichier** : `apps/api/src/middleware/rate-limit.ts:93-96`

```ts
if (process.env.TRUST_PROXY === "true") {
  const forwarded = c.req.header("x-forwarded-for")?.split(",")[0]?.trim();
```

**Probleme** : Quand `TRUST_PROXY` est active, le premier element de `X-Forwarded-For` est utilise. Un attaquant peut spoofer ce header s'il n'y a pas de reverse proxy en amont, contournant le rate limiting.

**Correction** : Ne faire confiance qu'aux headers provenant de proxys connus (verifier l'IP du dernier hop, ou configurer le nombre de proxys a traverser).

---

### B5 — JSON.stringify(error) dans les logs email

**Fichier** : `apps/api/src/lib/email.ts:44`

```ts
console.error("[Email] Resend error:", JSON.stringify(error));
```

**Probleme** : `JSON.stringify` sur un objet Error Resend pourrait inclure des champs internes inattendus. Mineur car c'est dans les logs, pas dans la reponse.

**Correction** : Logger seulement `error.message` et `error.name`.

---

### B6 — Pas d'index sur verification.value

**Fichier** : `packages/db/schema/auth.ts:93`

**Probleme** : Le champ `value` dans la table `verification` (utilise pour les tokens de reset password et verification email) n'a pas d'index. La recherche de tokens sera lente si la table grandit.

**Correction** : Ajouter un index sur `value` ou s'assurer que Better Auth recherche par `identifier` (qui est indexe) en premier.

---

### B7 — User PATCH retourne l'objet complet

**Fichier** : `apps/api/src/routes/admin/users.ts:151`

```ts
return c.json({ user: updated });
```

**Probleme** : `returning()` sans select retourne toutes les colonnes. L'objet user retourne pourrait contenir des champs sensibles futurs.

**Correction** : Specifier les colonnes a retourner dans `returning()`.

---

## Recommandations generales

### Priorite 1 (faire immediatement)

1. **C1** — Corriger le proxy admin (1 ligne)
2. **C2** — Verifier l'historique git pour les secrets ; rotation si necessaire
3. **H1** — Migrer vers des nonces CSP

### Priorite 2 (cette semaine)

4. **H3** — Rate limit sign-up
5. **H5** — Validation categoryIds/tagIds
6. **H7** — Body size limit stream-based
7. **M6** — Corriger isAllowedMediaUrl

### Priorite 3 (ce sprint)

8. **H4** — Soft delete utilisateurs
9. **H6** — Hasher les backup codes 2FA
10. **M1** — SSL pour la DB
11. **M3** — Logger conditionnel
12. **M8** — Rate limit commentaires

### Priorite 4 (backlog)

13. Reste des issues moyennes et basses
14. Ajouter des tests de securite automatises
15. Configurer un WAF en production
