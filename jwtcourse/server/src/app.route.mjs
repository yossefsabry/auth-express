import { globalErrorHandling } from "./utlis/GlobalErrorHandler.mjs";
import cors from "cors";
import dotenv from "dotenv";
import setDbSessions from "./connectDb.mjs";
import { User } from "./dbScheme/UserScheme.mjs";
import { validationResult } from "express-validator";
dotenv.config();
import { comparePassword, hashPassword } from "./service/bcrypt.mjs";
import { isAuth } from "./middleware/auth.mjs";
import { generateToken } from "./utlis/TokenGenerator.mjs";

/**
 * @module app.route
 * @param {Object} express - Express module
 * @param {Object} app - Express app
 */
export default function initExpress(express, app) {
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cors());
  setDbSessions(app, process.env.DB_URL); // setting some config for db

  app.get("/welcome", isAuth, (req, res) => {
    res.send("<h1> welcome boss </h1>"); 
  });

  app.get("/", isAuth, (req, res) => {
    console.log(req.session.id);
    if (req.session.visited) req.session.visited++;
    else req.session.visited = 1;
    res.send(
      `<h1> welcome from yossef you visited this ${req.session.visited} </h1> `,
    );
  });

  app.post("/login", async (req, res) => {
    let { username, password } = req.body;
    const user = await User.findOne({ username: username });
    if (!user) {
      return res.status(404).json({sucess: false, msg:"user not found"});
    }
    if(user.isDeleted) {
      return res.status(404).json({sucess: false, msg:"user is deleted"});
    }
    const matchPassword = comparePassword(password, user.password);
    if(!matchPassword) {
      return res.status(404).json({sucess: false, msg:"not valid password"});
    }
    const token = generateToken({
      payload: {
        id: user._id,
        name: user.username,
        email: user.email,
        admin:user.isAdmin,
        isLoggedIn: true,
      },
      expiresIn:60*30
    });
    return res.status(200).json({ sucess: true, user, token: `Bearer ${token}`, msg: "sucess login" });
  });

  app.post("/register", async (req, res) => {
    let { username, password, age } = req.body;
    const checkUser = await User.find({ username: username });
    console.log(checkUser);
    if (!checkUser === null) {
      console.log("user found");
      return res.status(400).json({ msg: "username must be uniqe" });
    }
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const user = new User({ username, password, age });
    user
      .save()
      .then((res) => {
        console.log(res);
      })
      .catch((err) => {
        console.log(err);
      });
    return res.status(200).json({ user: user });
  });

  app.post("/pass-login", (req, res) => {
    console.log(req.session);
    console.log(req);
    res.send("<h1> welcome from auth password login </h1>");
  });

  app.post("/pass-register", async (req, res) => {
    const { username, password, age } = req.body;
    const checkUser = await User.find({ username: username });
    console.log(checkUser);
    if (checkUser && checkUser !== null && checkUser.length > 0)
      return res.status(400).json({ msg: "not valid username" });
    const newPassword = hashPassword(password);
    const NewUser = new User({
      username: username,
      password: newPassword,
      age: age,
    });
    NewUser.save()
      .then((res) => console.log(res))
      .catch((err) => console.log(err));
    res.send("<h1>adding new user to db</h1>");
  });



  app.all("*", (req, res) => {
    res.send("<h1>404 Not Found</h1>");
  });



  app.use(globalErrorHandling);
}
