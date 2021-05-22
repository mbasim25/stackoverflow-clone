import { Request, Response } from "express";
import bcrypt from "bcrypt";

import * as validators from "../utils/validators";
import { Account } from "../types/accounts";

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class Controller {
  registration = async (req: Request, res: Response) => {
    try {
      const data: Account = await validators.register.validateAsync(req.body);
      data.password = await bcrypt.hash(data.password, 12);
      const account = await prisma.account.create({
        data: {},
      });

      return res.status(201).json();
    } catch (error) {
      return res.status(400).json(error);
    }
  };
}

export default new Controller();
