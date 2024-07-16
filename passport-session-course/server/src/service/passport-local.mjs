import { Strategy } from "passport-local";
import { comparePassword } from "./bcrypt.mjs";
import { User } from "../dbScheme/UserScheme.mjs";
import passport from "passport";

const customFields = {
  username: 'username',
  password: 'password',
};

const checkValidFields = (username, password, done) => {
  User.findOne({ username: username })
    .then((user) => {
      if (!user) return done(null, false); 
      const match = comparePassword(password, user.password);
      if (match) {
        return done(null, user);
      }else {
        return done(null, false);
      }
    })
    .catch((err) => { 
      console.log(err);
      done(err); 
    });
};

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((userId, done) => {
  User.findById(userId)
    .then((user) => {
      done(null, user);
    })
    .catch(err => done(err))
});

const localStratage = new Strategy(customFields, checkValidFields);
export default localStratage;

