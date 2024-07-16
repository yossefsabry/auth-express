import mongoose from "mongoose";
import MongoStore from "connect-mongo";
import session from "express-session";
mongoose.set("strictQuery", true);
import passport from "passport";
import localStratage from "./service/passport-local.mjs";

function setDbSessions(app, url) {
  mongoose.connect(url,{}).catch(error => console.log("App.js mongoose.connect error",error));
  let db = mongoose.connection;
  db.on('error', console.error);
  db.once('open', function(){
    console.log("App is connected to DB", db.name)
  });

  app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      client: mongoose.connection.getClient() 
    }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 
    },
  }));
	app.use(passport.initialize());
	app.use(passport.session());
	passport.use(localStratage);
}
export default setDbSessions;
