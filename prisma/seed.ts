import { PrismaClient } from "@prisma/client";
import { users, fields } from "./data";

const prisma = new PrismaClient();

const main = async () => {
  try {
    // Create fields
    await fields.fieldCreate(prisma);

    // Create superadmin
    await users.superCreate(prisma);
  } catch (e) {
    console.log(e);
  }
};

main()
  .catch((error) => {
    console.log(error);
    process.exit(1);
  })
  .finally(async () => {
    console.log("Done Seeding");
    await prisma.$disconnect();
  });
