import bcrypt from "bcrypt";
import { prisma, PrismaClient } from "@prisma/client";
import { SUPER_ADMIN } from "../../src/utils/secrets";

const username = SUPER_ADMIN.USER;
const password = SUPER_ADMIN.PASSWORD;
const email = SUPER_ADMIN.EMAIL;

const superCreate = async (prisma: PrismaClient) => {
  const { id } = await prisma.field.findFirst();

  return await prisma.user.create({
    data: {
      username,
      password: await bcrypt.hash(password, 12),
      email,
      role: "SUPERADMIN",
      fieldId: id,
    },
  });
};

export default { superCreate };
