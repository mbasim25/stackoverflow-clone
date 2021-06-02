import { Request, Response } from "express";
import * as validators from "../utils";
import { User } from "../types";
import { prisma } from "../server";
import { QuestionLikes } from ".prisma/client";

class Controller {
  create = async (req: Request, res: Response) => {
    try {
      const data: QuestionLikes =
        await validators.qv.questionLike.validateAsync(req.body);
      const user: User = req.user;

      const like = await prisma.questionLikes.create({
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

      const like = await prisma.questionLikes.findUnique({
        where: {
          id: id,
        },
      });

      if (!like) {
        return res.status(404).send("like not found");
      } else if (like.userId !== user.id && !user.isAdmin) {
        return res.status(403).send("unauthorized access");
      }
      const data: QuestionLikes =
        await validators.qv.questionLikeUpdate.validateAsync(req.body);

      const updated = await prisma.questionLikes.update({
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

      const like = await prisma.questionLikes.findUnique({
        where: {
          id: id,
        },
      });

      if (!like) {
        return res.status(404).send("like not found");
      } else if (like.userId !== user.id && !user.isAdmin) {
        return res.status(403).send("unauthorized access");
      }

      await prisma.questionLikes.delete({
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
