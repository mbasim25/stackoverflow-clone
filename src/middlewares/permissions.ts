import { Request, Response, NextFunction } from "express";
import { prisma } from "../server";

// Router level middleware to check if the user role is super admin
export const isSuper = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const requester: any = req.user;
    const id = requester.id;

    // Find the user
    const user = await prisma.user.findUnique({ where: { id } });

    // Check the role
    if (user.role !== "SUPERADMIN") {
      return res.status(404).json();
    }

    // Allow access
    next();
  } catch (e) {
    return res.status(400).json;
  }
};

// Router level middleware to check if the user is the owner, an admin or a super admin
export const isOwnerOrAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const requester: any = req.user;
    const id = req.params.id;

    // Find the user
    const user = await prisma.user.findUnique({ where: { id: requester.id } });

    // Find the question
    const question = await prisma.question.findUnique({ where: { id } });

    const answer = await prisma.answer.findUnique({ where: { id } });

    const object = question || answer;

    // Check the role
    if (
      user.role !== "SUPERADMIN" &&
      user.role !== "ADMIN" &&
      object.userId !== user.id
    ) {
      return res
        .status(403)
        .json("You dont have permission to perform this action");
    }

    // Allow access
    next();
  } catch (e) {
    return res.status(400).json();
  }
};
