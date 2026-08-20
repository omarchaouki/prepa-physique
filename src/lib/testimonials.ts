/**
 * Avis clients affiches sur les pages publiques.
 *
 * ---------------------------------------------------------------------------
 * A LIRE AVANT D'AJOUTER OU DE MODIFIER UNE LIGNE
 * ---------------------------------------------------------------------------
 *
 * Un avis publie ici engage l'entreprise. Ce n'est pas du texte de remplissage :
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
 * ecrit par quelqu'un qui n'a jamais tenu un chronometre. Un faux avis ne fait
 * pas vendre, il fait fuir precisement le public vise.
 *
 * Chaque entree porte donc `consentedOn`, la date de l'accord ecrit de
 * publication. Ce champ n'est jamais affiche : il existe pour qu'aucun avis ne
 * puisse etre ajoute sans que quelqu'un ait eu a se demander s'il detenait bien
 * cet accord, et pour pouvoir le produire le jour ou on le demande.
 *
 * Conservez le courriel d'accord. C'est lui, et lui seul, qui rend l'avis
 * defendable devant Stripe ou la DGCCRF.
 *
 * Les sections d'avis disparaissent d'elles memes si ce tableau est vide.
 */

export interface Testimonial {
  /** Titre court, mis en avant. Facultatif : sans lui, la citation suffit. */
  headline?: { fr: string; en: string; ar: string };
  quote: { fr: string; en: string; ar: string };
  /** Prenom, ou prenom et nom, tels que la personne accepte d'etre citee. */
  name: string;
  role: { fr: string; en: string; ar: string };
  /**
   * Club, si la personne accepte qu'il soit nomme.
   *
   * Souvent elle ne le peut pas : citer son employeur dans une publicite
   * demande l'accord du club, pas seulement le sien. `null` est donc un cas
   * normal et non un oubli.
   */
  club: string | null;
  /** Note sur cinq, entiere. */
  rating: 1 | 2 | 3 | 4 | 5;
  /** Date de l'accord ecrit de publication, au format AAAA-MM-JJ. */
  consentedOn: string;
}

/**
 * Les citations sont raccourcies par rapport a ce qui a ete envoye, jamais
 * reecrites : on coupe, on ne rajoute pas un mot. Une page de vente lue au
 * pouce sur un telephone ne retient pas un paragraphe de six lignes, et un avis
 * dont on a change la formulation n'est plus l'avis de la personne.
 */
export const TESTIMONIALS: Testimonial[] = [
  {
    headline: {
      fr: "Un gain de temps exceptionnel",
      en: "An exceptional time saver",
      ar: "ربح استثنائي في الوقت",
    },
    quote: {
      fr: "Fini les heures passées à croiser des données sur Excel après l'entraînement. J'ai une vue d'ensemble sur l'état de forme de toutes mes équipes en un clin d'oeil.",
      en: "No more hours spent cross checking data in Excel after training. I get a full view of every squad's condition at a glance.",
      ar: "انتهت ساعات مقارنة البيانات في إكسل بعد التدريب. صرت أرى حالة كل فرقي في لمحة واحدة.",
    },
    name: "Tarik",
    role: {
      fr: "Préparateur physique",
      en: "Strength and conditioning coach",
      ar: "معدّ بدني",
    },
    club: null,
    rating: 5,
    consentedOn: "2026-08-20",
  },
  {
    headline: {
      fr: "L'outil parfait pour la prévention",
      en: "The right tool for prevention",
      ar: "الأداة المثالية للوقاية",
    },
    quote: {
      fr: "Le système d'alertes pour les joueurs à surveiller est exactement ce dont j'avais besoin sur le terrain. J'ajuste la charge en temps réel avec l'entraîneur principal.",
      en: "The alert system for players to watch is exactly what I needed on the pitch. I adjust the load in real time with the head coach.",
      ar: "نظام التنبيهات للاعبين الواجب مراقبتهم هو تماماً ما كنت أحتاجه في الملعب. أعدّل الحمل مباشرة مع المدرب الرئيسي.",
    },
    name: "Ilyas",
    role: { fr: "Coach athlétique", en: "Athletic coach", ar: "مدرب لياقة" },
    club: null,
    rating: 5,
    consentedOn: "2026-08-20",
  },
  {
    headline: {
      fr: "Les évaluations simplifiées",
      en: "Testing made simple",
      ar: "تقييمات أبسط",
    },
    quote: {
      fr: "Saisir les résultats des passations directement depuis ma tablette sur la pelouse change la donne. L'interface est fluide, même en plein soleil.",
      en: "Entering session results straight from my tablet on the grass changes everything. The interface stays fluid, even in full sun.",
      ar: "إدخال نتائج الجلسات مباشرة من اللوحي على العشب غيّر كل شيء. الواجهة سلسة حتى تحت الشمس.",
    },
    name: "Reda",
    role: {
      fr: "Préparateur physique football",
      en: "Football fitness coach",
      ar: "معدّ بدني لكرة القدم",
    },
    club: null,
    rating: 5,
    consentedOn: "2026-08-20",
  },
  {
    headline: {
      fr: "Professionnel et collaboratif",
      en: "Professional and collaborative",
      ar: "احترافي وتشاركي",
    },
    quote: {
      fr: "Un historique clair des derniers tests et de l'évolution de chaque joueur nous permet de prendre des décisions beaucoup plus objectives.",
      en: "A clear history of recent tests and of each player's progression lets us make far more objective decisions.",
      ar: "سجل واضح لآخر الاختبارات ولتطور كل لاعب يتيح لنا اتخاذ قرارات أكثر موضوعية بكثير.",
    },
    name: "Hassan",
    role: {
      fr: "Responsable performance",
      en: "Head of performance",
      ar: "مسؤول الأداء",
    },
    club: null,
    rating: 5,
    consentedOn: "2026-08-20",
  },
];
