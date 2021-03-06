import {
  Strategy,
  ExtractJwt,
  StrategyOptions,
  VerifyCallback,
} from "passport-jwt";
import { SECRET_KEY } from "../secrets";
import { prisma } from "../../server";
import { User } from "../../types";

// JWT integration for token authentication

const options = {
  secretOrKey: SECRET_KEY,
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
};

const verify: VerifyCallback = async (payload, done) => {
  try {
    // Check token type
    if (payload.type !== "ACCESS") {
      throw Error("");
    }

    // Find user
    const id = payload.id;
    const user: User = await prisma.user.findUnique({
      where: {
        id: id,
      },
    });

    // Checking & Security
    if (!user) {
      throw new Error("User not found");
    } else if (!user.isActive) {
      throw new Error("this account was deactivated by moderators");
    }

    done(null, user);
  } catch (e) {
    done(e, null);
  }
};

const JWTStrategy = new Strategy(options, verify);

export default JWTStrategy;
