import express from "express";
import mongoose from "mongoose";
import { APP_PORT, DB_URL } from "./config";
import errorHandler from "./middlewares/errorHandler";
import routes from "./routes";
import path from "path";

const app = express();

mongoose
  .connect(DB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then((result) => {
    app.listen(APP_PORT, () => console.log(`App running on port ${APP_PORT}`));
  })
  .catch((err) => console.log(err));

//global variable
global.appRoot = path.resolve(__dirname);

//middleware for accepting the files
app.use(express.urlencoded({ extended: false }));

app.use(express.json());
app.use("/api", routes);

//static file - (public files)
app.use("/uploads", express.static("uploads"));

//middleware for handling error
app.use(errorHandler);
