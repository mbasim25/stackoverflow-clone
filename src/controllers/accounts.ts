import { Request, Response } from "express";
import bcrypt from "bcrypt";
import * as validators from "../utils/validators";
import { prisma } from "../server";
import jwt from "jsonwebtoken";
import { secrets } from "../utils";
import { User, PChange, ResetPass, PR } from "../types";
import fs from "fs";
import { uploadFile } from "../utils/s3";
import { transporter } from "../utils/mail";
import util from "util";

const unlinkFile = util.promisify(fs.unlink);

class Controller {
  registration = async (req: Request, res: Response) => {
    try {
      const data: User = await validators.register.validateAsync(req.body);
      data.password = await bcrypt.hash(data.password, 12);

      const file = req.file;
      const result = await uploadFile(file);
      await unlinkFile(file.path);

      const account = await prisma.user.create({
        data: {
          username: data.username,
          password: data.password,
          image: result.Location,
          email: data.email,
        },
      });
      delete account.password;
      return res.status(201).send(account);
    } catch (e) {
      console.log(e);
      return res.status(400).send(e);
    }
  };

  login = async (req: Request, res: Response) => {
    try {
      const data: User = await validators.login.validateAsync(req.body);
      const account = await prisma.user.findUnique({
        where: {
          username: data.username,
        },
      });
      if (!account.isActive) {
        return res
          .status(403)
          .send("this account was deactivated by moderators");
      } else if (!(await bcrypt.compare(data.password, account.password))) {
        return res.status(403).send("username or password were incorrect");
      }

      const token = jwt.sign({ id: account.id }, secrets.SECRET_KEY, {
        expiresIn: "24h",
      });
      const refresh_token = jwt.sign({ id: account.id }, secrets.SECRET_KEY, {
        expiresIn: "29d",
      });
      return res.status(200).send({ token, refresh_token });
    } catch (e) {
      return res.status(400).send();
    }
  };

  profile = async (req: Request, res: Response) => {
    try {
      const requester: User = req.user;
      const profile = await prisma.user.findUnique({
        where: { id: requester.id },
      });

      delete profile.password;

      return res.status(200).send(profile);
    } catch (e) {
      return res.status(400).send();
    }
  };

  super = async (req: Request, res: Response) => {
    try {
      req.body.password = await bcrypt.hash(req.body.password, 12);
      const sa = await prisma.user.create({
        data: {
          username: req.body.username,
          email: req.body.email,
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

      const data: PChange = await validators.passChange.validateAsync(req.body);

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

      return res.status(200).send("password changed");
    } catch (e) {
      return res.status(400).send();
    }
  };

  updateAccount = async (req: Request, res: Response) => {
    try {
      const file = req.file;
      const data: User = await validators.updateAccount.validateAsync(req.body);

      const result = await uploadFile(file);
      await unlinkFile(file.path);

      const requester: User = req.user;

      const user = await prisma.user.findUnique({
        where: {
          id: requester.id,
        },
      });

      if (!user) {
        return res.status(404).send("user not found");
      } else if (user.id !== requester.id) {
        return res.status(403).send();
      }

      const updated: User = await prisma.user.update({
        where: { id: requester.id },
        data: {
          username: data.username,
          password: data.password,
          image: result.Location,
          email: data.email,
        },
      });

      return res.status(200).send(updated);
    } catch (e) {
      console.log(e);
      return res.status(400).send();
    }
  };

  emailToken = async (req: Request, res: Response) => {
    try {
      const data: PR = await validators.emailToken.validateAsync(req.body);

      const user = await prisma.user.findUnique({
        where: {
          email: data.email,
        },
      });

      if (!user) {
        return res.status(404).send("no user found");
      } else if (user.email !== data.email) {
        return res.status(403).send("the data the was provided is incorrect");
      }

      const random = Math.floor(100000 + Math.random() * 900000).toString();
      const options: any = {
        from: secrets.email,
        to: user.email,
        subject: "Password Reset",
        text: random,
      };

      const token: ResetPass = await prisma.resetToken.create({
        data: {
          email: user.email,
          userId: user.id,
          uniqueKey: random,
        },
      });

      transporter.sendMail(options, (error: any, success: any) => {
        if (error) {
          return res.status(400).send("error sending the email");
        }
        return res.status(200).send(success);
      });

      return res.status(200).send();
    } catch (e) {
      res.status(400).send();
    }
  };

  passReset = async (req: Request, res: Response) => {
    try {
      const data: ResetPass = await validators.rPass.validateAsync(req.body);
      const token = await prisma.resetToken.findUnique({
        where: {
          uniqueKey: data.uniqueKey,
        },
      });

      if (!token) {
        return res.status(404).send();
      }

      data.password = await bcrypt.hash(data.password, 12);

      const user = await prisma.user.update({
        where: {
          email: data.email,
        },
        data: {
          password: data.password,
        },
      });

      return res.status(200).send("password changed");
    } catch (e) {
      return res.status(400).send();
    }
  };
}

export default new Controller();
