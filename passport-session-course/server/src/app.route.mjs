import { globalErrorHandling } from "./utlis/GlobalErrorHandler.mjs";
import cors from "cors";
import dotenv from "dotenv";
import setDbSessions from "./connectDb.mjs";
import passport from "passport";
import { User } from "./dbScheme/UserScheme.mjs";
import bodyParser from "body-parser";
import { validationResult } from "express-validator";
dotenv.config();
import { hashPassword } from "./service/bcrypt.mjs";
import { isAuth } from "./middleware/auth.mjs";
import cookieParser from "cookie-parser";

/**
 * @module app.route
 * @param {Object} express - Express module
 * @param {Object} app - Express app
 */
export default function initExpress(express, app) {
	app.use(express.json());
  app.use(cookieParser());
	app.use(express.urlencoded({ extended: true }));
	app.use(cors());
	setDbSessions(app, process.env.DB_URL); // setting some config for db

  // for debugging
  app.use((req, res, next) => {
    console.log(" ----------------------------------- ");
    console.log('user: ', req.user);
    console.log('Session:', req.session);
    console.log(" ----------------------------------- ");
    next();
  });

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

	app.post("/login", async (request, response) => {
		let { username, password } = request.body;
		const user = await User.findOne({ username: username });
		if (!user) {
			return response.status(404).send("user not found");
		}
		response.json({ user });
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

	app.post("/pass-login", passport.authenticate("local"), (req, res) => {
		console.log(req.session);
		res.send("<h1> welcome from auth password login </h1>");
	});

	app.post("/pass-register", async (req, res) => {
		const { username, password, age } = req.body;
		console.log(username, password, age);
		const checkUser = await User.find({ Rsername: username });
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
