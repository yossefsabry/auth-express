
import { verifyToken } from "../utlis/TokenGenerator.mjs";


export const isAuth = async (req, res, done) => {

  const { authorization } = req.headers;
  if ( authorization == undefined ) {
    return res.status(401).json({ msg: "undefined token"});
  }
  const splitAuthorization = authorization.split(' ');
  // check if the token is provided
  if (!splitAuthorization[0]?.startsWith(process.env.BARER_KEY)) {
    return res.status(401).json({ msg: "not valid barer key"});
  }
  // get the token
  const token = authorization.split(" ")[1];
  try {
    const decoded = verifyToken({ token }); // decoded
    if (decoded === null) {
      return res.status(401).json({ msg: "not valid token"});
    }
  }catch(error) {
    return res.status(400).json({error:error});
  }
  req.jwt = decoded;
  done();

};
