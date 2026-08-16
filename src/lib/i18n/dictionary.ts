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
  "manage.playerAdded": ["a ete ajoute a l'effectif.", "has been added to the squad."],
  "manage.playerSaved": ["Joueur enregistre.", "Player saved."],
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
