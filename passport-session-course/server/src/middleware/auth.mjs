export const isAuth = (req, res, done) => {
	if (req.isAuthenticated()) {
		done();
	} else {
		res.status(401).json({msg: "user not authorization for page"});
	}
};
