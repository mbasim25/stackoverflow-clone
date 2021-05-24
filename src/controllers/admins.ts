import { Request, Response } from "express";
import * as validators from "../utils/validators";
import { User, Account } from "../types/";

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class Controller {
  update = async (req: Request, res: Response) => {
    console.log(req.user);
    try {
      const data: User = await validators.admin.validateAsync(req.user);

      const userdata: User = await validators.adminUserUpdate.validateAsync(
        req.body
      );
      console.log(userdata);
      // const user = await prisma.user.update({
      //   where: {
      //     id: req.params.id,
      //   },
      //   data: { ...userdata },
      // });
      // if (!user) {
      //   return res.status(404).send();
      // }
      // res.status(200).send(user);
    } catch (e) {
      res.status(400).send(e);
    }
  };
}

export default new Controller();
