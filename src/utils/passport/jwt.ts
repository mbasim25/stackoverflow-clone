import {
  Strategy,
  ExtractJwt,
  StrategyOptions,
  VerifyCallback,
} from "passport-jwt";
import { SECRET_KEY } from "../secrets";

const options: StrategyOptions = {
  secretOrKey: SECRET_KEY,
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
};

const verify: VerifyCallback = (payload, done) => {
  // How will you obtain the user from payload(JWT) ?
  done(null, null);
};

const JWTStrategy = new Strategy(options, verify);

export default JWTStrategy;
