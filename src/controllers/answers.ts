import { Request, Response } from "express";
import { prisma } from "../server";
import Joi from "joi";
import { Answer } from "../types/";
import * as validators from "../validators";

class Controller {
  private votes = async (answer: Answer) => {
    // Get upvotes count
    const upvotes = await prisma.answerVote.count({
      where: { type: "UPVOTE", answerId: answer.id },
    });

    // Get downvotes count
    const downvotes = await prisma.answerVote.count({
      where: { type: "DOWNVOTE", answerId: answer.id },
    });

    // set the count of original question
    answer.votes = upvotes - downvotes;

    return answer;
  };

  list = async (req: Request, res: Response) => {
    try {
      // Validation
      const query = await validators.answer.query(req);

      // Filters object
      const filters = {
        id: query.id,
        questionId: query.questionId,
        userId: query.userId,
        votes: {
          lte: query.maxVotes,
          gte: query.minVotes,
        },
        body: { contains: query.body },
      };

      // Find
      const answers = await prisma.answer.findMany({
        skip: query.skip,
        take: query.take,
        where: filters,
        include: {
          user: { select: { username: true, image: true, score: true } },
        },
      });

      // Set votes count
      for (const answer of answers) {
        await this.votes(answer);
      }

      return res.status(200).json({
        count: await prisma.answer.count({ where: filters }),
        results: answers,
      });
    } catch (e) {
      return res.status(400).json(e);
    }
  };

  create = async (req: Request, res: Response) => {
    try {
      // Validation
      const data: Answer = await validators.answer.create(req);
      const user: any = req.user;

      // Create
      const answer = await prisma.answer.create({
        data: { ...data, userId: user.id },
      });

      return res.status(201).json(answer);
    } catch (e) {
      return res.status(400).json(e);
    }
  };

  update = async (req: Request, res: Response) => {
    try {
      // Validation
      const data: Answer = await validators.answer.update(req);
      const id = await Joi.string().validateAsync(req.params.id);

      // Find unique
      const unique = await prisma.answer.findUnique({ where: { id } });

      // Check if it exists
      if (!unique) {
        return res.status(404).json();
      }

      // Update
      const answer = await prisma.answer.update({
        where: { id },
        data,
      });

      return res.status(200).json(await this.votes(answer));
    } catch (e) {
      return res.status(400).json(e);
    }
  };

  destroy = async (req: Request, res: Response) => {
    try {
      // Validate the id
      const id = await Joi.string().validateAsync(req.params.id);

      // Find unique
      const answer = await prisma.answer.findUnique({ where: { id } });

      // Check if it exists
      if (!answer) {
        return res.status(404).json();
      }

      // * Cascade delete
      await prisma.answerVote.deleteMany({ where: { answerId: id } });
      await prisma.answer.delete({ where: { id } });

      return res.status(204).json();
    } catch (e) {
      return res.status(400).json(e);
    }
  };
}

export default new Controller();
