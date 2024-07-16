import mongoose from "mongoose";
import MongoStore from "connect-mongo";
import session from "express-session";
mongoose.set("strictQuery", true);

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
    saveUninitialized: true,
    store: MongoStore.create({
      client: mongoose.connection.getClient() 
    }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 
    },
  }));
}
export default setDbSessions;
