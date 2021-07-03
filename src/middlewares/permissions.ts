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
      return res
        .status(403)
        .json("You dont have permission to perform this action");
    }
    // Allow access
    next();
  } catch (e) {
    return res.status(400).json;
  }
};
