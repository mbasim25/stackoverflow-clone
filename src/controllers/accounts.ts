import { Request, Response } from "express";
import { prisma } from "../server";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import * as validators from "../validators/users";
import { User, PasswordChange, ResetEmail, ResetConfirm } from "../types";
import { secrets, mail } from "../utils";

class Controller {
  registration = async (req: Request, res: Response) => {
    try {
      // TODO: remove extra consol logs
      console.log(req);
      // Validation
      const data = await validators.register(req);

      // Register
      const user = await prisma.user.create({ data });

      return res.status(201).json(await validators.reshape(user));
    } catch (e) {
      console.log(e);
      return res.status(400).json(e);
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
      if (!(await bcrypt.compare(data.password, user.password))) {
        return res.status(403).json("username or password were incorrect");
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
      return res.status(400).json(e);
    }
  };

  refreshToken = async (req: Request, res: Response) => {
    try {
      // Decode token
      const refresh = jwt.decode(req.body.refreshToken, { complete: true });
      const id = refresh.payload.id;

      // Find user
      const user: User = await prisma.user.findUnique({
        where: { id },
      });

      if (!user) {
        return res.status(404).json();
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
      return res.status(400).json(e);
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
      return res.status(400).json(e);
    }
  };

  updateAccount = async (req: Request, res: Response) => {
    try {
      // Validation
      const data: User = await validators.updateAccount(req);

      const requester: any = req.user;

      // Update
      const updated: User = await prisma.user.update({
        where: { id: requester.id },
        data,
      });

      return res.status(200).json(await validators.reshape(updated));
    } catch (e) {
      return res.status(400).json(e);
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
      return res.status(400).json(e);
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
          return res.status(400).json(error);
        }

        return res.status(200).json("You will receive your email shortly");
      });
    } catch (e) {
      return res.status(400).json(e);
    }
  };

  // TODO: Change password reset to 3 requests
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
      return res.status(400).json(e);
    }
  };
}

export default new Controller();
