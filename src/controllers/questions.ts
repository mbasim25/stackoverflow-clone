import { Request, Response } from "express";
import * as validators from "../utils";
import { Question, User } from "../types/";

import { prisma } from "../server";
import users from "./users";

class Controller {
  list = async (req: Request, res: Response) => {
    try {
      const user: User = req.user;
      const question = await prisma.question.findMany({
        where: {
          userId: user.id,
        },
      });
      return res.status(200).send(question);
    } catch (e) {
      res.status(400).send(e);
    }
  };

  create = async (req: Request, res: Response) => {
    try {
      const data: Question = await validators.qv.createQuestion.validateAsync(
        req.body
      );
      const user: User = req.user;
      const question = await prisma.question.create({
        data: {
          userId: user.id,
          body: data.body,
        },
      });
      return res.status(201).send(question);
    } catch (e) {
      res.status(400).send(e);
    }
  };

  update = async (req: Request, res: Response) => {
    try {
      const user: User = req.user;
      const id = req.params.id;
      const question = await prisma.question.findUnique({
        where: {
          id: id,
        },
      });

      if (!question) {
        return res.status(404).send("question not found");
      } else if (question.userId !== user.id && !user.isAdmin) {
        return res.status(403).send("unauthorized access");
      }

      const data: Question = await validators.qv.updateQuestion.validateAsync(
        req.body
      );

      const updated = await prisma.question.update({
        where: {
          id: question.id,
        },
        data: {
          body: data.body,
        },
      });

      return res.status(200).send(updated);
    } catch (e) {
      res.status(400).send();
    }
  };

  destroy = async (req: Request, res: Response) => {
    try {
      const user: User = req.user;
      const id = req.params.id;

      const question = await prisma.question.findUnique({
        where: {
          id: id,
        },
      });

      if (!question) {
        return res.status(404).send("question not found");
      } else if (question.userId !== user.id && !user.isAdmin) {
        return res.status(403).send("unauthorized access");
      }

      await prisma.question.delete({
        where: {
          id: question.id,
        },
      });

      return res.status(204).send("question deleted succesfully");
    } catch (e) {
      res.status(400).send();
    }
  };
}

export default new Controller();
