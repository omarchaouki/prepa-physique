import { getLocales } from "expo-localization";

/**
 * Textes de l'application mobile.
 *
 * Meme principe que le dictionnaire du site : une seule source, les deux
 * langues cote a cote, et des cles typees pour qu'une traduction manquante
 * casse la compilation plutot que d'apparaitre en clair devant un client.
 *
 * La langue suit celle du telephone au premier lancement, puis le choix de
 * l'utilisateur s'il en fait un. Les protocoles de tests, eux, viennent du
 * catalogue telecharge, qui porte deja ses champs fr et en.
 */

export type Locale = "fr" | "en";

type Entry = readonly [fr: string, en: string];

export const MESSAGES = {
  "app.name": ["Lamsaa", "Lamsaa"],
  "app.tagline": ["Preparation physique", "Physical preparation"],

  "login.title": ["Connexion", "Sign in"],
  "login.subtitle": [
    "Vos identifiants sont ceux du site.",
    "Use the same credentials as the website.",
  ],
  "login.email": ["Adresse de courriel", "Email address"],
  "login.password": ["Mot de passe", "Password"],
  "login.submit": ["Se connecter", "Sign in"],
  "login.pending": ["Connexion", "Signing in"],
  "login.showPassword": ["Afficher le mot de passe", "Show password"],
  "login.hidePassword": ["Masquer le mot de passe", "Hide password"],
  "login.failed": ["Adresse ou mot de passe incorrect.", "Incorrect email address or password."],
  "login.offline": [
    "Aucun reseau. La premiere connexion demande une connexion internet.",
    "No network. The first sign in needs an internet connection.",
  ],
  "login.rateLimited": [
    "Trop de tentatives. Reessayez dans quinze minutes.",
    "Too many attempts. Try again in fifteen minutes.",
  ],
  "login.serverUnreachable": [
    "Serveur injoignable. Verifiez votre connexion.",
    "Server unreachable. Check your connection.",
  ],

  "nav.dashboard": ["Tableau de bord", "Dashboard"],
  "nav.teams": ["Equipes", "Teams"],
  "nav.settings": ["Reglages", "Settings"],

  "sync.online": ["A jour", "Up to date"],
  "sync.syncing": ["Synchronisation", "Syncing"],
  "sync.offline": ["Hors ligne", "Offline"],
  "sync.pending": ["{count} en attente", "{count} pending"],
  "sync.lastAt": ["Derniere synchronisation {when}", "Last synced {when}"],
  "sync.never": ["Jamais synchronise", "Never synced"],
  "sync.now": ["Synchroniser", "Sync now"],
  "sync.failed": ["Synchronisation impossible", "Sync failed"],
  "sync.offlineHint": [
    "Vos saisies sont conservees sur le telephone et partiront au retour du reseau.",
    "Your entries are kept on the phone and will be sent when the network returns.",
  ],

  "dashboard.title": ["Tableau de bord", "Dashboard"],
  "dashboard.teams": ["Equipes", "Teams"],
  "dashboard.players": ["Joueurs", "Players"],
  "dashboard.sessions": ["Passations", "Sessions"],
  "dashboard.unavailable": ["Indisponibles", "Unavailable"],
  "dashboard.alerts": ["A surveiller", "Watch list"],
  "dashboard.noAlerts": ["Aucun point d'attention.", "Nothing to flag."],
  "dashboard.recentSessions": ["Dernieres passations", "Recent sessions"],
  "dashboard.empty": [
    "Rien a afficher pour l'instant. Synchronisez pour recuperer vos equipes.",
    "Nothing to show yet. Sync to pull your teams.",
  ],

  "teams.title": ["Equipes", "Teams"],
  "teams.players": ["joueurs", "players"],
  "teams.empty": ["Aucune equipe rattachee a votre compte.", "No team linked to your account."],

  "squad.title": ["Effectif", "Squad"],
  "squad.position": ["Poste", "Position"],
  "squad.age": ["Age", "Age"],
  "squad.empty": ["Aucun joueur dans cette equipe.", "No player in this team."],
  "squad.newSession": ["Nouvelle passation", "New session"],

  "player.title": ["Fiche joueur", "Player"],
  "player.height": ["Taille", "Height"],
  "player.weight": ["Masse", "Weight"],
  "player.foot": ["Pied", "Foot"],
  "player.lastResults": ["Derniers resultats", "Latest results"],
  "player.noResults": ["Aucun resultat enregistre.", "No result recorded."],

  "session.title": ["Passation", "Session"],
  "session.new": ["Nouvelle passation", "New session"],
  "session.name": ["Nom de la passation", "Session name"],
  "session.date": ["Date", "Date"],
  "session.chooseTest": ["Choisir un test", "Choose a test"],
  "session.create": ["Creer", "Create"],
  "session.entry": ["Saisie", "Entry"],
  "session.save": ["Enregistrer", "Save"],
  "session.saved": ["Enregistre sur le telephone.", "Saved on the phone."],
  "session.savedQueued": [
    "Enregistre. Sera envoye au retour du reseau.",
    "Saved. Will be sent when the network returns.",
  ],
  "session.empty": ["Aucune passation recente.", "No recent session."],
  "session.players": ["joueurs", "players"],

  "settings.title": ["Reglages", "Settings"],
  "settings.account": ["Compte", "Account"],
  "settings.language": ["Langue", "Language"],
  "settings.data": ["Donnees locales", "Local data"],
  "settings.storedOnDevice": [
    "Ces donnees sont conservees sur le telephone pour permettre le travail hors reseau.",
    "This data is kept on the phone so the app works without a network.",
  ],
  "settings.logout": ["Se deconnecter", "Sign out"],
  "settings.logoutWarning": [
    "La deconnexion efface les donnees locales. Synchronisez d'abord si des saisies sont en attente.",
    "Signing out erases local data. Sync first if entries are pending.",
  ],
  "settings.logoutConfirm": ["Se deconnecter", "Sign out"],
  "settings.cancel": ["Annuler", "Cancel"],
  "settings.privacy": ["Confidentialite", "Privacy"],
  "settings.terms": ["Conditions generales", "Terms"],
  "settings.version": ["Version", "Version"],

  "common.retry": ["Reessayer", "Retry"],
  "common.back": ["Retour", "Back"],
  "common.loading": ["Chargement", "Loading"],
  "common.none": ["Aucun", "None"],
  "common.required": ["Champ requis", "Required field"],
} as const satisfies Record<string, Entry>;

export type MessageKey = keyof typeof MESSAGES;

export const translate = (key: MessageKey, locale: Locale): string => {
  const entry = MESSAGES[key] as Entry | undefined;
  if (!entry) return key;
  return locale === "en" ? entry[1] : entry[0];
};

/** Remplace les marqueurs d'un texte, comme {count}. */
export const fill = (text: string, values: Record<string, string | number>): string =>
  Object.entries(values).reduce(
    (result, [key, value]) => result.split(`{${key}}`).join(String(value)),
    text,
  );

/**
 * Langue du telephone, ramenee a l'une des deux que l'application parle.
 *
 * `getLocales` renvoie les langues dans l'ordre de preference du systeme. On
 * prend la premiere reconnue plutot que la premiere tout court : un telephone
 * regle en arabe avec le francais en second doit ouvrir en francais, pas en
 * anglais par defaut.
 */
export const deviceLocale = (): Locale => {
  for (const entry of getLocales()) {
    const code = entry.languageCode?.toLowerCase();
    if (code === "fr" || code === "en") return code;
  }
  return "fr";
};

export const localeTag = (locale: Locale): string => (locale === "en" ? "en-GB" : "fr-FR");
