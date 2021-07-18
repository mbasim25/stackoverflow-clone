import { PrismaClient } from "@prisma/client";

const names = [
  "VideoGamesDevelopment",
  "BackendDevelopment",
  "FrontendDevelopment",
  "MobileDevelopment",
];

const fieldCreate = async (prisma: PrismaClient) => {
  for (const name of names) {
    await prisma.field.create({ data: { name } });
  }
};

export default { fieldCreate };
