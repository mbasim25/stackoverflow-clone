import { Request, Response, NextFunction } from "express";
import { prisma } from "../server";

// Router level middleware to check if the user is the owner
export const voteOwner = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const requester: any = req.user;
    const id = req.params.id;

    // Find the user
    const user = await prisma.user.findUnique({ where: { id: requester.id } });

    // Find the vote
    const questionvote = await prisma.questionVote.findUnique({
      where: { id },
    });
    const answervote = await prisma.answerVote.findUnique({ where: { id } });

    const vote = questionvote || answervote;

    // Checking & Security
    if (!vote) {
      return res.status(404).json("Not found");
    } else if (vote.userId !== user.id) {
      return res.status(403).json("unauthorized access");
    }

    // Allow access
    next();
  } catch (e) {
    return res.status(400).json();
  }
};
