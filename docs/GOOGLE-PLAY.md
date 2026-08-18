# Publier l'application sur Google Play

Tout ce que je pouvais preparer est fait. Ce document couvre ce que seul le titulaire du compte peut faire, dans l'ordre, avec les pieges qui font perdre des semaines.

**Compter six a huit semaines** entre l'ouverture du compte et la disponibilite publique, dont quatorze jours incompressibles de test ferme. Ce n'est pas une estimation prudente, c'est la regle de Google pour un compte personnel.

---

## 1. Ouvrir le compte developpeur

Sur [play.google.com/console](https://play.google.com/console). Vingt cinq dollars, une seule fois.

**La decision qui engage tout le reste : personnel ou organisation.**

| | Personnel | Organisation |
|---|---|---|
| Verification | piece d'identite | piece d'identite plus preuve d'existence de l'entreprise, numero D-U-N-S |
| Delai de verification | quelques jours | deux a quatre semaines |
| Test ferme obligatoire | **oui, 12 testeurs pendant 14 jours** | non |
| Nom affiche sur la fiche | votre nom | la raison sociale |

Pour un produit vendu a des clubs, le compte organisation est le bon choix : un preparateur qui voit le nom d'un particulier sous une application qui manipule les donnees de sante de ses joueurs se pose des questions legitimes. Le numero D-U-N-S est gratuit et prend une a deux semaines.

Si le compte personnel est retenu, il faut douze vrais comptes Google inscrits au test ferme, qui installent et gardent l'application quatorze jours consecutifs. Le compteur repart de zero si l'on tombe sous douze.

---

## 2. Ce qui doit etre vrai avant de televerser

Ces trois points sont a regler dans le `.env` du serveur, pas dans l'application.

- `COMPANY_LEGAL_NAME`, `COMPANY_ADDRESS`, `COMPANY_REGISTRATION`, `COMPANY_PHONE`. La page de confidentialite doit nommer le responsable du traitement. Une page qui affiche « a completer » fait rejeter la fiche.
- Le site doit repondre en HTTPS sur `https://lamsaa.ma`. Google verifie l'adresse de la politique de confidentialite depuis ses serveurs.
- `https://lamsaa.ma/legal/confidentialite` doit etre atteignable sans connexion. C'est l'adresse a coller dans la console.

---

## 3. Preparer la compilation

```bash
npm install -g eas-cli
cd mobile
npm install
npx expo install --fix
eas login
eas init
```

**`eas-cli` s'installe globalement, il ne s'appelle pas par `npx eas`.** Le paquet
publie s'appelle `eas-cli` et fournit un executable nomme `eas` : `npx eas`
cherche donc un paquet inexistant et repond `could not determine executable to
run`. La forme `npx eas-cli@latest login` fonctionne aussi, mais retelecharge
l'outil a chaque appel.

`eas init` inscrit l'identifiant du projet dans `app.json`, a la place de `a-renseigner-par-eas-init`.

**La cle de signature.** Laissez EAS la creer et la conserver : `eas build` la propose au premier lancement, repondez oui. C'est le choix sur. Une cle perdue interdit definitivement toute mise a jour de l'application, et la seule issue est de republier sous un autre identifiant en perdant les installations et les avis. Si vous preferez la garder vous meme, exportez la avec `eas credentials` et rangez la ailleurs que sur cette machine.

Compilation d'essai, puis celle du magasin :

```bash
eas build --profile preview --platform android   # APK installable directement, pour verifier
eas build --profile production --platform android # AAB signe, le format attendu par Google Play
```

---

## 4. L'identifiant de l'application

`ma.lamsaa.prepaphysique`, deja inscrit dans `app.json`.

**Il est definitif.** Le changer apres publication cree une application differente, sans mise a jour possible pour ceux qui ont l'ancienne.

**Attention si l'APK Capacitor a ete distribue.** L'ancienne coque porte le meme identifiant mais une autre cle de signature. Un telephone qui l'a installee refusera la nouvelle version avec une erreur peu explicite. Il faut desinstaller l'ancienne d'abord. Prevenez les quelques personnes concernees avant la sortie.

---

## 5. Declaration de securite des donnees

C'est la section la plus surveillee, et celle ou une reponse fausse coute une suspension. Voici ce que l'application fait reellement.

| Donnee | Collectee | Partagee | Chiffree en transit | Suppression possible | Finalite |
|---|---|---|---|---|---|
| Adresse de courriel | oui | non | oui | oui | connexion au compte |
| Nom | oui | non | oui | oui | affichage et journal |
| Informations de sante et de forme | oui | non | oui | oui | fonctionnalite de l'application |
| Identifiants d'appareil | non | non | | | |
| Position | non | non | | | |
| Contacts, photos, fichiers | non | non | | | |
| Historique de navigation | non | non | | | |

Reponses aux questions de la console :

- Les donnees sont elles chiffrees en transit ? **Oui.**
- L'utilisateur peut il demander la suppression ? **Oui**, par courriel a `contact@lamsaa.ma`, et l'export est disponible depuis le compte.
- Les donnees sont elles requises ou facultatives ? **Requises**, l'application ne fonctionne pas sans compte.
- Y a t il de la publicite ? **Non.**
- Utilisez vous les donnees pour du suivi publicitaire ? **Non.**

**Le point delicat : les informations de sante.** Les resultats de tests physiques, les mesures corporelles et l'historique de blessures entrent dans la categorie « sante et forme ». Ne pas les declarer est le motif de suspension le plus frequent pour ce type d'application. Elles sont declarees.

---

## 6. Classification du contenu et public vise

Questionnaire de classification : repondre non a tout, l'application ne contient ni violence, ni contenu sexuel, ni jeu d'argent, ni interaction entre utilisateurs. Elle obtient la classification tous publics.

**Public vise : adultes uniquement, dix huit ans et plus.**

C'est le point que la plupart des editeurs manquent. L'application enregistre des donnees sur des joueurs mineurs, mais ses **utilisateurs** sont des preparateurs physiques adultes. Un mineur ne cree jamais de compte et n'installe jamais l'application.

Declarer un public incluant les enfants ferait entrer l'application dans le programme Famille, avec ses obligations propres, alors qu'elle n'y a pas sa place. Declarer dix huit ans et plus est exact et evite ce piege.

En revanche, la fiche et la politique de confidentialite doivent dire clairement que le club est responsable du recueil de l'autorisation des representants legaux. C'est deja ecrit dans `/legal/confidentialite`.

---

## 7. Fiche du magasin

**Nom** : `Lamsaa` (30 caracteres maximum)

**Description courte** (80 caracteres maximum)

- Francais : `Tests physiques, profils joueurs et suivi de charge, meme sans reseau.`
- Anglais : `Physical testing, player profiles and load monitoring, even offline.`

**Description longue** (4000 caracteres maximum)

Version francaise :

```
Lamsaa est la plateforme de preparation physique des clubs de football.

Vingt deux tests de terrain, chacun avec son protocole et sa reference
scientifique. Sprint et profil force vitesse, detente, force isometrique,
endurance intermittente, changement de direction, anthropometrie et maturite.

CONCU POUR LE TERRAIN
La saisie tient dans une main, l'autre tenant le chronometre. L'application
fonctionne sans reseau : vos mesures sont conservees sur le telephone et
partent seules des que la connexion revient. Rien n'est perdu dans un stade
sans couverture.

RIEN N'EST ESTIME A L'OEIL
Chaque calcul porte le nom de la publication dont il vient. Les normes
proviennent d'etudes publiees sur des populations de football, par age et par
niveau. Vous pouvez retrouver la source et contester le resultat.

POUR TOUT LE STAFF
Chaque preparateur accede aux equipes qui lui sont rattachees, et a elles
seules. Les donnees restent celles du club, exportables a tout moment.

DEUX LANGUES
Interface et protocoles en francais et en anglais.

Un compte Lamsaa est necessaire. Les tarifs et les conditions sont sur
lamsaa.ma.

Lamsaa est un outil d'aide a la decision destine a des professionnels
qualifies. Il ne remplace ni un diagnostic ni un avis medical.
```

Version anglaise : meme structure, traduite.

**Elements graphiques**, tous produits par `npm run assets` dans `mobile/` :

| Element | Taille | Fichier |
|---|---|---|
| Icone | 512 x 512 | `mobile/assets/icon.png`, a redimensionner |
| Bandeau | 1024 x 500 | `mobile/assets/play-feature-graphic.png` |
| Captures telephone | 2 minimum, 8 maximum | a faire depuis l'application |

**Les captures restent a produire.** Il faut un telephone reel ou un emulateur, avec des donnees credibles. Les quatre qui comptent : la connexion, le tableau de bord, l'effectif d'une equipe, et la grille de saisie d'un test. La quatrieme est celle qui vend le produit, c'est elle qui montre ce que fait l'application.

---

## 8. Ordre de publication

1. Creer l'application dans la console, remplir la fiche.
2. Televerser l'AAB en **test interne**. Disponible en quelques minutes, jusqu'a cent testeurs, sans validation.
3. Verifier sur un vrai telephone : connexion, synchronisation, mode avion, saisie hors reseau, retour du reseau.
4. Passer en **test ferme** si le compte est personnel. Douze testeurs, quatorze jours.
5. Demander la validation pour la production. Compter trois a sept jours, davantage au premier envoi.

**Ne sautez pas l'etape 3.** Une application qui perd une saisie hors reseau se decouvre sur un terrain, pas dans une console.

---

## 9. Ce qui reste a verifier sur un vrai telephone

Je n'ai pas pu executer l'application : cette machine n'a ni emulateur Android ni telephone connecte. Le code compile et suit les regles de la plateforme, mais ces sept points demandent un appareil.

- [ ] Le logo se trace au lancement, puis l'ecran de connexion apparait.
- [ ] La connexion fonctionne et remplit la base locale.
- [ ] En mode avion, l'application s'ouvre sur ses donnees et affiche « hors ligne ».
- [ ] Une saisie faite en mode avion est conservee apres redemarrage de l'application.
- [ ] Au retour du reseau, la saisie part seule et le compteur d'attente revient a zero.
- [ ] La saisie apparait sur le site web, avec ses valeurs calculees.
- [ ] La deconnexion efface bien les donnees locales.

Le cinquieme et le sixieme sont les seuls qui comptent vraiment : ce sont eux qui prouvent que le hors ligne tient.
