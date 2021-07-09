import { Request, Response } from "express";
import { prisma } from "../server";
import Joi from "joi";
import * as validators from "../validators";
import { Question } from "../types/";

class Controller {
  private votes = async (question: Question) => {
    // Get upvotes count
    const upvotes = await prisma.questionVote.count({
      where: { type: "UPVOTE", questionId: question.id },
    });

    // Get downvotes count
    const downvotes = await prisma.questionVote.count({
      where: { type: "DOWNVOTE", questionId: question.id },
    });

    //set the count of original question
    question.votes = upvotes - downvotes;

    return question;
  };

  list = async (req: Request, res: Response) => {
    try {
      // Validation
      const query = await validators.question.query(req);

      // Filters object
      const filters = {
        id: query.id,
        userId: query.userId,
        votes: {
          lte: query.maxVotes,
          gte: query.minVotes,
        },
        body: { contains: query.body },
      };

      // Find questions
      const questions = await prisma.question.findMany({
        skip: query.skip,
        take: query.take,
        where: filters,
        include: {
          user: { select: { username: true, image: true, score: true } },
        },
      });

      // Set votes count
      for (const question of questions) {
        await this.votes(question);
      }

      return res.status(200).json({
        count: await prisma.question.count({ where: filters }),
        results: questions,
      });
    } catch (e) {
      return res.status(400).json(e);
    }
  };

  create = async (req: Request, res: Response) => {
    try {
      // Validation
      const data: Question = await validators.question.create(req);
      const user: any = req.user;

      // Create
      const question = await prisma.question.create({
        data: { ...data, userId: user.id },
      });

      return res.status(201).json(question);
    } catch (e) {
      return res.status(400).json(e);
    }
  };

  update = async (req: Request, res: Response) => {
    try {
      // Validation
      const data: Question = await validators.question.update(req);
      const id = await Joi.string().validateAsync(req.params.id);

      // Find question
      const unique = await prisma.question.findUnique({ where: { id } });

      // Check if it exists
      if (!unique) {
        return res.status(404).json("question not found");
      }

      // Update
      const question = await prisma.question.update({
        where: { id },
        data,
      });

      return res.status(200).json(await this.votes(question));
    } catch (e) {
      return res.status(400).json(e);
    }
  };

  destroy = async (req: Request, res: Response) => {
    try {
      // Validate the id
      const id = await Joi.string().validateAsync(req.params.id);

      // Find question
      const question = await prisma.question.findUnique({ where: { id } });

      // Check if it exists
      if (!question) {
        return res.status(404).json("question not found");
      }

      // Delete
      await prisma.question.delete({ where: { id } });

      return res.status(204).json();
    } catch (e) {
      return res.status(400).json(e);
    }
  };
}

export default new Controller();
