import { Request, Response } from "express";
import * as validators from "../utils";
import { Answer, Question, User } from "../types/";

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class Controller {
  list = async (req: Request, res: Response) => {
    try {
      const answers = await prisma.answer.findMany({});
      res.status(200).send(answers);
    } catch (e) {
      res.status(500).send(e);
    }
  };

  create = async (req: Request, res: Response) => {
    // Validate data coming from the request body

    // Add them to the database

    // Return them

    return res.status(201).json({ id: "id", content: "content" });
  };

  update = async (req: Request, res: Response) => {
    // Get the example from db by id (PATH parameter)

    // Update the example

    // Return the example

    return res.status(200).json({ id: "id", content: "content" });
  };

  destroy = async (req: Request, res: Response) => {
    // Get the example from db by id (PATH parameter)

    // Delete the example

    // Return empty response

    return res.status(204).json();
  };
}

export default new Controller();
