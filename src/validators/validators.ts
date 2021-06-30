import { Request } from "express";
import Joi from "joi";
import joi from "joi";
import bcrypt from "bcrypt";
import { User, PassChange, EmailPassReset, PassReset } from "../types";

// User Validation
const base = {
  firstName: Joi.string().allow(null),
  lastName: Joi.string().allow(null),
  image: Joi.string().allow(null),
  password: Joi.string().min(6).required(),
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
  delete user.isAdmin;
  delete user.isSuperAdmin;
  delete user.password;

  return user;
};

export const createUser = joi.object<User>({
  username: Joi.string().min(2).max(32).required(),
  email: Joi.string().min(6).required(),
  firstName: Joi.string().allow(null),
  lastName: Joi.string().allow(null),
  image: Joi.string().allow(null),
  password: Joi.string().min(6).max(32).required(),
  isActive: Joi.boolean(),
  isAdmin: Joi.boolean(),
  score: Joi.number(),
});

export const updateUser = joi.object<User>({
  username: Joi.string().min(2).max(32),
  email: Joi.string().min(6),
  firstName: Joi.string().allow(null),
  lastName: Joi.string().allow(null),
  image: Joi.string().allow(null),
  isActive: Joi.boolean(),
  isAdmin: Joi.boolean(),
  score: Joi.number(),
});

export const superAdmin = joi.object<User>({
  id: Joi.string(),
  username: Joi.string().min(2).max(32).required(),
  email: Joi.string().min(2).required(),
  firstName: Joi.string().allow(null),
  lastName: Joi.string().allow(null),
  image: Joi.string().allow(null),
  password: Joi.string().min(6).required(),
  isActive: Joi.boolean(),
  isAdmin: Joi.boolean(),
  isSuperAdmin: Joi.boolean(),
  score: Joi.number(),
});

export const register = async (req: Request): Promise<User> => {
  const schema = Joi.object<User>({
    ...base,
    username: Joi.string().min(2).max(32).required(),
    email: Joi.string().min(2).required(),
    password: Joi.string().min(6).required(),
  });
  const data = await schema.validateAsync(req.body);

  data.password = await bcrypt.hash(data.password, 12);

  // Set media fields
  imageField(req, data);

  return data;
};

export const login = async (req: Request): Promise<User> => {
  const schema = Joi.object<User>({
    username: Joi.string().min(2).max(32).required(),
    password: Joi.string().min(6).required(),
  });

  return await schema.validateAsync(req.body);
};

export const updateAccount = joi.object<User>({
  username: Joi.string().min(2).max(32),
  email: Joi.string().min(6),
  image: Joi.string().allow(null),
  firstName: Joi.string().allow(null),
  lastName: Joi.string().allow(null),
});

// Password update when authenticated and the old password is known
export const passChange = joi.object<PassChange>({
  password: Joi.string().required(),
  newPassword: Joi.string().required(),
});

// Sending email in case of a password reset
export const emailToken = joi.object<EmailPassReset>({
  email: Joi.string().required(),
});

// Password reset when the user in not authenticated and old password is forgotten
export const passReset = joi.object<PassReset>({
  email: Joi.string().required(),
  uniqueKey: Joi.string().required().min(5).max(7),
  password: Joi.string().required(),
});
