import express from "express";
import morgan from "morgan";
import cors from "cors";
import bodyParser from "body-parser";
import studentsRouter from "./routes/studentRoutes.js";
import teachersRouter from "./routes/teacherRoutes.js";
import authRouter from "./routes/authRouter.js";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import AppError from "./uitils/appError.js";
import errorHandler from "./controllers/errorHandler.js";

const __dirname = dirname(dirname(fileURLToPath(import.meta.url)));

const app = express();

app.use((req, res, next) => {
  console.log("Hello from Middleware");
  // console.log(req.headers);
  next();
});

app.use(cors());
app.use(morgan("dev"));
app.use(express.static(path.join(__dirname + "/public")));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());

app.get("/", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "Hello",
  });
});

app.use("/api/v1/students", studentsRouter);
app.use("/api/v1/teachers", teachersRouter);
app.use("/api/v1/auth", authRouter);

//handle 404 error
app.get("*", (req, res, next) => {
  next(new AppError(`cannot find ${req.originalUrl} on the server`));
});

app.use(errorHandler);

export default app;
