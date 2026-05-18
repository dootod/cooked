# Guide de setup — Cooked

Ce guide couvre l'installation complète du projet de zéro jusqu'au lancement en développement local.

---

## Prérequis

| Outil | Version minimale | Vérification |
|---|---|---|
| Node.js | 24 LTS | `node --version` |
| pnpm | 10.x ou 11.x | `pnpm --version` |
| PostgreSQL | 14+ | via pgAdmin ou psql |
| Git | any | `git --version` |

---

## 1. Cloner le repo

```bash
git clone git@github.com:dootod/cooked.git
cd cooked
```

---

## 2. Installer les dépendances

Depuis la racine du monorepo, une seule commande installe tout (api + web + db) :

```bash
pnpm install
```

> pnpm lit `pnpm-workspace.yaml` et installe les dépendances de tous les packages en une fois.

---

## 3. Variables d'environnement

Il y a trois fichiers `.env` à créer — un par package qui en a besoin.

### apps/api/.env

```bash
cp apps/api/.env.example apps/api/.env
```

Éditer `apps/api/.env` :

```env
# Base de données — adapter l'utilisateur et le mot de passe PostgreSQL
DATABASE_URL=postgresql://postgres:TON_MOT_DE_PASSE@localhost:5432/cooked

# Better Auth — générer une clé aléatoire longue (64+ caractères)
BETTER_AUTH_SECRET=remplacer_par_une_cle_aleatoire_longue
BETTER_AUTH_URL=http://localhost:3001

# CORS — URL du frontend
CORS_ORIGIN=http://localhost:3000

# Port de l'API (3001 par défaut)
PORT=3001

# URL publique de l'API — utilisee pour whitelist medias
# En production : mettre l'URL publique (ex: https://api.cooked.app)
API_PUBLIC_URL=http://localhost:3001

# Cloudflare R2 — laisser vide jusqu'à la phase upload
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
R2_PUBLIC_URL=

# Resend — laisser vide en dev (emails skippes avec warning)
RESEND_API_KEY=
EMAIL_FROM=Cooked <noreply@cooked.app>

# Admin — pour le script seed-admin (section 7)
ADMIN_EMAIL=
ADMIN_PASSWORD=
ADMIN_NAME=

# Upstash Redis — laisser vide en dev (fallback in-memory)
# En production : creer un compte sur upstash.com et remplir ces valeurs
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

> Pour générer `BETTER_AUTH_SECRET` rapidement dans PowerShell :
> ```powershell
> -join ((65..90)+(97..122)+(48..57) | Get-Random -Count 64 | % { [char]$_ })
> ```

### apps/web/.env

```bash
cp apps/web/.env.example apps/web/.env
```

Contenu (ne pas modifier en dev local) :

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### packages/db/.env

```bash
cp packages/db/.env.example packages/db/.env
```

Contenu — même `DATABASE_URL` que l'API :

```env
DATABASE_URL=postgresql://postgres:TON_MOT_DE_PASSE@localhost:5432/cooked
```

---

## 4. Créer la base de données PostgreSQL

### Via pgAdmin 4

1. Ouvrir pgAdmin 4
2. Se connecter au serveur local (mot de passe = celui défini à l'installation)
3. Dans l'arbre à gauche : clic droit sur **Databases** → **Create** → **Database**
4. Champ **Database** : taper `cooked`
5. Cliquer **Save**

### Via psql

```sql
CREATE DATABASE cooked;
```

> L'utilisateur PostgreSQL par défaut est `postgres`. Le mot de passe est celui choisi lors de l'installation.

---

## 5. Appliquer le schéma Drizzle

Cette commande lit `packages/db/schema/` et crée toutes les tables dans PostgreSQL :

```bash
cd packages/db
pnpm db:push
```

Sortie attendue :

```
[✓] Pulling schema from database...
[✓] Changes applied
```

Vérifier dans pgAdmin → `cooked` → **Schemas** → **public** → **Tables** — 20 tables doivent apparaitre : `recipes`, `categories`, `tags`, `equipment`, `ingredients`, `steps`, `macros`, `medias`, `recipes_categories`, `recipes_tags`, `recipes_equipment`, `comments`, `ratings`, `favorites`, `user`, `session`, `account`, `verification`, `two_factor`, `audit_logs`.

---

## 6. Lancer les serveurs de développement

Depuis la **racine du monorepo** :

```bash
pnpm dev
```

Turborepo lance l'API et le web en parallèle.

| Service | URL | Description |
|---|---|---|
| Web (Next.js) | http://localhost:3000 | Site public + /admin |
| API (Hono) | http://localhost:3001 | REST API |
| Health check | http://localhost:3001/health | Vérifie que l'API répond |

> Si une des ports est déjà utilisée, tuer le processus concerné :
> ```powershell
> # Trouver le PID utilisant le port (ex: 3001)
> netstat -ano | findstr :3001
> # Puis tuer le processus
> taskkill /PID <PID> /F
> ```

---

## 7. Créer le compte administrateur

À faire **une seule fois** après le premier `db:push`.

Ajouter les variables d'environnement dans `apps/api/.env` :

```env
ADMIN_EMAIL=ton-email@example.com
ADMIN_PASSWORD=un_mot_de_passe_fort_12_chars_min
ADMIN_NAME=Prenom
```

Puis depuis `apps/api/` :

```powershell
node --env-file=.env --import tsx/esm src/scripts/seed-admin.ts
```

> Le mot de passe doit faire au minimum 12 caracteres. Les 3 variables d'environnement sont obligatoires.

Accès au backoffice : **http://localhost:3000/compte/connexion** → connecte-toi → redirige vers `/admin`.

---

## 8. Seeder les recettes de test

Optionnel mais recommande pour avoir du contenu visible immediatement.

Depuis `apps/api/` :

```powershell
node --env-file=.env --import tsx/esm src/scripts/seed-recipes.ts
```

Cree 8 recettes avec categories, tags, ingredients, etapes, macros et images (URLs Unsplash).

---

## 9. Scripts disponibles

Tous ces scripts s'exécutent depuis la **racine** sauf indication contraire.

| Commande | Description |
|---|---|
| `pnpm dev` | Lance api + web en parallèle (Turborepo) |
| `pnpm build` | Build de production de tous les packages |
| `pnpm typecheck` | Vérification TypeScript sur tous les packages |
| `pnpm lint` | Lint sur tous les packages |
| `pnpm format` | Formatage Prettier |

Scripts DB (depuis `packages/db/`) :

| Commande | Description |
|---|---|
| `pnpm db:push` | Applique le schéma directement (dev uniquement) |
| `pnpm db:generate` | Génère un fichier de migration SQL |
| `pnpm db:migrate` | Applique les migrations en attente |
| `pnpm db:studio` | Ouvre Drizzle Studio (interface visuelle DB) |

---

## 10. Structure des fichiers importants

```
cooked/
├── apps/
│   ├── api/
│   │   ├── src/
│   │   │   ├── index.ts              Point d'entrée Hono
│   │   │   ├── lib/
│   │   │   │   ├── auth.ts           Instance Better Auth (email/password + TOTP 2FA)
│   │   │   │   ├── account-lockout.ts Verrouillage compte apres echecs login
│   │   │   │   ├── audit.ts          Audit logging actions admin
│   │   │   │   ├── email.ts          Envoi emails via Resend
│   │   │   │   ├── email-templates.ts Templates HTML emails
│   │   │   │   ├── validation.ts     Schemas Zod
│   │   │   │   └── utils.ts          generateSlug()
│   │   │   ├── routes/               Routes API publiques
│   │   │   │   └── admin/            Routes protégées admin
│   │   │   ├── middleware/           auth.ts + admin.ts + rate-limit.ts + email-verified.ts
│   │   │   └── scripts/
│   │   │       └── seed-admin.ts     Création compte admin
│   │   └── .env                      Variables d'environnement API
│   └── web/
│       ├── app/
│       │   ├── admin/                Backoffice (layout + pages)
│       │   └── compte/connexion/     Page login
│       ├── components/admin/
│       │   └── RecipeForm.tsx        Formulaire recette (create + edit)
│       ├── lib/
│       │   ├── api.ts                Wrapper fetch → API Hono
│       │   └── auth.ts               Client Better Auth (admin + twoFactor plugins)
│       ├── proxy.ts                  Protection routes /admin (Next.js 16)
│       └── .env                      Variables d'environnement Web
└── packages/
    └── db/
        ├── schema/
        │   ├── recipes.ts            Tables recettes, catégories, tags...
        │   ├── users.ts              Tables favoris, notes, commentaires
        │   ├── auth.ts               Tables Better Auth (user, session, two_factor...)
        │   └── audit.ts              Table audit_logs
        ├── index.ts                  Export db + schéma
        ├── drizzle.config.ts         Config Drizzle Kit
        └── .env                      DATABASE_URL pour les migrations
```

---

## 11. Depannage frequent

### Port déjà utilisé au démarrage

Next.js ou l'API se lance sur un port différent de 3000/3001.

```powershell
# Identifier et tuer le processus
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Erreur de connexion PostgreSQL

Vérifier que `DATABASE_URL` dans `apps/api/.env` et `packages/db/.env` correspond bien à l'utilisateur et mot de passe PostgreSQL local.

### `db:push` échoue

Vérifier que la base `cooked` existe dans pgAdmin et que PostgreSQL est démarré.

### Erreur d'import `@cooked/db`

Ne pas importer depuis `@cooked/db/schema` — importer directement depuis `@cooked/db` :

```ts
// correct
import { db, recipes, user } from "@cooked/db";

// a eviter
import { recipes } from "@cooked/db/schema";
```
