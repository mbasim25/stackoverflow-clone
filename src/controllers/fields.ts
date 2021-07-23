import { Request, Response } from "express";
import { prisma } from "../server";
import * as validators from "../validators";
import { Field, FieldFilter } from "../types/";

class Controller {
  private reshape = async (field: Field) => {
    delete field.deactivaterId;
    delete field.activatorId;
    delete field.reason;
    return field;
  };

  list = async (req: Request, res: Response) => {
    try {
      // Validation
      const query: FieldFilter = await validators.field.query(req);
      const safe = res.locals.safe;

      // Filters
      const filters = {
        id: query.id,
        name: query.name,
      };

      // Find
      const fields = await prisma.field.findMany({
        skip: query.skip,
        take: query.take,
        where: filters,
      });

      // Reshape
      if (!safe) {
        for (const field of fields) {
          await this.reshape(field);
        }
      }

      return res.status(200).json({
        count: await prisma.field.count({ where: filters }),
        results: fields,
      });
    } catch (e) {
      return res.status(400).json(e);
    }
  };
}

export default new Controller();
