import express from "express";
import morgan from "morgan";
import cors from "cors";
import bodyParser from "body-parser";

import studentsRouter from "./routes/studentRoutes.js";
import teachersRouter from "./routes/teacherRoutes.js";

import path, {dirname} from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(dirname(fileURLToPath(import.meta.url)))

const app = express();

app.use((req, res, next) => {
  console.log("Hello from Middleware");
  next();
});

app.use(cors());
app.use(morgan("dev"));
app.use(express.static(path.join(__dirname + "/public")))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());

app.get("/", (req,res) => {
  res.status(200).json({
    "status": "ok",
    "message": "Hello"
  })
})


app.use("/api/v1/students", studentsRouter)
app.use("/api/v1/teachers", teachersRouter)



export default app;



