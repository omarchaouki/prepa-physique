# CLAUDE.md

Application de preparation physique football : suivi d'equipes, batterie de tests scientifiques, statistiques, graphiques et recommandations, vendue en marque blanche a d'autres preparateurs.

## Commandes

```bash
npm run dev            # serveur de developpement
npm run build          # prisma generate + next build
npm run start          # serveur de production
npm run lint           # ATTENTION : ESLint n'a jamais ete configure ici, la
                       # commande ouvre un assistant interactif et bloque.
                       # Ne pas l'appeler sans intention de la configurer.
npm run typecheck      # tsc --noEmit, le vrai filet de securite du projet
npm run verify:science # controle les calculs contre les valeurs publiees
npm run verify:norms   # controle la distribution des percentiles
npm run verify:db      # controle la connexion Supabase
npm run db:push        # applique le schema, passe par DIRECT_URL
npm run db:seed        # donnees de demonstration
npm run owner:ensure   # cree ou repare le compte proprietaire sans toucher au reste
```

Il n'y a ni suite de tests unitaires ni ESLint configure. La verification se fait par `typecheck`, `verify:science` et `verify:norms`. Les trois doivent passer avant toute mise en production. Un changement dans `src/lib/sports-science/` sans `verify:science` vert n'est pas termine.

## Structure

```
src/app/app/        interface preparateur, protegee par le middleware
src/app/admin/      panneau proprietaire, role OWNER uniquement
src/app/actions/    toutes les mutations, un fichier par domaine
src/lib/queries.ts  toutes les lectures, chacune enveloppee dans cache()
src/lib/sports-science/  calculs purs, aucun acces base, aucun texte d'interface
src/lib/i18n/       dictionary.ts (cles), server.ts (getT), client.tsx (useT)
src/components/ui/  primitives.tsx et skeleton.tsx, la base visuelle
src/components/manage/  formulaires de gestion, partages creation et edition
scripts/            outils ponctuels en tsx ou mjs, jamais importes par l'app
```

Regles suivies :

- Une lecture reutilisee par plusieurs zones va dans `queries.ts` et passe par `cache()`, sinon deux frontieres Suspense declenchent deux fois la meme requete. Une lecture propre a une seule page peut appeler `prisma` directement dans la page.
- Un fichier `"use server"` ne peut exporter que des fonctions async. Les constantes et les types partages avec le client vont dans un module sans directive, voir `src/components/manage/player-values.ts`.
- `src/lib/sports-science/` ne connait ni Prisma ni React. C'est ce qui rend `verify:science` possible.
- Les commentaires sont en francais sans accents, en expliquant le pourquoi et non le quoi.

## Conventions

**Chargement progressif.** Chaque page qui lit des donnees porte `export const dynamic = "force-dynamic"` et decoupe ses requetes independantes en frontieres Suspense separees, avec un squelette de `components/ui/skeleton.tsx` en repli. Une requete lente ne doit jamais retarder une zone rapide.

**Barre de progression.** Deux declencheurs, et un seul est sur : `route-progress.tsx` suit les clics de navigation, et `<FormProgress />` suit l'attente d'un formulaire. Ne jamais poser d'ecouteur global sur `submit` : il sait quand une action part, jamais quand elle revient, et la barre reste bloquee sur un mot de passe refuse. `FormProgress` lit `useFormStatus`, qui connait les deux moments, donc il se pose dans le `form` et nulle part ailleurs.

**Langues.** Aucun texte visible en dur. Toute chaine passe par une cle de `dictionary.ts`, qui porte le francais et l'anglais cote a cote. Les cles sont typees : une traduction manquante casse la compilation. Les noms et protocoles de tests viennent du catalogue scientifique, qui porte deja ses champs `fr` et `en`. Les recommandations restent en francais.

**Droits.** Chaque action reverifie le droit cote serveur a partir de la session, via `requireTeamEditor` ou `requireClubAdmin`, jamais a partir de ce que le formulaire envoie. Une requete forgee ne doit ouvrir aucun acces que l'interface ne donne pas. Toute mutation ecrit une ligne dans `AuditLog`.

**Couleurs.** Uniquement des variables CSS (`var(--text-muted)`, `var(--danger-soft)`). Aucun hexadecimal dans un composant, sinon le theme sombre casse.

**Plans.** Les plafonds (`maxPlayers`, `maxTeams`) appartiennent au proprietaire. Un client ne releve jamais ses propres limites, et un depassement renvoie un message explicite, pas un echec silencieux. Le forfait `FREE` n'a pas de date de fin : trente joueurs, une equipe, pour toujours. Les clubs crees avant ce changement portent encore la valeur `TRIAL` en base : toute lecture passe par `resolvePlan`, jamais par la chaine stockee.

**Devises.** Deux prix ecrits en dur dans `PRICING`, dirham et euro, jamais une conversion a la volee : un taux qui bouge ferait varier le prix affiche d'un jour a l'autre. `formatPrice` prend la devise en argument. Le choix du visiteur vit dans un cookie, lu par `getCurrency` dans `src/lib/currency-server.ts`.

**Qui peut creer.** Tous les roles sauf `VIEWER` creent equipes et joueurs, via
`requireTeamCreator`. Celui qui cree une equipe y est rattache en `MANAGE`,
sinon il ne la verrait plus une seconde apres. Le proprietaire fait exception :
il accede a tout sans rattachement. Le staff et les reglages du club restent
reserves a `requireClubAdmin`.

**Prise en main.** `src/components/app/onboarding.tsx` guide un compte neuf en
trois etapes, equipe puis joueurs puis passation. Une etape verrouillee dit
pourquoi elle l'est. Le guide disparait seul une fois les trois franchies. Les
actions de creation vivent la ou on les cherche : creer une equipe sur la page
des equipes, ajouter un joueur sur la page des joueurs, jamais uniquement dans
un ecran de gestion imbrique.

**Inscription publique.** `/inscription` cree un club au forfait gratuit et son administrateur, en une transaction, puis connecte. Il n'y a pas de verification par courriel, c'est un choix assume pour la conversion : la protection repose sur une limite par adresse IP, un refus des adresses jetables et un champ leurre. Consequence a assumer, il faudra nettoyer de faux comptes de temps en temps.

## Pieges

**Prisma, deux connecteurs.** Le schema est ecrit dans l'intersection SQLite et PostgreSQL : aucun enum natif, aucun type `Json`, aucune liste scalaire. Les valeurs d'enumeration vivent dans `src/lib/constants.ts`. Basculer avec `npm run db:sqlite` ou `npm run db:postgres`, jamais a la main.

**Supabase, quatre pieges silencieux.**
1. `DATABASE_URL` passe par le pooler port 6543 avec `pgbouncer=true`, `DIRECT_URL` par le port 5432. Le mode transaction refuse les instructions de schema, donc `db:push` echoue sans `DIRECT_URL`.
2. Encoder le mot de passe : `@` devient `%40`, `$` devient `%24`.
3. Ne jamais utiliser `db.<ref>.supabase.co`, publie en IPv6 seulement, injoignable ici. Le prefixe de l'hote est `aws-1`, pas `aws-0`.
4. `connection_limit=10`, pas 1. La valeur 1 vaut pour du serverless ; ici les frontieres Suspense tirent en parallele et le pool expire.

**Windows.** Arreter le serveur de developpement avant `npm run build`, sinon Prisma echoue en `EPERM` sur `query_engine-windows.dll.node`, la DLL etant tenue par le processus. Aucun module natif ne compile sur cette machine, faute de Visual Studio : `bcryptjs` et jamais `bcrypt`.

**Fichier .env.** Next.js interprete `$` dans une valeur. Un hachage bcrypt ou un mot de passe qui en contient doit etre echappe, sinon la connexion echoue en silence.

**Tailwind et les classes maison.** Les classes de composants de `globals.css`
(`.btn`, `.field`, `.panel`) sont declarees hors couche. Elles gagnent donc
contre les utilitaires Tailwind, qui vivent dans la couche `utilities`.
Consequence concrete : `className="btn hidden sm:inline-flex"` n'est pas masque,
`.btn` impose son `display: inline-flex`. Porter le masquage sur une enveloppe,
ou verifier le rendu reel. Seules les proprietes que `.btn` ne definit pas,
comme `w-full`, se comportent normalement.

**Science.** Deux points a ne pas reintroduire :
- Le chronometre d'un sprint ne demarre pas au premier mouvement. `TIMING_OFFSETS` doit etre applique avant l'ajustement, sans quoi F0 double.
- Les asymetries se lisent par seuil (`METRIC_THRESHOLDS`), jamais par percentile. Une population de reference d'asymetries n'a pas de sens clinique.

## Page publique

Elle est adressee a un visiteur qui ne connait pas le produit, et obeit a des
regles differentes de l'application :

- **Aucune grille de cartes.** Les cadres arrondis alignes quatre par quatre
  sont la signature visuelle des pages generees, et le public vise les
  reconnait. La hierarchie passe par la taille, le blanc et des filets `hr.rule`.
- **Aucun tiret dans la copie**, ni demi cadratin ni trait d'union de liaison.
  Les seuls tirets tolerables viennent des noms de tests du catalogue, comme
  Yo-Yo ou 30-15, qui sont des noms propres.
- **Aucun avis invente.** `src/lib/testimonials.ts` est vide et la section ne
  s'affiche pas tant qu'il l'est. Un faux temoignage fait refuser le compte
  Stripe et tombe sous la publicite trompeuse. Chaque entree porte la date de
  l'accord ecrit de publication.
- **Les chiffres se comptent, ils ne s'ecrivent pas.** Nombre de tests, de
  normes, de populations, plafonds et tarifs viennent du catalogue, de
  `constants.ts` et de `marketing.ts`.
- **Animations sans bibliotheque.** `animation-timeline: view()` dans
  `globals.css`. Les navigateurs qui l'ignorent affichent le contenu immobile
  et complet. Ne jamais cacher un element par defaut en attendant un script.

Ce que Stripe verifie et qui doit rester vrai : un tarif visible en euro, les
conditions de resiliation, la politique de remboursement, la confidentialite,
l'identite de l'entreprise, et un service client joignable. Les quatre pages
sont sous `/legal` et liees depuis le pied de page.

## Application mobile

`mobile/`, projet Expo separe avec son propre `package.json`. React Native, SDK 57.

- **Elle parle a l'API, jamais a Prisma.** Les routes sont sous `src/app/api/` :
  connexion, session, catalogue, et `sync` en descente et remontee. Toute
  nouvelle donnee sur le telephone passe par `sync`, pas par une route dediee.
- **Aucun ecran n'appelle le reseau pour s'afficher.** Tous lisent la base
  SQLite locale, que la synchronisation met a jour en arriere plan.
- **Le telephone ne calcule aucune formule scientifique.** Il envoie des valeurs
  brutes, le serveur derive les metriques. Dupliquer le moteur creerait deux
  verites le jour d'une correction.
- **Les identifiants des passations sont generes sur le telephone.** C'est ce
  qui rend la remontee idempotente : le serveur fait un `upsert`, donc un renvoi
  apres coupure ne cree pas de doublon.
- **Le curseur de synchronisation porte une date et un identifiant.** PostgreSQL
  donne la meme date a toutes les lignes d'un `createMany` ; un curseur reduit a
  la date sauterait des lignes en silence. `npm run verify:sync` le controle.
- Verification : `npm run typecheck`, `npx expo-doctor`, et `npx expo export`
  qui construit reellement le bundle. Les trois doivent passer.
- Les versions des modules Expo se posent avec `npx expo install`, jamais a la
  main : celles ecrites de memoire n'existent pas.
- **`mobile` est exclu du `tsconfig.json` racine, et doit le rester.** Le
  `include` de la racine ramasse `**/*.tsx`, donc sans cette exclusion la
  compilation Next.js verifie aussi l'application mobile. Le defaut ne se voit
  pas ici, ou `mobile/node_modules` existe et resout les imports, mais il casse
  la compilation du serveur ou `npm ci` n'installe que la racine. Pour
  reproduire la condition du serveur : ecarter `mobile/node_modules`, puis
  `npm run build`.

## Contraintes fermes

**L'APK ne se reconstruit pas pour une modification de l'application.** C'est une coque Capacitor qui pointe vers `APP_URL` ; tout le contenu vient du serveur. Un simple redeploiement suffit, les telephones recoivent la mise a jour au rechargement. L'APK se reconstruit uniquement si l'`appId`, le nom, l'icone, l'ecran de lancement, la page hors ligne ou l'adresse du serveur changent :

```bash
APP_URL=https://lamsaa.ma npm run android:sync && npm run android:apk
```

- L'`appId` `ma.lamsaa.prepaphysique` est definitif des la premiere distribution. Le changer produit une application differente, sans mise a jour possible pour ceux qui ont l'ancienne.
- Capacitor reste en version 6. La 7 exige le JDK 21, la machine a le 17. `compileSdk` et `targetSdk` restent a 35.
- La cle de signature ne s'ecrit jamais sur le disque en clair. `android/release.jks`, `*.jks`, `*.keystore` et `dist-apk/` sont ignores par git.

**Secrets.** `.env` n'est jamais commite, jamais recopie dans un fichier suivi, jamais affiche dans une reponse. Les identifiants Supabase et les mots de passe de comptes n'existent qu'a cet endroit.

**Donnees de production.** La base Supabase est la vraie base du client. Ne jamais lancer `db:reset`, ne jamais reecrire le mot de passe d'un compte existant, ne jamais supprimer de joueur sans demande explicite. Pour creer ou reparer le compte proprietaire, `npm run owner:ensure`, qui ne touche a rien d'autre.

**Git.** Demander avant tout `commit` ou `push` vers `omarchaouki/prepa-physique`.
