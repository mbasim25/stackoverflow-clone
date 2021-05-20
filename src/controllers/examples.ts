import { Request, Response } from "express";
import { Example } from "../types";

class Controller {
  list = (req: Request, res: Response) => {
    // Query the database get the examples and return them.

    return res.status(200).json({
      count: 25,
      results: [{ id: "id", content: "content" }],
    });
  };

  create = (req: Request, res: Response) => {
    // Validate data coming from the request body

    // Add them to the database

    // Return them

    return res.status(201).json({ id: "id", content: "content" });
  };

  update = (req: Request, res: Response) => {
    // Get the example from db by id (PATH parameter)

    // Update the example

    // Return the example

    return res.status(200).json({ id: "id", content: "content" });
  };

  destroy = (req: Request, res: Response) => {
    // Get the example from db by id (PATH parameter)

    // Delete the example

    // Return empty response

    return res.status(204).json();
  };
}

export default new Controller();
