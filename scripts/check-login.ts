/**
 * Verifie qu'un couple email et mot de passe passe bien la comparaison bcrypt.
 * Usage : npx tsx scripts/check-login.ts email motdepasse
 */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const main = async () => {
  const email = (process.argv[2] ?? "").trim().toLowerCase();
  const password = process.argv[3] ?? "";

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    console.log(`Aucun compte pour ${email}`);
    return;
  }

  console.log(`Compte    : ${user.email} (${user.role})`);
  console.log(`Actif     : ${user.isActive}`);
  console.log(`Empreinte : ${user.passwordHash.slice(0, 7)}... longueur ${user.passwordHash.length}`);
  console.log(`Comparaison : ${await bcrypt.compare(password, user.passwordHash)}`);
};

main().finally(() => prisma.$disconnect());
