import express from "express"
import   {signUp,login, getAllStudents}   from "../controllers/auth.js"
import { protect } from "../controllers/auth.js";
import { restrictTo } from "../controllers/auth.js";

const authRouter = express.Router();

authRouter
.post("/signup", signUp)
.post("/login", login)
.get("/get_students",protect, restrictTo("bursar", "admin") ,getAllStudents)

export default authRouter