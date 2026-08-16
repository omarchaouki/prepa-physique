/**
 * Moteur de recommandations.
 *
 * Chaque regle croise une ou plusieurs metriques mesurees avec un seuil issu de la
 * litterature, puis produit un constat, une explication et une conduite a tenir.
 * Rien n'est genere au hasard : si la donnee manque, la regle ne se declenche pas
 * et le moteur signale simplement le test manquant.
 */

import { compareToNorm, type Population } from "./norms";

export type Severity = "critique" | "important" | "suivi" | "information";
export type Area =
  | "PREVENTION"
  | "FORCE"
  | "VITESSE"
  | "ENDURANCE"
  | "CHANGEMENT_DIRECTION"
  | "COMPOSITION"
  | "MOBILITE"
  | "CROISSANCE"
  | "DONNEES";

export interface Recommendation {
  id: string;
  area: Area;
  severity: Severity;
  title: string;
  finding: string;
  rationale: string;
  actions: string[];
  weeklyDose?: string;
  reference: string;
  /** Metriques qui ont declenche la regle, pour permettre de remonter a la donnee. */
  metricKeys: string[];
}

export interface MetricSnapshot {
  key: string;
  value: number;
  side?: "L" | "R" | null;
  date: Date;
}

export interface RecommendationContext {
  metrics: MetricSnapshot[];
  population: Population;
  sex: "M" | "F";
  position?: string | null;
  ageYears: number;
  playerName: string;
}

const AREA_LABELS: Record<Area, readonly [fr: string, en: string]> = {
  PREVENTION: ["Prevention", "Prevention"],
  FORCE: ["Force", "Strength"],
  VITESSE: ["Vitesse", "Speed"],
  ENDURANCE: ["Endurance", "Endurance"],
  CHANGEMENT_DIRECTION: ["Changement de direction", "Change of direction"],
  COMPOSITION: ["Composition corporelle", "Body composition"],
  MOBILITE: ["Mobilite", "Mobility"],
  CROISSANCE: ["Croissance", "Growth"],
  DONNEES: ["Donnees manquantes", "Missing data"],
};

export const areaLabel = (area: Area, locale: "fr" | "en" = "fr"): string =>
  AREA_LABELS[area][locale === "en" ? 1 : 0];

export const SEVERITY_LABELS: Record<Severity, readonly [fr: string, en: string]> = {
  critique: ["Critique", "Critical"],
  important: ["Important", "Important"],
  suivi: ["A suivre", "Monitor"],
  information: ["Information", "Information"],
};

export const severityLabel = (severity: Severity, locale: "fr" | "en" = "fr"): string =>
  SEVERITY_LABELS[severity][locale === "en" ? 1 : 0];

const SEVERITY_RANK: Record<Severity, number> = {
  critique: 0,
  important: 1,
  suivi: 2,
  information: 3,
};

/** Derniere valeur connue d'une metrique, eventuellement pour un cote donne. */
const latest = (
  metrics: MetricSnapshot[],
  key: string,
  side?: "L" | "R",
): MetricSnapshot | undefined => {
  const candidates = metrics
    .filter((m) => m.key === key && (side === undefined || m.side === side))
    .sort((a, b) => b.date.getTime() - a.date.getTime());
  return candidates[0];
};

const value = (metrics: MetricSnapshot[], key: string, side?: "L" | "R"): number | undefined =>
  latest(metrics, key, side)?.value;

export const buildRecommendations = (ctx: RecommendationContext): Recommendation[] => {
  const recommendations: Recommendation[] = [];
  const m = ctx.metrics;

  const push = (rec: Recommendation) => recommendations.push(rec);

  // -------------------------------------------------------------------------
  // 1. Ischio jambiers
  // -------------------------------------------------------------------------
  const nordicLeft = value(m, "nordic_force", "L");
  const nordicRight = value(m, "nordic_force", "R");
  const nordicAsym = value(m, "nordic_asym");

  if (nordicLeft !== undefined && nordicRight !== undefined) {
    const weakest = Math.min(nordicLeft, nordicRight);
    const weakSide = nordicLeft < nordicRight ? "gauche" : "droite";

    if (weakest < 337) {
      push({
        id: "hamstring_strength",
        area: "PREVENTION",
        severity: weakest < 280 ? "critique" : "important",
        title: "Force excentrique des ischio jambiers insuffisante",
        finding: `Pic de force de ${Math.round(weakest)} N sur la jambe ${weakSide}, sous le seuil de reference de 337 N.`,
        rationale:
          "La force excentrique des ischio jambiers est le facteur de risque modifiable le mieux documente de la lesion des ischio jambiers. Sous 337 newtons, le risque relatif est multiplie par environ deux dans les cohortes de footballeurs.",
        actions: [
          "Protocole Nordic progressif : semaines 1 et 2 en 2 series de 5, puis montee jusqu'a 3 series de 8 sur 8 semaines.",
          "Ajouter une serie unilaterale supplementaire du cote faible a chaque seance.",
          "Completer par du soulevede terre roumain et de l'extension de hanche a amplitude complete.",
          "Recontroler la force apres 6 a 8 semaines avant de modifier le programme.",
        ],
        weeklyDose: "2 seances par semaine hors semaine a deux matchs, 1 seance en semaine chargee",
        reference: "Opar et al. 2015, van Dyk et al. 2019, Bourne et al. 2018",
        metricKeys: ["nordic_force"],
      });
    }

    if (nordicAsym !== undefined && nordicAsym > 15) {
      push({
        id: "hamstring_asymmetry",
        area: "PREVENTION",
        severity: "important",
        title: "Asymetrie marquee des ischio jambiers",
        finding: `Ecart de ${nordicAsym}% entre les deux jambes, au dessus du seuil de 15%.`,
        rationale:
          "Une asymetrie superieure a 15% au Nordic est associee a une augmentation du risque lesionnel, independamment du niveau de force absolu.",
        actions: [
          `Travail unilateral cible sur le cote ${weakSide} : Nordic assiste unilateral, single leg RDL, glute ham raise.`,
          "Verifier l'absence de restriction de mobilite ou de sequelle d'ancienne lesion sur ce cote.",
          "Ne pas chercher a egaliser en reduisant le cote fort, mais en developpant le cote faible.",
        ],
        weeklyDose: "2 seances par semaine pendant 6 semaines minimum",
        reference: "Opar et al. 2015, Bishop et al. 2021",
        metricKeys: ["nordic_asym", "nordic_force"],
      });
    }
  }

  // -------------------------------------------------------------------------
  // 2. Region inguinale
  // -------------------------------------------------------------------------
  const groinRel = value(m, "groin_add_rel");
  const groinRatio = value(m, "groin_ratio");
  const groinAsym = value(m, "groin_add_asym");

  if ((groinRel !== undefined && groinRel < 3.0) || (groinRatio !== undefined && groinRatio < 0.9)) {
    const parts: string[] = [];
    if (groinRel !== undefined && groinRel < 3.0) parts.push(`force relative des adducteurs a ${groinRel} N/kg`);
    if (groinRatio !== undefined && groinRatio < 0.9) parts.push(`rapport adducteurs sur abducteurs a ${groinRatio}`);

    push({
      id: "groin_strength",
      area: "PREVENTION",
      severity: groinRatio !== undefined && groinRatio < 0.8 ? "critique" : "important",
      title: "Deficit de force inguinale",
      finding: parts.join(", ") + ".",
      rationale:
        "La faiblesse des adducteurs et un rapport adducteurs sur abducteurs inferieur a 0.90 precedent frequemment l'apparition de douleurs inguinales, premiere cause de plainte chronique chez le footballeur.",
      actions: [
        "Programme Copenhagen Adduction sur 8 semaines : niveau 1 en 2 series de 3 a 5 repetitions, progression jusqu'a 3 series de 12 a 15.",
        "Ajouter du gainage lateral avec adduction active et du travail d'abduction en charge.",
        "Integrer des tests de pression hebdomadaires pour suivre l'evolution sans attendre le prochain bilan.",
      ],
      weeklyDose: "2 seances par semaine en preparation, 1 seance de maintien en saison",
      reference: "Esteve et al. 2020, Haroy et al. 2019, Thorborg et al. 2017",
      metricKeys: ["groin_add_rel", "groin_ratio"],
    });
  }

  if (groinAsym !== undefined && groinAsym > 10) {
    push({
      id: "groin_asymmetry",
      area: "PREVENTION",
      severity: "suivi",
      title: "Asymetrie des adducteurs",
      finding: `Ecart de ${groinAsym}% entre les deux cotes.`,
      rationale:
        "Une asymetrie inguinale superieure a 10% traduit souvent une compensation liee au pied d'appui ou a une ancienne douleur non resolue.",
      actions: [
        "Renforcement unilateral du cote faible, deux fois par semaine.",
        "Interroger le joueur sur d'eventuelles douleurs de pubis ou de bas ventre a la frappe.",
      ],
      reference: "Thorborg et al. 2017",
      metricKeys: ["groin_add_asym"],
    });
  }

  // -------------------------------------------------------------------------
  // 3. Asymetries de saut et criteres de retour au jeu
  // -------------------------------------------------------------------------
  const cmjAsym = value(m, "cmj_asym");
  const hopWorst = value(m, "hop_lsi_worst");

  if (cmjAsym !== undefined && cmjAsym > 10) {
    push({
      id: "jump_asymmetry",
      area: "PREVENTION",
      severity: cmjAsym > 15 ? "important" : "suivi",
      title: "Asymetrie au saut unilateral",
      finding: `Ecart de ${cmjAsym}% entre les deux jambes au saut.`,
      rationale:
        "Au dela de 10%, l'asymetrie de production de force au saut est associee a une reduction des performances de sprint et de changement de direction, et a un risque lesionnel accru du cote faible.",
      actions: [
        "Bloc de force unilaterale : fente bulgare, step up, presse une jambe, sur 6 a 8 semaines.",
        "Pliometrie unilaterale progressive, en commencant par des receptions controlees avant les sauts enchaines.",
        "Recontroler toutes les 4 semaines, l'asymetrie fluctue avec la fatigue.",
      ],
      weeklyDose: "2 seances de force unilaterale par semaine",
      reference: "Bishop et al. 2021, Bell et al. 2014",
      metricKeys: ["cmj_asym"],
    });
  }

  if (hopWorst !== undefined && hopWorst < 90) {
    push({
      id: "hop_lsi",
      area: "PREVENTION",
      severity: "critique",
      title: "Criteres de retour au jeu non remplis",
      finding: `Index de symetrie le plus bas a ${hopWorst}%, sous le seuil de 90%.`,
      rationale:
        "Un retour au jeu avant l'atteinte des criteres de symetrie multiplie par quatre le risque de nouvelle blessure dans les deux ans qui suivent une reconstruction du ligament croise anterieur.",
      actions: [
        "Ne pas reintegrer le collectif en opposition tant que le seuil n'est pas atteint.",
        "Poursuivre le renforcement unilateral et la reeducation neuromusculaire.",
        "Valider egalement la force isocinetique ou isometrique, la symetrie de saut seule ne suffit pas.",
      ],
      reference: "Grindem et al. 2016, Kyritsis et al. 2016",
      metricKeys: ["hop_lsi_worst"],
    });
  }

  // -------------------------------------------------------------------------
  // 4. Profil force vitesse horizontal
  // -------------------------------------------------------------------------
  const f0 = value(m, "sprint_f0");
  const v0 = value(m, "sprint_v0");

  if (f0 !== undefined && v0 !== undefined && v0 > 0) {
    const ratio = f0 / v0;
    if (ratio < 0.75) {
      push({
        id: "fv_force_deficit",
        area: "VITESSE",
        severity: "important",
        title: "Deficit de force horizontale",
        finding: `F0 a ${f0} N/kg pour un V0 de ${v0} m/s, soit un rapport de ${ratio.toFixed(2)}.`,
        rationale:
          "Le joueur atteint une vitesse elevee mais produit peu de force au demarrage. Dans le jeu, cela se traduit par des premiers appuis lents et une perte sur les duels de course courts, qui sont les plus frequents.",
        actions: [
          "Sprints resistes lourds : traineau charge a 45 a 80% de la masse corporelle sur 15 a 20 metres.",
          "Poussee de luge et departs sur 5 a 15 metres, deux fois par semaine.",
          "Renforcement de l'extension de hanche : hip thrust, soulevede terre, demi squat lourd.",
        ],
        weeklyDose: "2 seances par semaine sur un bloc de 6 semaines",
        reference: "Morin & Samozino 2016, Jimenez-Reyes et al. 2018",
        metricKeys: ["sprint_f0", "sprint_v0"],
      });
    } else if (ratio > 0.95) {
      push({
        id: "fv_velocity_deficit",
        area: "VITESSE",
        severity: "important",
        title: "Deficit de vitesse maximale",
        finding: `F0 a ${f0} N/kg pour un V0 de ${v0} m/s, soit un rapport de ${ratio.toFixed(2)}.`,
        rationale:
          "Le joueur demarre bien mais plafonne rapidement. Sur les courses longues et les transitions, il se fait rattraper alors qu'il avait pris l'avantage initial.",
        actions: [
          "Sprints lances sur 20 a 30 metres apres zone d'elan, a intensite maximale reelle.",
          "Survitesse legere : pente descendante de 2 a 3 degres ou assistance elastique moderee.",
          "Preserver au moins une exposition hebdomadaire a plus de 95% de la vitesse maximale, meme en semaine chargee.",
        ],
        weeklyDose: "1 a 2 expositions par semaine, volume faible et recuperation complete",
        reference: "Morin & Samozino 2016, Haugen et al. 2019",
        metricKeys: ["sprint_f0", "sprint_v0"],
      });
    }
  }

  // -------------------------------------------------------------------------
  // 5. Comparaison a la population de reference
  // -------------------------------------------------------------------------
  const normChecks: Array<{ key: string; area: Area; title: string; actions: string[]; dose: string; rationale: string }> = [
    {
      key: "vift",
      area: "ENDURANCE",
      title: "Capacite intermittente sous la reference",
      rationale:
        "Une capacite intermittente faible limite le volume de courses a haute intensite tenable en match et ralentit la recuperation entre les efforts decisifs.",
      actions: [
        "Bloc de 4 a 6 semaines de courses intermittentes courtes, type 15 secondes a 95% de la VIFT suivies de 15 secondes de recuperation.",
        "Jeux reduits a forte densite de courses, 4 contre 4 sur grand espace.",
        "Progresser en volume avant d'augmenter l'intensite.",
      ],
      dose: "2 seances par semaine",
    },
    {
      key: "vo2max_yoyo",
      area: "ENDURANCE",
      title: "Consommation maximale d'oxygene sous la reference",
      rationale:
        "La base aerobie conditionne la recuperation entre les sprints et la tolerance a la charge d'entrainement.",
      actions: [
        "Blocs continus au seuil de 8 a 20 minutes en debut de cycle.",
        "Puis fractionne long a 100% de la VMA, 30 secondes effort et 30 secondes recuperation.",
      ],
      dose: "2 a 3 seances par semaine en preparation",
    },
    {
      key: "sprint_10m",
      area: "VITESSE",
      title: "Acceleration sur 10 metres sous la reference",
      rationale:
        "La majorite des actions decisives du football se joue sur moins de 20 metres, l'acceleration initiale est donc determinante.",
      actions: [
        "Departs sur 5, 10 et 15 metres avec recuperation complete.",
        "Sprints resistes moderes a lourds, deux fois par semaine.",
        "Travail technique de la position de depart et de la poussee horizontale.",
      ],
      dose: "2 seances par semaine, 6 a 10 repetitions",
    },
    {
      key: "cmj_height",
      area: "FORCE",
      title: "Detente verticale sous la reference",
      rationale:
        "La detente reflete la puissance des membres inferieurs, qui alimente aussi bien le jeu aerien que l'acceleration.",
      actions: [
        "Bloc de force maximale : demi squat, presse, 3 a 5 series de 3 a 5 repetitions a charge lourde.",
        "Puis conversion en puissance : squat saute, contre mouvement charge leger.",
      ],
      dose: "2 seances de force par semaine",
    },
    {
      key: "cod_505_best",
      area: "CHANGEMENT_DIRECTION",
      title: "Changement de direction sous la reference",
      rationale:
        "La capacite a freiner puis reaccelerer conditionne les duels et le pressing. Elle repose surtout sur la force excentrique et la technique d'appui.",
      actions: [
        "Decelerations progressives sur 10 a 20 metres avec consigne d'arret net.",
        "Fentes sautees avec arret, renforcement du moyen fessier et des ischio jambiers.",
        "Travail technique des appuis a 45, 90 et 180 degres.",
      ],
      dose: "2 seances par semaine",
    },
    {
      key: "onerm_rel_back_squat",
      area: "FORCE",
      title: "Force maximale des membres inferieurs sous la reference",
      rationale:
        "Un niveau de force maximale suffisant est le socle qui permet de developper la puissance et de tolerer les contraintes de freinage.",
      actions: [
        "Bloc de force de 8 semaines : 3 a 5 series de 3 a 5 repetitions a 80 a 90% du maximum.",
        "Prioriser la qualite technique et la profondeur avant la charge.",
      ],
      dose: "2 seances par semaine",
    },
  ];

  for (const check of normChecks) {
    const v = value(m, check.key);
    if (v === undefined) continue;
    const comparison = compareToNorm(check.key, v, ctx.population, ctx.sex, ctx.position);
    if (!comparison) continue;

    if (comparison.percentile < 30) {
      push({
        id: `norm_${check.key}`,
        area: check.area,
        severity: comparison.percentile < 15 ? "important" : "suivi",
        title: check.title,
        finding: `Valeur de ${v} situee au ${comparison.percentile}e percentile de la population de reference (moyenne ${comparison.normMean}).`,
        rationale: check.rationale,
        actions: check.actions,
        weeklyDose: check.dose,
        reference: comparison.source,
        metricKeys: [check.key],
      });
    }
  }

  // -------------------------------------------------------------------------
  // 6. Qualite reactive
  // -------------------------------------------------------------------------
  const rsi = value(m, "dj_rsi");
  if (rsi !== undefined && rsi < 1.5) {
    push({
      id: "reactive_strength",
      area: "FORCE",
      severity: "suivi",
      title: "Indice de force reactive faible",
      finding: `RSI a ${rsi}, en dessous du repere de 1.50 chez le footballeur entraine.`,
      rationale:
        "Une raideur musculo tendineuse insuffisante allonge les temps de contact au sol et penalise a la fois la vitesse et le changement de direction.",
      actions: [
        "Pliometrie progressive : bonds sur place, puis bonds horizontaux, puis drop jumps a hauteur croissante.",
        "Consigne systematique de temps de contact court, mesure si possible.",
        "Renforcement du triceps sural et du tendon d'Achille en isometrie longue.",
      ],
      weeklyDose: "2 seances de faible volume par semaine, 40 a 80 contacts",
      reference: "Flanagan & Comyns 2008",
      metricKeys: ["dj_rsi"],
    });
  }

  // -------------------------------------------------------------------------
  // 7. Sprints repetes
  // -------------------------------------------------------------------------
  const rsaDecrement = value(m, "rsa_decrement");
  if (rsaDecrement !== undefined && rsaDecrement > 6) {
    push({
      id: "rsa_decrement",
      area: "ENDURANCE",
      severity: rsaDecrement > 8 ? "important" : "suivi",
      title: "Perte de vitesse importante sur sprints repetes",
      finding: `Decrement de ${rsaDecrement}% sur la serie.`,
      rationale:
        "La capacite a repeter les sprints depend surtout de la vitesse de resynthese entre les efforts, donc de la base aerobie et de la capacite tampon.",
      actions: [
        "Consolider d'abord la base aerobie, c'est le facteur limitant dans la majorite des cas.",
        "Puis series de sprints repetes avec recuperation incomplete, 6 a 8 fois 30 metres toutes les 25 secondes.",
        "Surveiller que le premier sprint reste maximal, sinon le decrement n'est pas interpretable.",
      ],
      weeklyDose: "1 seance par semaine, jamais en veille de match",
      reference: "Girard et al. 2011, Bishop et al. 2011",
      metricKeys: ["rsa_decrement"],
    });
  }

  // -------------------------------------------------------------------------
  // 8. Mobilite
  // -------------------------------------------------------------------------
  const dorsiLeft = value(m, "dorsiflexion", "L");
  const dorsiRight = value(m, "dorsiflexion", "R");
  if (dorsiLeft !== undefined && dorsiRight !== undefined) {
    const worst = Math.min(dorsiLeft, dorsiRight);
    if (worst < 10) {
      push({
        id: "ankle_mobility",
        area: "MOBILITE",
        severity: "suivi",
        title: "Dorsiflexion de cheville limitee",
        finding: `Amplitude la plus faible a ${worst} centimetres au test de la fente au mur.`,
        rationale:
          "Une dorsiflexion inferieure a 10 centimetres modifie la mecanique d'atterrissage, augmente la contrainte sur le genou et limite la profondeur de squat.",
        actions: [
          "Mobilisation articulaire avec mise en charge, trois fois par semaine, deux minutes par cote.",
          "Travail excentrique du mollet a amplitude complete.",
          "Verifier l'absence de conflit anterieur de cheville en cas de blocage dur.",
        ],
        weeklyDose: "quotidien pendant 4 semaines puis entretien",
        reference: "Bennell et al. 1998, Hoog et al. 2016",
        metricKeys: ["dorsiflexion"],
      });
    }
  }

  // -------------------------------------------------------------------------
  // 9. Croissance
  // -------------------------------------------------------------------------
  const maturityOffset = value(m, "maturity_offset");
  if (maturityOffset !== undefined && maturityOffset >= -0.5 && maturityOffset <= 0.5) {
    push({
      id: "peak_growth",
      area: "CROISSANCE",
      severity: "important",
      title: "Joueur en periode de pic de croissance",
      finding: `Ecart au pic de croissance estime a ${maturityOffset} an, donc au plus fort de la poussee staturale.`,
      rationale:
        "Pendant le pic de croissance, la coordination se degrade temporairement et les zones de croissance sont fragilisees. C'est la fenetre ou apparaissent les douleurs d'apophyse au genou et au talon.",
      actions: [
        "Reduire le volume de sauts et de sprints maximaux d'environ 30% pendant la phase active.",
        "Maintenir la mobilite, en particulier les ischio jambiers et le droit femoral.",
        "Mesurer la taille chaque mois pour suivre la vitesse de croissance.",
        "Privilegier la qualite technique et le renforcement au poids de corps plutot que les charges lourdes.",
      ],
      weeklyDose: "reevaluation mensuelle",
      reference: "Mirwald et al. 2002, Lloyd & Oliver 2012, van der Sluis et al. 2015",
      metricKeys: ["maturity_offset"],
    });
  }

  // -------------------------------------------------------------------------
  // 10. Composition corporelle
  // -------------------------------------------------------------------------
  const bodyFat = value(m, "body_fat");
  if (bodyFat !== undefined) {
    const comparison = compareToNorm("body_fat", bodyFat, ctx.population, ctx.sex, ctx.position);
    if (comparison && comparison.percentile < 25) {
      push({
        id: "body_composition",
        area: "COMPOSITION",
        severity: "suivi",
        title: "Masse grasse au dessus de la fourchette de reference",
        finding: `Masse grasse a ${bodyFat}%, ${comparison.percentile}e percentile de la population de reference.`,
        rationale:
          "Une masse grasse elevee penalise le rapport puissance sur masse, donc l'acceleration et la detente. Elle doit toutefois etre interpretee avec l'evolution de la masse maigre, jamais isolement.",
        actions: [
          "Croiser avec l'evolution de la masse maigre avant toute conclusion.",
          "Orienter vers un accompagnement nutritionnel plutot que vers une restriction imposee.",
          "Maintenir le volume de force pour preserver la masse maigre pendant la phase de perte.",
        ],
        reference: comparison.source,
        metricKeys: ["body_fat"],
      });
    }
  }

  // -------------------------------------------------------------------------
  // 11. Donnees manquantes
  // -------------------------------------------------------------------------
  const essentialTests: Array<{ key: string; label: string }> = [
    { key: "cmj_height", label: "saut avec contre mouvement" },
    { key: "sprint_10m", label: "sprint lineaire" },
    { key: "nordic_force", label: "Nordic hamstring" },
    { key: "vift", label: "test intermittent 30-15" },
  ];
  const missing = essentialTests.filter((t) => value(m, t.key) === undefined);

  if (missing.length > 0) {
    push({
      id: "missing_data",
      area: "DONNEES",
      severity: "information",
      title: "Tests de base manquants",
      finding: `Aucune donnee pour : ${missing.map((t) => t.label).join(", ")}.`,
      rationale:
        "Sans ces mesures, une partie des recommandations ne peut pas etre produite et le profil du joueur reste incomplet.",
      actions: missing.map((t) => `Programmer le test : ${t.label}.`),
      reference: "Batterie de reprise recommandee",
      metricKeys: missing.map((t) => t.key),
    });
  }

  // -------------------------------------------------------------------------
  // Tri par gravite puis par domaine
  // -------------------------------------------------------------------------
  return recommendations.sort((a, b) => {
    const bySeverity = SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity];
    if (bySeverity !== 0) return bySeverity;
    return a.area.localeCompare(b.area);
  });
};

/** Resume chiffre pour l'entete de la fiche joueur. */
export const summariseRecommendations = (recommendations: Recommendation[]) => ({
  critique: recommendations.filter((r) => r.severity === "critique").length,
  important: recommendations.filter((r) => r.severity === "important").length,
  suivi: recommendations.filter((r) => r.severity === "suivi").length,
  information: recommendations.filter((r) => r.severity === "information").length,
  total: recommendations.length,
});
