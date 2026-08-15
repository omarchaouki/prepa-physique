/**
 * Jeu de donnees de demonstration.
 *
 * Les resultats sont generes autour des valeurs de reference publiees, avec un
 * biais individuel stable par joueur et une progression au fil des passations,
 * puis passes dans les memes fonctions de calcul que l'application. Les courbes
 * et les percentiles affiches sont donc coherents entre eux.
 */

import { randomUUID } from "node:crypto";

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

import { TEST_MAP } from "../src/lib/sports-science/catalog";
import type { PlayerContext } from "../src/lib/sports-science/types";

const prisma = new PrismaClient();

/**
 * Les identifiants sont generes ici plutot que par la base.
 *
 * Cela permet de construire en memoire les resultats de tests et les metriques
 * qui s'y rattachent, puis de tout ecrire en quelques insertions groupees. Sur
 * une base distante ou chaque aller retour coute plus de trois cents
 * millisecondes, la difference se compte en minutes.
 */
const newId = () => randomUUID();

/** Les insertions groupees sont decoupees, une requete geante etant contre productive. */
const CHUNK = 500;

const chunked = <T>(items: T[]): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += CHUNK) chunks.push(items.slice(i, i + CHUNK));
  return chunks;
};

// --- Generateur pseudo aleatoire reproductible -------------------------------
let seedState = 20260813;
const random = (): number => {
  seedState = (seedState * 1664525 + 1013904223) % 4294967296;
  return seedState / 4294967296;
};
const gaussian = (mean: number, sd: number): number => {
  const u1 = Math.max(random(), 1e-9);
  const u2 = random();
  return mean + sd * Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
};
const pick = <T>(items: T[]): T => items[Math.floor(random() * items.length)];
const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

const FIRST_NAMES = [
  "Lucas", "Nathan", "Yanis", "Adam", "Rayan", "Ethan", "Mehdi", "Theo", "Enzo", "Noah",
  "Sofiane", "Amine", "Hugo", "Jules", "Ilyes", "Matteo", "Karim", "Gabriel", "Bilal", "Samuel",
  "Ayoub", "Antoine", "Malik", "Louis",
];
const LAST_NAMES = [
  "Bennani", "Martin", "Dubois", "Traore", "Moreau", "Cherif", "Laurent", "Diallo", "Girard",
  "Ferreira", "Benali", "Lefevre", "Sanchez", "Ndiaye", "Rossi", "Marchand", "Ziani", "Perrin",
  "Costa", "Haddad", "Renard", "Silva", "Ouattara", "Vidal",
];

const SENIOR_POSITIONS = ["GK", "GK", "CB", "CB", "CB", "CB", "FB", "FB", "FB", "FB", "DM", "DM", "CM", "CM", "CM", "AM", "AM", "W", "W", "W", "ST", "ST"];
const YOUTH_POSITIONS = ["GK", "GK", "CB", "CB", "CB", "FB", "FB", "DM", "CM", "CM", "CM", "AM", "W", "W", "W", "ST", "ST", "ST"];

interface SeededPlayer {
  id: string;
  firstName: string;
  lastName: string;
  position: string;
  birthDate: Date;
  heightCm: number;
  weightKg: number;
  /** Biais individuel stable, en ecarts types, applique a toutes les qualites. */
  talent: number;
  speedBias: number;
  enduranceBias: number;
  strengthBias: number;
}

const ageAt = (birthDate: Date, at: Date) =>
  (at.getTime() - birthDate.getTime()) / (365.25 * 86_400_000);

const buildRaw = (
  testKey: string,
  player: SeededPlayer,
  ctx: PlayerContext,
  wave: number,
): Record<string, number | string> | null => {
  // wave 0, 1, 2 : reprise, mi cycle, fin de cycle. Legere progression au fil du temps.
  const progress = wave * 0.35;
  const youth = ctx.ageYears < 18;
  const gkBonus = player.position === "GK";

  switch (testKey) {
    case "anthropometry": {
      const raw: Record<string, number | string> = {
        height: Number((player.heightCm + (youth ? wave * 0.8 : 0)).toFixed(1)),
        weight: Number((player.weightKg + gaussian(wave * 0.3, 0.5)).toFixed(1)),
        method: "durnin",
        // Somme des quatre plis voisine de 26 mm, soit environ 11% de masse grasse
        // par l'equation de Durnin et Womersley chez un adulte de 25 ans.
        biceps: Number(clamp(gaussian(3.6 - player.talent * 0.25, 0.7), 2, 10).toFixed(1)),
        triceps: Number(clamp(gaussian(6.6 - player.talent * 0.45, 1.3), 3, 16).toFixed(1)),
        subscapular: Number(clamp(gaussian(7.6 - player.talent * 0.45, 1.3), 4, 18).toFixed(1)),
        suprailiac: Number(clamp(gaussian(7.8 - player.talent * 0.5, 1.6), 4, 20).toFixed(1)),
      };
      if (youth) {
        raw.sittingHeight = Number((player.heightCm * 0.52 + gaussian(0, 0.8)).toFixed(1));
        raw.motherHeight = Number(clamp(gaussian(165, 6), 150, 182).toFixed(1));
        raw.fatherHeight = Number(clamp(gaussian(178, 7), 160, 198).toFixed(1));
      }
      return raw;
    }

    case "cmj": {
      const base = (youth ? 34 : 38.5) + (gkBonus ? 3 : 0);
      const height = clamp(gaussian(base + player.talent * 3.4 + progress, 1.4), 22, 58);
      const left = clamp(height * gaussian(0.56, 0.03), 10, 34);
      const asymFactor = clamp(gaussian(1.0, 0.07), 0.82, 1.18);
      return {
        height: Number(height.toFixed(1)),
        timeToTakeoff: Number(clamp(gaussian(0.86, 0.08), 0.6, 1.2).toFixed(3)),
        sjHeight: Number((height / clamp(gaussian(1.08, 0.05), 0.95, 1.22)).toFixed(1)),
        leftHeight: Number(left.toFixed(1)),
        rightHeight: Number((left * asymFactor).toFixed(1)),
      };
    }

    case "sprint_linear": {
      // Reperes de terrain : 10 m en 1.72 s, 20 m en 2.94 s, 30 m en 4.10 s chez
      // le professionnel. Les increments sont donc de 1.22 s puis 1.16 s, ce qui
      // correspond a une vitesse de pointe voisine de 9 metres par seconde.
      const quality = player.talent * 0.6 + player.speedBias;
      const t10 = clamp(
        gaussian((youth ? 1.8 : 1.72) - quality * 0.04 - progress * 0.01, 0.025),
        1.55,
        2.05,
      );
      // Le jeune est plus lent sur toute la course, pas seulement au demarrage.
      const youthPenalty = youth ? 0.05 : 0;
      const split1020 = clamp(
        gaussian(1.22 + youthPenalty - quality * 0.03 - progress * 0.008, 0.022),
        1.05,
        1.45,
      );
      const split2030 = clamp(
        gaussian(1.16 + youthPenalty * 1.6 - quality * 0.032 - progress * 0.008, 0.022),
        0.98,
        1.4,
      );
      return {
        t10: Number(t10.toFixed(3)),
        t20: Number((t10 + split1020).toFixed(3)),
        t30: Number((t10 + split1020 + split2030).toFixed(3)),
        timingStart: "photocell_05",
        temperature: 21,
      };
    }

    case "test_505": {
      const quality = player.talent * 0.5 + player.speedBias * 0.5;
      const left = clamp(gaussian((youth ? 2.56 : 2.42) - quality * 0.05 - progress * 0.01, 0.05), 2.15, 2.95);
      return {
        left: Number(left.toFixed(3)),
        right: Number((left * clamp(gaussian(1.0, 0.028), 0.94, 1.08)).toFixed(3)),
      };
    }

    case "nordic": {
      const base = (youth ? 300 : 344) * (ctx.bodyMassKg / (youth ? 68 : 76));
      const left = clamp(gaussian(base + player.strengthBias * 45 + progress * 22, 25), 180, 520);
      return {
        left: Math.round(left),
        right: Math.round(left * clamp(gaussian(1.0, 0.075), 0.78, 1.22)),
      };
    }

    case "groin_squeeze": {
      const addBase = ctx.bodyMassKg * clamp(gaussian(3.35 + player.strengthBias * 0.3 + progress * 0.12, 0.3), 2.3, 4.6);
      const left = clamp(addBase, 120, 460);
      return {
        addLeft: Math.round(left),
        addRight: Math.round(left * clamp(gaussian(1.0, 0.06), 0.85, 1.15)),
        abdLeft: Math.round(left / clamp(gaussian(1.03, 0.11), 0.75, 1.35)),
        abdRight: Math.round(left / clamp(gaussian(1.03, 0.11), 0.75, 1.35)),
      };
    }

    case "ift_30_15": {
      const base = youth ? 18.3 : 19.5;
      const gkPenalty = gkBonus ? -1.6 : 0;
      const vift = clamp(
        Math.round((base + player.enduranceBias * 1.1 + progress * 0.35 + gkPenalty) * 2) / 2,
        14.5,
        23.5,
      );
      // La vitesse maximale doit rester coherente avec celle qui ressort du test
      // de sprint, sinon la reserve de vitesse anaerobie n'a aucun sens.
      const speedQuality = player.talent * 0.6 + player.speedBias;
      const maxSprintSpeed = clamp(
        gaussian((youth ? 30.8 : 32.8) + speedQuality * 1.1, 0.5),
        25,
        37,
      );
      return { vift, maxSprintSpeed: Number(maxSprintSpeed.toFixed(1)) };
    }

    case "mobility": {
      const left = clamp(gaussian(11.4, 2.0), 5, 17);
      return {
        dorsiLeft: Number(left.toFixed(1)),
        dorsiRight: Number((left + gaussian(0, 1.1)).toFixed(1)),
        sitAndReach: Number(clamp(gaussian(12, 6), -8, 32).toFixed(1)),
      };
    }

    default:
      return null;
  }
};

const seedTestsForTeam = async (params: {
  teamId: string;
  players: SeededPlayer[];
  sex: "M" | "F";
  testKeys: string[];
  dates: Date[];
  createdById: string;
  batteryName: string[];
}) => {
  const sessions: Array<Record<string, unknown>> = [];
  const results: Array<Record<string, unknown>> = [];
  const metrics: Array<Record<string, unknown>> = [];

  for (let wave = 0; wave < params.dates.length; wave += 1) {
    const date = params.dates[wave];
    const sessionId = newId();

    sessions.push({
      id: sessionId,
      teamId: params.teamId,
      date,
      name: params.batteryName[wave],
      testKeys: params.testKeys.join(","),
      surface: "NATURAL_GRASS",
      temperatureC: 21,
      createdById: params.createdById,
    });

    for (const player of params.players) {
      const ctx: PlayerContext = {
        bodyMassKg: player.weightKg,
        heightCm: player.heightCm,
        ageYears: Number(ageAt(player.birthDate, date).toFixed(2)),
        sex: params.sex,
        position: player.position,
      };

      for (const testKey of params.testKeys) {
        const definition = TEST_MAP[testKey];
        if (!definition) continue;
        const raw = buildRaw(testKey, player, ctx, wave);
        if (!raw) continue;

        const computed = definition.compute(raw, ctx);
        if (computed.metrics.length === 0) continue;

        const resultId = newId();

        results.push({
          id: resultId,
          sessionId,
          playerId: player.id,
          teamId: params.teamId,
          testKey,
          date,
          rawJson: JSON.stringify(raw),
          computedJson: JSON.stringify({
            summary: computed.summary,
            flags: computed.flags,
            details: computed.details,
          }),
          createdById: params.createdById,
        });

        for (const metric of computed.metrics) {
          metrics.push({
            id: newId(),
            playerId: player.id,
            teamId: params.teamId,
            testResultId: resultId,
            key: metric.key,
            value: metric.value,
            unit: metric.unit,
            date,
            side: metric.side ?? null,
            source: "TEST",
          });
        }
      }
    }
  }

  await prisma.testSession.createMany({ data: sessions as never });
  for (const chunk of chunked(results)) {
    await prisma.testResult.createMany({ data: chunk as never });
  }
  for (const chunk of chunked(metrics)) {
    await prisma.metric.createMany({ data: chunk as never });
  }

  return { sessions: sessions.length, results: results.length, metrics: metrics.length };
};

const createPlayers = async (params: {
  teamId: string;
  count: number;
  positions: string[];
  minAge: number;
  maxAge: number;
  heightMean: number;
  weightMean: number;
}): Promise<SeededPlayer[]> => {
  const players: SeededPlayer[] = [];
  const rows: Array<Record<string, unknown>> = [];
  const used = new Set<string>();

  for (let i = 0; i < params.count; i += 1) {
    let firstName = pick(FIRST_NAMES);
    let lastName = pick(LAST_NAMES);
    let attempts = 0;
    while (used.has(`${firstName}${lastName}`) && attempts < 30) {
      firstName = pick(FIRST_NAMES);
      lastName = pick(LAST_NAMES);
      attempts += 1;
    }
    used.add(`${firstName}${lastName}`);

    const position = params.positions[i % params.positions.length];
    const ageYears = params.minAge + random() * (params.maxAge - params.minAge);
    const birthDate = new Date(Date.now() - ageYears * 365.25 * 86_400_000);
    const isKeeper = position === "GK";
    const heightCm = Number(
      clamp(gaussian(params.heightMean + (isKeeper ? 6 : 0), 5.5), 160, 200).toFixed(1),
    );
    const weightKg = Number(
      clamp(gaussian(params.weightMean + (heightCm - params.heightMean) * 0.75, 4), 50, 100).toFixed(1),
    );

    const id = newId();

    rows.push({
      id,
      teamId: params.teamId,
      firstName,
      lastName,
      birthDate,
      sex: "M",
      position,
      dominantFoot: random() > 0.78 ? "L" : "R",
      jerseyNumber: i + 1,
      heightCm,
      weightKg,
      status: i === 3 ? "REHAB" : i === 9 ? "INJURED" : "ACTIVE",
    });

    players.push({
      id,
      firstName,
      lastName,
      position,
      birthDate,
      heightCm,
      weightKg,
      talent: gaussian(0, 1),
      speedBias: gaussian(0, 0.8),
      enduranceBias: gaussian(0, 0.9),
      strengthBias: gaussian(0, 0.9),
    });
  }

  await prisma.player.createMany({ data: rows as never });
  return players;
};

const main = async () => {
  console.log("Nettoyage de la base");
  await prisma.metric.deleteMany();
  await prisma.testResult.deleteMany();
  await prisma.testSession.deleteMany();
  await prisma.playerLoad.deleteMany();
  await prisma.trainingSession.deleteMany();
  await prisma.dailyWellness.deleteMany();
  await prisma.injury.deleteMany();
  await prisma.anthropometry.deleteMany();
  await prisma.player.deleteMany();
  await prisma.teamMember.deleteMany();
  await prisma.team.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.user.deleteMany();
  await prisma.organization.deleteMany();

  const ownerEmail = process.env.OWNER_EMAIL ?? "owner@prepaphysique.app";
  const ownerPassword = process.env.OWNER_PASSWORD ?? "ChangeMoi2026";

  const owner = await prisma.user.create({
    data: {
      email: ownerEmail,
      passwordHash: await bcrypt.hash(ownerPassword, 10),
      name: process.env.OWNER_NAME ?? "Proprietaire",
      role: "OWNER",
      locale: "fr",
    },
  });
  console.log(`Compte proprietaire : ${ownerEmail}`);

  const club = await prisma.organization.create({
    data: {
      name: "FC Atlas",
      slug: "fc-atlas",
      country: "Maroc",
      city: "Casablanca",
      plan: "PRO",
      maxTeams: 10,
      maxPlayers: 300,
    },
  });

  const secondClub = await prisma.organization.create({
    data: {
      name: "Academie Horizon",
      slug: "academie-horizon",
      country: "France",
      city: "Lyon",
      plan: "STARTER",
      maxTeams: 3,
      maxPlayers: 90,
    },
  });

  const coachPassword = await bcrypt.hash("Demo2026", 10);

  const clubAdmin = await prisma.user.create({
    data: {
      email: "admin@fcatlas.com",
      passwordHash: coachPassword,
      name: "Directeur sportif",
      role: "CLUB_ADMIN",
      organizationId: club.id,
      jobTitle: "Directeur sportif",
    },
  });

  const coach = await prisma.user.create({
    data: {
      email: "coach@fcatlas.com",
      passwordHash: coachPassword,
      name: "Preparateur physique",
      role: "COACH",
      organizationId: club.id,
      jobTitle: "Preparateur physique",
    },
  });

  await prisma.user.create({
    data: {
      email: "coach@horizon.fr",
      passwordHash: coachPassword,
      name: "Responsable performance",
      role: "COACH",
      organizationId: secondClub.id,
      jobTitle: "Responsable performance",
    },
  });

  const seniorTeam = await prisma.team.create({
    data: {
      organizationId: club.id,
      name: "Equipe premiere",
      category: "SENIOR",
      level: "PRO",
      season: "2025-2026",
      colorHex: "#1E40AF",
    },
  });

  const youthTeam = await prisma.team.create({
    data: {
      organizationId: club.id,
      name: "U17 nationaux",
      category: "U17",
      level: "ACADEMY",
      season: "2025-2026",
      colorHex: "#D97706",
    },
  });

  await prisma.teamMember.createMany({
    data: [
      { teamId: seniorTeam.id, userId: coach.id, accessLevel: "MANAGE" },
      { teamId: youthTeam.id, userId: coach.id, accessLevel: "MANAGE" },
      { teamId: seniorTeam.id, userId: clubAdmin.id, accessLevel: "MANAGE" },
    ],
  });

  console.log("Creation des joueurs");
  const seniorPlayers = await createPlayers({
    teamId: seniorTeam.id,
    count: 22,
    positions: SENIOR_POSITIONS,
    minAge: 19,
    maxAge: 33,
    heightMean: 180,
    weightMean: 76,
  });

  const youthPlayers = await createPlayers({
    teamId: youthTeam.id,
    count: 18,
    positions: YOUTH_POSITIONS,
    minAge: 15.2,
    maxAge: 17.4,
    heightMean: 173,
    weightMean: 64,
  });

  const day = 86_400_000;
  const today = new Date();
  const dates = [
    new Date(today.getTime() - 150 * day),
    new Date(today.getTime() - 90 * day),
    new Date(today.getTime() - 25 * day),
  ];

  console.log("Generation des passations de tests");
  await seedTestsForTeam({
    teamId: seniorTeam.id,
    players: seniorPlayers,
    sex: "M",
    testKeys: ["anthropometry", "cmj", "sprint_linear", "test_505", "nordic", "groin_squeeze", "ift_30_15", "mobility"],
    dates,
    createdById: coach.id,
    batteryName: ["Bilan de reprise", "Controle mi preparation", "Controle de saison"],
  });

  await seedTestsForTeam({
    teamId: youthTeam.id,
    players: youthPlayers,
    sex: "M",
    testKeys: ["anthropometry", "cmj", "sprint_linear", "test_505", "ift_30_15", "mobility"],
    dates,
    createdById: coach.id,
    batteryName: ["Bilan de reprise U17", "Controle intermediaire U17", "Controle de saison U17"],
  });

  const counts = {
    organizations: await prisma.organization.count(),
    users: await prisma.user.count(),
    teams: await prisma.team.count(),
    players: await prisma.player.count(),
    testResults: await prisma.testResult.count(),
    metrics: await prisma.metric.count(),
  };

  console.log("");
  console.log("Donnees creees :", counts);
  console.log("");
  console.log("Comptes de connexion :");
  console.log(`  Proprietaire       ${ownerEmail} / ${ownerPassword}`);
  console.log("  Admin club         admin@fcatlas.com / Demo2026");
  console.log("  Preparateur        coach@fcatlas.com / Demo2026");
  console.log("  Autre club         coach@horizon.fr / Demo2026");
};

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
