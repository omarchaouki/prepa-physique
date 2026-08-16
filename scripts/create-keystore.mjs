/**
 * Cree la cle de signature de l'application Android.
 *
 * A lancer une seule fois. Le fichier produit, android/release.jks, et son mot
 * de passe sont a conserver comme des identifiants bancaires :
 *
 *   - Android considere qu'une application signee avec une autre cle est une
 *     autre application. Perdre cette cle veut dire que les clubs devront
 *     desinstaller puis reinstaller pour recevoir la moindre mise a jour.
 *   - Le fichier est exclu du depot git, il n'existe donc que sur cette machine.
 *     En faire une copie hors de la machine, dans un gestionnaire de mots de
 *     passe ou un coffre.
 *
 * Le mot de passe est demande a l'ecran et n'est ecrit nulle part par ce script.
 *
 * Usage : node scripts/create-keystore.mjs
 */

import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { createInterface } from "node:readline/promises";
import { join, resolve } from "node:path";
import { stdin, stdout } from "node:process";

const androidDir = resolve(process.cwd(), "android");
const keystore = join(androidDir, "release.jks");

if (!existsSync(androidDir)) {
  console.error("Le dossier android est absent. Lancer d'abord : npx cap add android");
  process.exit(1);
}

if (existsSync(keystore)) {
  console.error(`Une cle existe deja : ${keystore}`);
  console.error("La remplacer casserait les mises a jour pour les installations existantes.");
  console.error("Supprimer le fichier manuellement si c'est reellement voulu.");
  process.exit(1);
}

const keytool = process.env.JAVA_HOME
  ? join(process.env.JAVA_HOME, "bin", "keytool")
  : "keytool";

const rl = createInterface({ input: stdin, output: stdout });

console.log("Creation de la cle de signature de Prepa Physique.\n");
console.log("Le mot de passe protege la cle. Le noter dans un gestionnaire de");
console.log("mots de passe avant de continuer : il sera demande a chaque");
console.log("compilation d'une version de production, et il est irrecuperable.\n");

const password = (await rl.question("Mot de passe (12 caracteres minimum) : ")).trim();
const confirm = (await rl.question("Confirmer le mot de passe             : ")).trim();
const organisation = (await rl.question("Nom de l'organisation                 : ")).trim();
const country = (await rl.question("Code pays sur deux lettres (ex : MA)  : ")).trim().toUpperCase();

rl.close();

if (password.length < 12) {
  console.error("\nMot de passe trop court, 12 caracteres au minimum.");
  process.exit(1);
}
if (password !== confirm) {
  console.error("\nLes deux mots de passe ne correspondent pas.");
  process.exit(1);
}

const dname = `CN=Prepa Physique, O=${organisation || "Prepa Physique"}, C=${country || "MA"}`;

try {
  execFileSync(
    keytool,
    [
      "-genkeypair",
      "-v",
      "-keystore", keystore,
      "-alias", "prepa-physique",
      "-keyalg", "RSA",
      "-keysize", "2048",
      // 10000 jours : au dela de toute duree de vie raisonnable de l'application,
      // ce qui evite qu'une cle expiree bloque une mise a jour dans dix ans.
      "-validity", "10000",
      "-storepass", password,
      "-keypass", password,
      "-dname", dname,
    ],
    { stdio: ["ignore", "inherit", "inherit"] },
  );
} catch {
  console.error("\nEchec de keytool. Verifier que JAVA_HOME pointe vers un JDK.");
  process.exit(1);
}

console.log("\n" + "=".repeat(66));
console.log(`Cle creee : ${keystore}`);
console.log("");
console.log("A faire maintenant, dans cet ordre :");
console.log("  1. Copier le mot de passe dans un gestionnaire de mots de passe.");
console.log("  2. Copier release.jks hors de cette machine.");
console.log("");
console.log("Compiler ensuite une version signee :");
console.log("  npm run android:apk -- --url https://lamsaa.ma --release");
console.log("=".repeat(66));
