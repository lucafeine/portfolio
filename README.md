# lucafeine.fr

Site personnel one-page : bio, photo de profil GitHub, dépôts classés par dernière contribution,
journal des contributions (commits, pull requests, issues) et liens de contact. Le style part d'une
palette de café, d'un papier crème et
d’une mise en page éditoriale.

## Stack

- **React 19 + TypeScript + Vite** pour l’interface.
- **Express 5** pour servir le build et exposer `GET /api/github`.
- **Nginx Proxy Manager** (déjà présent sur le VPS) pour HTTPS et redirection `www`.
- **Docker Compose** pour le déploiement sur VPS.
- Polices auto-hébergées : **Fraunces**, **Newsreader**, **Geist Mono** (Fontsource).
- Aucun cookie, aucun traceur, aucun script tiers.

## Développement

```bash
npm install
cp .env.example .env       # facultatif, pour un token GitHub
npm run dev
```

Le site est servi sur <http://127.0.0.1:5173>, l’API sur <http://127.0.0.1:8787>.
Sous PowerShell : `Copy-Item .env.example .env`.

Commandes utiles :

```bash
npm run typecheck   # vérification TypeScript
npm run build       # build de production dans dist/
npm start           # sert dist/ + /api/github (PORT=8787 par défaut)
```

## Données GitHub

Le serveur lit l’API GitHub côté serveur, met le résultat en cache 10 minutes (15 minutes sans
token), puis le front se rafraîchit toutes les 10 minutes quand l’onglet est visible. Le dernier
état réussi est aussi écrit dans `.cache/github.json` : un redémarrage ne vide donc pas la page.
Dans Docker, ce fichier vit dans le volume `app_cache`.

- Les **dépôts** sont triés par dernière contribution de `lucafeine` (repli sur `pushed_at`).
- Le **journal** rassemble les commits (dans ses dépôts comme dans ceux d’organisations auxquelles
  il contribue), les pull requests et les issues qu’il a ouvertes. Quatre entrées sont affichées,
  puis dix de plus à chaque clic sur « Charger plus ».
- Le **graphique de contributions** reprend le calendrier public GitHub des douze derniers mois.
  Si la page `github.com/users/<login>/contributions` change ou est indisponible, le serveur
  reconstruit une approximation à partir des commits publics.
- Si l’API REST est rate-limitée, le serveur bascule sur l’API de recherche GitHub (dépôts,
  commits, pull requests et issues) et conserve le dernier état en cache disque. L’interface
  reste donc alimentée.
- L’**avatar** est chargé depuis `https://github.com/lucafeine.png?size=480` : GitHub renvoie
  toujours la photo actuelle, sans copie locale.
- Sans token, GitHub limite à 60 requêtes/heure par IP. Le serveur réduit alors le nombre de
  dépôts analysés et allonge le cache ; avec un token en lecture seule, la limite passe à
  5 000 requêtes/heure. Créez un token fine-grained ici :
  <https://github.com/settings/tokens?type=beta>, puis renseignez `GITHUB_TOKEN` dans `.env`.
  En production, le token est fortement recommandé.

Si GitHub est momentanément indisponible, le serveur ressert le dernier cache. Sans cache, les
sections concernées affichent un message et un lien direct vers GitHub ; la photo et les liens
restent disponibles.

## Contenu

Tout le texte fixe est dans [`src/content.ts`](src/content.ts) : titre, intro, liens et email du
pied de page. Modifiez ce fichier pour mettre à jour le contenu sans toucher aux composants.

## Déploiement sur le VPS

Prérequis : Docker et le plugin Compose, et un proxy HTTPS en amont (ici Nginx Proxy Manager)
qui possède déjà les ports **80** et **443**. Les enregistrements DNS de `lucafeine.fr` et
`www.lucafeine.fr` doivent pointer vers le VPS.

```bash
cp .env.example .env
# éditez .env : GITHUB_TOKEN=...
docker compose up -d --build
docker compose logs -f lucafeine-web
```

Le conteneur `lucafeine-web` ne publie **aucun port sur l'hôte** : il rejoint le réseau Docker de
Nginx Proxy Manager et n'est joignable qu'à travers lui, sous le nom de service `lucafeine-web`
et le port interne `4783`. C'est le proxy en amont qui publie 80/443 et termine le TLS.

Docker Compose lit le nom du réseau dans `NPM_NETWORK`, avec `proxy` par défaut. Pour vérifier
qu'il existe bien sur le VPS :

```bash
docker network ls | grep proxy
```

Si NPM utilise un autre nom, renseignez-le dans `.env` :

```
NPM_NETWORK=le_nom_reel_du_reseau
```

Dans Nginx Proxy Manager :

1. *Proxy Hosts* → **Add Proxy Host** pour `lucafeine.fr`, scheme `http`, host
   `lucafeine-web`, port `4783`.
2. Onglet *SSL* : certificat Let’s Encrypt, **Force SSL** et **HSTS** activés.
3. Ajouter un second host pour `www.lucafeine.fr`, avec *Force SSL*, puis une redirection
   permanente vers `https://lucafeine.fr`.

Test avant de valider l'host :

```bash
docker exec npm curl -sI http://lucafeine-web:4783/api/health
```

Les en-têtes `nosniff`, `Referrer-Policy`, `X-Frame-Options`, `Permissions-Policy` et la CSP sont
déjà posés par Express ; seul HSTS dépend du proxy.

Mise à jour :

```bash
git pull
docker compose up -d --build
```

Arrêt : `docker compose down`. Le volume `app_cache` conserve le dernier état GitHub.

### Variables d’environnement

| Variable | Défaut | Rôle |
| --- | --- | --- |
| `GITHUB_USER` | `lucafeine` | Compte GitHub lu par l’API |
| `GITHUB_TOKEN` | vide | Token en lecture seule, recommandé en production |
| `CACHE_TTL_MS` | `600000` avec token, `900000` sans | Durée du cache serveur |
| `PORT` | `8787` en local, `4783` dans Docker | Port HTTP interne |

## Accessibilité

La page vise le niveau **AA** des WCAG 2.1 et du RGAA 4.1. Ce n’est pas une attestation de
conformité : un audit externe reste nécessaire pour l’affirmer.

Mesures en place :

- `lang="fr"`, titre de page explicite, hiérarchie de titres continue.
- Repères sémantiques (`header`, `nav`, `main`, `section`, `footer`) et lien d’évitement.
- Focus visible immédiat, contraste texte ≥ 4,5:1, cibles tactiles ≥ 44 px.
- Aucune information portée par la couleur seule ; les états GitHub sont écrits en toutes lettres.
- Liens externes ouverts dans un nouvel onglet signalés aux lecteurs d’écran.
- `prefers-reduced-motion` respecté ; presque aucune animation par choix éditorial.
- Contenu de secours `<noscript>` avec le profil et l’email.
- Textes redimensionnables, pas de largeur fixe en `vw`, pas de défilement horizontal à 320 px.

## Performance

- Build statique Vite, CSS unique, JS découpé par Vite.
- Polices auto-hébergées avec `font-display: swap`, sous-ensembles latins chargés à la demande.
- Avatar GitHub en `srcset` 240/480, `width`/`height`, `fetchpriority="high"`.
- Assets hashés servis avec `Cache-Control: immutable`, HTML en `no-cache`.
- Compression gzip via Express ; le proxy en amont peut ajouter brotli ou zstd.
- API mise en cache côté serveur et navigateur (`stale-while-revalidate`).
- En-têtes de sécurité : CSP, `nosniff`, `Referrer-Policy`, `Permissions-Policy` via Express ;
  HSTS via le proxy.

## Structure

```text
src/
  components/      Masthead, Intro, ContributionGraph, Journal, Repos, LinksSection, SiteFooter
  hooks/           useGithubData
  lib/format.ts    dates et libellés FR
  content.ts       contenu éditable
  styles/app.css   mise en page et composants
server/index.mjs   API GitHub + serveur statique
tokens.css         palette, typographie, espacements, mouvement
Dockerfile         build multi-étapes, utilisateur non-root
docker-compose.yml app + volume de cache
```

## Git

Le dépôt suit les **Conventional Commits** et des branches courtes par type :

```text
main
feat/<sujet>     nouvelle fonctionnalité
fix/<sujet>      correction
docs/<sujet>     documentation
chore/<sujet>    outillage
```

Exemples de messages :

```text
feat(site): add ranked GitHub repository ledger
fix(api): keep the last cached payload when GitHub is rate-limited
build(docker): serve the app behind Caddy with automatic HTTPS
```

## Licence

Contenu et code personnels — tous droits réservés.
