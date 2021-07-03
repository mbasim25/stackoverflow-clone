import { Request } from "express";
import Joi from "joi";
import joi from "joi";
import bcrypt from "bcrypt";
import { pagination } from "./pagination";
import {
  User,
  UserQuery,
  PasswordChange,
  ResetEmail,
  ResetConfirm,
} from "../types";

// User Validation
const base = {
  firstName: Joi.string().allow(null),
  lastName: Joi.string().allow(null),
  image: Joi.string().allow(null),
};

const imageField = (req: Request, data: User): User => {
  if (!req.files) {
    return data;
  }

  const files: any = req.files;
  if (files.image) {
    data.image = files.image[0].location;
  }

  return data;
};

export const reshape = async (user: User) => {
  delete user.password;

  return user;
};

export const createUser = async (req: Request): Promise<User> => {
  const schema = joi.object<User>({
    ...base,
    username: Joi.string().min(2).max(32).required(),
    email: Joi.string().min(6).required(),
    password: Joi.string().min(6).max(32).required(),
    score: Joi.number(),
    role: Joi.string().valid("USER", "ADMIN"),
  });

  const data = await schema.validateAsync(req.body);

  // Password hashing
  data.password = await bcrypt.hash(data.password, 12);

  // Set media fields
  imageField(req, data);

  return data;
};

export const updateUser = async (req: Request): Promise<User> => {
  const schema = joi.object<User>({
    ...base,
    username: Joi.string().min(2).max(32),
    email: Joi.string().min(6),
    isActive: Joi.boolean(),
    score: Joi.number(),
    role: Joi.string().valid("USER", "ADMIN"),
  });

  const data = await schema.validateAsync(req.body);

  // Set media fields
  imageField(req, data);

  return data;
};

export const superAdmin = async (req: Request): Promise<User> => {
  const schema = Joi.object<User>({
    ...base,
    username: Joi.string().min(2).max(32).required(),
    email: Joi.string().min(2).required(),
    password: Joi.string().min(6).required(),
    isActive: Joi.boolean(),
    score: Joi.number(),
  });

  const data = await schema.validateAsync(req.body);

  // Password hashing
  data.password = await bcrypt.hash(data.password, 12);

  // Set the role
  data.role = "SUPERADMIN";

  // Set media fields
  imageField(req, data);

  return data;
};

export const register = async (req: Request): Promise<User> => {
  const schema = Joi.object<User>({
    ...base,
    username: Joi.string().min(2).max(32).required(),
    email: Joi.string().min(2).required(),
    password: Joi.string().min(8).required(),
  });
  const data = await schema.validateAsync(req.body);

  // Password hashing
  data.password = await bcrypt.hash(data.password, 12);

  // Set media fields
  imageField(req, data);

  return data;
};

// Login validator
export const login = async (req: Request): Promise<User> => {
  const schema = Joi.object<User>({
    username: Joi.string().min(2).max(32).required(),
    password: Joi.string().min(8).required(),
  });

  return await schema.validateAsync(req.body);
};

// Password update when authenticated and the old password is known
export const passwordChange = async (req: Request): Promise<PasswordChange> => {
  const schema = Joi.object<PasswordChange>({
    old: Joi.string().required(),
    new: Joi.string().required(),
  });

  return await schema.validateAsync(req.body);
};

export const updateAccount = async (req: Request): Promise<User> => {
  const schema = Joi.object<User>({
    ...base,
    username: joi.string(),
    email: joi.string().email(),
  });
  const data = await schema.validateAsync(req.body);

  imageField(req, data);

  return data;
};

// Sending email in case of a password reset
export const resetEmail = async (req: Request): Promise<ResetEmail> => {
  const schema = Joi.object<ResetEmail>({
    email: Joi.string().required(),
  });

  return await schema.validateAsync(req.body);
};

// Password reset validation
export const resetConfirm = async (req: Request): Promise<ResetConfirm> => {
  const schema = joi.object<ResetConfirm>({
    email: Joi.string().required(),
    uniqueKey: Joi.string().required().min(5).max(7),
    password: joi.string().min(8),
  });

  return await schema.validateAsync(req.body);
};

// Query validator
export const query = async (req: Request): Promise<UserQuery> => {
  const schema = Joi.object<UserQuery>({
    ...pagination,
    id: joi.string().allow(""),
    username: joi.string().allow(""),
    email: joi.string().allow(""),
    role: joi.string().valid("USER", "ADMIN"),
  });

  return await schema.validateAsync(req.query);
};
