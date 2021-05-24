import { Request, Response } from "express";
import bcrypt from "bcrypt";

import * as validators from "../utils/validators";
import { Account } from "../types/accounts";

import { prisma } from "../server";

import jwt from "jsonwebtoken";
import { secrets } from "../utils";

import { User, PChange } from "../types";

class Controller {
  registration = async (req: Request, res: Response) => {
    try {
      const data: Account = await validators.register.validateAsync(req.body);
      data.password = await bcrypt.hash(data.password, 12);
      const account = await prisma.user.create({
        data: { username: data.username, password: data.password },
      });
      return res.status(201).send(account);
    } catch (e) {
      return res.status(400).send(e);
    }
  };

  login = async (req: Request, res: Response) => {
    try {
      const data: Account = await validators.login.validateAsync(req.body);
      const account = await prisma.user.findUnique({
        where: {
          username: data.username,
        },
      });

      if (!(await bcrypt.compare(data.password, account.password))) {
        throw new Error("username or password were incorrect");
      }

      const token = jwt.sign({ id: account.id }, secrets.SECRET_KEY, {
        expiresIn: "24h",
      });
      return res.status(200).send({ token });
    } catch (e) {
      return res.status(400).send(e);
    }
  };

  super = async (req: Request, res: Response) => {
    try {
      req.body.password = await bcrypt.hash(req.body.password, 12);
      const sa = await prisma.user.create({
        data: {
          username: req.body.username,
          password: req.body.password,
          isAdmin: true,
          isSuperAdmin: true,
          isActive: true,
        },
      });
      return res.status(200).send(sa);
    } catch (e) {
      res.send(e);
    }
  };
  passwordchange = async (req: Request, res: Response) => {
    try {
      const requester: User = req.user;

      const user: User = await prisma.user.findUnique({
        where: {
          id: requester.id,
        },
      });

      const data: PChange = await validators.PassChange.validateAsync(req.body);

      if (!(await bcrypt.compare(data.password, user.password))) {
        return res.status(400).send("incorrect password");
      } else if (data.password === data.newPassword) {
        return res.status(400).send("new password cant be the old password");
      }

      data.newPassword = await bcrypt.hash(data.newPassword, 12);

      const account: User = await prisma.user.update({
        where: {
          id: requester.id,
        },
        data: {
          password: data.newPassword,
        },
      });

      return res.status(200).send(account);
    } catch (e) {
      return res.status(400).send(e);
    }
  };
}

export default new Controller();
