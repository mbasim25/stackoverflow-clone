import { Request, Response } from "express";
import * as validators from "../utils";
import { Answer, Question, User } from "../types/";

import { prisma } from "../server";

class Controller {
  list = async (req: Request, res: Response) => {
    try {
      const answers = await prisma.answer.findMany({});
      res.status(200).send(answers);
    } catch (e) {
      res.status(400).send(e);
    }
  };

  create = async (req: Request, res: Response) => {
    try {
      const data: Answer = await validators.av.createAnswer.validateAsync(
        req.body
      );
      const user: User = req.user;
      const answer = await prisma.answer.create({
        data: { body: data.body, userId: user.id, questionId: data.questionId },
      });

      res.status(201).send(answer);
    } catch (e) {
      res.status(400).send(e);
    }
  };

  update = async (req: Request, res: Response) => {
    try {
      const user: User = req.user;
      const id = req.params.id;
      const answer = await prisma.answer.findUnique({
        where: {
          id: id,
        },
      });
      if (!answer) {
        return res.status(404).send("answer not found");
      } else if (answer.userId !== user.id) {
        return res.status(403).send("unauthorized access");
      }
      const data: Answer = await validators.av.updateAnswer.validateAsync(
        req.body
      );
      const updated = await prisma.answer.update({
        where: {
          id: answer.id,
        },
        data: {
          body: data.body,
        },
      });
      res.status(200).send(updated);
    } catch (e) {
      res.status(400).send();
    }
  };

  destroy = async (req: Request, res: Response) => {
    try {
      const user: User = req.user;
      const id = req.params.id;
      const answer = await prisma.answer.findUnique({
        where: {
          id: id,
        },
      });
      if (!answer) {
        return res.status(404).send("answer not found");
      } else if (answer.userId !== user.id) {
        return res.status(403).send("unauthorized access");
      }
      await prisma.answer.delete({
        where: {
          id: answer.id,
        },
      });
      res.status(200).send("answer deleted succesfully");
    } catch (e) {
      res.status(400).send();
    }
  };
}

export default new Controller();
