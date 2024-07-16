export const isAuth = (req, res, done) => {
  console.log(req.session);
	if (req.isAuthenticated()) {
		done();
	} else {
		res.status(404).send("<h1> not authorzation user </h1>");
	}
};
