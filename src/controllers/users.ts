import { Request, Response } from "express";
import bcrypt from "bcrypt";

import * as validators from "../utils/validators";
import { User } from "../types";

import { prisma } from "../server";

class Controller {
  list = async (req: Request, res: Response) => {
    try {
      const admin: User = req.user;
      if (!admin.isSuperAdmin) {
        res.send(401).send();
      }
      const user = await prisma.user.findMany({});
      return res.status(200).send(user);
    } catch (e) {
      res.status(400).send(e);
    }
  };

  create = async (req: Request, res: Response) => {
    try {
      const data: User = await validators.superAdmin.validateAsync(req.body);
      data.password = await bcrypt.hash(data.password, 12);
      const user = await prisma.user.create({
        data: {
          username: data.username,
          password: data.password,
        },
      });
      return res.status(201).send(user);
    } catch (e) {
      res.status(400).send(e);
    }
  };

  update = async (req: Request, res: Response) => {
    try {
      const admin: User = req.user;
      if (!admin.isSuperAdmin) {
        return res.status(401).send("unauthorized");
      }

      const data: User = await validators.updateUser.validateAsync(req.body);

      //do i put a findUnique user to get a 404?

      const user = await prisma.user.update({
        where: {
          id: req.params.id,
        },
        data: {
          ...data,
        },
      });

      if (!user) {
        return res.status(404).send();
      }

      return res.status(200).send(user);
    } catch (e) {
      res.status(400).send(e);
    }
  };

  destroy = async (req: Request, res: Response) => {
    try {
      const data: User = await validators.superAdmin.validateAsync(req.user);
      if (!data.isSuperAdmin) {
        return res.send(401).send("unauthorized");
      }
      const user = await prisma.user.delete({
        where: {
          id: req.params.id,
        },
      });
      if (!user) {
        return res.status(404).send();
      }
      return res.status(204).send("user deleted");
    } catch (e) {
      res.status(400).send();
    }
  };
}

export default new Controller();
