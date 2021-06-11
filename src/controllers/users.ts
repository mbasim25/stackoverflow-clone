import { Request, Response } from "express";
import bcrypt from "bcrypt";
import * as validators from "../validators/validators";
import { User } from "../types";
import { prisma } from "../server";
import util from "util";
import fs from "fs";
import { uploadFile } from "../utils/s3";
const unlinkFile = util.promisify(fs.unlink);

class Controller {
  list = async (req: Request, res: Response) => {
    try {
      const admin: User = req.user;
      if (!admin.isSuperAdmin) {
        res.send(401).send();
      }
      const users = await prisma.user.findMany({});
      return res.status(200).send(users);
    } catch (e) {
      res.status(400).send();
    }
  };

  create = async (req: Request, res: Response) => {
    try {
      const data: User = await validators.createUser.validateAsync(req.body);
      data.password = await bcrypt.hash(data.password, 12);

      const file = req.file;
      const result = await uploadFile(file);
      await unlinkFile(file.path);

      const user = await prisma.user.create({
        data: {
          username: data.username,
          email: data.email,
          password: data.password,
          image: result.Location,
        },
      });
      return res.status(201).send(user.username);
    } catch (e) {
      console.log(e);
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

      return res.status(200).send("user updated");
    } catch (e) {
      res.status(400).send();
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
      res.status(400).send(e);
    }
  };
}

export default new Controller();
