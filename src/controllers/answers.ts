import { Request, Response } from "express";
import * as validators from "../utils";
import { Answer, User } from "../types/";
import { prisma } from "../server";

class Controller {
  retrieve = async (req: Request, res: Response) => {
    try {
      const id = req.params.id;

      const answer = await prisma.answer.findUnique({
        where: {
          id: id,
        },
      });

      const likes = await prisma.answerLikes.findMany({
        where: {
          answerId: id,
        },
      });

      let score = 0;
      for (const like of likes) {
        if (like.type === "like") {
          score += 1;
        } else {
          score -= 1;
        }
      }

      return res.status(200).send({ answer, score });
    } catch (e) {
      return res.status(400).send();
    }
  };

  list = async (req: Request, res: Response) => {
    try {
      const user: User = req.user;
      const skip = req.params.skip;
      const take = req.params.take;

      const answers = await prisma.answer.findMany({
        skip: parseInt(skip) || 0,
        take: parseInt(take) || 10,
        where: { userId: user.id },
      });

      return res.status(200).send(answers);
    } catch (e) {
      return res.status(400).send();
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

      return res.status(201).send(answer);
    } catch (e) {
      return res.status(400).send();
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

      return res.status(200).send(updated.body);
    } catch (e) {
      return res.status(400).send();
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

      return res.status(204).send("answer deleted succesfully");
    } catch (e) {
      return res.status(400).send();
    }
  };
}

export default new Controller();
