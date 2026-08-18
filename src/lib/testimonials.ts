/**
 * Avis clients affiches sur la page publique.
 *
 * ---------------------------------------------------------------------------
 * A LIRE AVANT D'AJOUTER UNE LIGNE
 * ---------------------------------------------------------------------------
 *
 * Cette liste est vide, et c'est volontaire. Un avis invente est un faux
 * temoignage, pas un texte de remplissage :
 *
 *   . Stripe verifie les pages de vente avant d'ouvrir un compte, et un avis
 *     non verifiable est un motif de refus documente.
 *   . La directive europeenne 2019/2161 interdit d'afficher un avis sans
 *     s'etre assure qu'il vient d'un vrai client, sous peine d'amende
 *     proportionnelle au chiffre d'affaires.
 *   . Au Maroc, la loi 31.08 sur la protection du consommateur sanctionne la
 *     publicite trompeuse de la meme facon.
 *
 * Et surtout : un preparateur physique reconnait immediatement un temoignage
 * ecrit par quelqu'un qui n'a jamais tenu un chronometre. Le faux avis ne fait
 * pas vendre, il fait fuir precisement le public vise.
 *
 * La page n'affiche donc rien tant que ce tableau est vide. Elle montre a la
 * place la preuve verifiable : le nombre de tests, les publications citees
 * nommement, les populations de reference. Pour un produit scientifique, cette
 * preuve convainc mieux qu'un avis anonyme.
 *
 * ---------------------------------------------------------------------------
 * COMMENT OBTENIR LES PREMIERS AVIS
 * ---------------------------------------------------------------------------
 *
 * Apres une saison complete avec un club, demandez trois choses par courriel :
 * une phrase sur ce qui a change concretement, la note sur cinq, et l'accord
 * ecrit de publier le nom et le club. Gardez ce courriel : c'est lui qui rend
 * l'avis verifiable le jour ou Stripe ou la DGCCRF le demande.
 *
 * Puis ajoutez la ligne ici. La section apparait toute seule.
 *
 *   {
 *     quote: {
 *       fr: "La phrase exacte du client, sans la reecrire.",
 *       en: "The same sentence, translated.",
 *     },
 *     name: "Prenom Nom",
 *     role: { fr: "Preparateur physique", en: "Strength and conditioning coach" },
 *     club: "Nom du club",
 *     rating: 5,
 *     consentedOn: "2026-09-14", // date de l'accord ecrit
 *   },
 */

export interface Testimonial {
  quote: { fr: string; en: string };
  /** Prenom et nom reels, tels que la personne accepte d'etre citee. */
  name: string;
  role: { fr: string; en: string };
  club: string;
  /** Note sur cinq, entiere. */
  rating: 1 | 2 | 3 | 4 | 5;
  /**
   * Date de l'accord ecrit de publication, au format AAAA-MM-JJ.
   *
   * Ce champ est obligatoire et n'est jamais affiche. Il existe pour qu'aucun
   * avis ne puisse etre ajoute sans que quelqu'un ait eu a se demander s'il
   * detenait bien cet accord.
   */
  consentedOn: string;
}

export const TESTIMONIALS: Testimonial[] = [];
