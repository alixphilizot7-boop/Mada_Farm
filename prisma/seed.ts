import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const PLAN_YEARS = [
  { year: 1, targetEggs: 4875, targetChicksSold: 0, targetRevenue: 1395, targetCosts: 1870, targetNetResult: -475 },
  { year: 2, targetEggs: 19500, targetChicksSold: 800, targetRevenue: 6195, targetCosts: 3142, targetNetResult: 3054 },
  { year: 3, targetEggs: 19500, targetChicksSold: 1500, targetRevenue: 7008, targetCosts: 3358, targetNetResult: 3650 },
  { year: 4, targetEggs: 19500, targetChicksSold: 1800, targetRevenue: 7448, targetCosts: 3561, targetNetResult: 3887 },
  { year: 5, targetEggs: 19500, targetChicksSold: 2000, targetRevenue: 7840, targetCosts: 3776, targetNetResult: 4065 },
];

async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL ?? "admin@madafarm.local";
  const password = process.env.ADMIN_PASSWORD ?? "madafarm123";
  const name = process.env.ADMIN_NAME ?? "Farm Admin";

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`Admin user already exists: ${email}`);
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.create({
    data: { email, name, passwordHash, role: "ADMIN" },
  });

  console.log("Admin user created:");
  console.log(`  email:    ${email}`);
  console.log(`  password: ${password}`);
  console.log("Please sign in and change this password (or create your own account) right away.");
}

async function seedFarmSettings() {
  await prisma.farmSettings.upsert({
    where: { id: "singleton" },
    update: {},
    create: { id: "singleton", farmStartDate: new Date("2026-10-01") },
  });
  console.log("Farm settings ready.");
}

async function seedPlanYears() {
  for (const py of PLAN_YEARS) {
    await prisma.planYear.upsert({
      where: { year: py.year },
      update: py,
      create: py,
    });
  }
  console.log(`Seeded ${PLAN_YEARS.length} business plan year targets.`);
}

async function main() {
  await seedAdmin();
  await seedFarmSettings();
  await seedPlanYears();
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
