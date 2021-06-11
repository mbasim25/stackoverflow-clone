import { Request, Response } from "express";
import * as validators from "../validators";
import { User } from "../types";
import { prisma } from "../server";
import { QuestionLike } from ".prisma/client";

class Controller {
  create = async (req: Request, res: Response) => {
    try {
      const data: QuestionLike =
        await validators.questionvalidator.questionLike.validateAsync(req.body);
      const user: User = req.user;

      const like = await prisma.questionLike.create({
        data: {
          userId: user.id,
          questionId: data.questionId,
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

      const like = await prisma.questionLike.findUnique({
        where: {
          id: id,
        },
      });

      if (!like) {
        return res.status(404).send("like not found");
      } else if (like.userId !== user.id && !user.isAdmin) {
        return res.status(403).send("unauthorized access");
      }
      const data: QuestionLike =
        await validators.questionvalidator.questionLikeUpdate.validateAsync(
          req.body
        );

      const updated = await prisma.questionLike.update({
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

      const like = await prisma.questionLike.findUnique({
        where: {
          id: id,
        },
      });

      if (!like) {
        return res.status(404).send("like not found");
      } else if (like.userId !== user.id && !user.isAdmin) {
        return res.status(403).send("unauthorized access");
      }

      await prisma.questionLike.delete({
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
