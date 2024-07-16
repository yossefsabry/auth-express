
import bcrypt, { compareSync } from "bcrypt";

export const hashPassword = (plainText) => {
  const hashResult = bcrypt.hashSync(
    plainText,
    parseInt(process.env.SALT)
  );
  return hashResult;
};


export const comparePassword = (plainText, hash) => {
  const match = compareSync(plainText, hash);
  return match;
};
