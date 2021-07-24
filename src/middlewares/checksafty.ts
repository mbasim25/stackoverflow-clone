import { Request, Response, NextFunction } from "express";
import Jwt from "jsonwebtoken";
import { prisma } from "../server";

// Router level middleware to check if reshape is required or not
export const safe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let safe: boolean = false;
    const header = req.headers.authorization;

    if (header) {
      // Decode the token
      const token: any = Jwt.decode(header.replace("Bearer ", ""));

      // Find the user
      const user = await prisma.user.findUnique({
        where: { id: token.id },
      });

      if (user && (user.role == "SUPERADMIN" || user.role == "ADMIN")) {
        safe = true;
      }
    }

    res.locals.safe = safe;
    next();
  } catch (e) {
    return res.status(400).json();
  }
};