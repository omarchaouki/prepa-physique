/**
 * Cree ou met a jour le compte proprietaire a partir du fichier .env.
 *
 * Contrairement au seed, ce script ne vide rien : il se contente de garantir
 * qu'un compte proprietaire existe et que son mot de passe est bien celui de
 * OWNER_PASSWORD. C'est ce qu'il faut lancer sur une base de production ou l'on
 * ne veut surtout pas des donnees de demonstration.
 *
 * Usage : npx tsx scripts/ensure-owner.ts
 */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const main = async () => {
  const email = (process.env.OWNER_EMAIL ?? "").trim().toLowerCase();
  const password = process.env.OWNER_PASSWORD ?? "";
  const name = process.env.OWNER_NAME ?? "Proprietaire";

  if (!email || !password) {
    console.error("OWNER_EMAIL et OWNER_PASSWORD doivent etre definis dans .env");
    process.exitCode = 1;
    return;
  }
  if (password.length < 8) {
    console.error("OWNER_PASSWORD doit contenir au moins 8 caracteres.");
    process.exitCode = 1;
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const existing = await prisma.user.findUnique({ where: { email } });

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      passwordHash,
      name,
      role: "OWNER",
      isActive: true,
      organizationId: null,
      mustChangePw: false,
      // Ferme les sessions ouvertes avec l'ancien mot de passe.
      tokenVersion: { increment: 1 },
    },
    create: { email, passwordHash, name, role: "OWNER", locale: "fr" },
  });

  console.log(existing ? `Compte proprietaire mis a jour : ${user.email}` : `Compte proprietaire cree : ${user.email}`);

  const owners = await prisma.user.count({ where: { role: "OWNER" } });
  if (owners > 1) {
    const others = await prisma.user.findMany({
      where: { role: "OWNER", email: { not: email } },
      select: { email: true },
    });
    console.log("");
    console.log(`Attention : ${owners} comptes proprietaire existent.`);
    console.log(`Les autres : ${others.map((o) => o.email).join(", ")}`);
    console.log("Les desactiver depuis le panel si ce n'est pas voulu.");
  }
};

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
