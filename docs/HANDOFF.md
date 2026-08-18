# Etat des lieux

Derniere mise a jour : 18 aout 2026. Dernier commit : `99ea7fb`. Depuis, le repertoire de travail contient des modifications non commitees, decrites plus bas.

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

## Ce qui ne va pas

**Aucun avis client publie, et c'est voulu.** `src/lib/testimonials.ts` est vide. Un temoignage invente est un motif de refus documente chez Stripe, tombe sous la directive europeenne 2019/2161 et sous la loi marocaine 31.08, et se repere immediatement par un preparateur physique. La page affiche a la place la preuve verifiable : nombre de tests, seize auteurs cites nommement, populations de reference. La section apparait toute seule des qu'une vraie entree est ajoutee. Le fichier explique comment obtenir ces avis et exige une date d'accord ecrit par entree.

**Donnees d'entreprise manquantes.** `COMPANY_LEGAL_NAME`, `COMPANY_ADDRESS`, `COMPANY_REGISTRATION` et `COMPANY_PHONE` ne sont pas renseignees dans le `.env` du serveur. Sans elles, Stripe refusera le compte, et les mentions legales affichent des marqueurs jaunes. Voir `.env.example`.

**Tarifs a confirmer.** Les quatre montants sont des reperes credibles pour le marche vise, choisis par moi. Ils engagent Omar, pas moi.

**Comptes de demonstration inutilisables.** `admin@fcatlas.com` et `coach@fcatlas.com` n'acceptent plus `Demo2026`, leurs hachages ayant ete reecrits hors de l'application en cout 12. Non modifies : ce sont des donnees du client.

**Deux comptes proprietaire** existent, `owner@prepaphysique.app` et `omar@lamsaa.ma`. Sans consequence, mais un seul suffirait.

**Joueur de test en base**, « Karim Benzema » dans `Al Hilal pro`. Supprimable depuis l'ecran de modification.

**Chemin Docker casse.** `DEPLOY.md` decrit un deploiement PM2 plus Caddy sans Docker, et a fait retirer `output: "standalone"` de `next.config.ts`. Le `Dockerfile` copie pourtant toujours `.next/standalone`, qui n'est donc plus produit. Choisir une voie et supprimer l'autre.

**Modifications non commitees anterieures a cette session.** `git status` montre aussi des changements dans `src/app/actions/tests.ts`, `src/components/shell/app-shell.tsx`, `src/components/test-entry-grid.tsx`, `capacitor.config.ts`, et de nouveaux dossiers `src/lib/offline/` et `public/sw.js`. Ils ne viennent pas de cette session et n'ont pas ete touches.

## A faire ensuite

1. **Renseigner l'identite de l'entreprise** dans le `.env` du serveur. C'est le seul blocage dur pour Stripe.
2. **Confirmer ou corriger les quatre tarifs** dans `src/lib/marketing.ts`.
3. **Faire relire les pages legales** par un juriste avant la premiere vente, en particulier le droit applicable et le regime de TVA, tous deux laisses a completer.
4. **Commiter et deployer.** Aucune migration de base, le schema n'a pas bouge. L'APK n'est pas a reconstruire, la coque pointe vers le serveur.
5. **Recolter les premiers avis** apres une saison complete, avec accord ecrit, puis remplir `src/lib/testimonials.ts`.
6. Trancher le sort du chemin Docker et des comptes de demonstration.
