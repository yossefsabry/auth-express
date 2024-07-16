import mongoose from "mongoose";

const userScheme = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  age: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  regsiterDate: { type: Date, default: Date.now() },
  isDeleted: { type: Boolean, default: false },
  isAdmin: { type: Boolean, default: false },
});

export const User = mongoose.model("User", userScheme);

