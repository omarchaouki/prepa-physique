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
  "common.create": ["Creer", "Create"],
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
  "common.firstName": ["Prenom", "First name"],
  "common.lastName": ["Nom", "Last name"],
  "common.birthDate": ["Date de naissance", "Date of birth"],
  "common.notes": ["Notes", "Notes"],
  "common.status": ["Statut", "Status"],
  "common.actions": ["Actions", "Actions"],
  "common.source": ["Source", "Source"],
  "common.value": ["Valeur", "Value"],
  "common.unit": ["Unite", "Unit"],
  "common.years": ["ans", "years"],
  "common.days": ["j", "d"],
  "common.players": ["joueurs", "players"],
  "common.player": ["joueur", "player"],
  "common.viewAll": ["Tout voir", "View all"],
  "common.required": ["obligatoire", "required"],
  "common.optional": ["optionnel", "optional"],
  "common.noData": ["Aucune donnee", "No data"],
  "common.notMeasured": ["non mesure", "not measured"],
  "common.never": ["jamais", "never"],
  "common.of": ["sur", "of"],
  "common.min": ["min", "min"],

  // --- Navigation -----------------------------------------------------------
  "nav.dashboard": ["Tableau de bord", "Dashboard"],
  "nav.teams": ["Equipes", "Teams"],
  "nav.players": ["Joueurs", "Players"],
  "nav.sessions": ["Passations", "Test sessions"],
  "nav.analytics": ["Analyses", "Analytics"],
  "nav.reference": ["Referentiel des tests", "Test reference"],
  "nav.settings": ["Parametres", "Settings"],
  "nav.evaluation": ["Evaluation", "Assessment"],
  "nav.account": ["Compte", "Account"],
  "nav.owner": ["Proprietaire", "Owner"],
  "nav.adminPanel": ["Panel administrateur", "Administrator panel"],
  "nav.overview": ["Vue globale", "Overview"],
  "nav.management": ["Gestion", "Management"],
  "nav.organizations": ["Clubs", "Clubs"],
  "nav.users": ["Utilisateurs", "Users"],
  "nav.audit": ["Journal d'audit", "Audit log"],
  "nav.application": ["Application", "Application"],
  "nav.teamSpace": ["Espace equipes", "Team workspace"],
  "nav.open": ["Ouvrir la navigation", "Open navigation"],
  "nav.close": ["Fermer la navigation", "Close navigation"],
  "nav.main": ["Navigation principale", "Main navigation"],

  // --- Connexion ------------------------------------------------------------
  "login.title": ["Connexion", "Sign in"],
  "login.subtitle": ["Accedez a l'espace de votre equipe.", "Access your team workspace."],
  "login.email": ["Adresse email", "Email address"],
  "login.password": ["Mot de passe", "Password"],
  "login.submit": ["Se connecter", "Sign in"],
  "login.pending": ["Connexion en cours", "Signing in"],
  "login.showPassword": ["Afficher le mot de passe", "Show password"],
  "login.hidePassword": ["Masquer le mot de passe", "Hide password"],
  "login.demoAccounts": ["Comptes de demonstration", "Demo accounts"],
  "login.signOut": ["Deconnexion", "Sign out"],
  "login.signOutAction": ["Se deconnecter", "Sign out"],
  "login.heroTitle": [
    "La preparation physique du football, appuyee sur les donnees.",
    "Football physical preparation, driven by data.",
  ],
  "login.heroBody": [
    "Batterie de tests complete, calculs automatiques issus de la litterature scientifique, profils individuels compares aux normes de la population, detection des asymetries et recommandations de programmation.",
    "Complete test battery, automatic calculations drawn from the scientific literature, individual profiles compared with population norms, asymmetry detection and programming recommendations.",
  ],
  "login.heroPoint1": [
    "Profil force vitesse horizontal par la methode de Samozino",
    "Horizontal force velocity profile using the Samozino method",
  ],
  "login.heroPoint2": [
    "Depistage du risque lesionnel : Nordic, adducteurs, asymetries",
    "Injury risk screening: Nordic, adductors, asymmetries",
  ],
  "login.heroPoint3": [
    "Capacite intermittente et vitesses de prescription individualisees",
    "Intermittent capacity and individualised prescription speeds",
  ],
  "login.heroPoint4": [
    "Maturation biologique et adaptation de la charge chez les jeunes",
    "Biological maturation and load adjustment in youth players",
  ],
  "login.heroFooter": [
    "Les valeurs de reference proviennent de travaux publies. Chaque calcul cite sa source dans le referentiel de l'application.",
    "Reference values come from published research. Every calculation cites its source in the application reference section.",
  ],
  "login.errorGeneric": [
    "Adresse email ou mot de passe incorrect.",
    "Incorrect email address or password.",
  ],
  "login.errorDisabled": [
    "Ce compte est desactive. Contacter l'administrateur.",
    "This account is disabled. Contact your administrator.",
  ],
  "login.errorSuspended": [
    "L'acces de votre club est suspendu. Contacter l'administrateur.",
    "Your club's access is suspended. Contact your administrator.",
  ],

  // --- Tableau de bord ------------------------------------------------------
  "dashboard.greeting": ["Bonjour", "Hello"],
  "dashboard.subtitle": [
    "Vue d'ensemble de vos equipes, des dernieres passations et des joueurs a surveiller.",
    "Overview of your teams, recent test sessions and players to watch.",
  ],
  "dashboard.newSession": ["Nouvelle passation", "New test session"],
  "dashboard.statTeams": ["Equipes", "Teams"],
  "dashboard.statTeamsHintOne": ["suivie", "tracked"],
  "dashboard.statTeamsHintMany": ["suivies", "tracked"],
  "dashboard.statPlayers": ["Joueurs", "Players"],
  "dashboard.statPlayersHint": ["indisponibles", "unavailable"],
  "dashboard.statSessions": ["Passations", "Sessions"],
  "dashboard.statSessionsHint": ["depuis le debut", "since the start"],
  "dashboard.statLastTest": ["Dernier test", "Last test"],
  "dashboard.statLastTestNone": ["aucune donnee", "no data"],
  "dashboard.watchlist": ["Joueurs a surveiller", "Players to watch"],
  "dashboard.watchlistSubtitle": [
    "Classes par gravite des alertes issues des dernieres mesures",
    "Ranked by severity of the alerts from the latest measurements",
  ],
  "dashboard.noAlerts": ["Aucune alerte active", "No active alerts"],
  "dashboard.noAlertsBody": [
    "Aucun joueur ne depasse les seuils de vigilance sur les tests enregistres.",
    "No player exceeds the warning thresholds on the recorded tests.",
  ],
  "dashboard.recentSessions": ["Dernieres passations", "Recent sessions"],
  "dashboard.recentSessionsSubtitle": ["Les cinq plus recentes", "The five most recent"],
  "dashboard.noSessions": ["Aucune passation", "No test session"],
  "dashboard.noSessionsBody": [
    "Commencez par creer une session de tests.",
    "Start by creating a test session.",
  ],
  "dashboard.createSession": ["Creer une passation", "Create a session"],
  "dashboard.yourTeams": ["Vos equipes", "Your teams"],
  "dashboard.yourTeamsSubtitle": [
    "Acces direct a l'effectif et aux analyses",
    "Direct access to the squad and analytics",
  ],
  "dashboard.noTeams": ["Aucune equipe", "No team"],
  "dashboard.noTeamsBody": [
    "Votre administrateur doit vous rattacher a une equipe pour commencer.",
    "Your administrator needs to assign you to a team to get started.",
  ],
  "dashboard.criticalOne": ["critique", "critical"],
  "dashboard.criticalMany": ["critiques", "critical"],
  "dashboard.alerts": ["alertes", "alerts"],
  "dashboard.results": ["resultats", "results"],
  "dashboard.sessions": ["passations", "sessions"],

  // --- Equipes --------------------------------------------------------------
  "teams.title": ["Equipes", "Teams"],
  "teams.subtitle": [
    "Chaque equipe regroupe son effectif, ses passations de tests et ses analyses.",
    "Each team holds its squad, its test sessions and its analytics.",
  ],
  "teams.none": ["Aucune equipe accessible", "No team available"],
  "teams.noneBody": [
    "Demandez a l'administrateur de votre club de vous rattacher a une equipe.",
    "Ask your club administrator to assign you to a team.",
  ],
  "teams.season": ["Saison", "Season"],
  "teams.squad": ["Effectif", "Squad"],
  "teams.squadSubtitle": [
    "Dernieres valeurs mesurees, comparees a la population de reference",
    "Latest measured values, compared with the reference population",
  ],
  "teams.referencePopulation": ["population de reference", "reference population"],
  "teams.analytics": ["Analyses", "Analytics"],
  "teams.viewSquad": ["Voir l'effectif", "View squad"],
  "teams.statSquad": ["Effectif", "Squad size"],
  "teams.statAvailable": ["disponibles", "available"],
  "teams.statTested": ["Joueurs testes", "Players tested"],
  "teams.statAlerts": ["Alertes", "Alerts"],
  "teams.statAlertsHint": ["sur l'ensemble du groupe", "across the whole squad"],
  "teams.statCritical": ["Alertes critiques", "Critical alerts"],
  "teams.statCriticalHint": ["a traiter en priorite", "to address first"],
  "teams.noPlayers": ["Aucun joueur dans cette equipe", "No player in this team"],
  "teams.noPlayersBody": [
    "Ajoutez les joueurs avant de programmer une passation de tests.",
    "Add players before scheduling a test session.",
  ],
  "teams.noTestData": ["Aucune donnee de test", "No test data"],
  "teams.noTestDataBody": [
    "Les joueurs sont enregistres mais aucun test n'a encore ete saisi.",
    "Players are registered but no test has been entered yet.",
  ],
  "teams.groupStats": ["Statistiques du groupe", "Squad statistics"],
  "teams.groupStatsSubtitle": [
    "Moyenne, ecart type et effectif mesure pour chaque qualite",
    "Mean, standard deviation and sample size for each quality",
  ],
  "teams.metric": ["Metrique", "Metric"],
  "teams.mean": ["Moyenne", "Mean"],
  "teams.sd": ["Ecart type", "Standard deviation"],
  "teams.cv": ["Coefficient de variation", "Coefficient of variation"],
  "teams.measured": ["Joueurs mesures", "Players measured"],
  "teams.cvNote": [
    "Un coefficient de variation eleve signale un groupe heterogene sur cette qualite, donc un besoin d'individualisation plus fort.",
    "A high coefficient of variation signals a heterogeneous squad on this quality, and therefore a stronger need for individualisation.",
  ],
  "teams.masculine": ["Masculin", "Men"],
  "teams.feminine": ["Feminin", "Women"],

  // --- Tableau d'effectif ---------------------------------------------------
  "squad.searchPlayer": ["Rechercher un joueur", "Search for a player"],
  "squad.filterPosition": ["Filtrer par poste", "Filter by position"],
  "squad.allPositions": ["Tous les postes", "All positions"],
  "squad.player": ["Joueur", "Player"],
  "squad.position": ["Poste", "Position"],
  "squad.age": ["Age", "Age"],
  "squad.alerts": ["Alertes", "Alerts"],
  "squad.groupAverage": ["Moyenne du groupe", "Squad average"],
  "squad.noMatch": [
    "Aucun joueur ne correspond a cette recherche.",
    "No player matches this search.",
  ],
  "squad.caption": [
    "Effectif avec les dernieres valeurs mesurees et leur percentile par rapport a la population de reference",
    "Squad with the latest measured values and their percentile against the reference population",
  ],
  "squad.legend": [
    "Le petit chiffre a cote de chaque valeur est le percentile par rapport a la population de reference, 50 correspondant a la moyenne publiee pour cette categorie. Les indices d'asymetrie sont lus par seuil et non par percentile : leur distribution est bornee a zero, un rang gaussien y serait trompeur. Les seuils retenus sont 10% pour la vigilance et 15% pour l'alerte.",
    "The small figure beside each value is the percentile against the reference population, where 50 is the published mean for that category. Asymmetry indices are read against thresholds rather than percentiles: their distribution is bounded at zero, so a gaussian rank would be misleading. The thresholds used are 10% for caution and 15% for alert.",
  ],
  "squad.thresholdOk": ["ok", "ok"],
  "squad.thresholdWarn": ["vig", "warn"],

  // --- Joueurs --------------------------------------------------------------
  "players.title": ["Joueurs", "Players"],
  "players.subtitle": [
    "Tous les joueurs des equipes auxquelles vous avez acces.",
    "Every player from the teams you have access to.",
  ],
  "players.none": ["Aucun joueur", "No player"],
  "players.noneBody": [
    "Les joueurs apparaitront ici des qu'une equipe vous sera rattachee.",
    "Players will appear here once a team is assigned to you.",
  ],
  "players.team": ["Equipe", "Team"],
  "players.height": ["Taille", "Height"],
  "players.weight": ["Masse", "Body mass"],
  "players.tests": ["Tests", "Tests"],
  "players.jersey": ["Numero", "Number"],
  "players.foot": ["Pied", "Foot"],
  "players.footLeft": ["gauche", "left"],
  "players.footRight": ["droit", "right"],
  "players.footBoth": ["des deux", "both"],

  // --- Fiche joueur ---------------------------------------------------------
  "player.profile": ["Profil physique", "Physical profile"],
  "player.profileSubtitle": [
    "Percentiles par rapport a la population de reference",
    "Percentiles against the reference population",
  ],
  "player.recommendations": ["Recommandations", "Recommendations"],
  "player.recommendationsSubtitle": [
    "Issues des dernieres mesures et des seuils publies",
    "Derived from the latest measurements and published thresholds",
  ],
  "player.noRecommendations": ["Aucune recommandation", "No recommendation"],
  "player.noRecommendationsBody": [
    "Aucun seuil n'est franchi sur les donnees disponibles.",
    "No threshold is crossed on the available data.",
  ],
  "player.trend": ["Evolution dans le temps", "Change over time"],
  "player.trendSubtitle": [
    "Comparee a la moyenne de la population de reference",
    "Compared with the reference population mean",
  ],
  "player.asymmetry": ["Comparaison gauche droite", "Left right comparison"],
  "player.asymmetrySubtitle": [
    "Un ecart superieur a 10 a 15% justifie un travail unilateral",
    "A gap above 10 to 15% warrants unilateral work",
  ],
  "player.fvProfile": ["Profil force vitesse horizontal", "Horizontal force velocity profile"],
  "player.fvProfileSubtitle": [
    "Methode de Samozino, reconstruite a partir des temps de passage",
    "Samozino method, rebuilt from the split times",
  ],
  "player.fvUnavailable": ["Profil non disponible", "Profile unavailable"],
  "player.fvUnavailableBody": [
    "Realiser un sprint lineaire avec au moins deux temps de passage pour reconstruire le profil.",
    "Run a linear sprint with at least two split times to rebuild the profile.",
  ],
  "player.fvNote": [
    "F0 represente la force horizontale disponible au demarrage, V0 la vitesse theorique maximale. Le rapport entre les deux oriente le contenu du travail de vitesse.",
    "F0 is the horizontal force available at the start, V0 the theoretical maximum velocity. The ratio between the two guides the content of speed training.",
  ],
  "player.allMeasures": ["Toutes les mesures", "All measurements"],
  "player.allMeasuresSubtitle": [
    "Classees du percentile le plus faible au plus eleve",
    "Ordered from the lowest to the highest percentile",
  ],
  "player.history": ["Historique des passations", "Test history"],
  "player.historySubtitle": [
    "Tests enregistres pour ce joueur",
    "Tests recorded for this player",
  ],
  "player.noTests": ["Aucun test enregistre", "No test recorded"],
  "player.change": ["Evolution", "Change"],
  "player.reference": ["Reference", "Reference"],
  "player.percentile": ["Percentile", "Percentile"],
  "player.group": ["Groupe", "Squad"],
  "player.measure": ["Mesure", "Measurement"],
  "player.left": ["Gauche", "Left"],
  "player.right": ["Droite", "Right"],
  "player.gap": ["Ecart", "Gap"],
  "player.test": ["Test", "Test"],
  "player.session": ["Passation", "Session"],
  "player.standaloneEntry": ["saisie isolee", "standalone entry"],
  "player.notReferenced": ["non reference", "no reference"],
  "player.belowThreshold": ["Sous le seuil", "Below threshold"],
  "player.caution": ["Vigilance", "Caution"],
  "player.aboveThreshold": ["Au dela du seuil", "Above threshold"],
  "player.thresholdTitle": [
    "Lecture des metriques sans percentile",
    "Reading metrics without a percentile",
  ],
  "player.thresholdBody": [
    "Les indices d'asymetrie sont lus par seuil publie, pas en percentile : leur distribution est bornee a zero et un rang gaussien y serait trompeur. Les autres mesures sans reference restent suivies dans le temps par rapport a l'historique du joueur, ce qui est de toute facon la comparaison la plus fiable.",
    "Asymmetry indices are read against published thresholds rather than percentiles: their distribution is bounded at zero and a gaussian rank would be misleading. Other unreferenced measurements are still tracked over time against the player's own history, which is the most reliable comparison anyway.",
  ],
  "player.footer": [
    "Les percentiles situent le joueur par rapport aux valeurs publiees pour sa categorie. Ce sont des reperes de population, pas des objectifs individuels. La reference la plus fiable reste l'evolution du joueur par rapport a lui meme.",
    "Percentiles place the player against published values for their category. These are population landmarks, not individual targets. The most reliable reference remains the player's change against their own history.",
  ],
  "player.testNotDone": ["test non realise", "test not performed"],
  "player.percentileSuffix": ["e percentile", "th percentile"],
  "player.selectMetric": ["Choisir la metrique a afficher", "Choose the metric to display"],
  "player.sinceFirst": ["depuis la premiere mesure", "since the first measurement"],
  "player.firstMeasure": ["Premiere mesure", "First measurement"],
  "player.lastMeasure": ["Derniere mesure", "Latest measurement"],
  "player.measurements": ["mesures", "measurements"],
  "player.populationReference": ["Reference population", "Population reference"],
  "player.noTrend": [
    "Aucune metrique disposant d'au moins deux mesures. L'evolution apparaitra apres la deuxieme passation.",
    "No metric has at least two measurements. Trends will appear after the second session.",
  ],
  "player.noBilateral": ["Aucune mesure bilaterale", "No bilateral measurement"],
  "player.dose": ["Dose", "Dose"],

  // --- Passations -----------------------------------------------------------
  "sessions.title": ["Passations", "Test sessions"],
  "sessions.subtitle": [
    "Chaque passation regroupe une date, une equipe et une ou plusieurs batteries de tests.",
    "Each session groups a date, a team and one or more test batteries.",
  ],
  "sessions.none": ["Aucune passation", "No session"],
  "sessions.noneBody": [
    "Creez une passation pour saisir les resultats de toute une equipe en une seule fois.",
    "Create a session to enter results for a whole team at once.",
  ],
  "sessions.session": ["Passation", "Session"],
  "sessions.tests": ["Tests", "Tests"],
  "sessions.results": ["Resultats", "Results"],
  "sessions.new": ["Nouvelle passation", "New session"],
  "sessions.newSubtitle": [
    "Choisissez l'equipe, la date et les tests. La grille de saisie sera construite automatiquement a partir du protocole de chaque test.",
    "Choose the team, the date and the tests. The entry grid is built automatically from each test protocol.",
  ],
  "sessions.info": ["Informations", "Details"],
  "sessions.infoSubtitle": [
    "Quand, avec quelle equipe et dans quelles conditions",
    "When, with which team and under what conditions",
  ],
  "sessions.team": ["Equipe", "Team"],
  "sessions.sessionName": ["Nom de la passation", "Session name"],
  "sessions.namePlaceholder": [
    "Bilan de reprise, controle mi saison, retour au jeu...",
    "Preseason assessment, mid season control, return to play...",
  ],
  "sessions.surface": ["Surface", "Surface"],
  "sessions.surfaceNone": ["Non precisee", "Not specified"],
  "sessions.surfaceGrass": ["Pelouse naturelle", "Natural grass"],
  "sessions.surfaceArtificial": ["Synthetique", "Artificial turf"],
  "sessions.surfaceIndoor": ["Salle", "Indoor"],
  "sessions.surfaceTrack": ["Piste", "Track"],
  "sessions.temperature": ["Temperature", "Temperature"],
  "sessions.temperatureUnit": ["degres Celsius", "degrees Celsius"],
  "sessions.temperatureHelp": [
    "Utilisee pour corriger la densite de l'air dans le profil de sprint.",
    "Used to correct air density in the sprint profile.",
  ],
  "sessions.notesPlaceholder": [
    "Conditions, absences, remarques",
    "Conditions, absences, remarks",
  ],
  "sessions.batteries": ["Batteries pretes a l'emploi", "Ready made batteries"],
  "sessions.batteriesSubtitle": [
    "Selection rapide, modifiable ensuite test par test",
    "Quick selection, adjustable test by test afterwards",
  ],
  "sessions.perPlayer": ["par joueur", "per player"],
  "sessions.testsToRun": ["Tests a realiser", "Tests to run"],
  "sessions.testsToRunSubtitle": [
    "Cocher les tests, la grille de saisie sera generee automatiquement",
    "Tick the tests, the entry grid is generated automatically",
  ],
  "sessions.clearSelection": ["Tout deselectionner", "Clear selection"],
  "sessions.createSession": ["Creer la passation", "Create session"],
  "sessions.creating": ["Creation", "Creating"],
  "sessions.selectAtLeastOne": [
    "Selectionner au moins un test",
    "Select at least one test",
  ],
  "sessions.protocolMinutes": ["minutes de protocole", "minutes of protocol"],
  "sessions.category": ["categorie", "category"],
  "sessions.statPlayers": ["Joueurs", "Players"],
  "sessions.statPlayersHint": ["dans l'effectif", "in the squad"],
  "sessions.statTests": ["Tests", "Tests"],
  "sessions.statTestsHint": ["dans cette passation", "in this session"],
  "sessions.statEntered": ["Resultats saisis", "Results entered"],
  "sessions.statEnteredHint": ["attendus", "expected"],
  "sessions.statProgress": ["Avancement", "Completion"],
  "sessions.entry": ["Saisie des resultats", "Result entry"],
  "sessions.entrySubtitle": [
    "Un onglet par test. Les valeurs derivees sont calculees a l'enregistrement.",
    "One tab per test. Derived values are computed on save.",
  ],
  "sessions.noPlayersBody": [
    "Aucun joueur dans cette equipe. Ajoutez l'effectif avant de saisir des resultats.",
    "No player in this team. Add the squad before entering results.",
  ],
  "sessions.notesTitle": ["Notes de la passation", "Session notes"],
  "sessions.locked": ["Passation verrouillee", "Session locked"],
  "sessions.lockedBody": [
    "Les resultats ne peuvent plus etre modifies.",
    "Results can no longer be modified.",
  ],
  "sessions.noTests": [
    "Aucun test rattache a cette passation.",
    "No test attached to this session.",
  ],
  "sessions.tabsLabel": ["Tests de la passation", "Session tests"],

  // --- Grille de saisie -----------------------------------------------------
  "entry.protocol": ["Protocole et materiel", "Protocol and equipment"],
  "entry.protocolLabel": ["Protocole", "Protocol"],
  "entry.equipment": ["Materiel", "Equipment"],
  "entry.duration": ["Duree", "Duration"],
  "entry.durationAbout": ["environ", "about"],
  "entry.reference": ["Reference", "Reference"],
  "entry.missingContext": [
    "Donnees morphologiques manquantes",
    "Missing body measurements",
  ],
  "entry.missingContextBody": [
    "n'ont pas de taille ou de masse enregistree. Les calculs qui en dependent utiliseront une valeur par defaut, ce qui fausse le resultat. Realiser d'abord le test d'anthropometrie.",
    "have no recorded height or body mass. Calculations that depend on them will use a default value, which distorts the result. Run the anthropometry test first.",
  ],
  "entry.missingContextOne": [
    "n'a pas de taille ou de masse enregistree. Les calculs qui en dependent utiliseront une valeur par defaut, ce qui fausse le resultat. Realiser d'abord le test d'anthropometrie.",
    "has no recorded height or body mass. Calculations that depend on them will use a default value, which distorts the result. Run the anthropometry test first.",
  ],
  "entry.caption": [
    "Grille de saisie du test",
    "Entry grid for test",
  ],
  "entry.onePlayerPerRow": ["un joueur par ligne", "one player per row"],
  "entry.measures": ["Mesures", "Measurements"],
  "entry.unavailable": ["indisponible", "unavailable"],
  "entry.rowFilled": ["Ligne renseignee", "Row filled in"],
  "entry.rowEmpty": ["Ligne vide", "Empty row"],
  "entry.save": ["Enregistrer", "Save"],
  "entry.playersFilled": ["joueurs renseignes", "players filled in"],
  "entry.autosaveOn": ["Enregistrement automatique", "Autosave on"],
  "entry.autosaved": ["Enregistre a", "Saved at"],
  "entry.savedOnDevice": [
    "Conserve sur l'appareil, envoi au retour du reseau",
    "Kept on the device, sent when the network returns",
  ],

  // --- Reseau et file d'attente ---------------------------------------------
  "offline.offline": ["Hors ligne", "Offline"],
  "offline.syncing": ["Envoi des saisies", "Sending entries"],
  "offline.pendingOne": ["saisie en attente", "entry pending"],
  "offline.pendingMany": ["saisies en attente", "entries pending"],
  "offline.retry": ["Envoyer maintenant", "Send now"],
  "entry.keyboardHint": [
    "Entree ou fleche bas pour passer au joueur suivant",
    "Enter or down arrow moves to the next player",
  ],
  "entry.flagsTitle": [
    "Points d'attention detectes automatiquement",
    "Automatically detected points of attention",
  ],

  // --- Analyses -------------------------------------------------------------
  "analytics.title": ["Analyses", "Analytics"],
  "analytics.subtitle": [
    "Comparez le groupe sur une qualite, croisez deux qualites et reperez les profils atypiques.",
    "Compare the squad on one quality, cross two qualities and spot atypical profiles.",
  ],
  "analytics.noTeam": ["Aucune equipe accessible", "No team available"],
  "analytics.noData": ["Aucune donnee a analyser", "No data to analyse"],
  "analytics.noDataBody": [
    "Realisez une passation de tests pour alimenter les analyses.",
    "Run a test session to feed the analytics.",
  ],
  "analytics.primaryMetric": ["Metrique principale", "Primary metric"],
  "analytics.secondaryMetric": ["Metrique a croiser", "Metric to cross"],
  "analytics.position": ["Poste", "Position"],
  "analytics.allPositions": ["Tous les postes", "All positions"],
  "analytics.groupMean": ["Moyenne du groupe", "Squad mean"],
  "analytics.playersMeasured": ["joueurs mesures", "players measured"],
  "analytics.sd": ["Ecart type", "Standard deviation"],
  "analytics.variation": ["de variation", "variation"],
  "analytics.best": ["Meilleure valeur", "Best value"],
  "analytics.worst": ["Valeur la plus basse", "Lowest value"],
  "analytics.ranking": ["Classement du groupe", "Squad ranking"],
  "analytics.distribution": [
    "Repartition par rapport a la norme",
    "Distribution against the norm",
  ],
  "analytics.distributionHint": [
    "joueurs situes dans la population de reference",
    "players placed against the reference population",
  ],
  "analytics.distributionNote": [
    "Une concentration dans les tranches basses signale un besoin collectif sur cette qualite. Une repartition etalee appelle au contraire une individualisation.",
    "A cluster in the lower bands signals a collective need on that quality. A spread distribution calls for individualisation instead.",
  ],
  "analytics.crossing": ["Croisement de deux qualites", "Crossing two qualities"],
  "analytics.crossingVersus": ["face a", "against"],
  "analytics.crossingNote": [
    "Croiser deux qualites fait apparaitre les profils atypiques : un joueur rapide mais peu endurant, un joueur fort mais lent. Ce sont ces cas qui demandent un travail specifique.",
    "Crossing two qualities reveals atypical profiles: a fast but poorly conditioned player, a strong but slow one. These are the cases that need specific work.",
  ],
  "analytics.perPlayer": ["Detail par joueur", "Player breakdown"],
  "analytics.perPlayerSubtitle": [
    "Trie de la valeur la plus faible a la plus elevee",
    "Sorted from the lowest to the highest value",
  ],
  "analytics.gapToMean": ["Ecart a la moyenne du groupe", "Gap to squad mean"],
  "analytics.bandVeryLow": ["Tres faible", "Very low"],
  "analytics.bandLow": ["Faible", "Low"],
  "analytics.bandAverage": ["Moyen", "Average"],
  "analytics.bandGood": ["Bon", "Good"],
  "analytics.bandVeryGood": ["Tres bon", "Very good"],

  // --- Referentiel ----------------------------------------------------------
  "reference.title": ["Referentiel des tests", "Test reference"],
  "reference.subtitle": [
    "Protocole, materiel, duree et source scientifique de chaque test disponible dans l'application. Ce sont ces protocoles qui rendent les comparaisons valides d'une passation a l'autre.",
    "Protocol, equipment, duration and scientific source for every test in the application. These protocols are what make comparisons valid from one session to the next.",
  ],
  "reference.batteries": ["Batteries pretes a l'emploi", "Ready made batteries"],
  "reference.batteriesSubtitle": [
    "Regroupements de tests alignes sur les moments cles de la saison",
    "Test groupings aligned with the key moments of the season",
  ],
  "reference.when": ["Quand", "When"],
  "reference.fields": ["Valeurs a saisir", "Values to enter"],
  "reference.field": ["Champ", "Field"],
  "reference.precision": ["Precision", "Guidance"],
  "reference.norms": ["Valeurs de reference", "Reference values"],
  "reference.normsSubtitle": [
    "Moyennes et ecarts types utilises pour calculer les percentiles",
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
    "Travaux qui fondent les calculs et les valeurs de reference",
    "Research underpinning the calculations and reference values",
  ],
  "reference.footer": [
    "Les valeurs de reference sont des reperes de population issus d'echantillons publies. Elles servent a situer un joueur, pas a fixer un objectif. La comparaison la plus fiable reste toujours l'evolution du joueur par rapport a ses propres mesures anterieures.",
    "Reference values are population landmarks drawn from published samples. They serve to place a player, not to set a target. The most reliable comparison remains the player's change against their own earlier measurements.",
  ],

  // --- Parametres -----------------------------------------------------------
  "settings.title": ["Parametres", "Settings"],
  "settings.subtitle": ["Votre compte et vos acces.", "Your account and access."],
  "settings.account": ["Compte", "Account"],
  "settings.role": ["Role", "Role"],
  "settings.jobTitle": ["Fonction", "Job title"],
  "settings.jobTitleNone": ["non renseignee", "not provided"],
  "settings.organization": ["Organisation", "Organisation"],
  "settings.organizationNone": [
    "aucune (compte proprietaire)",
    "none (owner account)",
  ],
  "settings.createdAt": ["Compte cree le", "Account created on"],
  "settings.lastLogin": ["Derniere connexion", "Last sign in"],
  "settings.firstLogin": ["premiere connexion", "first sign in"],
  "settings.teams": ["Equipes rattachees", "Assigned teams"],
  "settings.accessManage": ["gestion", "manage"],
  "settings.accessView": ["lecture", "view"],
  "settings.password": ["Mot de passe", "Password"],
  "settings.passwordSubtitle": [
    "Le changer deconnecte toutes vos autres sessions",
    "Changing it signs out all your other sessions",
  ],
  "settings.currentPassword": ["Mot de passe actuel", "Current password"],
  "settings.newPassword": ["Nouveau mot de passe", "New password"],
  "settings.confirmPassword": [
    "Confirmer le nouveau mot de passe",
    "Confirm the new password",
  ],
  "settings.passwordHint": ["Au moins 8 caracteres.", "At least 8 characters."],
  "settings.changePassword": ["Changer le mot de passe", "Change password"],
  "settings.updating": ["Mise a jour", "Updating"],
  "settings.language": ["Langue", "Language"],
  "settings.languageSubtitle": [
    "S'applique a l'interface et aux protocoles de tests",
    "Applies to the interface and the test protocols",
  ],
  "settings.theme": ["Theme", "Theme"],
  "settings.themeLight": ["Theme clair", "Light theme"],
  "settings.themeDark": ["Theme sombre", "Dark theme"],
  "settings.themeSystem": ["Theme du systeme", "System theme"],

  // --- Panel proprietaire ---------------------------------------------------
  "admin.title": ["Panel proprietaire", "Owner panel"],
  "admin.subtitle": [
    "Vue globale de tous les clients, de leur activite et des actions realisees dans l'application.",
    "Global view of every client, their activity and the actions taken in the application.",
  ],
  "admin.clubs": ["Clubs", "Clubs"],
  "admin.clubsActive": ["actifs", "active"],
  "admin.users": ["Utilisateurs", "Users"],
  "admin.usersActive": ["actifs", "active"],
  "admin.usersRecent": ["connectes sur 30 jours", "signed in over 30 days"],
  "admin.teams": ["Equipes", "Teams"],
  "admin.data": ["Donnees", "Data"],
  "admin.dataHint": ["passations enregistrees", "sessions recorded"],
  "admin.clientClubs": ["Clubs clients", "Client clubs"],
  "admin.clientClubsSubtitle": [
    "Volume de donnees par organisation",
    "Data volume per organisation",
  ],
  "admin.manage": ["Gerer", "Manage"],
  "admin.plan": ["Forfait", "Plan"],
  "admin.recentActivity": ["Activite recente", "Recent activity"],
  "admin.recentActivitySubtitle": ["Huit dernieres actions", "Last eight actions"],
  "admin.noActivity": ["Aucune action enregistree.", "No action recorded."],
  "admin.quickAccess": ["Acces rapide", "Quick access"],
  "admin.quickAccessSubtitle": [
    "Les operations les plus frequentes",
    "The most frequent operations",
  ],
  "admin.createClub": ["Creer un club", "Create a club"],
  "admin.createClubBody": [
    "Ouvrir un nouveau compte client et definir son forfait.",
    "Open a new client account and set its plan.",
  ],
  "admin.createAccess": ["Creer un acces", "Create an account"],
  "admin.createAccessBody": [
    "Ajouter un preparateur ou un administrateur de club.",
    "Add a physical coach or a club administrator.",
  ],
  "admin.viewAudit": ["Consulter le journal", "Open the audit log"],
  "admin.viewAuditBody": [
    "Verifier qui a fait quoi et quand.",
    "Check who did what and when.",
  ],
  "admin.active": ["Actif", "Active"],
  "admin.suspended": ["Suspendu", "Suspended"],
  "admin.disabled": ["Desactive", "Disabled"],
  "admin.suspend": ["Suspendre", "Suspend"],
  "admin.reactivate": ["Reactiver", "Reactivate"],
  "admin.clubsSubtitle": [
    "Chaque club est isole des autres. Ses utilisateurs ne voient que ses propres equipes et joueurs.",
    "Each club is isolated from the others. Its users only see its own teams and players.",
  ],
  "admin.noClubs": [
    "Aucun club enregistre. Creez le premier avec le formulaire a droite.",
    "No club registered. Create the first one with the form on the right.",
  ],
  "admin.noTeamsForClub": ["Aucune equipe pour ce club.", "No team for this club."],
  "admin.locationUnknown": [
    "Localisation non renseignee",
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
    "Le forfait fixe le nombre maximal d'equipes et de joueurs.",
    "The plan sets the maximum number of teams and players.",
  ],
  "admin.accessEnd": ["Date de fin d'acces", "Access end date"],
  "admin.internalNotes": ["Notes internes", "Internal notes"],
  "admin.newTeam": ["Nouvelle equipe", "New team"],
  "admin.newTeamSubtitle": [
    "Rattachee a un club existant",
    "Attached to an existing club",
  ],
  "admin.club": ["Club", "Club"],
  "admin.teamName": ["Nom de l'equipe", "Team name"],
  "admin.category": ["Categorie", "Category"],
  "admin.sex": ["Sexe", "Sex"],
  "admin.level": ["Niveau", "Level"],
  "admin.season": ["Saison", "Season"],
  "admin.createTeam": ["Creer l'equipe", "Create team"],
  "admin.createClubFirst": ["Creez d'abord un club.", "Create a club first."],
  "admin.teamPopulationHint": [
    "La categorie et le niveau determinent la population de reference utilisee pour les percentiles.",
    "Category and level determine the reference population used for percentiles.",
  ],
  "admin.usersSubtitle": [
    "Tous les comptes de la plateforme, tous clubs confondus.",
    "Every account on the platform, across all clubs.",
  ],
  "admin.accounts": ["comptes", "accounts"],
  "admin.accountsSubtitle": [
    "Classes par role puis par nom",
    "Ordered by role then by name",
  ],
  "admin.user": ["Utilisateur", "User"],
  "admin.lastLogin": ["Derniere connexion", "Last sign in"],
  "admin.temporaryPassword": ["mot de passe provisoire", "temporary password"],
  "admin.disableAccount": ["Desactiver le compte", "Disable account"],
  "admin.enableAccount": ["Reactiver le compte", "Enable account"],
  "admin.impersonate": [
    "Consulter l'application avec ce compte",
    "View the application as this account",
  ],
  "admin.impersonateNote": [
    "L'icone en forme d'oeil ouvre l'application avec le compte du client, pour diagnostiquer un probleme. L'action est enregistree dans le journal d'audit et un bandeau reste visible pendant toute la session. Vous ne voyez jamais son mot de passe.",
    "The eye icon opens the application using the client's account, to diagnose a problem. The action is recorded in the audit log and a banner stays visible for the whole session. You never see their password.",
  ],
  "admin.impersonating": [
    "Vous consultez ce compte en tant que proprietaire",
    "You are viewing this account as the owner",
  ],
  "admin.impersonatingTraced": [
    "Les actions realisees sont tracees.",
    "Actions taken are recorded.",
  ],
  "admin.backToMyAccount": ["Revenir a mon compte", "Back to my account"],
  "admin.newAccess": ["Nouvel acces", "New account"],
  "admin.newAccessSubtitle": [
    "Le compte devra changer son mot de passe",
    "The account will have to change its password",
  ],
  "admin.fullName": ["Nom complet", "Full name"],
  "admin.jobTitlePlaceholder": [
    "Preparateur physique, entraineur adjoint...",
    "Physical coach, assistant coach...",
  ],
  "admin.temporaryPasswordLabel": ["Mot de passe provisoire", "Temporary password"],
  "admin.generatePassword": ["Generer un mot de passe", "Generate a password"],
  "admin.temporaryPasswordHint": [
    "A transmettre au client par un canal sur. Il devra le changer a la premiere connexion.",
    "Send it to the client over a secure channel. They will have to change it on first sign in.",
  ],
  "admin.createAccount": ["Creer le compte", "Create account"],
  "admin.selectClub": ["Selectionner un club", "Select a club"],
  "admin.resetPassword": [
    "Reinitialiser un mot de passe",
    "Reset a password",
  ],
  "admin.resetPasswordSubtitle": [
    "Toutes ses sessions seront fermees",
    "All their sessions will be closed",
  ],
  "admin.account": ["Compte", "Account"],
  "admin.reset": ["Reinitialiser", "Reset"],
  "admin.noOtherAccount": ["Aucun autre compte.", "No other account."],
  "admin.audit": ["Journal d'audit", "Audit log"],
  "admin.auditSubtitle": [
    "Chaque action sensible est enregistree avec son auteur, sa cible et son horodatage.",
    "Every sensitive action is recorded with its author, target and timestamp.",
  ],
  "admin.auditAll": ["Toutes", "All"],
  "admin.auditNone": ["Aucune entree", "No entry"],
  "admin.timestamp": ["Horodatage", "Timestamp"],
  "admin.action": ["Action", "Action"],
  "admin.author": ["Auteur", "Author"],
  "admin.entity": ["Entite", "Entity"],
  "admin.detail": ["Detail", "Detail"],
  "admin.address": ["Adresse", "Address"],
  "admin.deletedAccount": ["compte supprime", "deleted account"],
  "admin.previousPage": ["Page precedente", "Previous page"],
  "admin.nextPage": ["Page suivante", "Next page"],
  "admin.page": ["Page", "Page"],
  "admin.pagination": ["Pagination du journal", "Log pagination"],

  // --- Gestion de l'effectif et des equipes ---------------------------------
  "manage.title": ["Gestion de l'equipe", "Team management"],
  "manage.subtitle": [
    "Effectif, reglages de l'equipe et staff rattache.",
    "Squad, team settings and assigned staff.",
  ],
  "manage.open": ["Gerer", "Manage"],
  "manage.squad": ["Effectif", "Squad"],
  "manage.squadSubtitle": [
    "Ajouter, modifier ou sortir un joueur de l'effectif",
    "Add, edit or remove a player from the squad",
  ],
  "manage.addPlayer": ["Ajouter un joueur", "Add a player"],
  "manage.addPlayerSubtitle": [
    "Le formulaire reste ouvert pour enchainer tout l'effectif",
    "The form stays open so you can enter the whole squad in one go",
  ],
  "manage.editPlayer": ["Modifier le joueur", "Edit player"],
  // Le nom de l'equipe est ajoute apres cette phrase : l'ajout se fait toujours
  // dans une equipe precise, et le message doit le rappeler.
  "manage.playerAddedTo": ["a ete ajoute a", "has been added to"],
  "manage.playerSaved": ["Joueur enregistre.", "Player saved."],
  "manage.playerTeamHint": [
    "Le joueur sera ajoute a cette equipe.",
    "The player will be added to this team.",
  ],
  "manage.sexFromTeam": [
    "Sexe defini par l'equipe",
    "Sex set by the team",
  ],
  "manage.playersRealigned": [
    "joueur(s) realigne(s) sur le sexe de l'equipe.",
    "player(s) realigned to the team's sex.",
  ],
  "manage.playerInvalid": [
    "Verifier les champs obligatoires : nom, prenom et date de naissance.",
    "Check the required fields: last name, first name and date of birth.",
  ],
  "manage.playerNotFound": ["Joueur introuvable.", "Player not found."],
  "manage.playerLimit": [
    "Le forfait de ce club plafonne le nombre de joueurs :",
    "This club's plan caps the number of players:",
  ],
  "manage.teamLimit": [
    "Le forfait de ce club plafonne le nombre d'equipes :",
    "This club's plan caps the number of teams:",
  ],
  "manage.teamNotFound": ["Equipe introuvable.", "Team not found."],
  "manage.clubNotFound": ["Club introuvable.", "Club not found."],
  "manage.teamInvalid": [
    "Verifier le nom et la saison de l'equipe.",
    "Check the team name and season.",
  ],
  "manage.clubInvalid": ["Verifier le nom du club.", "Check the club name."],
  "manage.teamCreated": ["a ete creee.", "has been created."],
  "manage.teamSaved": ["Equipe enregistree.", "Team saved."],
  "manage.clubSaved": ["Club enregistre.", "Club saved."],
  "manage.forbidden": [
    "Vous n'avez pas les droits pour cette action.",
    "You do not have permission for this action.",
  ],
  "manage.teamSettings": ["Reglages de l'equipe", "Team settings"],
  "manage.teamSettingsSubtitle": [
    "La categorie et le niveau determinent la population de reference des percentiles",
    "Category and level determine the reference population used for percentiles",
  ],
  "manage.staff": ["Staff rattache", "Assigned staff"],
  "manage.staffSubtitle": [
    "Qui peut consulter et modifier cette equipe",
    "Who can view and edit this team",
  ],
  "manage.staffAdded": ["a ete rattache a l'equipe.", "has been assigned to the team."],
  "manage.staffNone": ["Aucun staff rattache.", "No staff assigned."],
  "manage.addStaff": ["Rattacher", "Assign"],
  "manage.removeStaff": ["Retirer du staff", "Remove from staff"],
  "manage.userNotInClub": [
    "Cet utilisateur n'appartient pas a ce club.",
    "This user does not belong to this club.",
  ],
  "manage.accessLevel": ["Droits", "Access"],
  "manage.newTeam": ["Nouvelle equipe", "New team"],
  "manage.newTeamSubtitle": [
    "Une equipe supplementaire dans votre club",
    "An additional team in your club",
  ],
  "manage.club": ["Mon club", "My club"],
  "manage.clubSubtitle": [
    "Coordonnees du club et forfait en cours",
    "Club details and current plan",
  ],
  "manage.clubIdentity": ["Identite du club", "Club details"],
  "manage.plan": ["Forfait", "Plan"],
  "manage.planSubtitle": [
    "Modifiable uniquement par l'editeur de l'application",
    "Only the application publisher can change this",
  ],
  "manage.planLimits": ["Plafonds", "Limits"],
  "manage.deletePlayer": ["Supprimer definitivement", "Delete permanently"],
  "manage.deletePlayerHint": [
    "Efface le joueur et tout son historique de mesures. Pour sortir un joueur de l'effectif en conservant ses donnees, passer son statut a Parti.",
    "Erases the player and their whole measurement history. To remove a player from the squad while keeping their data, set their status to Left.",
  ],
  "manage.deleteConfirm": [
    "Supprimer ce joueur et tout son historique ?",
    "Delete this player and their whole history?",
  ],
  "manage.transferTeam": ["Equipe", "Team"],
  "manage.secondaryPosition": ["Poste secondaire", "Secondary position"],
  "manage.externalId": ["Identifiant externe", "External identifier"],
  "manage.externalIdHint": [
    "Identifiant GPS ou federation, pour rapprocher les imports",
    "GPS or federation identifier, used to match imports",
  ],
  "manage.teamColor": ["Couleur", "Colour"],
  "manage.noneOption": ["Aucun", "None"],
  "manage.archived": ["Archivee", "Archived"],
  "manage.archive": ["Archiver l'equipe", "Archive team"],
  "manage.unarchive": ["Reactiver l'equipe", "Reactivate team"],
  "manage.archiveHint": [
    "Une equipe archivee disparait des listes mais conserve toutes ses donnees.",
    "An archived team disappears from the lists but keeps all its data.",
  ],
  "manage.backToTeam": ["Retour a l'equipe", "Back to team"],

  // --- Etats et erreurs -----------------------------------------------------
  "error.notFound": ["Page introuvable", "Page not found"],
  "error.notFoundBody": [
    "La page demandee n'existe pas ou vous n'avez pas les droits pour y acceder.",
    "The requested page does not exist or you do not have permission to view it.",
  ],
  "error.backToDashboard": ["Retour au tableau de bord", "Back to dashboard"],
  "error.loadingData": ["Chargement des donnees", "Loading data"],
  "error.loadingChart": ["Chargement du graphique", "Loading chart"],
  "error.loadingTable": ["Chargement du tableau", "Loading table"],
  "error.loadingList": ["Chargement de la liste", "Loading list"],
  "error.loadingProfile": ["Chargement du profil", "Loading profile"],
  "error.loadingCards": ["Chargement des cartes", "Loading cards"],
  "error.loadingIndicators": ["Chargement des indicateurs", "Loading indicators"],
  "error.pageProgress": ["Chargement de la page", "Page loading"],

  // --- Graphiques -----------------------------------------------------------
  "chart.noMeasurement": ["Aucune mesure enregistree", "No measurement recorded"],
  "chart.needThree": [
    "Il faut au moins trois qualites mesurees pour tracer le profil. Completer la batterie de tests.",
    "At least three measured qualities are needed to plot the profile. Complete the test battery.",
  ],
  "chart.needTwo": [
    "Il faut au moins deux joueurs disposant des deux mesures pour tracer ce croisement.",
    "At least two players with both measurements are needed to plot this crossing.",
  ],
  "chart.noMetricData": ["Aucune donnee pour cette metrique", "No data for this metric"],
  "chart.noBilateral": ["Aucune mesure bilaterale", "No bilateral measurement"],
  "chart.squadMean": ["Moyenne equipe", "Squad mean"],
  "chart.reference": ["Reference", "Reference"],
  "chart.speed": ["Vitesse", "Speed"],
  "chart.force": ["Force", "Force"],
  "chart.power": ["Puissance", "Power"],
  "chart.level": ["Niveau", "Level"],
  "chart.gapBetweenSides": [
    "Ecart entre les deux cotes",
    "Gap between the two sides",
  ],
  "chart.strongSide": ["cote fort", "strong side"],
  "chart.gap": ["Ecart", "Gap"],
  "chart.percentileSuffix": ["e percentile", "th percentile"],

  // --- Inscription publique -------------------------------------------------
  "signup.title": ["Creer votre club", "Create your club"],
  "signup.subtitle": [
    "Trente joueurs gratuits, sans limite de duree et sans carte bancaire.",
    "Thirty players free, with no time limit and no card.",
  ],
  "signup.club": ["Nom du club", "Club name"],
  "signup.clubHint": [
    "Celui que verront les membres de votre staff.",
    "The name your staff will see.",
  ],
  "signup.name": ["Votre nom", "Your name"],
  "signup.email": ["Adresse de courriel", "Email address"],
  "signup.emailHint": [
    "Elle servira a vous connecter.",
    "You will use it to sign in.",
  ],
  "signup.country": ["Pays", "Country"],
  "signup.password": ["Mot de passe", "Password"],
  "signup.passwordHint": ["Dix caracteres au minimum.", "Ten characters minimum."],
  "signup.confirm": ["Confirmer le mot de passe", "Confirm password"],
  "signup.submit": ["Creer mon club", "Create my club"],
  "signup.pending": ["Creation", "Creating"],
  "signup.haveAccount": ["Vous avez deja un compte ?", "Already have an account?"],
  "signup.signIn": ["Se connecter", "Sign in"],
  "signup.noAccount": ["Pas encore de compte ?", "No account yet?"],
  "signup.cta": ["Creer un club gratuitement", "Create a club for free"],
  "signup.ctaShort": ["Commencer gratuitement", "Start for free"],
  "signup.terms": [
    "En creant votre club vous acceptez les conditions generales et la politique de confidentialite.",
    "By creating your club you accept the terms of service and the privacy policy.",
  ],
  "signup.included1": [
    "Trente joueurs, une equipe, sans limite de duree",
    "Thirty players, one team, no time limit",
  ],
  "signup.included2": [
    "Les vingt deux tests et toutes les analyses",
    "All twenty two tests and every analysis",
  ],
  "signup.included3": ["Aucune carte bancaire demandee", "No card required"],

  // --- Page publique --------------------------------------------------------
  // Seule zone de l'application adressee a un visiteur qui ne connait pas le
  // produit. Le ton y est commercial, mais aucune affirmation n'y est inventee :
  // les chiffres viennent du catalogue scientifique et des plafonds de forfait.
  //
  // Regle de redaction tenue ici : phrases courtes, aucun tiret, une idee par
  // ligne. Ce qui ne tient pas en une phrase n'a pas sa place sur une page
  // d'accueil.
  "home.navFeatures": ["Ce que ca mesure", "What it measures"],
  "home.navScience": ["Science", "Science"],
  "home.navPlans": ["Tarifs", "Pricing"],
  "home.navQuestions": ["Questions", "Questions"],
  "home.navLogin": ["Se connecter", "Sign in"],
  "home.navOpenApp": ["Ouvrir l'application", "Open the app"],
  "home.navDemo": ["Demander une demo", "Book a demo"],
  "home.skipToContent": ["Aller au contenu", "Skip to content"],

  // Hero
  "home.heroKicker": ["Preparation physique football", "Football physical preparation"],
  "home.heroLine1": ["Une saison", "A season"],
  "home.heroLine2": ["se mesure.", "is measured."],
  "home.heroBody": [
    "La condition physique de votre effectif, chiffree, comparee a des normes publiees, et expliquee en une page par joueur.",
    "Your squad's physical condition, quantified, compared against published norms, and explained on one page per player.",
  ],
  "home.heroNote": [
    "Trente joueurs gratuits, sans limite de duree. Aucune carte bancaire.",
    "Thirty players free, with no time limit. No card.",
  ],
  "home.heroImageAlt": [
    "Seance de tests physiques sur un terrain de football",
    "Physical testing session on a football pitch",
  ],

  // Bandeau de preuve
  "home.proofTests": ["tests de terrain", "field tests"],
  "home.proofBatteries": ["batteries pretes", "ready batteries"],
  "home.proofNorms": ["lignes de normes", "norm rows"],
  "home.proofPopulations": ["populations de reference", "reference populations"],

  // Le probleme
  "home.gapTitle": [
    "Un carnet ne dit jamais qui progresse",
    "A notebook never tells you who is progressing",
  ],
  "home.gapBody": [
    "Vous mesurez deja. Le probleme n'est pas la mesure, c'est ce qui vient apres : comparer un chiffre a la bonne population, voir une asymetrie avant la blessure, et sortir une reponse en fin de seance plutot qu'en fin de semaine.",
    "You already measure. Measuring is not the problem. What follows is: comparing a number against the right population, spotting an asymmetry before the injury, and having an answer by the end of the session rather than the end of the week.",
  ],
  "home.gap1": [
    "Un dix metres en 1,82 s ne veut rien dire seul. Compare aux U17 nationaux, il devient une decision.",
    "A ten metre split of 1.82 s means nothing on its own. Against national U17 data, it becomes a decision.",
  ],
  "home.gap2": [
    "Une asymetrie de 14 % se lit en trois secondes ici. Sur un tableur, personne ne la voit passer.",
    "A 14 % asymmetry shows up here in three seconds. On a spreadsheet nobody catches it.",
  ],
  "home.gap3": [
    "La charge d'entrainement se calcule seule, a chaque seance saisie, sans une formule a recopier.",
    "Training load computes itself, session after session, with no formula to copy across.",
  ],

  // Methode
  "home.methodTitle": ["Quatre gestes, rien de plus", "Four moves, nothing more"],
  "home.step1Title": ["Vous choisissez la batterie", "Pick the battery"],
  "home.step1Body": [
    "Six batteries pretes, du bilan de reprise au suivi de retour au jeu.",
    "Six ready batteries, from preseason screening to return to play.",
  ],
  "home.step2Title": ["Vous saisissez au bord du terrain", "Enter it pitchside"],
  "home.step2Body": [
    "Une grille par test, au telephone, une main libre pour le chronometre.",
    "One grid per test, on the phone, one hand free for the stopwatch.",
  ],
  "home.step3Title": ["L'application calcule", "The app computes"],
  "home.step3Body": [
    "Profils force vitesse, percentiles, asymetries, maturite. Immediatement.",
    "Force velocity profiles, percentiles, asymmetries, maturity. Immediately.",
  ],
  "home.step4Title": ["Vous decidez", "You decide"],
  "home.step4Body": [
    "Une recommandation ecrite par joueur, avec la reference qui la fonde.",
    "A written recommendation per player, with the reference behind it.",
  ],

  // Ce que ca mesure
  "home.measureTitle": ["Ce que la plateforme mesure", "What the platform measures"],
  "home.measureBody": [
    "Vingt deux tests de terrain, chacun avec son protocole, son materiel et sa reference. Aucun n'a ete ajoute pour faire nombre.",
    "Twenty two field tests, each with its protocol, its equipment and its reference. None was added to pad the list.",
  ],

  // Bande terrain
  "home.fieldTitle": ["Concu pour un terrain, pas pour un bureau", "Built for a pitch, not a desk"],
  "home.fieldBody": [
    "Une saisie qui tient dans une main, un affichage lisible en plein soleil, et une page qui s'ouvre avant que le joueur ait fini son retour au calme.",
    "One handed entry, a display you can read in full sun, and a page that opens before the player has finished cooling down.",
  ],
  "home.fieldPoint1": [
    "Chaque page s'affiche immediatement, les chiffres arrivent ensuite.",
    "Every page appears at once, the numbers follow.",
  ],
  "home.fieldPoint2": [
    "Application Android installable, meme interface que sur ordinateur.",
    "Installable Android app, same interface as on desktop.",
  ],
  "home.fieldPoint3": [
    "Francais et anglais, changeables a tout moment, protocoles compris.",
    "French and English, switchable at any time, protocols included.",
  ],
  "home.fieldImageAlt": [
    "Joueurs a l'entrainement pendant une batterie de tests",
    "Players training during a testing battery",
  ],

  // Staff
  "home.staffTitle": ["Ce que voit le reste du staff", "What the rest of the staff sees"],
  "home.staffBody": [
    "L'entraineur principal n'a pas besoin de vos tableaux. Il a besoin de savoir qui est disponible samedi.",
    "The head coach does not need your spreadsheets. They need to know who is available on Saturday.",
  ],
  "home.staffPoint1": [
    "Un effectif trie par disponibilite reelle",
    "A squad sorted by real availability",
  ],
  "home.staffPoint2": [
    "Les joueurs a surveiller, remontes seuls",
    "Players to watch, surfaced on their own",
  ],
  "home.staffPoint3": [
    "L'evolution d'un joueur sur toute la saison",
    "One player's trajectory across the season",
  ],
  "home.staffPoint4": [
    "Un acces en lecture seule pour qui n'a pas a modifier",
    "Read only access for those who should not edit",
  ],
  "home.staffImageAlt": [
    "Staff technique analysant les resultats d'une seance",
    "Coaching staff reviewing session results",
  ],

  // Science
  "home.scienceTitle": ["Rien n'est estime a l'oeil", "Nothing is estimated by eye"],
  "home.scienceBody": [
    "Chaque calcul porte le nom de la publication dont il vient. Vous pouvez la retrouver, la lire, et contester le resultat.",
    "Every calculation carries the name of the publication it comes from. You can find it, read it, and challenge the result.",
  ],
  "home.scienceNote": [
    "Les normes proviennent d'etudes publiees sur des populations de football. Elles ne remplacent ni un diagnostic ni un avis medical.",
    "Norms come from published studies on football populations. They replace neither a diagnosis nor medical advice.",
  ],

  // Avis
  "home.reviewsTitle": ["Ce qu'en disent les clubs", "What clubs say"],

  // Tarifs
  "home.plansTitle": ["Un tarif par taille de club", "One price per club size"],
  "home.plansSubtitle": [
    "Sans engagement. Resiliable a tout moment depuis votre compte, avec effet a la fin de la periode payee.",
    "No commitment. Cancel any time from your account, effective at the end of the paid period.",
  ],
  "home.plansMonth": ["par mois", "per month"],
  "home.plansVat": ["hors taxes", "excluding VAT"],
  "home.plansTeam": ["equipe", "team"],
  "home.plansTeams": ["equipes", "teams"],
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
    "Toutes les formules donnent acces aux {count} tests, aux normes, aux recommandations et a l'application Android. Le forfait ne limite que le nombre d'equipes et de joueurs suivis.",
    "Every plan includes all {count} tests, the norms, the recommendations and the Android app. The plan limits only how many teams and players you track.",
  ],
  "home.plansWhiteLabel": ["Marque blanche", "White label"],
  "home.plansWhiteLabelBody": [
    "Votre nom, vos couleurs, votre domaine, pour les federations et les groupes de clubs.",
    "Your name, your colours, your domain, for federations and club groups.",
  ],

  // Questions
  "home.faqTitle": ["Questions", "Questions"],
  "home.faq1Q": ["Comment se passe la facturation ?", "How does billing work?"],
  "home.faq1A": [
    "Le forfait gratuit ne se facture jamais, quelle que soit la duree. Sur une formule payante, vous etes preleve chaque mois par carte bancaire, le jour de votre souscription, dans la devise choisie a ce moment la. La facture arrive par courriel le meme jour. Les montants annonces sont hors taxes.",
    "The free plan is never billed, however long you stay on it. On a paid plan you are charged monthly by card, on your signup date, in the currency chosen then. The invoice arrives by email the same day. Prices shown exclude VAT.",
  ],
  "home.faq2Q": ["Puis je arreter quand je veux ?", "Can I stop whenever I want?"],
  "home.faq2A": [
    "Oui. La resiliation se fait depuis votre compte, sans nous ecrire et sans justification. Vous gardez l'acces jusqu'a la fin de la periode deja payee, puis le compte reste consultable trente jours pour vous laisser exporter.",
    "Yes. Cancel from your account, without writing to us and without giving a reason. You keep access until the end of the period already paid, then the account stays readable for thirty days so you can export.",
  ],
  "home.faq3Q": ["Et si je ne suis pas satisfait ?", "What if I am not satisfied?"],
  "home.faq3A": [
    "Le forfait gratuit repond a cette question avant tout paiement, et sans limite de temps : vous pouvez suivre trente joueurs sur une saison entiere sans rien payer. Une fois passe a une formule payante, tout mois entame vous est rembourse integralement si vous en faites la demande dans les quatorze jours suivant le prelevement.",
    "The free plan answers that before any payment, with no time limit: you can track thirty players over a whole season without paying. Once on a paid plan, any started month is refunded in full if you ask within fourteen days of the charge.",
  ],
  "home.faq4Q": ["A qui appartiennent mes donnees ?", "Who owns my data?"],
  "home.faq4A": [
    "A vous. Elles ne sont ni revendues, ni utilisees pour entrainer quoi que ce soit. L'export complet est disponible a tout moment, sans avoir a le demander.",
    "You do. It is never resold, never used to train anything. Full export is available at any time, without asking.",
  ],
  "home.faq5Q": ["Faut il du materiel particulier ?", "Do I need special equipment?"],
  "home.faq5A": [
    "Un chronometre et des plots suffisent pour la majorite des tests. Les cellules photoelectriques et le tapis de saut ameliorent la precision, et l'application tient compte du dispositif utilise dans ses calculs.",
    "A stopwatch and cones cover most tests. Timing gates and a jump mat improve precision, and the app accounts for the device used in its calculations.",
  ],
  "home.faq6Q": ["Combien de temps pour demarrer ?", "How long to get started?"],
  "home.faq6A": [
    "Une demonstration dure vingt minutes. La creation de votre club et de votre premier effectif prend le meme temps. Vous pouvez tester le soir meme.",
    "A demo takes twenty minutes. Creating your club and first squad takes the same. You can test the same evening.",
  ],

  // Contact et pied de page
  "home.finalTitle": ["Passez votre prochaine batterie ici", "Run your next battery here"],
  "home.finalBody": [
    "Vingt minutes, votre effectif reel, la batterie que vous passez deja. Nous repondons sous {hours} heures ouvrees.",
    "Twenty minutes, your real squad, the battery you already run. We answer within {hours} working hours.",
  ],
  "home.contactSalesLabel": ["Commercial et demonstrations", "Sales and demos"],
  "home.contactSupportLabel": ["Assistance et facturation", "Support and billing"],
  "home.contactWhatsapp": ["Ecrire sur WhatsApp", "Message on WhatsApp"],
  "home.demoSubject": [
    "Demonstration Lamsaa preparation physique",
    "Lamsaa physical preparation demo",
  ],
  "home.footerTagline": [
    "Preparation physique football : tests, profils, analyses et recommandations.",
    "Football physical preparation: testing, profiles, analyses and recommendations.",
  ],
  "home.footerProduct": ["Produit", "Product"],
  "home.footerLegal": ["Informations legales", "Legal"],
  "home.footerContact": ["Contact", "Contact"],
  "home.footerRights": ["Tous droits reserves.", "All rights reserved."],
  "home.footerCompanyMissing": [
    "Raison sociale et adresse a renseigner dans le fichier .env du serveur.",
    "Legal name and address to be filled in the server .env file.",
  ],
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
