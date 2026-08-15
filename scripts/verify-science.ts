/**
 * Verification des calculs contre des cas de reference issus de la litterature.
 * A lancer avec : npx tsx scripts/verify-science.ts
 *
 * Le but n'est pas de tester le code ligne a ligne mais de verifier que les
 * sorties tombent dans les intervalles publies pour un athlete typique.
 */

import { computeSprintProfile, interpretSprintProfile } from "../src/lib/sports-science/sprint";
import { computeCmj, computeDropJump } from "../src/lib/sports-science/jump";
import { compute3015Ift, computeYoYo, computeRsa } from "../src/lib/sports-science/endurance";
import { computeNordic, consensusOneRm } from "../src/lib/sports-science/strength";
import { computeMaturity, durninWomersley } from "../src/lib/sports-science/anthropometry";
import { computeChangeOfDirection } from "../src/lib/sports-science/agility";
import { computeAcwr } from "../src/lib/sports-science/load";
import { compareToNorm } from "../src/lib/sports-science/norms";

let failures = 0;

const check = (label: string, value: number, min: number, max: number, unit = "") => {
  const ok = value >= min && value <= max;
  if (!ok) failures += 1;
  const status = ok ? "OK  " : "ECHEC";
  console.log(
    `  ${status} ${label.padEnd(42)} ${String(value).padStart(9)} ${unit.padEnd(10)} attendu ${min} a ${max}`,
  );
};

console.log("\n=== 1. Profil force vitesse (Samozino) ===");
console.log("Footballeur professionnel, 78 kg, 1.80 m, 10 m en 1.72 s, 20 m en 2.94 s, 30 m en 4.10 s\n");

const sprint = computeSprintProfile({
  splits: [
    { distance: 10, time: 1.72 },
    { distance: 20, time: 2.94 },
    { distance: 30, time: 4.1 },
  ],
  bodyMassKg: 78,
  heightM: 1.8,
  temperatureC: 20,
  // Temps releves aux cellules avec depart 0.5 m en arriere.
  timingOffsetS: 0.37,
});

if (!sprint) {
  console.log("  ECHEC : aucun profil calcule");
  failures += 1;
} else {
  check("Vitesse maximale du modele", sprint.vmax, 8.5, 9.6, "m/s");
  check("F0 force horizontale", sprint.f0, 6.5, 9.0, "N/kg");
  check("V0 vitesse theorique", sprint.v0, 8.5, 10.0, "m/s");
  check("Pmax puissance horizontale", sprint.pmax, 14.5, 21.0, "W/kg");
  check("RFmax ratio de force", sprint.rfMax, 35, 55, "%");
  check("DRF decroissance", sprint.drf, -12, -4, "%/m/s");
  check("Qualite d'ajustement du modele", sprint.modelR2, 0.99, 1.0, "");
  check("Qualite de la regression F v", sprint.fvR2, 0.95, 1.0, "");
  console.log(`  Orientation : ${interpretSprintProfile(sprint).orientation}`);
  console.log(
    `  Temps reconstruits : ${sprint.predictedSplits.map((s) => `${s.distance}m=${s.time}s`).join("  ")}`,
  );
}

console.log("\n=== 2. Saut avec contre mouvement ===");
const cmj = computeCmj({
  heightCm: 38.5,
  bodyMassKg: 78,
  timeToTakeoffS: 0.78,
  sjHeightCm: 35.6,
  leftHeightCm: 21.5,
  rightHeightCm: 20.4,
});
check("Puissance relative", cmj.relativePowerWkg, 45, 70, "W/kg");
check("RSI modifie", cmj.rsiMod ?? 0, 0.35, 0.65, "m/s");
check("Ratio CMJ sur SJ", cmj.eur ?? 0, 1.0, 1.2, "");
check("Asymetrie", cmj.asymmetryPct ?? 0, 0, 12, "%");
check("Vitesse de decollage", cmj.takeoffVelocityMs, 2.5, 3.1, "m/s");

console.log("\n=== 3. Drop jump ===");
const dj = computeDropJump({ dropHeightCm: 30, jumpHeightCm: 34, contactTimeS: 0.19, bodyMassKg: 78 });
check("Indice de force reactive", dj.rsi, 1.5, 2.2, "m/s");
console.log(`  Categorie : ${dj.category}`);

console.log("\n=== 4. Endurance ===");
const yoyo = computeYoYo(2120, "IR1");
check("VO2max Yo-Yo IR1 a 2120 m", yoyo.vo2maxMlKgMin, 52, 58, "ml/kg/min");

const ift = compute3015Ift({ viftKmh: 19.5, ageYears: 24, bodyMassKg: 78, sex: "M" });
check("VO2max 30-15 a VIFT 19.5", ift.vo2maxMlKgMin, 48, 57, "ml/kg/min");
check("Vitesse 15 s / 15 s", ift.prescriptions[1].speedKmh, 18, 19.5, "km/h");

const rsa = computeRsa({ times: [4.15, 4.19, 4.24, 4.29, 4.33, 4.38] });
check("Decrement RSA", rsa?.decrementPct ?? 0, 1.5, 4.5, "%");

console.log("\n=== 5. Force ===");
const nordic = computeNordic({ leftForceN: 340, rightForceN: 355, bodyMassKg: 78 });
check("Force Nordic relative", nordic.relativeNkg, 7.5, 10, "N/kg");
check("Asymetrie Nordic", nordic.asymmetryPct, 0, 10, "%");
console.log(`  Niveau de risque : ${nordic.riskLevel}`);

const oneRm = consensusOneRm(120, 5);
check("Maximum estime pour 120 kg x 5", oneRm.estimate, 132, 142, "kg");

console.log("\n=== 6. Changement de direction ===");
const cod = computeChangeOfDirection({ test505LeftS: 2.44, test505RightS: 2.39, sprint10mS: 1.72 });
check("Deficit de changement de direction", cod.codDeficitLeftS ?? 0, 0.55, 0.85, "s");
check("Asymetrie 505", cod.asymmetryPct ?? 0, 0, 5, "%");

console.log("\n=== 7. Anthropometrie et maturation ===");
const bodyFat = durninWomersley(
  { biceps: 3.6, triceps: 6.6, subscapular: 7.6, suprailiac: 7.8 },
  24,
  "M",
);
check("Masse grasse (Durnin, somme 25.6 mm)", bodyFat.bodyFatPct, 8, 14, "%");

const maturity = computeMaturity({
  ageYears: 14.0,
  heightCm: 165,
  sittingHeightCm: 84,
  weightKg: 52,
  sex: "M",
});
check("Ecart au pic de croissance a 14 ans", maturity.maturityOffsetYears, -1.5, 1.5, "ans");
check("Age au pic de croissance", maturity.aphvYears, 12.5, 15.5, "ans");
console.log(`  Statut : ${maturity.status}`);

console.log("\n=== 8. Ratio de charge aigu sur chronique ===");
const loads = Array.from({ length: 42 }, (_, i) => ({
  date: `J${i + 1}`,
  load: i < 35 ? 400 : 900,
}));
const acwr = computeAcwr(loads);
check("Ratio apres montee brutale de charge", acwr[acwr.length - 1].ratio, 1.3, 2.2, "");
console.log(`  Zone : ${acwr[acwr.length - 1].zone}`);

console.log("\n=== 9. Percentiles ===");
const p1 = compareToNorm("sprint_10m", 1.72, "SENIOR_PRO", "M");
const p2 = compareToNorm("cmj_height", 38.5, "SENIOR_PRO", "M");
const p3 = compareToNorm("sprint_10m", 1.60, "SENIOR_PRO", "M");
check("Percentile 10 m a la moyenne", p1?.percentile ?? 0, 45, 55, "");
check("Percentile CMJ a la moyenne", p2?.percentile ?? 0, 45, 55, "");
check("Percentile 10 m tres rapide", p3?.percentile ?? 0, 90, 99, "");

console.log("\n" + "=".repeat(70));
if (failures === 0) {
  console.log("Toutes les verifications sont dans les intervalles publies.");
} else {
  console.log(`${failures} verification(s) hors intervalle. Voir le detail ci dessus.`);
  process.exitCode = 1;
}
