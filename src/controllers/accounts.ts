import { Request, Response } from "express";
import { prisma } from "../server";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import * as validators from "../validators/validators";
import { User, PassChange, PassReset, EmailPassReset } from "../types";
import { secrets, mail } from "../utils";

class Controller {
  registration = async (req: Request, res: Response) => {
    try {
      // Validation
      const data = await validators.register(req);

      // Register
      const user = await prisma.user.create({ data });

      return res.status(201).json(await validators.reshape(user));
    } catch (e) {
      return res.status(400).json();
    }
  };

  login = async (req: Request, res: Response) => {
    try {
      // Validation
      const data: User = await validators.login(req);

      // Find user
      const user = await prisma.user.findUnique({
        where: {
          username: data.username,
        },
      });

      // Security
      if (!user.isActive) {
        return res
          .status(403)
          .send("this account was deactivated by moderators");
      } else if (!(await bcrypt.compare(data.password, user.password))) {
        return res.status(403).send("username or password were incorrect");
      }

      // Tokens assignment
      const token = jwt.sign(
        { id: user.id, type: "ACCESS" },
        secrets.SECRET_KEY,
        { expiresIn: "24h" }
      );

      const refresh_token = jwt.sign(
        { id: user.id, type: "REFRESH" },
        secrets.SECRET_KEY,
        { expiresIn: "24h" }
      );

      // Remove extra fields
      await validators.reshape(user);

      return res.status(200).json({ token, refresh_token, user });
    } catch (e) {
      return res.status(400).json();
    }
  };

  refreshToken = async (req: Request, res: Response) => {
    try {
      // Decode token
      const refresh = jwt.decode(req.body.refreshToken, { complete: true });
      const id = refresh.patload.id;

      // Find user
      const user: User = await prisma.user.findUnique({
        where: { id },
      });

      if (!user) {
        return res.status(404).send("User not found");
      }

      // Assign tokens
      const token = jwt.sign(
        { id: user.id, type: "ACCESS" },
        secrets.SECRET_KEY,
        { expiresIn: "24h" }
      );

      const refresh_token = jwt.sign(
        { id: user.id, type: "REFRESH" },
        secrets.SECRET_KEY,
        { expiresIn: "24h" }
      );

      return res.status(200).json({ token, refresh_token });
    } catch (e) {
      return res.status(400).json();
    }
  };

  profile = async (req: Request, res: Response) => {
    try {
      const requester: any = req.user;

      // Find user
      const user = await prisma.user.findUnique({
        where: { id: requester.id },
      });

      return res.status(200).json(await validators.reshape(user));
    } catch (e) {
      return res.status(400).json();
    }
  };

  super = async (req: Request, res: Response) => {
    try {
      req.body.password = await bcrypt.hash(req.body.password, 12);
      const superadmin = await prisma.user.create({
        data: {
          username: req.body.username,
          email: req.body.email,
          password: req.body.password,
          isAdmin: true,
          isSuperAdmin: true,
          isActive: true,
        },
      });
      return res.status(200).send(superadmin);
    } catch (e) {
      res.send();
    }
  };

  passwordchange = async (req: Request, res: Response) => {
    try {
      const requester: any = req.user;

      const user: User = await prisma.user.findUnique({
        where: {
          id: requester.id,
        },
      });

      const data: PassChange = await validators.passChange.validateAsync(
        req.body
      );

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
      const data: User = await validators.updateAccount.validateAsync(req.body);

      const requester: any = req.user;

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
          ...data,
        },
      });

      return res.status(200).send(updated);
    } catch (e) {
      return res.status(400).send();
    }
  };

  emailToken = async (req: Request, res: Response) => {
    try {
      const data: EmailPassReset = await validators.emailToken.validateAsync(
        req.body
      );

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

      const token: PassReset = await prisma.resetToken.create({
        data: {
          email: user.email,
          userId: user.id,
          uniqueKey: random,
        },
      });

      mail.transporter.sendMail(options, (error: any, success: any) => {
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
      const data: PassReset = await validators.passReset.validateAsync(
        req.body
      );
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
