import { cache } from "react";

import { prisma } from "./db";
import { accessibleTeamIds, type CurrentUser } from "./auth";
import { ageExact } from "./utils";
import {
  compareToNorm,
  evaluateThreshold,
  METRIC_THRESHOLDS,
  RADAR_METRICS,
  resolvePopulation,
  type Population,
  type ThresholdStatus,
} from "./sports-science/norms";
import { buildRecommendations, summariseRecommendations } from "./sports-science/recommendations";
import { mean, percentChange, sd } from "./sports-science/stats";
import type { Locale } from "./i18n/dictionary";

/**
 * Fenetre d'historique chargee pour les vues de synthese.
 *
 * Les tableaux d'effectif et les alertes ne s'appuient que sur la derniere
 * valeur connue de chaque mesure. Remonter au dela d'une saison et demie
 * n'apporte rien et alourdit inutilement la requete, ce qui se voit des que la
 * base n'est plus sur la meme machine que l'application.
 * La fiche joueur, elle, charge tout l'historique : c'est son objet.
 */
const SUMMARY_WINDOW_MONTHS = 18;

const summaryWindowStart = (): Date => {
  const date = new Date();
  date.setMonth(date.getMonth() - SUMMARY_WINDOW_MONTHS);
  return date;
};

// ---------------------------------------------------------------------------
// Equipes
// ---------------------------------------------------------------------------

/**
 * cache() dedoublonne l'appel a l'echelle d'une requete HTTP. Plusieurs
 * frontieres Suspense peuvent donc demander la meme donnee sans la recharger.
 */
export const listTeams = cache(async (user: CurrentUser) => {
  const ids = await accessibleTeamIds(user);
  return prisma.team.findMany({
    where: ids === "ALL" ? { isActive: true } : { id: { in: ids }, isActive: true },
    include: {
      organization: { select: { id: true, name: true } },
      _count: { select: { players: true, testSessions: true } },
    },
    orderBy: [{ organization: { name: "asc" } }, { name: "asc" }],
  });
});

export const getTeam = cache(async (teamId: string) =>
  prisma.team.findUnique({
    where: { id: teamId },
    include: {
      organization: { select: { id: true, name: true } },
      members: { include: { user: { select: { id: true, name: true, email: true, role: true } } } },
    },
  }),
);

/**
 * Entete d'equipe : une seule ligne, indexee. Sert a afficher le titre et le fil
 * d'ariane immediatement, sans attendre le calcul de tout l'effectif.
 */
export const getTeamHeader = cache(async (teamId: string) =>
  prisma.team.findUnique({
    where: { id: teamId },
    select: {
      id: true,
      name: true,
      category: true,
      level: true,
      sex: true,
      season: true,
      colorHex: true,
      organization: { select: { id: true, name: true } },
    },
  }),
);

/** Identite du joueur, pour afficher l'entete de sa fiche sans delai. */
export const getPlayerIdentity = cache(async (playerId: string) =>
  prisma.player.findUnique({
    where: { id: playerId },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      birthDate: true,
      position: true,
      status: true,
      dominantFoot: true,
      jerseyNumber: true,
      heightCm: true,
      weightKg: true,
      teamId: true,
      team: {
        select: { id: true, name: true, category: true, level: true, organization: { select: { name: true } } },
      },
    },
  }),
);

// ---------------------------------------------------------------------------
// Metriques
// ---------------------------------------------------------------------------

export interface LatestMetric {
  key: string;
  side: string | null;
  value: number;
  unit: string;
  date: Date;
  /** Valeur precedente, pour afficher une evolution. */
  previous: number | null;
  changePct: number | null;
}

const reduceLatest = (
  metrics: Array<{ key: string; side: string | null; value: number; unit: string; date: Date }>,
): LatestMetric[] => {
  const grouped = new Map<string, typeof metrics>();
  for (const metric of metrics) {
    const id = `${metric.key}::${metric.side ?? ""}`;
    const list = grouped.get(id) ?? [];
    list.push(metric);
    grouped.set(id, list);
  }

  return [...grouped.values()].map((list) => {
    const sorted = [...list].sort((a, b) => b.date.getTime() - a.date.getTime());
    const current = sorted[0];
    const previous = sorted[1] ?? null;
    return {
      key: current.key,
      side: current.side,
      value: current.value,
      unit: current.unit,
      date: current.date,
      previous: previous?.value ?? null,
      changePct: previous ? percentChange(previous.value, current.value) : null,
    };
  });
};

// ---------------------------------------------------------------------------
// Fiche joueur
// ---------------------------------------------------------------------------

export interface MetricComparison extends LatestMetric {
  label: string;
  percentile: number | null;
  band: string | null;
  normMean: number | null;
  source: string | null;
  higherIsBetter: boolean;
  /** Position par rapport a la moyenne de l'equipe, en pourcentage. */
  vsSquadPct: number | null;
  /** Lecture par seuil, pour les metriques qui ne se lisent pas en percentile. */
  thresholdStatus: ThresholdStatus | null;
  thresholdLabel: string | null;
}

export const getPlayerProfile = cache(async (playerId: string, locale: Locale = "fr") => {
  const player = await prisma.player.findUnique({
    where: { id: playerId },
    include: {
      team: { include: { organization: { select: { id: true, name: true } } } },
    },
  });
  if (!player) return null;

  const [metrics, squadMetrics, results] = await Promise.all([
    prisma.metric.findMany({
      where: { playerId },
      orderBy: { date: "asc" },
      select: { key: true, side: true, value: true, unit: true, date: true },
    }),
    prisma.metric.findMany({
      where: { teamId: player.teamId },
      select: { playerId: true, key: true, side: true, value: true, date: true },
    }),
    prisma.testResult.findMany({
      where: { playerId },
      orderBy: { date: "desc" },
      include: { session: { select: { id: true, name: true } } },
    }),
  ]);

  const latest = reduceLatest(metrics);
  const population = resolvePopulation(player.team.category, player.team.level);
  const sex = (player.sex === "F" ? "F" : "M") as "M" | "F";
  const ageYears = ageExact(player.birthDate);

  // Moyenne de l'equipe sur la derniere valeur connue de chaque joueur.
  const squadLatestByKey = new Map<string, number[]>();
  const squadByPlayer = new Map<string, typeof squadMetrics>();
  for (const metric of squadMetrics) {
    const list = squadByPlayer.get(metric.playerId) ?? [];
    list.push(metric);
    squadByPlayer.set(metric.playerId, list);
  }
  for (const list of squadByPlayer.values()) {
    const grouped = new Map<string, typeof list>();
    for (const metric of list) {
      const id = `${metric.key}::${metric.side ?? ""}`;
      const bucket = grouped.get(id) ?? [];
      bucket.push(metric);
      grouped.set(id, bucket);
    }
    for (const [id, bucket] of grouped) {
      const newest = bucket.sort((a, b) => b.date.getTime() - a.date.getTime())[0];
      const values = squadLatestByKey.get(id) ?? [];
      values.push(newest.value);
      squadLatestByKey.set(id, values);
    }
  }

  const comparisons: MetricComparison[] = latest.map((metric) => {
    const comparison = compareToNorm(metric.key, metric.value, population, sex, player.position);
    const squadValues = squadLatestByKey.get(`${metric.key}::${metric.side ?? ""}`) ?? [];
    const squadMean = squadValues.length > 1 ? mean(squadValues) : null;
    const threshold = METRIC_THRESHOLDS[metric.key];
    const thresholdStatus = evaluateThreshold(metric.key, metric.value);

    return {
      ...metric,
      label: metricLabel(metric.key, locale),
      percentile: comparison?.percentile ?? null,
      band: comparison?.band ?? null,
      normMean: comparison?.normMean ?? null,
      source: comparison?.source ?? threshold?.reference ?? null,
      higherIsBetter:
        comparison?.higherIsBetter ?? (threshold ? !threshold.lowerIsBetter : true),
      vsSquadPct: squadMean ? percentChange(squadMean, metric.value) : null,
      thresholdStatus,
      thresholdLabel: threshold
        ? threshold.lowerIsBetter
          ? `seuil ${threshold.warn}`
          : `seuil ${threshold.warn}`
        : null,
    };
  });

  const recommendations = buildRecommendations({
    metrics: metrics.map((m) => ({
      key: m.key,
      value: m.value,
      side: (m.side as "L" | "R" | null) ?? null,
      date: m.date,
    })),
    population,
    sex,
    position: player.position,
    ageYears,
    playerName: `${player.firstName} ${player.lastName}`,
  });

  const radar = RADAR_METRICS.map((entry) => {
    const metric = latest.find((m) => m.key === entry.key && !m.side);
    if (!metric) return { key: entry.key, label: entry.label[locale], percentile: null, value: null };
    const comparison = compareToNorm(entry.key, metric.value, population, sex, player.position);
    return {
      key: entry.key,
      label: entry.label[locale],
      percentile: comparison?.percentile ?? null,
      value: metric.value,
    };
  });

  return {
    player,
    ageYears,
    population,
    metrics,
    latest,
    comparisons,
    radar,
    recommendations,
    recommendationSummary: summariseRecommendations(recommendations),
    results,
  };
});

/** Serie temporelle d'une metrique pour un joueur. */
export const getMetricSeries = (
  metrics: Array<{ key: string; side: string | null; value: number; date: Date }>,
  key: string,
  side?: "L" | "R" | null,
) =>
  metrics
    .filter((m) => m.key === key && (side === undefined || m.side === (side ?? null)))
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .map((m) => ({ date: m.date, value: m.value }));

// ---------------------------------------------------------------------------
// Vue equipe
// ---------------------------------------------------------------------------

export interface SquadRow {
  id: string;
  firstName: string;
  lastName: string;
  position: string;
  status: string;
  jerseyNumber: number | null;
  ageYears: number;
  metrics: Record<
    string,
    { value: number; percentile: number | null; thresholdStatus: ThresholdStatus | null } | undefined
  >;
  alerts: number;
  criticalAlerts: number;
}

export const getSquadOverview = cache(async (teamId: string) => {
  const team = await prisma.team.findUnique({
    where: { id: teamId },
    include: { organization: { select: { id: true, name: true } } },
  });
  if (!team) return null;

  const [players, metrics] = await Promise.all([
    prisma.player.findMany({
      where: { teamId },
      orderBy: [{ status: "asc" }, { lastName: "asc" }],
    }),
    prisma.metric.findMany({
      where: { teamId, date: { gte: summaryWindowStart() } },
      select: { playerId: true, key: true, side: true, value: true, unit: true, date: true },
    }),
  ]);

  const population = resolvePopulation(team.category, team.level);
  const byPlayer = new Map<string, typeof metrics>();
  for (const metric of metrics) {
    const list = byPlayer.get(metric.playerId) ?? [];
    list.push(metric);
    byPlayer.set(metric.playerId, list);
  }

  const rows: SquadRow[] = players.map((player) => {
    const playerMetrics = byPlayer.get(player.id) ?? [];
    const latest = reduceLatest(playerMetrics);
    const sex = (player.sex === "F" ? "F" : "M") as "M" | "F";

    const record: SquadRow["metrics"] = {};
    for (const metric of latest.filter((m) => !m.side)) {
      const comparison = compareToNorm(metric.key, metric.value, population, sex, player.position);
      record[metric.key] = {
        value: metric.value,
        percentile: comparison?.percentile ?? null,
        thresholdStatus: evaluateThreshold(metric.key, metric.value),
      };
    }

    const recommendations = buildRecommendations({
      metrics: playerMetrics.map((m) => ({
        key: m.key,
        value: m.value,
        side: (m.side as "L" | "R" | null) ?? null,
        date: m.date,
      })),
      population,
      sex,
      position: player.position,
      ageYears: ageExact(player.birthDate),
      playerName: `${player.firstName} ${player.lastName}`,
    }).filter((r) => r.severity !== "information");

    return {
      id: player.id,
      firstName: player.firstName,
      lastName: player.lastName,
      position: player.position,
      status: player.status,
      jerseyNumber: player.jerseyNumber,
      ageYears: ageExact(player.birthDate),
      metrics: record,
      alerts: recommendations.length,
      criticalAlerts: recommendations.filter((r) => r.severity === "critique").length,
    };
  });

  // Statistiques descriptives par metrique sur l'ensemble du groupe.
  const squadStats = new Map<string, { mean: number; sd: number; n: number; unit: string }>();
  const keys = new Set(metrics.filter((m) => !m.side).map((m) => m.key));
  for (const key of keys) {
    const values = rows
      .map((row) => row.metrics[key]?.value)
      .filter((v): v is number => v !== undefined);
    if (values.length < 2) continue;
    const unit = metrics.find((m) => m.key === key)?.unit ?? "";
    squadStats.set(key, { mean: mean(values), sd: sd(values), n: values.length, unit });
  }

  return { team, players, rows, squadStats, population };
});

// ---------------------------------------------------------------------------
// Libelles des metriques
// ---------------------------------------------------------------------------

const EXPLICIT_LABELS: Record<string, readonly [string, string]> = {
  sprint_5m: ["Sprint 5 m", "5 m sprint"],
  sprint_10m: ["Sprint 10 m", "10 m sprint"],
  sprint_20m: ["Sprint 20 m", "20 m sprint"],
  sprint_30m: ["Sprint 30 m", "30 m sprint"],
  sprint_40m: ["Sprint 40 m", "40 m sprint"],
  sprint_flying_20: ["Vitesse 10 a 30 m", "10 to 30 m speed"],
  sprint_vmax: ["Vitesse maximale", "Maximum speed"],
  max_speed: ["Vitesse maximale", "Maximum speed"],
  max_speed_ms: ["Vitesse maximale", "Maximum speed"],
  sprint_f0: ["F0 force horizontale", "F0 horizontal force"],
  sprint_v0: ["V0 vitesse theorique", "V0 theoretical velocity"],
  sprint_pmax: ["Puissance horizontale", "Horizontal power"],
  sprint_rfmax: ["Ratio de force maximal", "Maximum force ratio"],
  sprint_drf: ["Decroissance du ratio de force", "Force ratio decrease"],
  sprint_tau: ["Constante d'acceleration", "Acceleration constant"],
  cmj_height: ["Detente CMJ", "CMJ height"],
  cmj_power: ["Puissance CMJ", "CMJ peak power"],
  cmj_power_rel: ["Puissance relative CMJ", "CMJ relative power"],
  cmj_rsi_mod: ["RSI modifie", "Modified RSI"],
  cmj_eur: ["Ratio CMJ sur SJ", "CMJ to SJ ratio"],
  cmj_asym: ["Asymetrie de saut", "Jump asymmetry"],
  cmj_sl_height: ["Saut unilateral", "Single leg jump"],
  cmj_bilateral_deficit: ["Deficit bilateral", "Bilateral deficit"],
  sj_height: ["Detente squat jump", "Squat jump height"],
  sj_power_rel: ["Puissance relative SJ", "SJ relative power"],
  dj_rsi: ["Indice de force reactive", "Reactive strength index"],
  dj_height: ["Detente drop jump", "Drop jump height"],
  dj_contact: ["Temps de contact", "Contact time"],
  hop_lsi_worst: ["Symetrie la plus basse", "Lowest symmetry"],
  nordic_force: ["Force Nordic", "Nordic force"],
  nordic_rel: ["Force Nordic relative", "Relative Nordic force"],
  nordic_asym: ["Asymetrie Nordic", "Nordic asymmetry"],
  groin_add: ["Adduction", "Adduction"],
  groin_add_rel: ["Adduction relative", "Relative adduction"],
  groin_add_asym: ["Asymetrie adducteurs", "Adductor asymmetry"],
  groin_ratio: ["Rapport adducteurs sur abducteurs", "Adductor to abductor ratio"],
  imtp_peak: ["Pic de force IMTP", "IMTP peak force"],
  imtp_rel: ["Force relative IMTP", "IMTP relative force"],
  imtp_rfd100: ["Gradient de force 100 ms", "RFD 100 ms"],
  imtp_rfd200: ["Gradient de force 200 ms", "RFD 200 ms"],
  dsi: ["Indice de force dynamique", "Dynamic strength index"],
  lv_onerm: ["Maximum estime par la vitesse", "Velocity based maximum"],
  lv_slope: ["Pente charge vitesse", "Load velocity slope"],
  lv_v0: ["Vitesse a charge nulle", "Velocity at zero load"],
  cod_505: ["Test 505", "505 test"],
  cod_505_best: ["Meilleur 505", "Best 505"],
  cod_505_asym: ["Asymetrie 505", "505 asymmetry"],
  cod_deficit: ["Deficit de changement de direction", "Change of direction deficit"],
  illinois_time: ["Test Illinois", "Illinois test"],
  t_test_time: ["Test en T", "T test"],
  vo2max_yoyo: ["VO2max (Yo-Yo)", "VO2max (Yo-Yo)"],
  vo2max_ift: ["VO2max (30-15)", "VO2max (30-15)"],
  vo2max_mas: ["VO2max (VMA)", "VO2max (MAS)"],
  vift: ["VIFT", "VIFT"],
  mas: ["VMA", "MAS"],
  asr: ["Reserve de vitesse anaerobie", "Anaerobic speed reserve"],
  yoyo_ir1_distance: ["Distance Yo-Yo IR1", "Yo-Yo IR1 distance"],
  yoyo_ir2_distance: ["Distance Yo-Yo IR2", "Yo-Yo IR2 distance"],
  bronco_time: ["Temps Bronco", "Bronco time"],
  bronco_speed: ["Vitesse moyenne Bronco", "Bronco average speed"],
  rsa_best: ["Meilleur sprint RSA", "Best RSA sprint"],
  rsa_mean: ["Temps moyen RSA", "RSA mean time"],
  rsa_total: ["Temps total RSA", "RSA total time"],
  rsa_decrement: ["Decrement RSA", "RSA decrement"],
  hr_rest: ["Frequence de repos", "Resting heart rate"],
  hr_max: ["Frequence maximale", "Maximum heart rate"],
  hr_max_measured: ["Frequence maximale mesuree", "Measured maximum heart rate"],
  hr_reserve: ["Reserve cardiaque", "Heart rate reserve"],
  height: ["Taille", "Height"],
  weight: ["Masse corporelle", "Body mass"],
  bmi: ["Indice de masse corporelle", "Body mass index"],
  body_fat: ["Masse grasse", "Body fat"],
  lean_mass: ["Masse maigre", "Lean mass"],
  ffmi: ["Indice de masse maigre", "Fat free mass index"],
  maturity_offset: ["Ecart au pic de croissance", "Maturity offset"],
  aphv: ["Age au pic de croissance", "Age at peak height velocity"],
  pct_adult_height: ["Pourcentage de taille adulte", "Percent of adult height"],
  dorsiflexion: ["Dorsiflexion", "Dorsiflexion"],
  dorsiflexion_asym: ["Asymetrie de dorsiflexion", "Dorsiflexion asymmetry"],
  sit_and_reach: ["Souplesse assis", "Sit and reach"],
  thomas: ["Test de Thomas", "Thomas test"],
};

/** Exercices du test de maximum a une repetition, dont la cle porte le nom. */
const EXERCISE_LABELS: Record<string, readonly [string, string]> = {
  back_squat: ["squat arriere", "back squat"],
  front_squat: ["squat avant", "front squat"],
  deadlift: ["souleve de terre", "deadlift"],
  hip_thrust: ["hip thrust", "hip thrust"],
  bench_press: ["developpe couche", "bench press"],
  bulgarian_split_squat: ["fente bulgare", "Bulgarian split squat"],
};

export const metricLabel = (key: string, locale: Locale = "fr"): string => {
  const index = locale === "en" ? 1 : 0;

  const explicit = EXPLICIT_LABELS[key];
  if (explicit) return explicit[index];

  const exercise = (raw: string) => EXERCISE_LABELS[raw]?.[index] ?? raw.replace(/_/g, " ");

  if (key.startsWith("onerm_rel_")) {
    const name = exercise(key.replace("onerm_rel_", ""));
    return locale === "en" ? `Relative strength ${name}` : `Force relative ${name}`;
  }
  if (key.startsWith("onerm_")) {
    const name = exercise(key.replace("onerm_", ""));
    return locale === "en" ? `Estimated maximum ${name}` : `Maximum ${name}`;
  }
  if (key.startsWith("hop_lsi_")) {
    return locale === "en" ? "Single leg hop symmetry" : "Symetrie saut unilateral";
  }
  return key.replace(/_/g, " ");
};

// ---------------------------------------------------------------------------
// Tableau de bord
// ---------------------------------------------------------------------------

/**
 * Indicateurs du tableau de bord : uniquement des comptages, tous indexes.
 * Volontairement separe des alertes, qui sont bien plus lourdes, pour que les
 * chiffres s'affichent sans attendre le calcul des recommandations.
 */
export const getDashboardStats = cache(async (user: CurrentUser) => {
  const ids = await accessibleTeamIds(user);
  const teamFilter = ids === "ALL" ? {} : { teamId: { in: ids } };

  const [teamCount, playerCount, sessionCount, injuredCount, latestMetric] = await Promise.all([
    prisma.team.count({
      where: ids === "ALL" ? { isActive: true } : { id: { in: ids }, isActive: true },
    }),
    prisma.player.count({ where: { ...teamFilter, status: { not: "LEFT" } } }),
    prisma.testSession.count({ where: teamFilter }),
    prisma.player.count({ where: { ...teamFilter, status: { in: ["INJURED", "REHAB"] } } }),
    prisma.metric.findFirst({
      where: teamFilter,
      orderBy: { date: "desc" },
      select: { date: true },
    }),
  ]);

  return {
    teamCount,
    playerCount,
    sessionCount,
    injuredCount,
    lastTestDate: latestMetric?.date ?? null,
  };
});

export const getRecentSessions = cache(async (user: CurrentUser, take = 5) => {
  const ids = await accessibleTeamIds(user);
  return prisma.testSession.findMany({
    where: ids === "ALL" ? {} : { teamId: { in: ids } },
    orderBy: { date: "desc" },
    take,
    include: {
      team: { select: { id: true, name: true } },
      _count: { select: { results: true } },
    },
  });
});

export interface DashboardAlert {
  playerId: string;
  playerName: string;
  teamId: string;
  teamName: string;
  position: string;
  ageYears: number;
  alerts: number;
  criticalAlerts: number;
}

/**
 * Joueurs a surveiller, toutes equipes accessibles confondues.
 *
 * Deux requetes au total, quel que soit le nombre d'equipes, au lieu d'une
 * synthese complete par equipe. Seuls les joueurs encore a l'effectif et les
 * mesures de la fenetre courante sont charges.
 */
export const getSquadAlerts = cache(async (user: CurrentUser, limit = 8) => {
  const ids = await accessibleTeamIds(user);
  const teamFilter = ids === "ALL" ? {} : { teamId: { in: ids } };

  const players = await prisma.player.findMany({
    where: { ...teamFilter, status: { not: "LEFT" } },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      position: true,
      birthDate: true,
      sex: true,
      teamId: true,
      team: { select: { id: true, name: true, category: true, level: true } },
    },
  });

  if (players.length === 0) return [] as DashboardAlert[];

  const metrics = await prisma.metric.findMany({
    where: {
      playerId: { in: players.map((p) => p.id) },
      date: { gte: summaryWindowStart() },
    },
    select: { playerId: true, key: true, side: true, value: true, date: true },
  });

  const byPlayer = new Map<string, typeof metrics>();
  for (const metric of metrics) {
    const list = byPlayer.get(metric.playerId) ?? [];
    list.push(metric);
    byPlayer.set(metric.playerId, list);
  }

  const alerts: DashboardAlert[] = [];

  for (const player of players) {
    const playerMetrics = byPlayer.get(player.id);
    if (!playerMetrics || playerMetrics.length === 0) continue;

    const recommendations = buildRecommendations({
      metrics: playerMetrics.map((m) => ({
        key: m.key,
        value: m.value,
        side: (m.side as "L" | "R" | null) ?? null,
        date: m.date,
      })),
      population: resolvePopulation(player.team.category, player.team.level),
      sex: player.sex === "F" ? "F" : "M",
      position: player.position,
      ageYears: ageExact(player.birthDate),
      playerName: `${player.firstName} ${player.lastName}`,
    }).filter((r) => r.severity !== "information");

    if (recommendations.length === 0) continue;

    alerts.push({
      playerId: player.id,
      playerName: `${player.firstName} ${player.lastName}`,
      teamId: player.team.id,
      teamName: player.team.name,
      position: player.position,
      ageYears: ageExact(player.birthDate),
      alerts: recommendations.length,
      criticalAlerts: recommendations.filter((r) => r.severity === "critique").length,
    });
  }

  return alerts
    .sort((a, b) => b.criticalAlerts - a.criticalAlerts || b.alerts - a.alerts)
    .slice(0, limit);
});

export type { Population };

/**
 * Etat de prise en main d'un compte.
 *
 * Trois comptes suffisent a savoir ou en est l'utilisateur dans son
 * installation. La requete est volontairement separee de `getDashboardStats` :
 * celle ci alimente des indicateurs affiches en permanence, alors que celle la
 * ne sert qu'a decider si le guide de demarrage doit apparaitre, et disparait
 * du parcours des que le club est installe.
 */
export const getOnboardingState = cache(async (user: CurrentUser) => {
  const ids = await accessibleTeamIds(user);
  const teamFilter = ids === "ALL" ? {} : { teamId: { in: ids } };

  const [teams, players, sessions, firstTeam] = await Promise.all([
    prisma.team.count({
      where: ids === "ALL" ? {} : { id: { in: ids } },
    }),
    prisma.player.count({ where: { ...teamFilter, status: { not: "LEFT" } } }),
    prisma.testSession.count({ where: teamFilter }),
    prisma.team.findFirst({
      where: ids === "ALL" ? {} : { id: { in: ids } },
      orderBy: { createdAt: "asc" },
      select: { id: true },
    }),
  ]);

  return {
    teams,
    players,
    sessions,
    firstTeamId: firstTeam?.id ?? null,
    // La lecture seule ne cree rien : lui proposer trois etapes qu'elle ne peut
    // pas franchir serait une invitation a l'echec.
    canCreate: user.role !== "VIEWER",
  };
});
