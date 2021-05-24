import {
  Strategy,
  ExtractJwt,
  StrategyOptions,
  VerifyCallback,
} from "passport-jwt";
import { SECRET_KEY } from "../secrets";
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
import { User } from "../../types";

const options: StrategyOptions = {
  secretOrKey: SECRET_KEY,
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
};

const verify: VerifyCallback = async (payload, done) => {
  try {
    const id = payload.id;
    const user: User = await prisma.user.findUnique({
      where: {
        id: id,
      },
    });
    // console.log(user);
    done(null, user);
  } catch (e) {
    done(e, null);
  }
};

const JWTStrategy = new Strategy(options, verify);

export default JWTStrategy;
