import { Request, Response } from "express";
import { prisma } from "../server";
import Joi from "joi";
import * as validators from "../validators";
import { Question } from "../types/";

class Controller {
  private reshape = async (user: any, question: any) => {
    // * Set votes count

    // Upvotes count
    const upvotes = await prisma.questionVote.count({
      where: { type: "UPVOTE", questionId: question.id },
    });

    // Downvotes count
    const downvotes = await prisma.questionVote.count({
      where: { type: "DOWNVOTE", questionId: question.id },
    });

    // Set the count of original question
    question.votes = upvotes - downvotes;

    // * check if the user has voted

    // Default value
    question.hasVoted = null;

    if (user) {
      // Find the vote
      const vote = await prisma.questionVote.findUnique({
        where: {
          questionvote: { userId: user.id, questionId: question.id },
        },
      });

      // Checking and setting the value
      if (vote) {
        vote.type === "UPVOTE"
          ? (question.hasVoted = "UPVOTE")
          : (question.hasVoted = "DOWNVOTE");
      }
    }

    return question;
  };

  list = async (req: Request, res: Response) => {
    try {
      // Validation
      const user = res.locals.user;
      const query = await validators.question.query(req);

      // Filters
      const filters = {
        id: query.id,
        userId: query.userId,
        fieldId: query.fieldId,
        votes: {
          lte: query.maxVotes,
          gte: query.minVotes,
        },
        views: {
          lte: query.maxViews,
          gte: query.minViews,
        },
        title: { contains: query.title },
        body: { contains: query.body },
        tags: { hasSome: query.tags },
      };

      // Delete tags if non, cus 'hasSome' throws an error
      if (!query.tags) {
        delete filters.tags;
      }

      // Order By
      const orderBy: any = [{ createdAt: "desc" }];

      if (query.createdAt === "OLDEST") {
        orderBy[0].createdAt = "asc";
      }

      // Find questions
      const questions = await prisma.question.findMany({
        skip: query.skip,
        take: query.take,
        where: filters,
        orderBy,
        include: {
          user: {
            select: {
              username: true,
              firstName: true,
              lastName: true,
              image: true,
              score: true,
            },
          },
          answer: true,
          votesList: true,
          field: { select: { name: true } },
        },
      });

      // Set votes count
      for (const question of questions) {
        await this.reshape(user, question);
      }

      return res.status(200).json({
        count: await prisma.question.count({ where: filters }),
        results: questions,
      });
    } catch (e) {
      console.log(e);
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
        include: {
          user: {
            select: {
              username: true,
              firstName: true,
              lastName: true,
              image: true,
              score: true,
            },
          },
        },
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

      // Update
      const question = await prisma.question.update({
        where: { id },
        data,
        include: {
          user: {
            select: {
              username: true,
              firstName: true,
              lastName: true,
              image: true,
              score: true,
            },
          },
        },
      });

      return res.status(200).json(question);
    } catch (e) {
      return res.status(400).json(e);
    }
  };

  destroy = async (req: Request, res: Response) => {
    try {
      // Validate the id
      const id = await Joi.string().validateAsync(req.params.id);

      // * Cascade delete

      // question votes
      await prisma.questionVote.deleteMany({
        where: { questionId: id },
      });

      // answers votes
      const answers = await prisma.answer.findMany({
        where: { questionId: id },
      });

      for (const answer of answers) {
        await prisma.answerVote.deleteMany({ where: { answerId: answer.id } });
      }

      // answers
      await prisma.answer.deleteMany({ where: { questionId: id } });

      // the question
      await prisma.question.delete({ where: { id } });

      return res.status(204).json();
    } catch (e) {
      return res.status(400).json(e);
    }
  };
}

export default new Controller();
