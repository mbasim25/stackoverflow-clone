import { Request, Response } from "express";
import { prisma } from "../server";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import * as validators from "../validators/validators";
import { User, PasswordChange, ResetEmail, ResetConfirm } from "../types";
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
      // TODO: make this a middleware
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
        include: {
          Question: { select: { body: true } },
          Answer: { select: { body: true } },
        },
      });

      return res.status(200).json(await validators.reshape(user));
    } catch (e) {
      return res.status(400).json();
    }
  };

  // TODO: restructure and rewrite
  updateAccount = async (req: Request, res: Response) => {
    try {
      // Validation
      const data: User = await validators.updateAccount(req);

      const requester: any = req.user;

      // Find user
      const user = await prisma.user.findUnique({
        where: {
          id: requester.id,
        },
      });

      // Security
      if (!user) {
        return res.status(404).send("user not found");
      } else if (user.id !== requester.id) {
        return res.status(403).send();
      }

      // Update
      const updated: User = await prisma.user.update({
        where: { id: requester.id },
        data: {
          ...data,
        },
      });

      return res.status(200).send(await validators.reshape(updated));
    } catch (e) {
      return res.status(400).send();
    }
  };

  // TODO: make super admin a seed data and not a controller
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

  passwordChange = async (req: Request, res: Response) => {
    try {
      const requester: any = req.user;
      const id = requester.id;

      // Find user
      const user: User = await prisma.user.findUnique({
        where: { id },
      });

      // Validation
      const data: PasswordChange = await validators.passwordChange(req);

      // Security
      if (!(await bcrypt.compare(data.old, user.password))) {
        return res.status(400).json("incorrect password");
      } else if (data.old === data.new) {
        return res
          .status(400)
          .json("new password can't be the same as the old password");
      }

      // Hash the new password
      data.new = await bcrypt.hash(data.new, 12);

      // Update the user with the new password
      await prisma.user.update({
        where: { id: requester.id },
        data: {
          password: data.new,
        },
      });

      return res.status(200).json("password changed");
    } catch (e) {
      return res.status(400).json();
    }
  };

  resetEmail = async (req: Request, res: Response) => {
    try {
      // Validation
      const data: ResetEmail = await validators.resetEmail(req);

      // Find user
      const user = await prisma.user.findUnique({
        where: { email: data.email },
      });

      // Checking the data
      if (!user) {
        return res.status(404).json("no user found");
      } else if (user.email !== data.email) {
        return res.status(403).json("the data the was provided is incorrect");
      }

      // Create a unique key
      const random = Math.floor(100000 + Math.random() * 900000).toString();

      // Save a token with those credentials
      await prisma.resetToken.create({
        data: {
          email: user.email,
          userId: user.id,
          uniqueKey: random,
        },
      });

      // Email options
      const options: any = {
        from: secrets.email,
        to: user.email,
        subject: "Password Reset",
        text: random,
      };

      // Send email
      mail.transporter.sendMail(options, (error: any, success: any) => {
        if (error) {
          return res.status(400).json("error sending the email");
        }
        return res.status(200).json("You will recieve your email shortly");
      });
    } catch (e) {
      res.status(400);
    }
  };

  resetConfirm = async (req: Request, res: Response) => {
    try {
      // Validation
      const data: ResetConfirm = await validators.resetConfirm(req);

      // Find token
      const token = await prisma.resetToken.findUnique({
        where: {
          uniqueKey: data.uniqueKey,
        },
      });

      // Check if the token exists
      if (!token) {
        return res.status(404);
      }

      // Hash the password
      data.password = await bcrypt.hash(data.password, 12);

      // Update the user's password
      await prisma.user.update({
        where: {
          email: data.email,
        },
        data: {
          password: data.password,
        },
      });

      return res.status(200).json("password changed");
    } catch (e) {
      return res.status(400).json();
    }
  };
}

export default new Controller();
