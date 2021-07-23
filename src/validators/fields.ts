import { Request } from "express";
import Joi from "joi";
import { Field, FieldFilter } from "../types";
import { pagination } from "./pagination";

// Basic fields
const base = {
  name: Joi.string().required(),
};

// Create validator
export const create = async (req: Request): Promise<Field> => {
  const schema = Joi.object<Field>(base);

  return await schema.validateAsync(req.body);
};

// Update validator
export const update = async (req: Request): Promise<Field> => {
  const schema = Joi.object<Field>(base);

  return await schema.validateAsync(req.body);
};

// Filters
export const query = async (req: Request): Promise<FieldFilter> => {
  const schema = Joi.object<FieldFilter>({
    ...pagination,
    id: Joi.string().allow(""),
    name: Joi.string().allow(""),
  });

  return await schema.validateAsync(req.query);
};

// Activate & Deactivate
export const activations = async (req: Request): Promise<Field> => {
  const schema = Joi.object<Field>({
    reason: Joi.string().required(),
  });

  return await schema.validateAsync(req.body);
};
