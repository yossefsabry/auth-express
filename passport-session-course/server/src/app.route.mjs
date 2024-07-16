import { globalErrorHandling } from "./utlis/GlobalErrorHandler.mjs";
import cors from "cors";
import dotenv from "dotenv";
import setDbSessions from "./connectDb.mjs";
import passport from "passport";
import { User } from "./dbScheme/UserScheme.mjs";
import { hashPassword } from "./service/bcrypt.mjs";
import { isAuth } from "./middleware/auth.mjs";
import cookieParser from "cookie-parser";
dotenv.config();

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
		console.log("user: ", req.user);
		console.log("Session:", req.session);
		console.log(" ----------------------------------- ");
		next();
	});

	app.get("/welcome", isAuth, (req, res) => {
		return res.status(200).json({ msg: "welcome in hoem page" });
	});

	app.get("/", isAuth, (req, res) => {
		if (req.session.visited) req.session.visited++;
		else req.session.visited = 1;
		return res.status(200).json({
			msg: `welcome from yossef you visited this ${req.session.visited}`,
		});
	});

	app.post("/login", passport.authenticate("local"), (req, res) => {
		console.log(req.session.id);
		return res.status(200).json({ msg: "login success have fun..." });
	});

	app.post("/register", async (req, res) => {
		const { username, password, age } = req.body;
		console.log(username, password, age);
		const checkUser = await User.find({ username: username });
		if (checkUser && checkUser !== null && checkUser.length > 0)
			return res.status(400).json({ msg: "not valid user info" });
		const newPassword = hashPassword(password);
		const NewUser = new User({
			username: username,
			password: newPassword,
			age: age,
		});
		NewUser.save()
			.then((res) => console.log(res))
			.catch((err) => console.log(err));
		return res.status(200).json({ msg: "adding new user to db" });
	});

	app.get("/logout", (req, res) => {
		delete req.user;
		delete req.session.passport;
		delete req.session.visited;
		return res.status(200).json({ msg: "logout sucess" });
	});

	app.all("*", (req, res) => {
		return res.status(404).json({ msg: "not found page 404"});
	});

	app.use(globalErrorHandling);
}
