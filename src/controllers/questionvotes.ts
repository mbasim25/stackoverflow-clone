import { Request, Response } from "express";
import { prisma } from "../server";
import Joi from "joi";
import { QuestionVote } from "../types";
import * as validators from "../validators";

class Controller {
  create = async (req: Request, res: Response) => {
    try {
      // Validation
      const data: QuestionVote = await validators.question.voteCreate(req);
      const user: any = req.user;

      // Create
      const vote = await prisma.questionVote.create({
        data: {
          ...data,
          userId: user.id,
        },
      });

      return res.status(201).json(vote);
    } catch (e) {
      return res.status(400).json(e);
    }
  };

  update = async (req: Request, res: Response) => {
    try {
      // Validation
      const data: QuestionVote = await validators.question.voteUpdate(req);
      const id = await Joi.string().validateAsync(req.params.id);

      // Update
      const vote = await prisma.questionVote.update({
        where: { id },
        data,
      });

      return res.status(200).json(vote);
    } catch (e) {
      return res.status(400).json(e);
    }
  };

  destroy = async (req: Request, res: Response) => {
    try {
      // Id validation
      const id = await Joi.string().validateAsync(req.params.id);

      // Delete
      await prisma.questionVote.delete({ where: { id } });

      return res.status(204).json();
    } catch (e) {
      return res.status(400).json(e);
    }
  };
}

export default new Controller();
