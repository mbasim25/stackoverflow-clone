import { Request, Response } from "express";
import { prisma } from "../server";
import Joi from "joi";
import * as validators from "../validators";
import { Field, FieldFilter } from "../types/";

class Controller {
  private reshape = async (field: Field) => {
    delete field.deactivaterId;
    delete field.activatorId;
    delete field.reason;
    return field;
  };

  private checkId = async (id: string) => {
    await Joi.string().validateAsync(id);
    const field = await prisma.field.findUnique({ where: { id } });

    if (!field) {
      throw new Error("Not found");
    }

    return id;
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

  create = async (req: Request, res: Response) => {
    try {
      // Validation
      const data: Field = await validators.field.create(req);

      // Create
      const field = await prisma.field.create({ data });

      return res.status(201).json(field);
    } catch (e) {
      return res.status(400).json(e);
    }
  };

  update = async (req: Request, res: Response) => {
    try {
      // Validation
      const data: Field = await validators.field.update(req);
      const id = req.params.id;

      await this.checkId(id);

      // Update
      const field = await prisma.field.update({
        where: { id },
        data,
      });

      return res.status(200).json(field);
    } catch (e) {
      return res.status(400).json(e);
    }
  };

  destroy = async (req: Request, res: Response) => {
    try {
      // Validate the id
      const id = req.params.id;
      await this.checkId(id);

      // Delete
      await prisma.field.delete({ where: { id } });

      return res.status(204).json();
    } catch (e) {
      return res.status(400).json(e);
    }
  };
}

export default new Controller();
