# Lamsaa mobile

Application Android de terrain, en React Native avec Expo. Elle fonctionne sans reseau et renvoie les saisies des que la connexion revient.

## Demarrer

```bash
cd mobile
npm install
npx expo install --fix
npm start
```

**`npx expo install --fix` n'est pas optionnel.** Les versions des modules Expo inscrites dans `package.json` sont des estimations ecrites sans acces au registre. Cette commande les remplace par celles que le SDK 57 attend reellement. La sauter donne des erreurs natives incomprehensibles a la compilation.

Ensuite, `npm start` affiche un code a scanner avec Expo Go. Pour un vrai essai, il faut une compilation de developpement : Expo Go n'embarque pas `expo-sqlite` ni `expo-secure-store`.

```bash
npx eas build --profile development --platform android
```

## Ou pointe l'application

`app.json`, cle `extra.apiBaseUrl`. Elle vaut `https://lamsaa.ma`.

Pour travailler contre un serveur local, mettez l'adresse IP de la machine sur le reseau local, jamais `localhost` : sur un telephone, `localhost` designe le telephone.

```json
"extra": { "apiBaseUrl": "http://192.168.1.42:3000" }
```

## Comment c'est construit

```
app/                 ecrans, routage par le systeme de fichiers d'Expo Router
  index.tsx          connexion, premier ecran
  (app)/             onglets : tableau de bord, equipes, reglages
  team/[teamId]      effectif
  session/           creation et saisie d'une passation
  player/[playerId]  fiche joueur
src/api/client.ts    appels HTTP, codes d'erreur, delai maximal
src/db/              base SQLite locale et lectures
src/sync/engine.ts   descente, remontee, file d'attente
src/state/session.tsx  session, reseau, orchestration
```

### Le principe qui explique tout le reste

**Aucun ecran n'appelle le reseau pour s'afficher.** Tous lisent la base SQLite locale. La synchronisation la met a jour en arriere plan. C'est ce qui rend l'application instantanee, et utilisable dans un stade sans couverture.

Une saisie suit toujours le meme chemin :

1. Elle est ecrite dans la base locale, immediatement.
2. Une operation est deposee dans la file d'attente, avec un identifiant genere sur le telephone.
3. Au retour du reseau, la file part vers `POST /api/sync`.
4. Le serveur calcule les metriques et les renvoie a la descente suivante.

L'identifiant genere localement rend la remontee idempotente : le serveur ecrit par `upsert`, donc un envoi rejoue apres une coupure produit le meme etat, jamais un doublon.

### Ce que le telephone ne calcule pas

Les formules scientifiques restent sur le serveur. Le telephone enregistre des valeurs brutes, ce qui est exactement ce que le preparateur mesure, et recoit les valeurs calculees a la synchronisation.

C'est un choix, pas une limite technique : dupliquer le moteur de calcul creerait deux verites dans la meme base le jour ou une formule est corrigee d'un seul cote. Le prix a payer est qu'une detente saisie hors reseau n'affiche sa puissance relative qu'apres la synchronisation.

## Regenerer les icones

```bash
npm run assets
```

Tout est dessine par code dans `scripts/generate-assets.py`, y compris le bandeau de la fiche Google Play. Changer le bleu de la marque a un seul endroit suffit a tout regenerer.

## Verifier

```bash
npm run typecheck
npm run doctor
```

`expo-doctor` verifie la coherence des versions natives, ce que `typecheck` ne voit pas.

## Publier

Voir `docs/GOOGLE-PLAY.md` a la racine du depot. Il couvre le compte developpeur, la declaration de securite des donnees, le public vise et l'ordre des etapes.

## Etat

Le code compile et suit les regles de la plateforme, mais **il n'a jamais tourne sur un appareil** : la machine de developpement n'a ni emulateur Android ni telephone connecte. La liste des sept points a verifier sur un vrai telephone est a la fin de `docs/GOOGLE-PLAY.md`.
