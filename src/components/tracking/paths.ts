/**
 * Ou la mesure d'audience a le droit de s'executer.
 *
 * ---------------------------------------------------------------------------
 * Pourquoi rien ne tourne apres la connexion
 * ---------------------------------------------------------------------------
 *
 * Les balises vivaient dans la mise en page racine, donc partout, y compris
 * dans l'application et dans le panneau proprietaire. Trois raisons de les en
 * sortir, et la premiere suffirait.
 *
 * 1. Microsoft Clarity enregistre le contenu de l'ecran, pas seulement les
 *    clics. Sur `/app`, l'ecran porte des noms de joueurs, des dates de
 *    naissance, des blessures et des mesures anthropometriques : des donnees de
 *    sante, souvent celles de mineurs. Les envoyer a un tiers pour comprendre
 *    un taux de rebond est hors de proportion, et engage la responsabilite du
 *    club autant que la notre.
 *
 * 2. Le pixel Meta comptait une page vue a chaque ecran ouvert par un client
 *    deja inscrit. Ces vues n'ont aucun rapport avec une campagne : elles
 *    diluent le denominateur et font baisser artificiellement le taux de
 *    conversion sur lequel Meta optimise.
 *
 * 3. Un preparateur qui ouvre l'application quarante fois par semaine n'a rien
 *    demande a personne. Le consentement qu'il a pu donner sur la page publique
 *    portait sur une visite commerciale, pas sur son outil de travail.
 *
 * ---------------------------------------------------------------------------
 * La consequence a ne pas rater
 * ---------------------------------------------------------------------------
 *
 * L'inscription se terminait par une redirection vers `/app`, et c'est la que
 * l'evenement de conversion partait. Couper la mesure sur `/app` sans rien
 * faire d'autre aurait donc supprime le Lead cote navigateur, en silence, et
 * personne ne l'aurait vu avant que la campagne ne se degrade.
 *
 * L'inscription passe desormais par `/bienvenue`, une page publique qui
 * declenche l'evenement puis s'efface. Voir src/app/bienvenue/page.tsx.
 */

/** Prefixes ou aucune balise ne doit s'executer. */
const ZONES_PRIVEES = ["/app", "/admin"];

export const isMeasuredPath = (pathname: string | null): boolean => {
  if (!pathname) return false;
  return !ZONES_PRIVEES.some(
    (prefixe) => pathname === prefixe || pathname.startsWith(`${prefixe}/`),
  );
};
