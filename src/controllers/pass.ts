import { Request, Response } from "express";
import bcrypt from "bcrypt";

import * as validators from "../utils/validators";
import { User, Account, PChange } from "../types";

import { prisma } from "../server";

class Controller {
  passwordchange = async (req: Request, res: Response) => {
    try {
      const requester: User = req.user;

      const user: User = await prisma.user.findUnique({
        where: {
          id: requester.id,
        },
      });

      const data: PChange = await validators.PassChange.validateAsync(req.body);

      if (!(await bcrypt.compare(data.password, user.password))) {
        res.status(400).send("incorrect password");
      } else if (data.password === data.newPassword) {
        res.status(400).send("new password cant be the old password");
      }

      data.newPassword = await bcrypt.hash(data.newPassword, 12);

      const account: User = await prisma.user.update({
        where: {
          id: requester.id,
        },
        data: {
          password: data.newPassword,
        },
      });

      return res.status(200).send(account);
    } catch (e) {
      res.status(400).send(e);
    }
  };
}

export default new Controller();
