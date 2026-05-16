# 🍳 Cooked — Product Requirements Document

> **Version** : 2.3 · **Statut** : Draft · **Dernière mise à jour** : 16 Mai 2026  
> **Auteur** : Thomas · **Contexte** : Projet perso — évolutif vers production

---

## Sommaire

1. [Vision & Objectifs](#1-vision--objectifs)
2. [Personas & Utilisateurs](#2-personas--utilisateurs)
3. [Fonctionnalités détaillées](#3-fonctionnalités-détaillées)
4. [Architecture Technique](#4-architecture-technique)
5. [Structure du dépôt](#5-structure-du-dépôt)
6. [Modèle de Données](#6-modèle-de-données)
7. [API REST — Routes principales](#7-api-rest--routes-principales)
8. [Direction Artistique](#8-direction-artistique)
9. [Pages Publiques — Sitemap](#9-pages-publiques--sitemap)
10. [Déploiement & Hébergement](#10-déploiement--hébergement)
11. [Roadmap](#11-roadmap)
12. [Points ouverts](#12-points-ouverts)

---

## 1. Vision & Objectifs

**Cooked** est une plateforme web de gestion et de consultation de recettes culinaires. L'objectif est de proposer un outil élégant, performant et évolutif, avec :

- Un **backoffice** complet pour les administrateurs
- Une **API REST** robuste pour découpler le front du back
- Des **pages publiques** accessibles à tous les visiteurs

| Horizon | Objectif |
|---|---|
| Court terme | Site personnel déployé en production, gestion de recettes, consultation publique |
| Moyen terme | Ouverture aux comptes membres avec fonctionnalités exclusives |
| Long terme | i18n (EN), API publique documentée, potentielle app mobile |

---

## 2. Personas & Utilisateurs

### 2.1 Visiteur anonyme

Toute personne arrivant sur le site sans compte. Il peut consulter l'ensemble des recettes publiées, les filtrer, rechercher et lire les détails. Il ne peut pas interagir avec le contenu.

### 2.2 Membre (utilisateur connecté)

Visiteur ayant créé un compte. Bénéficie de fonctionnalités exclusives en plus de la consultation.

| Fonctionnalités communes (tous) | Fonctionnalités membres uniquement |
|---|---|
| Consulter toutes les recettes publiées | Ajouter des recettes en favoris |
| Rechercher par nom ou ingrédient | Créer des listes de courses depuis une recette |
| Filtrer par catégorie, durée, difficulté, macros | Adapter les portions (calcul automatique) |
| Voir le détail complet d'une recette | Commenter ou noter une recette |
| Voir les macros (kcal, prot, glucides, lipides) | Historique de consultation |
| Voir les notes moyennes des recettes | — |

> Les commentaires postés par les membres sont soumis à validation admin avant publication (modération a priori).  
> Les notes sont visibles publiquement mais uniquement déposables par les membres.

### 2.3 Administrateur

Accès complet à la gestion du contenu et des utilisateurs via le backoffice (`/admin`).

- Créer, modifier, supprimer des recettes
- Gérer les catégories et les tags
- Modérer les commentaires (validation avant publication)
- Gérer les comptes utilisateurs (suspension, suppression)
- Consulter des statistiques basiques (recettes les plus vues, favorisées...)
- Publier / dépublier une recette (système de brouillon)

---

## 3. Fonctionnalités détaillées

### 3.1 Recettes

| Champ | Détail |
|---|---|
| Titre | Obligatoire — texte court, slug auto-généré pour l'URL |
| Image principale | Obligatoire — upload direct vers Cloudflare R2 |
| Galerie | Optionnelle — plusieurs images supplémentaires |
| Vidéo | Optionnelle — lien YouTube ou Vimeo embarqué (player intégré) |
| Ingrédients | Liste avec quantité, unité et note optionnelle. Adaptés dynamiquement selon les portions. |
| Étapes | Liste ordonnée avec texte et image optionnelle par étape |
| Macros | Kcal, protéines (g), glucides (g), lipides (g) — saisis manuellement, calculés à la portion |
| Temps | Temps de préparation + temps de cuisson + total calculé automatiquement |
| Difficulté | Facile / Intermédiaire / Difficile |
| Portions | Nombre de base, ajustable côté public avec calcul proportionnel |
| Catégories | Entrée, Plat, Dessert, Snack, Boisson... (gérables depuis le backoffice) |
| Tags | Libres (ex : japonais, fitness, végétarien...) avec auto-complétion |
| Matériel | Liste simple d'équipements — affichée en cards visuelles soignées (icône + nom) |
| Statut | Brouillon (admin uniquement) ou Publié (visible publiquement) |

### 3.2 Recherche & Filtres

La barre de recherche est accessible depuis toutes les pages via le header.

| Mode | Détail |
|---|---|
| Recherche texte | Full-text sur le titre, les ingrédients et les tags. Suggestions live (debounce 300ms). |
| Filtres | Catégorie, tags, temps total, difficulté, plage de calories — combinables, URL partageable |
| Tri | Plus récent, plus populaire (vues), mieux noté, temps croissant |

### 3.3 Compte membre

- Inscription par email + mot de passe via Better Auth (`signUp.email`)
- Connexion via Better Auth (`signIn.email`), session gérée côté serveur
- Page profil : modifier pseudo, avatar, mot de passe
- Favoris : liste de recettes sauvegardées
- Notation : étoiles 1 à 5, une note par utilisateur par recette (note moyenne visible publiquement)
- Commentaires : texte libre, **validés par admin avant publication**
- Liste de courses : générée depuis une recette, éditable, exportable en PDF

### 3.4 Backoffice

- Authentification séparée du site public (route `/admin`)
- Dashboard : KPIs avec ring charts SVG (recettes totales, publiées, brouillons)
- CRUD complet recettes avec formulaire sectionné (informations, détails, macros, ingrédients, étapes)
- Gestion des catégories (CRUD complet)
- Gestion des tags
- Gestion des utilisateurs (suspension, suppression)
- File de modération des commentaires (approuver / rejeter)
- Upload de médias avec prévisualisation

---

## 4. Architecture Technique

### 4.1 Vue d'ensemble

```
cooked/  (monorepo)
│
├── apps/api        → Node.js + Hono 4.x  (API REST)
├── apps/web        → Next.js 16          (site public + /admin)
└── packages/db     → Drizzle ORM 0.45.x  (schéma partagé)
         │
         ▼
┌──────────────────┐     ┌─────────────────┐
│   PostgreSQL 16  │     │  Cloudflare R2  │
│    (données)     │     │    (médias)     │
└──────────────────┘     └─────────────────┘
```

### 4.2 Stack technique

| Couche | Technologie | Version | Justification |
|---|---|---|---|
| **Runtime** | Node.js | 24 LTS | Active LTS, supporté jusqu'en avril 2028 |
| **Monorepo** | Turborepo | 2.x | Build system Rust, caching intelligent, workspace pnpm |
| **Package manager** | pnpm | 11.x | Workspaces monorepo, plus rapide et léger que npm |
| **API** | Node.js + Hono | 4.12.x | Ultra-léger, moderne, full TypeScript, excellent support Claude Code |
| **Frontend public** | Next.js 16 (App Router) | 16.x | SSR + SSG pour SEO optimal, déployable gratuitement sur Vercel |
| **Backoffice** | Next.js 16 — route `/admin` | 16.x | Même stack que le front, pas de dépôt supplémentaire à gérer |
| **ORM / BDD** | Drizzle + PostgreSQL 16 | 0.45.x | Meilleur ORM TypeScript actuel, 100% typé, migrations en TS pur |
| **Auth** | Better Auth | 1.6.x | Lib auth TypeScript moderne, plug-and-play, JWT + sessions + email |
| **Stockage médias** | Cloudflare R2 | — | 10 Go/mois gratuits, compatible S3, zéro frais d'egress |
| **Emails** | Resend | 6.x | SDK TypeScript officiel, gratuit jusqu'à 3 000 mails/mois |
| **Vidéo** | Embed YouTube / Vimeo | — | Gratuit, CDN mondial, zéro infra à gérer |
| **CSS** | Tailwind CSS | 4.x | Utility-first, intégré via `@tailwindcss/postcss`, thème custom via `@theme` |
| **Langage** | TypeScript | 5.x | Une seule langue sur toute la stack — idéal pour le vibe coding |

### 4.3 Monorepo

```
cooked/
├── apps/
│   ├── api/              → Hono API (Node.js)
│   └── web/              → Next.js (public + /admin)
├── packages/
│   └── db/               → Drizzle schema partagé
├── turbo.json            → Turborepo (orchestration des builds)
└── package.json
```

---

## 5. Structure du dépôt

```
cooked/
│
├── apps/
│   │
│   ├── api/                          ← API REST (Hono + Node.js)
│   │   ├── src/
│   │   │   ├── routes/
│   │   │   │   ├── recipes.ts        ← GET /api/recipes, GET /api/recipes/:slug
│   │   │   │   ├── categories.ts
│   │   │   │   ├── tags.ts
│   │   │   │   ├── me.ts             ← profil, favoris, liste de courses
│   │   │   │   └── admin/
│   │   │   │       ├── recipes.ts    ← CRUD admin
│   │   │   │       ├── comments.ts   ← modération
│   │   │   │       └── users.ts
│   │   │   ├── lib/
│   │   │   │   ├── auth.ts           ← config Better Auth (adapter Drizzle, plugin admin)
│   │   │   │   ├── validation.ts     ← schemas Zod (recettes, categories, commentaires, users)
│   │   │   │   └── types.ts          ← types partages (AppEnv, AuthUser)
│   │   │   ├── middleware/
│   │   │   │   ├── auth.ts           ← vérification session Better Auth
│   │   │   │   └── admin.ts          ← vérification rôle admin
│   │   │   └── index.ts              ← point d'entrée Hono (catch-all /api/auth/** → Better Auth, error handler global)
│   │   └── package.json
│   │
│   └── web/                          ← Next.js 16 (public + backoffice)
│       ├── app/
│       │   ├── page.tsx              ← Accueil (Bento Grid)
│       │   ├── recettes/
│       │   ├── categories/[slug]/
│       │   ├── tags/[slug]/
│       │   ├── compte/
│       │   └── admin/
│       ├── components/
│       │   └── admin/
│       │       └── RecipeForm.tsx     ← formulaire recette (création + édition)
│       ├── lib/
│       │   ├── api.ts                ← wrapper fetch → API Hono
│       │   └── auth.ts               ← client Better Auth (signIn, signUp, signOut, useSession)
│       └── proxy.ts                  ← protection routes /admin
│
└── packages/
    └── db/                           ← Drizzle ORM (partagé api + web)
        ├── schema/
        │   ├── recipes.ts
        │   ├── users.ts
        │   ├── auth.ts              ← tables Better Auth (user, session, account, verification)
        │   └── index.ts
        ├── migrations/
        └── index.ts
```

---

## 6. Modèle de Données

### Entités principales

| Entité | Champs clés |
|---|---|
| `recipes` | id, title, slug, description, prepTime, cookTime, difficulty, servings, status, videoUrl, createdAt, updatedAt |
| `categories` | id, name, slug, description, icon, order |
| `tags` | id, name, slug |
| `ingredients` | id, recipeId, name, quantity, unit, note, order |
| `steps` | id, recipeId, content, order, mediaUrl |
| `macros` | id, recipeId, kcal, protein, carbs, fat |
| `medias` | id, recipeId, url, alt, isPrimary |
| `equipment` | id, name, iconSlug → lié à recipes (many-to-many) |
| `user` | id, name, email, emailVerified, image, role, banned, banReason, banExpires, createdAt, updatedAt *(table Better Auth — source unique pour les utilisateurs)* |
| `session` | id, expiresAt, token, userId, ipAddress, userAgent, impersonatedBy *(Better Auth)* |
| `account` | id, accountId, providerId, userId, accessToken, refreshToken, password *(Better Auth)* |
| `verification` | id, identifier, value, expiresAt *(Better Auth)* |
| `favorites` | userId (FK user), recipeId (FK recipes), createdAt — PK composite (userId, recipeId) |
| `ratings` | id, userId (FK user), recipeId (FK recipes), score (1-5), createdAt — unique (userId, recipeId) |
| `comments` | id, userId (FK user), recipeId (FK recipes), content, status (pending/approved/rejected), createdAt |

### Flux de modération des commentaires

```
Membre poste → status: pending
                    ↓
         ┌──────────────────┐
    Admin approuve      Admin rejette
         ↓                  ↓
  status: approved    status: rejected
  (visible public)    (invisible)
```

---

## 7. API REST — Routes principales

### Publiques

| Méthode | Route | Description |
|---|---|---|
| `GET` | `/api/recipes` | Liste paginée avec filtres et tri |
| `GET` | `/api/recipes/:slug` | Détail d'une recette |
| `GET` | `/api/categories` | Liste des catégories |
| `GET` | `/api/tags` | Liste des tags |
| `POST` | `/api/auth/sign-up/email` | Création de compte *(Better Auth)* |
| `POST` | `/api/auth/sign-in/email` | Authentification *(Better Auth)* |
| `GET` | `/api/auth/get-session` | Session courante *(Better Auth)* |
| `POST` | `/api/auth/sign-out` | Déconnexion *(Better Auth)* |

### Membres (JWT requis)

| Méthode | Route | Description |
|---|---|---|
| `GET` | `/api/me` | Profil de l'utilisateur connecté |
| `PATCH` | `/api/me` | Modifier son nom |
| `GET` | `/api/me/favorites` | Liste des recettes favorites |
| `POST` | `/api/me/favorites/:id` | Ajouter aux favoris |
| `DELETE` | `/api/me/favorites/:id` | Retirer des favoris |
| `POST` | `/api/recipes/:id/ratings` | Noter une recette |
| `POST` | `/api/recipes/:id/comments` | Poster un commentaire (→ pending) |

### Admin (rôle admin requis)

| Méthode | Route | Description |
|---|---|---|
| `GET` | `/api/admin/recipes` | Toutes recettes (brouillons inclus) |
| `POST` | `/api/admin/recipes` | Créer une recette |
| `PUT` | `/api/admin/recipes/:id` | Modifier une recette |
| `DELETE` | `/api/admin/recipes/:id` | Supprimer une recette |
| `POST` | `/api/admin/upload` | Upload image (multipart, max 5MB, JPEG/PNG/WebP/AVIF) |
| `GET` | `/api/admin/comments` | File de modération (status=pending) |
| `PATCH` | `/api/admin/comments/:id` | Approuver ou rejeter un commentaire |
| `GET` | `/api/admin/users` | Liste des membres (table Better Auth `user`) |
| `GET` | `/api/admin/users/stats` | Nombre total d'utilisateurs + sessions actives |
| `PATCH` | `/api/admin/users/:id` | Changer rôle / bannir un membre |

---

## 8. Direction Artistique

**Concept : Indigo & Peach**  
Moderne et inattendu pour une app food. Indigo lumineux comme couleur primaire, pêche corail en accent chaud, fond bleu très pâle. Mémorable, doux et convivial sans tomber dans les clichés du genre.

### Palette

| Rôle | Couleur | Hex |
|---|---|---|
| Fond principal | Bleu très pâle | `#F6F8FF` |
| Surface card | Blanc pur | `#FFFFFF` |
| Primaire | Indigo lumineux | `#4F6FE8` |
| Accent chaud | Pêche corail | `#FF8C69` |
| Primaire clair | Indigo pâle | `#EEF2FF` |
| Accent clair | Pêche pâle | `#FFE4DA` |
| Bordures | Indigo très pâle | `#C8D4F8` |
| Texte principal | Quasi-noir | `#1A1A2E` |
| Texte secondaire | Gris bleuté | `#6B7A99` |

### Typographie

| Usage | Police | Caractéristiques |
|---|---|---|
| Titres de recettes | **Playfair Display** | Serif élégant, expressif, 32–48px |
| UI & Corps | **Inter** | Sans-serif, lisible, 14–16px |
| Données (macros, temps) | **JetBrains Mono** | Monospace, précis, 12–14px |

### Layout — Bento Grid

Le catalogue de recettes utilise une **grille bento asymétrique** : blocs de tailles variables, certains plein fond photo avec titre en overlay, d'autres avec fond couleur (indigo ou pêche). Chaque page load génère un arrangement légèrement différent selon les recettes disponibles.

**Anatomie d'un bloc bento :**
- Bloc hero (2×2) : grande photo, titre en overlay blanc, badges catégorie + temps
- Blocs medium (1×2 ou 2×1) : photo ou fond coloré, titre, macro principale
- Blocs small (1×1) : fond indigo pâle ou pêche pâle, titre seul

### Composants clés

| Composant | Description |
|---|---|
| Header | Sticky, fond blanc avec légère bordure bottom, logo à gauche, search + nav + compte à droite |
| Barre de recherche | Centrée, arrondie, fond indigo pâle, suggestions en dropdown |
| Badge difficulté | Pill colorée : indigo (Facile), pêche (Intermédiaire), corail (Difficile) |
| Card macros | 4 blocs monospace alignés horizontalement : kcal / prot / glucides / lipides |
| Card matériel | Grid de pills avec icône + nom, fond indigo pâle |
| Bouton primaire | Fond indigo, texte blanc, border-radius 8px, hover légèrement plus sombre |
| Animations | Scroll-reveal (IntersectionObserver) avec 12 variantes, text-reveal mot par mot, hover-lift (-8px + scale), card-shine (gradient sweep), morph (blob shape), gradient-border animé, btn-pulse, stagger delays |

### Page détail recette

Layout en deux colonnes sur desktop :
- **Colonne gauche (60%)** : image hero pleine largeur, galerie, vidéo embed, étapes
- **Colonne droite (40%)** : sticky — titre, note, macros, ingrédients adaptatifs, matériel, bouton favoris

### Design Backoffice

Le backoffice utilise un design distinct du site public, orienté productivité et lisibilité.

| Élément | Détail |
|---|---|
| **Sidebar** | Fond dark (`#0F1629`), barre gradient animée en haut (indigo → pêche → violet), orbe ambient en blur, indicateur actif = barre gradient verticale à gauche. Responsive : overlay mobile avec backdrop blur, hamburger menu |
| **Fond principal** | Grille de points (dot-grid) sur fond `#F6F8FF`, orbes de couleur flottants en arrière-plan |
| **Cards** | Glassmorphism — `backdrop-blur(20px)`, fond blanc semi-transparent 75%, bordure indigo pâle 30%. Glow effect au hover avec ombre dynamique et translation Y -2px |
| **KPIs** | 6 compteurs compacts animés (ease-out cubic) : recettes, publiées, brouillons, catégories, utilisateurs, sessions actives |
| **Recettes récentes** | Mini-liste avec barre de statut colorée, difficulté, temps total, lien vers édition |
| **Plateforme** | Statuts services (API, PostgreSQL, Better Auth, Stockage R2, Emails Resend) avec indicateur vert/ambre |
| **Stack technique** | Panel récapitulatif des versions (Next.js, Hono, Drizzle, Better Auth, Turborepo, Tailwind) |
| **Tables** | Desktop : table classique avec barre de couleur à gauche (vert = publié, orange = brouillon), actions au hover. Mobile : cards empilées avec actions en footer. Pas de scroll horizontal |
| **Formulaires** | Sections glass avec en-tête icône SVG + titre, inputs avec focus ring primary, numéros d'étapes en cercles gradient. Grilles adaptatives (4 → 2 → 1 colonnes). Ingrédients : table desktop, cards empilées mobile |
| **États vides** | Illustrations SVG géométriques custom (pas d'emojis), lignes indigo + pêche |
| **Animations** | Fade-up à l'entrée de page, hover glow/lift sur les cards, gradient flow continu sur la barre sidebar, shimmer effects, text gradient animé |
| **Icônes** | SVG inline partout — aucun emoji utilisé dans l'interface admin |

---

## 9. Pages Publiques — Sitemap

| Route | Contenu |
|---|---|
| `/` | Accueil — hero avec bento grid des recettes vedettes, catégories |
| `/recettes` | Catalogue complet — bento grid avec recherche et filtres |
| `/recettes/[slug]` | Détail — photo hero, macros, ingrédients, étapes, matériel, vidéo, notes, commentaires |
| `/categories/[slug]` | Bento grid filtré par catégorie |
| `/tags/[slug]` | Bento grid filtré par tag |
| `/compte/connexion` | Connexion — split-screen : panneau décoratif dark (mesh gradients, branding) + formulaire |
| `/compte/inscription` | Inscription — split-screen identique, champs nom/email/password/confirm, validation frontend |
| `/compte/profil` | Profil membre — favoris, historique, paramètres |
| `/compte/favoris` | Bento grid des recettes favorites |
| `/compte/liste-de-courses` | Liste de courses en cours |
| `/admin` | Dashboard backoffice — KPIs ring charts + actions rapides (accès restreint admin) |
| `/admin/recettes` | Liste des recettes avec table, filtres statut/difficulté |
| `/admin/recettes/nouveau` | Formulaire création recette |
| `/admin/recettes/[id]/modifier` | Formulaire édition recette |
| `/admin/categories` | CRUD catégories |
| `/admin/commentaires` | File de modération |
| `/admin/utilisateurs` | Gestion des membres |

---

## 10. Déploiement & Hébergement

Architecture hybride : frontend/admin sur Vercel + API sur VPS ou Oracle Free Tier.

| Composant | Solution |
|---|---|
| **Web Next.js** (public + admin) | Vercel — gratuit, CDN mondial, déploiement Git automatique |
| **API Hono** | VPS OVH/Hostinger (~5–10€/mois) ou Oracle Cloud Free Tier (2 vCPU, 1 Go RAM) |
| **Base de données** | PostgreSQL sur le même VPS |
| **Médias** | Cloudflare R2 — 10 Go/mois gratuits, zéro frais d'egress |
| **Emails** | Resend — gratuit jusqu'à 3 000 mails/mois |
| **CI/CD** | GitHub Actions — build + déploiement auto sur push `main` |
| **HTTPS API** | Caddy sur le VPS (certificats automatiques) |
| **Domaine** | cooked.fr / cooked.com / getcooked.app — à confirmer |

---

## 11. Roadmap

### Phase 1 — MVP
- [x] Monorepo Turborepo initialisé
- [x] Schéma Drizzle + migrations PostgreSQL
- [x] API Hono : routes recettes publiques + admin CRUD (recettes, catégories)
- [x] Auth Better Auth : email/password + plugin admin, middleware auth + admin
- [x] Better Auth catch-all handler (`/api/auth/**`) — sign-up, sign-in, session, sign-out
- [x] Backoffice : dashboard KPIs, CRUD recettes (formulaire complet), CRUD catégories, modération, utilisateurs
- [x] Backoffice design : dark sidebar, glassmorphism, dot-grid, ring charts, SVG icons, animations futuristes
- [x] Dashboard futuriste : compteurs animés, glow effects, ring charts SVG avec filtre glow, status plateforme, recettes récentes
- [x] Tailwind CSS v4 intégré via @tailwindcss/postcss
- [x] Pages connexion et inscription — design split-screen (panneau décoratif + formulaire)
- [x] Responsive complet : sidebar mobile avec overlay, grilles adaptatives, tables avec scroll horizontal
- [x] Pages publiques : accueil bento grid, catalogue filtrable, detail recette
- [x] Audit securite + qualite : validation Zod sur tous endpoints, error handling global, FK/indexes/PK DB, proxy admin role check, pages error/404/loading
- [x] Consolidation schema DB : table `users` supprimee (doublon), `user` Better Auth = source unique, FK + indexes + contraintes uniques ajoutees
- [x] API /api/me implemente (profil + favoris CRUD)
- [x] Upload images local (dev) — endpoint multipart avec validation type/taille, serving statique via Hono serveStatic
- [x] Animations avancees : IntersectionObserver scroll-reveal, text-reveal mot par mot, hover-lift, card-shine, morph blobs, gradient-border, stagger delays
- [x] Categories dynamiques avec icones SVG (12 icones, picker admin, affichage public/footer)
- [x] Pages profil et favoris (frontend complet avec useSession, redirect, CRUD favoris)
- [x] Navbar + footer sur pages connexion/inscription (layout /compte)
- [x] Securite renforcee : rate limiting (10 req/min auth), password min 8 chars + complexite, enum validation role/icon, LIKE sanitization
- [x] Assignation recettes aux categories (many-to-many, UI toggle dans formulaire)
- [x] Upload medias dans formulaire recette (preview grid, primary/delete, sauvegarde avec recette)
- [ ] Upload images vers Cloudflare R2 (remplacer stockage local)
- [ ] Deploiement Vercel + VPS

### Phase 2 — Membres
- [x] Pages profil et favoris (frontend)
- [x] Favoris (API + UI complete)
- Emails transactionnels via Resend (confirmation inscription, etc.)
- Notation des recettes (visible publiquement)
- Commentaires + modération a priori
- Ajustement des portions côté client
- Recherche full-text + filtres avancés
- Historique de consultation

### Phase 3 — Enrichissement
- Galerie photos par recette
- Liste de courses exportable PDF
- Dashboard analytics backoffice
- Statistiques recettes (vues, favoris, note moyenne)

### Phase 4 — Scale
- i18n (anglais)
- API publique documentée (OpenAPI / Swagger)
- Application mobile (Flutter ou PWA)

---

## 12. Nom de domaine

Nom de l'app : **Cooked**. Domaines à vérifier par ordre de préférence :

| Domaine | Notes |
|---|---|
| `cooked.app` | Extension moderne, idéale pour une web app |
| `cooked.fr` | Ancrage français, pertinent si l'audience est FR |
| `cooked.com` | Référence universelle, probablement pris |
| `cooked.org` | Moins adapté (connotation associative) |
| `cooked.net` | Fallback acceptable |
| `getcooked.app` | Alternative si `cooked.app` est indisponible |
| `getcooked.fr` | Idem pour la version française |

---

*Cooked — PRD v2.1 — Document de travail, non contractuel*
