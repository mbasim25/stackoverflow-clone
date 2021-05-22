import Joi from "joi";
import joi from "joi";
import { User, Account } from "../types";

export const createUser = joi.object<User>({
  username: Joi.string().min(2).max(32).required(),
  firstName: Joi.string().min(2).max(32),
  lastName: Joi.string().min(2).max(32),
  image: Joi.string().min(2),
  password: Joi.string().min(6).max(32).required(),
});

export const updateUser = joi.object<User>({
  username: Joi.string().min(2).max(32).required(),
  firstName: Joi.string().min(2).max(32),
  lastName: Joi.string().min(2).max(32),
  image: Joi.string().min(2),
  password: Joi.string().min(6).max(32).required(),
  isActive: Joi.boolean(),
  isAdmin: Joi.boolean(),
  isSuperAdmin: Joi.boolean(),
  score: Joi.string(),
});

export const register = joi.object<Account>({
  username: Joi.string().min(2).max(32).required(),
  firstName: Joi.string().min(2).max(32),
  lastName: Joi.string().min(2).max(32),
  image: Joi.string().min(2),
  password: Joi.string().min(6).max(32).required(),
});

export const login = joi.object<Account>({
  username: Joi.string().min(2).max(32).required(),
  firstName: Joi.string().min(2).max(32),
  lastName: Joi.string().min(2).max(32),
  image: Joi.string().min(2),
  password: Joi.string().min(6).max(32).required(),
});
