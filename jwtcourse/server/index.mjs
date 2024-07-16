import express from "express";
import dotenv from "dotenv"; 
import initExpress from "./src/app.route.mjs";

const app = express();

dotenv.config();
const port = process.env.PORT || 3000;
initExpress(express, app);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
})

