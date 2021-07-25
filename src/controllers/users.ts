import { Request, Response } from "express";
import { prisma } from "../server";
import * as validators from "../validators/users";
import { User } from "../types";

class Controller {
  list = async (req: Request, res: Response) => {
    try {
      // Validation
      const query = await validators.query(req);

      // Filters object
      const filters = {
        id: query.id,
        username: query.username,
        email: query.email,
        fieldId: query.fieldId,
        role: query.role,
        yOfExperience: { gte: query.minYOE, lte: query.maxYOE },
        level: query.level,
        isActive: query.isActive,
      };

      // Get users list
      const users = await prisma.user.findMany({
        skip: query.skip,
        take: query.take,
        where: filters,
      });

      // Delete password
      for (const user of users) {
        await validators.reshape(user);
      }

      return res.status(200).json({
        count: await prisma.user.count({ where: filters }),
        results: users,
      });
    } catch (e) {
      return res.status(400).json();
    }
  };

  create = async (req: Request, res: Response) => {
    try {
      // Validate the data
      const data: User = await validators.createUser(req);

      // Create the user
      const user = await prisma.user.create({ data });

      return res.status(201).json(await validators.reshape(user));
    } catch (e) {
      return res.status(400).json();
    }
  };

  update = async (req: Request, res: Response) => {
    try {
      // Validate
      const data: User = await validators.updateUser(req);

      const id = req.params.id;

      // Find the user by id
      const unique = await prisma.user.findUnique({ where: { id } });

      // Check if the user exists
      if (!unique) {
        return res.status(404).json("User not found");
      }

      // Update
      const user = await prisma.user.update({
        where: { id },
        data,
      });

      return res.status(200).json(await validators.reshape(user));
    } catch (e) {
      return res.status(400).json();
    }
  };

  destroy = async (req: Request, res: Response) => {
    try {
      const id = req.params.id;

      // Find the user by id
      const unique = await prisma.user.findUnique({ where: { id } });

      // Check if the user exists
      if (!unique) {
        return res.status(404).json("User not found");
      }

      // Delete
      await prisma.user.delete({ where: { id } });

      return res.status(204);
    } catch (e) {
      return res.status(400).json();
    }
  };
}

export default new Controller();
