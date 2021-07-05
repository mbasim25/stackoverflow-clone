import { Request } from "express";
import Joi from "joi";
import { Answer, AnswerFilter, AnswerVote } from "../types";
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

// Votes validation

const baseVotes = {
  type: Joi.string().valid("UPVOTE", "DOWNVOTE").required(),
};

// Create validator
export const voteCreate = async (req: Request): Promise<AnswerVote> => {
  const schema = Joi.object<AnswerVote>({
    ...baseVotes,
    answerId: Joi.string().required(),
  });

  return await schema.validateAsync(req.body);
};

// Update validator
export const voteUpdate = async (req: Request): Promise<AnswerVote> => {
  const schema = Joi.object<AnswerVote>(baseVotes);

  return await schema.validateAsync(req.body);
};
