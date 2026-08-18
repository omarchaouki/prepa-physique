# Etat des lieux

Derniere mise a jour : 18 aout 2026. Dernier commit : `99ea7fb`. Depuis, le repertoire de travail contient des modifications non commitees, decrites plus bas, dont une application mobile entiere.

## Ou en est l'application

Fonctionnelle et complete sur son perimetre : authentification, tableau de bord, equipes, joueurs, passation de tests, analyses, recommandations, panneau proprietaire, deux langues, chargement progressif, gestion des effectifs et des clubs, page publique et pages legales. La base de production est Supabase (`aws-1-eu-west-3`, pooler).

`npm run typecheck` et `npm run build` passent. Il n'y a ni tests unitaires ni ESLint configure dans ce projet : `npm run lint` ouvre un assistant interactif et bloque, ne pas l'appeler.

## Travail de la derniere session

Refonte de la page publique, plus quatre points demandes avec.

**Page d'accueil, reecrite.** L'ancienne version empilait trente cinq cadres arrondis en grilles de quatre. La nouvelle n'en contient aucun : la hierarchie passe par la taille du texte, le blanc et cinquante cinq filets fins. Titres en Bricolage Grotesque, corps en Fira Sans. Verifie en machine : `document.querySelectorAll('.panel, .panel-sunken').length` vaut zero sur la page.

**Langue du navigateur.** `getLocale` lit le cookie, puis l'entete `Accept-Language` en respectant les valeurs de qualite, puis retombe sur le francais. L'attribut `lang` de `html` suit la langue reellement rendue. Le selecteur reste dans l'entete et ecrit le cookie.

**Barre de progression sur les formulaires.** Nouveau composant `src/components/shell/form-progress.tsx`. Il lit `useFormStatus`, qui sait quand une action part et quand elle revient, contrairement a un ecouteur `submit`. Pose dans le formulaire de connexion et dans le formulaire de joueur. Verifie : sur un mot de passe refuse, une apparition et une disparition, message d'erreur affiche, bouton rearme, aucune barre bloquee.

**Animations.** Aucune bibliotheque. `animation-timeline: view()` dans `globals.css`, plus une entree decalee sur le premier ecran. Les navigateurs qui ne connaissent pas encore les animations pilotees par le defilement affichent le contenu immobile et complet.

**Tarifs en euro.** `PRICING` dans `src/lib/marketing.ts` : essai gratuit 14 jours, Starter 39 €, Pro 99 €, Elite 249 €, par mois et hors taxes. **Ces montants sont un point de depart, pas une decision commerciale : a confirmer par Omar.**

**Pages legales.** Quatre routes sous `/legal`, bilingues, liees depuis le pied de page : conditions generales, confidentialite, remboursement, mentions legales. Les donnees d'entreprise manquantes s'affichent en jaune comme mentions a completer, plutot que de laisser un blanc.

### Fichiers ajoutes

| Fichier | Role |
|---|---|
| `src/lib/marketing.ts` | contacts, identite entreprise, tarifs, formatage |
| `src/lib/testimonials.ts` | structure des avis, volontairement vide |
| `src/components/shell/form-progress.tsx` | attente d'un formulaire vers la barre du haut |
| `src/components/marketing/legal-page.tsx` | gabarit commun aux pages legales |
| `src/app/legal/conditions/page.tsx` | conditions generales |
| `src/app/legal/confidentialite/page.tsx` | confidentialite |
| `src/app/legal/remboursement/page.tsx` | remboursement et resiliation |
| `src/app/legal/mentions/page.tsx` | mentions legales |
| `CLAUDE.md` | consignes projet |

### Fichiers modifies

`src/app/page.tsx` (reecrit), `src/lib/i18n/server.ts`, `src/lib/i18n/dictionary.ts` (bloc `home.*` remplace, 90 cles), `src/app/layout.tsx`, `src/app/globals.css`, `src/app/login/login-form.tsx`, `src/components/manage/player-form.tsx`, `.env.example`.

### Defauts trouves et corriges en cours de route

- **Debordement horizontal sur telephone**, 467 px pour un ecran de 375. Cause : `.btn` est declare hors couche dans `globals.css`, il gagne donc contre l'utilitaire `hidden` de Tailwind et le bouton de demonstration restait affiche. Le masquage porte desormais sur une enveloppe. Un seul endroit du projet etait concerne.
- **`--text-muted` a 4,47 pour 1** sur le fond de page clair, trois centiemes sous le seuil AA, sur toute l'application. Passe a `#5f6e83` : 4,88 sur la page, 5,19 sur un panneau, 4,62 sur un creux.
- **Quatre contrastes insuffisants en theme sombre** dans la section des tarifs. Corriges. Releve automatique final : zero echec dans les deux themes, sur tous les textes non decoratifs.
- **« 1 equipes »** au lieu de « 1 equipe ». Accord en nombre ajoute.
- **Un auteur nomme « al. »** dans la bande des references, ne du decoupage de « Samozino et al. 2016 ». Filtre corrige.

## Application mobile et API

Ajoutees le 18 aout, apres la refonte de la page publique.

**Une API JSON dans Next.js**, `src/app/api/` : `auth/login`, `auth/session`, `catalog`, et `sync`. Cinq routes seulement, parce qu'une application hors ligne d'abord ne demande jamais un ecran au serveur : elle descend des donnees et remonte des operations.

**Le calcul des resultats est desormais partage** entre le site et l'API, dans `src/lib/tests/apply-results.ts`. `saveResultsAction` a fondu de 327 a 200 lignes en deleguant. Une formule corrigee vaut maintenant pour les deux chemins de saisie.

**`src/lib/tests/validate-entries.ts`**, nouveau, rend l'API stricte sur les noms de champs et les bornes. Sur le site le formulaire les garantit, sur une API rien ne les garantit.

**`mobile/`**, projet Expo SDK 57 avec React Native 0.86 : connexion par defaut, logo anime au lancement, base SQLite locale, file d'attente de synchronisation, deux langues, tableau de bord, equipes, effectif, fiche joueur, creation de passation et saisie de tests hors reseau.

**Le logo** est nouveau : une courbe vitesse temps de sprint avec son point de mesure, dessinee par code dans `mobile/scripts/generate-assets.py`. Elle remplace l'icone Activity generique. Toutes les icones Android et le bandeau Google Play en decoulent.

### Ce qui a ete verifie, et comment

| Verification | Resultat |
|---|---|
| Connexion refusee, compte inconnu | messages identiques, aucune fuite sur l'existence du compte |
| Cloisonnement des equipes | 7 comptes, 3 roles, chacun voit exactement ce qu'il doit |
| Jeton de version revoquee | refuse en 401 |
| Descente complete | 6127 lignes, **aucune perdue**, `npm run verify:sync` |
| Remontee rejouee apres coupure | 1 passation, 3 resultats, **aucun doublon** |
| Champ inexistant, valeur hors bornes, texte dans un nombre | les trois refuses |
| Calcul serveur sur saisie mobile | 38,5 cm et 48,2 W/kg, valeurs coherentes |
| Application mobile | typecheck vert, `expo-doctor` 21 sur 21, bundle Metro construit |

Un defaut serieux a ete trouve et corrige en cours de route : le curseur de synchronisation ne portait qu'une date. PostgreSQL evalue `now()` une fois par instruction, donc les milliers de lignes d'un meme `createMany` partagent leur date : une page saturee au milieu d'un lot aurait saute le reste, en silence. Le curseur porte maintenant une date et un identifiant. `scripts/verify-sync.ts` existe pour que ce defaut ne revienne pas.

## Ce qui ne va pas

**Aucun avis client publie, et c'est voulu.** `src/lib/testimonials.ts` est vide. Un temoignage invente est un motif de refus documente chez Stripe, tombe sous la directive europeenne 2019/2161 et sous la loi marocaine 31.08, et se repere immediatement par un preparateur physique. La page affiche a la place la preuve verifiable : nombre de tests, seize auteurs cites nommement, populations de reference. La section apparait toute seule des qu'une vraie entree est ajoutee. Le fichier explique comment obtenir ces avis et exige une date d'accord ecrit par entree.

**Donnees d'entreprise manquantes.** `COMPANY_LEGAL_NAME`, `COMPANY_ADDRESS`, `COMPANY_REGISTRATION` et `COMPANY_PHONE` ne sont pas renseignees dans le `.env` du serveur. Sans elles, Stripe refusera le compte, et les mentions legales affichent des marqueurs jaunes. Voir `.env.example`.

**Tarifs a confirmer.** Les quatre montants sont des reperes credibles pour le marche vise, choisis par moi. Ils engagent Omar, pas moi.

**Comptes de demonstration inutilisables.** `admin@fcatlas.com` et `coach@fcatlas.com` n'acceptent plus `Demo2026`, leurs hachages ayant ete reecrits hors de l'application en cout 12. Non modifies : ce sont des donnees du client.

**Deux comptes proprietaire** existent, `owner@prepaphysique.app` et `omar@lamsaa.ma`. Sans consequence, mais un seul suffirait.

**Joueur de test en base**, « Karim Benzema » dans `Al Hilal pro`. Supprimable depuis l'ecran de modification.

**Chemin Docker casse.** `DEPLOY.md` decrit un deploiement PM2 plus Caddy sans Docker, et a fait retirer `output: "standalone"` de `next.config.ts`. Le `Dockerfile` copie pourtant toujours `.next/standalone`, qui n'est donc plus produit. Choisir une voie et supprimer l'autre.

**Modifications non commitees anterieures a cette session.** `git status` montre aussi des changements dans `src/app/actions/tests.ts`, `src/components/shell/app-shell.tsx`, `src/components/test-entry-grid.tsx`, `capacitor.config.ts`, et de nouveaux dossiers `src/lib/offline/` et `public/sw.js`. Ils ne viennent pas de cette session et n'ont pas ete touches.

**L'application mobile n'a jamais tourne sur un appareil.** Cette machine n'a ni emulateur Android ni telephone connecte. Le code compile, le bundle se construit, les regles de la plateforme sont suivies, mais sept points demandent un vrai telephone. Ils sont listes a la fin de `docs/GOOGLE-PLAY.md`, et les deux qui comptent sont : une saisie faite en mode avion survit au redemarrage, et elle part seule au retour du reseau.

**Le disque est presque plein.** 194 Go sur 224 au moment de l'installation, et `npm install` a echoue une premiere fois faute de place. `mobile/node_modules` pese pres d'un gigaoctet a lui seul.

**Les captures d'ecran de la fiche Play restent a produire.** Elles demandent un appareil.

## A faire ensuite

1. **Renseigner l'identite de l'entreprise** dans le `.env` du serveur. C'est le seul blocage dur pour Stripe.
2. **Confirmer ou corriger les quatre tarifs** dans `src/lib/marketing.ts`.
3. **Faire relire les pages legales** par un juriste avant la premiere vente, en particulier le droit applicable et le regime de TVA, tous deux laisses a completer.
4. **Commiter et deployer.** Aucune migration de base, le schema n'a pas bouge. L'APK n'est pas a reconstruire, la coque pointe vers le serveur.
5. **Recolter les premiers avis** apres une saison complete, avec accord ecrit, puis remplir `src/lib/testimonials.ts`.
6. Trancher le sort du chemin Docker et des comptes de demonstration.
7. **Essayer l'application mobile sur un telephone**, avec `npx eas build --profile development`. C'est le seul moyen de valider le hors ligne.
8. **Ouvrir le compte Google Play**, de preference en compte organisation : le compte personnel impose douze testeurs pendant quatorze jours. Voir `docs/GOOGLE-PLAY.md`.
