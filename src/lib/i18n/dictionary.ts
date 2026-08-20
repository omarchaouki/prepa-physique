/**
 * Dictionnaire de l'interface.
 *
 * Une seule source pour les deux langues : chaque cle porte sa version francaise
 * et sa version anglaise cote a cote, ce qui rend une traduction manquante
 * impossible a rater lors d'une relecture.
 *
 * Ne figurent ici que les textes de l'interface. Les noms, descriptions et
 * protocoles des tests vivent dans le catalogue scientifique, qui porte deja ses
 * propres champs fr et en.
 */

export type Locale = "fr" | "en";

export const LOCALES: Locale[] = ["fr", "en"];

export const LOCALE_LABELS: Record<Locale, string> = {
  fr: "Francais",
  en: "English",
};

type Entry = readonly [fr: string, en: string];

export const MESSAGES = {
  // --- Commun ---------------------------------------------------------------
  "common.save": ["Enregistrer", "Save"],
  "common.cancel": ["Annuler", "Cancel"],
  "common.create": ["Créer", "Create"],
  "common.edit": ["Modifier", "Edit"],
  "common.delete": ["Supprimer", "Delete"],
  "common.search": ["Rechercher", "Search"],
  "common.back": ["Retour", "Back"],
  "common.loading": ["Chargement", "Loading"],
  "common.saving": ["Enregistrement", "Saving"],
  "common.none": ["Aucun", "None"],
  "common.all": ["Tous", "All"],
  "common.yes": ["oui", "yes"],
  "common.no": ["non", "no"],
  "common.date": ["Date", "Date"],
  "common.name": ["Nom", "Name"],
  "common.firstName": ["Prénom", "First name"],
  "common.lastName": ["Nom", "Last name"],
  "common.birthDate": ["Date de naissance", "Date of birth"],
  "common.notes": ["Notes", "Notes"],
  "common.status": ["Statut", "Status"],
  "common.actions": ["Actions", "Actions"],
  "common.source": ["Source", "Source"],
  "common.value": ["Valeur", "Value"],
  "common.unit": ["Unité", "Unit"],
  "common.years": ["ans", "years"],
  "common.days": ["j", "d"],
  "common.players": ["joueurs", "players"],
  "common.player": ["joueur", "player"],
  "common.viewAll": ["Tout voir", "View all"],
  "common.required": ["obligatoire", "required"],
  "common.optional": ["optionnel", "optional"],
  "common.noData": ["Aucune donnée", "No data"],
  "common.notMeasured": ["non mesure", "not measured"],
  "common.never": ["jamais", "never"],
  "common.of": ["sur", "of"],
  "common.min": ["min", "min"],

  // --- Navigation -----------------------------------------------------------
  "nav.dashboard": ["Tableau de bord", "Dashboard"],
  "nav.teams": ["Équipes", "Teams"],
  "nav.players": ["Joueurs", "Players"],
  "nav.sessions": ["Passations", "Test sessions"],
  "nav.analytics": ["Analyses", "Analytics"],
  "nav.reference": ["Référentiel des tests", "Test reference"],
  "nav.settings": ["Paramètres", "Settings"],
  "nav.evaluation": ["Évaluation", "Assessment"],
  "nav.account": ["Compte", "Account"],
  "nav.owner": ["Propriétaire", "Owner"],
  "nav.adminPanel": ["Panel administrateur", "Administrator panel"],
  "nav.overview": ["Vue globale", "Overview"],
  "nav.management": ["Gestion", "Management"],
  "nav.organizations": ["Clubs", "Clubs"],
  "nav.users": ["Utilisateurs", "Users"],
  "nav.audit": ["Journal d'audit", "Audit log"],
  "nav.tracking": ["Mesure d'audience", "Tracking"],
  "nav.application": ["Application", "Application"],
  "nav.teamSpace": ["Espace équipes", "Team workspace"],
  "nav.open": ["Ouvrir la navigation", "Open navigation"],
  "nav.close": ["Fermer la navigation", "Close navigation"],
  "nav.main": ["Navigation principale", "Main navigation"],

  // --- Connexion ------------------------------------------------------------
  "login.title": ["Connexion", "Sign in"],
  "login.subtitle": ["Accédez à l'espace de votre équipe.", "Access your team workspace."],
  "login.email": ["Adresse email", "Email address"],
  "login.password": ["Mot de passe", "Password"],
  "login.submit": ["Se connecter", "Sign in"],
  "login.pending": ["Connexion en cours", "Signing in"],
  "login.showPassword": ["Afficher le mot de passe", "Show password"],
  "login.hidePassword": ["Masquer le mot de passe", "Hide password"],
  "login.demoAccounts": ["Comptes de démonstration", "Demo accounts"],
  "login.signOut": ["Déconnexion", "Sign out"],
  "login.signOutAction": ["Se déconnecter", "Sign out"],
  "login.heroTitle": [
    "La préparation physique du football, appuyée sur les données.",
    "Football physical preparation, driven by data.",
  ],
  "login.heroBody": [
    "Batterie de tests complete, calculs automatiques issus de la littérature scientifique, profils individuels comparés aux normes de la population, détection des asymétries et recommandations de programmation.",
    "Complete test battery, automatic calculations drawn from the scientific literature, individual profiles compared with population norms, asymmetry detection and programming recommendations.",
  ],
  "login.heroPoint1": [
    "Profil force vitesse horizontal par la méthode de Samozino",
    "Horizontal force velocity profile using the Samozino method",
  ],
  "login.heroPoint2": [
    "Dépistage du risque lésionnel : Nordic, adducteurs, asymétries",
    "Injury risk screening: Nordic, adductors, asymmetries",
  ],
  "login.heroPoint3": [
    "Capacité intermittente et vitesses de prescription individualisées",
    "Intermittent capacity and individualised prescription speeds",
  ],
  "login.heroPoint4": [
    "Maturation biologique et adaptation de la charge chez les jeunes",
    "Biological maturation and load adjustment in youth players",
  ],
  // Points de l'ecran de connexion, version courte.
  //
  // Les quatre precedents etaient des phrases techniques de dix mots, portees
  // par des puces rondes. Sur un ecran dont le seul but est de faire entrer
  // quelqu'un qui possede deja un compte, ce texte n'etait lu par personne.
  // Trois groupes nominaux, un pictogramme chacun, se lisent d'un coup d'oeil.
  "login.pointSpeed": ["Profil force vitesse", "Force velocity profile"],
  "login.pointRisk": ["Dépistage du risque lésionnel", "Injury risk screening"],
  "login.pointNorms": ["Percentiles sur normes publiées", "Percentiles on published norms"],
  "login.heroFooter": [
    "Les valeurs de référence proviennent de travaux publiés. Chaque calcul cité sa source dans le référentiel de l'application.",
    "Reference values come from published research. Every calculation cites its source in the application reference section.",
  ],
  "login.errorGeneric": [
    "Adresse email ou mot de passe incorrect.",
    "Incorrect email address or password.",
  ],
  "login.errorDisabled": [
    "Ce compte est désactivé. Contacter l'administrateur.",
    "This account is disabled. Contact your administrator.",
  ],
  "login.errorSuspended": [
    "L'accès de votre club est suspendu. Contacter l'administrateur.",
    "Your club's access is suspended. Contact your administrator.",
  ],

  // --- Tableau de bord ------------------------------------------------------
  "dashboard.greeting": ["Bonjour", "Hello"],
  "dashboard.subtitle": [
    "Vue d'ensemble de vos équipes, des dernières passations et des joueurs à surveiller.",
    "Overview of your teams, recent test sessions and players to watch.",
  ],
  "dashboard.newSession": ["Nouvelle passation", "New test session"],
  "dashboard.statTeams": ["Équipes", "Teams"],
  "dashboard.statTeamsHintOne": ["suivie", "tracked"],
  "dashboard.statTeamsHintMany": ["suivies", "tracked"],
  "dashboard.statPlayers": ["Joueurs", "Players"],
  "dashboard.statPlayersHint": ["indisponibles", "unavailable"],
  "dashboard.statSessions": ["Passations", "Sessions"],
  "dashboard.statSessionsHint": ["depuis le début", "since the start"],
  "dashboard.statLastTest": ["Dernier test", "Last test"],
  "dashboard.statLastTestNone": ["aucune donnée", "no data"],
  "dashboard.watchlist": ["Joueurs à surveiller", "Players to watch"],
  "dashboard.watchlistSubtitle": [
    "Classes par gravité des alertes issues des dernières mesures",
    "Ranked by severity of the alerts from the latest measurements",
  ],
  "dashboard.noAlerts": ["Aucune alerte active", "No active alerts"],
  "dashboard.noAlertsBody": [
    "Aucun joueur ne dépasse les seuils de vigilance sur les tests enregistrés.",
    "No player exceeds the warning thresholds on the recorded tests.",
  ],
  "dashboard.recentSessions": ["Dernières passations", "Recent sessions"],
  "dashboard.recentSessionsSubtitle": ["Les cinq plus récentes", "The five most recent"],
  "dashboard.noSessions": ["Aucune passation", "No test session"],
  "dashboard.noSessionsBody": [
    "Commencez par créer une session de tests.",
    "Start by creating a test session.",
  ],
  "dashboard.createSession": ["Créer une passation", "Create a session"],
  "dashboard.yourTeams": ["Vos équipes", "Your teams"],
  "dashboard.yourTeamsSubtitle": [
    "Accès direct à l'effectif et aux analyses",
    "Direct access to the squad and analytics",
  ],
  "dashboard.noTeams": ["Aucune équipe", "No team"],
  "dashboard.noTeamsBody": [
    "Votre administrateur doit vous rattacher à une équipe pour commencer.",
    "Your administrator needs to assign you to a team to get started.",
  ],
  "dashboard.criticalOne": ["critique", "critical"],
  "dashboard.criticalMany": ["critiques", "critical"],
  "dashboard.alerts": ["alertes", "alerts"],
  "dashboard.results": ["résultats", "results"],
  "dashboard.sessions": ["passations", "sessions"],

  // --- Equipes --------------------------------------------------------------
  "teams.title": ["Équipes", "Teams"],
  "teams.subtitle": [
    "Chaque équipe regroupe son effectif, ses passations de tests et ses analyses.",
    "Each team holds its squad, its test sessions and its analytics.",
  ],
  "teams.none": ["Aucune équipe accessible", "No team available"],
  "teams.noneBody": [
    "Demandez à l'administrateur de votre club de vous rattacher à une équipe.",
    "Ask your club administrator to assign you to a team.",
  ],
  "teams.season": ["Saison", "Season"],
  "teams.squad": ["Effectif", "Squad"],
  "teams.squadSubtitle": [
    "Dernières valeurs mesurées, comparées à la population de référence",
    "Latest measured values, compared with the reference population",
  ],
  "teams.referencePopulation": ["population de référence", "reference population"],
  "teams.analytics": ["Analyses", "Analytics"],
  "teams.viewSquad": ["Voir l'effectif", "View squad"],
  "teams.statSquad": ["Effectif", "Squad size"],
  "teams.statAvailable": ["disponibles", "available"],
  "teams.statTested": ["Joueurs testés", "Players tested"],
  "teams.statAlerts": ["Alertes", "Alerts"],
  "teams.statAlertsHint": ["sur l'ensemble du groupe", "across the whole squad"],
  "teams.statCritical": ["Alertes critiques", "Critical alerts"],
  "teams.statCriticalHint": ["à traiter en priorité", "to address first"],
  "teams.noPlayers": ["Aucun joueur dans cette équipe", "No player in this team"],
  "teams.noPlayersBody": [
    "Ajoutez les joueurs avant de programmer une passation de tests.",
    "Add players before scheduling a test session.",
  ],
  "teams.noTestData": ["Aucune donnée de test", "No test data"],
  "teams.noTestDataBody": [
    "Les joueurs sont enregistrés mais aucun test n'a encore été saisi.",
    "Players are registered but no test has been entered yet.",
  ],
  "teams.groupStats": ["Statistiques du groupe", "Squad statistics"],
  "teams.groupStatsSubtitle": [
    "Moyenne, écart type et effectif mesure pour chaque qualité",
    "Mean, standard deviation and sample size for each quality",
  ],
  "teams.metric": ["Métrique", "Metric"],
  "teams.mean": ["Moyenne", "Mean"],
  "teams.sd": ["Écart type", "Standard deviation"],
  "teams.cv": ["Coefficient de variation", "Coefficient of variation"],
  "teams.measured": ["Joueurs mesures", "Players measured"],
  "teams.cvNote": [
    "Un coefficient de variation élevé signale un groupe hétérogène sur cette qualité, donc un besoin d'individualisation plus fort.",
    "A high coefficient of variation signals a heterogeneous squad on this quality, and therefore a stronger need for individualisation.",
  ],
  "teams.masculine": ["Masculin", "Men"],
  "teams.feminine": ["Féminin", "Women"],

  // --- Tableau d'effectif ---------------------------------------------------
  "squad.searchPlayer": ["Rechercher un joueur", "Search for a player"],
  "squad.filterPosition": ["Filtrer par poste", "Filter by position"],
  "squad.allPositions": ["Tous les postes", "All positions"],
  "squad.player": ["Joueur", "Player"],
  "squad.position": ["Poste", "Position"],
  "squad.age": ["Âge", "Age"],
  "squad.alerts": ["Alertes", "Alerts"],
  "squad.groupAverage": ["Moyenne du groupe", "Squad average"],
  "squad.noMatch": [
    "Aucun joueur ne correspond à cette recherche.",
    "No player matches this search.",
  ],
  "squad.caption": [
    "Effectif avec les dernières valeurs mesurées et leur percentile par rapport à la population de référence",
    "Squad with the latest measured values and their percentile against the reference population",
  ],
  "squad.legend": [
    "Le petit chiffre à côté de chaque valeur est le percentile par rapport à la population de référence, 50 correspondant à la moyenne publiée pour cette catégorie. Les indices d'asymétrie sont lus par seuil et non par percentile : leur distribution est bornée à zéro, un rang gaussien y serait trompeur. Les seuils retenus sont 10% pour la vigilance et 15% pour l'alerte.",
    "The small figure beside each value is the percentile against the reference population, where 50 is the published mean for that category. Asymmetry indices are read against thresholds rather than percentiles: their distribution is bounded at zero, so a gaussian rank would be misleading. The thresholds used are 10% for caution and 15% for alert.",
  ],
  "squad.thresholdOk": ["ok", "ok"],
  "squad.thresholdWarn": ["vig", "warn"],

  // --- Joueurs --------------------------------------------------------------
  "players.title": ["Joueurs", "Players"],
  "players.subtitle": [
    "Tous les joueurs des équipes auxquelles vous avez accès.",
    "Every player from the teams you have access to.",
  ],
  "players.none": ["Aucun joueur", "No player"],
  "players.noneBody": [
    "Les joueurs apparaîtront ici des qu'une équipe vous sera rattachee.",
    "Players will appear here once a team is assigned to you.",
  ],
  "players.team": ["Équipe", "Team"],
  "players.height": ["Taille", "Height"],
  "players.weight": ["Masse", "Body mass"],
  "players.tests": ["Tests", "Tests"],
  "players.jersey": ["Numéro", "Number"],
  "players.foot": ["Pied", "Foot"],
  "players.footLeft": ["gauche", "left"],
  "players.footRight": ["droit", "right"],
  "players.footBoth": ["des deux", "both"],

  // --- Fiche joueur ---------------------------------------------------------
  "player.profile": ["Profil physique", "Physical profile"],
  "player.profileSubtitle": [
    "Percentiles par rapport à la population de référence",
    "Percentiles against the reference population",
  ],
  "player.recommendations": ["Recommandations", "Recommendations"],
  "player.recommendationsSubtitle": [
    "Issues des dernières mesures et des seuils publiés",
    "Derived from the latest measurements and published thresholds",
  ],
  "player.noRecommendations": ["Aucune recommandation", "No recommendation"],
  "player.noRecommendationsBody": [
    "Aucun seuil n'est franchi sur les données disponibles.",
    "No threshold is crossed on the available data.",
  ],
  "player.trend": ["Évolution dans le temps", "Change over time"],
  "player.trendSubtitle": [
    "Comparee à la moyenne de la population de référence",
    "Compared with the reference population mean",
  ],
  "player.asymmetry": ["Comparaison gauche droite", "Left right comparison"],
  "player.asymmetrySubtitle": [
    "Un écart supérieur à 10 à 15% justifie un travail unilatéral",
    "A gap above 10 to 15% warrants unilateral work",
  ],
  "player.fvProfile": ["Profil force vitesse horizontal", "Horizontal force velocity profile"],
  "player.fvProfileSubtitle": [
    "Méthode de Samozino, reconstruite à partir des temps de passage",
    "Samozino method, rebuilt from the split times",
  ],
  "player.fvUnavailable": ["Profil non disponible", "Profile unavailable"],
  "player.fvUnavailableBody": [
    "Réaliser un sprint linéaire avec au moins deux temps de passage pour reconstruire le profil.",
    "Run a linear sprint with at least two split times to rebuild the profile.",
  ],
  "player.fvNote": [
    "F0 représente la force horizontale disponible au démarrage, V0 la vitesse théorique maximale. Le rapport entre les deux orienté le contenu du travail de vitesse.",
    "F0 is the horizontal force available at the start, V0 the theoretical maximum velocity. The ratio between the two guides the content of speed training.",
  ],
  "player.allMeasures": ["Toutes les mesures", "All measurements"],
  "player.allMeasuresSubtitle": [
    "Classées du percentile le plus faible au plus élevé",
    "Ordered from the lowest to the highest percentile",
  ],
  "player.history": ["Historique des passations", "Test history"],
  "player.historySubtitle": [
    "Tests enregistrés pour ce joueur",
    "Tests recorded for this player",
  ],
  "player.noTests": ["Aucun test enregistré", "No test recorded"],
  "player.change": ["Évolution", "Change"],
  "player.reference": ["Référence", "Reference"],
  "player.percentile": ["Percentile", "Percentile"],
  "player.group": ["Groupe", "Squad"],
  "player.measure": ["Mesure", "Measurement"],
  "player.left": ["Gauche", "Left"],
  "player.right": ["Droite", "Right"],
  "player.gap": ["Écart", "Gap"],
  "player.test": ["Test", "Test"],
  "player.session": ["Passation", "Session"],
  "player.standaloneEntry": ["saisie isolée", "standalone entry"],
  "player.notReferenced": ["non référence", "no reference"],
  "player.belowThreshold": ["Sous le seuil", "Below threshold"],
  "player.caution": ["Vigilance", "Caution"],
  "player.aboveThreshold": ["Au delà du seuil", "Above threshold"],
  "player.thresholdTitle": [
    "Lecture des métriques sans percentile",
    "Reading metrics without a percentile",
  ],
  "player.thresholdBody": [
    "Les indices d'asymétrie sont lus par seuil publié, pas en percentile : leur distribution est bornée à zéro et un rang gaussien y serait trompeur. Les autres mesures sans référence restent suivies dans le temps par rapport à l'historique du joueur, ce qui est de toute façon la comparaison la plus fiable.",
    "Asymmetry indices are read against published thresholds rather than percentiles: their distribution is bounded at zero and a gaussian rank would be misleading. Other unreferenced measurements are still tracked over time against the player's own history, which is the most reliable comparison anyway.",
  ],
  "player.footer": [
    "Les percentiles situent le joueur par rapport aux valeurs publiées pour sa catégorie. Ce sont des repères de population, pas des objectifs individuels. La référence la plus fiable reste l'évolution du joueur par rapport à lui même.",
    "Percentiles place the player against published values for their category. These are population landmarks, not individual targets. The most reliable reference remains the player's change against their own history.",
  ],
  "player.testNotDone": ["test non réalisé", "test not performed"],
  "player.percentileSuffix": ["e percentile", "th percentile"],
  "player.selectMetric": ["Choisir la métrique à afficher", "Choose the metric to display"],
  "player.sinceFirst": ["depuis la première mesure", "since the first measurement"],
  "player.firstMeasure": ["Première mesure", "First measurement"],
  "player.lastMeasure": ["Dernière mesure", "Latest measurement"],
  "player.measurements": ["mesures", "measurements"],
  "player.populationReference": ["Référence population", "Population reference"],
  "player.noTrend": [
    "Aucune métrique disposant d'au moins deux mesures. L'évolution apparaîtra après la deuxième passation.",
    "No metric has at least two measurements. Trends will appear after the second session.",
  ],
  "player.noBilateral": ["Aucune mesure bilatérale", "No bilateral measurement"],
  "player.dose": ["Dose", "Dose"],

  // --- Passations -----------------------------------------------------------
  "sessions.title": ["Passations", "Test sessions"],
  "sessions.subtitle": [
    "Chaque passation regroupe une date, une équipe et une ou plusieurs batteries de tests.",
    "Each session groups a date, a team and one or more test batteries.",
  ],
  "sessions.none": ["Aucune passation", "No session"],
  "sessions.noneBody": [
    "Créez une passation pour saisir les résultats de toute une équipe en une seule fois.",
    "Create a session to enter results for a whole team at once.",
  ],
  "sessions.session": ["Passation", "Session"],
  "sessions.tests": ["Tests", "Tests"],
  "sessions.results": ["Résultats", "Results"],
  "sessions.new": ["Nouvelle passation", "New session"],
  "sessions.newSubtitle": [
    "Choisissez l'équipe, la date et les tests. La grille de saisie sera construite automatiquement à partir du protocole de chaque test.",
    "Choose the team, the date and the tests. The entry grid is built automatically from each test protocol.",
  ],
  "sessions.info": ["Informations", "Details"],
  "sessions.infoSubtitle": [
    "Quand, avec quelle équipe et dans quelles conditions",
    "When, with which team and under what conditions",
  ],
  "sessions.team": ["Équipe", "Team"],
  "sessions.sessionName": ["Nom de la passation", "Session name"],
  "sessions.namePlaceholder": [
    "Bilan de reprise, contrôle mi saison, retour au jeu...",
    "Preseason assessment, mid season control, return to play...",
  ],
  "sessions.surface": ["Surface", "Surface"],
  "sessions.surfaceNone": ["Non précisée", "Not specified"],
  "sessions.surfaceGrass": ["Pelouse naturelle", "Natural grass"],
  "sessions.surfaceArtificial": ["Synthétique", "Artificial turf"],
  "sessions.surfaceIndoor": ["Salle", "Indoor"],
  "sessions.surfaceTrack": ["Piste", "Track"],
  "sessions.temperature": ["Température", "Temperature"],
  "sessions.temperatureUnit": ["degrés Celsius", "degrees Celsius"],
  "sessions.temperatureHelp": [
    "Utilisée pour corriger la densité de l'air dans le profil de sprint.",
    "Used to correct air density in the sprint profile.",
  ],
  "sessions.notesPlaceholder": [
    "Conditions, absences, remarques",
    "Conditions, absences, remarks",
  ],
  "sessions.batteries": ["Batteries prêtes à l'emploi", "Ready made batteries"],
  "sessions.batteriesSubtitle": [
    "Sélection rapide, modifiable ensuite test par test",
    "Quick selection, adjustable test by test afterwards",
  ],
  "sessions.perPlayer": ["par joueur", "per player"],
  "sessions.testsToRun": ["Tests à réaliser", "Tests to run"],
  "sessions.testsToRunSubtitle": [
    "Cocher les tests, la grille de saisie sera générée automatiquement",
    "Tick the tests, the entry grid is generated automatically",
  ],
  "sessions.clearSelection": ["Tout désélectionner", "Clear selection"],
  "sessions.createSession": ["Créer la passation", "Create session"],
  "sessions.creating": ["Création", "Creating"],
  "sessions.selectAtLeastOne": [
    "Sélectionner au moins un test",
    "Select at least one test",
  ],
  "sessions.protocolMinutes": ["minutes de protocole", "minutes of protocol"],
  "sessions.category": ["catégorie", "category"],
  "sessions.statPlayers": ["Joueurs", "Players"],
  "sessions.statPlayersHint": ["dans l'effectif", "in the squad"],
  "sessions.statTests": ["Tests", "Tests"],
  "sessions.statTestsHint": ["dans cette passation", "in this session"],
  "sessions.statEntered": ["Résultats saisis", "Results entered"],
  "sessions.statEnteredHint": ["attendus", "expected"],
  "sessions.statProgress": ["Avancement", "Completion"],
  "sessions.entry": ["Saisie des résultats", "Result entry"],
  "sessions.entrySubtitle": [
    "Un onglet par test. Les valeurs dérivées sont calculées à l'enregistrement.",
    "One tab per test. Derived values are computed on save.",
  ],
  "sessions.noPlayersBody": [
    "Aucun joueur dans cette équipe. Ajoutez l'effectif avant de saisir des résultats.",
    "No player in this team. Add the squad before entering results.",
  ],
  "sessions.notesTitle": ["Notes de la passation", "Session notes"],
  "sessions.locked": ["Passation verrouillée", "Session locked"],
  "sessions.lockedBody": [
    "Les résultats ne peuvent plus être modifiés.",
    "Results can no longer be modified.",
  ],
  "sessions.noTests": [
    "Aucun test rattaché à cette passation.",
    "No test attached to this session.",
  ],
  "sessions.tabsLabel": ["Tests de la passation", "Session tests"],

  // --- Grille de saisie -----------------------------------------------------
  "entry.protocol": ["Protocole et matériel", "Protocol and equipment"],
  "entry.protocolLabel": ["Protocole", "Protocol"],
  "entry.equipment": ["Matériel", "Equipment"],
  "entry.duration": ["Durée", "Duration"],
  "entry.durationAbout": ["environ", "about"],
  "entry.reference": ["Référence", "Reference"],
  "entry.missingContext": [
    "Données morphologiques manquantes",
    "Missing body measurements",
  ],
  "entry.missingContextBody": [
    "n'ont pas de taille ou de masse enregistrée. Les calculs qui en dépendent utiliseront une valeur par défaut, ce qui fausse le résultat. Réaliser d'abord le test d'anthropométrie.",
    "have no recorded height or body mass. Calculations that depend on them will use a default value, which distorts the result. Run the anthropometry test first.",
  ],
  "entry.missingContextOne": [
    "n'a pas de taille ou de masse enregistrée. Les calculs qui en dépendent utiliseront une valeur par défaut, ce qui fausse le résultat. Réaliser d'abord le test d'anthropométrie.",
    "has no recorded height or body mass. Calculations that depend on them will use a default value, which distorts the result. Run the anthropometry test first.",
  ],
  "entry.caption": [
    "Grille de saisie du test",
    "Entry grid for test",
  ],
  "entry.onePlayerPerRow": ["un joueur par ligne", "one player per row"],
  "entry.measures": ["Mesures", "Measurements"],
  "entry.unavailable": ["indisponible", "unavailable"],
  "entry.rowFilled": ["Ligne renseignée", "Row filled in"],
  "entry.rowEmpty": ["Ligne vide", "Empty row"],
  "entry.save": ["Enregistrer", "Save"],
  "entry.playersFilled": ["joueurs renseignés", "players filled in"],
  "entry.autosaveOn": ["Enregistrement automatique", "Autosave on"],
  "entry.autosaved": ["Enregistre à", "Saved at"],
  "entry.savedOnDevice": [
    "Conserve sur l'appareil, envoi au retour du réseau",
    "Kept on the device, sent when the network returns",
  ],

  // --- Reseau et file d'attente ---------------------------------------------
  "offline.offline": ["Hors ligne", "Offline"],
  "offline.syncing": ["Envoi des saisies", "Sending entries"],
  "offline.pendingOne": ["saisie en attente", "entry pending"],
  "offline.pendingMany": ["saisies en attente", "entries pending"],
  "offline.retry": ["Envoyer maintenant", "Send now"],
  "entry.keyboardHint": [
    "Entrée ou flèche bas pour passer au joueur suivant",
    "Enter or down arrow moves to the next player",
  ],
  "entry.flagsTitle": [
    "Points d'attention détectés automatiquement",
    "Automatically detected points of attention",
  ],

  // --- Analyses -------------------------------------------------------------
  "analytics.title": ["Analyses", "Analytics"],
  "analytics.subtitle": [
    "Comparez le groupe sur une qualité, croisez deux qualités et repérez les profils atypiques.",
    "Compare the squad on one quality, cross two qualities and spot atypical profiles.",
  ],
  "analytics.noTeam": ["Aucune équipe accessible", "No team available"],
  "analytics.noData": ["Aucune donnée à analyser", "No data to analyse"],
  "analytics.noDataBody": [
    "Réalisez une passation de tests pour alimenter les analyses.",
    "Run a test session to feed the analytics.",
  ],
  "analytics.primaryMetric": ["Métrique principale", "Primary metric"],
  "analytics.secondaryMetric": ["Métrique à croiser", "Metric to cross"],
  "analytics.position": ["Poste", "Position"],
  "analytics.allPositions": ["Tous les postes", "All positions"],
  "analytics.groupMean": ["Moyenne du groupe", "Squad mean"],
  "analytics.playersMeasured": ["joueurs mesures", "players measured"],
  "analytics.sd": ["Écart type", "Standard deviation"],
  "analytics.variation": ["de variation", "variation"],
  "analytics.best": ["Meilleure valeur", "Best value"],
  "analytics.worst": ["Valeur la plus basse", "Lowest value"],
  "analytics.ranking": ["Classement du groupe", "Squad ranking"],
  "analytics.distribution": [
    "Répartition par rapport à la norme",
    "Distribution against the norm",
  ],
  "analytics.distributionHint": [
    "joueurs situes dans la population de référence",
    "players placed against the reference population",
  ],
  "analytics.distributionNote": [
    "Une concentration dans les tranches basses signale un besoin collectif sur cette qualité. Une répartition étalée appelle au contraire une individualisation.",
    "A cluster in the lower bands signals a collective need on that quality. A spread distribution calls for individualisation instead.",
  ],
  "analytics.crossing": ["Croisement de deux qualités", "Crossing two qualities"],
  "analytics.crossingVersus": ["face à", "against"],
  "analytics.crossingNote": [
    "Croiser deux qualités fait apparaître les profils atypiques : un joueur rapide mais peu endurant, un joueur fort mais lent. Ce sont ces cas qui demandent un travail spécifique.",
    "Crossing two qualities reveals atypical profiles: a fast but poorly conditioned player, a strong but slow one. These are the cases that need specific work.",
  ],
  "analytics.perPlayer": ["Détail par joueur", "Player breakdown"],
  "analytics.perPlayerSubtitle": [
    "Trié de la valeur la plus faible à la plus élevée",
    "Sorted from the lowest to the highest value",
  ],
  "analytics.gapToMean": ["Écart à la moyenne du groupe", "Gap to squad mean"],
  "analytics.bandVeryLow": ["Très faible", "Very low"],
  "analytics.bandLow": ["Faible", "Low"],
  "analytics.bandAverage": ["Moyen", "Average"],
  "analytics.bandGood": ["Bon", "Good"],
  "analytics.bandVeryGood": ["Très bon", "Very good"],

  // --- Referentiel ----------------------------------------------------------
  "reference.title": ["Référentiel des tests", "Test reference"],
  "reference.subtitle": [
    "Protocole, matériel, durée et source scientifique de chaque test disponible dans l'application. Ce sont ces protocoles qui rendent les comparaisons valides d'une passation à l'autre.",
    "Protocol, equipment, duration and scientific source for every test in the application. These protocols are what make comparisons valid from one session to the next.",
  ],
  "reference.batteries": ["Batteries prêtes à l'emploi", "Ready made batteries"],
  "reference.batteriesSubtitle": [
    "Regroupements de tests alignés sur les moments clés de la saison",
    "Test groupings aligned with the key moments of the season",
  ],
  "reference.when": ["Quand", "When"],
  "reference.fields": ["Valeurs à saisir", "Values to enter"],
  "reference.field": ["Champ", "Field"],
  "reference.precision": ["Précision", "Guidance"],
  "reference.norms": ["Valeurs de référence", "Reference values"],
  "reference.normsSubtitle": [
    "Moyennes et écarts types utilises pour calculer les percentiles",
    "Means and standard deviations used to compute percentiles",
  ],
  "reference.population": ["Population", "Population"],
  "reference.sex": ["Sexe", "Sex"],
  "reference.direction": ["Sens", "Direction"],
  "reference.higherBetter": ["plus haut est mieux", "higher is better"],
  "reference.lowerBetter": ["plus bas est mieux", "lower is better"],
  "reference.allPositions": ["tous", "all"],
  "reference.sources": ["Sources", "Sources"],
  "reference.sourcesSubtitle": [
    "Travaux qui fondent les calculs et les valeurs de référence",
    "Research underpinning the calculations and reference values",
  ],
  "reference.footer": [
    "Les valeurs de référence sont des repères de population issus d'échantillons publiés. Elles servent à situer un joueur, pas à fixer un objectif. La comparaison la plus fiable reste toujours l'évolution du joueur par rapport à ses propres mesures antérieures.",
    "Reference values are population landmarks drawn from published samples. They serve to place a player, not to set a target. The most reliable comparison remains the player's change against their own earlier measurements.",
  ],

  // --- Parametres -----------------------------------------------------------
  "settings.title": ["Paramètres", "Settings"],
  "settings.subtitle": ["Votre compte et vos accès.", "Your account and access."],
  "settings.account": ["Compte", "Account"],
  "settings.role": ["Rôle", "Role"],
  "settings.jobTitle": ["Fonction", "Job title"],
  "settings.jobTitleNone": ["non renseignée", "not provided"],
  "settings.phone": ["Téléphone", "Phone"],
  "settings.phoneNone": ["non renseigné", "not provided"],
  "settings.phoneHint": [
    "Sert à vous joindre en cas de problème sur votre compte. Il n'apparaît nulle part ailleurs.",
    "Used to reach you if something goes wrong with your account. It appears nowhere else.",
  ],
  "settings.phoneInvalid": [
    "Ce numéro contient des caractères inattendus.",
    "This number contains unexpected characters.",
  ],
  "settings.profile": ["Vos coordonnées", "Your details"],
  "settings.profileSubtitle": [
    "Modifiables à tout moment.",
    "You can change these at any time.",
  ],
  "settings.profileInvalid": ["Vérifiez les champs saisis.", "Check the fields you entered."],
  "settings.profileSaved": ["Coordonnées enregistrées.", "Details saved."],
  "settings.saveProfile": ["Enregistrer", "Save"],
  "settings.organization": ["Organisation", "Organisation"],
  "settings.organizationNone": [
    "aucune (compte propriétaire)",
    "none (owner account)",
  ],
  "settings.createdAt": ["Compte créé le", "Account created on"],
  "settings.lastLogin": ["Dernière connexion", "Last sign in"],
  "settings.firstLogin": ["première connexion", "first sign in"],
  "settings.teams": ["Équipes rattachees", "Assigned teams"],
  "settings.accessManage": ["gestion", "manage"],
  "settings.accessView": ["lecture", "view"],
  "settings.password": ["Mot de passe", "Password"],
  "settings.passwordSubtitle": [
    "Le changer déconnecté toutes vos autres sessions",
    "Changing it signs out all your other sessions",
  ],
  "settings.currentPassword": ["Mot de passe actuel", "Current password"],
  "settings.newPassword": ["Nouveau mot de passe", "New password"],
  "settings.confirmPassword": [
    "Confirmer le nouveau mot de passe",
    "Confirm the new password",
  ],
  "settings.passwordHint": ["Au moins 8 caractères.", "At least 8 characters."],
  "settings.changePassword": ["Changer le mot de passe", "Change password"],
  "settings.updating": ["Mise à jour", "Updating"],
  "settings.language": ["Langue", "Language"],
  "settings.languageSubtitle": [
    "S'applique à l'interface et aux protocoles de tests",
    "Applies to the interface and the test protocols",
  ],
  "settings.theme": ["Thème", "Theme"],
  "settings.themeLight": ["Thème clair", "Light theme"],
  "settings.themeDark": ["Thème sombre", "Dark theme"],
  "settings.themeSystem": ["Thème du système", "System theme"],

  // --- Panel proprietaire ---------------------------------------------------
  "admin.title": ["Panel propriétaire", "Owner panel"],
  "admin.subtitle": [
    "Vue globale de tous les clients, de leur activité et des actions réalisées dans l'application.",
    "Global view of every client, their activity and the actions taken in the application.",
  ],
  "admin.clubs": ["Clubs", "Clubs"],
  "admin.clubsActive": ["actifs", "active"],
  "admin.users": ["Utilisateurs", "Users"],
  "admin.usersActive": ["actifs", "active"],
  "admin.usersRecent": ["connectés sur 30 jours", "signed in over 30 days"],
  "admin.teams": ["Équipes", "Teams"],
  "admin.data": ["Données", "Data"],
  "admin.dataHint": ["passations enregistrées", "sessions recorded"],
  "admin.clientClubs": ["Clubs clients", "Client clubs"],
  "admin.clientClubsSubtitle": [
    "Volume de données par organisation",
    "Data volume per organisation",
  ],
  "admin.manage": ["Gérer", "Manage"],
  "admin.plan": ["Forfait", "Plan"],
  "admin.recentActivity": ["Activité récente", "Recent activity"],
  "admin.recentActivitySubtitle": ["Huit dernières actions", "Last eight actions"],
  "admin.noActivity": ["Aucune action enregistrée.", "No action recorded."],
  "admin.quickAccess": ["Accès rapide", "Quick access"],
  "admin.quickAccessSubtitle": [
    "Les opérations les plus fréquentes",
    "The most frequent operations",
  ],
  "admin.createClub": ["Créer un club", "Create a club"],
  "admin.createClubBody": [
    "Ouvrir un nouveau compte client et définir son forfait.",
    "Open a new client account and set its plan.",
  ],
  "admin.createAccess": ["Créer un accès", "Create an account"],
  "admin.createAccessBody": [
    "Ajouter un préparateur ou un administrateur de club.",
    "Add a physical coach or a club administrator.",
  ],
  "admin.viewAudit": ["Consulter le journal", "Open the audit log"],
  "admin.viewAuditBody": [
    "Vérifier qui a fait quoi et quand.",
    "Check who did what and when.",
  ],
  "admin.active": ["Actif", "Active"],
  "admin.suspended": ["Suspendu", "Suspended"],
  "admin.disabled": ["Désactivé", "Disabled"],
  "admin.suspend": ["Suspendre", "Suspend"],
  "admin.reactivate": ["Réactiver", "Reactivate"],
  "admin.clubsSubtitle": [
    "Chaque club est isole des autres. Ses utilisateurs ne voient que ses propres équipes et joueurs.",
    "Each club is isolated from the others. Its users only see its own teams and players.",
  ],
  "admin.noClubs": [
    "Aucun club enregistré. Créez le premier avec le formulaire à droite.",
    "No club registered. Create the first one with the form on the right.",
  ],
  "admin.noTeamsForClub": ["Aucune équipe pour ce club.", "No team for this club."],
  "admin.locationUnknown": [
    "Localisation non renseignée",
    "Location not provided",
  ],
  "admin.createdOn": ["cree le", "created on"],
  "admin.expiresOn": ["expire le", "expires on"],
  "admin.newClub": ["Nouveau club", "New club"],
  "admin.newClubSubtitle": ["Ouvrir un compte client", "Open a client account"],
  "admin.clubName": ["Nom du club", "Club name"],
  "admin.city": ["Ville", "City"],
  "admin.country": ["Pays", "Country"],
  "admin.planHint": [
    "Le forfait fixe le nombre maximal d'équipes et de joueurs.",
    "The plan sets the maximum number of teams and players.",
  ],
  "admin.accessEnd": ["Date de fin d'accès", "Access end date"],
  "admin.internalNotes": ["Notes internes", "Internal notes"],
  "admin.newTeam": ["Nouvelle équipe", "New team"],
  "admin.newTeamSubtitle": [
    "Rattachee à un club existant",
    "Attached to an existing club",
  ],
  "admin.club": ["Club", "Club"],
  "admin.teamName": ["Nom de l'équipe", "Team name"],
  "admin.category": ["Catégorie", "Category"],
  "admin.sex": ["Sexe", "Sex"],
  "admin.level": ["Niveau", "Level"],
  "admin.season": ["Saison", "Season"],
  "admin.createTeam": ["Créer l'équipe", "Create team"],
  "admin.createClubFirst": ["Créez d'abord un club.", "Create a club first."],
  "admin.teamPopulationHint": [
    "La catégorie et le niveau déterminent la population de référence utilisée pour les percentiles.",
    "Category and level determine the reference population used for percentiles.",
  ],
  "admin.usersSubtitle": [
    "Tous les comptes de la plateforme, tous clubs confondus.",
    "Every account on the platform, across all clubs.",
  ],
  "admin.accounts": ["comptes", "accounts"],
  "admin.accountsSubtitle": [
    "Classes par rôle puis par nom",
    "Ordered by role then by name",
  ],
  "admin.user": ["Utilisateur", "User"],
  "admin.lastLogin": ["Dernière connexion", "Last sign in"],
  "admin.temporaryPassword": ["mot de passe provisoire", "temporary password"],
  "admin.disableAccount": ["Désactiver le compte", "Disable account"],
  "admin.enableAccount": ["Réactiver le compte", "Enable account"],
  "admin.impersonate": [
    "Consulter l'application avec ce compte",
    "View the application as this account",
  ],
  "admin.impersonateNote": [
    "L'icône en forme d'oeil ouvre l'application avec le compte du client, pour diagnostiquer un problème. L'action est enregistrée dans le journal d'audit et un bandeau reste visible pendant toute la session. Vous ne voyez jamais son mot de passe.",
    "The eye icon opens the application using the client's account, to diagnose a problem. The action is recorded in the audit log and a banner stays visible for the whole session. You never see their password.",
  ],
  "admin.impersonating": [
    "Vous consultez ce compte en tant que propriétaire",
    "You are viewing this account as the owner",
  ],
  "admin.impersonatingTraced": [
    "Les actions réalisées sont tracées.",
    "Actions taken are recorded.",
  ],
  "admin.backToMyAccount": ["Revenir à mon compte", "Back to my account"],
  "admin.newAccess": ["Nouvel accès", "New account"],
  "admin.newAccessSubtitle": [
    "Le compte devra changer son mot de passe",
    "The account will have to change its password",
  ],
  "admin.fullName": ["Nom complet", "Full name"],
  "admin.jobTitlePlaceholder": [
    "Préparateur physique, entraîneur adjoint...",
    "Physical coach, assistant coach...",
  ],
  "admin.temporaryPasswordLabel": ["Mot de passe provisoire", "Temporary password"],
  "admin.generatePassword": ["Générer un mot de passe", "Generate a password"],
  "admin.temporaryPasswordHint": [
    "À transmettre au client par un canal sur. Il devra le changer à la première connexion.",
    "Send it to the client over a secure channel. They will have to change it on first sign in.",
  ],
  "admin.createAccount": ["Créer le compte", "Create account"],
  "admin.selectClub": ["Sélectionner un club", "Select a club"],
  "admin.resetPassword": [
    "Réinitialiser un mot de passe",
    "Reset a password",
  ],
  "admin.resetPasswordSubtitle": [
    "Toutes ses sessions seront fermées",
    "All their sessions will be closed",
  ],
  "admin.account": ["Compte", "Account"],
  "admin.reset": ["Réinitialiser", "Reset"],
  "admin.noOtherAccount": ["Aucun autre compte.", "No other account."],
  "admin.audit": ["Journal d'audit", "Audit log"],
  "admin.auditSubtitle": [
    "Chaque action sensible est enregistrée avec son auteur, sa cible et son horodatage.",
    "Every sensitive action is recorded with its author, target and timestamp.",
  ],
  "admin.auditAll": ["Toutes", "All"],
  "admin.auditNone": ["Aucune entrée", "No entry"],
  "admin.timestamp": ["Horodatage", "Timestamp"],
  "admin.action": ["Action", "Action"],
  "admin.author": ["Auteur", "Author"],
  "admin.entity": ["Entité", "Entity"],
  "admin.detail": ["Détail", "Detail"],
  "admin.address": ["Adresse", "Address"],
  "admin.deletedAccount": ["compte supprime", "deleted account"],
  "admin.previousPage": ["Page précédente", "Previous page"],
  "admin.nextPage": ["Page suivante", "Next page"],
  "admin.page": ["Page", "Page"],
  "admin.pagination": ["Pagination du journal", "Log pagination"],

  // --- Gestion de l'effectif et des equipes ---------------------------------
  "manage.title": ["Gestion de l'équipe", "Team management"],
  "manage.subtitle": [
    "Effectif, réglages de l'équipe et staff rattaché.",
    "Squad, team settings and assigned staff.",
  ],
  "manage.open": ["Gérer", "Manage"],
  "manage.squad": ["Effectif", "Squad"],
  "manage.squadSubtitle": [
    "Ajouter, modifier ou sortir un joueur de l'effectif",
    "Add, edit or remove a player from the squad",
  ],
  "manage.addPlayer": ["Ajouter un joueur", "Add a player"],
  "manage.addPlayerSubtitle": [
    "Le formulaire reste ouvert pour enchaîner tout l'effectif",
    "The form stays open so you can enter the whole squad in one go",
  ],
  "manage.editPlayer": ["Modifier le joueur", "Edit player"],
  // Le nom de l'equipe est ajoute apres cette phrase : l'ajout se fait toujours
  // dans une equipe precise, et le message doit le rappeler.
  "manage.playerAddedTo": ["à été ajouté à", "has been added to"],
  "manage.playerSaved": ["Joueur enregistré.", "Player saved."],
  "manage.playerTeamHint": [
    "Le joueur sera ajouté à cette équipe.",
    "The player will be added to this team.",
  ],
  "manage.sexFromTeam": [
    "Sexe défini par l'équipe",
    "Sex set by the team",
  ],
  "manage.playersRealigned": [
    "joueur(s) réaligné(s) sur le sexe de l'équipe.",
    "player(s) realigned to the team's sex.",
  ],
  "manage.playerInvalid": [
    "Vérifier les champs obligatoires : nom, prénom et date de naissance.",
    "Check the required fields: last name, first name and date of birth.",
  ],
  "manage.playerNotFound": ["Joueur introuvable.", "Player not found."],
  "manage.playerLimit": [
    "Le forfait de ce club plafonne le nombre de joueurs :",
    "This club's plan caps the number of players:",
  ],
  "manage.teamLimit": [
    "Le forfait de ce club plafonne le nombre d'équipes :",
    "This club's plan caps the number of teams:",
  ],
  "manage.teamNotFound": ["Équipe introuvable.", "Team not found."],
  "manage.clubNotFound": ["Club introuvable.", "Club not found."],
  "manage.teamInvalid": [
    "Vérifier le nom et la saison de l'équipe.",
    "Check the team name and season.",
  ],
  "manage.clubInvalid": ["Vérifier le nom du club.", "Check the club name."],
  "manage.teamCreated": ["à été créée.", "has been created."],
  "manage.teamSaved": ["Équipe enregistrée.", "Team saved."],
  "manage.clubSaved": ["Club enregistré.", "Club saved."],
  "manage.forbidden": [
    "Vous n'avez pas les droits pour cette action.",
    "You do not have permission for this action.",
  ],
  "manage.teamSettings": ["Réglages de l'équipe", "Team settings"],
  "manage.teamSettingsSubtitle": [
    "La catégorie et le niveau déterminent la population de référence des percentiles",
    "Category and level determine the reference population used for percentiles",
  ],
  "manage.staff": ["Staff rattaché", "Assigned staff"],
  "manage.staffSubtitle": [
    "Qui peut consulter et modifier cette équipe",
    "Who can view and edit this team",
  ],
  "manage.staffAdded": ["à été rattaché à l'équipe.", "has been assigned to the team."],
  "manage.staffNone": ["Aucun staff rattaché.", "No staff assigned."],
  "manage.addStaff": ["Rattacher", "Assign"],
  "manage.removeStaff": ["Retirer du staff", "Remove from staff"],
  "manage.userNotInClub": [
    "Cet utilisateur n'appartient pas à ce club.",
    "This user does not belong to this club.",
  ],
  "manage.accessLevel": ["Droits", "Access"],
  "manage.newTeam": ["Nouvelle équipe", "New team"],
  "manage.newTeamSubtitle": [
    "Une équipe supplémentaire dans votre club",
    "An additional team in your club",
  ],
  "manage.club": ["Mon club", "My club"],
  "manage.clubSubtitle": [
    "Coordonnées du club et forfait en cours",
    "Club details and current plan",
  ],
  "manage.clubIdentity": ["Identité du club", "Club details"],
  "manage.plan": ["Forfait", "Plan"],
  "manage.planSubtitle": [
    "Modifiable uniquement par l'éditeur de l'application",
    "Only the application publisher can change this",
  ],
  "manage.planLimits": ["Plafonds", "Limits"],
  "manage.deletePlayer": ["Supprimer définitivement", "Delete permanently"],
  "manage.deletePlayerHint": [
    "Efface le joueur et tout son historique de mesures. Pour sortir un joueur de l'effectif en conservant ses données, passer son statut à Parti.",
    "Erases the player and their whole measurement history. To remove a player from the squad while keeping their data, set their status to Left.",
  ],
  "manage.deleteConfirm": [
    "Supprimer ce joueur et tout son historique ?",
    "Delete this player and their whole history?",
  ],
  "manage.transferTeam": ["Équipe", "Team"],
  "manage.secondaryPosition": ["Poste secondaire", "Secondary position"],
  "manage.externalId": ["Identifiant externe", "External identifier"],
  "manage.externalIdHint": [
    "Identifiant GPS ou fédération, pour rapprocher les imports",
    "GPS or federation identifier, used to match imports",
  ],
  "manage.teamColor": ["Couleur", "Colour"],
  "manage.noneOption": ["Aucun", "None"],
  "manage.archived": ["Archivée", "Archived"],
  "manage.archive": ["Archiver l'équipe", "Archive team"],
  "manage.unarchive": ["Réactiver l'équipe", "Reactivate team"],
  "manage.archiveHint": [
    "Une équipe archivée disparaît des listes mais conserve toutes ses données.",
    "An archived team disappears from the lists but keeps all its data.",
  ],
  "manage.backToTeam": ["Retour à l'équipe", "Back to team"],

  // --- Etats et erreurs -----------------------------------------------------
  "error.notFound": ["Page introuvable", "Page not found"],
  "error.notFoundBody": [
    "La page demandée n'existe pas ou vous n'avez pas les droits pour y accéder.",
    "The requested page does not exist or you do not have permission to view it.",
  ],
  "error.backToDashboard": ["Retour au tableau de bord", "Back to dashboard"],
  "error.loadingData": ["Chargement des données", "Loading data"],
  "error.loadingChart": ["Chargement du graphique", "Loading chart"],
  "error.loadingTable": ["Chargement du tableau", "Loading table"],
  "error.loadingList": ["Chargement de la liste", "Loading list"],
  "error.loadingProfile": ["Chargement du profil", "Loading profile"],
  "error.loadingCards": ["Chargement des cartes", "Loading cards"],
  "error.loadingIndicators": ["Chargement des indicateurs", "Loading indicators"],
  "error.pageProgress": ["Chargement de la page", "Page loading"],

  // --- Graphiques -----------------------------------------------------------
  "chart.noMeasurement": ["Aucune mesure enregistrée", "No measurement recorded"],
  "chart.needThree": [
    "Il faut au moins trois qualités mesurées pour tracer le profil. Compléter la batterie de tests.",
    "At least three measured qualities are needed to plot the profile. Complete the test battery.",
  ],
  "chart.needTwo": [
    "Il faut au moins deux joueurs disposant des deux mesures pour tracer ce croisement.",
    "At least two players with both measurements are needed to plot this crossing.",
  ],
  "chart.noMetricData": ["Aucune donnée pour cette métrique", "No data for this metric"],
  "chart.noBilateral": ["Aucune mesure bilatérale", "No bilateral measurement"],
  "chart.squadMean": ["Moyenne équipe", "Squad mean"],
  "chart.reference": ["Référence", "Reference"],
  "chart.speed": ["Vitesse", "Speed"],
  "chart.force": ["Force", "Force"],
  "chart.power": ["Puissance", "Power"],
  "chart.level": ["Niveau", "Level"],
  "chart.gapBetweenSides": [
    "Écart entre les deux côtés",
    "Gap between the two sides",
  ],
  "chart.strongSide": ["côté fort", "strong side"],
  "chart.gap": ["Écart", "Gap"],
  "chart.percentileSuffix": ["e percentile", "th percentile"],

  // --- Inscription publique -------------------------------------------------
  "signup.title": ["Créer votre club", "Create your club"],
  "signup.subtitle": [
    "Trente joueurs gratuits, sans limite de durée et sans carte bancaire.",
    "Thirty players free, with no time limit and no card.",
  ],
  "signup.step1": ["Votre club", "Your club"],
  "signup.step2": ["Vous", "About you"],
  "signup.step3": ["Votre accès", "Your access"],
  "signup.stepPosition": ["Étape {current} sur {total}", "Step {current} of {total}"],
  "signup.next": ["Continuer", "Continue"],
  "signup.back": ["Retour", "Back"],
  "signup.country": ["Pays", "Country"],
  "signup.countryHint": [
    "Tapez les premières lettres.",
    "Type the first few letters.",
  ],
  "signup.countryPlaceholder": ["Maroc, France...", "Morocco, France..."],
  "signup.countryEmpty": ["Aucun pays ne correspond.", "No country matches."],
  "signup.countryCount": ["{count} pays proposés", "{count} countries suggested"],
  "signup.jobTitle": ["Votre fonction", "Your role"],
  "signup.jobTitleOther": ["Précisez votre fonction", "Describe your role"],
  "signup.phone": ["Téléphone", "Phone"],
  "signup.phoneHint": [
    "Facultatif. Utile si nous devons vous joindre rapidement.",
    "Optional. Useful if we need to reach you quickly.",
  ],
  "signup.optional": ["facultatif", "optional"],
  "signup.draftRestored": [
    "Nous avons retrouve votre saisie.",
    "We restored what you had entered.",
  ],
  "signup.recap": ["Récapitulatif", "Summary"],
  "signup.mismatch": [
    "Les deux mots de passe ne correspondent pas.",
    "The two passwords do not match.",
  ],
  "signup.club": ["Nom du club", "Club name"],
  "signup.clubHint": [
    "Celui que verront les membres de votre staff.",
    "The name your staff will see.",
  ],
  "signup.name": ["Votre nom", "Your name"],
  "signup.email": ["Adresse de courriel", "Email address"],
  "signup.emailHint": [
    "Elle servira à vous connecter.",
    "You will use it to sign in.",
  ],
  "signup.password": ["Mot de passe", "Password"],
  "signup.passwordHint": ["Dix caractères au minimum.", "Ten characters minimum."],
  "signup.confirm": ["Confirmer le mot de passe", "Confirm password"],
  "signup.submit": ["Créer mon club", "Create my club"],
  "signup.pending": ["Création", "Creating"],
  "signup.haveAccount": ["Vous avez déjà un compte ?", "Already have an account?"],
  "signup.signIn": ["Se connecter", "Sign in"],
  "signup.noAccount": ["Pas encore de compte ?", "No account yet?"],
  "signup.cta": ["Créer un club gratuitement", "Create a club for free"],
  "signup.ctaShort": ["Commencer gratuitement", "Start for free"],
  "signup.terms": [
    "En créant votre club vous acceptez les conditions générales et la politique de confidentialité.",
    "By creating your club you accept the terms of service and the privacy policy.",
  ],
  "signup.included1": [
    "Trente joueurs, une équipe, sans limite de durée",
    "Thirty players, one team, no time limit",
  ],
  "signup.included2": [
    "Les vingt deux tests et toutes les analyses",
    "All twenty two tests and every analysis",
  ],
  "signup.included3": ["Aucune carte bancaire demandée", "No card required"],

  // --- Prise en main d'un compte neuf ---------------------------------------
  "onboarding.title": ["Trois étapes pour démarrer", "Three steps to get started"],
  "onboarding.subtitle": [
    "Votre club est créé. Il reste à le remplir.",
    "Your club is created. Now fill it in.",
  ],
  "onboarding.step1": ["Créez votre équipe", "Create your team"],
  "onboarding.step1Body": [
    "Sa catégorie et son niveau déterminent les normes auxquelles vos joueurs seront comparés.",
    "Its category and level decide which norms your players are compared against.",
  ],
  "onboarding.step1Cta": ["Créer une équipe", "Create a team"],
  "onboarding.step2": ["Ajoutez vos joueurs", "Add your players"],
  "onboarding.step2Body": [
    "Nom, date de naissance et poste suffisent pour commencer. La taille et la masse affinent les calculs.",
    "Name, date of birth and position are enough to start. Height and weight refine the calculations.",
  ],
  "onboarding.step2Cta": ["Ajouter des joueurs", "Add players"],
  "onboarding.step2Locked": [
    "Créez d'abord une équipe.",
    "Create a team first.",
  ],
  "onboarding.step3": ["Saisissez votre première passation", "Run your first session"],
  "onboarding.step3Body": [
    "Choisissez une batterie, saisissez au bord du terrain, les calculs suivent.",
    "Pick a battery, enter results pitchside, the calculations follow.",
  ],
  "onboarding.step3Cta": ["Nouvelle passation", "New session"],
  "onboarding.step3Locked": [
    "Ajoutez d'abord au moins un joueur.",
    "Add at least one player first.",
  ],
  "onboarding.done": ["Fait", "Done"],
  "onboarding.progress": ["{done} sur {total}", "{done} of {total}"],

  "teams.create": ["Créer une équipe", "Create a team"],
  "teams.createSubtitle": [
    "La catégorie et le niveau choisis déterminent la population de référence des percentiles.",
    "The category and level you choose decide the reference population for percentiles.",
  ],
  "teams.limitReached": [
    "Votre forfait autorise {max} équipe. Passez à une formule supérieure pour en créer d'autres.",
    "Your plan allows {max} team. Move to a higher plan to create more.",
  ],
  "teams.noClub": [
    "Votre compte n'est rattaché à aucun club. Contactez l'administrateur de votre club.",
    "Your account is not linked to a club. Contact your club administrator.",
  ],

  "players.add": ["Ajouter un joueur", "Add a player"],
  "players.addSubtitle": [
    "Choisissez l'équipe, le reste se remplit en dix secondes.",
    "Pick the team, the rest takes ten seconds.",
  ],
  "players.needTeam": [
    "Créez une équipe avant d'ajouter des joueurs : un joueur appartient toujours à une équipe.",
    "Create a team before adding players: a player always belongs to a team.",
  ],
  "players.chooseTeam": ["Équipe d'accueil", "Team"],
  "players.limitReached": [
    "Votre forfait autorise {max} joueurs. Passez à une formule supérieure pour en ajouter.",
    "Your plan allows {max} players. Move to a higher plan to add more.",
  ],

  "sessions.needPlayers": [
    "Ajoutez au moins un joueur à cette équipe avant de créer une passation.",
    "Add at least one player to this team before creating a session.",
  ],

  // --- Page publique --------------------------------------------------------
  // Seule zone de l'application adressee a un visiteur qui ne connait pas le
  // produit. Le ton y est commercial, mais aucune affirmation n'y est inventee :
  // les chiffres viennent du catalogue scientifique et des plafonds de forfait.
  //
  // Regle de redaction tenue ici : phrases courtes, aucun tiret, une idee par
  // ligne. Ce qui ne tient pas en une phrase n'a pas sa place sur une page
  // d'accueil.
  "home.navFeatures": ["Ce que ça mesure", "What it measures"],
  "home.navScience": ["Science", "Science"],
  "home.navPlans": ["Tarifs", "Pricing"],
  "home.navQuestions": ["Questions", "Questions"],
  "home.navLogin": ["Se connecter", "Sign in"],
  "home.navOpenApp": ["Ouvrir l'application", "Open the app"],
  "home.navDemo": ["Demander une démo", "Book a demo"],
  "home.skipToContent": ["Aller au contenu", "Skip to content"],

  // Hero
  "home.heroKicker": ["Préparation physique football", "Football physical preparation"],
  "home.heroLine1": ["Une saison", "A season"],
  "home.heroLine2": ["se mesure.", "is measured."],
  "home.heroBody": [
    "La condition physique de votre effectif, chiffrée, comparée à des normes publiées, et expliquée en une page par joueur.",
    "Your squad's physical condition, quantified, compared against published norms, and explained on one page per player.",
  ],
  "home.heroNote": [
    "Trente joueurs gratuits, sans limite de durée. Aucune carte bancaire.",
    "Thirty players free, with no time limit. No card.",
  ],
  "home.heroImageAlt": [
    "Séance de tests physiques sur un terrain de football",
    "Physical testing session on a football pitch",
  ],

  // Bandeau de preuve
  "home.proofTests": ["tests de terrain", "field tests"],
  "home.proofBatteries": ["batteries prêtes", "ready batteries"],
  "home.proofNorms": ["lignes de normes", "norm rows"],
  "home.proofPopulations": ["populations de référence", "reference populations"],

  // Le probleme
  "home.gapTitle": [
    "Un carnet ne dit jamais qui progresse",
    "A notebook never tells you who is progressing",
  ],
  "home.gapBody": [
    "Vous mesurez déjà. Le problème n'est pas la mesure, c'est ce qui vient après : comparer un chiffre à la bonne population, voir une asymétrie avant la blessure, et sortir une réponse en fin de séance plutôt qu'en fin de semaine.",
    "You already measure. Measuring is not the problem. What follows is: comparing a number against the right population, spotting an asymmetry before the injury, and having an answer by the end of the session rather than the end of the week.",
  ],
  "home.gap1": [
    "Un dix mètres en 1,82 s ne veut rien dire seul. Compare aux U17 nationaux, il devient une décision.",
    "A ten metre split of 1.82 s means nothing on its own. Against national U17 data, it becomes a decision.",
  ],
  "home.gap2": [
    "Une asymétrie de 14 % se lit en trois secondes ici. Sur un tableur, personne ne la voit passer.",
    "A 14 % asymmetry shows up here in three seconds. On a spreadsheet nobody catches it.",
  ],
  "home.gap3": [
    "La charge d'entraînement se calcule seule, à chaque séance saisie, sans une formule à recopier.",
    "Training load computes itself, session after session, with no formula to copy across.",
  ],

  // Methode
  "home.methodTitle": ["Quatre gestes, rien de plus", "Four moves, nothing more"],
  "home.step1Title": ["Vous choisissez la batterie", "Pick the battery"],
  "home.step1Body": [
    "Six batteries prêtes, du bilan de reprise au suivi de retour au jeu.",
    "Six ready batteries, from preseason screening to return to play.",
  ],
  "home.step2Title": ["Vous saisissez au bord du terrain", "Enter it pitchside"],
  "home.step2Body": [
    "Une grille par test, au téléphone, une main libre pour le chronomètre.",
    "One grid per test, on the phone, one hand free for the stopwatch.",
  ],
  "home.step3Title": ["L'application calcule", "The app computes"],
  "home.step3Body": [
    "Profils force vitesse, percentiles, asymétries, maturité. Immédiatement.",
    "Force velocity profiles, percentiles, asymmetries, maturity. Immediately.",
  ],
  "home.step4Title": ["Vous décidez", "You decide"],
  "home.step4Body": [
    "Une recommandation écrite par joueur, avec la référence qui la fondé.",
    "A written recommendation per player, with the reference behind it.",
  ],

  // Ce que ca mesure
  "home.measureTitle": ["Ce que la plateforme mesure", "What the platform measures"],
  "home.measureBody": [
    "Vingt deux tests de terrain, chacun avec son protocole, son matériel et sa référence. Aucun n'a été ajouté pour faire nombre.",
    "Twenty two field tests, each with its protocol, its equipment and its reference. None was added to pad the list.",
  ],

  // Bande terrain
  "home.fieldTitle": ["Conçu pour un terrain, pas pour un bureau", "Built for a pitch, not a desk"],
  "home.fieldBody": [
    "Une saisie qui tient dans une main, un affichage lisible en plein soleil, et une page qui s'ouvre avant que le joueur ait fini son retour au calme.",
    "One handed entry, a display you can read in full sun, and a page that opens before the player has finished cooling down.",
  ],
  "home.fieldPoint1": [
    "Chaque page s'affiche immédiatement, les chiffres arrivent ensuite.",
    "Every page appears at once, the numbers follow.",
  ],
  "home.fieldPoint2": [
    "Application Android installable, même interface que sur ordinateur.",
    "Installable Android app, same interface as on desktop.",
  ],
  "home.fieldPoint3": [
    "Français et anglais, changeables à tout moment, protocoles compris.",
    "French and English, switchable at any time, protocols included.",
  ],
  "home.fieldImageAlt": [
    "Joueurs à l'entraînement pendant une batterie de tests",
    "Players training during a testing battery",
  ],

  // Staff
  "home.staffTitle": ["Ce que voit le reste du staff", "What the rest of the staff sees"],
  "home.staffBody": [
    "L'entraîneur principal n'a pas besoin de vos tableaux. Il a besoin de savoir qui est disponible samedi.",
    "The head coach does not need your spreadsheets. They need to know who is available on Saturday.",
  ],
  "home.staffPoint1": [
    "Un effectif trié par disponibilité réelle",
    "A squad sorted by real availability",
  ],
  "home.staffPoint2": [
    "Les joueurs à surveiller, remontés seuls",
    "Players to watch, surfaced on their own",
  ],
  "home.staffPoint3": [
    "L'évolution d'un joueur sur toute la saison",
    "One player's trajectory across the season",
  ],
  "home.staffPoint4": [
    "Un accès en lecture seule pour qui n'a pas à modifier",
    "Read only access for those who should not edit",
  ],
  "home.staffImageAlt": [
    "Staff technique analysant les résultats d'une séance",
    "Coaching staff reviewing session results",
  ],

  // Science
  "home.scienceTitle": ["Rien n'est estimé à l'oeil", "Nothing is estimated by eye"],
  "home.scienceBody": [
    "Chaque calcul porte le nom de la publication dont il vient. Vous pouvez la retrouver, la lire, et contester le résultat.",
    "Every calculation carries the name of the publication it comes from. You can find it, read it, and challenge the result.",
  ],
  "home.scienceNote": [
    "Les normes proviennent d'études publiées sur des populations de football. Elles ne remplacent ni un diagnostic ni un avis médical.",
    "Norms come from published studies on football populations. They replace neither a diagnosis nor medical advice.",
  ],

  // Avis
  "home.reviewsTitle": ["Ce qu'en disent les clubs", "What clubs say"],

  // Tarifs
  "home.plansTitle": ["Un tarif par taille de club", "One price per club size"],
  "home.plansSubtitle": [
    "Sans engagement. Résiliable à tout moment depuis votre compte, avec effet à la fin de la période payée.",
    "No commitment. Cancel any time from your account, effective at the end of the paid period.",
  ],
  "home.plansMonth": ["par mois", "per month"],
  "home.plansVat": ["hors taxes", "excluding VAT"],
  "home.plansTeam": ["équipe", "team"],
  "home.plansTeams": ["équipes", "teams"],
  "home.plansPlayer": ["joueur", "player"],
  "home.plansPlayers": ["joueurs", "players"],
  "home.plansFree": ["Gratuit", "Free"],
  "home.plansForever": ["pour toujours", "forever"],
  "home.plansCurrency": ["Devise", "Currency"],
  "home.plansTrialDays": ["{days} jours", "{days} days"],
  "home.plansQuote": ["Sur devis", "On request"],
  "home.plansPopular": ["Le plus choisi", "Most chosen"],
  "home.plansChoose": ["Choisir", "Choose"],
  "home.plansStart": ["Commencer", "Start"],
  "home.plansAllIncluded": [
    "Toutes les formules donnent accès aux {count} tests, aux normes, aux recommandations et à l'application Android. Le forfait ne limite que le nombre d'équipes et de joueurs suivis.",
    "Every plan includes all {count} tests, the norms, the recommendations and the Android app. The plan limits only how many teams and players you track.",
  ],
  "home.plansWhiteLabel": ["Marque blanche", "White label"],
  "home.plansWhiteLabelBody": [
    "Votre nom, vos couleurs, votre domaine, pour les fédérations et les groupes de clubs.",
    "Your name, your colours, your domain, for federations and club groups.",
  ],

  // Questions
  "home.faqTitle": ["Questions", "Questions"],
  "home.faq1Q": ["Comment se passe la facturation ?", "How does billing work?"],
  "home.faq1A": [
    "Le forfait gratuit ne se facture jamais, quelle que soit la durée. Sur une formule payante, vous êtes prélevé chaque mois par carte bancaire, le jour de votre souscription, dans la devise choisie à ce moment la. La facture arrive par courriel le même jour. Les montants annonces sont hors taxes.",
    "The free plan is never billed, however long you stay on it. On a paid plan you are charged monthly by card, on your signup date, in the currency chosen then. The invoice arrives by email the same day. Prices shown exclude VAT.",
  ],
  "home.faq2Q": ["Puis je arrêter quand je veux ?", "Can I stop whenever I want?"],
  "home.faq2A": [
    "Oui. La résiliation se fait depuis votre compte, sans nous écrire et sans justification. Vous gardez l'accès jusqu'à la fin de la période déjà payée, puis le compte reste consultable trente jours pour vous laisser exporter.",
    "Yes. Cancel from your account, without writing to us and without giving a reason. You keep access until the end of the period already paid, then the account stays readable for thirty days so you can export.",
  ],
  "home.faq3Q": ["Et si je ne suis pas satisfait ?", "What if I am not satisfied?"],
  "home.faq3A": [
    "Le forfait gratuit répond à cette question avant tout paiement, et sans limite de temps : vous pouvez suivre trente joueurs sur une saison entière sans rien payer. Une fois passe à une formule payante, tout mois entame vous est remboursé intégralement si vous en faites la demande dans les quatorze jours suivant le prélèvement.",
    "The free plan answers that before any payment, with no time limit: you can track thirty players over a whole season without paying. Once on a paid plan, any started month is refunded in full if you ask within fourteen days of the charge.",
  ],
  "home.faq4Q": ["À qui appartiennent mes données ?", "Who owns my data?"],
  "home.faq4A": [
    "À vous. Elles ne sont ni revendues, ni utilisées pour entraîner quoi que ce soit. L'export complet est disponible à tout moment, sans avoir à le demander.",
    "You do. It is never resold, never used to train anything. Full export is available at any time, without asking.",
  ],
  "home.faq5Q": ["Faut il du matériel particulier ?", "Do I need special equipment?"],
  "home.faq5A": [
    "Un chronomètre et des plots suffisent pour la majorité des tests. Les cellules photoélectriques et le tapis de saut améliorent la précision, et l'application tient compte du dispositif utilise dans ses calculs.",
    "A stopwatch and cones cover most tests. Timing gates and a jump mat improve precision, and the app accounts for the device used in its calculations.",
  ],
  "home.faq6Q": ["Combien de temps pour démarrer ?", "How long to get started?"],
  "home.faq6A": [
    "Une démonstration dure vingt minutes. La création de votre club et de votre premier effectif prend le même temps. Vous pouvez tester le soir même.",
    "A demo takes twenty minutes. Creating your club and first squad takes the same. You can test the same evening.",
  ],

  // Contact et pied de page
  "home.finalTitle": ["Passez votre prochaine batterie ici", "Run your next battery here"],
  "home.finalBody": [
    "Vingt minutes, votre effectif réel, la batterie que vous passez déjà. Nous répondons sous {hours} heures ouvrées.",
    "Twenty minutes, your real squad, the battery you already run. We answer within {hours} working hours.",
  ],
  "home.contactSalesLabel": ["Commercial et démonstrations", "Sales and demos"],
  "home.contactSupportLabel": ["Assistance et facturation", "Support and billing"],
  "home.contactWhatsapp": ["Écrire sur WhatsApp", "Message on WhatsApp"],
  "home.demoSubject": [
    "Démonstration Lamsaa préparation physique",
    "Lamsaa physical preparation demo",
  ],
  "home.footerTagline": [
    "Préparation physique football : tests, profils, analyses et recommandations.",
    "Football physical preparation: testing, profiles, analyses and recommendations.",
  ],
  "home.footerProduct": ["Produit", "Product"],
  "home.footerLegal": ["Informations légales", "Legal"],
  "home.footerContact": ["Contact", "Contact"],
  "home.footerRights": ["Tous droits réservés.", "All rights reserved."],
  "home.footerCompanyMissing": [
    "Raison sociale et adresse à renseigner dans le fichier .env du serveur.",
    "Legal name and address to be filled in the server .env file.",
  ],

  // --- Mesure d'audience ----------------------------------------------------
  "tracking.title": ["Mesure d'audience", "Audience tracking"],
  "tracking.subtitle": [
    "Identifiants des balises posées sur toutes les pages du site. Une modification prend effet immédiatement, sans redéploiement.",
    "Identifiers for the tags placed on every page of the site. A change takes effect immediately, with no redeploy.",
  ],
  "tracking.pixelLabel": ["Identifiant du pixel Meta", "Meta pixel ID"],
  "tracking.pixelHint": [
    "Quinze ou seize chiffres. Gestionnaire de publicités, Événements, Sources de données, en tête de la page du pixel.",
    "Fifteen or sixteen digits. Ads Manager, Events Manager, Data sources, at the top of the pixel page.",
  ],
  "tracking.clarityLabel": ["Identifiant de projet Clarity", "Clarity project ID"],
  "tracking.clarityHint": [
    "Dix caractères. Clarity, Settings, Overview, champ Project ID.",
    "Ten characters. Clarity, Settings, Overview, Project ID field.",
  ],
  "tracking.pixelInvalid": [
    "Un identifiant de pixel ne contient que des chiffres, quinze ou seize.",
    "A pixel ID contains digits only, fifteen or sixteen of them.",
  ],
  "tracking.clarityInvalid": [
    "Un identifiant Clarity ne contient que des lettres et des chiffres.",
    "A Clarity ID contains letters and digits only.",
  ],
  "tracking.invalid": ["Données invalides", "Invalid data"],
  "tracking.saved": [
    "Balises enregistrées. Elles sont actives sur toutes les pages.",
    "Tags saved. They are live on every page.",
  ],
  "tracking.emptyHint": [
    "Laisser vide pour arrêter la mesure.",
    "Leave empty to stop tracking.",
  ],
  "tracking.active": ["Active", "Live"],
  "tracking.inactive": ["Inactive", "Off"],
  "tracking.eventsTitle": ["Événements envoyés", "Events sent"],
  "tracking.eventsIntro": [
    "Ce que le pixel remonté de lui même. Choisir Lead comme événement de conversion dans une campagne à objectif prospects.",
    "What the pixel reports on its own. Pick Lead as the conversion event in a leads objective campaign.",
  ],
  "tracking.eventPageView": ["À chaque page ouverte", "On every page opened"],
  "tracking.eventSignupStarted": [
    "Le visiteur à rempli la première étape de l'inscription",
    "The visitor completed the first sign up step",
  ],
  "tracking.eventLead": [
    "Le compte est créé. C'est la conversion à optimiser.",
    "The account is created. This is the conversion to optimise.",
  ],
  "tracking.eventRegistration": [
    "Le compte est créé. Même instant que Lead, autre nom.",
    "The account is created. Same moment as Lead, different name.",
  ],
  "tracking.envNote": [
    "Une valeur peut aussi venir de FACEBOOK_PIXEL_ID ou CLARITY_PROJECT_ID dans l'environnement du serveur. Ce qui est saisi ici prime.",
    "A value can also come from FACEBOOK_PIXEL_ID or CLARITY_PROJECT_ID in the server environment. What is entered here wins.",
  ],
  "tracking.privacyNote": [
    "Ces balises déposent des cookies chez le visiteur. La politique de confidentialité doit les mentionner tant qu'elles sont actives.",
    "These tags set cookies on the visitor's device. The privacy policy must mention them while they are live.",
  ],

  // --- Erreurs de l'inscription publique ------------------------------------
  //
  // Les memes cles existent dans le dictionnaire marketing, en trois langues.
  // L'action d'inscription ne renvoie que la cle : elle est appelee depuis deux
  // surfaces qui ne parlent pas les memes langues.
  "error.rateLimit": [
    "Trop d'inscriptions depuis ce réseau. Réessayez dans une heure.",
    "Too many sign ups from this network. Try again in an hour.",
  ],
  "error.disposable": [
    "Cette adresse est temporaire. Utilisez l'adresse de votre club.",
    "That address is temporary. Use your club address.",
  ],
  "error.emailTaken": [
    "Impossible de créer un compte avec cette adresse. Essayez de vous connecter.",
    "This address cannot be used to create an account. Try logging in.",
  ],
  "error.clubRequired": ["Le nom du club est requis", "The club name is required"],
  "error.nameRequired": ["Votre nom est requis", "Your name is required"],
  "error.emailInvalid": ["Adresse de courriel invalide", "Invalid email address"],
  "error.passwordShort": [
    "Le mot de passe doit contenir au moins dix caractères",
    "The password must be at least ten characters",
  ],
  "error.passwordMismatch": [
    "Les deux mots de passe ne correspondent pas",
    "The two passwords do not match",
  ],
  "error.rejected": ["Inscription refusée", "Sign up refused"],
  "error.invalid": ["Données invalides", "Invalid data"],
} as const satisfies Record<string, Entry>;

export type MessageKey = keyof typeof MESSAGES;

/** Recupere un texte dans la langue demandee. */
export const translate = (key: MessageKey, locale: Locale): string => {
  const entry = MESSAGES[key] as Entry | undefined;
  if (!entry) return key;
  return locale === "en" ? entry[1] : entry[0];
};

export type Translator = (key: MessageKey) => string;

export const createTranslator = (locale: Locale): Translator => (key) => translate(key, locale);

/** Format des nombres et des dates selon la langue. */
export const localeTag = (locale: Locale): string => (locale === "en" ? "en-GB" : "fr-FR");
