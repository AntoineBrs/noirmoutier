# 🏝️ Noirmoutier — Le carnet de famille

Un site privé pour la maison de famille à Noirmoutier :

- **Calendrier des séjours** partagé (qui vient, quand, avec qui, dans quelle maison : Maison Sud · Maison Nord · Annexe).
- **Carnet de photos** de la famille (catégories : Noirmoutier · Famille · Quotidien), avec envoi, description, téléchargement.
- **Connexion façon Netflix** : chacun choisit son prénom à l'entrée, sans mot de passe (modèle de confiance familiale). Chaque profil peut ajouter sa photo.

Le tout **100 % gratuit** : site hébergé sur Vercel, base de données et photos sur Supabase.

---

## 🚀 Mettre le site en ligne (3 étapes, ~20 min, gratuit)

### Étape 1 — Créer la base de données (Supabase)

1. Va sur **https://supabase.com** → _Start your project_ → connecte-toi (avec GitHub ou un email). C'est gratuit, sans carte bancaire.
2. Clique **New project**. Donne un nom (ex. `noirmoutier`), choisis un mot de passe de base de données (note-le), région **Europe (Paris/Frankfurt)**. Attends ~2 min que le projet se crée.
3. Dans le menu de gauche, ouvre **SQL Editor** → **New query**. Copie tout le contenu du fichier [`supabase/schema.sql`](supabase/schema.sql), colle-le, puis clique **Run**. ✅ Cela crée les tables, les 14 profils de la famille et les espaces de stockage des photos.
4. Va dans **Project Settings** (roue dentée) → **API**. Note deux valeurs :
   - **Project URL** (ex. `https://abcd1234.supabase.co`)
   - **anon public** key (une longue chaîne `eyJ...`)

### Étape 2 — Mettre le code sur GitHub

1. Crée un compte sur **https://github.com** si tu n'en as pas.
2. Crée un nouveau dépôt (repository) **privé**, ex. `noirmoutier`.
3. Depuis ce dossier, envoie le code (dans un terminal) :
   ```bash
   git init
   git add .
   git commit -m "Site famille Noirmoutier"
   git branch -M main
   git remote add origin https://github.com/TON-PSEUDO/noirmoutier.git
   git push -u origin main
   ```

### Étape 3 — Publier le site (Vercel)

1. Va sur **https://vercel.com** → connecte-toi **avec GitHub**. Gratuit.
2. **Add New → Project** → importe ton dépôt `noirmoutier`.
3. Avant de déployer, ouvre **Environment Variables** et ajoute :
   | Name | Value |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | _ton Project URL Supabase_ |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | _ta clé anon public_ |
4. Clique **Deploy**. Au bout d'une minute, tu obtiens une adresse du type `https://noirmoutier.vercel.app` 🎉

Partage ce lien à la famille. Toutes les modifications (séjours, photos) sont enregistrées en ligne et visibles par tous, en temps réel.

---

## 🖥️ Tester en local (facultatif)

```bash
npm install
cp .env.local.example .env.local   # puis remplis avec tes valeurs Supabase
npm run dev
```

Ouvre http://localhost:3000.

> 💡 **Mode démo** : tant que les variables Supabase ne sont pas renseignées, le site fonctionne avec des données d'exemple (rien n'est sauvegardé). Pratique pour voir le design.

---

## 🎨 Ce qui peut se personnaliser facilement

- **Les prénoms de la famille** : dans Supabase (table `profiles`) ou dans [`lib/constants.ts`](lib/constants.ts).
- **Les maisons et leurs couleurs** : [`lib/constants.ts`](lib/constants.ts) (`MAISONS`).
- **La palette de couleurs** : [`tailwind.config.ts`](tailwind.config.ts).
- **Les photos d'ambiance** (accueil, etc.) : URLs dans [`app/page.tsx`](app/page.tsx).

---

## ⚙️ Détails techniques

- **Next.js 16** (React) + **Tailwind CSS** pour l'interface.
- **Supabase** : base PostgreSQL, stockage des images (buckets `photos` et `avatars`).
- Pas d'authentification par mot de passe : sélection de profil mémorisée dans le navigateur (`localStorage`), modèle de confiance familiale. La sécurité repose sur le caractère privé du lien.

### Limite gratuite à connaître

Le stockage gratuit Supabase est de **1 Go** (~500–1000 photos). Largement suffisant pour démarrer. Si un jour c'est trop juste, on pourra activer la compression automatique des photos à l'envoi, ou passer à une offre supérieure.
