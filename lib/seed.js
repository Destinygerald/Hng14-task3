import { DbSeeding } from "../config/db.js";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  await DbSeeding();
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
