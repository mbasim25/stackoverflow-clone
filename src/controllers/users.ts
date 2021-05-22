import { Request, Response } from "express";
import bcrypt from "bcrypt";

import * as validators from "../utils/validators";
import { User } from "../types/users";

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class Controller {
  list = async (req: Request, res: Response) => {
    try {
      const data: User = await validators.superAdmin.validateAsync(req.user);
      console.log(data);
      if (!((await data.isSuperAdmin) == true)) {
        res.send(401).send();
      }
      const user = await prisma.user.findMany({});
      res.status(200).send(user);
    } catch (e) {
      res.status(500).send(e);
    }
  };

  create = async (req: Request, res: Response) => {
    try {
      const data: User = await validators.superAdmin.validateAsync(req.body);
      data.password = await bcrypt.hash(data.password, 12);
      const user = await prisma.user.create({
        data: {
          ...data,
        },
      });
      res.status(201).send(user);
    } catch (e) {
      res.status(500).send(e);
    }
  };

  update = async (req: Request, res: Response) => {
    try {
      const data: User = await validators.updateUser.validateAsync(req.body);
    } catch (e) {
      res.status(400);
    }
  };

  destroy = async (req: Request, res: Response) => {
    try {
      const id = req.params.id;
      await prisma.user.delete({
        where: {
          id: id,
        },
      });
      res.status(200).send("user deleted");
    } catch (e) {
      res.status(500).send();
    }
  };
}

export default new Controller();
