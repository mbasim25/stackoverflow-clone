import { Request, Response } from "express";
import { prisma } from "../server";
import Joi from "joi";
import * as validators from "../validators";
import { AnswerVote } from ".prisma/client";

class Controller {
  create = async (req: Request, res: Response) => {
    try {
      // Validation
      const data: AnswerVote = await validators.answer.voteCreate(req);
      const user: any = req.user;

      // Create
      const vote = await prisma.answerVote.create({
        data: { ...data, userId: user.id },
      });

      return res.status(201).json(vote);
    } catch (e) {
      return res.status(400).json();
    }
  };

  update = async (req: Request, res: Response) => {
    try {
      // Validation
      const data: AnswerVote = await validators.answer.voteUpdate(req);
      const id = await Joi.string().validateAsync(req.params.id);

      // Update
      const vote = await prisma.answer.update({
        where: { id },
        data,
      });

      return res.status(200).json(vote);
    } catch (e) {
      return res.status(400).json();
    }
  };

  destroy = async (req: Request, res: Response) => {
    try {
      // Id validation
      const id = await Joi.string().validateAsync(req.params.id);

      // Delete
      await prisma.answerVote.delete({ where: { id } });

      return res.status(204).json();
    } catch (e) {
      return res.status(400).json();
    }
  };
}

export default new Controller();
