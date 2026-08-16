/**
 * Compile l'APK Android.
 *
 * L'application etant rendue cote serveur, l'APK ne contient que la coque
 * native et l'adresse a laquelle se connecter. C'est cette adresse qu'il faut
 * fournir a la compilation :
 *
 *   npm run android:apk -- --url https://prepa.mondomaine.com
 *   npm run android:apk -- --url http://192.168.1.20:3200 --debug
 *
 * Sans --release, un APK de debogage est produit : il s'installe directement
 * sur un telephone sans aucune signature a preparer.
 */

import { execFileSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";

const args = process.argv.slice(2);
const flag = (name) => {
  const index = args.indexOf(`--${name}`);
  return index === -1 ? undefined : args[index + 1];
};
const has = (name) => args.includes(`--${name}`);

const url = flag("url") ?? process.env.APP_URL;
const release = has("release");

if (!url) {
  console.error("Adresse du serveur manquante.");
  console.error("  npm run android:apk -- --url https://prepa.mondomaine.com");
  process.exit(1);
}

if (release && url.startsWith("http://")) {
  console.error("Un APK de production ne doit pas pointer vers une adresse en http.");
  console.error("Le trafic ne serait pas chiffre, mots de passe compris.");
  process.exit(1);
}

const root = resolve(process.cwd());
const androidDir = join(root, "android");

if (!existsSync(androidDir)) {
  console.error("Le dossier android est absent. Lancer d'abord : npx cap add android");
  process.exit(1);
}

const run = (command, commandArgs, options = {}) => {
  console.log(`\n> ${command} ${commandArgs.join(" ")}`);
  execFileSync(command, commandArgs, {
    stdio: "inherit",
    shell: true,
    ...options,
    env: { ...process.env, APP_URL: url, ...(options.env ?? {}) },
  });
};

console.log(`Adresse du serveur : ${url}`);
console.log(`Variante           : ${release ? "release" : "debug"}`);

// La configuration est relue a chaque synchronisation : c'est ce qui grave
// l'adresse dans l'APK.
run("npx", ["cap", "sync", "android"]);

// Chemin absolu du wrapper : sous Windows, l'invoquer par son seul nom depuis
// un repertoire de travail different echoue selon la configuration du shell.
const gradle = join(androidDir, process.platform === "win32" ? "gradlew.bat" : "gradlew");
const task = release ? "assembleRelease" : "assembleDebug";
run(`"${gradle}"`, [task, "--no-daemon"], { cwd: androidDir });

const outputsDir = join(androidDir, "app", "build", "outputs", "apk", release ? "release" : "debug");

// Selon la presence d'une cle de signature, Gradle produit app-release.apk ou
// app-release-unsigned.apk : on accepte les deux.
const candidates = release
  ? [join(outputsDir, "app-release.apk"), join(outputsDir, "app-release-unsigned.apk")]
  : [join(outputsDir, "app-debug.apk")];

const built = candidates.find((candidate) => existsSync(candidate));

if (!built) {
  console.error(`\nAPK introuvable dans ${outputsDir}`);
  process.exit(1);
}

const signed = !built.endsWith("-unsigned.apk");

const outDir = join(root, "dist-apk");
mkdirSync(outDir, { recursive: true });

const stamp = new Date().toISOString().slice(0, 10);
const target = join(outDir, `prepa-physique-${release ? "release" : "debug"}-${stamp}.apk`);
copyFileSync(built, target);

const sizeMb = (statSync(target).size / 1024 / 1024).toFixed(1);

console.log("\n" + "=".repeat(66));
console.log(`APK pret : ${target}`);
console.log(`Taille   : ${sizeMb} Mo`);
console.log(`Serveur  : ${url}`);
console.log(`Signature: ${signed ? "signee avec la cle du projet" : "aucune"}`);

if (release && !signed) {
  console.log("\nAucune cle de signature trouvee, l'APK n'est pas installable tel quel.");
  console.log("Creer la cle une fois pour toutes :");
  console.log("  node scripts/create-keystore.mjs");
}
if (!release) {
  console.log("\nVariante de debogage : installable directement, mais marquee");
  console.log("debuggable. Pour une distribution large, preferer :");
  console.log(`  npm run android:apk -- --url ${url} --release`);
}
console.log("=".repeat(66));
