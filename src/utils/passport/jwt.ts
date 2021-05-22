import {
  Strategy,
  ExtractJwt,
  StrategyOptions,
  VerifyCallback,
} from "passport-jwt";
import { SECRET_KEY } from "../secrets";

import { prisma } from "../../server";

const options: StrategyOptions = {
  secretOrKey: SECRET_KEY,
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
};

const verify: VerifyCallback = async (payload, done) => {
  try {
    const id = payload.id;
    const user = await prisma.user.findUnique({
      where: {
        id: id,
      },
    });
    done(null, user);
    console.log(user);
  } catch (e) {
    done(e, null);
  }
};

const JWTStrategy = new Strategy(options, verify);

export default JWTStrategy;
