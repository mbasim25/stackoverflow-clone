import { Request, Response } from "express";
import bcrypt from "bcrypt";

import * as validators from "../utils/validators";
import { User } from "../types/users";

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class Controller {}

export default new Controller();
