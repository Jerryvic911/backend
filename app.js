import express from "express";
import morgan from "morgan";
import cors from "cors";
import bodyParser from "body-parser";
import studentsRouter from "./routes/studentRoutes.js";
import teachersRouter from "./routes/teacherRoutes.js";
import adminRouter from "./routes/adminRouter.js";
import authRouter from "./routes/authRouter.js";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import AppError from "./uitils/appError.js";
import errorHandler from "./controllers/errorHandler.js";
import expressRateLimiter from "express-rate-limit";
import helmet from "helmet";
//import { xss } from "express-xss-sanitizer";
import ExpressMongoSanitize from "express-mongo-sanitize";

const __dirname = dirname(dirname(fileURLToPath(import.meta.url)));


const app = express();
//helmet is a security middlware
app.use(helmet())

//limit amount of login
// const limiter = expressRateLimiter({
//   max: 5,
//   windowMs: 5 * 60  * 1000,
//   message: "too many request try again after 5mins"
// })

// app.use("/api" , limiter)


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
//sanitaise data to help protect your site no sql querry injection
app.use(ExpressMongoSanitize())
//data sanitaise xss
//app.use(xss())



app.get("/", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "Hello",
  });
});

app.use("/api/v1/students", studentsRouter);
app.use("/api/v1/teachers", teachersRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/auth", adminRouter)

//handle 404 error
app.get("*", (req, res, next) => {
  next(new AppError(`cannot find ${req.originalUrl} on the server`));
});

app.use(errorHandler);

export default app;
