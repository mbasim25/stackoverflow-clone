import { Request } from "express";
import Joi from "joi";
import { Answer, AnswerFilter, AnswerLike } from "../types";
import { pagination } from "./pagination";

// Answers Validation
const base = { body: Joi.string().required() };

export const create = async (req: Request): Promise<Answer> => {
  const schema = Joi.object<Answer>({
    ...base,
    questionId: Joi.string().required(),
  });

  return await schema.validateAsync(req.body);
};

export const update = async (req: Request): Promise<Answer> => {
  const schema = Joi.object<Answer>(base);
  return await schema.validateAsync(req.body);
};

// Filters
export const query = async (req: Request): Promise<AnswerFilter> => {
  const schema = Joi.object<AnswerFilter>({
    ...pagination,
    id: Joi.string().allow(""),
    questionId: Joi.string().allow(""),
    userId: Joi.string().allow(""),
    minVotes: Joi.number().allow(""),
    maxVotes: Joi.number().allow(""),
    body: Joi.string().allow(""),
  });

  return await schema.validateAsync(req.query);
};

export const answerLike = Joi.object<AnswerLike>({
  answerId: Joi.string().required(),
  type: Joi.string().required(),
});

export const answerLikeUpdate = Joi.object<AnswerLike>({
  type: Joi.string().required(),
});
