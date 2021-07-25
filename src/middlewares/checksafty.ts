import { Request, Response, NextFunction } from "express";
import Jwt from "jsonwebtoken";
import { prisma } from "../server";

// A middleware thats based on the outcome the json get sent in a different way (reshaped)

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
