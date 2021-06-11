import { Request, Response } from "express";
import * as validators from "../validators";
import { User, AnswerLike } from "../types";
import { prisma } from "../server";

class Controller {
  create = async (req: Request, res: Response) => {
    try {
      const data: AnswerLike =
        await validators.answervalidator.answerLike.validateAsync(req.body);
      const user: User = req.user;

      const like = await prisma.answerLike.create({
        data: {
          userId: user.id,
          answerId: data.answerId,
          type: data.type,
        },
      });

      return res.status(201).send(like);
    } catch (e) {
      return res.status(400).send();
    }
  };

  update = async (req: Request, res: Response) => {
    try {
      const user: User = req.user;
      const id = req.params.id;

      const like = await prisma.answerLike.findUnique({
        where: {
          id: id,
        },
      });

      if (!like) {
        return res.status(404).send("like not found");
      } else if (like.userId !== user.id && !user.isAdmin) {
        return res.status(403).send("unauthorized access");
      }
      const data: AnswerLike =
        await validators.questionvalidator.questionLikeUpdate.validateAsync(
          req.body
        );

      const updated = await prisma.answerLike.update({
        where: {
          id: like.id,
        },
        data: {
          type: data.type,
        },
      });

      return res.status(200).send(updated.type);
    } catch (e) {
      return res.status(400).send();
    }
  };

  destroy = async (req: Request, res: Response) => {
    try {
      const user: User = req.user;
      const id = req.params.id;

      const like = await prisma.answerLike.findUnique({
        where: {
          id: id,
        },
      });

      if (!like) {
        return res.status(404).send("like not found");
      } else if (like.userId !== user.id && !user.isAdmin) {
        return res.status(403).send("unauthorized access");
      }

      await prisma.answerLike.delete({
        where: {
          id: like.id,
        },
      });

      return res.status(204).send("like deleted succesfully");
    } catch (e) {
      return res.status(400).send();
    }
  };
}

export default new Controller();
