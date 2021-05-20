import { Request, Response } from "express";

class Controller {
  home = (req: Request, res: Response) => {
    return res.json({
      message: "Hello, World!",
    });
  };
}

export default new Controller();
