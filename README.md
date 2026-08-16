# Prepa Physique

Plateforme de preparation physique pour le football. Batterie de tests complete,
calculs issus de la litterature scientifique, profils individuels compares aux
normes de population, detection des asymetries et recommandations de programmation.

Multi club : chaque organisation est isolee, chaque staff ne voit que ses equipes.
Un panel proprietaire donne au proprietaire de l'application la vue et le controle
sur l'ensemble des clients.

---

## Demarrage rapide

```bash
npm install
cp .env.example .env
npx prisma generate
npx prisma db push
npm run db:seed
npm run dev
```

L'application demarre sur http://localhost:3000

### Comptes de demonstration

| Role | Identifiant | Mot de passe |
|---|---|---|
| Proprietaire | owner@prepaphysique.app | ChangeMoi2026 |
| Administrateur de club | admin@fcatlas.com | Demo2026 |
| Preparateur physique | coach@fcatlas.com | Demo2026 |
| Preparateur, autre club | coach@horizon.fr | Demo2026 |

Le jeu de demonstration contient 2 clubs, 2 equipes, 40 joueurs et 3 passations de
tests reparties sur cinq mois, soit environ 5 200 mesures.

---

## Stack

| Couche | Technologie | Pourquoi |
|---|---|---|
| Interface | Next.js 15, React 19, TypeScript | Server Components, rendu rapide, un seul projet a deployer |
| Style | Tailwind CSS 4, jetons de couleur maison | Themes clair et sombre definis ensemble, densite adaptee au tableau de bord |
| Graphiques | Recharts | Leger, reactif, accessible |
| Base de donnees | Prisma, SQLite en local, PostgreSQL en production | Meme schema, bascule en une ligne |
| Authentification | JWT signe en HS256 (jose) et bcryptjs | Pas de compilation native, revocation immediate par version de jeton |

`bcryptjs` est en JavaScript pur, il n'y a donc aucun module natif a compiler,
ce qui evite d'avoir besoin de Visual Studio sous Windows.

---

## Ce que fait l'application

### Batterie de tests

22 tests couvrant sept domaines, chacun avec son protocole, son materiel, sa duree
et sa source. Le formulaire de saisie est genere automatiquement a partir de la
definition du test.

**Vitesse** — sprint lineaire avec profil force vitesse horizontal (methode de
Samozino), sprint lance.

**Detente et puissance** — saut avec contre mouvement, squat jump, drop jump avec
indice de force reactive, batterie de sauts unilateraux.

**Force** — Nordic hamstring, force isometrique des adducteurs et abducteurs,
traction isometrique a mi cuisse, maximum estime a une repetition, profil charge vitesse.

**Changement de direction** — test 505 avec deficit de changement de direction,
Illinois, test en T.

**Endurance** — Yo-Yo intermittent recovery, 30-15 Intermittent Fitness Test,
VMA, Bronco, sprints repetes, profil de frequence cardiaque.

**Anthropometrie** — plis cutanes par Durnin et Womersley ou Jackson et Pollock,
maturation biologique par les equations de Mirwald.

**Mobilite** — dorsiflexion de cheville, test de Thomas, souplesse assis.

### Analyses

- Percentiles par rapport a la population de reference, avec choix automatique de
  la population selon la categorie, le niveau, le sexe et le poste
- Radar de profil individuel sur six qualites
- Evolution dans le temps avec ligne de reference de la population
- Classement du groupe, croisement de deux qualites, repartition par tranche
- Comparaison gauche droite avec seuils d'asymetrie
- Statistiques descriptives du groupe, dont le coefficient de variation

### Recommandations

Moteur de regles qui croise les mesures avec des seuils publies. Chaque
recommandation indique le constat chiffre, l'explication physiologique, les actions
concretes, la dose hebdomadaire et la source. Les regles couvrent la force
excentrique des ischio jambiers, la region inguinale, les asymetries, le profil
force vitesse, les criteres de retour au jeu, la capacite intermittente, la
qualite reactive, la mobilite, la maturation et la composition corporelle.

Si une donnee manque, la regle ne se declenche pas et le moteur signale le test a
programmer. Rien n'est extrapole.

### Roles

| Role | Portee |
|---|---|
| Proprietaire | Tous les clubs, gestion des acces, journal d'audit, consultation en tant que client |
| Administrateur de club | Toutes les equipes de son club |
| Preparateur physique | Les equipes auxquelles il est rattache |
| Analyste et lecture seule | Consultation |

Le proprietaire peut ouvrir l'application avec le compte d'un client pour
diagnostiquer un probleme. L'action est tracee dans le journal d'audit et un
bandeau reste visible pendant toute la session. Le mot de passe du client n'est
jamais visible.

---

## Chargement progressif

L'application n'attend jamais que toutes les donnees soient pretes pour afficher
quelque chose. Trois mecanismes se combinent.

**Barre de progression.** Elle demarre au clic, pas a l'arrivee de la reponse,
et se termine quand la nouvelle page est affichee. Elle couvre les liens, les
formulaires et les navigations declenchees par du code.

**Coquille immediate.** Chaque page separe ce qui est instantane de ce qui est
lent. Le titre, le fil d'ariane, les badges et les entetes de panneaux viennent
de requetes d'une seule ligne, toutes indexees : ils s'affichent tout de suite.
Sur la fiche joueur par exemple, le nom, le poste et l'age sont la avant que le
moteur de recommandations n'ait commence a travailler.

**Zones independantes.** Chaque bloc lourd est une frontiere Suspense avec son
propre squelette, dimensionne a la taille exacte du contenu qu'il remplace, ce
qui evite tout decalage a l'arrivee des donnees. Sur le tableau de bord, les
indicateurs, les alertes, les dernieres passations et les equipes sont quatre
requetes independantes : chaque zone apparait des qu'elle est prete, sans
attendre les autres.

### Mesures

Version compilee, avec 450 millisecondes de latence simulee sur chaque requete,
ce qui reproduit une base distante. Navigation depuis la liste des joueurs vers
une fiche joueur :

| Instant | Ce que voit l'utilisateur |
|---|---|
| 146 ms | La page precedente a disparu, la structure de la fiche est affichee en squelettes |
| 1 564 ms | Le nom, le poste, l'age et les badges du joueur sont la |
| 2 900 ms | Les zones de donnees se remplissent une a une |
| 3 031 ms | Fiche complete |

Sans ce dispositif, l'ecran serait reste sur la page precedente pendant les trois
secondes, puis aurait bascule d'un coup.

Sur le tableau de bord, la coquille et les squelettes partent dans le premier
fragment de la reponse, les equipes arrivent au fragment 49, les alertes au
fragment 61. Les alertes, de loin le calcul le plus lourd puisqu'il evalue les
recommandations de chaque joueur, ne retardent plus rien.

### Tester les etats de chargement

En local la base est un fichier, les reponses arrivent trop vite pour que les
squelettes s'affichent. Pour les voir :

```bash
SIMULATE_LATENCY_MS=450 npm run dev
```

Chaque requete est alors retardee d'autant. La variable est ignoree en
production, sauf si `ALLOW_LATENCY_SIMULATION=1` est egalement defini, ce qui
sert uniquement a verifier une version compilee.

Trois optimisations completent le dispositif :

- `cache()` de React dedoublonne les requetes a l'echelle d'une requete HTTP,
  donc plusieurs zones peuvent demander la meme donnee sans la recharger
- les vues de synthese ne chargent que dix huit mois d'historique, seule la
  fiche joueur remonte tout
- un middleware verifie la signature du jeton sans toucher la base, ce qui
  redirige un visiteur non connecte en quelques millisecondes

## Qui peut modifier quoi

| | Proprietaire | Admin club | Preparateur | Analyste, lecture |
|---|---|---|---|---|
| Creer et suspendre un club | oui | non | non | non |
| Forfait et plafonds d'un club | oui | non | non | non |
| Coordonnees de son club | oui | oui | non | non |
| Creer une equipe | oui | oui | non | non |
| Reglages d'une equipe | oui | oui | sur ses equipes | non |
| Archiver une equipe | oui | oui | non | non |
| Rattacher du staff a une equipe | oui | oui | non | non |
| Ajouter et modifier des joueurs | oui | oui | sur ses equipes | non |
| Saisir des resultats de tests | oui | oui | sur ses equipes | non |
| Creer des comptes | oui | non | non | non |

Un preparateur agit sur les equipes auxquelles il est rattache avec le droit de
gestion, jamais au dela. Un administrateur de club agit sur tout son club, jamais
sur un autre.

Le forfait et les plafonds restent la main du proprietaire : un client ne releve
pas ses propres limites. Les plafonds sont verifies a la creation, un club au
maximum de son forfait reçoit un message explicite plutot qu'un echec silencieux.

Chaque droit est reverifie cote serveur a partir de la session, jamais a partir
de ce que le formulaire a envoye : une requete forgee n'ouvre aucun acces que
l'interface ne donnerait pas.

### Ou se trouvent ces ecrans

- **Effectif et reglages d'une equipe** : page de l'equipe, bouton *Gerer*.
  Ajout de joueur avec formulaire qui se rearme apres chaque enregistrement,
  pour saisir un effectif entier sans quitter la page.
- **Fiche d'un joueur** : bouton *Modifier*. Permet aussi de le transferer vers
  une autre equipe, ou de le supprimer definitivement avec son historique.
- **Mon club** : dans la barre laterale des administrateurs de club. Coordonnees,
  creation d'equipes et vue d'ensemble des equipes du club.

Pour sortir un joueur de l'effectif en gardant ses donnees, passer son statut a
*Parti* plutot que le supprimer. La suppression efface tout son historique de
mesures et n'est la que pour les saisies erronees.

## Langues

L'interface existe en francais et en anglais. Sont traduits : les menus, les
ecrans, les tableaux, les graphiques, les libelles de metriques, ainsi que les
noms, descriptions, protocoles et champs de saisie des tests.

Le contenu du moteur de recommandations reste en francais pour l'instant.

Le choix se fait depuis la barre laterale ou depuis les parametres. Il est
enregistre dans le profil de l'utilisateur, donc conserve d'un appareil a
l'autre. Un choix fait sur l'ecran de connexion l'emporte sur la preference
enregistree et met celle ci a jour : c'est le geste le plus recent qui gagne.

Les nombres et les dates suivent la langue active, `fr-FR` ou `en-GB`.

Toutes les chaines vivent dans un fichier unique, `src/lib/i18n/dictionary.ts`,
avec les deux langues cote a cote. Les cles sont typees : une cle inexistante ou
une traduction oubliee arrete la compilation au lieu d'afficher un texte brut en
production.

## Application Android

L'APK est une coque native produite par Capacitor. L'application etant rendue
cote serveur, il n'y a rien a embarquer : la coque se connecte a l'adresse de
production. **Une mise a jour de l'application ne demande donc jamais de
redistribuer l'APK**, ce qui compte quand des clubs l'ont deja installe.

Ce que la coque apporte par rapport a un simple raccourci navigateur : icone et
nom dans le tiroir d'applications, ecran de demarrage, barre d'etat aux couleurs
de la marque, bouton retour materiel qui remonte dans l'historique, et un ecran
propre quand le serveur est injoignable au lieu du message d'erreur brut de
Chrome.

### Produire l'APK

```bash
npm run android:apk -- --url https://prepa.mondomaine.com
```

Le fichier atterrit dans `dist-apk/`. C'est un APK de debogage : il s'installe
directement sur un telephone, sans signature a preparer, ce qui suffit pour une
distribution en direct aux clubs.

### Version signee

Un APK de debogage est marque `debuggable` : n'importe qui peut y attacher un
debogueur. C'est sans consequence pour un essai, mais pas pour une application
distribuee a des clubs qui y saisissent des donnees de sante.

Creer la cle de signature, une seule fois :

```bash
npm run android:keystore
```

Le mot de passe est demande a l'ecran et n'est enregistre nulle part. **Le noter
dans un gestionnaire de mots de passe et copier `android/release.jks` hors de la
machine** : Android considere qu'une application signee avec une autre cle est
une autre application, donc perdre cette cle oblige tous les clubs a desinstaller
puis reinstaller pour recevoir la moindre mise a jour.

Compiler ensuite :

```bash
ANDROID_KEYSTORE_PASSWORD=... npm run android:apk -- --url https://lamsaa.ma --release
```

Sous PowerShell :

```bash
$env:ANDROID_KEYSTORE_PASSWORD="..."; npm run android:apk -- --url https://lamsaa.ma --release
```

### Tester sur un telephone avant deploiement

Le telephone doit etre sur le meme reseau Wi-Fi que la machine de developpement :

```bash
npm run dev
npm run android:apk -- --url http://192.168.1.20:3200
```

Remplacer par l'adresse locale de la machine. Le trafic en clair n'est autorise
que pour une adresse `http://`, jamais en production : la commande refuse de
construire une version `--release` sur une adresse non chiffree.

### Changer l'adresse, l'icone ou le nom

L'adresse du serveur est gravee a la compilation, il suffit de reconstruire avec
une autre valeur de `--url`.

Les icones et les ecrans de demarrage sont dessines par un script, pas stockes
en binaire : changer la couleur de marque dans
`scripts/generate-android-assets.py` puis relancer

```bash
npm run android:assets && npm run android:sync
```

L'identifiant de l'application, `ma.lamsaa.prepaphysique`, est defini dans
`capacitor.config.ts`. **Il ne doit plus changer une fois l'APK distribue** :
Android considere un identifiant different comme une autre application, et les
clubs se retrouveraient avec deux icones au lieu d'une mise a jour.

### Chaine de compilation

JDK 17, Gradle et le SDK Android 35. Capacitor est volontairement en version 6 :
la version 7 exige le JDK 21, absent de la machine de developpement. Pour passer
a Capacitor 7 plus tard, installer le JDK 21 puis relever les versions des
paquets `@capacitor/*`.

## Deux points de methode importants

### Declenchement du chronometre sur le sprint

Le profil force vitesse exige que l'instant zero corresponde au premier mouvement
du coureur. Or les cellules photoelectriques se declenchent au passage du faisceau,
alors que le joueur est deja lance. Sans correction, le modele conclut a une
acceleration initiale irrealiste et surestime F0 de pres du double.

L'application demande donc explicitement le mode de declenchement et applique la
correction correspondante : 0.37 seconde pour un depart 0.5 metre en arriere,
0.45 seconde pour un metre, aucune correction pour une mesure video ou radar.

Reference : Haugen T, Buchheit M (2016), Sports Medicine 46:641-656.

### Asymetries lues par seuil, pas par percentile

Les indices d'asymetrie sont bornes a zero et leur distribution est fortement
dissymetrique. Leur appliquer un z score gaussien produirait des percentiles
trompeurs. L'application les lit donc par seuil publie : vigilance a 10%, alerte a
15%. La litterature raisonne de la meme facon.

---

## Verification des calculs

Deux scripts controlent que les sorties restent coherentes avec la litterature.

```bash
npm run verify:science
```

Compare les calculs a des cas de reference publies : profil force vitesse, detente,
indice de force reactive, VO2max par trois methodes, force Nordic, maximum estime,
deficit de changement de direction, masse grasse, maturation, ratio de charge et
percentiles. Chaque valeur doit tomber dans l'intervalle publie.

```bash
npm run verify:norms
```

Analyse la distribution des percentiles sur les donnees reellement presentes en
base. Une metrique dont tous les joueurs se retrouvent aux extremes signale une
norme mal calibree ou une unite incoherente. A relancer apres toute modification
des valeurs de reference.

---

## Production : Supabase et AWS Lightsail

La base est hebergee chez Supabase, l'application tourne sur une instance
Lightsail derriere un reverse proxy Caddy qui obtient et renouvelle seul le
certificat TLS.

### 1. Basculer le connecteur

```bash
npm run db:postgres
```

### 2. Renseigner le fichier .env

```
DATABASE_URL=postgresql://postgres.REF:MOTDEPASSE@aws-1-REGION.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=10&pool_timeout=20
DIRECT_URL=postgresql://postgres.REF:MOTDEPASSE@aws-1-REGION.pooler.supabase.com:5432/postgres
AUTH_SECRET=<48 caracteres aleatoires>
OWNER_EMAIL=vous@votredomaine.com
OWNER_PASSWORD=<mot de passe fort>
OWNER_NAME=Votre nom
APP_DOMAIN=prepa.votredomaine.com
```

Les deux adresses se trouvent dans Supabase, Project Settings puis Database.
Le port 6543 est le pooler en mode transaction, utilise par l'application.
Le port 5432 est le pooler en mode session, utilise par `prisma db push`, car le
mode transaction ne gere pas les instructions de schema.

Generer la cle de session :

```bash
openssl rand -base64 48
```

#### Quatre pieges qui empechent la connexion

**Encoder le mot de passe.** Un `@` devient `%40`, un `$` devient `%24`. Sans
cela le `@` coupe l'adresse en deux, et le `$` est interprete comme une variable
par le chargeur de fichiers `.env`. Les crochets affiches par Supabase autour du
mot de passe sont un gabarit, ils ne font pas partie de la valeur.

**Ne pas utiliser `db.<ref>.supabase.co`.** Cette adresse directe n'est plus
publiee qu'en IPv6. Depuis un reseau IPv4 elle est simplement injoignable, et
l'erreur ne le dit pas clairement. Le pooler, lui, repond en IPv4.

**Le prefixe de l'hote est `aws-0` ou `aws-1`** selon le projet, ce n'est pas
devinable. En cas d'erreur, le pooler repond
`Tenant or user not found` : c'est le signe que le prefixe ou la region est faux.

**Mettre `connection_limit` a 10, pas a 1.** La valeur 1 est celle recommandee
pour du serverless, ou chaque invocation est isolee. Ici le serveur est
persistant et lance plusieurs requetes en parallele pour remplir les differentes
zones d'une meme page : avec une seule connexion, elles s'attendent et le pool
expire au bout de dix secondes.

### 3. Preparer l'instance Lightsail

Choisir une instance Ubuntu, au minimum 1 Go de memoire, dans la region la plus
proche de celle du projet Supabase. Attacher une adresse IP statique et faire
pointer l'enregistrement DNS de `APP_DOMAIN` vers cette adresse.

Dans le pare feu de l'instance, ouvrir les ports 80 et 443.

Puis installer Docker :

```bash
curl -fsSL https://get.docker.com | sudo sh && sudo usermod -aG docker $USER
```

### 4. Deployer

```bash
docker compose up -d --build
docker compose exec app npx prisma db push
docker compose exec app npx tsx prisma/seed.ts
```

Le `db push` cree les tables dans Supabase, le seed cree le compte proprietaire
et les donnees de demonstration. Le seed vide les tables avant d'ecrire, il ne
doit donc etre lance qu'une seule fois, au premier deploiement.

### 5. Mises a jour

Sur l'instance Lightsail :

```bash
git pull && docker compose up -d --build
```

Si le schema a change :

```bash
docker compose run --rm tools npx prisma db push
```

L'application est servie par le serveur, donc **une mise a jour ne demande pas
de redistribuer l'APK** : les telephones qui l'ont installe reçoivent la
nouvelle version au rechargement. L'APK n'est a reconstruire que si l'adresse du
serveur, l'icone ou le nom de l'application changent.

### Creer le compte proprietaire sans effacer les donnees

Le seed vide les tables avant d'ecrire, il ne doit donc jamais etre relance sur
une base en service. Pour creer ou reinitialiser le compte proprietaire a partir
du `.env` :

```bash
docker compose run --rm tools npx tsx scripts/ensure-owner.ts
```

### Sauvegarde

Supabase fait des sauvegardes automatiques quotidiennes. Pour garder une copie
hors de Supabase :

```bash
pg_dump "$DIRECT_URL" | gzip > prepa-$(date +%F).sql.gz
```

### Region et latence

Le chargement progressif masque la latence, il ne la supprime pas.

Mesure depuis un poste au Maroc vers le projet Supabase a Paris : **363
millisecondes par requete**. Une page qui en fait cinq passe donc pres de deux
secondes a attendre le reseau, sans qu'aucun calcul soit en cause.

Placer l'instance Lightsail dans la meme region que le projet Supabase ramene
cette latence a quelques millisecondes. C'est de loin l'optimisation la plus
rentable du deploiement, et elle ne coute rien : il suffit de choisir la bonne
region a la creation de l'instance.

Pour retrouver la region d'un projet Supabase, elle est affichee dans Project
Settings, et se lit aussi dans l'adresse du pooler.

---

## Structure du projet

```
Dockerfile                 image de production, sortie autonome
docker-compose.yml         application et reverse proxy, base externe
Caddyfile                  TLS automatique, streaming non mis en tampon
capacitor.config.ts        coque Android : adresse du serveur, splash, icone
www/offline.html           ecran affiche quand le serveur est injoignable
android/                   projet natif genere, versionne pour ses reglages
prisma/
  schema.prisma            schema unique, compatible SQLite et PostgreSQL
  seed.ts                  jeu de demonstration coherent avec les normes
scripts/
  verify-science.ts        controle des calculs contre la litterature
  check-percentiles.ts     controle du calibrage des normes
  check-connection.ts      test de connexion et latence de la base
  ensure-owner.ts          cree le compte proprietaire sans toucher aux donnees
  inspect-session.ts       inspection d'une passation
  set-db-provider.mjs      bascule SQLite vers PostgreSQL
  generate-android-assets.py  dessine icones et ecrans de demarrage
  build-apk.mjs            produit l'APK pour une adresse donnee
src/
  lib/sports-science/      coeur scientifique, aucune dependance a la base
    sprint.ts              profil force vitesse (Samozino)
    jump.ts                detente, RSI, asymetries, fatigue neuromusculaire
    strength.ts            Nordic, adducteurs, IMTP, maximum estime, charge vitesse
    endurance.ts           Yo-Yo, 30-15, VMA, Bronco, sprints repetes, TRIMP
    agility.ts             505, deficit de changement de direction, Illinois, test en T
    anthropometry.ts       composition corporelle, maturation biologique
    load.ts                sRPE, ratio aigu sur chronique, bien etre, variabilite cardiaque
    stats.ts               outils statistiques communs
    norms.ts               valeurs de reference et seuils
    recommendations.ts     moteur de regles
    catalog/               definition des tests et des batteries
  lib/auth.ts              sessions, roles, isolation des donnees, audit
  lib/queries.ts           acces aux donnees, requetes legeres et lourdes separees
  lib/i18n/
    dictionary.ts          toutes les chaines, francais et anglais cote a cote
    server.ts              langue et traducteur pour les composants serveur
    client.tsx             meme chose pour les composants client
  middleware.ts            filtre d'acces sans requete a la base
  app/                     pages et actions serveur
    */loading.tsx          reponse immediate a la navigation
  components/
    ui/skeleton.tsx        squelettes dimensionnes au contenu remplace
    shell/route-progress   barre de progression de navigation
```

Le dossier `sports-science` ne connait ni la base de donnees ni React. Il est
testable et reutilisable tel quel.

---

## Notes

Les valeurs de reference sont des reperes de population issus de travaux publies.
Elles servent a situer un joueur, pas a fixer un objectif individuel. La
comparaison la plus fiable reste l'evolution du joueur par rapport a ses propres
mesures anterieures, ce que l'application met en avant sur chaque fiche.

Le referentiel accessible depuis l'application liste, pour chaque test, son
protocole, son materiel, sa duree, ses champs de saisie et sa source, ainsi que
l'integralite des valeurs de reference utilisees.
