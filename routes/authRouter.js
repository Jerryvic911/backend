import express from "express"
import   {signUp,login}   from "../controllers/auth.js"

const authRouter = express.Router();

authRouter
.post("/signup", signUp)
.post("/login", login)

export default authRouter